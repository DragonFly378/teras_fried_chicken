"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Invoice } from "@/app/(dashboard)/history/partials/InvoiceModal";
import type { PaperSize } from "@/hooks/usePaperSize";
import type { StoreProfile } from "@/hooks/useStoreProfile";
import type { PrinterStatus, SavedDevice, PrinterConnection, PrinterSlotId } from "@/lib/bluetooth/types";
import {
  isBluetoothSupported,
  scanAndConnect,
  reconnect,
  disconnect as bleDisconnect,
  writeChunked,
} from "@/lib/bluetooth/ble-printer";
import { buildReceiptBytes } from "@/lib/bluetooth/receipt-builder";

// ── Module-level connection pool ────────────────────────
// Keeps BLE connections alive across component mount/unmount cycles.
// Hook instances for the same slot reuse the existing connection.
const activeConnections = new Map<string, PrinterConnection>();

function connKey(slotId?: PrinterSlotId): string {
  return slotId ?? "__default__";
}

function storageKey(slotId?: PrinterSlotId): string {
  return slotId ? `tfc_bt_printer_${slotId}` : "tfc_bt_printer";
}

function loadSavedDevice(slotId?: PrinterSlotId): SavedDevice | null {
  try {
    const stored = localStorage.getItem(storageKey(slotId));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function savePrinterDevice(device: SavedDevice, slotId?: PrinterSlotId): void {
  try {
    localStorage.setItem(storageKey(slotId), JSON.stringify(device));
  } catch {
    // localStorage unavailable
  }
}

function removeSavedDevice(slotId?: PrinterSlotId): void {
  try {
    localStorage.removeItem(storageKey(slotId));
  } catch {
    // localStorage unavailable
  }
}

export function useBluetoothPrinter(slotId?: PrinterSlotId) {
  const key = connKey(slotId);
  const mountedRef = useRef(true);

  // Initialize from active connection pool
  const [status, setStatus] = useState<PrinterStatus>(() => {
    if (typeof window === "undefined") return "disconnected";
    if (!isBluetoothSupported()) return "unsupported";
    const existing = activeConnections.get(key);
    if (existing?.server.connected) return "ready";
    return "disconnected";
  });

  const [deviceName, setDeviceName] = useState<string | null>(() => {
    const existing = activeConnections.get(key);
    if (existing?.server.connected) return existing.device.name ?? "Printer";
    return null;
  });

  const [error, setError] = useState<string | null>(null);
  const connRef = useRef<PrinterConnection | null>(
    activeConnections.get(key) ?? null,
  );
  const reconnectingRef = useRef(false);

  const isSupported = typeof window !== "undefined" && isBluetoothSupported();

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Set unsupported on mount
  useEffect(() => {
    if (!isSupported) {
      setStatus("unsupported");
    }
  }, [isSupported]);

  // Device disconnected event handler
  const handleDisconnect = useCallback(() => {
    activeConnections.delete(key);
    if (!mountedRef.current) return;
    connRef.current = null;
    setStatus("disconnected");
    setDeviceName(null);
  }, [key]);

  // Attach disconnect listener to active connection on mount,
  // detach on unmount (without killing the connection)
  useEffect(() => {
    const conn = activeConnections.get(key);
    if (conn?.server.connected) {
      connRef.current = conn;
      conn.device.addEventListener("gattserverdisconnected", handleDisconnect);
    }
    return () => {
      // Only remove listener — do NOT disconnect.
      // The connection stays alive in activeConnections.
      if (connRef.current) {
        connRef.current.device.removeEventListener(
          "gattserverdisconnected",
          handleDisconnect,
        );
      }
    };
  }, [key, handleDisconnect]);

  // Auto-reconnect on mount — only if no active connection
  useEffect(() => {
    if (!isSupported || reconnectingRef.current) return;

    // Already connected via pool
    if (activeConnections.get(key)?.server.connected) return;

    const saved = loadSavedDevice(slotId);
    if (!saved) return;

    reconnectingRef.current = true;
    setStatus("connecting");
    setDeviceName(saved.name);

    reconnect(saved)
      .then((conn) => {
        if (!mountedRef.current) {
          // Component unmounted during reconnect — keep connection in pool
          if (conn) {
            activeConnections.set(key, conn);
            conn.device.addEventListener("gattserverdisconnected", () => {
              activeConnections.delete(key);
            });
          }
          return;
        }

        if (conn) {
          connRef.current = conn;
          activeConnections.set(key, conn);
          setStatus("ready");
          setDeviceName(conn.device.name ?? saved.name);
          conn.device.addEventListener(
            "gattserverdisconnected",
            handleDisconnect,
          );
        } else {
          setStatus("disconnected");
          setDeviceName(null);
        }
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setStatus("disconnected");
        setDeviceName(null);
      })
      .finally(() => {
        reconnectingRef.current = false;
      });
  }, [isSupported, handleDisconnect, slotId, key]);

  // Connect — shows browser scan dialog
  const connect = useCallback(async () => {
    if (!isSupported) return;

    setStatus("scanning");
    setError(null);

    try {
      const conn = await scanAndConnect();
      connRef.current = conn;
      activeConnections.set(key, conn);

      const name = conn.device.name ?? "Printer";
      setDeviceName(name);
      setStatus("ready");

      savePrinterDevice(
        {
          id: conn.device.id,
          name,
          serviceUUID: conn.serviceUUID,
          characteristicUUID: conn.characteristicUUID,
        },
        slotId,
      );

      conn.device.addEventListener(
        "gattserverdisconnected",
        handleDisconnect,
      );
    } catch (err) {
      // User cancelled scan dialog — not an error
      if (err instanceof DOMException && err.name === "NotFoundError") {
        setStatus("disconnected");
        return;
      }
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Gagal menghubungkan printer",
      );
    }
  }, [isSupported, handleDisconnect, slotId, key]);

  // Disconnect — explicit user action
  const disconnectPrinter = useCallback(() => {
    if (connRef.current) {
      connRef.current.device.removeEventListener(
        "gattserverdisconnected",
        handleDisconnect,
      );
      bleDisconnect(connRef.current);
      connRef.current = null;
    }
    activeConnections.delete(key);
    setStatus("disconnected");
    setDeviceName(null);
    setError(null);
    removeSavedDevice(slotId);
  }, [handleDisconnect, slotId, key]);

  // Print receipt
  const printReceipt = useCallback(
    async (invoice: Invoice, paperSize: PaperSize, store?: StoreProfile) => {
      const conn = connRef.current;
      if (!conn) {
        setError("Printer belum terhubung");
        setStatus("error");
        return;
      }

      setStatus("printing");
      setError(null);

      try {
        const bytes = buildReceiptBytes(invoice, paperSize, store, slotId);
        await writeChunked(conn.characteristic, bytes);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Gagal mencetak struk",
        );
      }
    },
    [slotId],
  );

  return {
    status,
    deviceName,
    error,
    connect,
    disconnect: disconnectPrinter,
    printReceipt,
    isSupported,
    isReady: status === "ready",
    isPrinting: status === "printing",
  };
}
