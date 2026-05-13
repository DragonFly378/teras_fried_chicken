import { API_URL } from "@/lib/api/config";
import {
  getPendingOrders,
  updateOrder,
  deleteOrder,
  type PendingOrder,
} from "./db";

const MAX_RETRIES = 10;
let syncing = false;

export async function syncPendingOrders(): Promise<void> {
  if (syncing) return;
  syncing = true;

  try {
    const orders = await getPendingOrders();
    const unsynced = orders.filter((o) => !o.synced && o.attempts < MAX_RETRIES);

    for (const order of unsynced) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(order.payload),
        });
        const result = await res.json();

        if (result.status === "success" || result.status === "ok") {
          await deleteOrder(order.id!);
        } else {
          await markFailed(order, result.message || "Server returned error");
        }
      } catch (err) {
        await markFailed(
          order,
          err instanceof Error ? err.message : "Network error",
        );
      }
    }
  } finally {
    syncing = false;
    window.dispatchEvent(new Event("pending-orders-changed"));
  }
}

async function markFailed(order: PendingOrder, message: string) {
  order.attempts += 1;
  order.lastError = message;
  await updateOrder(order);
}

export function isSyncing(): boolean {
  return syncing;
}
