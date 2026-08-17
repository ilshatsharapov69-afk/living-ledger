/**
 * Build-time arithmetic, shared by every locale's month.
 *
 * A demo that can quietly stop adding up is a demo that will. Each locale runs
 * the same checks over its own figures, and both run on every build — so a
 * Russian month that does not balance fails the English build too, rather than
 * waiting to be noticed on a public URL.
 */

export const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

export function must(file: string, label: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(
      `${file} — ${label} does not add up: got ${actual}, expected ${expected}. ` +
        `Fix the rows or fix the total; do not ship a month that lies.`,
    );
  }
}
