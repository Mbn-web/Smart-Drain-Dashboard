// useEnvironment — polls Open-Meteo weather + tide APIs every 10 minutes.
//
// Uses a `mounted` ref instead of AbortController for cancellation, because
// the underlying fetch is deduped across React StrictMode double-mounts at
// module level (see weatherService/tideService inFlight cache). Aborting
// the fetch would poison the shared cached promise for the next mount.
//
// The Firebase real-time listeners for K-01/K-02/K-03 are NOT touched by
// this hook.

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWeather } from "../services/weatherService";
import { fetchTide } from "../services/tideService";

const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function useEnvironment() {
  const [weather, setWeather] = useState(null);
  const [tide, setTide] = useState(null);
  const [weatherStale, setWeatherStale] = useState(false);
  const [tideStale, setTideStale] = useState(false);
  const [lastWeatherAt, setLastWeatherAt] = useState(null);
  const [lastTideAt, setLastTideAt] = useState(null);
  const mountedRef = useRef(true);
  const hasWeatherRef = useRef(false);
  const hasTideRef = useRef(false);

  const load = useCallback(async () => {
    const [w, t] = await Promise.all([fetchWeather(), fetchTide()]);
    if (!mountedRef.current) return;

    if (w) {
      setWeather(w);
      setWeatherStale(false);
      setLastWeatherAt(Date.now());
      hasWeatherRef.current = true;
    } else if (hasWeatherRef.current) {
      setWeatherStale(true);
    }

    if (t) {
      setTide(t);
      setTideStale(false);
      setLastTideAt(Date.now());
      hasTideRef.current = true;
    } else if (hasTideRef.current) {
      setTideStale(true);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [load]);

  return {
    weather,
    tide,
    weatherStale,
    tideStale,
    lastWeatherAt,
    lastTideAt,
    refresh: load,
    pollIntervalMs: POLL_INTERVAL_MS,
  };
}
