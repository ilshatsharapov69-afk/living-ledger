/**
 * The firm this build is about — English or Russian, decided at build time.
 *
 * Components import from here and never from a locale file, so adding a
 * language is one line in this file rather than an edit in seventeen
 * components.
 *
 * The annotation on `picked` is the safety net: `firm.ru.ts` is checked against
 * the English shape, so a translated config that loses a field, renames one or
 * changes a type fails the build instead of rendering an empty slot.
 */
import { LOCALE } from './locale';
import * as en from './firm.en';
import * as ru from './firm.ru';

const picked: typeof en = LOCALE === 'ru' ? ru : en;

export const { firm } = picked;
export type Firm = typeof en.firm;
