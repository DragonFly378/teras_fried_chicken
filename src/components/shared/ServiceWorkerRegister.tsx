"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (process.env.NODE_ENV === "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js");
      }
    } else {
      // Dev mode: unregister any existing SW and clear its caches
      // so stale chunks don't get served on normal refresh.
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    }
  }, []);

  return null;
}
