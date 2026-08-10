/**
 * How long each pinned scene runs, and where any moment inside one falls in the
 * story as a whole.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every scene is one viewport of pin plus a run of scroll: `100svh + Nvh`. The
 * value in the corner of the desk resolves against the STORY, not against a
 * scene, so each of its states is a fraction of the total — and those fractions
 * used to be worked out by hand in a comment in content.ts, against four scene
 * heights typed into four different components.
 *
 * That held exactly as long as nobody changed a scene. The first edit that did
 * — shortening the reconcile scene from 118vh to 86vh — silently moved every
 * one of those fractions, and the corner started announcing the answer a beat
 * before the desk produced it. Nothing failed; it just quietly lied.
 *
 * So the heights live here, the components read them, and the fractions are
 * arithmetic. Change a run below and the corner follows it.
 */

/** Scroll each scene gets AFTER its pin, in vh. The pin itself is always 100svh. */
export const RUN = {
  opening: 122,
  reconcile: 86,
  allocate: 138,
  close: 96,
} as const;

export type SceneId = keyof typeof RUN;

/** In document order. The story is these four and nothing else. */
const ORDER: SceneId[] = ['opening', 'reconcile', 'allocate', 'close'];

/** What a scene's section is worth in the document: the pin plus its run. */
export const sceneHeight = (id: SceneId) => `calc(100svh + ${RUN[id]}vh)`;

/*
 * The story's scrollable length. Four pins of 100 plus every run, less the last
 * pin — which never scrolls past, it is the viewport the last frame sits in.
 * svh and vh are treated as equal here; they differ only on a mobile browser
 * with a retracting toolbar, and the corner is a progress read-out rather than
 * a measurement.
 */
const STORY_LEN = ORDER.reduce((sum, id) => sum + RUN[id], 0) + 100 * (ORDER.length - 1);

/**
 * Progress `q` within scene `id`, expressed as progress through the whole story.
 * Give it the beat you actually want to mark and it does the rest.
 */
export const storyAt = (id: SceneId, q: number) => {
  const before = ORDER.slice(0, ORDER.indexOf(id)).reduce((sum, k) => sum + 100 + RUN[k], 0);
  return +((before + q * RUN[id]) / STORY_LEN).toFixed(4);
};
