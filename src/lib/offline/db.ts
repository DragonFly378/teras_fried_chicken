import type { Invoice } from "@/app/(dashboard)/history/partials/InvoiceModal";

// ── Types ────────────────────────────────────────────────
interface SheetRow {
  tanggalPemesanan: string;
  bulan: string;
  pesanan: string;
  jenis: string;
  size: string;
  qty: number;
  pembayaran: string;
  hargaSatuan: number;
  hargaTotal: number;
  diskon: number;
  hargaFinal: number;
  totalModal: number;
  totalMargin: number;
  status: string;
  owner: string;
  deliver: string;
  notes: string;
}

export interface PendingOrder {
  localId: string;
  payload: {
    action: string;
    rows: SheetRow[];
    discountPrice?: number;
    kembalian?: number;
  };
  invoice: Invoice;
  status: "pending" | "syncing" | "synced" | "failed";
  serverInvoiceId?: string;
  createdAt: number;
  lastAttempt?: number;
  attempts: number;
  errorMessage?: string;
}

// ── Constants ────────────────────────────────────────────
const DB_NAME = "teras-fc-pos";
const DB_VERSION = 2;
const STORE_NAME = "pendingOrders";

// ── Open DB ──────────────────────────────────────────────
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      // Drop legacy store from v1 if it exists
      if (db.objectStoreNames.contains("pending-orders")) {
        db.deleteObjectStore("pending-orders");
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "localId" });
        store.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Add pending order ────────────────────────────────────
export async function addPendingOrder(order: PendingOrder): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(order);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ── Get orders by status ─────────────────────────────────
export async function getPendingOrders(
  statusFilter?: PendingOrder["status"] | PendingOrder["status"][],
): Promise<PendingOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      let results: PendingOrder[] = request.result;
      if (statusFilter) {
        const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
        results = results.filter((o) => statuses.includes(o.status));
      }
      // FIFO: oldest first
      results.sort((a, b) => a.createdAt - b.createdAt);
      resolve(results);
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

// ── Update order fields ──────────────────────────────────
export async function updateOrder(
  localId: string,
  updates: Partial<Omit<PendingOrder, "localId">>,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(localId);

    getReq.onsuccess = () => {
      if (!getReq.result) {
        db.close();
        reject(new Error(`Order ${localId} not found`));
        return;
      }
      store.put({ ...getReq.result, ...updates });
    };

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ── Delete order ─────────────────────────────────────────
export async function deleteOrder(localId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(localId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ── Count unsynced orders ────────────────────────────────
export async function countUnsyncedOrders(): Promise<number> {
  const orders = await getPendingOrders(["pending", "syncing", "failed"]);
  return orders.length;
}
