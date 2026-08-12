// Real weather data via Open-Meteo Forecast API — free, no key required.
// https://open-meteo.com/en/docs
//
// Fetches: current temperature, current precipitation (mm), rain,
//          weather code, and short-term hourly precipitation forecast.
// Coordinates default to Kurla, Mumbai — where our 3 live prototype
// ESP32 nodes (K-01/K-02/K-03) are deployed.

const KURLA_LAT = 19.07;
const KURLA_LNG = 72.88;

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${KURLA_LAT}` +
  `&longitude=${KURLA_LNG}` +
  "&current=temperature_2m,precipitation,rain,weather_code,relative_humidity_2m,wind_speed_10m" +
  "&hourly=precipitation,precipitation_probability" +
  "&forecast_days=1" +
  "&timezone=Asia%2FKolkata";

// Module-level in-flight cache so React StrictMode double-mounting doesn't
// trigger two network trips. Within `DEDUP_WINDOW_MS` of a fetch starting,
// subsequent callers share the same promise.
const DEDUP_WINDOW_MS = 5000;
let inFlight = null;
let inFlightStartedAt = 0;

// Weather-code → human label. Ref: https://open-meteo.com/en/docs (WMO codes)
const WMO_CODE_LABELS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Fetch authentic weather from Open-Meteo.
 * Returns null on any failure — callers MUST surface "WEATHER DATA UNAVAILABLE"
 * instead of substituting fake values.
 */
export async function fetchWeather(_signal) {
  // Note: we intentionally ignore the caller's AbortSignal. The fetch is
  // shared across React StrictMode double-mounts, so cancelling one mount
  // must not abort the shared network request. Callers instead check a
  // `mounted` flag after awaiting.
  const now = Date.now();
  if (inFlight && now - inFlightStartedAt < DEDUP_WINDOW_MS) {
    return inFlight;
  }
  inFlightStartedAt = now;
  inFlight = (async () => {
    try {
      const res = await fetch(OPEN_METEO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const cur = data.current || {};
      const hourly = data.hourly || {};

    // Align "next 6 hours" to current time (Asia/Kolkata IST wall-clock,
    // returned by Open-Meteo without timezone offset).
    const currentIso = cur.time || null;
    const hourlyTimes = Array.isArray(hourly.time) ? hourly.time : [];
    const hourlyPrecip = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];
    const hourlyProb = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];

    let startIdx = 0;
    if (currentIso && hourlyTimes.length) {
      const cutoff = currentIso.slice(0, 13); // e.g. "2026-08-12T00"
      const found = hourlyTimes.findIndex((t) => t && t.slice(0, 13) >= cutoff);
      startIdx = found >= 0 ? found : 0;
    }

    const nextHours = hourlyPrecip.slice(startIdx, startIdx + 6);
    const nextHourTimes = hourlyTimes.slice(startIdx, startIdx + 6);
    const nextHourProbs = hourlyProb.slice(startIdx, startIdx + 6);

    const peakForecast = nextHours.length
      ? Math.max(...nextHours.filter((v) => typeof v === "number"))
      : 0;
    const avgProbability = nextHourProbs.length
      ? Math.round(
          nextHourProbs.reduce((a, b) => a + (b || 0), 0) / nextHourProbs.length
        )
      : null;

    return {
      source: "Open-Meteo",
      fetchedAt: Date.now(),
      current: {
        temperatureC: numOrNull(cur.temperature_2m),
        rainfallMm: numOrNull(cur.rain ?? cur.precipitation),
        precipitationMm: numOrNull(cur.precipitation),
        humidity: numOrNull(cur.relative_humidity_2m),
        windKmh: numOrNull(cur.wind_speed_10m),
        weatherCode: cur.weather_code ?? null,
        condition:
          cur.weather_code !== undefined && cur.weather_code !== null
            ? WMO_CODE_LABELS[cur.weather_code] || "Unknown"
            : "Unknown",
        time: cur.time || null,
      },
      forecast: {
        peakNext6hMm: peakForecast,
        avgProbabilityNext6h: avgProbability,
        hourly: {
          precipitation: nextHours,
          probability: nextHourProbs,
          time: nextHourTimes,
        },
      },
    };
    } catch (err) {
      if (err && err.name === "AbortError") return null;
      console.warn("[Smart Drain AI] Open-Meteo weather fetch failed:", err);
      return null;
    }
  })();
  const result = await inFlight;
  // Keep result briefly for late-arriving StrictMode second mounts
  setTimeout(() => { if (Date.now() - inFlightStartedAt >= DEDUP_WINDOW_MS) inFlight = null; }, DEDUP_WINDOW_MS);
  return result;
}

function numOrNull(v) {
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}
