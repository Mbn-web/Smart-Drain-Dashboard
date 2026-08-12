// Environmental Flood Impact — prototype risk model.
//
// This is EXPLICITLY a prototype indicator. It is NOT an official BMC
// flood prediction. Downstream UI components must label it as such.
//
// Inputs (all optional — the model degrades gracefully when a source is
// unavailable rather than substituting fake values):
//   • weather.current.rainfallMm     (mm/hr)
//   • weather.forecast.peakNext6hMm  (mm/hr peak)
//   • tide.current.trend             (rising|falling|stable)
//   • tide.current.seaLevelM         (metres MSL)
//   • drain.waterLevel               (cm) — optional (per-drain risk)
//   • drain.flowRate                 (L/min) — optional (per-drain risk)
//
// Thresholds live in a single exported object so they can be tuned in
// one place without hunting through UI code.

export const THRESHOLDS = {
  rainfall: {
    // mm/hr — Open-Meteo returns hourly precipitation totals
    low: 0.5,
    moderate: 2.5,
    high: 7.5,
    extreme: 15,
  },
  waterLevel: {
    // cm — drain-relative
    elevated: 40,
    critical: 60,
  },
  flow: {
    // L/min — reduced flow may indicate obstruction
    reduced: 3,
    critical: 1,
  },
  tide: {
    // metres MSL — treated as "high" when above this
    highRisk: 1.0,
  },
};

// ─── Categorisers ────────────────────────────────────────────────────

export function categoriseRainfall(mmPerHr) {
  if (mmPerHr === null || mmPerHr === undefined) return "unknown";
  if (mmPerHr < THRESHOLDS.rainfall.low) return "low";
  if (mmPerHr < THRESHOLDS.rainfall.moderate) return "moderate";
  if (mmPerHr < THRESHOLDS.rainfall.high) return "high";
  if (mmPerHr < THRESHOLDS.rainfall.extreme) return "high";
  return "extreme";
}

export function categoriseWaterLevel(cm) {
  if (cm === null || cm === undefined) return "unknown";
  if (cm < THRESHOLDS.waterLevel.elevated) return "normal";
  if (cm < THRESHOLDS.waterLevel.critical) return "elevated";
  return "critical";
}

export function categoriseFlow(lpm) {
  if (lpm === null || lpm === undefined) return "unknown";
  if (lpm < THRESHOLDS.flow.critical) return "critical";
  if (lpm < THRESHOLDS.flow.reduced) return "reduced";
  return "normal";
}

export function categoriseTide(trend, seaLevelM) {
  if (!trend) return "unknown";
  if (seaLevelM !== null && seaLevelM !== undefined && seaLevelM >= THRESHOLDS.tide.highRisk) {
    return "high-risk";
  }
  return trend; // rising | falling | stable
}

// ─── Aggregate scores ────────────────────────────────────────────────

// City/regional environmental impact — combines rainfall + tide only.
export function computeEnvironmentalImpact({ weather, tide }) {
  let score = 0;
  let contributingFactors = 0;

  if (weather && weather.current) {
    const rain = weather.current.rainfallMm;
    const forecastPeak = weather.forecast ? weather.forecast.peakNext6hMm : null;
    const effectiveRain = Math.max(rain ?? 0, forecastPeak ?? 0);
    const cat = categoriseRainfall(effectiveRain);
    if (cat !== "unknown") {
      contributingFactors++;
      if (cat === "low") score += 1;
      else if (cat === "moderate") score += 3;
      else if (cat === "high") score += 6;
      else if (cat === "extreme") score += 10;
    }
  }

  if (tide && tide.current) {
    const tideCat = categoriseTide(tide.current.trend, tide.current.seaLevelM);
    if (tideCat !== "unknown") {
      contributingFactors++;
      if (tideCat === "falling") score += 0;
      else if (tideCat === "stable") score += 1;
      else if (tideCat === "rising") score += 3;
      else if (tideCat === "high-risk") score += 5;
    }
  }

  if (contributingFactors === 0) {
    return { level: "unknown", score: null };
  }

  let level = "low";
  if (score >= 12) level = "critical";
  else if (score >= 8) level = "high";
  else if (score >= 4) level = "moderate";
  else level = "low";

  return { level, score, contributingFactors };
}

// Per-drain risk — combines env impact with the drain's Firebase telemetry.
// The drain's water level and flow rate are ALWAYS taken from Firebase; we
// never overwrite them with API values.
export function computeDrainRisk({ drain, envImpact }) {
  const wl = categoriseWaterLevel(drain?.waterLevel);
  const fl = categoriseFlow(drain?.flowRate);

  let score = 0;
  if (wl === "elevated") score += 3;
  if (wl === "critical") score += 6;
  if (fl === "reduced") score += 2;
  if (fl === "critical") score += 4;

  if (envImpact && envImpact.level) {
    if (envImpact.level === "moderate") score += 2;
    else if (envImpact.level === "high") score += 5;
    else if (envImpact.level === "critical") score += 8;
  }

  // Combined blockage signal: high water + low flow is the classic blockage
  if (wl === "critical" && (fl === "reduced" || fl === "critical")) {
    score += 4;
  }

  // Pending or unknown drain data → unknown risk
  if (wl === "unknown" && fl === "unknown") {
    return { level: "unknown", score: null };
  }

  let level = "low";
  if (score >= 14) level = "critical";
  else if (score >= 8) level = "high";
  else if (score >= 4) level = "moderate";
  else level = "low";

  return { level, score, waterLevel: wl, flow: fl };
}

// ─── Contextual alert derivation ─────────────────────────────────────
//
// Produces synthetic alert candidates from real API values + real drain
// telemetry. Consumers (useEnvironmentalAlerts) must apply dedup/cooldown.
//
// Returns an array of {key, drainId, location, severity, title,
// description, values, sources} — never fake values, values are the exact
// numbers read from the API / Firebase.

export function deriveEnvironmentalAlerts({ drains, weather, tide }) {
  const alerts = [];
  const rainMm = weather?.current?.rainfallMm ?? null;
  const forecastPeak = weather?.forecast?.peakNext6hMm ?? null;
  const tideTrend = tide?.current?.trend ?? null;
  const seaLevelM = tide?.current?.seaLevelM ?? null;

  const rainCat = categoriseRainfall(Math.max(rainMm ?? 0, forecastPeak ?? 0));

  // City-wide high rainfall
  if (rainCat === "high" || rainCat === "extreme") {
    alerts.push({
      key: `env-highrain-${rainCat}`,
      drainId: null,
      location: "Mumbai / Kurla",
      severity: rainCat === "extreme" ? "critical" : "warning",
      title: rainCat === "extreme" ? "Extreme rainfall detected" : "Heavy rainfall detected",
      description: `Heavy rainfall detected in Mumbai. Current ${fmtMm(
        rainMm
      )}, forecast peak ${fmtMm(forecastPeak)} over the next 6 h.`,
      values: { rainMm, forecastPeak },
      sources: ["Open-Meteo"],
      kind: "environmental",
    });
  }

  // Rising tide + high rainfall
  if (
    (tideTrend === "rising" || (seaLevelM !== null && seaLevelM >= THRESHOLDS.tide.highRisk)) &&
    (rainCat === "high" || rainCat === "extreme")
  ) {
    alerts.push({
      key: "env-tide-rain",
      drainId: null,
      location: "Mumbai / Kurla",
      severity: "critical",
      title: "Rising tide + heavy rainfall",
      description: `Rising tidal conditions combined with elevated rainfall (${fmtMm(
        rainMm
      )}) may increase flood pressure across the drainage network.`,
      values: { rainMm, seaLevelM, tideTrend },
      sources: ["Open-Meteo", tide?.source || "Marine"],
      kind: "environmental",
    });
  }

  // Per-drain (live nodes only) — cross-signal alerts
  const liveDrains = (drains || []).filter((d) => d && d.isLive && !d.awaitingDeployment);
  for (const d of liveDrains) {
    const wl = categoriseWaterLevel(d.waterLevel);
    const fl = categoriseFlow(d.flowRate);

    if ((wl === "elevated" || wl === "critical") && (rainCat === "high" || rainCat === "extreme")) {
      alerts.push({
        key: `env-${d.id}-wl-rain`,
        drainId: d.id,
        location: d.location,
        severity: wl === "critical" ? "critical" : "warning",
        title: "Elevated water level during heavy rainfall",
        description: `${d.id} water level ${fmtCm(d.waterLevel)} while rainfall intensity is ${fmtMm(
          rainMm
        )}.`,
        values: { waterLevel: d.waterLevel, flowRate: d.flowRate, rainMm },
        sources: ["Firebase", "Open-Meteo"],
        kind: "environmental",
      });
    }

    if (wl === "critical" && (fl === "reduced" || fl === "critical")) {
      alerts.push({
        key: `env-${d.id}-blockage`,
        drainId: d.id,
        location: d.location,
        severity: "critical",
        title: "Possible drainage obstruction",
        description: `${d.id} shows elevated water level (${fmtCm(
          d.waterLevel
        )}) with reduced flow (${fmtLpm(d.flowRate)}).`,
        values: { waterLevel: d.waterLevel, flowRate: d.flowRate },
        sources: ["Firebase"],
        kind: "environmental",
      });
    }

    if ((wl === "elevated" || wl === "critical") && tideTrend === "rising") {
      alerts.push({
        key: `env-${d.id}-wl-tide`,
        drainId: d.id,
        location: d.location,
        severity: wl === "critical" ? "critical" : "warning",
        title: "Elevated water level during rising tide",
        description: `${d.id} water level ${fmtCm(
          d.waterLevel
        )} coincides with a rising tidal trend.`,
        values: { waterLevel: d.waterLevel, tideTrend, seaLevelM },
        sources: ["Firebase", tide?.source || "Marine"],
        kind: "environmental",
      });
    }
  }

  return alerts;
}

// ─── formatters ──────────────────────────────────────────────────────

export function fmtMm(v) {
  return v === null || v === undefined ? "—" : `${Number(v).toFixed(1)} mm/hr`;
}
export function fmtCm(v) {
  return v === null || v === undefined ? "—" : `${v} cm`;
}
export function fmtLpm(v) {
  return v === null || v === undefined ? "—" : `${Number(v).toFixed(1)} L/min`;
}
export function fmtSeaLevel(v) {
  return v === null || v === undefined ? "—" : `${Number(v).toFixed(2)} m`;
}

export function riskColor(level) {
  switch (level) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-amber-400";
    case "moderate":
      return "text-yellow-400";
    case "low":
      return "text-emerald-400";
    default:
      return "text-slate-400";
  }
}

export function riskBadgeClasses(level) {
  switch (level) {
    case "critical":
      return "bg-red-950 text-red-400 border border-red-500/30";
    case "high":
      return "bg-amber-950 text-amber-400 border border-amber-500/30";
    case "moderate":
      return "bg-yellow-950 text-yellow-400 border border-yellow-500/30";
    case "low":
      return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
    default:
      return "bg-slate-900 text-slate-400 border border-slate-700";
  }
}
