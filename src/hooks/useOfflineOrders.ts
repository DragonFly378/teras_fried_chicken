"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addPendingOrder,
  countUnsyncedOrders,
  type PendingOrder,
} from "@/lib/offline/db";
import { syncPendingOrders, isSyncing } from "@/lib/offline/sync";

const SYNC_INTERVAL = 15 * 60; // 15 minutes in seconds

export function useOfflineOrders() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [countdown, setCountdown] = useState(SYNC_INTERVAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await countUnsyncedOrders();
      setPendingCount(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Listen for pending-orders-changed events
  useEffect(() => {
    const handler = () => {
      refreshCount();
      setSyncing(isSyncing());
    };
    window.addEventListener("pending-orders-changed", handler);
    refreshCount();
    return () => window.removeEventListener("pending-orders-changed", handler);
  }, [refreshCount]);

  // Countdown timer for auto-sync
  useEffect(() => {
    setCountdown(SYNC_INTERVAL);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger sync when countdown reaches 0
          if (navigator.onLine) {
            syncPendingOrders();
          }
          return SYNC_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const saveOrder = useCallback(
    async (order: Omit<PendingOrder, "id">) => {
      await addPendingOrder(order);
      window.dispatchEvent(new Event("pending-orders-changed"));
    },
    [],
  );

  const syncNow = useCallback(async () => {
    setSyncing(true);
    await syncPendingOrders();
    setSyncing(false);
    setCountdown(SYNC_INTERVAL);
  }, []);

  return { saveOrder, syncNow, pendingCount, isOnline, isSyncing: syncing, countdown };
}
