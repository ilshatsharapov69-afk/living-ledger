/**
 * The page's words, in this build's language.
 *
 * Each locale assembles its own copy from its own `firm.*.ts` and `story.*.ts`
 * rather than from the selected ones, so the Russian sentences are built out of
 * the Russian month even while the English build is the one being generated.
 */
import { LOCALE } from './locale';
import * as en from './content.en';
import * as ru from './content.ru';

const picked: typeof en = LOCALE === 'ru' ? ru : en;

export const {
  cpaClaim,
  licensureNote,
  hero,
  beats,
  close,
  services,
  pricing,
  trust,
  legal,
  faq,
  book,
  footer,
  ledgerStrip,
  a11y,
} = picked;
