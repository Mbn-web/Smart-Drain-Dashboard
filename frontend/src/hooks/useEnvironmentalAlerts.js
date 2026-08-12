// useEnvironmentalAlerts — derives contextual alerts from REAL weather,
// REAL tide and REAL Firebase drain telemetry, with a cooldown so the
// alert stream isn't flooded with duplicates while conditions persist.
//
// Cooldown: an alert with the same `key` will not re-fire within
// COOLDOWN_MS of its previous emission. This keeps the Alerts page tidy
// during a sustained monsoon event without silently dropping condition
// changes.

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveEnvironmentalAlerts } from "../services/environmentService";

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export function useEnvironmentalAlerts({ drains, weather, tide }) {
  const [emitted, setEmitted] = useState([]); // {id, key, createdAt, ...}
  const lastEmittedAtRef = useRef(new Map()); // key -> timestamp(ms)

  const candidates = useMemo(
    () => deriveEnvironmentalAlerts({ drains, weather, tide }),
    [drains, weather, tide]
  );

  useEffect(() => {
    if (!candidates.length) return;
    const now = Date.now();
    const fresh = [];
    for (const cand of candidates) {
      const last = lastEmittedAtRef.current.get(cand.key) || 0;
      if (now - last >= COOLDOWN_MS) {
        lastEmittedAtRef.current.set(cand.key, now);
        fresh.push({
          ...cand,
          id: `${cand.key}-${now}`,
          time: "just now",
          createdAt: now,
          status: "open",
        });
      }
    }
    if (fresh.length) {
      setEmitted((prev) => {
        // Merge new + prune old (>2h) & keep unique-latest per key
        const combined = [...fresh, ...prev].filter(
          (a) => now - a.createdAt < 2 * 60 * 60 * 1000
        );
        // dedupe by key keeping the newest
        const byKey = new Map();
        for (const a of combined) {
          if (!byKey.has(a.key)) byKey.set(a.key, a);
        }
        return Array.from(byKey.values()).sort((a, b) => b.createdAt - a.createdAt);
      });
    }
  }, [candidates]);

  return { environmentalAlerts: emitted, activeConditionCount: candidates.length };
}
