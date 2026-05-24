"use client";

import { useCallback } from "react";

export type PrintMode = "invoice-a4" | "receipt-58mm" | "receipt-80mm";

const PAGE_RULES: Record<PrintMode, string> = {
  "invoice-a4": "@page { size: A4; margin: 15mm; }",
  "receipt-58mm": "@page { size: 58mm auto; margin: 0mm 2mm; }",
  "receipt-80mm": "@page { size: 80mm auto; margin: 0mm 3mm; }",
};

const STYLE_ID = "dynamic-print-page-style";

function cleanup() {
  document.documentElement.removeAttribute("data-print-mode");
  document.getElementById(STYLE_ID)?.remove();
}

export function usePrintMode() {
  const print = useCallback((mode: PrintMode) => {
    // Remove any leftover from a previous print
    cleanup();

    // Set data attribute for CSS visibility toggle
    document.documentElement.setAttribute("data-print-mode", mode);

    // Inject dynamic @page rule
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = PAGE_RULES[mode];
    document.head.appendChild(style);

    // Cleanup after print (or on cancel)
    const onAfterPrint = () => {
      cleanup();
      window.removeEventListener("afterprint", onAfterPrint);
    };
    window.addEventListener("afterprint", onAfterPrint);

    // Fallback for iOS Safari which doesn't fire afterprint reliably
    setTimeout(() => {
      cleanup();
      window.removeEventListener("afterprint", onAfterPrint);
    }, 5000);

    window.print();
  }, []);

  return { print };
}
