const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdRound = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** $40,825.00 — what a document prints. */
export const money = (n: number) => usd.format(n);

/** $84,200 — what a headline says. */
export const moneyShort = (n: number) => usdRound.format(n);

/** ($12,000) — accounting negatives, as they appear on a real statement. */
export const moneySigned = (n: number) =>
  n < 0 ? `(${usd.format(Math.abs(n))})` : usd.format(n);

export const moneySignedShort = (n: number) =>
  n < 0 ? `(${usdRound.format(Math.abs(n))})` : usdRound.format(n);

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
