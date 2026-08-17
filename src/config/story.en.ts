/**
 * The illustrative month.
 *
 * These are the actual objects the whole page is made of: five documents that
 * appear in the hero pile, fan out in Source, break apart in Classify, get
 * matched in Reconcile, fall into the folder in Close and become three charts
 * in Understand. Nothing is ever re-created — the same five live all the way
 * through.
 *
 * Every total is asserted at the bottom of this file. If you edit a number and
 * the month stops adding up, the build fails instead of shipping a lie.
 *
 * When rescinning to a non-construction niche, the only things that need new
 * words are `client` and the row labels. The arithmetic can stay.
 */

import type { Doc, Row } from './story.types';
import { must, sum } from './story.assert';

const client = {
  name: 'Vega Ridge Builders LLC',
  short: 'Vega Ridge',
  trade: 'General contractor · Austin, TX',
};

const period = 'March';

/* ─────────────────────────────────────────────────────────── the documents */

const invoices: Doc = {
  id: 'invoices',
  title: 'Invoices issued',
  short: 'Invoices',
  meta: `${client.short} · ${period}`,
  rows: [
    { label: 'Harrow Property Group', meta: '#2214 · Phase 2 framing', amount: 40825 },
    { label: 'Caldwell Municipal', meta: '#2215 · Site prep, Lot 7', amount: 26900 },
    { label: 'Ortiz Residential Grp', meta: '#2216 · Remodel, final draw', amount: 12475 },
    { label: 'Retainage release', meta: 'Job 118 · held since Nov', amount: 4000 },
  ],
  totalLabel: 'Invoiced',
  total: 84200,
  stock: 'bond',
};

const bank: Doc = {
  id: 'bank',
  title: 'Bank activity',
  short: 'Bank activity',
  meta: 'Operating ····8802 · deposits',
  rows: [
    { label: 'ACH DEP · HARROW PROPERTY GRP', meta: 'Mar 04', amount: 40825 },
    // The near miss. Same amount as invoice #2216, different counterparty, and
    // not income at all. This is what the matching line hesitates over.
    { label: 'TRANSFER FROM SAVINGS ····4021', meta: 'Mar 11', amount: 12475, excluded: true },
    { label: 'ACH DEP · CALDWELL MUNICIPAL AP', meta: 'Mar 18', amount: 26900 },
    { label: 'DEP · ORTIZ RESIDENTIAL GRP', meta: 'Mar 23', amount: 12475 },
    { label: 'ACH · RETAINAGE REL JOB 118', meta: 'Mar 29', amount: 4000 },
  ],
  totalLabel: 'Deposits, less transfers',
  total: 84200,
  stock: 'ledger',
};

const payroll: Doc = {
  id: 'payroll',
  title: 'Payroll register',
  short: 'Payroll',
  meta: `${period} · 8 on the books`,
  rows: [
    { label: 'Crew wages', meta: '6 field · 2 shop', amount: 24150, bucket: 'payroll' },
    { label: 'Employer taxes', meta: 'FICA · FUTA · SUTA', amount: 4910, bucket: 'payroll' },
    { label: "Workers' comp accrual", meta: 'Class 5403', amount: 2740, bucket: 'payroll' },
  ],
  totalLabel: 'Payroll',
  total: 31800,
  stock: 'tractor',
};

const operating: Doc = {
  id: 'operating',
  title: 'Operating costs',
  short: 'Operating',
  meta: `${period} · posted`,
  rows: [
    { label: 'Materials', meta: 'Job 118 · Job 121', amount: 8320, bucket: 'operating' },
    { label: 'Equipment rental', meta: 'Lift, compactor', amount: 3150, bucket: 'operating' },
    { label: 'Fuel & vehicle', meta: '4 trucks', amount: 2480, bucket: 'operating' },
    { label: 'Insurance & bonding', meta: 'GL · bond premium', amount: 2900, bucket: 'operating' },
    { label: 'Software, phone, misc.', meta: '', amount: 1550, bucket: 'operating' },
  ],
  totalLabel: 'Operating',
  total: 18400,
  stock: 'slip',
};

const tax: Doc = {
  id: 'tax',
  title: 'Tax reserve',
  short: 'Tax reserve',
  meta: `${period} · set aside`,
  rows: [
    { label: 'Federal estimate', meta: 'Q1 set-aside', amount: 6900, bucket: 'tax' },
    { label: 'TX franchise tax', meta: 'accrual', amount: 1250, bucket: 'tax' },
    { label: 'Sales & use tax', meta: 'collected, owed', amount: 1450, bucket: 'tax' },
  ],
  totalLabel: 'Reserved',
  total: 9600,
  stock: 'kraft',
};

export const documents: Doc[] = [invoices, bank, payroll, operating, tax];
export const docById = Object.fromEntries(documents.map((d) => [d.id, d])) as Record<string, Doc>;

/* ─────────────────────────────────────────────────────────────── the clutter */

/*
 * Paper that is only ever seen cropped, at the edge of the first screen, and
 * which slides off the desk the moment the visitor scrolls.
 *
 * It exists because five sheets are not a month. The first screen has to say
 * "there is a pile of this" before it says what the pile is, and five documents
 * spaced around a 1600px frame say "here are five documents". These are never
 * readable, never counted and never referred to again — they are the volume the
 * five real ones are pulled out of. Real artefacts of a contractor's month, so
 * that a visitor who does know what they are looking at is not lied to.
 */
const clutterRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ label: `—`, amount: 0, meta: String(i) }));

export const clutter: Doc[] = [
  {
    id: 'bills',
    title: 'Vendor bills',
    short: 'Vendor bills',
    meta: `${period} · unpaid`,
    rows: clutterRows(5),
    totalLabel: 'Due',
    total: 0,
    stock: 'bond',
  },
  {
    id: 'card',
    title: 'Card statement',
    short: 'Card ····3318',
    meta: `${period} · 41 charges`,
    rows: clutterRows(5),
    totalLabel: 'Charged',
    total: 0,
    stock: 'ledger',
  },
  {
    id: 'jobcost',
    title: 'Job cost detail',
    short: 'Job costing',
    meta: 'Jobs 118 · 121 · 124',
    rows: clutterRows(5),
    totalLabel: 'Allocated',
    total: 0,
    stock: 'tractor',
  },
  {
    id: 'receipts',
    title: 'Receipts, loose',
    short: 'Receipts',
    meta: 'shoebox',
    rows: clutterRows(4),
    totalLabel: 'Counted',
    total: 0,
    stock: 'kraft',
  },
];

/* ────────────────────────────────────────────────────────────── the buckets */

/*
 * The order is the order the claims are actually met in, and the last one is
 * always what is left. Allocate reads it positionally — the final bucket is the
 * one that stays on the desk — so a rescin can change the amounts and the words
 * but must keep "what is left" at the end.
 *
 * `short` is what fits printed across a segment of the strip: the tax slice is
 * eleven per cent of the month, and "Tax reserve" does not fit in eleven per
 * cent of anything.
 */
export const buckets = [
  { id: 'payroll' as const, label: 'Payroll', short: 'Payroll', amount: 31800 },
  { id: 'operating' as const, label: 'Operating', short: 'Operating', amount: 18400 },
  { id: 'tax' as const, label: 'Tax reserve', short: 'Tax', amount: 9600 },
  { id: 'available' as const, label: 'Available', short: 'Available', amount: 24400 },
];

/* ──────────────────────────────────────────────────────────────── reconcile */

/**
 * The beat the whole page is built around.
 * The line leaves invoice row 2 and travels down the bank column. It stops on
 * `decoyIndex` — the amount is identical — reads the counterparty, rejects it,
 * carries on, and locks onto `matchIndex`.
 */
export const reconcile = {
  left: invoices,
  right: bank,
  sourceIndex: 2,
  decoyIndex: 1,
  decoyReason: 'amount matches · payer does not',
  matchIndex: 3,
  differenceLabel: 'Difference to review',
  difference: 0,
  /*
   * The pencil marks in the margin, in the order a hand writes them.
   *
   * The GEOMETRY of these lives in Reconcile.astro, hand-tuned and guarded by a
   * collision assertion; the FIGURES live here, because they are this month's
   * arithmetic and nobody else's — the four invoices, the bank running total
   * with the decoy still inside it, the decoy taken back out, and a difference
   * proved to nought. Every one appears on a document in front of it.
   *
   * They also have to be a language's own: a Russian bookkeeper does not write
   * "Mar 04" in a margin, and the figures are not the same figures.
   */
  working: [
    '40,825',
    '12,475',
    '26,900',
    'Mar 04',
    '4,000',
    'savings?',
    '12,475',
    '26,900',
    'Mar 18',
    '84,200',
    'Mar 23',
    '12,475',
    '96,675',
    '4,000',
    '−12,475',
    '84,200',
    '=84,200',
    '0.00',
  ],
};

/* ─────────────────────────────────────────────────────────────── understand */

export const understand = {
  earned: {
    id: 'earned',
    question: 'Did we make money?',
    answer: 24400,
    plain: 'kept, after payroll, costs and taxes set aside',
    lines: [
      { label: 'Invoiced', amount: 84200 },
      { label: 'Payroll', amount: -31800 },
      { label: 'Operating', amount: -18400 },
      { label: 'Tax reserve', amount: -9600 },
    ],
  },
  cash: {
    id: 'cash',
    question: 'Is there more in the bank than last month?',
    answer: 5300,
    plain: 'more in the account than on March 1',
    lines: [
      { label: 'Money in', amount: 84200 },
      { label: 'Payroll', amount: -31800 },
      { label: 'Operating', amount: -18400 },
      { label: 'Moved to tax reserve', amount: -9600 },
      { label: 'Owner draw', amount: -12000 },
      { label: 'Equipment loan principal', amount: -4100 },
      { label: 'Truck down payment', amount: -3000 },
    ],
  },
  balance: {
    id: 'balance',
    question: 'Did anything go missing?',
    answer: 177000,
    plain: 'on both sides — nothing unaccounted for',
    assets: [
      { label: 'Operating cash', amount: 38600 },
      { label: 'Tax reserve account', amount: 21400 },
      { label: 'Accounts receivable', amount: 52300 },
      { label: 'Equipment, net', amount: 64700 },
    ],
    claims: [
      { label: 'Accounts payable', amount: 19850 },
      { label: 'Credit line', amount: 26000 },
      { label: 'Equipment loan', amount: 41350 },
      { label: "Owner's equity", amount: 89800 },
    ],
  },
};

/*
 * The close.
 *
 * The firm promises a closed month "by the 10th" in firm.ts, and the closing
 * scene has to print that promise as a date on a stamp. Deriving the month
 * names from one index rather than typing them means the shelf of finished
 * months and the empty one waiting cannot drift out of order in a rescin.
 */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const periodIndex = MONTHS.indexOf(period);
if (periodIndex < 0) {
  throw new Error(`story.ts — period "${period}" is not a month name; the close cannot date itself.`);
}

/** Offset in months from the illustrated period. -1 is the month before it. */
const monthAt = (offset: number) => MONTHS[(periodIndex + offset + 12 * 4) % 12]!;

/*
 * A month is shut in the month AFTER it — March's books are stamped on the
 * tenth of April. Carrying `closedOn` beside each name rather than deriving it
 * at the point of use is what stops the shelf printing "CLOSED JAN 10" on
 * January's folder, which is a date that could not have happened.
 */
const shut = (offset: number) => ({ name: monthAt(offset), closedOn: monthAt(offset + 1) });

export const close = {
  /** The working day the books are shut by. Must not outrun the promise. */
  day: 10,
  /** Months already closed, oldest first, ending with the one this story tells. */
  done: [shut(-2), shut(-1), shut(0)],
  /** The one that has not happened yet, and already has a date. */
  next: shut(1),
};

export const meta = { client, period, currency: 'USD' };

/* ──────────────────────────────────────────────────── build-time arithmetic */

const F = 'story.en.ts';

for (const doc of [invoices, payroll, operating, tax]) {
  must(F, `${doc.id} rows`, sum(doc.rows.map((r) => r.amount)), doc.total);
}
must(F, 'bank deposits less transfers', sum(bank.rows.filter((r) => !r.excluded).map((r) => r.amount)), bank.total);
must(F, 'buckets vs inflow', sum(buckets.map((b) => b.amount)), invoices.total);
must(F, 'payroll bucket', buckets[0]!.amount, payroll.total);
must(F, 'operating bucket', buckets[1]!.amount, operating.total);
must(F, 'tax bucket', buckets[2]!.amount, tax.total);
must(F, 'earned', sum(understand.earned.lines.map((l) => l.amount)), understand.earned.answer);
must(F, 'cash', sum(understand.cash.lines.map((l) => l.amount)), understand.cash.answer);
must(F, 'assets', sum(understand.balance.assets.map((l) => l.amount)), understand.balance.answer);
must(F, 'claims', sum(understand.balance.claims.map((l) => l.amount)), understand.balance.answer);
must(
  F,
  'reconcile decoy must share the source amount',
  bank.rows[reconcile.decoyIndex]!.amount,
  invoices.rows[reconcile.sourceIndex]!.amount,
);
must(
  F,
  'reconcile match must share the source amount',
  bank.rows[reconcile.matchIndex]!.amount,
  invoices.rows[reconcile.sourceIndex]!.amount,
);
