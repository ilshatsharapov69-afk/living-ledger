/**
 * Find Latin-script words in the rendered Russian pages.
 *
 *   node scripts/latin-scan.js dist/ru/index.html
 *   node scripts/latin-scan.js dist/ru/legal/index.html
 *
 * WHY THIS EXISTS
 *
 * The hero shipped reading «for строительных подрядчиков in Татарстане»,
 * because `Opening.astro` wrote the prepositions straight into the template:
 *
 *     <span class="say__line-b">
 *       for {firm.audience.clientType} in {firm.audience.homeState}.
 *     </span>
 *
 * No type error, no build failure, no lint. The Russian config was correct; the
 * component was not, and nothing that reads the SOURCES could see it. Scanning
 * the OUTPUT catches that whole class of bug wherever it hides — template text
 * nodes, aria-labels, alt text, title attributes, and anything simply left
 * untranslated in the Russian content files.
 *
 * Run it after any change to a component that prints words.
 *
 * The allow-list below is short on purpose. Every entry is Latin that is
 * CORRECT on a Russian page: the two messenger brands, the email domain, and
 * the language switcher, which is deliberately written in the language it
 * offers — a reader who cannot read this page cannot read «английская версия»
 * either. Add to it only for the same kind of reason, never to silence a
 * finding.
 */
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const ALLOWED = new Set([
  'EN',
  'RU',
  'English',
  'version',
  'Telegram',
  'WhatsApp',
  'nbsp',
  'svod-uchet',
  'mail',
  'ru',
  'com',
  'https',
  'http',
  'www',
]);

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/latin-scan.js <path/to/index.html>');
  process.exit(2);
}

const html = readFileSync(file, 'utf8');

/* Scripts, styles and comments are not prose and are full of legitimate Latin. */
const body = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');

/* Attributes a screen reader or a tooltip will actually speak. */
const attrs = new Set();
for (const m of body.matchAll(/\b(aria-label|alt|title|placeholder)="([^"]*)"/g)) {
  const words = m[2].match(/[A-Za-z][A-Za-z'’-]+/g) || [];
  if (words.some((w) => !ALLOWED.has(w))) attrs.add(`${m[1]}="${m[2]}"`);
}

const hits = [];
for (const line of body.replace(/<[^>]+>/g, '\n').split('\n')) {
  const t = line.trim();
  if (!t) continue;
  const words = t.match(/[A-Za-z][A-Za-z'’-]+/g);
  if (!words) continue;
  const bad = [...new Set(words.filter((w) => !ALLOWED.has(w)))];
  if (bad.length) hits.push(`[${bad.join(', ')}]  ${t.slice(0, 110)}`);
}

const label = join(basename(dirname(file)), basename(file));
console.log(`— ${label} —`);
console.log(`text nodes with unexpected Latin: ${hits.length}`);
for (const h of hits) console.log('  ' + h);
console.log(`attributes with unexpected Latin: ${attrs.size}`);
for (const a of attrs) console.log('  ' + a);

process.exit(hits.length + attrs.size ? 1 : 0);
