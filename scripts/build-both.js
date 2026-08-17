/**
 * Build both languages into one uploadable tree.
 *
 *   dist/            English
 *   dist/ru/         Russian
 *
 * ORDER IS LOAD-BEARING. Astro empties its own `outDir` before it writes, and
 * the Russian build's `outDir` is inside the English one — so English must run
 * first. Reversed, the second build deletes the first.
 *
 * Astro is spawned through `process.execPath` rather than through npm for the
 * reason `deploy-pages.js` documents: Node refuses to spawn a `.cmd` shim
 * without a shell, and `npm` is a `.cmd` on Windows. `SITE_LOCALE` is the
 * non-npm half of the switch in `astro.config.mjs`.
 *
 *   node scripts/build-both.js            → for a domain root
 *   node scripts/build-both.js --pages    → for the GitHub Pages subpath
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const forPages = process.argv.includes('--pages');

const astro = (locale) => {
  console.log(`\n— building ${locale === 'ru' ? 'Russian → dist/ru' : 'English → dist'} —`);
  execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      SITE_LOCALE: locale,
      ...(forPages ? { PAGES_BUILD: '1' } : {}),
    },
  });
};

rmSync('dist', { recursive: true, force: true });
astro('en');
astro('ru');

/*
 * Both documents have to exist and each has to be in its own language. A
 * Russian build that silently inherited the English locale is the one failure
 * this script can actually have, and it is invisible in the build log.
 */
for (const [file, lang] of [
  [join('dist', 'index.html'), 'en'],
  [join('dist', 'ru', 'index.html'), 'ru'],
]) {
  if (!existsSync(file)) throw new Error(`${file} was not built`);
  const head = readFileSync(file, 'utf8').slice(0, 2000);
  if (!head.includes(`lang="${lang}"`)) {
    throw new Error(`${file} is not marked lang="${lang}" — the locale switch did not take`);
  }
}

console.log('\nBoth languages built. English at dist/, Russian at dist/ru/.');
