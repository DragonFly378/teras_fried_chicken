"use client";

import { useState, useCallback, useEffect } from "react";
import type { PrinterSlotId } from "@/lib/bluetooth/types";

export type PaperSize = "58mm" | "80mm";

const DEFAULT_SIZE: PaperSize = "80mm";

function storageKey(slotId?: PrinterSlotId): string {
  return slotId ? `tfc_receipt_paper_size_${slotId}` : "tfc_receipt_paper_size";
}

export function usePaperSize(slotId?: PrinterSlotId) {
  const [paperSize, setPaperSizeState] = useState<PaperSize>(DEFAULT_SIZE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(slotId));
      if (stored === "58mm" || stored === "80mm") {
        setPaperSizeState(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, [slotId]);

  const setPaperSize = useCallback((size: PaperSize) => {
    setPaperSizeState(size);
    try {
      localStorage.setItem(storageKey(slotId), size);
    } catch {
      // localStorage unavailable
    }
  }, [slotId]);

  return { paperSize, setPaperSize };
}
