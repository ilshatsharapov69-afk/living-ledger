/**
 * The illustrated month — RUSSIAN.
 *
 * Same five documents doing the same five jobs as in `story.en.ts`: they land
 * in the hero pile, are named in Sort, are matched in Reconcile, are taken
 * apart in Allocate and are filed in Close. What changed is everything about
 * what they ARE. A Texas contractor invoices; a Kazan contractor signs a КС-2
 * with the client's технадзор and only then may issue a КС-3 and a
 * счёт-фактура, and the month's money is shaped by that.
 *
 * WHERE THE FIGURES COME FROM. A small fit-out and services contractor, eight
 * people, working as подрядчик and субподрядчик for regional customers. The
 * shape was built from published data rather than invented: average
 * construction wages in Tatarstan in 2026, the general 30% contribution rate,
 * and VAT charged on signed КС-3 by a general-regime payer. It is not any real
 * company, and no rate is printed anywhere on the page — see the tax sheet.
 *
 * The split is 14,5% ФОТ / 61,7% расходы / 16,8% налоги / 7% остаток, and the
 * English original's 38/22/11/29 is deliberately NOT reproduced: materials and
 * субподряд eat more than half of a Russian contractor's revenue, and a 29%
 * remainder would be a fairy tale. Ten kopecks on the ruble is the figure that
 * makes an owner uncomfortable and that he will not argue with.
 *
 * Every total is asserted at the bottom of this file. Edit a number and the
 * build fails rather than shipping a month that lies.
 */

import type { Doc, Row } from './story.types';
import { must, sum } from './story.assert';

const client = {
  name: 'ООО «Ярус»',
  short: 'Ярус',
  trade: 'Генподряд · Казань',
};

const period = 'март';

/* ─────────────────────────────────────────────────────────── the documents */

/*
 * What was signed, not what was invoiced. In Russian construction the money
 * event is the КС-3 — the справка that follows an accepted КС-2 — so that is
 * what the first sheet counts, and the last line is a гарантийное удержание
 * coming back from a job closed months ago, which is the single most
 * characteristic row on a contractor's month.
 */
const acts: Doc = {
  id: 'invoices',
  title: 'Подписанные КС-3',
  short: 'КС-3',
  meta: `${client.short} · ${period}`,
  rows: [
    { label: 'Полюс-Инжиниринг', meta: 'КС-3 №2214 · сети, 2-я очередь', amount: 2620000 },
    { label: 'Гортеплосети', meta: 'КС-3 №2215 · ИТП и узел учёта', amount: 1720000 },
    { label: 'Каскад-Девелопмент', meta: 'КС-3 №2216 · офис, финал', amount: 800000 },
    { label: 'Ак Барс Строй', meta: 'КС-3 №2217 · кровля, 2-й этап', amount: 260000 },
  ],
  totalLabel: 'Закрыто',
  total: 5400000,
  stock: 'bond',
};

const bank: Doc = {
  id: 'bank',
  title: 'Движение по счёту',
  short: 'Банк',
  meta: 'Расчётный ····8802 · приход',
  rows: [
    { label: 'ПП 412 · ПОЛЮС-ИНЖИНИРИНГ', meta: '04.03', amount: 2620000 },
    /*
     * The near miss. Same amount as КС-3 №2216, to the ruble — and it is the
     * company's own money coming back from its own savings account, not a
     * customer paying. This is the line the matching hesitates over.
     */
    /*
     * Worded the way a Russian bank actually words it — «перевод между своими
     * счетами» is the phrase on the statement — and short enough to survive the
     * reconcile sheet's 234px label slot. «ПЕРЕВОД С НАКОПИТЕЛЬНОГО ····4021»
     * needed 250 and lost the account number to the ellipsis, which is the one
     * detail that makes the line read as a statement rather than as a caption.
     */
    { label: 'ПЕРЕВОД МЕЖДУ СВОИМИ ····4021', meta: '11.03', amount: 800000, excluded: true },
    { label: 'ПП 88 · ГОРТЕПЛОСЕТИ', meta: '18.03', amount: 1720000 },
    { label: 'ПП 517 · КАСКАД-ДЕВЕЛОПМЕНТ', meta: '23.03', amount: 800000 },
    { label: 'ПП 903 · АК БАРС СТРОЙ', meta: '29.03', amount: 260000 },
  ],
  totalLabel: 'Приход',
  total: 5400000,
  stock: 'ledger',
};

/*
 * Take-home pay. The withheld НДФЛ is not here — it sits in the tax sheet,
 * because it is the state's money sitting in the company's account, and
 * counting it twice would break the month.
 */
const payroll: Doc = {
  id: 'payroll',
  title: 'Расчёт зарплаты',
  short: 'Зарплата',
  meta: `${period} · 8 человек`,
  /*
   * THREE rows, not four, and the same for the tax sheet below.
   *
   * The sheets are laid out on the desk at fixed positions; their HEIGHT comes
   * from their rows. A fourth line here and a fourth and fifth on the tax sheet
   * made the Russian pile 35-50px taller than the English one, and
   * `scripts/sweep.js` caught the sorted cards overlapping at 1600 and 1920
   * wide. The premium is folded into the trades' line rather than dropped, so
   * the month still adds up to the same 783 000.
   */
  rows: [
    { label: 'Директор и прораб', meta: '2 человека', amount: 252000, bucket: 'payroll' },
    { label: 'ПТО и бригадир', meta: 'сметы, КС-2, объёмы', amount: 178000, bucket: 'payroll' },
    {
      label: 'Монтажники и отделочники',
      meta: '4 человека · с премией за этап',
      amount: 353000,
      bucket: 'payroll',
    },
  ],
  totalLabel: 'На руки',
  total: 783000,
  stock: 'tractor',
};

const operating: Doc = {
  id: 'operating',
  title: 'Расходы по объектам',
  short: 'Расходы',
  meta: `${period} · проведено`,
  rows: [
    { label: 'Материалы на объекты', meta: 'закупка вперёд денег', amount: 1950000, bucket: 'operating' },
    { label: 'Субподряд', meta: 'электрика, вентиляция', amount: 850000, bucket: 'operating' },
    { label: 'Аренда техники и бытовок', meta: 'вышки, погрузчик', amount: 210000, bucket: 'operating' },
    { label: 'Топливо и логистика', meta: 'две газели', amount: 160000, bucket: 'operating' },
    { label: 'Офис, связь, 1С, СРО', meta: 'капает и в пустой месяц', amount: 160000, bucket: 'operating' },
  ],
  totalLabel: 'Расходы',
  total: 3330000,
  stock: 'slip',
};

/*
 * Set aside, not yet paid. Named, never rated: the page states which taxes a
 * contractor sets money aside for and says nothing about percentages — the
 * rates that matter here changed for 2026 and the sources disagree on some of
 * them, so a marketing page has no business printing any.
 *
 * The modelled company is on ОСНО, not УСН. It bills VAT on signed КС-3 to
 * customers who need the input VAT, which is exactly why a subcontractor this
 * size stays on the general regime — and a sheet that showed a УСН advance
 * payment NEXT TO quarterly VAT described two regimes at once, which is the
 * first thing a bookkeeper reading this page would notice.
 *
 * Three rows for the reason given on the payroll sheet. Nothing is dropped:
 * the injury contribution sits inside the payroll-tax line, where a contractor
 * thinks of it anyway, and the total is the same 747 000.
 */
const tax: Doc = {
  id: 'tax',
  title: 'Отложено на налоги',
  short: 'Налоги',
  meta: `${period} · отложено`,
  rows: [
    { label: 'НДС к уплате', meta: 'доля марта в квартальном', amount: 415000, bucket: 'tax' },
    { label: 'Взносы и НДФЛ', meta: 'с ФОТ, включая травматизм', amount: 395000, bucket: 'tax' },
    { label: 'Налог на прибыль', meta: 'авансовый, за квартал', amount: 95000, bucket: 'tax' },
  ],
  totalLabel: 'Отложено',
  total: 905000,
  stock: 'kraft',
};

export const documents: Doc[] = [acts, bank, payroll, operating, tax];
export const docById = Object.fromEntries(documents.map((d) => [d.id, d])) as Record<string, Doc>;

/* ─────────────────────────────────────────────────────────────── the clutter */

/*
 * Paper that is only ever seen cropped, at the edge of the first screen, and
 * which slides off the desk the moment the visitor scrolls. Five sheets are
 * not a month — the first screen has to say "there is a pile of this" before
 * it says what the pile is. Never readable, never counted, but real artefacts
 * of a contractor's month, so that a visitor who does know what he is looking
 * at is not lied to.
 */
const clutterRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ label: `—`, amount: 0, meta: String(i) }));

export const clutter: Doc[] = [
  {
    id: 'bills',
    title: 'Счета поставщиков',
    short: 'Поставщики',
    meta: `${period} · не оплачено`,
    rows: clutterRows(5),
    totalLabel: 'К оплате',
    total: 0,
    stock: 'bond',
  },
  {
    id: 'card',
    title: 'Выписка по карте',
    short: 'Карта ····3318',
    meta: `${period} · 41 операция`,
    rows: clutterRows(5),
    totalLabel: 'Списано',
    total: 0,
    stock: 'ledger',
  },
  {
    id: 'jobcost',
    title: 'Затраты по объектам',
    short: 'Объекты',
    meta: 'Объекты 118 · 121 · 124',
    rows: clutterRows(5),
    totalLabel: 'Разнесено',
    total: 0,
    stock: 'tractor',
  },
  {
    id: 'receipts',
    title: 'Первичка, россыпью',
    short: 'Первичка',
    meta: 'коробка',
    rows: clutterRows(4),
    totalLabel: 'Собрано',
    total: 0,
    stock: 'kraft',
  },
];

/* ────────────────────────────────────────────────────────────── the buckets */

/*
 * The order is the order the claims are actually met in, and the last one is
 * always what is left — Allocate reads it positionally, so a rescin may change
 * the amounts and the words but must keep "what is left" at the end.
 *
 * Seventeen characters each: `.spl__name` (Allocate.astro:1308) is the first
 * `auto` track of a three-column grid that gets narrow below 900px.
 */
export const buckets = [
  { id: 'payroll' as const, label: 'Зарплата', short: 'Зарплата', amount: 783000 },
  { id: 'operating' as const, label: 'Расходы', short: 'Расходы', amount: 3330000 },
  { id: 'tax' as const, label: 'Налоги', short: 'Налоги', amount: 905000 },
  { id: 'available' as const, label: 'Остаток', short: 'Остаток', amount: 382000 },
];

/* ──────────────────────────────────────────────────────────────── reconcile */

/**
 * The beat the whole page is built around.
 * The line leaves КС-3 row 3 and travels down the bank column. It stops on
 * `decoyIndex` — the amount is identical to the ruble — reads the payer,
 * rejects it, carries on, and locks onto `matchIndex`.
 */
export const reconcile = {
  left: acts,
  right: bank,
  sourceIndex: 2,
  decoyIndex: 1,
  decoyReason: 'сумма сошлась · плательщик — нет',
  matchIndex: 3,
  differenceLabel: 'Расхождение к разбору',
  difference: 0,
  /*
   * The pencil marks in the margin, in the order a hand writes them. See the
   * note in story.en.ts for why the figures live here and the geometry does not.
   *
   * This month's arithmetic: the four КС-3 lines (2 620 + 1 720 + 800 + 260 =
   * 5 400), the bank running total with the savings transfer still inside it
   * (6 200), that transfer taken back out, and nought left to explain. Dates are
   * written the way a Russian hand writes them — 04.03, not Mar 04 — and the
   * decoy is queried as «свой счёт?», which is exactly the doubt it raises.
   */
  working: [
    '2 620 000',
    '1 720 000',
    '800 000',
    '04.03',
    '260 000',
    'свой счёт?',
    '1 720 000',
    '800 000',
    '18.03',
    '5 400 000',
    '23.03',
    '800 000',
    '6 200 000',
    '260 000',
    '−800 000',
    '5 400 000',
    '=5 400 000',
    '0,00',
  ],
};

/* ─────────────────────────────────────────────────────────────── understand */

export const understand = {
  earned: {
    id: 'earned',
    question: 'Заработали или нет?',
    answer: 382000,
    plain: 'осталось после зарплат, расходов и отложенных налогов',
    lines: [
      { label: 'Закрыто по КС-3', amount: 5400000 },
      { label: 'Зарплата', amount: -783000 },
      { label: 'Расходы', amount: -3330000 },
      { label: 'Отложено на налоги', amount: -905000 },
    ],
  },
  /*
   * The gap between the two figures above and below is the whole argument of
   * this line: the month earned 540 000 ₽ and the account grew by 65 000 ₽,
   * because the difference left through the owner, the loan and the bank.
   */
  cash: {
    id: 'cash',
    question: 'Свободных денег стало больше, чем месяц назад?',
    answer: 57000,
    plain: 'больше, чем лежало на 1 марта',
    lines: [
      { label: 'Пришло на счёт', amount: 5400000 },
      { label: 'Зарплата', amount: -783000 },
      { label: 'Расходы', amount: -3330000 },
      { label: 'Отложено на отдельный счёт', amount: -905000 },
      { label: 'Выплата собственнику', amount: -100000 },
      { label: 'Кредит на технику, тело', amount: -180000 },
      { label: 'Комиссия за банковскую гарантию', amount: -45000 },
    ],
  },
  balance: {
    id: 'balance',
    question: 'Ничего не потерялось?',
    answer: 12000000,
    plain: 'с обеих сторон — всё сходится',
    assets: [
      { label: 'Деньги на счетах', amount: 2734000 },
      { label: 'Дебиторка по КС-3', amount: 4900000 },
      { label: 'Гарантийные удержания', amount: 1380000 },
      { label: 'Техника, остаточная', amount: 2986000 },
    ],
    claims: [
      { label: 'Поставщики и субподряд', amount: 3180000 },
      { label: 'Кредитная линия', amount: 2400000 },
      { label: 'Лизинг техники', amount: 1620000 },
      { label: 'Собственный капитал', amount: 4800000 },
    ],
  },
};

/*
 * The close.
 *
 * The firm promises a closed month "до 10-го числа" in `firm.ru.ts`, and the
 * closing scene prints that promise as a date on a stamp. The month names are
 * nominative because that is the form the folder tabs carry; `lib/date.ts`
 * puts them into the genitive when a date is written out.
 *
 * Nine characters is the tab's budget, and every Russian month name fits.
 */
const MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

const periodIndex = MONTHS.indexOf(period);
if (periodIndex < 0) {
  throw new Error(`story.ru.ts — period "${period}" is not a month name; the close cannot date itself.`);
}

/** Offset in months from the illustrated period. -1 is the month before it. */
const monthAt = (offset: number) => MONTHS[(periodIndex + offset + 12 * 4) % 12]!;

/*
 * A month is shut in the month AFTER it — March's books are stamped on the
 * tenth of April. Carrying `closedOn` beside each name rather than deriving it
 * at the point of use is what stops the shelf printing "10 ЯНВ" on January's
 * folder, which is a date that could not have happened.
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

export const meta = { client, period, currency: '₽' };

/* ──────────────────────────────────────────────────── build-time arithmetic */

const F = 'story.ru.ts';

for (const doc of [acts, payroll, operating, tax]) {
  must(F, `${doc.id} rows`, sum(doc.rows.map((r) => r.amount)), doc.total);
}
must(F, 'bank deposits less transfers', sum(bank.rows.filter((r) => !r.excluded).map((r) => r.amount)), bank.total);
must(F, 'buckets vs inflow', sum(buckets.map((b) => b.amount)), acts.total);
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
  acts.rows[reconcile.sourceIndex]!.amount,
);
must(
  F,
  'reconcile match must share the source amount',
  bank.rows[reconcile.matchIndex]!.amount,
  acts.rows[reconcile.sourceIndex]!.amount,
);
