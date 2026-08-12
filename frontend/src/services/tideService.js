// Real tide / sea-level data.
//
// Primary source: Open-Meteo Marine API (free, no key required) —
//   modeled sea-level height (MSL) hourly for the next 24h.
//   https://open-meteo.com/en/docs/marine-weather-api
//
// Optional secondary: WorldTides API (needs paid API key). Enabled only if
//   REACT_APP_WORLDTIDES_API_KEY is populated in the frontend .env.
//
// The returned shape is always the same regardless of source:
//   { source, fetchedAt, current: { seaLevelM, trend }, next: { high, low } }
// where `trend` ∈ 'rising' | 'falling' | 'stable', and next.{high,low} are
// { seaLevelM, at (ISO), in (human "in 4h 20m") } or null when not derivable.
//
// Returns null on any failure. Callers MUST surface "TIDE DATA UNAVAILABLE"
// instead of substituting fake values.

const KURLA_LAT = 19.07;
const KURLA_LNG = 72.88;

const OPEN_METEO_MARINE_URL =
  "https://marine-api.open-meteo.com/v1/marine" +
  `?latitude=${KURLA_LAT}` +
  `&longitude=${KURLA_LNG}` +
  "&hourly=sea_level_height_msl" +
  "&current=sea_level_height_msl" +
  "&forecast_days=2" +
  "&timezone=Asia%2FKolkata";

const WORLDTIDES_URL =
  "https://www.worldtides.info/api/v3" +
  `?extremes&lat=${KURLA_LAT}&lon=${KURLA_LNG}`;

// Module-level in-flight cache — dedup StrictMode double-mount fetches
const DEDUP_WINDOW_MS = 5000;
let inFlight = null;
let inFlightStartedAt = 0;

export async function fetchTide(_signal) {
  // Ignore caller's AbortSignal — see weatherService for rationale.
  const now = Date.now();
  if (inFlight && now - inFlightStartedAt < DEDUP_WINDOW_MS) {
    return inFlight;
  }
  inFlightStartedAt = now;
  inFlight = (async () => {
    const worldTidesKey = process.env.REACT_APP_WORLDTIDES_API_KEY;
    if (worldTidesKey) {
      const result = await fetchWorldTides(worldTidesKey);
      if (result) return result;
    }
    return fetchOpenMeteoMarine();
  })();
  const result = await inFlight;
  setTimeout(() => { if (Date.now() - inFlightStartedAt >= DEDUP_WINDOW_MS) inFlight = null; }, DEDUP_WINDOW_MS);
  return result;
}

async function fetchOpenMeteoMarine() {
  try {
    const res = await fetch(OPEN_METEO_MARINE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cur = data.current || {};
    const currentSeaLevelM = numOrNull(cur.sea_level_height_msl);
    const currentTimeIso = cur.time || null;

    const hourly = data.hourly || {};
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const heights = Array.isArray(hourly.sea_level_height_msl)
      ? hourly.sea_level_height_msl
      : [];

    // Timezone-safe parse: Open-Meteo returns Asia/Kolkata wall-clock times
    // WITHOUT an offset (e.g. "2026-08-12T00:00"). Append +05:30 so browsers
    // in any timezone parse them at the correct instant.
    const parseIST = (iso) => {
      if (!iso) return NaN;
      const safe = /\+|Z/.test(iso) ? iso : `${iso}+05:30`;
      return Date.parse(safe);
    };

    // Find nearest hourly index to current time
    const nowMs = currentTimeIso ? parseIST(currentTimeIso) : Date.now();
    let nearestIdx = -1;
    let nearestDelta = Infinity;
    for (let i = 0; i < times.length; i++) {
      const t = parseIST(times[i]);
      if (!Number.isNaN(t)) {
        const d = Math.abs(t - nowMs);
        if (d < nearestDelta) {
          nearestDelta = d;
          nearestIdx = i;
        }
      }
    }

    // Determine trend from adjacent hourly points (prev vs next hour)
    let trend = "stable";
    if (nearestIdx >= 0 && heights.length > 1) {
      const prevH = nearestIdx > 0 ? numOrNull(heights[nearestIdx - 1]) : null;
      const nextH = nearestIdx < heights.length - 1 ? numOrNull(heights[nearestIdx + 1]) : null;
      const anchor = currentSeaLevelM !== null ? currentSeaLevelM : numOrNull(heights[nearestIdx]);
      if (nextH !== null && anchor !== null) {
        const delta = nextH - anchor;
        if (delta > 0.05) trend = "rising";
        else if (delta < -0.05) trend = "falling";
        else trend = "stable";
      } else if (anchor !== null && prevH !== null) {
        const delta = anchor - prevH;
        if (delta > 0.05) trend = "rising";
        else if (delta < -0.05) trend = "falling";
        else trend = "stable";
      }
    }

    // Find next local high / low in forecast window (from now forward)
    const now = Date.now();
    const futurePairs = times
      .map((t, i) => ({ t: parseIST(t), h: heights[i] }))
      .filter(
        (p) =>
          !Number.isNaN(p.t) &&
          p.t > now &&
          typeof p.h === "number" &&
          !Number.isNaN(p.h)
      );

    const { nextHigh, nextLow } = findNextExtremes(futurePairs);

    return {
      source: "Open-Meteo Marine",
      fetchedAt: Date.now(),
      current: {
        seaLevelM: currentSeaLevelM,
        trend,
        time: currentTimeIso,
      },
      next: {
        high: nextHigh,
        low: nextLow,
      },
    };
  } catch (err) {
    if (err && err.name === "AbortError") return null;
    console.warn("[Smart Drain AI] Open-Meteo Marine fetch failed:", err);
    return null;
  }
}

async function fetchWorldTides(apiKey) {
  try {
    const url = `${WORLDTIDES_URL}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const extremes = Array.isArray(data.extremes) ? data.extremes : [];
    if (extremes.length === 0) return null;

    const now = Date.now();
    const future = extremes
      .map((e) => ({
        seaLevelM: numOrNull(e.height),
        at: e.date || (e.dt ? new Date(e.dt * 1000).toISOString() : null),
        type: (e.type || "").toLowerCase(),
        ts: e.dt ? e.dt * 1000 : Date.parse(e.date),
      }))
      .filter((e) => !Number.isNaN(e.ts) && e.ts > now);

    const nextHigh = future.find((e) => e.type === "high") || null;
    const nextLow = future.find((e) => e.type === "low") || null;

    // Trend: if next event is a HIGH sooner than the next LOW, tide is rising
    let trend = "stable";
    if (nextHigh && nextLow) {
      trend = nextHigh.ts < nextLow.ts ? "rising" : "falling";
    }

    return {
      source: "WorldTides",
      fetchedAt: Date.now(),
      current: {
        // WorldTides /extremes endpoint doesn't return current height;
        // leave null and let UI display the next-tide values.
        seaLevelM: null,
        trend,
        time: new Date(now).toISOString(),
      },
      next: {
        high: nextHigh
          ? {
              seaLevelM: nextHigh.seaLevelM,
              at: nextHigh.at,
              in: humanizeIn(nextHigh.ts - now),
            }
          : null,
        low: nextLow
          ? {
              seaLevelM: nextLow.seaLevelM,
              at: nextLow.at,
              in: humanizeIn(nextLow.ts - now),
            }
          : null,
      },
    };
  } catch (err) {
    if (err && err.name === "AbortError") return null;
    console.warn("[Smart Drain AI] WorldTides fetch failed:", err);
    return null;
  }
}

function findNextExtremes(pairs) {
  // Scan for the next local max (high) and next local min (low)
  let nextHigh = null;
  let nextLow = null;
  const now = Date.now();
  for (let i = 1; i < pairs.length - 1; i++) {
    const prev = pairs[i - 1].h;
    const cur = pairs[i].h;
    const nxt = pairs[i + 1].h;
    if (!nextHigh && cur >= prev && cur >= nxt) {
      nextHigh = {
        seaLevelM: cur,
        at: new Date(pairs[i].t).toISOString(),
        in: humanizeIn(pairs[i].t - now),
      };
    }
    if (!nextLow && cur <= prev && cur <= nxt) {
      nextLow = {
        seaLevelM: cur,
        at: new Date(pairs[i].t).toISOString(),
        in: humanizeIn(pairs[i].t - now),
      };
    }
    if (nextHigh && nextLow) break;
  }
  return { nextHigh, nextLow };
}

function humanizeIn(ms) {
  if (typeof ms !== "number" || ms <= 0) return "soon";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMin = mins % 60;
  return remMin ? `in ${hrs}h ${remMin}m` : `in ${hrs}h`;
}

function numOrNull(v) {
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}
