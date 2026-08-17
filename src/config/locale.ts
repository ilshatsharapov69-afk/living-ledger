/**
 * Which language this build is in.
 *
 * The site ships as two static builds out of one source: English at the domain
 * root and Russian under `/ru`. Nothing switches at runtime — there is no
 * router, no dictionary lookup and no flash of the wrong language, because the
 * locale is decided before Vite starts and the wrong half is never rendered.
 *
 * `astro.config.mjs` reads the same switch and hands it over as `__LOCALE__`.
 * Keyed off a build-time define rather than `import.meta.env` because Astro
 * only exposes `PUBLIC_`-prefixed variables to client code, and this value is
 * read inside config modules that run in both halves of the build.
 */
declare const __LOCALE__: string;

export type Locale = 'en' | 'ru';

export const LOCALE: Locale = __LOCALE__ === 'ru' ? 'ru' : 'en';

/** The `lang` attribute, and what `Intl` is asked to format money in. */
export const BCP47: Record<Locale, string> = { en: 'en-US', ru: 'ru-RU' };

/**
 * Where the other language lives, for the switcher and for `hreflang`.
 *
 * Absolute site paths, deliberately not run through `href()`: the whole point
 * of these is to leave the current build's base and land in the other one.
 */
export const LOCALE_HOME: Record<Locale, string> = { en: '/', ru: '/ru/' };

export const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', ru: 'RU' };
