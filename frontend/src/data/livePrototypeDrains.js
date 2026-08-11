// Live prototype drains — 3 physical ESP32 nodes deployed (or being deployed)
// in Kurla, Mumbai. These are the "real" drains that will report telemetry
// via Firebase Realtime Database at `drains/{id}/latest|modules|meta`.
//
// The frontend renders them with dataSource === "LIVE" so they visually
// separate from the demo/mock drains, and shows an "AWAITING SENSOR
// DEPLOYMENT" state until Firebase has telemetry for that node.
//
// Coordinates are approximate for Kurla, Mumbai:
//   K-01 : Kurla West Station area
//   K-02 : LBS Marg / Kurla Central
//   K-03 : Kurla East

export const LIVE_PROTOTYPE_DRAIN_IDS = ["K-01", "K-02", "K-03"];

export const LIVE_PROTOTYPE_DRAIN_META = {
  "K-01": {
    id: "K-01",
    location: "Kurla West Station",
    latitude: 19.0704,
    longitude: 72.8790,
  },
  "K-02": {
    id: "K-02",
    location: "LBS Marg, Kurla Central",
    latitude: 19.0728,
    longitude: 72.8826,
  },
  "K-03": {
    id: "K-03",
    location: "Kurla East",
    latitude: 19.0645,
    longitude: 72.8880,
  },
};

/**
 * Build a placeholder drain object for a live prototype drain that has
 * NOT yet reported any telemetry to Firebase. UI components should read
 * `isLive` and `awaitingDeployment` and render an
 * "AWAITING SENSOR DEPLOYMENT" state instead of fake readings.
 */
export function buildAwaitingDeploymentDrain(id) {
  const meta = LIVE_PROTOTYPE_DRAIN_META[id];
  if (!meta) return null;
  return {
    ...meta,
    healthScore: null,
    status: "pending",
    waterLevel: null,
    flowRate: null,
    lastUpdated: "Awaiting deployment",
    dataSource: "LIVE",
    isLive: true,
    awaitingDeployment: true,
    modules: {
      waterLevelSensor: "pending",
      flowSensor: "pending",
      esp32: "pending",
      esp32Cam: "pending",
      gateway: "pending",
    },
    history30Days: [],
    cameraImage: null,
    cameraStatus: "PENDING",
    capturedAt: "—",
  };
}

/**
 * Merge Firebase telemetry (drains/{id}/latest + modules + meta shape from
 * drainService.subscribeDrain) into the frontend's canonical drain shape.
 */
export function mergeLiveTelemetry(id, telemetry) {
  const meta = LIVE_PROTOTYPE_DRAIN_META[id];
  if (!meta) return null;
  if (!telemetry || !telemetry.latest) {
    return buildAwaitingDeploymentDrain(id);
  }
  const { latest, modules = {}, camera = {} } = telemetry;
  return {
    ...meta,
    latitude: telemetry.meta?.latitude ?? meta.latitude,
    longitude: telemetry.meta?.longitude ?? meta.longitude,
    location: telemetry.meta?.location ?? meta.location,
    healthScore: latest.healthScore ?? null,
    status: latest.status ?? "pending",
    waterLevel: latest.waterLevel ?? null,
    flowRate: latest.flowRate ?? null,
    lastUpdated: latest.lastUpdated
      ? formatRelativeSeconds(latest.lastUpdated)
      : "Just now",
    dataSource: "LIVE",
    isLive: true,
    awaitingDeployment: false,
    modules: {
      waterLevelSensor: modules.waterLevelSensor || "online",
      flowSensor: modules.flowSensor || "online",
      esp32: modules.esp32 || "online",
      esp32Cam: modules.esp32Cam || "online",
      gateway: modules.gateway || "connected",
    },
    history30Days: telemetry.history30Days || [],
    cameraImage: camera.latestImageUrl || null,
    cameraStatus: camera.latestImageUrl ? "READY" : "PENDING",
    capturedAt: camera.capturedAt ? formatRelativeSeconds(camera.capturedAt) : "—",
  };
}

function formatRelativeSeconds(unixSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - Number(unixSeconds));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}
