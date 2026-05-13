import { API_URL } from "@/lib/api/config";

export interface PosMenuItem {
  id: string;
  name: string;
  jenis: "Ayam" | "Paket" | "Snack" | "Minuman";
  variants: {
    ukuran: string;
    harga: number;
    modal: number;
  }[];
}

interface PricelistRow {
  Produk: string;
  Jenis: string;
  Ukuran: string;
  Harga: number;
  Modal: number;
  Untung: number;
  Margin: number;
}

const CACHE_KEY = "tfc-pos-menu-cache";

function transformPricelist(data: PricelistRow[]): PosMenuItem[] {
  const map = new Map<string, PosMenuItem>();
  for (const row of data) {
    const baseName = row.Produk
      .replace(new RegExp(`\\s+${row.Ukuran}$`, "i"), "")
      .trim();
    const id = baseName.toLowerCase().replace(/\s+/g, "-");
    if (map.has(id)) {
      map.get(id)!.variants.push({
        ukuran: row.Ukuran,
        harga: row.Harga,
        modal: row.Modal,
      });
    } else {
      map.set(id, {
        id,
        name: baseName,
        jenis: row.Jenis as PosMenuItem["jenis"],
        variants: [{ ukuran: row.Ukuran, harga: row.Harga, modal: row.Modal }],
      });
    }
  }
  return Array.from(map.values());
}

export async function fetchPosMenuItems(): Promise<PosMenuItem[]> {
  try {
    const res = await fetch(`${API_URL}?action=pricelist`);
    const json = await res.json();
    if (json.status === "ok" && json.data) {
      const items = transformPricelist(json.data);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(items));
      } catch {
        // localStorage quota exceeded — ignore
      }
      return items;
    }
  } catch {
    // Network error — try cache
  }

  // Fallback 1: localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as PosMenuItem[];
    }
  } catch {
    // localStorage not available
  }

  // Fallback 2: hardcoded items
  return posMenuItems;
}

export const posMenuItems: PosMenuItem[] = [
  {
    id: "ayam-goreng-original",
    name: "Ayam Goreng Original",
    jenis: "Ayam",
    variants: [
      { ukuran: "Regular", harga: 15000, modal: 7200 },
      { ukuran: "Jumbo", harga: 22000, modal: 10000 },
    ],
  },
  {
    id: "ayam-goreng-crispy",
    name: "Ayam Goreng Crispy",
    jenis: "Ayam",
    variants: [
      { ukuran: "Regular", harga: 17000, modal: 8100 },
      { ukuran: "Jumbo", harga: 22000, modal: 8100 },
    ],
  },
  {
    id: "ayam-geprek",
    name: "Ayam Geprek",
    jenis: "Ayam",
    variants: [
      { ukuran: "Regular", harga: 18000, modal: 8500 },
      { ukuran: "Jumbo", harga: 25000, modal: 8500 },
    ],
  },
  {
    id: "paket-nasi-ayam-original",
    name: "Paket Nasi Ayam Original",
    jenis: "Paket",
    variants: [
      { ukuran: "Regular", harga: 25000, modal: 11500 },
      { ukuran: "Jumbo", harga: 32000, modal: 15000 },
    ],
  },
  {
    id: "paket-nasi-ayam-geprek",
    name: "Paket Nasi Ayam Geprek",
    jenis: "Paket",
    variants: [
      { ukuran: "Regular", harga: 27000, modal: 12300 },
      { ukuran: "Jumbo", harga: 35000, modal: 17000 },
    ],
  },
  {
    id: "kentang-goreng",
    name: "Kentang Goreng",
    jenis: "Snack",
    variants: [{ ukuran: "Regular", harga: 12000, modal: 4800 }],
  },
  {
    id: "tahu-crispy",
    name: "Tahu Crispy",
    jenis: "Snack",
    variants: [{ ukuran: "Regular", harga: 10000, modal: 3900 }],
  },
  {
    id: "es-teh-manis",
    name: "Es Teh Manis",
    jenis: "Minuman",
    variants: [{ ukuran: "Regular", harga: 5000, modal: 1500 }],
  },
];

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
