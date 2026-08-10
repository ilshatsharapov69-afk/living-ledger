/**
 * Brand stress test. Run: `node scripts/brand-check.ts`
 *
 * Proves the takt-1 criterion: changing `brandColor` in firm.ts must not break
 * the design. Every one of these hexes is a real hazard — a burgundy that
 * disappears on a dark desk, a lime that is unreadable on paper, a near-black
 * logo, a neon that screams. The build is only allowed to ship if all of them
 * resolve to legible tokens.
 */

import { buildPalette, type ThemeName } from '../src/lib/palette.ts';

const CASES: [string, string][] = [
  ['#146B4F', 'evergreen (default)'],
  ['#6B0F2A', 'deep burgundy'],
  ['#0E7490', 'teal'],
  ['#1E3A8A', 'navy'],
  ['#B45309', 'burnt orange'],
  ['#111827', 'near-black'],
  ['#7C3AED', 'violet'],
  ['#B6FF00', 'neon lime'],
  ['#E11D48', 'hot rose'],
  ['#5B5B5B', 'plain grey'],
  ['#8B5E34', 'brown'],
  ['#00C2A8', 'bright mint'],
];

let failures = 0;

for (const theme of ['light', 'dark'] as ThemeName[]) {
  console.log(`\n── ${theme} ─────────────────────────────────────────────────────`);
  for (const [hex, name] of CASES) {
    const { css, report } = buildPalette(hex, theme);
    const bad = report.filter((r) => r.ratio < r.need);
    const worst = report.reduce((a, b) => (b.ratio / b.need < a.ratio / a.need ? b : a));
    failures += bad.length;

    const mark = bad.length ? 'FAIL' : ' ok ';
    console.log(
      `[${mark}] ${hex}  ${name.padEnd(20)}` +
        ` lit ${css['--brand-lit']}  solid ${css['--brand-solid']}` +
        `  on-solid ${css['--brand-on-solid']}` +
        `  tightest: ${worst.token} ${worst.ratio}:1 (needs ${worst.need})`,
    );
    for (const f of bad) {
      console.log(`        ${f.token} on ${f.on} = ${f.ratio}:1, needs ${f.need}:1`);
    }
  }
}

console.log(failures ? `\n${failures} failing token(s).` : '\nAll brand colours resolve.');
process.exit(failures ? 1 : 0);
