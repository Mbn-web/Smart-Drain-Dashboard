// Firebase Realtime Database read helpers for alerts.
//
// Realtime DB shape:
//   alerts/{alertId} -> { drainId, location, severity, description, createdAt, status }
//
// Employee-role clients may write `status: "acknowledged" | "resolved"` back to
// individual alert nodes (see backend security rules). This module only exposes
// read subscriptions for now; write helpers can be added when the acknowledge
// action is wired.

import { ref, onValue } from "firebase/database";
import { database, isFirebaseConfigured } from "../firebase/config";

export function subscribeAlerts(callback) {
  if (!isFirebaseConfigured || !database) {
    callback([]);
    return () => {};
  }

  const alertsRef = ref(database, "alerts");
  const unsubscribe = onValue(
    alertsRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const entries = Object.entries(value).map(([id, alert]) => ({
        id,
        ...alert,
      }));
      // newest first
      entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(entries);
    },
    (error) => {
      console.warn("[Smart Drain AI] alerts listener error:", error);
      callback([]);
    }
  );

  return unsubscribe;
}
