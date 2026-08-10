# Living Ledger

A single-page website for a small US accounting and bookkeeping firm, built as a
scroll-driven demonstration: the first half of the page is a month of a
contractor's books arriving on a desk, being reconciled, allocated and closed —
four pinned scenes drawn in CSS from one set of numbers that has to add up.

**This is a design demonstration.** The firm on the page, its people, its
reviews and its contact details are invented. Every page ships `noindex` while
`firm.indexable` is `false`.

## Running it

```bash
npm install
```

```bash
npm run dev
```

| Script | What it produces |
|---|---|
| `npm run dev` | Dev server at `http://localhost:4321` |
| `npm run build` | Static site for a **domain root** |
| `npm run build:pages` | Static site for the **GitHub Pages project subpath** |
| `npm run preview` | Serves the last build |

The two build scripts differ only in `base`. `build:pages` prefixes every asset
and internal link with the repo name; a root deploy must use plain `build`, or
every link carries a path segment that is not there. The switch is keyed off the
npm script name in `astro.config.mjs`.

## Stack

Astro 7, static output, no UI framework and no animation library. The scroll
work is `position: sticky` plus a small `requestAnimationFrame` engine in
`src/scripts/engine.ts` that turns scroll position into CSS custom properties;
everything visible is CSS reading those numbers. Type is self-hosted via
`@fontsource`. There are no third-party requests at runtime — no trackers, no
CDN, no cookie banner.

## Where things live

```
src/config/firm.ts      identity, proof, contact, labels — the per-firm surface
src/config/story.ts     the illustrative month; every total asserted at build
src/config/content.ts   template copy shared across firms
src/config/scenes.ts    how long each pinned scene runs
src/lib/palette.ts      the whole palette, derived from one brand hex
src/lib/url.ts          internal links, resolved against the deploy base
src/scripts/engine.ts   scroll position -> CSS custom properties
src/components/         one file per section; the four scenes are the big ones
scripts/brand-check.ts  brand-colour contrast stress test
scripts/sweep.js        layout harness — 25 viewport sizes in an iframe
```

## Checks

The build fails on its own if the illustrative arithmetic stops adding up or if
a colour derived from the brand hex falls below its contrast floor.

```bash
node scripts/brand-check.ts
```

For layout, serve a build, load `scripts/sweep.js` on the page and run
`await sweepAll()` in the console. It re-loads the page in an iframe at
twenty-five viewport sizes and measures whether the paper, the headings and the
pencil working ever land on each other. A size that is clean comes back as a
bare string.

## Re-skinning

`src/config/firm.ts` is the only file to edit per firm. The palette, the
contrast checks and every brand-flavoured token are derived from `brandColor`.
Before a demo goes to anyone, replace `contact.*`, `social.*` (they ship
pointing at the platforms' own home pages) and the testimonials, and decide
whether `proof.reviewSource` should name a review platform — it must not, unless
the reviews are real ones from that platform.
