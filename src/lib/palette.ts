/**
 * The whole colour system, resolved at build time, for both themes.
 *
 * Two surfaces exist on this site and only two: the DESK (the thing the camera
 * looks at) and PAPER (the thing that carries information). Every colour token
 * belongs to exactly one of them and ships with its matched ink — the lesson
 * from v1 was that a background token without a paired text token becomes
 * white-on-white the moment anything changes.
 *
 * The brand colour is the only input. Everything brand-flavoured is derived
 * from it here, with real WCAG checks, so an arbitrary hex from a prospect's
 * logo cannot break the page in either theme.
 */

import {
  clamp,
  contrast,
  deltaL,
  forceContrast,
  hexToOklch,
  hexToRgb,
  oklchToHex,
  oklchToRgb,
  type Oklch,
  type Rgb,
} from './color.ts';

export type ThemeName = 'light' | 'dark';

type Theme = {
  /** Desk at the start of the story, and at the end. Cool becomes warm. */
  deskA: Oklch;
  deskB: Oklch;
  /** The vignette at the edge of frame. */
  edge: Oklch;
  /** The lamp pool, early and late. */
  lampA: Oklch;
  lampB: Oklch;
  /** Ink that sits directly on the desk. */
  ink: Oklch;
  inkQuiet: Oklch;
  /** Hairlines and separator dots. Never a word. */
  mark: Oklch;
  /**
   * Being looked at, not yet agreed. The one colour on the site that is not
   * the brand and not ink: work in progress needs to be distinguishable from
   * work that is finished, and lightness alone cannot carry that while the
   * finished state is already a colour.
   */
  flag: Oklch;
  /** Looked at and refused. Used once, on the line that nearly matched. */
  alarm: Oklch;
  /**
   * Which way ink has to move to gain contrast on this desk. On a dark desk it
   * brightens; on a light desk it darkens.
   */
  toward: 'lighter' | 'darker';
  /**
   * The worst desk pixel for ink, and it is not the desk colour.
   *
   * On the dark desk it is the middle of the lamp — a fixed layer, not an
   * ancestor, so a DOM contrast audit cannot see it and will happily pass text
   * that is unreadable where the light pools.
   * On the light desk it is the opposite end: the vignette in the corners.
   */
  worst: () => Oklch;
};

const THEMES: Record<ThemeName, Theme> = {
  /*
   * A linen desk mat under a warm lamp. Paper is separated from it by lightness
   * and by shadow, never by a border — the moment a sheet needs an outline to be
   * seen, it has stopped being paper and become a UI card.
   *
   * The mat is warm greige rather than neutral grey, and that is not a taste
   * call. A near-zero-chroma surface at this lightness has no hue to be lit BY,
   * so the lamp lands on it as a change in brightness alone and the whole frame
   * reads as an unstyled panel. A little yellow in the mat gives the light
   * something to warm, and it puts the desk on the opposite side of the paper's
   * hue so white paper reads as white rather than as "the light bit".
   */
  light: {
    deskA: { l: 0.79, c: 0.016, h: 92 },
    deskB: { l: 0.784, c: 0.024, h: 74 },
    edge: { l: 0.726, c: 0.019, h: 66 },
    lampA: { l: 0.874, c: 0.015, h: 86 },
    lampB: { l: 0.888, c: 0.026, h: 72 },
    ink: { l: 0.268, c: 0.014, h: 258 },
    inkQuiet: { l: 0.372, c: 0.013, h: 258 },
    mark: { l: 0.482, c: 0.013, h: 258 },
    flag: { l: 0.55, c: 0.135, h: 68 },
    alarm: { l: 0.52, c: 0.17, h: 26 },
    toward: 'darker',
    worst: () => THEMES.light.edge,
  },

  /* The same desk after hours, lit by one lamp. */
  dark: {
    deskA: { l: 0.213, c: 0.014, h: 250 },
    deskB: { l: 0.203, c: 0.016, h: 58 },
    edge: { l: 0.142, c: 0.012, h: 250 },
    lampA: { l: 0.300, c: 0.019, h: 246 },
    lampB: { l: 0.315, c: 0.026, h: 66 },
    ink: { l: 0.928, c: 0.006, h: 85 },
    inkQuiet: { l: 0.760, c: 0.011, h: 85 },
    mark: { l: 0.556, c: 0.012, h: 85 },
    flag: { l: 0.79, c: 0.125, h: 76 },
    alarm: { l: 0.72, c: 0.15, h: 24 },
    toward: 'lighter',
    worst: () => (THEMES.dark.lampA.l > THEMES.dark.lampB.l ? THEMES.dark.lampA : THEMES.dark.lampB),
  },
};

/**
 * Five paper stocks, one per document.
 *
 * This is the cheapest believability there is. Five identical white rectangles
 * read as five copies of one thing; a bond invoice, a blue-grey bank statement,
 * green continuous-feed payroll, a kraft tax folder and a narrow till slip read
 * as a month of real paperwork — and they stay tellable apart at thumbnail size
 * in a stack, which the whole story depends on.
 *
 * Paper does not change with the theme. Paper is paper.
 */
const STOCKS = {
  bond: { paper: { l: 0.974, c: 0.005, h: 92 }, ink: { l: 0.255, c: 0.012, h: 62 } },
  ledger: { paper: { l: 0.953, c: 0.012, h: 232 }, ink: { l: 0.262, c: 0.030, h: 248 } },
  tractor: { paper: { l: 0.951, c: 0.018, h: 148 }, ink: { l: 0.258, c: 0.024, h: 156 } },
  kraft: { paper: { l: 0.878, c: 0.050, h: 74 }, ink: { l: 0.268, c: 0.036, h: 58 } },
  slip: { paper: { l: 0.965, c: 0.014, h: 96 }, ink: { l: 0.252, c: 0.014, h: 66 } },
} satisfies Record<string, { paper: Oklch; ink: Oklch }>;

const PAPER_BASE = STOCKS.bond;

type ReportRow = { token: string; value: string; on: string; ratio: number; need: number };

export function buildPalette(brandHex: string, themeName: ThemeName) {
  const t = THEMES[themeName];
  const worstDesk = oklchToRgb(t.worst());
  const paperRgb = oklchToRgb(PAPER_BASE.paper);
  const raw = hexToOklch(brandHex);

  // Neon brands get pulled back; near-grey brands are left grey on purpose —
  // the design still works, it just leans on lightness instead of hue.
  const chroma = raw.c < 0.02 ? raw.c : clamp(raw.c, 0.055, 0.19);
  const base: Oklch = { l: raw.l, c: chroma, h: raw.h };

  // Accent sitting on the desk: ticks, the matching line, the live value.
  const litBand: [number, number] = t.toward === 'lighter' ? [0.66, 0.86] : [0.30, 0.50];
  const lit = forceContrast(
    { ...base, l: clamp(base.l, litBand[0], litBand[1]) },
    worstDesk,
    4.5,
    t.toward,
  );

  /*
   * CTA fill and its label, solved together.
   *
   * A mid-lightness fill has a dead zone where neither white nor near-black
   * clears 4.5:1 — a bright mint at L 0.62 gets about 4.2 either way. Picking
   * the fill first and then hunting for a label that works cannot escape it, so
   * the fill is walked darker until one of the two labels fits. That is also
   * the better-looking answer: a saturated button with white type.
   *
   * Its 3:1 boundary against the desk is carried by the stamp's own edge — the
   * shadow and the inset keyline — so the fill itself only has to be plainly
   * perceivable, hence 2:1.
   */
  const { solid, onSolid } = fitButton(base, worstDesk, t.toward);
  const solidRgb = oklchToRgb(solid);

  // Brand ink on paper: totals, matched amounts, the folder tab.
  const brandInk = forceContrast(
    { ...base, l: clamp(base.l, 0.30, 0.48) },
    paperRgb,
    4.5,
    'darker',
  );

  const deskInk = forceContrast(t.ink, worstDesk, 4.5, t.toward);
  const deskInkQuiet = forceContrast(t.inkQuiet, worstDesk, 4.5, t.toward);
  const deskMark = forceContrast(t.mark, worstDesk, 2.5, t.toward);
  const deskFlag = forceContrast(t.flag, worstDesk, 4.5, t.toward);
  const deskAlarm = forceContrast(t.alarm, worstDesk, 4.5, t.toward);

  /*
   * Loud variants, for marks that are colour rather than text.
   *
   * A 4.5:1 target is the right rule for anything anyone has to READ, and it is
   * the wrong rule for anything whose whole job is to be a colour. On a light
   * desk it drags a green to L 0.30, and at that lightness the hue is gone —
   * the figure reads as dark grey and the visitor cannot tell checked from
   * unchecked, which was the entire point of colouring it.
   *
   * So these are solved for VISIBILITY instead: chroma pushed up, contrast held
   * at 2.2:1, which is enough to be plainly seen on the desk and still read as
   * background. They are used only by the scratch working behind the paper, and
   * never by a word the visitor is expected to read.
   */
  const loud = (c: Oklch) =>
    forceContrast({ ...c, c: Math.min(0.26, c.c * 1.5) }, worstDesk, 2.2, t.toward);
  const flagLoud = loud(t.flag);
  const alarmLoud = loud(t.alarm);
  const brandLoud = loud({ ...base, l: t.toward === 'lighter' ? 0.74 : 0.52 });

  const css: Record<string, string> = {
    '--desk-cool': oklchToHex(t.deskA),
    '--desk-warm': oklchToHex(t.deskB),
    '--desk-edge': oklchToHex(t.edge),
    '--lamp-cool': oklchToHex(t.lampA),
    '--lamp-warm': oklchToHex(t.lampB),
    '--desk-ink': oklchToHex(deskInk),
    '--desk-ink-quiet': oklchToHex(deskInkQuiet),
    '--desk-mark': oklchToHex(deskMark),
    '--desk-flag': oklchToHex(deskFlag),
    '--desk-alarm': oklchToHex(deskAlarm),
    '--flag-loud': oklchToHex(flagLoud),
    '--alarm-loud': oklchToHex(alarmLoud),
    '--brand-loud': oklchToHex(brandLoud),
    /* Shadow strength. A bright room throws softer shadows than one lamp, and
       getting this wrong is what makes a light theme look like flat UI. */
    '--shade-a': themeName === 'dark' ? '0.5' : '0.32',

    '--paper': oklchToHex(PAPER_BASE.paper),
    '--paper-deep': oklchToHex({ ...PAPER_BASE.paper, l: PAPER_BASE.paper.l - 0.042 }),
    '--paper-ink': oklchToHex(PAPER_BASE.ink),
    '--paper-ink-quiet': oklchToHex(
      forceContrast({ ...PAPER_BASE.ink, l: 0.455 }, paperRgb, 4.5, 'darker'),
    ),
    '--paper-rule': `color-mix(in oklab, var(--paper-ink) 17%, var(--paper))`,
    '--paper-rule-strong': `color-mix(in oklab, var(--paper-ink) 42%, var(--paper))`,

    '--brand-raw': brandHex,
    '--brand-lit': oklchToHex(lit),
    '--brand-solid': oklchToHex(solid),
    '--brand-on-solid': oklchToHex(onSolid),
    '--brand-ink': oklchToHex(brandInk),
    '--brand-tint': `color-mix(in oklab, var(--brand-ink) 9%, var(--paper))`,
    '--brand-tint-strong': `color-mix(in oklab, var(--brand-ink) 18%, var(--paper))`,
    '--brand-halo': `color-mix(in oklab, var(--brand-lit) 30%, transparent)`,
  };

  /* Per-stock tokens. Rules are mixed from each stock's own ink, so a kraft
     folder gets brown rules and a bank statement blue-grey ones without anybody
     picking twenty more colours by hand. */
  for (const [name, s] of Object.entries(STOCKS)) {
    const paperHex = oklchToHex(s.paper);
    const inkHex = oklchToHex(forceContrast(s.ink, oklchToRgb(s.paper), 4.5, 'darker'));
    css[`--stock-${name}`] = paperHex;
    css[`--stock-${name}-ink`] = inkHex;
    css[`--stock-${name}-quiet`] = `color-mix(in oklab, ${inkHex} 68%, ${paperHex})`;
    css[`--stock-${name}-rule`] = `color-mix(in oklab, ${inkHex} 17%, ${paperHex})`;
    css[`--stock-${name}-rule-strong`] = `color-mix(in oklab, ${inkHex} 42%, ${paperHex})`;
  }

  const on = themeName === 'dark' ? 'lamp' : 'vignette';
  const report: ReportRow[] = [
    row('--desk-ink', css['--desk-ink']!, on, worstDesk, 4.5),
    row('--desk-ink-quiet', css['--desk-ink-quiet']!, on, worstDesk, 4.5),
    row('--desk-mark', css['--desk-mark']!, on, worstDesk, 2.5),
    row('--desk-flag', css['--desk-flag']!, on, worstDesk, 4.5),
    row('--desk-alarm', css['--desk-alarm']!, on, worstDesk, 4.5),
    row('--flag-loud', css['--flag-loud']!, on, worstDesk, 2.2),
    row('--alarm-loud', css['--alarm-loud']!, on, worstDesk, 2.2),
    row('--brand-loud', css['--brand-loud']!, on, worstDesk, 2.2),
    row('--paper-ink', css['--paper-ink']!, 'paper', paperRgb, 4.5),
    row('--paper-ink-quiet', css['--paper-ink-quiet']!, 'paper', paperRgb, 4.5),
    row('--brand-lit', css['--brand-lit']!, on, worstDesk, 4.5),
    row('--brand-solid', css['--brand-solid']!, on, worstDesk, 2.0),
    row('--brand-on-solid', css['--brand-on-solid']!, 'brand-solid', solidRgb, 4.5),
    row('--brand-ink', css['--brand-ink']!, 'paper', paperRgb, 4.5),
    // Ink against its own sheet: a real WCAG requirement, it is text.
    ...Object.entries(STOCKS).map(([name, s]) =>
      row(`--stock-${name}-ink`, css[`--stock-${name}-ink`]!, name, oklchToRgb(s.paper), 4.5),
    ),
    // Sheet against desk: measured as a lightness gap, not a contrast ratio.
    // These are two large adjacent surfaces, and shadow does the rest of the
    // work — a sheet that needed 3:1 to be seen would have to be a bordered
    // card, which is exactly what this page must not look like.
    ...Object.entries(STOCKS).map(([name, s]) => ({
      token: `--stock-${name}`,
      value: css[`--stock-${name}`]!,
      on: 'desk (ΔL*)',
      ratio: Math.round(deltaL(s.paper, t.deskA) * 10) / 10,
      need: 7,
    })),
  ];

  return { css, report };
}

/**
 * Walks the CTA fill from the top of its band downwards until either white or
 * near-black clears 4.5:1 on it, then returns both. Always terminates: by
 * L 0.30 white is comfortably clear on any hue.
 */
function fitButton(base: Oklch, worstDesk: Rgb, toward: 'lighter' | 'darker') {
  const WHITE = hexToRgb('#ffffff');
  const BLACK = hexToRgb('#101013');

  for (let l = clamp(base.l, 0.46, 0.62); l >= 0.28; l -= 0.01) {
    const solid = forceContrast({ ...base, l }, worstDesk, 2.0, toward);
    const rgb = oklchToRgb(solid);
    const onWhite = contrast(WHITE, rgb);
    const onBlack = contrast(BLACK, rgb);
    if (onWhite >= 4.5 || onBlack >= 4.5) {
      const light = onWhite >= onBlack;
      return {
        solid,
        onSolid: {
          l: light ? 0.995 : 0.19,
          c: Math.min(base.c, light ? 0.012 : 0.02),
          h: base.h,
        } as Oklch,
      };
    }
  }

  const solid = forceContrast({ ...base, l: 0.28 }, worstDesk, 2.0, toward);
  return { solid, onSolid: { l: 0.995, c: Math.min(base.c, 0.012), h: base.h } as Oklch };
}

function row(token: string, value: string, on: string, against: Rgb, need: number): ReportRow {
  return {
    token,
    value,
    on,
    ratio: Math.round(contrast(hexToRgb(value), against) * 100) / 100,
    need,
  };
}

/** Renders one theme's resolved palette under the given selector. */
export function paletteCss(brandHex: string, theme: ThemeName, selector = ':root'): string {
  const { css, report } = buildPalette(brandHex, theme);
  const failures = report.filter((r) => r.ratio < r.need);
  if (failures.length) {
    // Loud, not silent: a brand colour that cannot be made to work is a rescin
    // blocker, and it should stop the build rather than ship grey-on-grey.
    throw new Error(
      `Brand colour ${brandHex} produced unusable tokens in the ${theme} theme:\n` +
        failures.map((f) => `  ${f.token} on ${f.on} = ${f.ratio}:1, needs ${f.need}:1`).join('\n'),
    );
  }
  const body = Object.entries(css)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n  color-scheme: ${theme};\n${body}\n}`;
}
