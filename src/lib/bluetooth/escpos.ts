// ESC/POS command builder — pure byte manipulation
// Reference: ESC/POS Application Programming Guide

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

// ── Printer control ─────────────────────────────────────

/** Reset printer to default settings */
export function initialize(): Uint8Array {
  return new Uint8Array([ESC, 0x40]);
}

// ── Text formatting ─────────────────────────────────────

type Alignment = "left" | "center" | "right";

const ALIGN_MAP: Record<Alignment, number> = {
  left: 0x00,
  center: 0x01,
  right: 0x02,
};

export function textAlign(align: Alignment): Uint8Array {
  return new Uint8Array([ESC, 0x61, ALIGN_MAP[align]]);
}

export function bold(on: boolean): Uint8Array {
  return new Uint8Array([ESC, 0x45, on ? 0x01 : 0x00]);
}

/** Double width + double height when on */
export function doubleSize(on: boolean): Uint8Array {
  return new Uint8Array([GS, 0x21, on ? 0x11 : 0x00]);
}

// ── Text encoding ───────────────────────────────────────

/** Encode string as ASCII-compatible bytes. Non-ASCII chars replaced with '?' */
export function text(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code <= 0xff ? code : 0x3f); // '?' for non-latin1
  }
  return new Uint8Array(bytes);
}

export function lineFeed(count = 1): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < count; i++) bytes.push(LF);
  return new Uint8Array(bytes);
}

// ── Layout helpers ──────────────────────────────────────

/** Separator line (e.g. dashed or double) */
export function separator(width: number, char = "-"): Uint8Array {
  return text(char.repeat(width));
}

/**
 * Two-column row: left-aligned label, right-aligned value.
 * Padded with spaces to fill width.
 */
export function twoColumnRow(
  left: string,
  right: string,
  width: number,
): Uint8Array {
  const gap = width - left.length - right.length;
  if (gap <= 0) {
    // Truncate left if doesn't fit
    const maxLeft = width - right.length - 1;
    return text(left.slice(0, maxLeft) + " " + right);
  }
  return text(left + " ".repeat(gap) + right);
}

// ── Feed & cut ──────────────────────────────────────────

/** Feed n lines then partial cut */
export function feedAndCut(lines = 4): Uint8Array {
  return new Uint8Array([
    ESC, 0x64, lines, // feed n lines
    GS, 0x56, 0x00,   // full cut
  ]);
}

// ── Utility ─────────────────────────────────────────────

/** Concatenate multiple Uint8Arrays into one */
export function concat(...arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) totalLength += arr.length;
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
