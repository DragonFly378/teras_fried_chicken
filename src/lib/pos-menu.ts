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
