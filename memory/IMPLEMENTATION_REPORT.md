# Smart Drain AI — Final Implementation Report (Feb 2026)

## 1. Files / Components Changed or Added

### NEW files (frontend abstraction layer)
- `/app/frontend/src/firebase/config.js` — Firebase Web SDK init from env vars,
  exports `isFirebaseConfigured`, `database`, `auth`, `app`.
- `/app/frontend/src/data/livePrototypeDrains.js` — K-01/K-02/K-03 meta,
  `buildAwaitingDeploymentDrain(id)`, `mergeLiveTelemetry(id, telemetry)`.
- `/app/frontend/src/services/drainService.js` — `subscribeDrain(id, cb)`,
  `subscribeDrainHistory(id, cb)` (Firebase RTDB `onValue` listeners with
  proper unsubscribe returned).
- `/app/frontend/src/services/alertService.js` — `subscribeAlerts(cb)`.
- `/app/frontend/src/hooks/useTheme.js` — `ThemeProvider` + `useTheme()`,
  applies `.light-theme` / `.dark` class on `<html>`, persists to
  `localStorage` under key `smart-drain-theme` (default: dark).
- `/app/frontend/src/hooks/useRealtimeTelemetry.js` — single-drain live
  telemetry hook with unmount cleanup.
- `/app/frontend/src/hooks/useDrains.js` — combined demo + K-01/02/03 live
  prototype drains + derived stats (`healthy/warning/critical/pending/avgHealth`).
- `/app/frontend/src/hooks/useAlerts.js` — Firebase-live-or-demo alerts hook.

### MODIFIED files
- `/app/frontend/src/App.js` — now consumes `useDrains`, `useAlerts`,
  `useTheme` instead of direct mock.js imports. Added:
  - Prototype-mode banner
  - Live-prototype-nodes sub-panel (K-01/K-02/K-03 cards)
  - "AWAITING SENSOR DEPLOYMENT" states across dashboard/map/detail page
  - Null-safe rendering for water/flow/health fields (`—` fallback)
  - Blue-pending status badge + `moduleStatusClasses` helper
  - Theme toggle in top nav (`theme-toggle-shell-btn`) with lucide Sun/Moon icons
  - Mobile-nav test IDs + scroll-to-top on tab change
  - Toaster follows theme; positioned bottom-right so it never overlaps the
    sticky header on mobile
- `/app/frontend/src/index.js` — wraps `<App/>` in `<ThemeProvider>`.
- `/app/frontend/src/index.css` — global `.light-theme` overrides for the
  dark-first Tailwind utility classes used across the shell (bg, text,
  border, badges, chart axis, Leaflet container, sonner tooltip). Adds
  `.pending-pulse` animation and `.animate-fadeIn`.
- `/app/frontend/package.json` — added `firebase` dependency (Web SDK).

### UNCHANGED
- `/app/frontend/src/mock.js` — still the source for the 9 DEMO drains.
- `/app/frontend/tailwind.config.js` — already had `darkMode: ["class"]`.

---

## 2. Firebase Integration Structure

```
ESP32 sensor → Wi-Fi → Firebase Auth (role=device)
                       ↓
                       Firebase Realtime Database
                         drains/{id}/latest    (health/water/flow/lastUpdated)
                         drains/{id}/modules   (waterLevelSensor/flowSensor/esp32/esp32Cam/gateway)
                         drains/{id}/meta      (location/lat/lng)
                         drains/{id}/camera    (latestImageUrl/capturedAt)
                         drains/{id}/history   (push-list of readings)
                         alerts/{alertId}      (severity/drainId/description/status)
                       ↓
                       Cloud Functions (compute health score + generate alerts)
                       ↓
React app  →  useDrains() / useAlerts() / useRealtimeTelemetry()
              (Firebase Auth role=employee)
```

The frontend abstraction never leaks Firebase SDK objects into UI components —
components consume plain JS objects via hooks. Swapping providers later (e.g.
Firestore, Supabase) requires changing only `services/*.js`.

---

## 3. Where To Add Firebase Environment Variables

`/app/frontend/.env` (do NOT commit real keys):

```
REACT_APP_FIREBASE_API_KEY=<from Firebase Console → Project settings>
REACT_APP_FIREBASE_AUTH_DOMAIN=<yourproject>.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://<yourproject>-default-rtdb.<region>.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=<yourproject>
REACT_APP_FIREBASE_STORAGE_BUCKET=<yourproject>.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<numeric sender id>
REACT_APP_FIREBASE_APP_ID=<app id>
```

After populating these, run `sudo supervisorctl restart frontend`. The
`isFirebaseConfigured` flag will flip to `true` (assuming init succeeds),
the header pill will read `FIREBASE LIVE`, the footer will show
`FIREBASE ONLINE`, and the live prototype cards will begin listening.

---

## 4. Firebase Paths / Data Mapping for K-01, K-02, K-03

Each prototype drain is expected at:

| Node | RTDB path         | UI fallback if empty                    |
|------|-------------------|-----------------------------------------|
| K-01 | `drains/K-01/*`   | AWAITING SENSOR DEPLOYMENT (Kurla West Station) |
| K-02 | `drains/K-02/*`   | AWAITING SENSOR DEPLOYMENT (LBS Marg, Kurla Central) |
| K-03 | `drains/K-03/*`   | AWAITING SENSOR DEPLOYMENT (Kurla East) |

Meta (lat/lng/location) is hard-coded in
`/app/frontend/src/data/livePrototypeDrains.js` so map markers render even
before any ESP32 telemetry — but if `drains/{id}/meta` is present in RTDB
it overrides the local defaults (see `mergeLiveTelemetry`).

---

## 5. ESP32 → Drain ID Mapping

Each physical ESP32 node's firmware writes only to its own drain path:

- ESP32 device account #1 → `drains/K-01/*`
- ESP32 device account #2 → `drains/K-02/*`
- ESP32 device account #3 → `drains/K-03/*`

Frontend does not need to know MAC addresses or device tokens — that is
enforced server-side via Firebase Security Rules
(`auth.token.role == 'device'` and, optionally, a per-drain claim).

---

## 6. Demo vs Real Prototype Data Distinction

Every drain object has a `dataSource` string:

- `"DEMO DATA"` — the 9 mock drains from `mock.js` (Malad, Andheri, Chembur,
  Bandra, Borivali, Goregaon, Dadar, Colaba, Thane). Rendered with a small
  `[DEMO DATA]` tag next to the drain ID.
- `"LIVE"` — the 3 Kurla prototype drains (K-01/02/03). Rendered with a
  blue `[LIVE]` tag, a blue-haloed map marker, and — when telemetry has
  not yet arrived — an "AWAITING SENSOR DEPLOYMENT" placeholder card,
  banner, and detail page.

The dashboard header includes a PROTOTYPE MODE strip that reports
`X/3 reporting live telemetry` in real time.

---

## 7. Light/Dark Mode Persistence

- Default theme: **dark** (Smart Drain AI aesthetic).
- Toggle button: `[data-testid="theme-toggle-btn"]` on the login screen,
  `[data-testid="theme-toggle-shell-btn"]` in the shell top-right nav.
- Persistence: `localStorage.setItem('smart-drain-theme', 'light'|'dark')`.
- On first mount, `useTheme` reads the stored value and re-applies the
  `.light-theme` / `.dark` class on `<html>` so global CSS overrides
  in `index.css` restyle every dark-utility class in one place — no
  per-component prop drilling required.

---

## 8. Remaining Steps

- **Firebase credentials**: create the Firebase project, enable RTDB and
  Auth, add the 7 `REACT_APP_FIREBASE_*` env vars to `/app/frontend/.env`,
  restart the frontend.
- **ESP32 firmware**: write firmware per §3 of the backend spec (Firebase
  ESP-Client / mobizt library, `onDisconnect()` handler for offline flip,
  ESP32-CAM every 10–15 min → Firebase Storage → update
  `drains/{id}/camera`).
- **Cloud Functions**: implement the health-score composition (40/30/15/15)
  as an `onWrite` trigger on `drains/{id}/latest`, plus the alert-generation
  and history-pruning schedulers (backend spec §4-§6).
- **Real Firebase Auth**: replace the mock login screen with Firebase Auth
  (email/password for BMC employees, custom claim `role=employee`).
- **Alert acknowledgement**: wire the alert-card click to write
  `status: acknowledged` back to `alerts/{alertId}` (employee role).

No mock data has been misrepresented as real — the dashboard, map, list
and detail pages all clearly label DEMO vs LIVE, and never invent a
health score for a K-* node until Firebase begins reporting.
