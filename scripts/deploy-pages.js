/**
 * Build for the GitHub Pages subpath and publish the result to `gh-pages`.
 *
 * WHY A SCRIPT AND NOT A GITHUB ACTION
 *
 * The usual way to do this is a workflow file under `.github/workflows/`.
 * Pushing one needs a token with the `workflow` scope, and the `gh` login on
 * this machine has `gist, read:org, repo` only. So the build happens here and
 * only the output is pushed.
 *
 * WHY A SEPARATE CLONE IN .deploy/
 *
 * `gh-pages` holds build output and nothing else — no source, no history worth
 * keeping. Committing it from the main working tree would mean either
 * un-ignoring `dist/` or fighting the index. A throwaway single-branch clone
 * sidesteps both, and because it tracks the real branch we append commits
 * instead of force-pushing over whatever is live.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const REMOTE = 'https://github.com/ilshatsharapov69-afk/living-ledger.git';
const BRANCH = 'gh-pages';
const LIVE = 'https://ilshatsharapov69-afk.github.io/living-ledger/';
const WORK = '.deploy';

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
const capture = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

/*
 * Astro's own entry, not `npm run build:pages`: Node refuses to spawn a `.cmd`
 * shim without a shell, which is what `npm` is on Windows. `PAGES_BUILD` is the
 * non-npm half of the switch in astro.config.mjs — without it this would build
 * for a domain root and every link on the deployed site would be dead.
 */
console.log('\n— building for the Pages subpath —');
rmSync('dist', { recursive: true, force: true });
execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, PAGES_BUILD: '1' },
});

if (!existsSync(join('dist', '.nojekyll'))) {
  /* `_astro/` starts with an underscore, which Jekyll drops. Without this file
     the site deploys and then serves unstyled HTML with no fonts. */
  throw new Error('dist/.nojekyll is missing — Pages would strip _astro/');
}

console.log('\n— refreshing the gh-pages clone —');
if (existsSync(join(WORK, '.git'))) {
  run('git', ['fetch', '--depth', '1', 'origin', BRANCH], WORK);
  run('git', ['reset', '--hard', `origin/${BRANCH}`], WORK);
  run('git', ['clean', '-fdx'], WORK);
} else {
  rmSync(WORK, { recursive: true, force: true });
  run('git', ['clone', '--depth', '1', '--branch', BRANCH, '--single-branch', REMOTE, WORK]);
}

/* Replace the published tree wholesale, so a file deleted from the build is
   deleted from the site too. */
for (const entry of readdirSync(WORK)) {
  if (entry !== '.git') rmSync(join(WORK, entry), { recursive: true, force: true });
}
mkdirSync(WORK, { recursive: true });
cpSync('dist', WORK, { recursive: true });

run('git', ['add', '-A'], WORK);
if (capture(['status', '--porcelain'], WORK) === '') {
  console.log('\nNothing changed since the last deploy. Live site is current.');
  process.exit(0);
}

const source = capture(['rev-parse', '--short', 'HEAD']);
run('git', ['commit', '-m', `Deploy ${source}`], WORK);
run('git', ['push', 'origin', BRANCH], WORK);

console.log(`\nPushed. Pages rebuilds in under a minute:\n  ${LIVE}\n`);
