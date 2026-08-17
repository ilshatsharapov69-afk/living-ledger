/**
 * Build both languages and publish them to a Cloudflare Pages project on a
 * subdomain of setpointaudit.com.
 *
 *   node scripts/deploy-cf.js                      → demo.setpointaudit.com
 *   node scripts/deploy-cf.js acme                 → acme.setpointaudit.com
 *   node scripts/deploy-cf.js acme --skip-build    → reuse whatever is in dist/
 *
 * WHY A SUBDOMAIN PER CLIENT
 *
 * Each prospect gets a link that shows only their demo. A shared subpath would
 * mean one build holding every client at once: editing one prospect's copy
 * would rebuild and republish all of them, and a curious visitor could walk up
 * a directory and read the pitch written for someone else.
 *
 * WHY THIS IS IDEMPOTENT
 *
 * Every step checks before it creates. Run it twice on the same slug and the
 * second run just pushes new files — it does not duplicate the project, the
 * custom domain or the DNS record. That matters because the usual reason to run
 * it is "I changed one line of copy", not "set up a new client".
 *
 * CREDENTIALS
 *
 * `.env` in the repo root, which is gitignored:
 *
 *   CLOUDFLARE_API_TOKEN=...     Account → Cloudflare Pages: Edit
 *   CLOUDFLARE_ACCOUNT_ID=...    Zone    → DNS: Edit, Zone: Read
 *
 * Nothing here writes the token to a log line or to the deployed output.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ZONE = 'setpointaudit.com';
const API = 'https://api.cloudflare.com/client/v4';

/* ---------------------------------------------------------------- arguments */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const slug = argv.find((a) => !a.startsWith('--')) ?? 'demo';

if (!/^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/.test(slug)) {
  throw new Error(
    `"${slug}" cannot be a subdomain. Use lowercase letters, digits and hyphens, ` +
      `not starting or ending with a hyphen.`,
  );
}

/* The flagship demo keeps the project name it was created with; everyone else
   gets a project named after their subdomain. */
const project = slug === 'demo' ? 'living-ledger' : `demo-${slug}`;
const host = `${slug}.${ZONE}`;

/* ------------------------------------------------------------ credentials */

const envPath = '.env';
if (!existsSync(envPath)) {
  throw new Error(
    '.env is missing. It needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID — ' +
      'see the header of this file for the scopes.',
  );
}
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const TOKEN = env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !ACCOUNT) throw new Error('.env is missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID');

/* ------------------------------------------------------------------- api */

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const body = await res.json();
  if (!body.success) {
    /* Cloudflare's own message is the useful part; the HTTP status alone never
       says which field it disliked. */
    throw new Error(`${init.method ?? 'GET'} ${path} → ${JSON.stringify(body.errors)}`);
  }
  return body.result;
}

const step = (msg) => console.log(`\n— ${msg} —`);

/* ------------------------------------------------------------------ build */

if (!flags.has('--skip-build')) {
  step('building both languages');
  /* No `--pages`: this serves from a domain root, so asset paths stay absolute
     from `/`. The GitHub Pages deploy is the one that needs the repo prefix. */
  execFileSync(process.execPath, ['scripts/build-both.js'], { stdio: 'inherit' });
}

for (const f of [join('dist', 'index.html'), join('dist', 'ru', 'index.html')]) {
  if (!existsSync(f)) throw new Error(`${f} is missing — run without --skip-build`);
}

/* --------------------------------------------------------------- project */

step(`Pages project "${project}"`);
const projects = await cf(`/accounts/${ACCOUNT}/pages/projects`);
if (projects.some((p) => p.name === project)) {
  console.log('already exists');
} else {
  await cf(`/accounts/${ACCOUNT}/pages/projects`, {
    method: 'POST',
    body: JSON.stringify({ name: project, production_branch: 'main' }),
  });
  console.log('created');
}

/* ---------------------------------------------------------------- upload */

step(`uploading dist/ to ${project}`);
execFileSync(
  process.execPath,
  [
    'node_modules/wrangler/bin/wrangler.js',
    'pages',
    'deploy',
    'dist',
    `--project-name=${project}`,
    '--branch=main',
    '--commit-dirty=true',
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, CLOUDFLARE_API_TOKEN: TOKEN, CLOUDFLARE_ACCOUNT_ID: ACCOUNT },
  },
);

/* ------------------------------------------------------------------- dns */

step(`DNS ${host} → ${project}.pages.dev`);
const [zone] = await cf(`/zones?name=${ZONE}`);
if (!zone) throw new Error(`zone ${ZONE} is not on this Cloudflare account`);

const existing = await cf(`/zones/${zone.id}/dns_records?name=${host}`);
if (existing.length) {
  console.log(`already points at ${existing[0].content}`);
} else {
  /* Attaching the custom domain does NOT create this record — measured
     2026-08-17, the domain sat at "pending" until the CNAME existed. */
  await cf(`/zones/${zone.id}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'CNAME',
      name: slug,
      content: `${project}.pages.dev`,
      proxied: true,
      comment: `Demo site — Cloudflare Pages project ${project}`,
    }),
  });
  console.log('created');
}

/* --------------------------------------------------------- custom domain */

step(`custom domain ${host}`);
const domains = await cf(`/accounts/${ACCOUNT}/pages/projects/${project}/domains`);
if (domains.some((d) => d.name === host)) {
  console.log('already attached');
} else {
  await cf(`/accounts/${ACCOUNT}/pages/projects/${project}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: host }),
  });
  console.log('attached');
}

/* ------------------------------------------------------------------ wait */

step('waiting for the certificate');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let live = false;
for (let i = 1; i <= 24; i++) {
  const [d] = (await cf(`/accounts/${ACCOUNT}/pages/projects/${project}/domains`)).filter(
    (x) => x.name === host,
  );
  let code = 0;
  try {
    code = (await fetch(`https://${host}/`, { redirect: 'manual' })).status;
  } catch {
    /* DNS or TLS is not up yet; that is what we are waiting for. */
  }
  console.log(`  ${String(i).padStart(2)} domain=${d?.status ?? '?'} http=${code || 'no answer'}`);
  if (d?.status === 'active' && code === 200) {
    live = true;
    break;
  }
  await sleep(15_000);
}

/* --------------------------------------------------------------- verify */

if (!live) {
  console.log(
    `\nStill not answering after six minutes. The upload succeeded — this is the ` +
      `certificate, which Cloudflare sometimes takes longer over. Check ` +
      `https://${host}/ in a few minutes.`,
  );
  process.exit(1);
}

step('checking both languages');
for (const [path, lang] of [
  ['', 'en'],
  ['ru/', 'ru'],
]) {
  const res = await fetch(`https://${host}/${path}`);
  const html = await res.text();
  /* The one failure this whole script can hide: a deploy that puts the same
     language at both paths. Nothing upstream would notice. */
  if (!html.includes(`lang="${lang}"`)) {
    throw new Error(`https://${host}/${path} is not lang="${lang}"`);
  }
  console.log(`  /${path} → ${res.status}, lang="${lang}"`);
}

console.log(`\nLive:\n  https://${host}/\n  https://${host}/ru/\n`);
