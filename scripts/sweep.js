/*
 * Layout sweep. Run it in the browser, on the dev server.
 *
 *   1. open http://localhost:4321
 *   2. paste this file into the console
 *   3. await sweepAll()          — every scene, every size
 *      await sweep()             — the opening scene only
 *      await sweepSplit()        — the allocation scene only
 *
 * Returns one entry per viewport size: the string "1440x900" if that size is
 * clean, or an object listing what is wrong.
 *
 * The page is loaded into an iframe that gets resized rather than resizing the
 * browser twenty-five times. Container queries, svh and vw all read the iframe,
 * so one pass covers every size, and the numbers come from the same layout
 * engine that will draw it for a visitor.
 *
 * Sizes include short viewports on purpose. These scenes run out of HEIGHT long
 * before they run out of width — the copy, the heading band and the paper are
 * competing for the same vertical inches — and nearly every failure this
 * harness has caught was a 700-tall laptop or an older phone, not a narrow one.
 *
 * TWO THINGS IT LEARNED THE HARD WAY, both of which produced confident garbage:
 *
 *  · Measure INK, not boxes. A centred block of copy is as wide as its
 *    container; its words are not. Comparing paper against the block rect
 *    condemns compositions that are visually fine. Text is measured with a
 *    Range, which returns one rect per line; only things with a background are
 *    measured as a box.
 *
 *  · Never measure a hidden element. getBoundingClientRect on a display:none
 *    subtree returns 0,0,0,0 — a phantom rect in the top-left corner that
 *    silently swallows the whole viewport into the union and reports every
 *    sheet on the page as a collision. checkVisibility() first, always.
 *
 * And guard boxes are kept SEPARATE. The heading band lives at the top of the
 * frame and the running total at the bottom; unioning them describes a box the
 * height of the screen, which nothing can avoid.
 */

const SIZES = [
  [1920, 900], [1920, 1200], [1600, 900], [1512, 982], [1440, 900], [1440, 700],
  [1366, 768], [1280, 800], [1280, 720], [1100, 900], [1024, 640], [980, 700],
  [901, 900], [860, 844], [860, 1180], [768, 1024], [768, 844], [640, 844],
  [540, 844], [430, 932], [430, 844], [390, 844], [390, 667], [375, 667], [360, 640],
];

const R = (el) => {
  const r = el.getBoundingClientRect();
  return { l: r.left, t: r.top, r: r.right, b: r.bottom };
};

const over = (a, b) => {
  const x = Math.min(a.r, b.r) - Math.max(a.l, b.l);
  const y = Math.min(a.b, b.b) - Math.max(a.t, b.t);
  return x > 2 && y > 2 ? `${Math.round(x)}x${Math.round(y)}` : null;
};

const union = (rs) =>
  rs.reduce((a, r) => ({
    l: Math.min(a.l, r.l),
    t: Math.min(a.t, r.t),
    r: Math.max(a.r, r.r),
    b: Math.max(a.b, r.b),
  }));

/** The rectangle the words of a block actually occupy. */
const ink = (root, doc, boxes = '.stamp') => {
  const rs = [];
  for (const el of root.querySelectorAll('*')) {
    if (!el.checkVisibility()) continue;
    if (el.children.length && !el.matches(boxes)) continue;
    if (el.matches(boxes) || el.matches('.say__cue-rule')) {
      const r = R(el);
      if (r.r - r.l > 0) rs.push(r);
      continue;
    }
    const range = doc.createRange();
    range.selectNodeContents(el);
    for (const r of range.getClientRects()) {
      if (r.width > 1 && r.height > 1) rs.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
    }
  }
  return rs.length ? union(rs) : null;
};

/** Visible and not scrolled past, as opposed to merely present in the DOM. */
const showing = (doc, sel) => {
  const e = doc.querySelector(sel);
  return e && !e.classList.contains('is-out') && lit(e) ? e : null;
};

/*
 * Opacity is how this page hides things, and getBoundingClientRect neither
 * knows nor cares. It also reports the TRANSFORMED box, so an element parked at
 * opacity 0 and scale 1.85 waiting for its cue measures as a large object
 * sticking out of its container. Both facts produced whole columns of confident
 * nonsense; nothing is measured without passing this first.
 */
const lit = (el) => el.checkVisibility() && +getComputedStyle(el).opacity > 0.06;

/*
 * The width the page actually lays out in. `innerWidth` includes the classic
 * scrollbar, so anything centred lands half a scrollbar left of `w / 2` and a
 * centring check fails by a constant eight pixels at every size — which reads
 * exactly like a real off-by-one in the arithmetic being tested.
 */
const frameW = (doc) => doc.documentElement.clientWidth;

/**
 * Runs `check(doc, win, w, h, phase)` at every phase of one scene, at every
 * size, in a resized iframe. `check` pushes strings onto `bad`.
 */
async function run(scene, phases, check) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:0;top:0;border:0;opacity:0.001;z-index:-1';
  document.body.appendChild(frame);

  /* Relative to the page the harness was loaded on, NOT to the origin. A
     GitHub Pages project site lives under /<repo>/, and an origin-rooted src
     loaded a 404 page at every one of the twenty-five sizes and reported the
     whole run as clean, because a page with no scenes on it has nothing to
     collide. */
  const home = new URL('./', location.href).href;
  const load = (w, h) =>
    new Promise((res) => {
      frame.style.width = w + 'px';
      frame.style.height = h + 'px';
      frame.onload = () => res();
      frame.src = `${home}?s=${w}x${h}`;
    });

  const out = [];

  for (const [w, h] of SIZES) {
    await load(w, h);
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    await doc.fonts.ready;
    await new Promise((r) => setTimeout(r, 130));

    const sec = doc.querySelector(`[data-scene="${scene}"]`);
    const len = sec.offsetHeight - win.innerHeight;
    const bad = [];

    for (const ph of phases) {
      win.scrollTo(0, Math.round(sec.offsetTop + ph.p * len));
      // rAF is throttled in a hidden frame; settle() jumps straight to target.
      win.__ledger.settle();
      check({ doc, win, w, h, ph, bad });
    }

    out.push(bad.length ? { size: `${w}x${h}`, bad: [...new Set(bad)] } : `${w}x${h}`);
  }

  frame.remove();
  return out;
}

/* ─────────────────────────────────────────────── scene 1: the month arrives */

window.sweep = () =>
  run(
    'opening',
    /* rest → heaped → held → being sorted → sorted. */
    [
      { n: 'rest', p: 0 },
      { n: 'heap', p: 0.34 },
      { n: 'held', p: 0.44 },
      { n: 'sorting', p: 0.62 },
      { n: 'sorted', p: 0.9 },
    ],
    ({ doc, w, h, ph, bad }) => {
      const idOf = (el) => (el.className.match(/slot--([a-z]+)/) || [, '?'])[1];
      const slots = [...doc.querySelectorAll('.slot')].filter(
        (s) => getComputedStyle(s).display !== 'none',
      );

      /* Whatever the visitor is reading right now must not have paper on it. */
      const guards = [];
      if (ph.n === 'rest') {
        guards.push(['hero', ink(doc.querySelector('.say--hero'), doc)]);
      } else {
        for (const sel of ['.band__beat--arrive', '.band__beat--sort', '.tally', '.onward']) {
          const e = showing(doc, sel);
          if (e) guards.push([sel.slice(1).replace('band__beat--', ''), ink(e, doc)]);
        }
      }
      for (const [name, box] of guards) {
        if (!box) continue;
        if (box.b > h - 2 || box.t < 2) bad.push(`${ph.n} ${name} overflows the frame`);
        for (const s of slots) {
          const o = over(R(s), box);
          if (o) bad.push(`${ph.n} ${idOf(s)} on ${name} ${o}`);
        }
      }

      for (const s of slots) {
        const d = s.querySelector('.doc');
        if (d && d.scrollWidth > d.clientWidth + 1) bad.push(`${ph.n} ${idOf(s)} text escapes sheet`);
      }

      for (const s of slots) {
        const r = R(s);
        const cropped = r.l < 2 || r.t < 2 || r.r > w - 2 || r.b > h - 2;
        const seen =
          Math.max(0, Math.min(r.r, w) - Math.max(r.l, 0)) *
          Math.max(0, Math.min(r.b, h) - Math.max(r.t, 0));
        // At rest every sheet is paper running off the edge of the picture. One
        // that sits wholly inside the frame reads as a card someone placed.
        if (ph.n === 'rest' && !cropped) bad.push(`rest ${idOf(s)} not cropped`);
        if (ph.n === 'rest' && seen < 2200) bad.push(`rest ${idOf(s)} barely visible`);
        if (ph.n === 'sorted' && !s.className.includes('noise') && cropped) {
          bad.push(`sorted ${idOf(s)} clipped by frame`);
        }
      }

      if (ph.n === 'sorted') {
        const mast = R(doc.querySelector('.masthead__sheet'));
        for (const s of slots) {
          if (s.className.includes('noise')) continue;
          if (over(R(s), mast)) bad.push(`sorted ${idOf(s)} under letterhead`);
        }
        // Five separate documents is the whole point of the beat — but only on a
        // wide screen. The narrow layout sorts them into a cascade, where
        // overlapping is the design.
        if (w >= 901) {
          const real = slots.filter((s) => !s.className.includes('noise'));
          for (let i = 0; i < real.length; i++) {
            for (let j = i + 1; j < real.length; j++) {
              if (over(R(real[i]), R(real[j]))) {
                bad.push(`sorted ${idOf(real[i])}/${idOf(real[j])} overlap`);
              }
            }
          }
        }
      }
    },
  );

/* ───────────────────────────────────────────────── scene 3: the month splits */

/*
 * What can go wrong here is different from the opening, so it is checked
 * differently. Nothing is scattered and nothing is cropped on purpose — the
 * strip, the working and the answer are one column, and the failure modes are
 * a column too tall for a short screen, a caption clipped inside a slice of
 * strip too narrow to hold it, and the strip's own arithmetic: the piece that
 * stays has to finish dead centre at every width, because that centring is
 * computed from the amounts rather than positioned by hand.
 */
window.sweepSplit = () =>
  run(
    'allocate',
    [
      { n: 'poured', p: 0.05 },
      { n: 'payroll', p: 0.26 },
      { n: 'operating', p: 0.5 },
      { n: 'held', p: 0.68 },
      { n: 'counted', p: 0.97 },
    ],
    ({ doc, w, h, ph, bad }) => {
      const scene = doc.querySelector('[data-scene="allocate"]');
      const pin = scene.querySelector('.spl__pin');
      const pinBox = R(pin);
      const style = getComputedStyle(pin);
      /* The content box: paper is MEANT to run out past it and be cropped by
         the frame, so the guard is the frame, not the stage. */
      const frame = {
        l: 2,
        t: pinBox.t + parseFloat(style.paddingTop),
        r: frameW(doc) - 2,
        b: pinBox.b - 2,
      };

      const band = [...scene.querySelectorAll('.band__beat')].find(
        (b) => !b.classList.contains('is-out') && lit(b),
      );
      const bandInk = band ? ink(band, doc) : null;

      /* 1 · the month's own outline never leaves the picture. */
      const foot = scene.querySelector('.foot');
      if (lit(foot)) {
        const f = R(foot);
        if (f.t < frame.t - 1 || f.b > frame.b || f.l < -1 || f.r > frameW(doc) + 1) {
          bad.push(`${ph.n} the footprint is outside the frame`);
        }
        if (bandInk && over(f, bandInk)) bad.push(`${ph.n} the footprint reaches the heading`);
      }

      /* 2 · nothing has left the desk before it is meant to. */
      if (ph.n === 'poured') {
        for (const el of scene.querySelectorAll('.wad')) {
          const r = R(el);
          if (r.t < frame.t || r.b > frame.b) bad.push(`${ph.n} a bundle is already off the desk`);
        }
      }

      /*
       * 2b · and nothing leaves through the FLOOR.
       *
       * Money exiting at the left edge is a claim dragging it out of shot, which
       * is the beat. The bottom edge is not an edge of the picture in the same
       * sense — it is where the page carries on — so a bundle still at full
       * strength when it crosses reads as a rendering fault, not as an exit.
       */
      for (const el of scene.querySelectorAll('.wad')) {
        if (lit(el) && R(el).b > frame.b) {
          bad.push(`${ph.n} a bundle is sliced by the bottom of the frame`);
        }
      }

      /*
       * 3 · the closing image is TWO objects. If a rescin's amounts ever made
       * the kept block and the held group tall enough to meet, the last frame
       * would be a pile-up — and the sentence beside it points at two things.
       */
      if (ph.n === 'counted') {
        const kept = [...scene.querySelectorAll('.wad--available')].filter(lit).map(R);
        const fence = scene.querySelector('.fence');
        if (!kept.length) bad.push('counted nothing is left on the desk');
        if (kept.length && lit(fence)) {
          const block = union(kept);
          const o = over(block, R(fence));
          if (o) bad.push(`counted what is kept overlaps what is held ${o}`);
        }
        const figure = [...scene.querySelectorAll('.spl__step')].filter(lit)[0];
        if (figure) {
          const g = ink(figure.parentElement, doc);
          if (g && (g.r > frameW(doc) - 2 || g.b > frame.b)) {
            bad.push('counted the answer is outside the frame');
          }
        }
      }

      /* 4 · the working and the paper are not allowed to share pixels. */
      const work = scene.querySelector('.spl__work');
      const workInk = ink(work, doc);
      if (workInk) {
        if (bandInk && over(workInk, bandInk)) bad.push(`${ph.n} working on the heading`);
        if (workInk.b > frame.b) bad.push(`${ph.n} working reaches the foot`);
        for (const el of scene.querySelectorAll('.claim')) {
          if (!lit(el)) continue;
          const o = over(R(el), workInk);
          if (o) bad.push(`${ph.n} a claim ticket lands on the working ${o}`);
        }
      }

      /*
       * 5 · a leader that has collapsed means the label and the amount have
       * eaten the row. Only FINISHED rows count: the leader draws itself left
       * to right with a scale, so a row caught mid-write is short on purpose
       * and reporting it is the harness measuring an animation, not a fault.
       */
      for (const row of scene.querySelectorAll('.spl__row')) {
        if (+getComputedStyle(row).opacity < 0.97) continue;
        const lead = row.querySelector('.spl__leader');
        if (R(lead).r - R(lead).l < 12) bad.push(`${ph.n} working row has no leader left`);
      }
    },
  );

/* ────────────────────────────────────────────── the marks between the scenes */

/*
 * The pencil marks, checked as GEOMETRY rather than by eye.
 *
 * Three versions of these shipped broken, each looking right at 1440 and ending
 * in mid-air everywhere else, because a path endpoint was a hand-picked
 * percentage of the frame while the paper it pointed at was placed by layout.
 * Those two only ever agree at the width they were tuned on, and no amount of
 * looking at one screen will tell you.
 *
 * So: every mark's two endpoints are read out of the path itself, mapped to
 * screen coordinates through the SVG's own matrix, and required to land inside
 * the sheet they belong to. A mark whose ends are both under paper cannot be
 * seen to stop short of anything.
 *
 * WHAT CHANGED, AND WHY THIS CHECK GOT SHORTER
 *
 * There used to be five marks, two of which ran off the bottom of the opening
 * and arrived at the top of the reconcile scene — a single line crossing the
 * section boundary, and this harness existed largely to prove the two halves
 * met at the same x. They are gone. The owner's note on the join was blunt and
 * correct: by the time the reader is being shown that every line has to be
 * found twice, a pencil line trailing in from the previous scene is not a
 * thread, it is litter across the reconciliation.
 *
 * So the invariant is now the opposite one, and it is still worth testing:
 * three marks, both ends of each under the paper it belongs to, NOTHING leaving
 * the frame, nothing arriving in the next scene, and the whole lot faded out
 * before the opening ends.
 */
const ends = (path) => {
  const m = path.getScreenCTM();
  const len = path.getTotalLength();
  const at = (l) => {
    const p = path.getPointAtLength(l);
    return { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
  };
  return { a: at(0), b: at(len) };
};

const inside = (pt, r, pad = 2) =>
  pt.x > r.l + pad && pt.x < r.r - pad && pt.y > r.t + pad && pt.y < r.b - pad;

window.sweepJoin = () =>
  run(
    'opening',
    [
      /* Drawn and at full strength. */
      { n: 'sorted', p: 0.9 },
      /* The last frame of the scene, where they must already be gone. */
      { n: 'clear', p: 0.995 },
    ],
    ({ doc, w, h, ph, bad }) => {
      // Media queries measure the viewport INCLUDING the scrollbar, so this
      // gate has to use the iframe width, not the layout width used elsewhere.
      if (w <= 900) return; // the marks are not drawn this narrow, by design

      const svg = doc.querySelector('.trace');
      const paths = [...doc.querySelectorAll('.trace path')];

      /* By the seam the pencil has to have lifted, or it crosses into a scene
         about checking every line and reads as a stray rule over the working. */
      if (ph.n === 'clear') {
        const o = svg ? +getComputedStyle(svg).opacity : 0;
        if (o > 0.02) bad.push(`clear the marks are still at ${o.toFixed(2)} into the seam`);
        return;
      }

      const rectOf = (id) => {
        const s = doc.querySelector(`.slot--${id}`);
        return s && s.checkVisibility() ? R(s) : null;
      };

      /* source sheet, target sheet. Both ends under paper — there are no
         open-ended marks any more, and a new one would be a regression. */
      const ROUTES = [
        ['operating', 'invoices'],
        ['tax', 'invoices'],
        ['payroll', 'bank'],
      ];

      if (paths.length !== ROUTES.length) {
        bad.push(`opening has ${paths.length} marks, expected ${ROUTES.length}`);
      }

      paths.forEach((path, i) => {
        const route = ROUTES[i];
        if (!route) return;
        const [from, to] = route;
        const { a, b } = ends(path);

        const src = rectOf(from);
        if (src && !inside(a, src)) bad.push(`mark ${i} does not start under ${from}`);

        const dst = rectOf(to);
        if (dst && !inside(b, dst)) bad.push(`mark ${i} does not end under ${to}`);

        if (b.y > h - 1 || a.y > h - 1) bad.push(`mark ${i} runs off the foot of the frame`);
      });

      /* And nothing arrives in the next scene. */
      const next = [...doc.querySelectorAll('.rec__trace path')];
      if (next.length) bad.push(`${next.length} marks cross into the reconciliation`);
    },
  );

/* ──────────────────────────────────────────── the ordinary sections below */

/*
 * The commercial half is normal flow, so it cannot fail the way a pinned scene
 * does — nothing is absolutely positioned over anything. What it CAN do is
 * overflow sideways, clip a price, or stack two sheets into each other, and all
 * three are invisible at the one width you happen to be looking at.
 */
window.sweepPage = () =>
  run('pricing', [{ n: 'in', p: 0.6 }, { n: 'settled', p: 1 }], ({ doc, w, ph, bad }) => {
    const W = frameW(doc);

    /* Nothing may push the document sideways. One overflowing sheet does it. */
    if (doc.body.scrollWidth > W + 1) {
      bad.push(`${ph.n} the page scrolls sideways by ${Math.round(doc.body.scrollWidth - W)}px`);
    }

    for (const sel of ['#services', '#pricing']) {
      const sec = doc.querySelector(sel);
      const box = ink(sec, doc, '.stamp-cta, .plan__stamp');
      if (box && (box.l < -1 || box.r > W + 1)) bad.push(`${ph.n} ${sel} runs off the side`);
    }

    /* A price that has been clipped is worse than no price. */
    for (const el of doc.querySelectorAll('.plan__figure, .plan__quoted, .plan__name')) {
      if (!lit(el)) continue;
      if (el.scrollWidth > el.clientWidth + 1) bad.push(`${ph.n} "${el.textContent.trim()}" is clipped`);
    }

    /* Three sheets to compare, not a pile. */
    const plans = [...doc.querySelectorAll('.plan')].filter(lit).map(R);
    for (let i = 0; i < plans.length; i += 1) {
      for (let j = i + 1; j < plans.length; j += 1) {
        const o = over(plans[i], plans[j]);
        if (o) bad.push(`${ph.n} price sheets ${i}/${j} overlap ${o}`);
      }
    }

    /* Every tick belongs to its line, at every column count. */
    for (const item of doc.querySelectorAll('.grp__item')) {
      if (!lit(item)) continue;
      const tick = R(item.querySelector('.grp__tick'));
      const row = R(item);
      if (tick.l < row.l - 1 || tick.r > row.r + 1) bad.push(`${ph.n} a checklist tick escapes its line`);
    }

    /* The ask has to be reachable and whole. */
    const cta = doc.querySelector('.stamp-cta');
    if (cta && lit(cta)) {
      const r = R(cta);
      if (r.l < 2 || r.r > W - 2) bad.push(`${ph.n} the call to action is outside the frame`);
      if (cta.scrollWidth > cta.clientWidth + 1) bad.push(`${ph.n} the call to action is clipped`);
    }

    /* And the corner read-out has to have retired by now — it reports on a
       worked example that is no longer on screen. */
    if (ph.n === 'settled') {
      const strip = doc.querySelector('.strip');
      if (strip && +getComputedStyle(strip).opacity > 0.06) {
        bad.push('settled the story read-out is still on screen over the price list');
      }
    }
  });

/*
 * The pencil working behind the reconciliation.
 *
 * Two figures printed on top of each other here, at 1440x900, and it looked
 * exactly like the rendering fault it was. The marks are placed by layout but
 * they DRIFT, so a snapshot of where they happen to be is worthless — the
 * animation phase depends on wall-clock time and the check would pass or fail
 * at random. What is measured instead is each mark's box swept through its
 * whole drift: the span holds still and only the `<i>` inside it moves, so the
 * span's rect grown by the keyframe's travel is every position that mark will
 * ever occupy. If two of those never touch, the two marks never touch.
 */
window.sweepWork = () =>
  run('reconcile', [{ n: 'working', p: 0.3 }, { n: 'proved', p: 0.55 }], ({ doc, ph, bad }) => {
    const scene = doc.querySelector('[data-scene="reconcile"]');
    const layer = scene.querySelector('.rec__working');
    if (!layer || !layer.checkVisibility()) return;

    const rem = parseFloat(getComputedStyle(doc.documentElement).fontSize);
    // The two ends of @keyframes rise, in the direction each one travels.
    const UP = 2 * rem;
    const DOWN = 1.2 * rem;
    const swept = [...layer.querySelectorAll('span')].filter(lit).map((el) => {
      const r = R(el);
      return { el, t: r.t - UP, b: r.b + DOWN, l: r.l, r: r.r, txt: el.textContent.trim() };
    });

    for (let i = 0; i < swept.length; i += 1) {
      for (let j = i + 1; j < swept.length; j += 1) {
        const o = over(swept[i], swept[j]);
        if (o) bad.push(`${ph.n} the working marks ${swept[i].txt} and ${swept[j].txt} collide ${o}`);
      }
    }

    const band = showing(doc, '.band__beat');
    const bandInk = band ? ink(band, doc) : null;
    if (bandInk) {
      for (const s of swept) {
        if (over(s, bandInk)) bad.push(`${ph.n} the working mark ${s.txt} reaches the heading`);
      }
    }
  });

window.sweepAll = async () => ({
  opening: await window.sweep(),
  join: await window.sweepJoin(),
  allocate: await window.sweepSplit(),
  working: await window.sweepWork(),
  page: await window.sweepPage(),
});
