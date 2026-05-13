const DB_NAME = "teras-fc-pos";
const DB_VERSION = 1;
const STORE_NAME = "pending-orders";

export interface SheetRow {
  tanggalPemesanan: string;
  bulan: string;
  pesanan: string;
  jenis: string;
  size: string;
  qty: number;
  pembayaran: string;
  hargaSatuan: number;
  hargaTotal: number;
  totalModal: number;
  totalMargin: number;
  status: string;
  owner: string;
  deliver: string;
  notes: string;
}

export interface PendingOrder {
  id?: number;
  payload: {
    action: string;
    rows: SheetRow[];
  };
  invoice: {
    invoiceId: string;
    tanggalPemesanan: string;
    bulan: string;
    pembayaran: string;
    status: string;
    owner: string;
    deliver: string;
    notes: string;
    items: {
      pesanan: string;
      jenis: string;
      size: string;
      qty: number;
      hargaSatuan: number;
      hargaTotal: number;
    }[];
    totalQty: number;
    totalHarga: number;
    totalModal: number;
    totalMargin: number;
  };
  createdAt: number;
  synced: boolean;
  attempts: number;
  lastError: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addPendingOrder(
  order: Omit<PendingOrder, "id">,
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(order);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as PendingOrder[]);
    req.onerror = () => reject(req.error);
  });
}

export async function updateOrder(order: PendingOrder): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(order);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOrder(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function countUnsyncedOrders(): Promise<number> {
  const orders = await getPendingOrders();
  return orders.filter((o) => !o.synced).length;
}
