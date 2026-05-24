export type PrinterSlotId = "dapur" | "kasir";

export const PRINTER_SLOTS: { id: PrinterSlotId; label: string }[] = [
  { id: "dapur", label: "Dapur" },
  { id: "kasir", label: "Kasir" },
];

export type PrinterStatus =
  | "unsupported"
  | "disconnected"
  | "scanning"
  | "connecting"
  | "ready"
  | "printing"
  | "error";

export interface SavedDevice {
  id: string;
  name: string;
  serviceUUID: string;
  characteristicUUID: string;
}

export interface PrinterConnection {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  characteristic: BluetoothRemoteGATTCharacteristic;
  serviceUUID: string;
  characteristicUUID: string;
}
