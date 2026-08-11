// useDrains — canonical hook that returns the combined list of drains
// consumed by every UI surface (Dashboard map, Drains list, Analytics).
//
// Combines:
//   1. DEMO_DRAINS from mock.js — clearly labeled dataSource: "DEMO DATA"
//   2. LIVE prototype drains K-01, K-02, K-03 in Kurla, Mumbai
//      - Firebase telemetry when available (dataSource: "LIVE")
//      - "AWAITING SENSOR DEPLOYMENT" placeholder otherwise
//
// UI components should NOT import mock.js directly for drain data — always
// use this hook so live Firebase telemetry flows through cleanly.

import { useEffect, useState } from "react";
import { DRAINS as DEMO_DRAINS } from "../mock";
import {
  LIVE_PROTOTYPE_DRAIN_IDS,
  buildAwaitingDeploymentDrain,
  mergeLiveTelemetry,
} from "../data/livePrototypeDrains";
import { subscribeDrain } from "../services/drainService";
import { isFirebaseConfigured } from "../firebase/config";

export function useDrains() {
  const [liveTelemetryById, setLiveTelemetryById] = useState({});

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    const unsubs = LIVE_PROTOTYPE_DRAIN_IDS.map((id) =>
      subscribeDrain(id, (value) => {
        setLiveTelemetryById((prev) => ({ ...prev, [id]: value }));
      })
    );

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, []);

  const liveDrains = LIVE_PROTOTYPE_DRAIN_IDS.map((id) => {
    const telemetry = liveTelemetryById[id];
    return telemetry && telemetry.latest
      ? mergeLiveTelemetry(id, telemetry)
      : buildAwaitingDeploymentDrain(id);
  }).filter(Boolean);

  // Prototype drains first so they are visually prominent
  const combined = [...liveDrains, ...DEMO_DRAINS];

  const stats = deriveStats(combined);

  return { drains: combined, liveDrains, demoDrains: DEMO_DRAINS, stats };
}

function deriveStats(drains) {
  const withScore = drains.filter(
    (d) => typeof d.healthScore === "number" && d.healthScore !== null
  );
  const healthy = withScore.filter((d) => d.status === "healthy").length;
  const warning = withScore.filter((d) => d.status === "warning").length;
  const critical = withScore.filter((d) => d.status === "critical").length;
  const pending = drains.filter((d) => d.status === "pending").length;
  const avgHealth =
    withScore.length === 0
      ? 0
      : Math.round(
          withScore.reduce((sum, d) => sum + d.healthScore, 0) / withScore.length
        );

  return {
    total: drains.length,
    healthy,
    warning,
    critical,
    pending,
    avgHealth,
  };
}
