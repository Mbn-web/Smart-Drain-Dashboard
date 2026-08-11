// useRealtimeTelemetry — subscribe to a single drain's Firebase RTDB node
// (drains/{id}) and receive its merged live telemetry. Automatically
// unsubscribes on unmount or when drainId changes.
//
// Returns:
//   { telemetry, loading, isLive }
//
//   telemetry  — the raw Firebase value (or null if none / demo mode)
//   loading    — true until the first snapshot arrives
//   isLive     — true when Firebase is configured AND telemetry !== null

import { useEffect, useState } from "react";
import { subscribeDrain } from "../services/drainService";
import { isFirebaseConfigured } from "../firebase/config";

export function useRealtimeTelemetry(drainId) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(Boolean(isFirebaseConfigured));

  useEffect(() => {
    if (!drainId) return undefined;

    if (!isFirebaseConfigured) {
      setTelemetry(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeDrain(drainId, (value) => {
      setTelemetry(value);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [drainId]);

  return {
    telemetry,
    loading,
    isLive: Boolean(isFirebaseConfigured && telemetry && telemetry.latest),
  };
}
