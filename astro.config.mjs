import { defineConfig } from 'astro/config';

/*
 * Where this build is going.
 *
 * `npm run build` produces a site for a domain root, which is what a sold demo
 * on its own domain gets and what the local preview expects. `npm run
 * build:pages` produces the same site for a GitHub Pages project URL, which is
 * a SUBDIRECTORY — every asset and every internal link has to carry the repo
 * name or the page loads as unstyled text with dead navigation.
 *
 * Keyed off the npm script name rather than a shell variable because this is a
 * Windows machine and `VAR=x npm run build` silently does nothing in cmd.
 */
const PAGES_BASE = '/living-ledger';
const forPages = process.env.npm_lifecycle_event === 'build:pages';

export default defineConfig({
  site: 'https://ilshatsharapov69-afk.github.io',
  base: forPages ? PAGES_BASE : '/',
  // One static page. No adapter, no islands, no router.
  devToolbar: { enabled: false },
  build: {
    // Single page — one document, one request.
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      assetsInlineLimit: 8192,
    },
  },
});
