"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Send,
  ShoppingCart,
  X,
  Search,
  LayoutGrid,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { formatRupiah } from "@/lib/pos-menu";
import { API_URL } from "@/lib/api/config";
import { useOfflineOrders } from "@/hooks/useOfflineOrders";

const BULAN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Types ──────────────────────────────────────────────
interface PricelistRow {
  Produk: string;
  Jenis: string;
  Ukuran: string;
  Harga: number;
  Modal: number;
  Untung: number;
  Margin: number;
}

interface PosMenuItem {
  id: string;
  name: string;
  jenis: string;
  variants: {
    ukuran: string;
    harga: number;
    modal: number;
  }[];
}

interface CartItem {
  menuId: string;
  menuName: string;
  jenis: string;
  ukuran: string;
  qty: number;
  harga: number;
  modal: number;
}

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
  totalModal: number;
  totalMargin: number;
  status: string;
  owner: string;
  deliver: string;
  notes: string;
}

type CategoryFilter = "Semua" | string;
type MobileTab = "menu" | "cart";

const PEMBAYARAN_OPTIONS = ["Cash", "Qris", "Transfer Bank"];
const STATUS_OPTIONS = ["Belum bayar", "In progres", "Selesai", "Diantar"];

const BADGE_COLORS: Record<string, string> = {
  Ayam: "bg-tfc-orange/10 text-tfc-orange border-tfc-orange/20",
  Paket: "bg-blue-50 text-blue-700 border-blue-200",
  Snack: "bg-red-50 text-red-700 border-red-200",
  Minuman: "bg-green-50 text-green-700 border-green-200",
};

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function formatTanggal(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

function getBulan(dateStr: string): string {
  if (!dateStr) return "";
  return BULAN[parseInt(dateStr.split("-")[1]) - 1];
}

function transformPricelist(data: PricelistRow[]): { items: PosMenuItem[]; categories: string[] } {
  const map = new Map<string, PosMenuItem>();
  const jenisSet = new Set<string>();

  for (const row of data) {
    // Strip ukuran from product name to get base name
    const baseName = row.Produk
      .replace(new RegExp(`\\s+${row.Ukuran}$`, "i"), "")
      .trim();
    const id = baseName.toLowerCase().replace(/\s+/g, "-");

    jenisSet.add(row.Jenis);

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
        jenis: row.Jenis,
        variants: [
          {
            ukuran: row.Ukuran,
            harga: row.Harga,
            modal: row.Modal,
          },
        ],
      });
    }
  }

  return {
    items: Array.from(map.values()),
    categories: ["Semua", ...Array.from(jenisSet)],
  };
}

// ── Component ──────────────────────────────────────────
export function OrderForm() {
  const { saveOrder, syncNow } = useOfflineOrders();
  const [menuItems, setMenuItems] = useState<PosMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [category, setCategory] = useState<CategoryFilter>("Semua");
  const [mobileTab, setMobileTab] = useState<MobileTab>("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pembeli, setPembeli] = useState("");
  const [tanggal, setTanggal] = useState(getTodayString());
  const [pembayaran, setPembayaran] = useState("Qris");
  const [status, setStatus] = useState("Belum bayar");
  const [tglPengantaran, setTglPengantaran] = useState("");
  const [notes, setNotes] = useState("");
  const [uangDiterima, setUangDiterima] = useState("");

  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [pendingRows, setPendingRows] = useState<SheetRow[]>([]);

  // ── Fetch pricelist from API ────────────────────────
  useEffect(() => {
    async function fetchPricelist() {
      try {
        const res = await fetch(`${API_URL}?action=pricelist`);
        const json = await res.json();
        if (json.status === "ok" && json.data) {
          const { items, categories: cats } = transformPricelist(json.data);
          setMenuItems(items);
          setCategories(cats);
        } else {
          setMenuError("Gagal memuat data menu.");
        }
      } catch {
        setMenuError("Gagal terhubung ke server. Cek koneksi internet.");
      } finally {
        setMenuLoading(false);
      }
    }
    fetchPricelist();
  }, []);

  // ── Menu filtering ───────────────────────────────────
  const filteredMenu = menuItems.filter((m) => {
    const matchCategory = category === "Semua" || m.jenis === category;
    const matchSearch =
      search === "" || m.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ── Cart helpers ─────────────────────────────────────
  const addToCart = (
    menuId: string,
    menuName: string,
    jenis: string,
    ukuran: string,
    harga: number,
    modal: number,
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.menuId === menuId && c.ukuran === ukuran,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [
        ...prev,
        { menuId, menuName, jenis, ukuran, qty: 1, harga, modal },
      ];
    });
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].qty + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const getCartQty = (menuId: string, ukuran: string) => {
    return (
      cart.find((c) => c.menuId === menuId && c.ukuran === ukuran)?.qty ?? 0
    );
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const parsedUang = parseInt(uangDiterima.replace(/\D/g, "")) || 0;
  const kembalian = parsedUang - totalHarga;

  // ── Submit ───────────────────────────────────────────
  const buildRows = (): SheetRow[] => {
    return cart.map((item) => ({
      tanggalPemesanan: formatTanggal(tanggal),
      bulan: getBulan(tanggal),
      pesanan: `${item.menuName} ${item.ukuran}`,
      jenis: item.jenis,
      size: item.ukuran,
      qty: item.qty,
      pembayaran,
      hargaSatuan: item.harga,
      hargaTotal: item.harga * item.qty,
      totalModal: item.modal * item.qty,
      totalMargin: (item.harga - item.modal) * item.qty,
      status,
      owner: pembeli,
      deliver: tglPengantaran ? formatTanggal(tglPengantaran) : "",
      notes,
    }));
  };

  const handleSubmit = () => {
    if (!pembeli.trim() || cart.length === 0) return;
    setPendingRows(buildRows());
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Build invoice object for IndexedDB storage
      const invoiceItems = cart.map((item) => ({
        pesanan: `${item.menuName} ${item.ukuran}`,
        jenis: item.jenis,
        size: item.ukuran,
        qty: item.qty,
        hargaSatuan: item.harga,
        hargaTotal: item.harga * item.qty,
      }));

      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const yyyy = wib.getUTCFullYear();
      const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(wib.getUTCDate()).padStart(2, "0");
      const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
      const localInvoiceId = `INV-TFC-${yyyy}${mm}${dd}${seq}`;

      await saveOrder({
        payload: { action: "pesanan", rows: pendingRows },
        invoice: {
          invoiceId: localInvoiceId,
          tanggalPemesanan: tanggal,
          bulan: getBulan(tanggal),
          pembayaran,
          status,
          owner: pembeli,
          deliver: tglPengantaran ? formatTanggal(tglPengantaran) : "",
          notes,
          items: invoiceItems,
          totalQty: totalItems,
          totalHarga,
          totalModal: cart.reduce((s, i) => s + i.modal * i.qty, 0),
          totalMargin: cart.reduce(
            (s, i) => s + (i.harga - i.modal) * i.qty,
            0,
          ),
        },
        createdAt: Date.now(),
        synced: false,
        attempts: 0,
        lastError: "",
      });

      setShowConfirm(false);
      setCart([]);
      setPembeli("");
      setTanggal(getTodayString());
      setPembayaran("Qris");
      setStatus("Belum bayar");
      setTglPengantaran("");
      setNotes("");
      setUangDiterima("");
      setMobileTab("menu");

      Swal.fire({
        icon: "success",
        title: "Pesanan Tersimpan!",
        text: "Pesanan disimpan & akan otomatis dikirim ke Google Sheet.",
        confirmButtonColor: "#3D1C0A",
        timer: 3000,
        timerProgressBar: true,
      });

      // Trigger background sync
      syncNow();
    } catch {
      setShowConfirm(false);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal menyimpan pesanan.",
        confirmButtonColor: "#3D1C0A",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Styles ───────────────────────────────────────────
  const triggerClass =
    "h-9 w-full bg-white border-tfc-brown/15 text-tfc-brown font-body font-medium text-sm focus:ring-tfc-orange/20 focus:border-tfc-orange";
  const labelClass =
    "text-xs font-body font-semibold text-tfc-brown uppercase tracking-wide";

  // ── Loading / Error state ──────────────────────────
  if (menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-tfc-orange animate-spin mx-auto" />
          <p className="font-body text-sm text-tfc-muted">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="font-body text-sm text-red-600">{menuError}</p>
        </div>
      </div>
    );
  }

  // ── Shared: Menu Grid Content ────────────────────────
  const MenuContent = (
    <div className="flex-1 min-w-0">
      {/* Category Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all duration-200 whitespace-nowrap ${
                category === cat
                  ? "bg-tfc-brown text-white shadow-md"
                  : "bg-white text-tfc-brown border border-tfc-brown/15 hover:border-tfc-orange hover:bg-tfc-orange/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tfc-muted" />
          <Input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-tfc-brown/10 p-3 sm:p-4 hover:border-tfc-orange hover:shadow-md transition-all duration-200"
          >
            <div className="mb-2 sm:mb-3">
              <Badge
                className={`text-[10px] mb-1.5 sm:mb-2 ${
                  BADGE_COLORS[item.jenis] || "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {item.jenis}
              </Badge>
              <h3 className="font-body font-bold text-tfc-brown text-xs sm:text-sm leading-tight">
                {item.name}
              </h3>
            </div>

            <div className="space-y-1.5">
              {item.variants.map((v) => {
                const inCart = getCartQty(item.id, v.ukuran);
                return (
                  <button
                    key={v.ukuran}
                    onClick={() =>
                      addToCart(
                        item.id,
                        item.name,
                        item.jenis,
                        v.ukuran,
                        v.harga,
                        v.modal,
                      )
                    }
                    className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-body font-medium transition-all duration-150 ${
                      inCart > 0
                        ? "bg-tfc-orange/20 text-tfc-brown border border-tfc-orange"
                        : "bg-tfc-surface text-tfc-brown hover:bg-tfc-orange/10 border border-transparent"
                    }`}
                  >
                    <span>{v.ukuran}</span>
                    <span className="flex items-center gap-1 sm:gap-2">
                      <span className="text-tfc-muted hidden sm:inline">
                        {formatRupiah(v.harga)}
                      </span>
                      <span className="text-tfc-muted sm:hidden text-[10px]">
                        {(v.harga / 1000).toFixed(0)}k
                      </span>
                      {inCart > 0 ? (
                        <span className="bg-tfc-brown text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {inCart}
                        </span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-tfc-muted shrink-0" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Shared: Cart Content ─────────────────────────────
  const CartContent = (
    <div className="w-full lg:w-[380px] lg:shrink-0">
      <div className="bg-white rounded-xl border border-tfc-brown/10 shadow-sm lg:sticky lg:top-4 overflow-hidden">
        {/* Cart Header */}
        <div className="bg-tfc-brown px-4 sm:px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-body text-lg text-white font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-tfc-orange" />
              Keranjang
            </h2>
            {totalItems > 0 && (
              <span className="bg-tfc-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} item
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nama pembeli *"
              value={pembeli}
              onChange={(e) => setPembeli(e.target.value)}
              className="h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-tfc-orange focus:ring-tfc-orange/30"
            />
            <DatePicker
              value={tanggal}
              onChange={setTanggal}
              placeholder="Tanggal"
              className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 w-[160px] shrink-0 [&_svg]:text-white/50"
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-[40vh] lg:max-h-[35vh] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ShoppingCart className="w-8 h-8 text-tfc-brown/15 mx-auto mb-2" />
              <p className="text-sm font-body text-tfc-muted">
                Klik menu untuk menambah pesanan
              </p>
            </div>
          ) : (
            <div className="divide-y divide-tfc-brown/5">
              {cart.map((item, index) => (
                <div
                  key={`${item.menuId}-${item.ukuran}`}
                  className="px-4 sm:px-5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-sm text-tfc-brown truncate">
                        {item.menuName}
                      </p>
                      <p className="text-xs text-tfc-muted font-body">
                        {item.ukuran}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Hapus item"
                      onClick={() => removeFromCart(index)}
                      className="text-red-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Kurangi qty"
                        onClick={() => updateQty(index, -1)}
                        className="w-7 h-7 rounded-md bg-tfc-surface flex items-center justify-center hover:bg-tfc-brown/10 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-tfc-brown" />
                      </button>
                      <span className="w-8 text-center text-sm font-body font-bold text-tfc-brown">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        title="Tambah qty"
                        onClick={() => updateQty(index, 1)}
                        className="w-7 h-7 rounded-md bg-tfc-surface flex items-center justify-center hover:bg-tfc-brown/10 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-tfc-brown" />
                      </button>
                    </div>
                    <span className="font-body font-bold text-sm text-tfc-brown">
                      {formatRupiah(item.harga * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-tfc-brown/10 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className={labelClass}>Pembayaran</label>
                <Select value={pembayaran} onValueChange={setPembayaran}>
                  <SelectTrigger className={triggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEMBAYARAN_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={triggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Cash: Uang Diterima & Kembalian */}
            {pembayaran === "Cash" && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className={labelClass}>Uang Diterima</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={uangDiterima ? formatRupiah(parsedUang) : ""}
                    onChange={(e) =>
                      setUangDiterima(e.target.value.replace(/\D/g, ""))
                    }
                    className="h-9 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-bold placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20"
                  />
                </div>
                {parsedUang > 0 && (
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-body font-bold ${
                      kembalian >= 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    <span>Kembalian</span>
                    <span>
                      {kembalian >= 0
                        ? formatRupiah(kembalian)
                        : `Kurang ${formatRupiah(Math.abs(kembalian))}`}
                    </span>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowExtra(!showExtra)}
              className="flex items-center gap-1.5 text-xs font-body font-semibold text-tfc-muted hover:text-tfc-brown transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showExtra ? "rotate-180" : ""}`}
              />
              Pengantaran & Notes
            </button>
            <div
              className={`grid transition-all duration-200 ${showExtra ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden space-y-2.5">
                <div className="space-y-1">
                  <label className={labelClass}>Tgl Pengantaran</label>
                  <DatePicker
                    value={tglPengantaran}
                    onChange={setTglPengantaran}
                    placeholder="Pilih tanggal pengantaran"
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Notes</label>
                  <Textarea
                    placeholder="Catatan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Footer */}
        <div className="px-4 sm:px-5 py-4 border-t-2 border-tfc-brown/10 bg-tfc-surface/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-lg text-tfc-brown font-semibold">
              Total
            </span>
            <span className="font-body text-2xl text-tfc-brown font-bold">
              {formatRupiah(totalHarga)}
            </span>
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={cart.length === 0 || !pembeli.trim()}
            className="w-full bg-tfc-orange text-white hover:bg-tfc-orange/90 font-body font-bold tracking-wide rounded-xl py-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Kirim Pesanan
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE & TABLET: Tab-based app layout */}
      <section className="lg:hidden pt-4 pb-[80px] px-4 sm:px-6 min-h-screen bg-tfc-surface">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-tfc-brown rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/images/logo_bg.svg"
                  alt="TFC"
                  width={36}
                  height={36}
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="font-body text-lg sm:text-xl text-tfc-brown font-bold leading-tight">
                  Teras FC POS
                </h1>
                <p className="text-[10px] sm:text-xs font-body text-tfc-muted">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {mobileTab === "menu" ? MenuContent : CartContent}
        </div>
      </section>

      {/* MOBILE & TABLET: Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-tfc-brown/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex">
          <button
            onClick={() => setMobileTab("menu")}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              mobileTab === "menu" ? "text-tfc-brown" : "text-tfc-muted"
            }`}
          >
            <LayoutGrid
              className={`w-5 h-5 ${mobileTab === "menu" ? "text-tfc-orange" : ""}`}
            />
            <span className="text-[11px] font-body font-semibold">Menu</span>
            {mobileTab === "menu" && (
              <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-tfc-orange" />
            )}
          </button>
          <button
            onClick={() => setMobileTab("cart")}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
              mobileTab === "cart" ? "text-tfc-brown" : "text-tfc-muted"
            }`}
          >
            <div className="relative">
              <ShoppingCart
                className={`w-5 h-5 ${mobileTab === "cart" ? "text-tfc-orange" : ""}`}
              />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[11px] font-body font-semibold">
              Keranjang
              {totalHarga > 0 && (
                <span className="ml-1 text-tfc-orange">
                  {formatRupiah(totalHarga)}
                </span>
              )}
            </span>
            {mobileTab === "cart" && (
              <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-tfc-orange" />
            )}
          </button>
        </div>
      </nav>

      {/* DESKTOP: Side-by-side layout */}
      <section className="hidden lg:block pt-4 pb-8 px-6 min-h-screen bg-tfc-surface">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/images/logo_bg.svg"
                  alt="TFC"
                  width={40}
                  height={40}
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="font-body text-2xl text-tfc-brown font-bold leading-tight">
                  Teras Fried Chicken POS
                </h1>
                <p className="text-xs font-body text-tfc-muted">
                  Order Management System
                </p>
              </div>
            </div>
            <div className="text-right text-sm font-body text-tfc-muted">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Desktop Side-by-Side */}
          <div className="flex gap-5">
            {MenuContent}
            {CartContent}
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-tfc-brown/10">
              <h3 className="font-body text-xl sm:text-2xl text-tfc-brown font-semibold">
                Konfirmasi Pesanan
              </h3>
              <button
                type="button"
                title="Tutup"
                onClick={() => !isSubmitting && setShowConfirm(false)}
                className="text-tfc-muted hover:text-tfc-brown transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-6 py-5 overflow-y-auto max-h-[55vh] space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="text-tfc-muted">Pembeli</span>
                  <p className="font-semibold text-tfc-brown">
                    {pendingRows[0]?.owner}
                  </p>
                </div>
                <div>
                  <span className="text-tfc-muted">Tanggal</span>
                  <p className="font-semibold text-tfc-brown">
                    {pendingRows[0]?.tanggalPemesanan}
                  </p>
                </div>
              </div>

              <div className="border border-tfc-brown/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-tfc-surface text-tfc-brown">
                      <th className="text-left px-3 sm:px-4 py-2.5 font-semibold">
                        Pesanan
                      </th>
                      <th className="text-center px-2 sm:px-3 py-2.5 font-semibold">
                        Qty
                      </th>
                      <th className="text-right px-3 sm:px-4 py-2.5 font-semibold hidden sm:table-cell">
                        Harga
                      </th>
                      <th className="text-right px-3 sm:px-4 py-2.5 font-semibold">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRows.map((row, i) => (
                      <tr key={i} className="border-t border-tfc-brown/5">
                        <td className="px-3 sm:px-4 py-2.5 font-medium text-tfc-brown text-xs sm:text-sm">
                          {row.pesanan}
                        </td>
                        <td className="px-2 sm:px-3 py-2.5 text-center text-tfc-brown">
                          {row.qty}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right text-tfc-muted hidden sm:table-cell">
                          {formatRupiah(row.hargaSatuan)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right font-semibold text-tfc-brown text-xs sm:text-sm">
                          {formatRupiah(row.hargaTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-tfc-brown/10 bg-tfc-surface">
                      <td
                        colSpan={2}
                        className="px-3 sm:px-4 py-3 font-semibold text-tfc-brown text-right sm:hidden"
                      >
                        Total
                      </td>
                      <td
                        colSpan={3}
                        className="px-4 py-3 font-semibold text-tfc-brown text-right hidden sm:table-cell"
                      >
                        Total
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-bold text-tfc-brown text-right text-sm sm:text-base">
                        {formatRupiah(
                          pendingRows.reduce((s, r) => s + r.hargaTotal, 0),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="text-tfc-muted">Pembayaran</span>
                  <p className="font-semibold text-tfc-brown">
                    {pendingRows[0]?.pembayaran}
                  </p>
                </div>
                <div>
                  <span className="text-tfc-muted">Status</span>
                  <p className="font-semibold text-tfc-brown">
                    {pendingRows[0]?.status}
                  </p>
                </div>
                {pembayaran === "Cash" && parsedUang > 0 && (
                  <>
                    <div>
                      <span className="text-tfc-muted">Uang Diterima</span>
                      <p className="font-semibold text-tfc-brown">
                        {formatRupiah(parsedUang)}
                      </p>
                    </div>
                    <div>
                      <span className="text-tfc-muted">Kembalian</span>
                      <p
                        className={`font-semibold ${
                          kembalian >= 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {kembalian >= 0
                          ? formatRupiah(kembalian)
                          : `Kurang ${formatRupiah(Math.abs(kembalian))}`}
                      </p>
                    </div>
                  </>
                )}
                {pendingRows[0]?.deliver && (
                  <div>
                    <span className="text-tfc-muted">Pengantaran</span>
                    <p className="font-semibold text-tfc-brown">
                      {pendingRows[0].deliver}
                    </p>
                  </div>
                )}
                {notes && (
                  <div className="col-span-2">
                    <span className="text-tfc-muted">Notes</span>
                    <p className="font-semibold text-tfc-brown">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-tfc-brown/10 flex gap-3">
              <Button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 bg-white text-tfc-brown border border-tfc-brown/20 hover:bg-tfc-surface font-body font-semibold rounded-full py-5"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-tfc-orange text-white hover:bg-tfc-orange/90 font-body font-semibold rounded-full py-5 disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : "Konfirmasi & Kirim"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
