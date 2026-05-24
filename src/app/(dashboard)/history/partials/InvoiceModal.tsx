"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Printer,
  Loader2,
  ReceiptText,
  Bluetooth,
  BluetoothOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/pos-menu";
import { usePrintMode } from "@/hooks/usePrintMode";
import { usePaperSize } from "@/hooks/usePaperSize";
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { ReceiptTemplate } from "./ReceiptTemplate";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { PRINTER_SLOTS, type PrinterSlotId } from "@/lib/bluetooth/types";

// ── Types ───────────────────────────────────────────────
interface InvoiceItem {
  pesanan: string;
  jenis: string;
  size: string;
  qty: number;
  hargaSatuan: number;
  hargaTotal: number;
}

export interface Invoice {
  invoiceId: string;
  tanggalPemesanan: string;
  bulan: string;
  pembayaran: string;
  status: string;
  owner: string;
  deliver: string;
  notes: string;
  items: InvoiceItem[];
  totalQty: number;
  totalHarga: number;
  totalModal: number;
  totalMargin: number;
  discountPrice?: number;
  uangDiterima?: number;
  kembalian?: number;
}

interface InvoiceModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Helpers ─────────────────────────────────────────────
function formatTanggalPanjang(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── BT Print Section (per-slot, remounts via key) ───────
function BtPrintSection({
  slotId,
  invoice,
}: {
  slotId: PrinterSlotId;
  invoice: Invoice;
}) {
  const bt = useBluetoothPrinter(slotId);
  const { paperSize } = usePaperSize(slotId);
  const { profile } = useStoreProfile();

  const handleBtPrint = async () => {
    await bt.printReceipt(invoice, paperSize, profile);
  };

  const dotColor =
    bt.status === "ready"
      ? "bg-emerald-500"
      : bt.status === "error"
        ? "bg-red-500"
        : "bg-slate-400";

  if (!bt.isSupported) return null;

  // `contents` makes children direct flex items of the parent
  return (
    <div className="contents">
      {/* Inline status badge — sits in the settings flex row */}
      {bt.status === "disconnected" && (
        <button
          type="button"
          onClick={bt.connect}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 font-body text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          <Bluetooth className="w-3.5 h-3.5" />
          Hubungkan
        </button>
      )}
      {(bt.status === "scanning" || bt.status === "connecting") && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 font-body text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Connecting...
        </span>
      )}
      {(bt.status === "ready" || bt.status === "error") && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <span className="font-body text-xs text-emerald-700 font-semibold truncate max-w-[120px]">
            {bt.deviceName ?? "Printer"}
          </span>
          <button
            type="button"
            onClick={bt.disconnect}
            className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
            aria-label="Putuskan printer Bluetooth"
          >
            <BluetoothOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {bt.error && (
        <span className="font-body text-[11px] text-red-500 w-full">
          {bt.error}
        </span>
      )}

      {/* Full-width BT button — forces new line in flex-wrap parent */}
      {(bt.status === "ready" || bt.status === "error") && (
        <button
          type="button"
          onClick={handleBtPrint}
          disabled={bt.isPrinting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-body text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {bt.isPrinting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mencetak...
            </>
          ) : (
            <>
              <Bluetooth className="w-4 h-4" />
              Cetak Resi (BT)
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Invoice Template (reusable, no id) ──────────────────
function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.items.reduce(
    (sum, it) => sum + Number(it.hargaTotal || 0),
    0,
  );

  return (
    <div className="bg-white p-5 sm:p-8">
      {/* Header: Logo + Brand + Invoice ID */}
      <div className="pb-4 sm:pb-5 border-b-2 border-tfc-brown">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 relative shrink-0 rounded overflow-hidden">
            <Image
              src="/images/logo_bg.svg"
              alt="Teras Fried Chicken"
              fill
              sizes="56px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-body text-base sm:text-xl font-bold text-tfc-brown leading-tight">
              Teras Fried Chicken
            </h2>
            <p className="font-body text-[10px] sm:text-[11px] text-tfc-muted mt-0.5">
              Ayam Goreng & Geprek Spesial
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-body text-[10px] text-tfc-muted">
            bagi.to/terasfc
          </p>
          <p className="font-mono text-[11px] sm:text-xs font-bold text-tfc-brown">
            {invoice.invoiceId}
          </p>
        </div>
      </div>

      {/* Meta: 2x2 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-b border-tfc-brown/10">
        <div>
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Pelanggan
          </p>
          <p className="font-body text-sm font-bold text-tfc-brown mt-0.5">
            {invoice.owner || "-"}
          </p>
          {invoice.deliver && (
            <p className="font-body text-[10px] text-tfc-muted mt-0.5">
              Pengantaran: {invoice.deliver}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Tanggal
          </p>
          <p className="font-body text-sm font-semibold text-tfc-brown mt-0.5">
            {formatTanggalPanjang(invoice.tanggalPemesanan)}
          </p>
        </div>
        <div>
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Pembayaran
          </p>
          <p className="font-body text-sm font-semibold text-tfc-brown mt-0.5">
            {invoice.pembayaran || "-"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Status
          </p>
          <p className="font-body text-sm font-semibold text-emerald-600 mt-0.5">
            {invoice.status || "Pending"}
          </p>
        </div>
      </div>

      {/* Items — card layout on mobile, table on desktop */}
      <div className="py-4">
        {/* Desktop table */}
        <table className="w-full text-left hidden sm:table">
          <thead>
            <tr className="border-b border-tfc-brown/15">
              <th className="pb-2 font-body text-[10px] text-tfc-muted uppercase tracking-wider font-semibold">
                Produk
              </th>
              <th className="pb-2 font-body text-[10px] text-tfc-muted uppercase tracking-wider font-semibold text-center w-12">
                Qty
              </th>
              <th className="pb-2 font-body text-[10px] text-tfc-muted uppercase tracking-wider font-semibold text-right w-24">
                Harga
              </th>
              <th className="pb-2 font-body text-[10px] text-tfc-muted uppercase tracking-wider font-semibold text-right w-28">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-tfc-brown/5 last:border-0">
                <td className="py-2.5">
                  <p className="font-body text-xs font-semibold text-tfc-brown">
                    {item.pesanan}
                  </p>
                  <p className="font-body text-[10px] text-tfc-muted mt-0.5">
                    {[item.jenis, item.size]
                      .filter((x) => x && x !== "-")
                      .join(" · ") || "-"}
                  </p>
                </td>
                <td className="py-2.5 font-body text-xs text-tfc-brown text-center">
                  {item.qty}
                </td>
                <td className="py-2.5 font-body text-xs text-tfc-brown text-right whitespace-nowrap">
                  {formatRupiah(Number(item.hargaSatuan))}
                </td>
                <td className="py-2.5 font-body text-xs font-semibold text-tfc-brown text-right whitespace-nowrap">
                  {formatRupiah(Number(item.hargaTotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-0 divide-y divide-tfc-brown/8">
          {invoice.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-tfc-brown leading-tight">
                  {item.pesanan}
                </p>
                <p className="font-body text-xs text-tfc-muted mt-0.5">
                  {item.qty} x {formatRupiah(Number(item.hargaSatuan))}
                </p>
              </div>
              <p className="font-body text-sm font-bold text-tfc-brown whitespace-nowrap">
                {formatRupiah(Number(item.hargaTotal))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t-2 border-tfc-brown space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-tfc-muted">
            Subtotal ({invoice.totalQty} produk)
          </span>
          <span className="font-body text-sm text-tfc-brown">
            {formatRupiah(subtotal)}
          </span>
        </div>
        {(invoice.discountPrice ?? 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-tfc-muted">
              Diskon
            </span>
            <span className="font-body text-sm font-semibold text-emerald-600">
              -{formatRupiah(invoice.discountPrice!)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-tfc-brown/10">
          <span className="font-body text-base font-bold text-tfc-brown">
            Total
          </span>
          <span className="font-body text-xl font-bold text-tfc-brown">
            {formatRupiah(invoice.totalHarga - (invoice.discountPrice ?? 0))}
          </span>
        </div>
        {invoice.pembayaran === "Cash" &&
          invoice.uangDiterima != null &&
          invoice.uangDiterima > 0 && (
            <>
              <div className="flex items-center justify-between pt-2 border-t border-tfc-brown/10">
                <span className="font-body text-xs text-tfc-muted">
                  Uang Diterima
                </span>
                <span className="font-body text-sm text-tfc-brown">
                  {formatRupiah(invoice.uangDiterima)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs font-semibold text-tfc-brown">
                  Kembalian
                </span>
                <span
                  className={`font-body text-sm font-semibold ${
                    (invoice.kembalian ?? 0) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {(invoice.kembalian ?? 0) >= 0
                    ? formatRupiah(invoice.kembalian ?? 0)
                    : `Kurang ${formatRupiah(Math.abs(invoice.kembalian ?? 0))}`}
                </span>
              </div>
            </>
          )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-4 pt-3 border-t border-dashed border-tfc-brown/15">
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Catatan
          </p>
          <p className="font-body text-[11px] text-tfc-brown mt-0.5">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Footer — thank you */}
      <div className="mt-6 pt-4 border-t border-tfc-brown/10 text-center">
        <p className="font-body text-xs font-semibold text-tfc-brown">
          Terima kasih atas pesanan Anda!
        </p>
        <p className="font-body text-[10px] text-tfc-muted mt-0.5">
          Invoice ini di-generate otomatis oleh sistem Teras Fried Chicken.
        </p>
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────
export function InvoiceModal({
  invoice,
  open,
  onOpenChange,
}: InvoiceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PrinterSlotId>("kasir");
  const { print } = usePrintMode();
  const { paperSize, setPaperSize } = usePaperSize();
  const { profile } = useStoreProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrintInvoice = () => {
    print("invoice-a4");
  };

  const handlePrintReceipt = () => {
    print(paperSize === "58mm" ? "receipt-58mm" : "receipt-80mm");
  };

  if (!invoice) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-2xl">
          <DialogTitle className="sr-only">
            Invoice {invoice.invoiceId}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detail invoice untuk {invoice.owner}
          </DialogDescription>

          <div className="overflow-y-auto max-h-[95vh]">
            <InvoiceTemplate invoice={invoice} />

            {/* Action bar */}
            <div className="px-4 sm:px-8 py-4 bg-tfc-surface/40 border-t border-tfc-brown/10 space-y-3">
              {/* Row 1: Settings + BT status (inline) + BT button (full-width wrap) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Paper size toggle */}
                <div className="flex rounded-lg overflow-hidden border border-tfc-brown/15">
                  <button
                    type="button"
                    onClick={() => setPaperSize("58mm")}
                    className={`px-3 py-1.5 text-[11px] font-body font-semibold transition-colors ${
                      paperSize === "58mm"
                        ? "bg-tfc-brown text-white"
                        : "bg-white text-tfc-brown hover:bg-tfc-surface"
                    }`}
                  >
                    58mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperSize("80mm")}
                    className={`px-3 py-1.5 text-[11px] font-body font-semibold transition-colors ${
                      paperSize === "80mm"
                        ? "bg-tfc-brown text-white"
                        : "bg-white text-tfc-brown hover:bg-tfc-surface"
                    }`}
                  >
                    80mm
                  </button>
                </div>

                {/* Slot dropdown */}
                <Select
                  value={selectedSlot}
                  onValueChange={(v) => setSelectedSlot(v as PrinterSlotId)}
                >
                  <SelectTrigger
                    className="w-[100px] h-8 font-body text-xs font-semibold border-tfc-brown/15"
                    aria-label="Pilih printer slot"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRINTER_SLOTS.map((slot) => (
                      <SelectItem
                        key={slot.id}
                        value={slot.id}
                        className="font-body text-xs"
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="ml-auto" />

                {/* BT: status inline + full-width button wraps below */}
                <BtPrintSection
                  key={selectedSlot}
                  slotId={selectedSlot}
                  invoice={invoice}
                />
              </div>

              {/* Row 2: Browser print buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="bg-tfc-brown text-white hover:bg-tfc-brown/90 font-body font-semibold h-10 text-sm"
                >
                  <ReceiptText className="w-4 h-4 mr-1.5" />
                  Cetak Resi
                </Button>
                <Button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="bg-white text-tfc-brown border border-tfc-brown/20 hover:bg-tfc-surface font-body font-semibold h-10 text-sm"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Cetak Invoice
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only portals */}
      {mounted &&
        open &&
        createPortal(
          <div id="invoice-print">
            <InvoiceTemplate invoice={invoice} />
          </div>,
          document.body,
        )}
      {mounted &&
        open &&
        createPortal(
          <div id="receipt-print">
            <ReceiptTemplate
              invoice={invoice}
              paperSize={paperSize}
              store={profile}
              slotId={selectedSlot}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
