/**
 * Template copy, ENGLISH — the words that stay the same across every demo.
 * Firm-specific words live in `firm.en.ts`; this file only assembles them.
 *
 * Copy is written for the VISITOR (a business owner deciding whether this
 * bookkeeper understands their situation), never for the bookkeeper buying the
 * template.
 *
 * Imports reach for the English config and the English formatter by name
 * rather than through the locale selectors. Both languages' modules are
 * evaluated on every build, and a file that assembled English sentences out of
 * whichever month happened to be selected would produce dollars-in-Russian
 * nonsense on half of them — harmless, because it is never rendered, and
 * exactly the kind of harmless that later becomes a bug.
 */

import { firm } from './firm.en';
import { buckets, meta, reconcile } from './story.en';
import { storyAt } from './scenes';
import { formatters } from '../lib/format';

const { moneyShort } = formatters('en');

/*
 * The one derived figure in this file. "29¢ of every dollar" is the sentence a
 * business owner repeats to somebody else, and it has to keep telling the truth
 * after a rescin edits the amounts — so it is arithmetic, not a typed number.
 */
const inflow = buckets.reduce((sum, b) => sum + b.amount, 0);
const kept = buckets[buckets.length - 1]!;
const centsKept = Math.round((kept.amount / inflow) * 100);

/*
 * The near-miss amount, taken from the row the scene actually animates rather
 * than typed into the sentence beside it. It was a literal, which meant editing
 * the month left the copy pointing at a figure that was no longer on screen —
 * the most embarrassing possible bug on a page whose whole argument is that
 * somebody checks the numbers.
 */
const nearMiss = moneyShort(reconcile.left.rows[reconcile.sourceIndex]!.amount);

/**
 * Whether the page may say "CPA" at all, and how.
 *
 * Everything that could print the string goes through here. That is the whole
 * mechanism: one place to switch, and a rescin onto a plain bookkeeper cannot
 * leave the claim behind in a chip somebody forgot about.
 */
/* Annotated rather than inferred: unannotated, this is a union of two English
   string literals, and no other language's wording can then satisfy it. */
export const cpaClaim: string | null =
  firm.licensure === 'cpa-firm' ? 'CPA firm' : firm.licensure === 'cpa-owned' ? 'CPA-led' : null;

/** Printed next to the firm name when the entity is not a licensed CPA firm. */
export const licensureNote = firm.licensure === 'cpa-owned' ? firm.licensureNote : null;

/** Rounded down to the nearest ten: "42 clients" reads as counted this morning. */
const clientsRounded = Math.floor(firm.proof.clientCount / 10) * 10;

export const hero = {
  /*
   * Answers "where am I / what is this" — the first line the eye lands on.
   *
   * Two lines, because the composition sets them differently: A is the heavy
   * sans discipline, B is the italic serif qualifier under it. They live here
   * rather than in the template so a language can put its own words in its own
   * order — a preposition is not something a component gets to hardcode.
   */
  headlineA: firm.discipline,
  headlineB: `for ${firm.audience.clientType} in ${firm.audience.homeState}.`,
  /** The same sentence as one string, for the meta description. */
  get headline() {
    return `${this.headlineA} ${this.headlineB}`;
  },
  /** Answers "why should I care" — the outcome, with a date on it. */
  promise: firm.promise,
  /*
   * Answers "can I trust this" — three factual chips, every one DERIVED. They
   * used to be three typed strings, so a rescin that changed the states or the
   * client count changed nothing on screen, and "CPA-led" could not be turned
   * off for a firm that is not entitled to say it.
   */
  chips: [
    cpaClaim,
    `${clientsRounded}+ ${firm.audience.homeState} ${firm.audience.clientType}`,
    firm.audience.states.join(' · '),
  ].filter(Boolean) as string[],
  /** Answers "what do I do" — the CTA and its cost to the visitor. */
  cta: firm.cta.primary,
  ctaHint: firm.cta.primaryHint,
  /** Slug line under the figures. Honest about the demo, and it dates the data. */
  pileCaption: `Illustrative figures · ${meta.period} · ${meta.currency}`,
  /** The invitation to scroll. Not a bouncing arrow — a pencil rule. */
  scrollCue: 'see how a month gets closed',
};

/**
 * The story's beats, in words.
 *
 * Every beat has a heading and a line, in the ordinary place a heading goes —
 * across the top, before the thing it describes. The animation illustrates the
 * sentence; it does not replace it. A scene that moves paper around in silence
 * is a screensaver, and a visitor who has to work out what he just watched has
 * already been lost.
 *
 * The order of the beats is the order the work is actually done in, and each
 * one ends by opening the next.
 */
export const beats = {
  /* The month lands on the desk. This is the PROBLEM, not an achievement. */
  arrive: {
    eyebrow: 'One month · one construction client',
    heading: 'A month arrives like this.',
    line: 'Invoices, a bank feed, a payroll run, a folder of receipts. It lands the same way every month, and on its own it **tells you nothing**.',
    tally: 84200,
    tallyLabel: 'moved through the business in March',
    tallyNote: 'not one line of it checked',
  },
  /* First move: separate and name. Order arrives AFTER the heap, never before. */
  sort: {
    eyebrow: 'Step one · Sort',
    heading: 'First, find out what you are holding.',
    line: 'Five documents, five totals, each one named and dated. Nothing can be checked against anything until this part is done — and **this is the part most books never get**.',
    next: 'Next: does the bank agree?',
  },

  /*
   * The beat the page is built around.
   *
   * Reconciling is the whole job, and it is invisible in every accounting site
   * ever written because there is nothing to photograph. There is something to
   * ANIMATE, though: a line looking for its pair, finding one that is wrong,
   * and saying so. The near-miss is the point — an amount matching is not the
   * same as a payment matching, and the visitor who has never thought about
   * that is exactly the visitor who needs a bookkeeper.
   */
  match: {
    eyebrow: 'Step two · Reconcile',
    heading: 'Every line has to be found twice.',
    line: `Once where it was invoiced, once where the money landed. The transfer below is the same [[${nearMiss}]] to the cent — and **it is not a customer paying you**.`,
    /*
     * THE WORKING, NAMED.
     *
     * The middle column used to carry three phrases that cross-faded in one
     * slot — "looking for $12,475", "Not this one", "Matched · Mar 23" — and
     * between them the scene lit rows red and green for twenty seconds without
     * ever saying what was being DONE. Which is the complaint every accounting
     * site earns: the work is invisible, so the price looks arbitrary.
     *
     * This is the same twenty seconds written down as a worksheet, in the order
     * a bookkeeper actually does it, ticking off as it goes. It is the single
     * cheapest piece of proof on the page — seven lines that a generalist could
     * not have written, next to an animation that shows them happening.
     *
     * `tone` is what the line settles as: agreed, or thrown out. Only one line
     * in a clean month is ever `bad`, and it is the whole point of the scene.
     */
    workLead: 'Working',
    work: [
      { t: `Statement pulled — ${reconcile.right.rows.length} deposits`, tone: 'ok' },
      { t: `Chasing ${reconcile.left.rows[reconcile.sourceIndex]!.label}`, tone: 'ok' },
      { t: `Two lines at ${nearMiss}`, tone: 'ok' },
      { t: 'Payer checked, not just the amount', tone: 'ok' },
      { t: 'Savings transfer — not income', tone: 'bad' },
      { t: `Deposit ${reconcile.right.rows[reconcile.matchIndex]!.meta} agreed`, tone: 'ok' },
      { t: 'Remaining lines agreed', tone: 'ok' },
    ] as { t: string; tone: 'ok' | 'bad' }[],
    /* Not "we found a problem" — "there is nothing left to find". */
    verdictLabel: 'Difference to review',
    verdict: '$0.00',
    verdictNote: 'every invoice found, every deposit explained',
    next: 'Next: what is actually yours?',
  },

  /*
   * The beat that sells the trade.
   *
   * Every owner of a small business has looked at a bank balance and quietly
   * assumed some part of it was profit. It is the single most expensive mistake
   * in the trade: payroll is owed, the costs are already gone, and the sales tax
   * in the account belongs to the state. What survives all three is the only
   * figure anybody can act on, and producing it every month is exactly what a
   * bookkeeper is for.
   *
   * So the scene does not present four categories. It takes the verified total
   * and removes things from it, in front of the visitor, until one number is
   * left — and the number is smaller than they expected, which is the point.
   */
  split: {
    eyebrow: 'Step three · Allocate',
    heading: 'So how much of it is actually yours?',
    line: 'Not the bank balance, and not the total invoiced. **Three claims** come out of a month before anything is left: the crew, the costs, and [[tax that was never yours to spend]].',
    /*
     * Over the big figure. It starts as the hand-off from the previous scene —
     * this is the same $84,200 that was just proved — and becomes the running
     * balance the moment the first claim is taken out of it. "What is left"
     * printed over an untouched total is a label on nothing.
     */
    startLabel: 'Checked, to the cent',
    runningLabel: 'What is left',
    /** Why each claim is a claim. Keyed by bucket id. */
    claims: {
      payroll: 'met on the 15th and the 30th',
      operating: 'materials, rentals, fuel, cover — already gone',
      tax: "collected on the state's behalf",
    } as Record<string, string>,
    /*
     * What gets stamped on a piece as it comes off the strip. A rubber stamp is
     * the most recognisable object in the trade and it says in one word what a
     * sentence of explanation would: this is settled, it is not coming back.
     */
    stamps: {
      payroll: 'Paid',
      operating: 'Spent',
      tax: 'Held',
    } as Record<string, string>,
    /* Pencil, under the spread. It never claims a denomination — the bundles
       are a quantity, not a currency, and a printed figure on one of them
       would be a number this build could not assert. */
    countNote: 'the month, counted out',
    /* Ruled round the spread in the first tenth and then frozen. Everything
       after it is measured against an outline that does not move, so the ratio
       at the end is proved by empty desk rather than asserted by a sentence. */
    startedNote: 'where the month started',

    /* The claim an owner has never once thought about, so it gets its own
       heading rather than sharing the opening one. */
    heldHeading: 'And some of it was never yours.',
    heldLine:
      'Sales tax you collected for the state, and what the year will owe. It is sitting in the account right now, [[looking exactly like money]].',
    heldTag: 'Held for the state',

    /* Heading only — no supporting line. The band has to stay the height it is
       today or the guard that fails first at 1440×700 fails. */
    countHeading: 'Now count what nobody has a claim on.',

    keepHeading: 'This is the figure you can plan against.',
    keepLine: '**The same number, produced the same way, on the same date every month.** Hire on it, buy equipment on it, or take it home.',
    /* The knife the whole scene has been sharpening. Two objects are left on
       the desk and this is the only place to say what the difference is. */
    bothLine: 'The account still holds both of these. Only one of them is yours.',
    /** The line somebody repeats to somebody else. Set apart from its sentence. */
    keepCents: `${centsKept}¢`,
    keepNote: 'of every dollar that came in — and this part is safe to spend.',
  },
};

/**
 * Step four — the coda.
 *
 * It does NOT present three more numbers. Nobody distrusts the arithmetic by
 * now; scenes two and three settled that. What every owner of a small business
 * has actually been burned by is a bookkeeper who went quiet in July. So the
 * closing scene argues RECURRENCE, which is unprovable in words because every
 * firm claims it, and provable in one picture: the same stamp, the same day,
 * three months running, and one empty folder with next month's date already on
 * the tab.
 *
 * The three numbers survive, demoted — printed small on the folder's label. The
 * figure that filled the screen ninety seconds ago is now one line of type on a
 * label, on a folder, in a row of folders. That IS what a closed month looks
 * like, and saying it in typography beats saying it in a sentence.
 */
export const close = {
  eyebrow: 'Step four · Close',
  heading: 'Then the month is shut.',
  line: 'Every document accounted for, every figure agreed twice, nothing left open and **nothing waiting on you to remember it**.',

  sealHeading: 'Closed, dated, and filed.',
  sealLine: 'One folder for the month, with the three numbers printed on the front. **You never have to open it** — that is the whole point of paying somebody to close a month.',

  nextHeading: 'And the next one already has a date.',
  nextLine: `Not "when we get to it". [[The same working day, every month]], whether or not you chase anyone.`,

  /**
   * PRE-PRINTED on the folder's label, before anything is written on it — which
   * is why it names the file rather than claiming the month is finished. The
   * claim is the stamp's job, and the stamp lands later.
   */
  labelLead: 'Month-end file',
  figures: [
    { label: 'Earned', id: 'earned' },
    { label: 'In the bank', id: 'cash' },
    { label: 'Both sides', id: 'balance' },
  ],
  stamp: 'Closed',
  due: 'due the 10th',
  ghostNote: 'already on the calendar',
  /* Points at BOTH sections below it — scope first, then the price. An earlier
     version promised the price and the next thing on the page was the scope. */
  onward: 'Next: what that takes, and what it costs.',
};

/**
 * The commercial half of the page.
 *
 * The story is pinned and cinematic. Everything from here down is an ordinary
 * scrolling page, and that change of rhythm is deliberate: after four scenes of
 * being shown something, the visitor wants solid ground and plain answers.
 * Animation from here is entrance only — it supplements, it does not carry.
 */
export const services = {
  eyebrow: 'What you are buying',
  heading: 'A system that runs, not a favour you have to ask for.',
  line: 'Everything on this list happens whether or not you remember to send anything. It is the same list every month, and it is the reason the tenth is a date rather than a hope.',
  /** Printed at the head of the checklist sheet, like the artefact it is. */
  sheetTitle: 'Close checklist · standard',
  sheetMeta: `${firm.audience.clientType} · monthly retainer`,
  boundaryLead: 'And what we do not do',
  tradesLead: 'Trades we close for',
  softwareLead: 'What you already run',
  softwareNote:
    'We read your job costs out of whatever you use and tie them back to the ledger. Nobody is asked to change systems to become our client.',
};

export const pricing = {
  eyebrow: 'What it costs',
  heading: 'A fixed monthly figure, quoted before you commit.',
  line: 'Never billed by the hour. An hourly bookkeeper is paid more the longer your books take, which is the wrong way round for both of us.',
  /** Shown instead of a figure when a plan is marked `quoted`. */
  quotedLabel: 'Quoted on the call',
  includesLead: 'Includes',
  withoutLead: 'Not included',

  /*
   * THE DELIVERABLE, printed beside the price.
   *
   * Three plans and a list of inclusions describe a service; they do not show
   * anybody what they get. The report is what actually arrives, and putting it
   * next to the figure turns "$850 a month" from a fee into the price of a
   * specific object the buyer has now seen.
   *
   * Its three lines are not written here — they are `understand` in story.ts,
   * the same three questions the whole story is built to answer, and the same
   * three answers the folder's label carries. One set of numbers, three places.
   */
  deliverableLead: 'What arrives, every month',
  deliverableTitle: 'Month-end report',
  /** Followed by the derived date — "Sent April 10". */
  deliverableSentLead: 'Sent',
  deliverableFoot: 'One page · plain English · the working behind it on request',
  /*
   * The three questions that actually decide a price, and their answers. They
   * were three bullets until it became obvious that a buyer cannot tell which
   * bullet answers which worry — naming the question is most of the work, and
   * it turns a list into three facts he can check off.
   */
  terms: [
    {
      q: 'How it is priced',
      a: 'On how many transactions and how many jobs you run — **not on how long it takes us**.',
    },
    { q: 'How long it holds', a: '**Fixed for twelve months** from the day you start.' },
    {
      q: 'How to leave',
      a: 'Month to month after the first quarter. **No notice period, no exit fee.**',
    },
  ],
  cta: firm.cta.primary,
  ctaHint: firm.cta.primaryHint,
};

/**
 * Trust — the last question left once the price has been read.
 *
 * It sits AFTER the price on purpose: before it, nobody cares who you are;
 * immediately after, it is the only thing they still want to know.
 *
 * The data paragraph is the single emptiest space in the whole competitive set.
 * Not one of the thirty-plus firms surveyed says anything about how it handles
 * your bank access — on pages that all ask for it.
 */
export const trust = {
  eyebrow: 'Who we are',
  heading: 'One person does your books, and you know which one.',
  line: 'Not a pool, not a ticket queue, and not somebody different every quarter. When something looks wrong you text a name.',
  countLead: {
    years: 'Closing books since',
    clients: 'Contractors on the books',
    states: 'Licensed and serving',
  },
  dataLead: 'How we handle your access',
  data: [
    'Read-only bank feeds. We can see the transactions; we cannot move a cent.',
    'No shared passwords, ever. If somebody asks you for one, it is not us.',
    'Documents go through your portal, not through email attachments.',
    'Named people only. You know who has access, and it changes when you say so.',
  ],
  saidLead: 'What they say',
  /** Printed beside the average rating when `proof.reviewSource` claims one. */
  sourceLabel: 'Posted on Google',
  /*
   * The small note under the founding year, and the rating read out to a screen
   * reader. Both take a number, because a language that inflects around one
   * cannot be served by gluing a word onto a template.
   */
  yearsNote: (n: number) => `${n} years`,
  starsLabel: (n: number) => `${n} out of 5`,
};

/**
 * The small print. Boilerplate, templated with the firm's name and state,
 * written to be read rather than to be long.
 *
 * Two things it deliberately does not do. It does not claim accessibility
 * "compliance" — there is no DOJ standard for a private business, so the claim
 * is unprovable, and the FTC took a million dollars off accessiBe in 2025 for
 * exactly that kind of promise; it states what was actually built instead. And
 * it does not pretend to be the GLBA privacy notice a financial firm delivers
 * to its clients — that is a different document, and half the firms surveyed
 * conflate the two so that neither job gets done.
 */
export const legal = {
  eyebrow: 'The small print',
  /* Sits after the firm name in the <title>, so it is lowercase and not a
     sentence. Separate from `eyebrow` because a language may not lowercase. */
  docTitle: 'the small print',
  heading: 'Privacy, terms, and what this page is not.',
  intro: `Written to be read. If anything here is unclear, ask ${firm.person.name} before you rely on it — that is quicker than a lawyer and usually enough.`,
  updated: 'Reviewed on publication',
  back: 'Back to the site',
  sections: [
    {
      id: 'privacy',
      title: 'Privacy',
      body: [
        `This page does not track you. There is no analytics script, no advertising pixel, no session recorder, no chat widget and no font loaded from anybody else's server. Nothing about your visit is sent anywhere, which is also why there is no cookie banner to dismiss — there are no cookies to consent to.`,
        `If you send the enquiry form, we receive what you typed into it: your name, your email address, your phone number if you gave one, your company, and your message. We use it to reply to you and for nothing else. We do not sell it, rent it, or add you to a list. Ask us to delete it and we delete it.`,
        `This is the notice for the website. It is not the privacy notice ${firm.name} gives its clients about their financial information under the Gramm–Leach–Bliley Act — that is a separate document you receive when you become a client, and it covers different things.`,
      ],
    },
    {
      id: 'terms',
      title: 'Terms of use',
      body: [
        `Everything on this site is offered for information. Reading it does not make you a client and does not create a professional engagement. That starts when both sides sign an engagement letter setting out the scope, the fee and the term — not before.`,
        `The worked month shown on this page is an illustration built from invented figures. It is not a client's results and it is not a projection of yours.`,
        `Prices shown are the current monthly retainers for the scope described beside them. Your quote depends on transaction volume and how many jobs you run, and is confirmed in writing before anything starts.`,
      ],
    },
    {
      id: 'disclaimer',
      title: 'Not advice',
      body: [
        `Nothing on this page is tax, legal, accounting or investment advice for your situation. General guidance about how a month closes is not a recommendation about your books, your entity, your filings or your deadlines.`,
        `Do not act on anything here without talking to somebody who has looked at your actual records. That is what the call is for.`,
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      body: [
        `We do not claim a certificate, and we do not run an accessibility overlay. There is no legal standard a private business can be measured against, so anybody claiming full compliance is selling something — the Federal Trade Commission fined one overlay vendor a million dollars in 2025 for that exact claim.`,
        `Here is what was actually done instead. The page is operable from the keyboard end to end. Text meets or exceeds WCAG AA contrast against every state of the background, checked by arithmetic at build time rather than by eye. Copy never renders below sixteen pixels. Headings and landmarks are real elements. The scroll animation is decorative: with "reduce motion" switched on in your operating system, the page settles and stays readable.`,
        `If something here does not work for you, email ${firm.contact.email} and tell us what broke. That gets fixed faster than any widget.`,
      ],
    },
  ],
};

export const faq = {
  eyebrow: 'Before you ask',
  heading: 'The questions a contractor actually asks.',
  line: 'Not "what is bookkeeping". These are the six that decide whether somebody who has never done a job-costed month can be trusted with yours.',
  tab: 'Questions',
};

/**
 * The ask. The last frame of the document.
 *
 * Two things make this different from the twelve firms offering a "free
 * consultation". First, the call PRODUCES something — a one-page note on last
 * month that the visitor keeps whether or not he hires anybody. A review is a
 * thing; a consultation is a conversation, and nobody schedules a conversation.
 * Second, the three steps live here rather than in a "process" section of their
 * own: the doubt is not "how does a month work" — ninety seconds of story just
 * answered that — it is "what happens if I click", and that doubt occurs at the
 * button.
 */
export const book = {
  eyebrow: 'The next step',
  heading: 'Bring last month. We will tell you what is wrong with it.',
  line: 'Twenty minutes on a call, and a one-page note on what we found in your books — yours to keep whether or not you hire us.',
  /*
   * `when` is the question the steps are really answering: how much of my time
   * does this cost, and how long before anything happens. It was buried inside
   * each paragraph — "Twenty minutes", "inside three weeks" — where nobody
   * skimming would find it. Pulled out, the three of them read as a schedule.
   */
  steps: [
    {
      name: 'The call',
      when: '20 minutes',
      text: 'You talk, we ask about your jobs and what software you already run. If we are not the right fit we say so on the call rather than after it.',
    },
    {
      name: 'The look',
      when: 'One page back',
      text: 'Read-only access to last month, nothing else. You get one page on what we found — the errors, what they cost, and what we would do first.',
    },
    {
      name: 'The first close',
      when: 'Inside 3 weeks',
      text: 'If you go ahead, your first month is closed inside three weeks. After that it is the tenth, every month, without being asked.',
    },
  ],
  formTitle: 'Request a fit call',
  formMeta: 'No card. No contract. No obligation.',
  fields: {
    name: 'Your name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    message: 'Anything we should know',
    messageHint: 'Optional — the trade you are in, what software you use, what is going wrong.',
  },
  send: 'Send it',
  /* The form is inert in the demo, but a click has to visibly do something. A
     form that swallows a submit in silence is the same broken promise as a
     button that goes nowhere. */
  sentStamp: 'Received',
  sentHeading: 'That is with us.',
  sentLine: 'A person replies within one business day — not an autoresponder, and not a sequence.',
  orCall: 'Or call',
  demoNote: 'This is a demonstration. The form does not send anything.',
};

/**
 * The foot of the page.
 *
 * Before it existed the only contact anywhere on this site was a phone number
 * in the header, and `firm.contact.email` and the address sat in the config
 * unrendered. A local service business with no address reads as a scam however
 * good the rest is — and this was the one place the demo was measurably worse
 * than a $90-a-month template.
 */
export const footer = {
  reachLead: 'Talk to us',
  visitLead: 'Where we are',
  servesLead: 'Licensed and serving',
  legalLead: 'The small print',
  /* Named in the language being offered, never in the one already on screen —
     a reader who cannot read this page cannot read "Russian" either. */
  langLead: 'Language',
  langOther: 'Русская версия',
  legal: [
    { label: 'Privacy', href: '/legal#privacy' },
    { label: 'Terms', href: '/legal#terms' },
    { label: 'Disclaimer', href: '/legal#disclaimer' },
    { label: 'Accessibility', href: '/legal#accessibility' },
  ],
  /* Rendered under the copyright when the firm is not a licensed CPA firm. See
     the note on `firm.licensure` — this one is a rule, not a courtesy. */
  builtLine: 'Built as a single page on purpose. No trackers, no cookie banner, nothing loaded from anywhere else.',
  /** Closes the sentence that starts with the pile caption's date and currency. */
  figuresTail: '— a worked example, not a client result.',

  /**
   * Printed only while `firm.indexable` is false — that is, only while this is
   * a demonstration rather than a firm's live site. It names the one thing the
   * other disclaimers do not: the firm on this page does not exist.
   */
  demoLine: `This page is a design demonstration. ${firm.name}, its people, reviews and contact details are invented.`,
};

/**
 * The value in the corner that resolves as you scroll. This is the progress bar,
 * made out of the thing the visitor actually cares about.
 */
/*
 * `at` is a fraction of the STORY, not of the page — the strip resolves as the
 * beats resolve.
 *
 * These used to be five hand-computed decimals with the arithmetic written out
 * in a comment, and they went stale the first time a scene's height changed.
 * Each one now names the scene and the moment inside it, and `storyAt` does the
 * division against the real run lengths in scenes.ts.
 */
export const ledgerStrip = {
  label: 'On the desk',
  /*
   * The corner must never be ahead of the beat. It changes as the counter in
   * the middle of the desk finishes, not while it is still running — a strip
   * that already says $84,200 while the big number reads $9,325 hands over the
   * answer and turns the count into a formality.
   */
  states: [
    { at: 0, value: '— unsorted —', tone: 'idle' },
    { at: storyAt('opening', 0.41), value: '$84,200', note: 'unchecked', tone: 'idle' },
    { at: storyAt('reconcile', 0.8), value: '$84,200', note: 'verified', tone: 'good' },
    { at: storyAt('allocate', 0.9), value: '$24,400', note: 'yours', tone: 'good' },
    /*
     * The last state of the last scene can never be more resolved than the end
     * of the document, because the fade has to finish somewhere. Placed on the
     * beat the stamp lands, and it reaches full strength across the hold.
     */
    { at: storyAt('close', 0.7), value: '$24,400', note: 'filed Apr 10', tone: 'good' },
  ],
};

/*
 * Strings nobody sees.
 *
 * A screen reader still reads them, and it reads them in the page's language,
 * so they are content like anything else — the hero shipped an English
 * preposition on the Russian page for exactly as long as somebody assumed a
 * string in a template was too small to be translated.
 */
export const a11y = {
  /** Names the two navigations: the masthead's, and the legal page's contents. */
  sections: 'Sections',
};
