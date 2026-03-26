export interface MenuItem {
  id: string;
  name: string;
  category: "ayam" | "paket" | "snack" | "minuman";
  description: string;
  price: number;
  priceJumbo?: number;
  spiceLevel: number; // 0-5
  isPopular?: boolean;
  isNew?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "ayam-goreng-original",
    name: "Ayam Goreng Original",
    category: "ayam",
    description:
      "Ayam goreng dengan bumbu rempah khas Indonesia, digoreng hingga renyah sempurna dengan daging yang tetap juicy.",
    price: 15000,
    priceJumbo: 22000,
    spiceLevel: 1,
    isPopular: true,
  },
  {
    id: "ayam-goreng-crispy",
    name: "Ayam Goreng Crispy",
    category: "ayam",
    description:
      "Ayam goreng dengan lapisan tepung crispy yang renyah di luar, juicy di dalam. Cocok untuk semua kalangan.",
    price: 17000,
    priceJumbo: 22000,
    spiceLevel: 1,
    isNew: true,
  },
  {
    id: "ayam-geprek",
    name: "Ayam Geprek",
    category: "ayam",
    description:
      "Ayam goreng tepung yang digeprek dengan sambal bawang pedas, favorit anak muda Indonesia.",
    price: 18000,
    priceJumbo: 25000,
    spiceLevel: 3,
    isPopular: true,
  },
  {
    id: "paket-nasi-ayam-original",
    name: "Paket Nasi Ayam Original",
    category: "paket",
    description:
      "Nasi putih hangat + Ayam Goreng Original. Paket lengkap untuk makan siang yang puas.",
    price: 25000,
    priceJumbo: 32000,
    spiceLevel: 1,
    isPopular: true,
  },
  {
    id: "paket-nasi-ayam-geprek",
    name: "Paket Nasi Ayam Geprek",
    category: "paket",
    description:
      "Nasi putih hangat + Ayam Geprek pedas. Paket favorit dengan sensasi pedas yang nagih.",
    price: 27000,
    priceJumbo: 35000,
    spiceLevel: 3,
  },
  {
    id: "kentang-goreng",
    name: "Kentang Goreng",
    category: "snack",
    description:
      "Kentang goreng renyah dengan bumbu gurih, cocok untuk cemilan atau teman makan ayam.",
    price: 12000,
    spiceLevel: 0,
  },
  {
    id: "tahu-crispy",
    name: "Tahu Crispy",
    category: "snack",
    description:
      "Tahu goreng tepung crispy yang renyah di luar dan lembut di dalam, disajikan dengan sambal.",
    price: 10000,
    spiceLevel: 1,
  },
  {
    id: "es-teh-manis",
    name: "Es Teh Manis",
    category: "minuman",
    description: "Teh manis segar dengan es batu, pelepas dahaga yang klasik.",
    price: 5000,
    spiceLevel: 0,
  },
];

export const getMenuByCategory = (category: string) => {
  if (category === "all") return menuItems;
  return menuItems.filter((item) => item.category === category);
};

export const categoryLabels: Record<string, string> = {
  all: "Semua",
  ayam: "Ayam",
  paket: "Paket",
  snack: "Snack",
  minuman: "Minuman",
};
