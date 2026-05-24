import type { Invoice } from "./InvoiceModal";
import type { PaperSize } from "@/hooks/usePaperSize";
import type { StoreProfile } from "@/hooks/useStoreProfile";
import type { PrinterSlotId } from "@/lib/bluetooth/types";
import { formatRupiah } from "@/lib/pos-menu";

// ── Helpers ──────────────────────────────────────────────
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
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";
}

function itemName(item: { pesanan: string; jenis: string; size: string }): string {
  const parts = [item.pesanan];
  if (item.jenis && item.jenis !== "-") parts.push(item.jenis);
  if (item.size && item.size !== "-") parts.push(item.size);
  return parts.join(" - ");
}

// ── Component ────────────────────────────────────────────
interface ReceiptTemplateProps {
  invoice: Invoice;
  paperSize: PaperSize;
  store?: StoreProfile;
  slotId?: PrinterSlotId;
}

export function ReceiptTemplate({ invoice, paperSize, store, slotId }: ReceiptTemplateProps) {
  const is58 = paperSize === "58mm";
  const fontSize = is58 ? "text-xs" : "text-sm";
  const isKitchen = slotId === "dapur";
  const row = "flex justify-between gap-2";

  const subtotal = invoice.items.reduce(
    (sum, it) => sum + Number(it.hargaTotal || 0),
    0,
  );
  const discount = invoice.discountPrice ?? 0;
  const total = invoice.totalHarga - discount;

  return (
    <div className={`w-full font-body ${fontSize} text-black leading-normal px-3`}>
      {/* ── Header ── */}
      <div className="text-center pt-2 pb-3">
        {(store?.namaToko || "TERAS FRIED CHICKEN").split("\n").map((line, i) => (
          <p key={i} className={`font-bold ${is58 ? "text-base" : "text-xl"}`}>
            {line.trim()}
          </p>
        ))}
        {store?.tagline && (
          <p className={`italic ${is58 ? "text-[10px]" : "text-xs"}`}>
            {store.tagline}
          </p>
        )}
        {store?.alamat && (
          <p className={is58 ? "text-[10px]" : "text-xs"}>{store.alamat}</p>
        )}
        {/* Kasir: show IG + wifi */}
        {!isKitchen && (
          <>
            {store?.instagram && (
              <p className={is58 ? "text-[10px]" : "text-xs"}>
                IG: @{store.instagram.replace(/^@/, "")}
              </p>
            )}
            {(store?.usernameWifi || store?.passwordWifi) && (
              <p className={is58 ? "text-[10px]" : "text-xs"}>
                {[
                  store.usernameWifi ? `Wifi: ${store.usernameWifi}` : "",
                  store.passwordWifi ? `Pass: ${store.passwordWifi}` : "",
                ].filter(Boolean).join(" | ")}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Transaction info ── */}
      <div className="border-t border-dashed border-black pt-1.5 pb-1.5 space-y-0.5">
        <div className={row}>
          <span>No. Transaksi</span>
          <span className="font-semibold text-right">{invoice.invoiceId}</span>
        </div>
        <div className={row}>
          <span>Tanggal</span>
          <span className="text-right">{formatTanggalShort(invoice.tanggalPemesanan)}</span>
        </div>
        <div className={row}>
          <span>Waktu</span>
          <span className="text-right">{formatWaktu(invoice.tanggalPemesanan)}</span>
        </div>
        {invoice.owner && (
          <div className={row}>
            <span>Pelanggan</span>
            <span className="text-right">{invoice.owner}</span>
          </div>
        )}
      </div>

      {isKitchen ? (
        <>
          {/* ── Kitchen: Items without prices ── */}
          <div className="border-t border-dashed border-black pt-1.5">
            <p className="font-bold">PESANAN</p>
          </div>
          <div className="border-t border-dashed border-black pt-1.5 pb-1 space-y-2">
            {invoice.items.map((item, i) => (
              <div key={i}>
                <p className="font-semibold">{itemName(item)}</p>
                <p className="pl-2">x{item.qty}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-black pt-1.5 pb-1.5 text-center">
            <p>Total item: {invoice.totalQty}</p>
          </div>
          {/* ── Cut line ── */}
          <div className="border-t border-dashed border-black" />
          <div className={`py-2 text-center ${is58 ? "text-[9px]" : "text-[10px]"}`}>
            <p>potong di sini</p>
          </div>
        </>
      ) : (
        <>
          {/* ── Kasir: Full receipt ── */}
          {/* Item header */}
          <div className="border-t border-dashed border-black pt-1.5">
            <div className={`${row} font-bold`}>
              <span>ITEM</span>
              <span>SUBTOTAL</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-black pt-1.5 pb-1 space-y-2">
            {invoice.items.map((item, i) => (
              <div key={i}>
                <p className="font-semibold">{itemName(item)}</p>
                <div className={`${row} pl-2`}>
                  <span>
                    {item.qty} x {formatRupiah(Number(item.hargaSatuan))}
                  </span>
                  <span className="whitespace-nowrap text-right">
                    {formatRupiah(Number(item.hargaTotal))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Diskon */}
          <div className="border-t border-dashed border-black pt-1.5 space-y-0.5">
            <div className={row}>
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className={row}>
                <span>Diskon</span>
                <span>- {formatRupiah(discount)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-y-2 border-black mt-2 py-2">
            <div className={`${row} font-bold ${is58 ? "text-base" : "text-lg"}`}>
              <span>TOTAL</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="border-b border-dashed border-black pt-1.5 pb-1.5 space-y-0.5">
            <div className={row}>
              <span>Metode</span>
              <span>{invoice.pembayaran || "-"}</span>
            </div>
            {invoice.pembayaran === "Cash" &&
              invoice.uangDiterima != null &&
              invoice.uangDiterima > 0 && (
                <>
                  <div className={row}>
                    <span>Dibayar</span>
                    <span>{formatRupiah(invoice.uangDiterima)}</span>
                  </div>
                  <div className={row}>
                    <span>Kembalian</span>
                    <span>
                      {(invoice.kembalian ?? 0) >= 0
                        ? formatRupiah(invoice.kembalian ?? 0)
                        : `Kurang ${formatRupiah(Math.abs(invoice.kembalian ?? 0))}`}
                    </span>
                  </div>
                </>
              )}
          </div>

          {/* Footer */}
          <div className="border-b border-dashed border-black pt-3 pb-3 text-center space-y-1">
            <p className="font-bold">Terima kasih sudah mampir!</p>
            <p className={`italic ${is58 ? "text-[10px]" : "text-xs"}`}>
              Semoga harimu selezat ayamnya :)
            </p>
            <p className={`mt-1 ${is58 ? "text-[9px]" : "text-[10px]"}`}>
              Simpan struk ini sebagai bukti pembelian
            </p>
          </div>

          {/* Cut line */}
          <div className={`py-2 text-center ${is58 ? "text-[9px]" : "text-[10px]"}`}>
            <p>potong di sini</p>
          </div>
        </>
      )}
    </div>
  );
}
