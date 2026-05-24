import { getPendingOrders, updateOrder, deleteOrder } from "./db";
import { API_URL } from "@/lib/api/config";

const MAX_RETRIES = 10;

// Global lock: prevents multiple hook instances from syncing simultaneously
let isSyncingGlobal = false;

export async function syncAllPending(): Promise<{
  synced: number;
  failed: number;
}> {
  // If another sync is already running, skip
  if (isSyncingGlobal) return { synced: 0, failed: 0 };
  isSyncingGlobal = true;

  try {
    return await _doSync();
  } finally {
    isSyncingGlobal = false;
  }
}

async function _doSync(): Promise<{ synced: number; failed: number }> {
  const orders = await getPendingOrders(["pending", "failed"]);
  let synced = 0;
  let failed = 0;

  // Sequential sync — server uses LockService
  for (const order of orders) {
    // Skip permanently failed orders
    if (order.attempts >= MAX_RETRIES) continue;

    try {
      await updateOrder(order.localId, { status: "syncing", lastAttempt: Date.now() });

      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(order.payload),
      });
      const result = await response.json();

      if (result.status === "success" || result.status === "ok") {
        // Synced successfully — delete from IndexedDB
        await deleteOrder(order.localId);
        synced++;
      } else {
        await updateOrder(order.localId, {
          status: "failed",
          attempts: order.attempts + 1,
          errorMessage: result.message || "Server returned error",
        });
        failed++;
      }
    } catch (err) {
      await updateOrder(order.localId, {
        status: "failed",
        attempts: order.attempts + 1,
        errorMessage: err instanceof Error ? err.message : "Network error",
      });
      failed++;
    }
  }

  return { synced, failed };
}
