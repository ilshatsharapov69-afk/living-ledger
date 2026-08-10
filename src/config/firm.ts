/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE RESCIN FILE.  This is the only file you touch to make a new demo.
 *  Read the prospect's real site, fill these fields in by hand, build, send.
 *  Target: twenty minutes.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Nothing here is a placeholder. Every field ships filled with realistic
 * content so the demo is alive even before it is personalised.
 */

export const firm = {
  /* ── 0. Publication ──────────────────────────────────────────────────── */

  /**
   * `false` while this is a demo sent to a prospect — the page ships
   * `noindex` so somebody else's personalised mock never turns up in a search
   * for their name.
   *
   * FLIP IT TO `true` ON THE DAY A REAL DOMAIN GOES LIVE. It used to be
   * hardcoded in the layout, which meant a sold site would have gone to
   * production invisible and nobody would have found out for a month.
   */
  indexable: false,

  /* ── 1. Identity ─────────────────────────────────────────────────────── */

  name: 'Northgate Ledger',

  /**
   * The prospect's logo. Drop the file in `public/` and point here.
   * `null` uses the built-in demo mark, drawn in the brand colour.
   * `includesName: true` if their logo already contains the firm name —
   * then we don't print it twice.
   */
  logo: {
    src: null as string | null,
    alt: 'Northgate Ledger',
    /** Rendered height in px. The lockup is built around 26–32. */
    height: 26,
    includesName: false,
  },

  /**
   * One hex. Everything brand-coloured on the page is derived from it at build
   * time with real contrast maths, so dark burgundy and bright teal both work.
   * Take it from their logo with an eyedropper.
   */
  brandColor: '#146B4F',

  /* ── 2. What they do, for whom ───────────────────────────────────────── */

  /** The service, in their words. Goes in the headline. */
  discipline: 'Month-end close and bookkeeping',

  /**
   * The line under the firm name on the letterhead. Answers "where have I
   * landed" before the visitor has read anything else. Short — it shares a strip
   * with the phone and the CTA. Six words at most.
   */
  descriptor: 'Bookkeeping & month-end close · Austin, TX',

  audience: {
    /** Plural noun. "construction firms", "dental practices", "law firms". */
    clientType: 'construction firms',
    /** Where most clients are. Goes in the headline. */
    homeState: 'Texas',
    /** Licensed / serving. Shown as a chip and in the footer. */
    states: ['TX', 'OK', 'NM'],
  },

  /**
   * The outcome the client buys. One sentence, concrete, with a deadline.
   *
   * Two markers work in this field and in every other sentence on the page:
   *   **like this**   the clause that carries the sentence — heavier, darker
   *   [[like this]]   the phrase somebody repeats — printed in the brand colour
   * Use each once. A sentence with four emphasised phrases has none.
   */
  promise: 'You get a closed month and **three numbers you can use** — [[by the 10th]].',

  /* ── 3. Proof ────────────────────────────────────────────────────────── */

  /**
   * ─────────────────────────────────────────────────────────────────────────
   *  THE ONE FIELD THAT CAN GET SOMEBODY IN TROUBLE. Set it deliberately.
   * ─────────────────────────────────────────────────────────────────────────
   *
   *   'cpa-firm'    a licensed CPA firm. "CPA" may be used freely.
   *   'cpa-owned'   owned or led by a licensed CPA, but the ENTITY is not a
   *                 licensed CPA firm. The disclaimer below is printed next to
   *                 the firm name — that is a rule, not a courtesy.
   *   'bookkeeping' no CPA anywhere. The string is then impossible to render:
   *                 the chip, the credential and the disclaimer all disappear.
   *
   * Texas 22 TAC §501.81 forbids an unlicensed entity using "CPA" in any
   * variation, and §501.81(d) requires the disclaimer adjacent to the name at
   * no less than the size and weight of body copy.
   *
   * Why it matters HERE and not just on a live site: this template is rescinned
   * in twenty minutes. Somebody fills in a plain bookkeeper's name and colour
   * and never thinks to check a claim that was already on the page. Default to
   * 'bookkeeping' when you do not know — the safe state is the quiet one.
   *
   * No licence NUMBER is stored. Nobody publishes one, the Texas board runs a
   * public lookup, and an invented number on a real firm's site is a
   * regulatory problem rather than a copy problem.
   */
  licensure: 'cpa-firm' as 'cpa-firm' | 'cpa-owned' | 'bookkeeping',

  licensureNote:
    'This firm is not a CPA firm and these services are not regulated by the Texas State Board of Public Accountancy.',

  proof: {
    /*
     * The chips under the hero CTA are DERIVED in content.ts, not typed here —
     * they were three hand-written strings, which meant editing `states` or
     * `clientCount` for a new demo changed nothing on screen, and the licence
     * claim could not be switched off.
     */
    credentials: ['QuickBooks Advanced ProAdvisor', 'Xero Certified'],
    /** Printed only when licensure allows it. */
    cpaCredential: 'Certified Public Accountant · Texas',
    yearsInBusiness: 11,
    clientCount: 42,
    /*
     * Three, each with a full name, a company, a trade and one figure. Never a
     * first initial: "Melissa M." is worse than nothing — it is the tell that
     * says invented, and both censuses flagged it independently.
     *
     * The companies are the ones already named in the worked month, so a
     * visitor who reads the whole page meets the same fictional world twice
     * rather than two disconnected sets of invented names.
     */
    testimonials: [
      {
        quote:
          'We found out at the end of a job that two change orders had never been billed. That was the last month before Dana. It has not happened since, and I stopped opening QuickBooks at eleven at night.',
        name: 'Dale Ortiz',
        role: 'Owner',
        company: 'Vega Ridge Builders',
        trade: 'General contractor · 8 on the books',
        /** How a review platform prints its age. Relative, so it never goes stale. */
        when: '2 months ago',
        stars: 5,
      },
      {
        quote:
          'My bonding agent asked for a WIP schedule and I did not have one. It arrived four days later and I have had one on the tenth of every month since.',
        name: 'Marcus Harrow',
        role: 'President',
        company: 'Harrow Property Group',
        trade: 'Framing and structural',
        when: '5 months ago',
        stars: 5,
      },
      {
        quote:
          'I was paying an hourly bookkeeper $1,100 in a bad month and $300 in a quiet one, and I never knew which it would be. A fixed number I can put in the budget was worth more than the saving.',
        name: 'Rosa Caldwell',
        role: 'Owner',
        company: 'Caldwell Mechanical',
        trade: 'HVAC and mechanical',
        when: 'a year ago',
        stars: 5,
      },
    ],

    /**
     * WHERE THESE REVIEWS CAME FROM — and read this before you change it.
     *
     * `'google'` prints each testimonial as a review card: avatar, stars, a
     * relative date, and the line "Posted on Google" under a map pin. That is
     * an enormous amount of borrowed credibility for three lines of markup,
     * which is exactly why it is dangerous.
     *
     * In THIS file the names are invented, and in a design template that is
     * fine — the accountant looking at the demo knows the content is filler.
     * It stops being fine the moment a demo goes out under a real firm's name
     * to that firm's prospects. Before that happens, either:
     *   • replace all three with reviews the firm actually has, and set
     *     `social.google` to the listing they are on, or
     *   • set this to `null`, which keeps the same cards and drops every claim
     *     about where they came from.
     *
     * Do not ship invented reviews under somebody else's mark. That is not a
     * design decision, it is a fabricated record.
     *
     * SET TO `null` WHEN THE DEMO WENT ON A PUBLIC URL. The names, the stars,
     * the dates and the cards all survive — the visitor sees the same design.
     * The only thing that drops is the strip claiming Google stands behind
     * three reviews that were written here. Flip it back to `'google'` the day
     * the reviews are the firm's real ones.
     */
    reviewSource: null as 'google' | null,
  },

  /**
   * The person. Eight of twelve firms surveyed put a face on the page, and the
   * four that did not read as shells.
   *
   * `portrait` is `null` by default and that is a design decision, not a hole.
   * There is not one photograph anywhere in this build — everything is drawn on
   * a lit desk, which is why it works — so a stock headshot of an invented
   * accountant would be both the wrong object and the exact kind of fake fact
   * CONTENT.md forbids. At `null` the page prints a letterpress card with the
   * monogram: a designed object. Give it a path and the same slot becomes a
   * PRINT lying on the desk — white border, shadow, slight rotation — which is
   * the only way a photograph belongs in this picture.
   */
  person: {
    name: 'Dana Whitfield',
    role: 'Founder',
    initials: 'DW',
    portrait: null as string | null,
    /** First person, and about the client's problem rather than a career. */
    line: 'I spent nine years closing books inside a general contractor before I started doing it for other people. Everything on this site is how I wanted it done when it was my job.',
  },

  /* ── 4. Contact ──────────────────────────────────────────────────────── */

  contact: {
    phone: '(512) 555-0148',
    phoneHref: 'tel:+15125550148',
    email: 'hello@northgateledger.com',
    /**
     * Where every "Book a fit call" goes.
     *
     * `#book` is the closing section at the foot of this page, and that is the
     * right default: a demo sent to a prospect has no scheduling account behind
     * it, and a button pointing at a live Calendly that does not exist is worse
     * than one pointing at our own form. On a sold site this becomes the firm's
     * real scheduling URL and the form below it stays as the fallback.
     */
    calendarUrl: '/#book',
    /**
     * Their existing portal — QuickBooks, Xero, TaxDome, SmartVault, whatever
     * they already run. We never host one: the moment this page owns a login it
     * stops being a brochure and starts answering to the FTC Safeguards Rule.
     * `null` removes the link everywhere rather than leaving it dead.
     */
    clientLoginUrl: null as string | null,
    /*
     * Deliberately not a real street.
     *
     * The phone above already uses the 555-01xx block that is reserved for
     * fiction; the address did not get the same treatment and pointed at an
     * actual South Congress office suite. That is fine in a file nobody but the
     * seller reads, and not fine the moment the page is served from a public
     * URL, because somebody works there. Replaced per demo from the prospect's
     * own footer — see the rescin checklist.
     */
    street: '2400 Example Ave, Suite 210',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    hours: 'Mon–Fri, 8.30–5.30 CT',
  },

  /**
   * Where else the firm exists.
   *
   * These are not decoration. A visitor who has never heard of a bookkeeper
   * wants to look them up before he hands over bank access, and the cheapest
   * way to survive that check is to make it one click instead of a search. Half
   * the firms surveyed hide their profiles in the footer; the ones that put
   * them in the header get looked at.
   *
   * `null` removes the icon entirely — there is no placeholder state and no
   * link to a profile that does not exist. Paste the FULL url, including
   * https://, straight out of the prospect's own page.
   *
   * `whatsapp` takes a wa.me link, not a number: wa.me/15125550148.
   *
   * THE DEFAULTS BELOW POINT AT THE PLATFORMS THEMSELVES, not at a profile.
   * They are here so the row is visible while you build; a demo that ships with
   * them sends a prospect to instagram.com, which reads as sloppy rather than
   * broken. Replace or null them. It is on the rescin checklist.
   */
  social: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
    whatsapp: null as string | null,
    /** Their Google Business profile — the one a local search actually lands on. */
    google: null as string | null,
  },

  /* ── 5. Labels ───────────────────────────────────────────────────────── */

  cta: {
    primary: 'Book a fit call',
    primaryHint: '20 minutes · no pitch',
    login: 'Client login',
  },

  /* ── 6. Scope ────────────────────────────────────────────────────────── */

  /**
   * The close checklist, grouped by how often each thing happens.
   *
   * This is the firm's actual scope, written as the artefact a bookkeeper
   * really keeps. Grouping it by cadence does the selling on its own: it says
   * "this is a system that runs" rather than "here are some services".
   *
   * Rescin: rewrite the items for the niche. A dental practice has insurance
   * ageing and provider production where this has retainage and job costing.
   * Keep the four cadences — they are the argument.
   *
   * WRITE EVERY LINE AS A LEAD AND A TAIL. The `**...**` markers make the first
   * few words bold, and that is not decoration: sixteen lines set in one weight
   * is a wall nobody reads, whereas sixteen bold openings can be skimmed in
   * about four seconds and still reward anybody who slows down. Mark the NOUN —
   * the thing that gets done — not the adjective.
   */
  scope: [
    {
      cadence: 'Every week',
      items: [
        '**Bank and card feeds** coded to the right job',
        '**Receipts and bills captured** — and chased when they are missing',
        '**Vendor bills queued for your approval**, not paid behind your back',
      ],
    },
    {
      cadence: 'Every month',
      items: [
        '**Every account reconciled** to the statement, line by line',
        '**Payroll journal posted**, including the workers’ comp accrual',
        '**Job costing updated** — materials, labour and equipment, by job',
        '**Retainage tracked**, billed and released',
        '**Sales and use tax accrued** so it is never spent by mistake',
        '**The period closed and locked**, so nothing moves behind you',
        '**Three numbers in your inbox** by the 10th',
      ],
    },
    {
      cadence: 'Every quarter',
      items: [
        '**Estimated tax figures**, for you and for your CPA',
        '**Sales tax return** prepared and filed',
        '**WIP schedule** your bonding agent will accept',
      ],
    },
    {
      cadence: 'Every year',
      items: [
        '**Books handed to your CPA** closed and tied out',
        '**1099s** prepared and filed',
        '**Fixed asset and depreciation schedule** reconciled',
      ],
    },
  ],

  /**
   * The scope boundary, stated before anybody has to ask.
   *
   * Saying plainly what you do NOT do is the cheapest trust on a professional
   * services page, and it is the thing almost nobody does. Keep it honest and
   * keep it short.
   */
  outOfScope: [
    '**We do not file your income tax return.** We hand your CPA books they do not have to fix — which is most of what they currently bill you for.',
    '**We do not estimate and we do not touch your bids.** That is your trade, not ours.',
  ],

  /**
   * The objections, answered in a language only somebody who has actually done
   * this niche can speak.
   *
   * This is the highest proof-per-pixel block on the page and the one a
   * template vendor structurally cannot copy: their FAQ has to work for
   * dentists too, so it can never mention a G702 or a WH-347. Every question
   * here is a real thing a contractor worries about, and a generalist answering
   * them would get the details wrong.
   *
   * Rescin: this is the block that takes the longest to rewrite for a new
   * niche, and it is also the one that earns the most. Budget half a day and
   * charge for it.
   */
  faq: [
    {
      q: 'Do you do AIA billing and retainage?',
      a: 'Yes. G702 and G703 out of whatever you bill from, and retainage tracked as its own receivable rather than buried in the invoice total — so at any point you know what is held, on which job, and how long it has been sitting there. Released amounts get billed the month the architect signs off, not the month somebody remembers.',
    },
    {
      q: 'I already run Procore. Do I have to change software?',
      a: 'No, and we would talk you out of it. We read job costs out of what you already use and tie them back to the general ledger. Procore, Buildertrend, Knowify, Foundation, Sage, plain QuickBooks — the close looks the same from our side. Changing systems mid-year costs you a clean set of comparatives and buys you nothing.',
    },
    {
      q: 'What about certified payroll on public jobs?',
      a: 'WH-347 weekly, wages by classification, fringe handled properly rather than lumped into the base rate. We prepare it and you sign it, because the statement of compliance is yours to make. If you are on a Davis–Bacon job and nobody has been filing, tell us on the call — that is a conversation about exposure, not bookkeeping.',
    },
    {
      q: 'Can you keep the Texas franchise tax COGS subtraction available to us?',
      a: 'That is most of why costs get coded the way they do here. Construction gets a cost-of-goods-sold subtraction that most service businesses cannot take, and it is lost when labour, materials and subcontractors sit in one bucket called "expenses". We keep them separated all year so your CPA can take it in May without reconstructing anything.',
    },
    {
      q: 'My last bookkeeper walked out mid-year. Can you clean it up?',
      a: 'Usually. Catch-up is quoted separately from the monthly retainer, and we tell you how many months are actually broken before you commit rather than after. If the answer is that the year needs rebuilding from the bank feeds, we say that on the call and give you the number.',
    },
    {
      q: 'What happens when my bonding agent or a lender asks for something?',
      a: 'You forward the request and we produce it — WIP schedule, work on hand, aged receivables, whatever the form wants — inside two business days. We do not represent you to a surety or a bank, and we will not sign anything as your accountant; we hand you the schedule and the working behind it.',
    },
  ],

  /**
   * The niche, stated three ways. All three are rare enough to read as
   * expensive, and together they cost about forty words.
   */
  niche: {
    /* Trades INSIDE the niche. A firm listing the trades it serves looks deeper
       than a generalist listing twelve industries, and a framer reading his own
       trade in a list of six believes it in a way "we serve construction"
       cannot achieve. */
    trades: [
      'General contractors',
      'Framing and structural',
      'Electrical',
      'HVAC and mechanical',
      'Concrete and sitework',
      'Roofing',
      'Specialty subs',
    ],
    /* Software they already run. Set as wordmarks in the page's own type on the
       page's own paper — logo images would break the desk, and the constraint
       improves it: a greyscale PNG row reads as a widget, this reads as a
       deliberate line of type. */
    software: ['Procore', 'Buildertrend', 'Knowify', 'Foundation', 'QuickBooks', 'Sage 100'],
    /* The boundary. Two firms in thirty drew one, and turning people away is
       the most expensive-looking signal available on a services page. */
    fitFrom: 750000,
    fitTo: 25000000,
    notFor:
      '**Under about $750k a year you do not need us yet**, and over about $25m you need a controller on staff. You will hear either of those on the call, not after.',
  },

  /* ── 7. Price ────────────────────────────────────────────────────────── */

  /**
   * Three retainers. If the firm does not publish prices — which is common —
   * set `quoted: true` on the plan and the figure is replaced by the line in
   * `content.ts`. Everything else about the card stays.
   */
  pricing: {
    currency: '$',
    period: '/month',
    plans: [
      {
        name: 'Books',
        for: 'A contractor under $1M, running payroll somewhere else.',
        price: 450,
        quoted: false,
        includes: ['The weekly and monthly list, in full', 'Sales and use tax accrued', 'Year-end handover to your CPA'],
        without: 'Payroll, WIP and the quarterly filings',
        stamp: null as string | null,
      },
      {
        name: 'Books & payroll',
        for: 'Everything above, plus the crew and everything the crew brings.',
        price: 850,
        quoted: false,
        includes: ['Payroll journal and workers’ comp accrual', 'Quarterly estimates and sales tax filed', '1099s at year end'],
        without: 'Job costing and the WIP schedule',
        stamp: 'Most start here',
      },
      {
        name: 'Full close',
        for: 'Job costing, retainage and a bonding agent who wants a WIP schedule.',
        price: 1400,
        quoted: false,
        includes: ['Costing by job, every month', 'WIP and retainage schedules', 'A thirty-minute review call each month'],
        without: null as string | null,
        stamp: null as string | null,
      },
    ],
  },

  /*
   * Every href here must resolve to a section that exists. A nav item that
   * scrolls nowhere — or worse, lands in the middle of a scene — is the first
   * thing a buyer clicks and the first thing that tells him the site is a mock.
   */
  nav: [
    { label: 'How a month works', href: '/#story' },
    { label: 'What you get', href: '/#services' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Who we are', href: '/#trust' },
  ],
} as const;

export type Firm = typeof firm;
