/**
 * Every internal link on this site, resolved against wherever it is deployed.
 *
 * WHY THIS EXISTS
 *
 * The config files hold plain root-relative paths — `/`, `/#book`,
 * `/legal#privacy` — because that is the readable form for whoever is editing
 * `firm.ts` for a new prospect, and RESKIN.md is written around that file being
 * readable. Those paths are correct at exactly one kind of URL: a domain root.
 *
 * A demo does not always get a domain root. Served from
 * `user.github.io/<repo>/`, every one of them points a level too high: the
 * masthead logo leaves the site, the legal links 404, and the favicon never
 * loads. That is not a GitHub Pages quirk, it is true of any subdirectory
 * deploy, and a template that is going to be put up once per prospect has to
 * survive it.
 *
 * So the paths stay readable in the config and get resolved here, once, at the
 * point they become an `href`. `BASE_URL` is `/` in dev and in a normal build,
 * so this is a no-op everywhere except a subpath deploy.
 */

/* Astro hands this over with a trailing slash; the paths below start with one,
   and two in a row would be a protocol-relative URL pointing at another host. */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Prefixes a site-root path with the deploy base.
 *
 * Anything that is not a root-relative path — `https://…`, `tel:…`,
 * `mailto:…`, a bare `#anchor` — is returned untouched, so this is safe to wrap
 * around a config value that might hold either.
 */
export const href = (path: string): string => (path.startsWith('/') ? `${BASE}${path}` : path);
