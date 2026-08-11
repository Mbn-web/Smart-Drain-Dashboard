# Smart Drain AI — PRD

## Product
Smart Drain AI is a municipal (BMC) IoT drainage-monitoring platform for Mumbai.
It combines dark-navy engineering aesthetic + realistic Mumbai GIS map + realtime
ESP32 sensor telemetry (water level, flow rate, ESP32 node, ESP32-CAM, gateway)
into a "control room" dashboard for city infrastructure operators.

## Architecture (this fork — NO FastAPI, NO MongoDB)
- **Frontend only** (React 19 + CRA + Tailwind + shadcn UI + Leaflet + Recharts).
- **Firebase Realtime Database + Firebase Auth** — read via a clean abstraction
  layer inside the frontend. Firebase Web SDK is installed but not wired to a
  project yet (env vars blank). App runs in prototype/demo mode until
  REACT_APP_FIREBASE_* env vars are populated.
- Sensor telemetry flow (target once ESP32 hardware + Firebase are live):
  ```
  ESP32 sensors → Wi-Fi → Firebase Auth (device role) → Firebase RTDB
                                                        ↓
                              Cloud Functions (health score + alerts)
                                                        ↓
                              RTDB (drains/*, alerts/*)
                                                        ↓
                              React app (employee role listeners)
  ```

## Abstraction layer (frontend)
```
/app/frontend/src/
├── firebase/config.js              # SDK init + isFirebaseConfigured flag
├── data/livePrototypeDrains.js     # K-01, K-02, K-03 meta + merge helpers
├── services/
│   ├── drainService.js             # subscribeDrain / subscribeDrainHistory
│   └── alertService.js             # subscribeAlerts
├── hooks/
│   ├── useTheme.js                 # dark/light + localStorage persistence
│   ├── useRealtimeTelemetry.js     # single-drain live listener
│   ├── useDrains.js                # combined live + demo drains + stats
│   └── useAlerts.js                # combined live + demo alerts
└── mock.js                         # DEMO data for non-prototype drains
```

## Live prototype nodes (Kurla, Mumbai)
| ID   | Location                    | Latitude | Longitude |
|------|-----------------------------|----------|-----------|
| K-01 | Kurla West Station          | 19.0704  | 72.8790   |
| K-02 | LBS Marg, Kurla Central     | 19.0728  | 72.8826   |
| K-03 | Kurla East                  | 19.0645  | 72.8880   |

These render with `dataSource: "LIVE"` and show **AWAITING SENSOR DEPLOYMENT** UI
until Firebase begins receiving telemetry at `drains/{id}/latest`.

## Firebase RTDB shape expected
```
drains/{id}/latest    { healthScore, status, waterLevel, flowRate, lastUpdated }
drains/{id}/modules   { waterLevelSensor, flowSensor, esp32, esp32Cam, gateway }
drains/{id}/meta      { location, latitude, longitude, installedAt }
drains/{id}/camera    { latestImageUrl, capturedAt }
drains/{id}/history   -Nxxx { healthScore, waterLevel, flowRate, timestamp }
alerts/{alertId}      { drainId, location, severity, description, createdAt, status }
```

## Env vars (frontend/.env — blank until Firebase project created)
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_DATABASE_URL
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_STORAGE_BUCKET
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- REACT_APP_FIREBASE_APP_ID

## Implemented (Feb 2026)
- Firebase abstraction layer + realtime telemetry hook
- 3 Kurla live prototype nodes with "AWAITING SENSOR DEPLOYMENT" state
- Light/Dark theme toggle with localStorage persistence, applied via
  `.light-theme` class overrides in index.css
- Prototype-mode banner on dashboard, live-nodes sub-panel
- Null-safe rendering across dashboard, drains list, drain detail (pending state)
- Map markers use blue color + halo for LIVE prototype nodes
- Firebase package installed (`firebase` in package.json)

## Backlog
- P1: Wire real Firebase credentials + write actual ESP32 firmware
- P1: Cloud Functions for health score + alerts (backend spec in problem statement)
- P2: Alert acknowledgement writes (employee role)
- P2: Real Firebase Auth for BMC employees (currently mock login)
