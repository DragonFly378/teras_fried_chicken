"use client";

import { Bluetooth, BluetoothOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { usePaperSize } from "@/hooks/usePaperSize";
import type { PrinterSlotId } from "@/lib/bluetooth/types";

interface PrinterSlotCardProps {
  slotId: PrinterSlotId;
  label: string;
}

export function PrinterSlotCard({ slotId, label }: PrinterSlotCardProps) {
  const bt = useBluetoothPrinter(slotId);
  const { paperSize, setPaperSize } = usePaperSize(slotId);

  const dotColor =
    bt.status === "ready"
      ? "bg-emerald-500"
      : bt.status === "connecting" || bt.status === "scanning"
        ? "bg-amber-500 animate-pulse"
        : bt.status === "error"
          ? "bg-red-500"
          : "bg-slate-400";

  if (!bt.isSupported) {
    return (
      <div className="bg-white rounded-xl border border-tfc-brown/10 p-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
          <span className="font-body text-sm font-bold text-tfc-brown">
            {label}
          </span>
        </div>
        <p className="font-body text-xs text-tfc-muted mt-2">
          Browser tidak mendukung Web Bluetooth
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-tfc-brown/10 p-4">
      {/* Top row: slot label + paper size toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="font-body text-sm font-bold text-tfc-brown">
            {label}
          </span>
        </div>

        {/* Paper size toggle */}
        <div className="flex rounded-lg overflow-hidden border border-tfc-brown/15">
          <button
            type="button"
            onClick={() => setPaperSize("58mm")}
            className={`px-3 py-1 text-[11px] font-body font-semibold transition-colors ${
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
            className={`px-3 py-1 text-[11px] font-body font-semibold transition-colors ${
              paperSize === "80mm"
                ? "bg-tfc-brown text-white"
                : "bg-white text-tfc-brown hover:bg-tfc-surface"
            }`}
          >
            80mm
          </button>
        </div>
      </div>

      {/* Bottom row: device name + action button */}
      <div className="flex items-center justify-between gap-3 mt-2.5">
        <span className="font-body text-xs text-tfc-muted truncate">
          {bt.deviceName ?? "Belum terhubung"}
        </span>

        {bt.status === "disconnected" && (
          <Button
            type="button"
            onClick={bt.connect}
            className="bg-blue-600 text-white hover:bg-blue-700 font-body font-semibold h-8 text-xs px-3"
          >
            <Bluetooth className="w-3.5 h-3.5 mr-1.5" />
            Hubungkan
          </Button>
        )}

        {(bt.status === "scanning" || bt.status === "connecting") && (
          <Button
            type="button"
            disabled
            className="bg-blue-600 text-white font-body font-semibold h-8 text-xs px-3 opacity-80"
          >
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            Menghubungkan...
          </Button>
        )}

        {(bt.status === "ready" || bt.status === "error") && (
          <Button
            type="button"
            onClick={bt.disconnect}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 font-body font-semibold h-8 text-xs px-3"
          >
            <BluetoothOff className="w-3.5 h-3.5 mr-1.5" />
            Putuskan
          </Button>
        )}
      </div>

      {/* Error message */}
      {bt.error && (
        <p className="font-body text-[11px] text-red-500 mt-2">{bt.error}</p>
      )}
    </div>
  );
}
