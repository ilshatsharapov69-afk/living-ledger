import { LOCALE } from '../config/locale';

/**
 * The date a month was shut, written the way the language writes it.
 *
 * Two places print it — the stamp on the folder in Close, and the "Sent" line
 * beside the report in Pricing — and both used to compose it inline as
 * `${month} ${day}`. That is correct English and broken Russian twice over:
 * the order is reversed, and the month has to be in the genitive, so the same
 * template produces "April 10" and "апрель 10".
 *
 * The month arrives here nominative, because that is the form the shelf of
 * closed months prints on its tabs. The genitive is looked up rather than
 * derived — Russian month endings are regular enough to tempt a rule and
 * irregular enough (май → мая) to punish one.
 */
const GENITIVE: Record<string, string> = {
  январь: 'января',
  февраль: 'февраля',
  март: 'марта',
  апрель: 'апреля',
  май: 'мая',
  июнь: 'июня',
  июль: 'июля',
  август: 'августа',
  сентябрь: 'сентября',
  октябрь: 'октября',
  ноябрь: 'ноября',
  декабрь: 'декабря',
};

/** "April 10" · "10 апреля" — beside the report that was sent. */
export const closedOnLong = (month: string, day: number): string =>
  LOCALE === 'ru' ? `${day} ${GENITIVE[month] ?? month}` : `${month} ${day}`;

/**
 * "APR 10" · "10 АПР" — what fits on a rubber stamp.
 *
 * Three letters is enough to name a month in both languages, and the genitive
 * does not survive being cut to three anyway.
 */
export const closedOnShort = (month: string, day: number): string => {
  const abbr = month.slice(0, 3);
  return (LOCALE === 'ru' ? `${day} ${abbr}` : `${abbr} ${day}`).toUpperCase();
};
