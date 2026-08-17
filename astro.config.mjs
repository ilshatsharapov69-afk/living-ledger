import { defineConfig } from 'astro/config';

/*
 * Where this build is going, and what language it is in.
 *
 * `npm run build` produces a site for a domain root, which is what a sold demo
 * on its own domain gets and what the local preview expects. `npm run
 * build:pages` produces the same site for a GitHub Pages project URL, which is
 * a SUBDIRECTORY — every asset and every internal link has to carry the repo
 * name or the page loads as unstyled text with dead navigation.
 *
 * Keyed off the npm script name rather than a shell variable because this is a
 * Windows machine and `VAR=x npm run build` silently does nothing in cmd.
 * `PAGES_BUILD=1` is the same switch for callers that are not npm — the deploy
 * script spawns astro directly, so it has no script name to be keyed off.
 */
const PAGES_BASE = '/living-ledger';
const forPages =
  process.env.npm_lifecycle_event === 'build:pages' || process.env.PAGES_BUILD === '1';

/*
 * The site ships as TWO static builds out of one source: English at the root
 * and Russian one directory down. Same switch shape as the one above, for the
 * same Windows reason.
 *
 * The Russian half is a subdirectory deploy of exactly the kind `base` already
 * existed to handle, so it costs nothing beyond saying so: `src/lib/url.ts`
 * resolves every internal link against `BASE_URL`, and it has been doing that
 * since the first Pages deploy.
 *
 * `outDir` puts it inside the English output rather than beside it, which is
 * what makes one upload serve both. Build order matters — Astro empties its
 * own `outDir`, so English must run first or it deletes the Russian build it
 * is meant to contain. `scripts/build-both.js` owns that order.
 */
const RU_DIR = 'ru';
const locale =
  process.env.npm_lifecycle_event === 'build:ru' || process.env.SITE_LOCALE === 'ru' ? 'ru' : 'en';

const base = [forPages ? PAGES_BASE : '', locale === 'ru' ? `/${RU_DIR}` : ''].join('') || '/';

export default defineConfig({
  site: 'https://ilshatsharapov69-afk.github.io',
  base,
  outDir: locale === 'ru' ? `./dist/${RU_DIR}` : './dist',
  // One static page. No adapter, no islands, no router.
  devToolbar: { enabled: false },
  build: {
    // Single page — one document, one request.
    inlineStylesheets: 'always',
  },
  vite: {
    /*
     * Read by `src/config/locale.ts`. A define rather than an env variable
     * because Astro only exposes `PUBLIC_`-prefixed variables, and this is read
     * inside config modules that decide which language's copy is rendered.
     */
    define: { __LOCALE__: JSON.stringify(locale) },
    build: {
      assetsInlineLimit: 8192,
    },
  },
});
