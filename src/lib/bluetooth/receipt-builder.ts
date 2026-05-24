import type { Invoice } from "@/app/(dashboard)/history/partials/InvoiceModal";
import type { PaperSize } from "@/hooks/usePaperSize";
import type { StoreProfile } from "@/hooks/useStoreProfile";
import type { PrinterSlotId } from "./types";
import { formatRupiah } from "@/lib/pos-menu";
import {
  initialize,
  textAlign,
  bold,
  doubleSize,
  text,
  lineFeed,
  separator,
  twoColumnRow,
  feedAndCut,
  concat,
} from "./escpos";

// Char width per paper size (Font A 12x24)
const CHAR_WIDTH: Record<PaperSize, number> = {
  "58mm": 32,
  "80mm": 48,
};

// ── Helpers ─────────────────────────────────────────────

function formatTanggalShort(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWaktu(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB"
  );
}

/** Convert formatRupiah output to plain string (strip "IDR" symbol quirks) */
function rupiahStr(amount: number): string {
  return formatRupiah(amount)
    .replace(/\s/g, " ") // normalize whitespace (non-breaking → regular)
    .replace(/^Rp\s*/, "Rp ") // normalize "Rp" prefix
    .trim();
}

function itemName(item: { pesanan: string; jenis: string; size: string }): string {
  const parts = [item.pesanan];
  if (item.jenis && item.jenis !== "-") parts.push(item.jenis);
  if (item.size && item.size !== "-") parts.push(item.size);
  return parts.join(" - ");
}

// ── Header builder (shared) ─────────────────────────────

function buildHeader(
  store: StoreProfile,
  slotId: PrinterSlotId,
): Uint8Array[] {
  const parts: Uint8Array[] = [];

  // Store name (supports multi-line via \n)
  const nameLines = (store.namaToko || "TERAS FRIED CHICKEN").split("\n");
  parts.push(textAlign("center"), doubleSize(true));
  for (const line of nameLines) {
    parts.push(text(line.trim()), lineFeed());
  }
  parts.push(doubleSize(false));

  if (store.tagline) {
    parts.push(text(store.tagline), lineFeed());
  }

  if (store.alamat) {
    parts.push(text(store.alamat), lineFeed());
  }

  // Kasir: show IG + wifi
  if (slotId === "kasir") {
    if (store.instagram) {
      parts.push(text(`IG: @${store.instagram.replace(/^@/, "")}`), lineFeed());
    }
    if (store.usernameWifi || store.passwordWifi) {
      const wifiParts = [
        store.usernameWifi ? `Wifi: ${store.usernameWifi}` : "",
        store.passwordWifi ? `Pass: ${store.passwordWifi}` : "",
      ].filter(Boolean);
      parts.push(text(wifiParts.join(" | ")), lineFeed());
    }
  }

  parts.push(textAlign("left"));

  return parts;
}

// ── Kitchen receipt (no prices) ─────────────────────────

function buildKitchenReceipt(
  invoice: Invoice,
  paperSize: PaperSize,
  store: StoreProfile,
  slotId: PrinterSlotId,
): Uint8Array {
  const w = CHAR_WIDTH[paperSize];
  const parts: Uint8Array[] = [];

  const push = (...items: Uint8Array[]) => {
    for (const item of items) parts.push(item);
  };

  push(initialize());

  // Header
  push(...buildHeader(store, slotId));

  // Transaction info
  push(
    separator(w, "-"),
    lineFeed(),
    twoColumnRow("No. Transaksi", invoice.invoiceId, w),
    lineFeed(),
    twoColumnRow("Tanggal", formatTanggalShort(invoice.tanggalPemesanan), w),
    lineFeed(),
    twoColumnRow("Waktu", formatWaktu(invoice.tanggalPemesanan), w),
    lineFeed(),
  );
  if (invoice.owner) {
    push(twoColumnRow("Pelanggan", invoice.owner, w), lineFeed());
  }

  // Item header (no SUBTOTAL column)
  push(
    separator(w, "-"),
    lineFeed(),
    bold(true),
    text("PESANAN"),
    lineFeed(),
    bold(false),
    separator(w, "-"),
    lineFeed(),
  );

  // Items — name + qty only, no prices
  for (const item of invoice.items) {
    const name = itemName(item);
    push(
      bold(true),
      text(name),
      lineFeed(),
      bold(false),
      text(`  x${item.qty}`),
      lineFeed(),
    );
  }

  // Simple footer
  push(
    separator(w, "-"),
    lineFeed(),
    textAlign("center"),
    text(`Total item: ${invoice.totalQty}`),
    lineFeed(),
  );

  push(feedAndCut(4));

  return concat(...parts);
}

// ── Kasir receipt (full) ────────────────────────────────

function buildKasirReceipt(
  invoice: Invoice,
  paperSize: PaperSize,
  store: StoreProfile,
): Uint8Array {
  const w = CHAR_WIDTH[paperSize];
  const parts: Uint8Array[] = [];

  const push = (...items: Uint8Array[]) => {
    for (const item of items) parts.push(item);
  };

  push(initialize());

  // Header
  push(...buildHeader(store, "kasir"));

  // Transaction info
  push(
    separator(w, "-"),
    lineFeed(),
    twoColumnRow("No. Transaksi", invoice.invoiceId, w),
    lineFeed(),
    twoColumnRow("Tanggal", formatTanggalShort(invoice.tanggalPemesanan), w),
    lineFeed(),
    twoColumnRow("Waktu", formatWaktu(invoice.tanggalPemesanan), w),
    lineFeed(),
  );
  if (invoice.owner) {
    push(twoColumnRow("Pelanggan", invoice.owner, w), lineFeed());
  }

  // Item header
  push(
    separator(w, "-"),
    lineFeed(),
    bold(true),
    twoColumnRow("ITEM", "SUBTOTAL", w),
    lineFeed(),
    bold(false),
    separator(w, "-"),
    lineFeed(),
  );

  // Items with prices
  for (const item of invoice.items) {
    const name = itemName(item);

    push(bold(true), text(name), lineFeed(), bold(false));

    const qtyLine = `  ${item.qty} x ${rupiahStr(Number(item.hargaSatuan))}`;
    const subtotalStr = rupiahStr(Number(item.hargaTotal));
    push(twoColumnRow(qtyLine, subtotalStr, w), lineFeed());
  }

  // Subtotal & discount
  const subtotal = invoice.items.reduce(
    (sum, it) => sum + Number(it.hargaTotal || 0),
    0,
  );
  const discount = invoice.discountPrice ?? 0;
  const total = invoice.totalHarga - discount;

  push(
    separator(w, "-"),
    lineFeed(),
    twoColumnRow("Subtotal", rupiahStr(subtotal), w),
    lineFeed(),
  );

  if (discount > 0) {
    push(twoColumnRow("Diskon", `-${rupiahStr(discount)}`, w), lineFeed());
  }

  // Total
  push(
    separator(w, "="),
    lineFeed(),
    bold(true),
    doubleSize(true),
    twoColumnRow("TOTAL", rupiahStr(total), w),
    lineFeed(),
    doubleSize(false),
    bold(false),
    separator(w, "="),
    lineFeed(),
  );

  // Payment info
  push(twoColumnRow("Metode", invoice.pembayaran || "-", w), lineFeed());

  if (
    invoice.pembayaran === "Cash" &&
    invoice.uangDiterima != null &&
    invoice.uangDiterima > 0
  ) {
    push(twoColumnRow("Dibayar", rupiahStr(invoice.uangDiterima), w), lineFeed());
    const kembalian = invoice.kembalian ?? 0;
    const kembalianStr =
      kembalian >= 0
        ? rupiahStr(kembalian)
        : `Kurang ${rupiahStr(Math.abs(kembalian))}`;
    push(twoColumnRow("Kembalian", kembalianStr, w), lineFeed());
  }

  // Footer
  push(
    separator(w, "-"),
    lineFeed(),
    textAlign("center"),
    bold(true),
    text("Terima kasih sudah mampir!"),
    lineFeed(),
    bold(false),
    text("Semoga harimu selezat ayamnya :)"),
    lineFeed(),
    text("Simpan struk ini sebagai bukti pembelian"),
    lineFeed(),
  );

  push(feedAndCut(4));

  return concat(...parts);
}

// ── Public API ──────────────────────────────────────────

export function buildReceiptBytes(
  invoice: Invoice,
  paperSize: PaperSize,
  store?: StoreProfile,
  slotId?: PrinterSlotId,
): Uint8Array {
  const profile: StoreProfile = store ?? {
    namaToko: "TERAS FRIED CHICKEN",
    tagline: "Ayam Goreng & Geprek Spesial",
    alamat: "",
    instagram: "",
    whatsapp: "",
    email: "",
    usernameWifi: "",
    passwordWifi: "",
  };

  if (slotId === "dapur") {
    return buildKitchenReceipt(invoice, paperSize, profile, slotId);
  }

  return buildKasirReceipt(invoice, paperSize, profile);
}
