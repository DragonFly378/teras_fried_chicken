"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ReceiptText,
  Search,
  RefreshCw,
  Package,
  CreditCard,
  Drumstick,
  ChevronRight,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/pos-menu";
import { InvoiceModal, type Invoice } from "./InvoiceModal";

const API_URL =
  "https://script.google.com/macros/s/AKfycbz5UQlOzXNGrbBbSNPSHX8gTcNUKL1oE8TlJhIj-FbLhJ-9StEi3-t9rG6jKe_hTxNC/exec";

// ── Constants ──────────────────────────────────────────
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

const BULAN_ID: Record<string, string> = {
  January: "Januari",
  February: "Februari",
  March: "Maret",
  April: "April",
  May: "Mei",
  June: "Juni",
  July: "Juli",
  August: "Agustus",
  September: "September",
  October: "Oktober",
  November: "November",
  December: "Desember",
};

// ── Types ──────────────────────────────────────────────
interface HistoryItem {
  pesanan: string;
  jenis: string;
  size: string;
  qty: number;
  hargaSatuan: number;
  hargaTotal: number;
}

interface HistoryInvoice {
  invoiceId: string;
  tanggalPemesanan: string;
  bulan: string;
  pembayaran: string;
  status: string;
  owner: string;
  deliver: string;
  notes: string;
  items: HistoryItem[];
  totalQty: number;
  totalHarga: number;
  totalModal: number;
  totalMargin: number;
}

interface HistoryResponse {
  status: string;
  bulan: string;
  totalInvoice: number;
  totalQty: number;
  totalOmzet: number;
  totalModal: number;
  totalMargin: number;
  data: HistoryInvoice[];
}

// ── Helpers ────────────────────────────────────────────
function getStatusColor(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("selesai") || s.includes("diantar"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("progres") || s.includes("progress"))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (s.includes("belum"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function formatTanggalPanjang(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── CSV Fallback ───────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i] || ""));
      return row;
    });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function csvTanggalToIso(raw: string): string {
  // CSV uses M/D/YYYY — convert to YYYY-MM-DD so Date() parses it correctly.
  if (!raw) return "";
  const parts = raw.split("/");
  if (parts.length !== 3) return raw;
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function buildHistoryFromCSV(csvText: string): HistoryResponse {
  const rows = parseCSV(csvText);
  const currentBulan = BULAN[new Date().getMonth()];

  // Filter bulan ini (fallback: kalau tidak ada data bulan ini, pakai bulan terakhir yang ada data)
  const availableMonths = new Set(rows.map((r) => r["Bulan"]));
  const targetBulan = availableMonths.has(currentBulan)
    ? currentBulan
    : Array.from(availableMonths).sort(
        (a, b) => BULAN.indexOf(b) - BULAN.indexOf(a),
      )[0] || currentBulan;

  const monthRows = rows.filter((r) => r["Bulan"] === targetBulan);

  // Group by tanggal + owner + pembayaran → satu invoice
  const invoiceMap = new Map<string, HistoryInvoice>();
  monthRows.forEach((r, idx) => {
    const tanggal = r["Tanggal Pemesanan"];
    const owner = r["Owner"] || "-";
    const pembayaran = r["Pembayaran"] || "-";
    const key = `${tanggal}|${owner}|${pembayaran}`;

    const qty = Number(r["Qty"]) || 0;
    const hargaSatuan = Number(r["Harga Satuan"]) || 0;
    const hargaTotal = Number(r["Harga Total"]) || 0;
    const totalModal = Number(r["Total modal"]) || 0;
    const totalMargin = Number(r["Total margin"]) || 0;

    const item: HistoryItem = {
      pesanan: r["Pesanan"] || "-",
      jenis: r["Jenis"] || "-",
      size: r["Size"] || "-",
      qty,
      hargaSatuan,
      hargaTotal,
    };

    if (invoiceMap.has(key)) {
      const inv = invoiceMap.get(key)!;
      inv.items.push(item);
      inv.totalQty += qty;
      inv.totalHarga += hargaTotal;
      inv.totalModal += totalModal;
      inv.totalMargin += totalMargin;
    } else {
      const isoTanggal = csvTanggalToIso(tanggal);
      // Invoice ID ringkas dari tanggal + owner + index
      const datePart = isoTanggal.replace(/-/g, "").slice(2);
      const ownerSlug = owner.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4);
      const invoiceId = `TFC-${datePart}-${ownerSlug || "xxxx"}-${idx
        .toString()
        .padStart(3, "0")}`;

      invoiceMap.set(key, {
        invoiceId,
        tanggalPemesanan: isoTanggal,
        bulan: targetBulan,
        pembayaran,
        status: r["Status"] || "Selesai",
        owner,
        deliver: "",
        notes: "",
        items: [item],
        totalQty: qty,
        totalHarga: hargaTotal,
        totalModal,
        totalMargin,
      });
    }
  });

  const invoices = Array.from(invoiceMap.values()).sort((a, b) => {
    // Terbaru dulu
    const dA = new Date(a.tanggalPemesanan).getTime() || 0;
    const dB = new Date(b.tanggalPemesanan).getTime() || 0;
    return dB - dA;
  });

  return {
    status: "success",
    bulan: targetBulan,
    totalInvoice: invoices.length,
    totalQty: invoices.reduce((s, i) => s + i.totalQty, 0),
    totalOmzet: invoices.reduce((s, i) => s + i.totalHarga, 0),
    totalModal: invoices.reduce((s, i) => s + i.totalModal, 0),
    totalMargin: invoices.reduce((s, i) => s + i.totalMargin, 0),
    data: invoices,
  };
}

// ── Component ──────────────────────────────────────────
export function HistoryList() {
  const [invoices, setInvoices] = useState<HistoryInvoice[]>([]);
  const [bulan, setBulan] = useState<string>(BULAN[new Date().getMonth()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "csv">("api");
  const [summary, setSummary] = useState({
    totalInvoice: 0,
    totalQty: 0,
    totalOmzet: 0,
  });

  const openInvoice = (inv: HistoryInvoice) => {
    setSelectedInvoice(inv as Invoice);
    setModalOpen(true);
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    const currentBulan = BULAN[new Date().getMonth()];

    // 1. Try API first
    try {
      const res = await fetch(
        `${API_URL}?action=history&bulan=${currentBulan}`,
      );
      const result: HistoryResponse = await res.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        setInvoices(result.data);
        setBulan(result.bulan || currentBulan);
        setSummary({
          totalInvoice: result.totalInvoice || 0,
          totalQty: result.totalQty || 0,
          totalOmzet: result.totalOmzet || 0,
        });
        setDataSource("api");
        setLoading(false);
        return;
      }
    } catch {
      // fall through to CSV
    }

    // 2. Fallback: compute from local CSV
    try {
      const csvRes = await fetch("/pesanan-teras-fried-chicken.csv");
      if (!csvRes.ok) throw new Error("CSV not found");
      const csvText = await csvRes.text();
      const result = buildHistoryFromCSV(csvText);
      setInvoices(result.data);
      setBulan(result.bulan);
      setSummary({
        totalInvoice: result.totalInvoice,
        totalQty: result.totalQty,
        totalOmzet: result.totalOmzet,
      });
      setDataSource("csv");
    } catch {
      setError("Gagal memuat data history. API dan CSV tidak tersedia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter by search (invoice id, owner, atau nama menu)
  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceId.toLowerCase().includes(q) ||
        (inv.owner || "").toLowerCase().includes(q) ||
        inv.items.some((it) => it.pesanan.toLowerCase().includes(q)),
    );
  }, [invoices, search]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulanId = BULAN_ID[bulan] || bulan;

  return (
    <section className="p-4 sm:p-6 bg-tfc-surface min-h-screen">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <div>
            <h1 className="font-body text-xl lg:text-2xl text-tfc-brown font-bold">
              History Transaksi
            </h1>
            <p className="font-body text-sm text-tfc-muted mt-0.5">
              Daftar transaksi bulan {bulanId} {new Date().getFullYear()}
            </p>
          </div>
          <Button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="bg-white text-tfc-brown border border-tfc-brown/15 hover:bg-tfc-surface font-body font-semibold"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* CSV Info Banner */}
        {dataSource === "csv" && !loading && !error && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-body text-xs lg:text-sm">
            <span className="font-semibold">Info:</span> Data diambil dari file
            lokal (API belum tersedia).
          </div>
        )}

        {/* Summary Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-tfc-brown/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <ReceiptText className="w-4 h-4 text-tfc-brown" />
                <span className="text-[11px] sm:text-xs font-body text-tfc-muted">
                  Total Invoice
                </span>
              </div>
              <p className="text-base sm:text-xl font-body font-bold text-tfc-brown">
                {summary.totalInvoice}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-tfc-brown/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] sm:text-xs font-body text-tfc-muted">
                  Total Item
                </span>
              </div>
              <p className="text-base sm:text-xl font-body font-bold text-tfc-brown">
                {summary.totalQty}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-tfc-brown/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] sm:text-xs font-body text-tfc-muted">
                  Total Pendapatan
                </span>
              </div>
              <p className="text-base sm:text-xl font-body font-bold text-emerald-600 truncate">
                {formatRupiah(summary.totalOmzet)}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tfc-muted" />
          <Input
            type="text"
            placeholder="Cari invoice, pembeli, atau menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-tfc-brown/10 flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-7 h-7 text-tfc-orange animate-spin mx-auto" />
              <p className="font-body text-sm text-tfc-muted">
                Memuat history...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-tfc-brown/10 px-5 py-12 text-center">
            <p className="text-sm font-body text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-tfc-brown/10 px-5 py-16 text-center">
            <ReceiptText className="w-10 h-10 text-tfc-brown/15 mx-auto mb-3" />
            <p className="text-sm font-body text-tfc-muted">
              {search
                ? "Tidak ada invoice yang cocok dengan pencarian."
                : "Belum ada pesanan bulan ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const isOpen = expanded.has(inv.invoiceId);
              const previewItems = isOpen ? inv.items : inv.items.slice(0, 2);
              const remaining = inv.items.length - previewItems.length;

              return (
                <div
                  key={inv.invoiceId}
                  className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(61,28,10,0.08)]"
                >
                  {/* ── TICKET STUB (header) ────────────────── */}
                  <div className="px-4 sm:px-5 pt-4 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-body text-tfc-muted uppercase tracking-wide shrink-0">
                          Pelanggan
                        </span>
                        <span className="font-body text-sm font-bold text-tfc-brown truncate">
                          {inv.owner || "-"}
                        </span>
                      </div>
                      <Badge
                        className={`text-[10px] font-body font-semibold shrink-0 ${getStatusColor(inv.status)}`}
                      >
                        {inv.status || "Pending"}
                      </Badge>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <ReceiptText className="w-3 h-3 text-tfc-muted shrink-0" />
                      <span className="font-mono text-[10px] text-tfc-muted truncate">
                        {inv.invoiceId}
                      </span>
                      <span className="font-body text-[10px] text-tfc-muted">
                        ·
                      </span>
                      <span className="font-body text-[10px] text-tfc-muted">
                        {formatTanggalPanjang(inv.tanggalPemesanan)}
                      </span>
                    </div>
                  </div>

                  {/* ── NOTCH + PERFORATION ─────────────────── */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tfc-surface z-10" />
                    <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tfc-surface z-10" />
                    <div className="border-t border-dashed border-tfc-brown/25 mx-3" />
                  </div>

                  {/* ── TICKET BODY: items ──────────────────── */}
                  <div className="px-4 sm:px-5 py-3 space-y-3">
                    {previewItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg bg-tfc-orange/15 flex items-center justify-center shrink-0">
                          <Drumstick className="w-6 h-6 text-tfc-brown" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-semibold text-tfc-brown line-clamp-2">
                            {item.pesanan}
                          </p>
                          <p className="font-body text-[11px] text-tfc-muted mt-0.5 truncate">
                            {[item.jenis, item.size]
                              .filter((x) => x && x !== "-")
                              .join(" · ") || "-"}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="font-body text-[11px] text-tfc-muted">
                              {item.qty}x{" "}
                              {formatRupiah(Number(item.hargaSatuan))}
                            </span>
                            <span className="font-body text-sm font-semibold text-tfc-brown whitespace-nowrap">
                              {formatRupiah(Number(item.hargaTotal))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show more / less inline */}
                    {inv.items.length > 2 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(inv.invoiceId)}
                        className="w-full text-center pt-1 inline-flex items-center justify-center gap-1 text-xs font-body font-semibold text-tfc-brown/70 hover:text-tfc-orange transition-colors"
                      >
                        {isOpen
                          ? "Sembunyikan"
                          : `+ ${remaining} produk lainnya`}
                        <ChevronRight
                          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}

                    {/* Notes & deliver */}
                    {(inv.deliver || inv.notes) && (
                      <div className="pt-2 mt-1 border-t border-dashed border-tfc-brown/10 space-y-1">
                        {inv.deliver && (
                          <p className="text-[11px] font-body text-tfc-muted flex items-start gap-1.5">
                            <Truck className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>
                              <span className="font-semibold text-tfc-brown">
                                Pengantaran:
                              </span>{" "}
                              {inv.deliver}
                            </span>
                          </p>
                        )}
                        {inv.notes && (
                          <p className="text-[11px] font-body text-tfc-muted">
                            <span className="font-semibold text-tfc-brown">
                              Catatan:
                            </span>{" "}
                            {inv.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Inner dashed: before total ──────────── */}
                  <div className="mx-4 sm:mx-5 border-t border-dashed border-tfc-brown/15" />

                  {/* ── TOTAL row ───────────────────────────── */}
                  <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                    <span className="font-body text-[11px] text-tfc-muted">
                      Total Pesanan ({inv.totalQty} produk)
                    </span>
                    <span className="font-body text-base sm:text-lg font-bold text-tfc-brown">
                      {formatRupiah(inv.totalHarga)}
                    </span>
                  </div>

                  {/* ── NOTCH + PERFORATION (before footer) ─── */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tfc-surface z-10" />
                    <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tfc-surface z-10" />
                    <div className="border-t border-dashed border-tfc-brown/25 mx-3" />
                  </div>

                  {/* ── TICKET FOOTER ───────────────────────── */}
                  <div className="px-4 sm:px-5 py-3 pb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CreditCard className="w-3.5 h-3.5 text-tfc-muted shrink-0" />
                      <span className="font-body text-[11px] text-tfc-muted truncate">
                        Dibayar via{" "}
                        <span className="font-semibold text-tfc-brown">
                          {inv.pembayaran || "-"}
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInvoice(inv)}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tfc-brown text-white hover:bg-tfc-brown/90 transition-colors text-[11px] font-body font-semibold"
                    >
                      Lihat Invoice
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice detail modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
}
