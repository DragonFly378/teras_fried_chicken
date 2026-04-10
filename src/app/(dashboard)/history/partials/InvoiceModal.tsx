"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/pos-menu";

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

// ── Invoice Template ────────────────────────────────────
function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.items.reduce(
    (sum, it) => sum + Number(it.hargaTotal || 0),
    0,
  );

  return (
    <div className="bg-white p-6 sm:p-8">
      {/* Header: Logo + Brand */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b-2 border-tfc-brown">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 relative shrink-0 rounded overflow-hidden">
            <Image
              src="/images/logo_bg.svg"
              alt="Teras Fried Chicken"
              fill
              sizes="56px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="font-body text-xl font-bold text-tfc-brown leading-tight">
              Teras Fried Chicken
            </h2>
            <p className="font-body text-[11px] text-tfc-muted mt-0.5">
              Ayam Goreng & Geprek Spesial
            </p>
            <p className="font-body text-[10px] text-tfc-muted">
              bagi.to/terasfc
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
            Invoice
          </p>
          <p className="font-mono text-xs font-bold text-tfc-brown mt-0.5">
            {invoice.invoiceId}
          </p>
        </div>
      </div>

      {/* Meta: Invoice info + Customer info */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-tfc-brown/10">
        <div>
          <p className="font-body text-[10px] text-tfc-muted uppercase tracking-wider mb-1">
            Ditagih kepada
          </p>
          <p className="font-body text-sm font-bold text-tfc-brown">
            {invoice.owner || "-"}
          </p>
          {invoice.deliver && (
            <p className="font-body text-[11px] text-tfc-muted mt-0.5">
              Pengantaran: {invoice.deliver}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="mb-1.5">
            <span className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
              Tanggal
            </span>
            <p className="font-body text-xs font-semibold text-tfc-brown">
              {formatTanggalPanjang(invoice.tanggalPemesanan)}
            </p>
          </div>
          <div className="mb-1.5">
            <span className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
              Pembayaran
            </span>
            <p className="font-body text-xs font-semibold text-tfc-brown">
              {invoice.pembayaran || "-"}
            </p>
          </div>
          <div>
            <span className="font-body text-[10px] text-tfc-muted uppercase tracking-wider">
              Status
            </span>
            <p className="font-body text-xs font-semibold text-emerald-600">
              {invoice.status || "Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="py-4">
        <table className="w-full text-left">
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
      </div>

      {/* Total */}
      <div className="pt-2 border-t-2 border-tfc-brown space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-tfc-muted">
            Subtotal ({invoice.totalQty} produk)
          </span>
          <span className="font-body text-xs text-tfc-brown">
            {formatRupiah(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-tfc-brown/10">
          <span className="font-body text-sm font-bold text-tfc-brown">
            Total
          </span>
          <span className="font-body text-lg font-bold text-tfc-brown">
            {formatRupiah(invoice.totalHarga)}
          </span>
        </div>
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
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          title="Tutup"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-tfc-surface text-tfc-muted hover:text-tfc-brown flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[95vh]">
          <div id="invoice-print">
            <InvoiceTemplate invoice={invoice} />
          </div>

          {/* Action buttons */}
          <div className="px-6 sm:px-8 py-4 bg-tfc-surface/40 border-t border-tfc-brown/10 flex items-center justify-end gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-white text-tfc-brown border border-tfc-brown/20 hover:bg-tfc-surface font-body font-semibold h-9 text-sm"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-tfc-brown text-white hover:bg-tfc-brown/90 font-body font-semibold h-9 text-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
