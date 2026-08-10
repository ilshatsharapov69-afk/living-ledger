/**
 * Colour maths — runs at build time only.
 *
 * Why this file exists: the brand colour arrives from `firm.ts` as an arbitrary
 * hex. A burgundy `#6B0F2A` is invisible on a dark desk; a lime `#B6FF00` is
 * unreadable on paper. So we never use the raw hex directly — we take its hue
 * and chroma, force the lightness into a band that works on each surface, and
 * verify the result with a real WCAG contrast calculation. If a derived colour
 * still fails, we walk its lightness until it passes.
 *
 * All conversions are Björn Ottosson's OKLab.
 */

export type Rgb = { r: number; g: number; b: number }; // 0..1
export type Oklch = { l: number; c: number; h: number }; // l 0..1, c 0..~0.4, h deg

/* ------------------------------------------------------------------ hex */

export function hexToRgb(hex: string): Rgb {
  const s = hex.trim().replace('#', '');
  const full = s.length === 3 ? s.split('').map((ch) => ch + ch).join('') : s;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`brandColor must be a hex colour like "#146B4F" — got "${hex}"`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const ch = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

/* --------------------------------------------------------------- srgb <-> linear */

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const toSrgb = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

/* ----------------------------------------------------------------- oklab */

function linearToOklab({ r, g, b }: Rgb) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToLinear({ L, a, b }: { L: number; a: number; b: number }): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const lin = { r: toLinear(rgb.r), g: toLinear(rgb.g), b: toLinear(rgb.b) };
  const { L, a, b } = linearToOklab(lin);
  const c = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

const inGamut = ({ r, g, b }: Rgb, eps = 1e-4) =>
  r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;

/**
 * OKLCH → sRGB, clipping out-of-gamut colours by reducing chroma (keeps hue and
 * lightness, which is what we care about — a duller colour still reads as the
 * brand, a hue-shifted one does not).
 */
export function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180;
  const attempt = (chroma: number) =>
    oklabToLinear({ L: l, a: Math.cos(rad) * chroma, b: Math.sin(rad) * chroma });

  let lin = attempt(c);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(attempt(mid))) lo = mid;
      else hi = mid;
    }
    lin = attempt(lo);
  }
  return {
    r: Math.min(1, Math.max(0, toSrgb(lin.r))),
    g: Math.min(1, Math.max(0, toSrgb(lin.g))),
    b: Math.min(1, Math.max(0, toSrgb(lin.b))),
  };
}

export const oklchToHex = (v: Oklch) => rgbToHex(oklchToRgb(v));
export const hexToOklch = (hex: string) => rgbToOklch(hexToRgb(hex));

/* -------------------------------------------------------------- contrast */

export function luminance(rgb: Rgb): number {
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/** WCAG 2.1 contrast ratio, 1..21. */
export function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export const contrastHex = (a: string, b: string) => contrast(hexToRgb(a), hexToRgb(b));

/**
 * Walk a colour's lightness (hue and chroma held) until it clears `target`
 * contrast against `against`. `direction` says which way is allowed to go —
 * ink on paper darkens, accents on a dark desk brighten.
 *
 * Returns the first passing colour, or the extreme if nothing passes.
 */
export function forceContrast(
  colour: Oklch,
  against: Rgb,
  target: number,
  direction: 'darker' | 'lighter',
): Oklch {
  const step = direction === 'darker' ? -0.01 : 0.01;
  let { l } = colour;
  for (let i = 0; i <= 100; i++) {
    const candidate = { ...colour, l };
    if (contrast(oklchToRgb(candidate), against) >= target) return candidate;
    l += step;
    if (l < 0 || l > 1) break;
  }
  return { ...colour, l: direction === 'darker' ? 0.08 : 0.98 };
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Perceptual lightness distance, 0..100.
 *
 * The right metric for two large adjacent surfaces of similar lightness — a
 * kraft sheet lying on a grey desk. WCAG ratios compress badly up at the light
 * end (two clearly different papers can both sit at "1.2:1") and were never
 * meant for this case; they are for text against its own background.
 * A gap of 7 reads as a distinct surface, 10 is comfortable.
 */
export const deltaL = (a: Oklch, b: Oklch) => Math.abs(a.l - b.l) * 100;
