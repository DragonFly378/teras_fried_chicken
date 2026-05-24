import type { PrinterConnection, SavedDevice } from "./types";

// Known BLE service UUIDs for generic thermal printers
const KNOWN_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb", // 0x18F0
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Nordic UART variant
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Alt Chinese printers
  "0000ff00-0000-1000-8000-00805f9b34fb", // 0xFF00
];

// ── Support check ───────────────────────────────────────

export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

// ── Scan & connect ──────────────────────────────────────

export async function scanAndConnect(): Promise<PrinterConnection> {
  const device = await navigator.bluetooth.requestDevice({
    filters: KNOWN_SERVICES.map((uuid) => ({ services: [uuid] })),
    optionalServices: KNOWN_SERVICES,
  });

  return connectToDevice(device);
}

// ── Reconnect saved device ──────────────────────────────

export async function reconnect(
  saved: SavedDevice,
): Promise<PrinterConnection | null> {
  if (!isBluetoothSupported()) return null;

  try {
    // getDevices() returns previously-paired devices without showing picker
    const devices = await navigator.bluetooth.getDevices();
    const device = devices.find((d) => d.id === saved.id);
    if (!device) return null;

    return await connectToDevice(device);
  } catch {
    return null;
  }
}

// ── Disconnect ──────────────────────────────────────────

export function disconnect(conn: PrinterConnection): void {
  try {
    conn.server.disconnect();
  } catch {
    // Already disconnected
  }
}

// ── Chunked write ───────────────────────────────────────

export async function writeChunked(
  char: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array,
  chunkSize = 100,
  delayMs = 20,
): Promise<void> {
  const useWithoutResponse =
    char.properties.writeWithoutResponse;

  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);

    if (useWithoutResponse) {
      await char.writeValueWithoutResponse(chunk);
    } else {
      await char.writeValueWithResponse(chunk);
    }

    // Delay between chunks to prevent BLE buffer overflow
    if (offset + chunkSize < data.length) {
      await sleep(delayMs);
    }
  }
}

// ── Internal helpers ────────────────────────────────────

async function connectToDevice(
  device: BluetoothDevice,
): Promise<PrinterConnection> {
  if (!device.gatt) {
    throw new Error("GATT tidak tersedia pada perangkat ini");
  }

  const server = await device.gatt.connect();

  // Try each known service UUID until we find a writable characteristic
  for (const serviceUUID of KNOWN_SERVICES) {
    try {
      const service = await server.getPrimaryService(serviceUUID);
      const characteristics = await service.getCharacteristics();

      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          return {
            device,
            server,
            characteristic: char,
            serviceUUID,
            characteristicUUID: char.uuid,
          };
        }
      }
    } catch {
      // Service not available on this printer, try next
      continue;
    }
  }

  // No writable characteristic found, disconnect
  server.disconnect();
  throw new Error(
    "Tidak ditemukan characteristic yang bisa ditulis. Printer mungkin tidak kompatibel.",
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
