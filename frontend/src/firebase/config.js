// Firebase configuration for Smart Drain AI
// Uses REACT_APP_FIREBASE_* env variables in /app/frontend/.env
//
// When the env vars are not populated, `isFirebaseConfigured` returns false
// and the abstraction layer falls back to demo mock data + "AWAITING SENSOR
// DEPLOYMENT" state for the live prototype drains K-01/K-02/K-03.
//
// To enable live Firebase Realtime Database wiring later, populate:
//   REACT_APP_FIREBASE_API_KEY
//   REACT_APP_FIREBASE_AUTH_DOMAIN
//   REACT_APP_FIREBASE_DATABASE_URL
//   REACT_APP_FIREBASE_PROJECT_ID
//   REACT_APP_FIREBASE_STORAGE_BUCKET
//   REACT_APP_FIREBASE_MESSAGING_SENDER_ID
//   REACT_APP_FIREBASE_APP_ID
// and restart the frontend service.

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const envConfigured =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.databaseURL) &&
  Boolean(firebaseConfig.projectId);

let app = null;
let database = null;
let auth = null;
let initSucceeded = false;

if (envConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    initSucceeded = true;
  } catch (err) {
    console.warn("[Smart Drain AI] Firebase failed to initialize:", err);
  }
} else {
  console.info(
    "[Smart Drain AI] Firebase not configured. Running in prototype/demo mode. " +
      "Populate REACT_APP_FIREBASE_* env vars to enable live ESP32 telemetry."
  );
}

export const isFirebaseConfigured = initSucceeded;
export { app, database, auth };
