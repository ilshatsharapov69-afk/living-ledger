/**
 * The shape of an illustrated month.
 *
 * Shared by every locale's `story.*.ts`, so a translated month cannot quietly
 * grow a field the components do not render or drop one they do.
 */

export type Row = {
  /** Left column — what the line is. */
  label: string;
  /** Small second line: date, job number, bank descriptor. Optional. */
  meta?: string;
  amount: number;
  /**
   * Which bucket this row belongs to in Classify.
   * `null` means it is money coming in, not an allocation.
   */
  bucket?: BucketId;
  /** Present but not revenue — the near-miss in Reconcile. */
  excluded?: boolean;
};

export type BucketId = 'payroll' | 'operating' | 'tax' | 'available';

/**
 * Paper stock. Five documents that all look like the same white rectangle read
 * as five copies of one thing; five different stocks read as a real month's
 * paperwork. This is the single cheapest way to make the desk believable, and
 * it survives being shrunk to a thumbnail — you can still tell them apart.
 */
export type Stock = 'bond' | 'ledger' | 'tractor' | 'kraft' | 'slip';

export type Doc = {
  id: string;
  /** Printed at the top of the sheet. */
  title: string;
  /** Masthead version, set large. Must survive being read at a glance. */
  short: string;
  /** Second line on the sheet: who and when. */
  meta: string;
  rows: Row[];
  totalLabel: string;
  total: number;
  stock: Stock;
};
