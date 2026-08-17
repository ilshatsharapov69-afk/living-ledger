/**
 * The tab icon.
 *
 * It used to be a static file in `public/`, which meant it was the one piece of
 * brand on the page that did not follow `firm.brandColor` — and, once the site
 * shipped in two languages, the one piece that could not follow the firm
 * either: a Russian firm called «Свод» sat behind an English N in the tab.
 *
 * Built here instead, from the same mark the masthead draws and the same
 * palette every other colour on the page comes from. Astro prerenders it to
 * `favicon.svg` at the build's base, so each locale gets its own.
 */
import { firm } from '../config/firm';
import { buildPalette } from '../lib/palette';

export function GET() {
  const { css } = buildPalette(firm.brandColor, 'light');
  const { d, cap } = firm.logo.mark;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${firm.brandColor}" />
  <path d="${d}" fill="none" stroke="${css['--paper']}" stroke-width="2.7" stroke-linecap="${cap}" />
</svg>
`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
