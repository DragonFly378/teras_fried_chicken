"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Invoice } from "@/app/(dashboard)/history/partials/InvoiceModal";
import { addPendingOrder, countUnsyncedOrders, type PendingOrder } from "@/lib/offline/db";
import { syncAllPending } from "@/lib/offline/sync";

const SYNC_INTERVAL_S = 15 * 60; // 15 minutes in seconds

export function useOfflineOrders() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [countdown, setCountdown] = useState(SYNC_INTERVAL_S);
  const syncingRef = useRef(false);

  // Refresh pending count from IndexedDB
  const refreshCount = useCallback(async () => {
    try {
      const count = await countUnsyncedOrders();
      setPendingCount(count);
    } catch {
      // IndexedDB unavailable (SSR, private browsing, etc.)
    }
  }, []);

  // Sync, refresh count, and reset countdown
  const syncNow = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      await syncAllPending();
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      setCountdown(SYNC_INTERVAL_S);
      await refreshCount();
    }
  }, [refreshCount]);

  // Save order to IndexedDB
  const saveOrder = useCallback(
    async (
      payload: PendingOrder["payload"],
      invoice: Invoice,
    ): Promise<string> => {
      const localId = `LOCAL-${crypto.randomUUID().split("-")[0]}`;

      const order: PendingOrder = {
        localId,
        payload,
        invoice: { ...invoice, invoiceId: localId },
        status: "pending",
        createdAt: Date.now(),
        attempts: 0,
      };

      await addPendingOrder(order);
      await refreshCount();
      window.dispatchEvent(new Event("pending-orders-changed"));
      return localId;
    },
    [refreshCount],
  );

  // Online/offline + cross-instance sync listeners
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);
    const handleOrdersChanged = () => refreshCount();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("pending-orders-changed", handleOrdersChanged);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("pending-orders-changed", handleOrdersChanged);
    };
  }, [syncNow, refreshCount]);

  // Countdown ticker (every 1 second)
  useEffect(() => {
    refreshCount();

    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up — trigger sync
          if (navigator.onLine) syncNow();
          return SYNC_INTERVAL_S;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [refreshCount, syncNow]);

  return { saveOrder, syncNow, pendingCount, isOnline, isSyncing, countdown };
}
