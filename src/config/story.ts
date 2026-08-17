/**
 * The illustrated month for this build's language.
 *
 * Both locales' modules are evaluated on every build, which means both months'
 * arithmetic is asserted on every build — the Russian figures cannot rot while
 * only the English site is being worked on.
 */
import { LOCALE } from './locale';
import * as en from './story.en';
import * as ru from './story.ru';

const picked: typeof en = LOCALE === 'ru' ? ru : en;

export const { documents, docById, clutter, buckets, reconcile, understand, close, meta } = picked;
export type { Row, BucketId, Stock, Doc } from './story.types';
