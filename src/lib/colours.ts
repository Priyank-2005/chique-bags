/**
 * Colour filter groups. Every colour of a bag has a swatch (hex), and the shop groups those into a handful of
 * families a customer would recognise ("Emerald" and "Forest" both count as Green), so the filter stays short
 * however the colours are named.
 */
export const COLOUR_FAMILIES = [
  { key: "black", label: "Black", hex: "#1c1c1c" },
  { key: "white", label: "White & ivory", hex: "#f4efe6" },
  { key: "beige", label: "Beige & cream", hex: "#d9c3a0" },
  { key: "brown", label: "Brown & tan", hex: "#8a5a35" },
  { key: "grey", label: "Grey & silver", hex: "#8a8a90" },
  { key: "red", label: "Red & maroon", hex: "#b3261e" },
  { key: "pink", label: "Pink & blush", hex: "#e8a3b5" },
  { key: "orange", label: "Orange & coral", hex: "#e8552f" },
  { key: "yellow", label: "Yellow & gold", hex: "#d4a82a" },
  { key: "green", label: "Green", hex: "#3f7d4f" },
  { key: "blue", label: "Blue & teal", hex: "#2f5d9e" },
  { key: "purple", label: "Purple & lilac", hex: "#8a63b5" },
] as const;

export type ColourKey = (typeof COLOUR_FAMILIES)[number]["key"];
export const COLOUR_KEYS: ReadonlySet<string> = new Set(COLOUR_FAMILIES.map((c) => c.key));

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x222222;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

export function colourFamily(hex: string): ColourKey {
  const { h, s, l } = hexToHsl(hex);
  if (l <= 0.15) return "black";
  if (s < 0.1) return l >= 0.88 ? "white" : l < 0.25 ? "black" : "grey";
  if (h < 10 || h >= 345) return l >= 0.62 ? "pink" : "red";
  if (h < 55) {
    if (l >= 0.86 && s < 0.7) return "white"; // ivory, cream
    if (h >= 38 && s >= 0.5 && l >= 0.4) return "yellow"; // gold, mustard
    if (l >= 0.62) return "beige"; // sand, champagne
    if (h < 38 && s >= 0.55 && l >= 0.45) return "orange"; // coral, orange
    return "brown"; // tan, cognac, mocha
  }
  if (h < 70) return s >= 0.5 && l >= 0.4 ? "yellow" : "green";
  if (h < 170) return "green";
  if (h < 255) return "blue";
  if (h < 300) return "purple";
  return l >= 0.45 ? "pink" : "red";
}
