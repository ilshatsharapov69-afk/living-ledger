/**
 * The scroll engine. Takt 2.
 *
 * One job: turn `window.scrollY` into a set of 0..1 numbers written into CSS
 * custom properties, one per scene, plus a global `--story-p`.
 *
 * Three properties this must have, and how each is obtained:
 *
 *  · DETERMINISTIC — the target for every scene is a pure function of scrollY
 *    and the measured layout. Nothing accumulates, nothing depends on delta or
 *    direction, so arriving at a scroll position by wheel, by drag or by
 *    anchor jump produces the identical scene.
 *
 *  · PER-FRAME SMOOTH — a mouse wheel arrives in 100px steps. Raw scrollY makes
 *    scrubbed motion look like a flip-book, so the written value chases the
 *    target with a fixed-rate lerp and snaps when it is within a rounding
 *    error. The target is still pure; only the approach is damped.
 *
 *  · CHEAP — values are written on the scene element, not on :root, so style
 *    invalidation stays inside that scene's subtree. The loop parks itself when
 *    everything has settled and nothing is scrolling.
 *
 * Deliberately not GSAP: ScrollTrigger's pinning injects spacer elements and
 * re-measures on every resize, which is the class of bug that made v1's scroll
 * timing unpredictable. Pinning here is `position: sticky`, which the browser
 * gets right for free.
 */

/**
 * pin   — the scene is taller than the viewport and holds something sticky.
 *         0 when its top hits the top of the viewport, 1 when its bottom hits
 *         the bottom.
 * span  — progress runs a fixed distance from the moment the scene's top
 *         reaches the top of the viewport. For scenes taller than their own
 *         animation.
 * enter — progress runs a fixed distance from the moment the scene's top
 *         reaches the BOTTOM of the viewport. The only mode that works for a
 *         section near the end of the document, where there is not enough
 *         scroll left for its top to ever reach the top of the screen.
 */
type SceneMode = 'pin' | 'span' | 'enter';

interface Scene {
  el: HTMLElement;
  name: string;
  mode: SceneMode;
  /** vh multiplier, only for mode 'span'. */
  span: number;
  /** Absolute document Y where progress is 0. */
  start: number;
  /** Scroll distance over which progress runs 0 → 1. Never 0. */
  len: number;
  value: number;
  target: number;
}

const LERP = 0.16;
const SNAP = 0.0004;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * A block that only exists for part of its scene.
 *
 * `data-vis="0 0.13"` — outside that slice of the scene's progress the element
 * gets `.is-out`, which is visibility and pointer-events, not display. Opacity
 * alone would leave an invisible headline sitting over the middle of the desk
 * catching clicks and being read aloud by a screen reader.
 */
interface Gate {
  el: HTMLElement;
  scene: Scene | null;
  from: number;
  to: number;
  out: boolean | null;
}

let gates: Gate[] = [];

/* ─────────────────────────────────────────────────── how far the band reaches */

/**
 * An element that has to start below the heading band above it.
 *
 * `<div class="spl__stage" data-band-clear>` gets `--lead` written on it: the
 * number of pixels the band's box hangs below this element's own top edge.
 *
 * This is measured rather than modelled, and that is the whole point. The band
 * is absolutely positioned over the top of a pinned scene, and its height is
 * whatever four cross-faded headings plus the tallest supporting line come to at
 * this width — a function of the type scale, the wrap point of the copy and two
 * height-dependent media queries. Every attempt to predict it in `calc()` was a
 * hand-tuned fraction that held at the width it was tuned on and ruled a line
 * through the heading everywhere else. The layout engine already knows the
 * answer; this asks it.
 */
interface BandClear {
  el: HTMLElement;
  band: HTMLElement;
  last: number;
}

let clears: BandClear[] = [];

/* ────────────────────────────────────────────────────── running numbers */

/**
 * A number that counts up over a slice of its scene's progress.
 *
 * `data-count-to="84200" data-count-at="0.3 0.68" data-count-fmt="usd0"`
 *
 * This exists because the reward on this site is always a number arriving, and
 * a number that is simply revealed is not the same event as a number that runs
 * up in your hands. Every beat needs it, so it belongs in the engine.
 */
interface Counter {
  el: HTMLElement;
  scene: Scene | null;
  from: number;
  to: number;
  start: number;
  end: number;
  format: (n: number) => string;
  last: string;
}

const FORMATS: Record<string, (n: number) => string> = {
  usd0: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format,
  usd2: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format,
  plain: new Intl.NumberFormat('en-US').format,
};

let counters: Counter[] = [];

let scenes: Scene[] = [];

/**
 * Two global signals, because they measure different things.
 *
 *   --page-p   how far down the whole document we are. Drives the desk: the
 *              lamp travels and the surface warms from the first screen to the
 *              footer.
 *   --story-p  how far through `[data-story]` we are, 0 if there is no story on
 *              the page yet. Drives the value in the corner, which must never
 *              run ahead of the beat that earns it.
 *   --past-story  0 while the story is on screen, 1 once it has left the top.
 *              `--story-p` cannot answer this: it saturates at 1 on the story's
 *              last frame and stays there for the rest of the document, so
 *              anything hung off it becomes furniture over the sections below.
 */
let storyEl: HTMLElement | null = null;
let storyStart = 0;
let storyLen = 1;
let storyValue = 0;
let storyTarget = 0;
let pastValue = 0;
let pastTarget = 0;
let pageValue = 0;
let pageTarget = 0;

/*
 * Wind.
 *
 * Before the visitor scrolls, the papers are loose: they breathe and they lean
 * away from the cursor. The moment the fall starts, the scene's own progress
 * damps this to nothing — order is order, and a stack that still wobbles under
 * the mouse would undo the whole point of the beat.
 *
 * It is a wave rather than an offset. The same pointer position is published on
 * three channels that chase it at different rates, and each sheet subscribes to
 * one: near paper answers at once, far paper answers late and less. That lag is
 * the whole difference between "the page tracks my mouse" and "I disturbed the
 * air over a desk".
 *
 * `--ptr-v` is how hard the air is moving — the gap between where the pointer is
 * and where the fastest channel has got to, which is proportional to speed. It
 * rises fast and falls slowly, so a flick across the screen sets the paper going
 * and it takes a moment to settle. That is the gust.
 */
interface WindChannel {
  lerp: number;
  x: number;
  y: number;
  kx: string;
  ky: string;
}

const WIND: WindChannel[] = [
  { lerp: 0.155, x: 0, y: 0, kx: '--ptr-x', ky: '--ptr-y' },
  { lerp: 0.068, x: 0, y: 0, kx: '--ptr-x2', ky: '--ptr-y2' },
  { lerp: 0.03, x: 0, y: 0, kx: '--ptr-x3', ky: '--ptr-y3' },
];

/** Gust rises in ~5 frames, dies out over ~1.5s. */
const GUST_ATTACK = 0.34;
const GUST_DECAY = 0.038;

let ptrEls: HTMLElement[] = [];
let ptrTargetX = 0;
let ptrTargetY = 0;
let gust = 0;
let ptrEnabled = false;

let running = false;
let instant = false;
const root = document.documentElement;

function collect() {
  scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map((el) => ({
    el,
    name: el.dataset.scene || 'scene',
    mode: (el.dataset.sceneMode as SceneMode) || 'pin',
    span: Number(el.dataset.sceneSpan ?? 1),
    start: 0,
    len: 1,
    value: 0,
    target: 0,
  }));
  storyEl = document.querySelector<HTMLElement>('[data-story]');
  ptrEls = Array.from(document.querySelectorAll<HTMLElement>('[data-pointer]'));

  counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]')).map((el) => {
    const [start = '0', end = '1'] = (el.dataset.countAt ?? '0 1').split(/\s+/);
    const host = el.closest<HTMLElement>('[data-scene]');
    return {
      el,
      scene: scenes.find((s) => s.el === host) ?? null,
      from: Number(el.dataset.countFrom ?? 0),
      to: Number(el.dataset.countTo ?? 0),
      start: Number(start),
      end: Number(end),
      format: FORMATS[el.dataset.countFmt ?? 'usd0'] ?? FORMATS.plain!,
      last: '',
    };
  });

  clears = Array.from(document.querySelectorAll<HTMLElement>('[data-band-clear]'))
    .map((el) => {
      const band = el.closest('[data-scene]')?.querySelector<HTMLElement>('.band');
      return band ? { el, band, last: -1 } : null;
    })
    .filter((c): c is BandClear => c !== null);

  gates = Array.from(document.querySelectorAll<HTMLElement>('[data-vis]')).map((el) => {
    const [from = '0', to = '1'] = (el.dataset.vis ?? '0 1').split(/\s+/);
    const host = el.closest<HTMLElement>('[data-scene]');
    return {
      el,
      scene: scenes.find((s) => s.el === host) ?? null,
      from: Number(from),
      to: Number(to),
      out: null,
    };
  });
}

function measure() {
  const vh = window.innerHeight;
  const y = window.scrollY;

  for (const s of scenes) {
    const rect = s.el.getBoundingClientRect();
    const top = rect.top + y;
    if (s.mode === 'span') {
      s.start = top;
      s.len = Math.max(1, s.span * vh);
    } else if (s.mode === 'enter') {
      s.start = top - vh;
      s.len = Math.max(1, s.span * vh);
    } else {
      s.start = top;
      s.len = Math.max(1, rect.height - vh);
    }
  }

  if (storyEl) {
    const rect = storyEl.getBoundingClientRect();
    storyStart = rect.top + y;
    storyLen = Math.max(1, rect.height - vh);
  }

  // Written whole-pixel and only on change: `--lead` feeds a scalar that sizes
  // every object on the desk, so a value that jitters by a fraction between
  // frames would breathe the whole scene.
  for (const c of clears) {
    const lead = Math.max(
      0,
      Math.round(c.band.getBoundingClientRect().bottom - c.el.getBoundingClientRect().top),
    );
    if (lead !== c.last) {
      c.last = lead;
      c.el.style.setProperty('--lead', `${lead}px`);
    }
  }
}

function readTargets() {
  const y = window.scrollY;
  for (const s of scenes) s.target = clamp01((y - s.start) / s.len);
  storyTarget = storyEl ? clamp01((y - storyStart) / storyLen) : 0;
  // A quarter of a screen after the story's last frame it is gone, and so is
  // anything that was reporting on it.
  pastTarget = storyEl
    ? clamp01((y - (storyStart + storyLen)) / Math.max(1, window.innerHeight * 0.25))
    : 0;
  pageTarget = clamp01(y / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
}

/** Returns true if anything is still moving. */
function apply(): boolean {
  let moving = false;

  for (const s of scenes) {
    const next = step(s.value, s.target);
    if (next !== s.value) {
      s.value = next;
      s.el.style.setProperty('--p', next.toFixed(4));
    }
    if (next !== s.target) moving = true;
  }

  const nextStory = step(storyValue, storyTarget);
  if (nextStory !== storyValue) {
    storyValue = nextStory;
    root.style.setProperty('--story-p', nextStory.toFixed(4));
  }
  if (nextStory !== storyTarget) moving = true;

  const nextPast = step(pastValue, pastTarget);
  if (nextPast !== pastValue) {
    pastValue = nextPast;
    root.style.setProperty('--past-story', nextPast.toFixed(4));
  }
  if (nextPast !== pastTarget) moving = true;

  const nextPage = step(pageValue, pageTarget);
  if (nextPage !== pageValue) {
    pageValue = nextPage;
    root.style.setProperty('--page-p', nextPage.toFixed(4));
  }
  if (nextPage !== pageTarget) moving = true;

  if (ptrEnabled && ptrEls.length) {
    let windMoving = false;

    for (const c of WIND) {
      const nx = instant ? ptrTargetX : c.x + (ptrTargetX - c.x) * c.lerp;
      const ny = instant ? ptrTargetY : c.y + (ptrTargetY - c.y) * c.lerp;
      const settled = Math.abs(nx - ptrTargetX) < 0.0008 && Math.abs(ny - ptrTargetY) < 0.0008;
      c.x = settled ? ptrTargetX : nx;
      c.y = settled ? ptrTargetY : ny;
      if (!settled) windMoving = true;
      for (const el of ptrEls) {
        el.style.setProperty(c.kx, c.x.toFixed(4));
        el.style.setProperty(c.ky, c.y.toFixed(4));
      }
    }

    // Distance the leading channel is still behind the pointer ≈ how fast the
    // pointer is going, without having to time anything.
    const lead = WIND[0]!;
    const speed = Math.min(1, Math.hypot(ptrTargetX - lead.x, ptrTargetY - lead.y) * 3.2);
    const rate = speed > gust ? GUST_ATTACK : GUST_DECAY;
    const nextGust = instant ? 0 : gust + (speed - gust) * rate;
    if (Math.abs(nextGust - gust) > 0.0008) {
      gust = nextGust;
      windMoving = true;
      for (const el of ptrEls) el.style.setProperty('--ptr-v', gust.toFixed(4));
    }

    if (windMoving) moving = true;
  }

  for (const g of gates) {
    const p = g.scene ? g.scene.value : storyValue;
    const out = p < g.from || p > g.to;
    if (out !== g.out) {
      g.out = out;
      g.el.classList.toggle('is-out', out);
    }
  }

  for (const c of counters) {
    const p = c.scene ? c.scene.value : storyValue;
    const t = clamp01((p - c.start) / Math.max(1e-6, c.end - c.start));
    const text = c.format(Math.round(c.from + (c.to - c.from) * t));
    if (text !== c.last) {
      c.last = text;
      c.el.textContent = text;
    }
  }

  return moving;
}

function step(value: number, target: number): number {
  if (instant) return target;
  const delta = target - value;
  if (Math.abs(delta) < SNAP) return target;
  return value + delta * LERP;
}

function frame() {
  readTargets();
  const moving = apply();
  if (moving) {
    requestAnimationFrame(frame);
  } else {
    running = false;
  }
}

function wake() {
  if (running) return;
  running = true;
  requestAnimationFrame(frame);
}

function remeasure() {
  measure();
  readTargets();
  wake();
}

export function initEngine() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  instant = mq.matches;
  mq.addEventListener('change', (e) => {
    instant = e.matches;
    ptrEnabled = canPoint();
    if (!ptrEnabled) calmTheAir();
    wake();
  });

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const canPoint = () => fine.matches && !mq.matches;
  const calmTheAir = () => {
    ptrTargetX = 0;
    ptrTargetY = 0;
    gust = 0;
    for (const c of WIND) {
      c.x = 0;
      c.y = 0;
    }
    for (const el of ptrEls) {
      for (const c of WIND) {
        el.style.setProperty(c.kx, '0');
        el.style.setProperty(c.ky, '0');
      }
      el.style.setProperty('--ptr-v', '0');
    }
  };
  ptrEnabled = canPoint();
  fine.addEventListener('change', () => {
    ptrEnabled = canPoint();
    if (!ptrEnabled) calmTheAir();
    wake();
  });

  collect();
  measure();
  readTargets();
  // Land on the correct frame immediately on load / reload mid-page, so a
  // refresh never shows an unresolved scene.
  const wasInstant = instant;
  instant = true;
  apply();
  instant = wasInstant;

  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', remeasure);
  addEventListener('orientationchange', remeasure);

  addEventListener(
    'pointermove',
    (e) => {
      if (!ptrEnabled || e.pointerType !== 'mouse') return;
      ptrTargetX = (e.clientX / window.innerWidth) * 2 - 1;
      ptrTargetY = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    },
    { passive: true },
  );

  // Mouse off the window: the air goes still, but by lerping back rather than
  // snapping — paper does not stop the instant you stop pushing it.
  addEventListener('pointerleave', () => {
    ptrTargetX = 0;
    ptrTargetY = 0;
    wake();
  });

  // Layout moves when webfonts land and when a scene's own height changes.
  if (document.fonts?.ready) document.fonts.ready.then(remeasure);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
  }

  // Two one-way flags the CSS can hang off: the visitor has started, and the
  // visitor is past the first screen (the masthead condenses).
  const flags = () => {
    const y = window.scrollY;
    if (y > 4) root.dataset.engaged = 'true';
    root.dataset.past = y > 72 ? 'true' : 'false';
  };
  addEventListener('scroll', flags, { passive: true });
  flags();

  // QA handle. `settle()` jumps every scene straight to its target, which is
  // how the takt-2 criterion gets checked: scroll to a position by any route,
  // settle, read — the numbers must be identical every time. It also sidesteps
  // requestAnimationFrame throttling in a background tab.
  (window as unknown as { __ledger: unknown }).__ledger = {
    settle() {
      measure();
      readTargets();
      const was = instant;
      instant = true;
      apply();
      instant = was;
      return this.read();
    },
    read() {
      return {
        y: window.scrollY,
        page: pageValue,
        story: storyValue,
        scenes: Object.fromEntries(scenes.map((s) => [s.name, s.value])),
      };
    },
  };

  // Debug read-out: append ?debug to the URL.
  if (new URLSearchParams(location.search).has('debug')) mountDebug();
}

function mountDebug() {
  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;' +
    'background:rgb(0 0 0/.78);color:#fff;padding:8px 10px;border-radius:4px;pointer-events:none;' +
    'white-space:pre;letter-spacing:.02em';
  document.body.appendChild(box);
  const tick = () => {
    box.textContent =
      `y ${Math.round(window.scrollY)}\npage  ${pageValue.toFixed(4)}\nstory ${storyValue.toFixed(4)}\n` +
      scenes.map((s) => `${s.name.padEnd(11)} ${s.value.toFixed(4)}`).join('\n');
    requestAnimationFrame(tick);
  };
  tick();
}
