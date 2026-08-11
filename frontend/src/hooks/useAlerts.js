// useAlerts — canonical alerts hook.
//
// When Firebase is configured, streams live alerts from `alerts/` in RTDB
// and normalizes them to the frontend's alert shape used by AlertsView
// and the dashboard alerts panel:
//   { id, drainId, location, severity, title, description, time, status }
//
// When Firebase is NOT configured (prototype/demo mode), falls back to
// the static ALERTS array from mock.js.

import { useEffect, useState } from "react";
import { ALERTS as DEMO_ALERTS } from "../mock";
import { subscribeAlerts } from "../services/alertService";
import { isFirebaseConfigured } from "../firebase/config";

export function useAlerts() {
  const [liveAlerts, setLiveAlerts] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    const unsubscribe = subscribeAlerts((alerts) => {
      setLiveAlerts(alerts.map(normalizeAlert));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const alerts = liveAlerts !== null ? liveAlerts : DEMO_ALERTS;

  return { alerts, isLive: Boolean(liveAlerts) };
}

function normalizeAlert(raw) {
  return {
    id: raw.id,
    drainId: raw.drainId,
    location: raw.location,
    severity: raw.severity,
    title: raw.title || descriptionToTitle(raw.description),
    description: raw.description,
    time: raw.createdAt ? formatRelativeSeconds(raw.createdAt) : "just now",
    status: raw.status || "open",
  };
}

function descriptionToTitle(desc) {
  if (!desc) return "Alert";
  const firstSentence = desc.split(/[.!?]/)[0];
  return firstSentence.slice(0, 60);
}

function formatRelativeSeconds(unixSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - Number(unixSeconds));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}
