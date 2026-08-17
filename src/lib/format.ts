import { BCP47, LOCALE, type Locale } from '../config/locale';

/**
 * Money, in the currency of the language being built.
 *
 * A currency is not a translation of another currency, so this is a real
 * switch rather than a swapped symbol: `ru-RU` groups with non-breaking
 * spaces, puts the sign last, and uses a comma for the decimal. Handing all of
 * that to `Intl` rather than to a template string is the only way the Russian
 * build prints figures a Russian reader does not have to decode.
 *
 * Parentheses for negatives survive both languages: РСБУ statements bracket
 * them exactly the way US ones do.
 */
const CURRENCY: Record<Locale, string> = { en: 'USD', ru: 'RUB' };

/**
 * Bound to one language. Components use the build's own (below); the copy
 * files ask for theirs by name, because both languages' copy is assembled on
 * every build and only one of them is rendered.
 */
export const formatters = (locale: Locale) => {
  const full = new Intl.NumberFormat(BCP47[locale], {
    style: 'currency',
    currency: CURRENCY[locale],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const round = new Intl.NumberFormat(BCP47[locale], {
    style: 'currency',
    currency: CURRENCY[locale],
    maximumFractionDigits: 0,
  });

  return {
    /** $40,825.00 · 4 082 500,00 ₽ — what a document prints. */
    money: (n: number) => full.format(n),
    /** $84,200 · 8 420 000 ₽ — what a headline says. */
    moneyShort: (n: number) => round.format(n),
    /** ($12,000) — accounting negatives, as they appear on a real statement. */
    moneySigned: (n: number) => (n < 0 ? `(${full.format(Math.abs(n))})` : full.format(n)),
    moneySignedShort: (n: number) => (n < 0 ? `(${round.format(Math.abs(n))})` : round.format(n)),
  };
};

const bound = formatters(LOCALE);

export const money = bound.money;
export const moneyShort = bound.moneyShort;
export const moneySigned = bound.moneySigned;
export const moneySignedShort = bound.moneySignedShort;

/* -------------------------------------------------------------- emphasis */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Inline emphasis for body copy.
 *
 * Every sentence on this page used to be one weight in one grey, which is what
 * "no design, hard to read" actually means: nothing in the paragraph tells the
 * eye where to land, so the whole block reads as an obstacle. Two markers fix
 * it, and only two — a third would turn every line into a ransom note.
 *
 *   **like this**   the clause that carries the sentence. Full-strength ink,
 *                   one notch heavier. Use it once per sentence.
 *   [[like this]]   the phrase somebody repeats to somebody else. Brand ink.
 *                   Use it once per SCREEN, and usually on a number or a date.
 *
 * Deliberately not markdown. `*` and `_` appear inside real copy — dollar
 * amounts, file names, a stray asterisk in a footnote — and a parser that
 * fights the content loses. `[[ ]]` cannot occur by accident.
 *
 * The result goes through `set:html`, so the source is escaped first. The copy
 * is ours, but a rescin pastes a prospect's own sentence into these fields.
 */
export const em = (s: string) =>
  escapeHtml(s)
    .replace(/\[\[(.+?)\]\]/g, '<b class="u-key">$1</b>')
    .replace(/\*\*(.+?)\*\*/g, '<b class="u-lift">$1</b>');

/** The same string with the markers taken out — for `title`, `alt`, `aria-*`. */
export const plain = (s: string) => s.replace(/\[\[(.+?)\]\]/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1');
