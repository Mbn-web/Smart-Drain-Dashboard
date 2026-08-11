// Firebase Realtime Database read helpers for drains.
//
// Realtime DB shape (per backend spec):
//   drains/{id}/latest    -> { healthScore, status, waterLevel, flowRate, lastUpdated }
//   drains/{id}/modules   -> { waterLevelSensor, flowSensor, esp32, esp32Cam, gateway }
//   drains/{id}/meta      -> { location, latitude, longitude, installedAt }
//   drains/{id}/camera    -> { latestImageUrl, capturedAt }
//   drains/{id}/history   -> push-list of { healthScore, waterLevel, flowRate, timestamp }
//
// All subscribe* functions return an `unsubscribe` function so callers
// (React hooks) can clean up on unmount.

import { ref, onValue } from "firebase/database";
import { database, isFirebaseConfigured } from "../firebase/config";

/**
 * Subscribe to a single drain's live telemetry (latest + modules + meta + camera).
 * Callback receives a merged snapshot: { latest, modules, meta, camera } or null.
 */
export function subscribeDrain(drainId, callback) {
  if (!isFirebaseConfigured || !database) {
    // No-op subscription for demo mode
    callback(null);
    return () => {};
  }

  const drainRef = ref(database, `drains/${drainId}`);
  const unsubscribe = onValue(
    drainRef,
    (snapshot) => {
      const value = snapshot.val();
      callback(value);
    },
    (error) => {
      console.warn(`[Smart Drain AI] drain ${drainId} listener error:`, error);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to a drain's history feed (used for 30-day trend chart).
 * Returns array sorted by timestamp ascending.
 */
export function subscribeDrainHistory(drainId, callback) {
  if (!isFirebaseConfigured || !database) {
    callback([]);
    return () => {};
  }

  const historyRef = ref(database, `drains/${drainId}/history`);
  const unsubscribe = onValue(
    historyRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const entries = Object.values(value).sort(
        (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
      );
      callback(entries);
    },
    (error) => {
      console.warn(`[Smart Drain AI] history ${drainId} listener error:`, error);
      callback([]);
    }
  );

  return unsubscribe;
}
