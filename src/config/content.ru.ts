/**
 * Template copy, RUSSIAN — the words that stay the same across every demo.
 * Firm-specific words live in `firm.ru.ts`; this file only assembles them.
 *
 * Copy is written for the VISITOR — a director who runs objects and signs
 * КС-2 — never for the bookkeeper buying the template. He is not reading to
 * learn what bookkeeping is; he is deciding whether the person behind this
 * page has ever chased объёмы out of a технадзор on the 24th.
 *
 * TWO RULES THIS FILE KEEPS AND THE ENGLISH ONE DOES NOT HAVE TO.
 *
 * 1. No rate, threshold or tariff is printed anywhere. The 2026 changes moved
 *    several of them and the sources disagree on others; a bookkeeper's site
 *    that misstates a rate has disqualified itself in one line. Process, not
 *    numbers.
 * 2. Character budgets. Cyrillic is 16–18% wider per glyph in Geist than Latin
 *    before a word of translation growth, and roughly thirty strings on this
 *    page sit in `white-space: nowrap` slots. The tight ones carry their limit
 *    in a comment; those were measured against the components' own CSS, not
 *    estimated.
 */

import { firm } from './firm.ru';
import { buckets, meta, reconcile } from './story.ru';
import { storyAt } from './scenes';
import { formatters } from '../lib/format';

const { money, moneyShort } = formatters('ru');

/*
 * The one derived figure in this file. "N копеек с рубля" is the sentence an
 * owner repeats to somebody else, and it has to keep telling the truth after a
 * rescin edits the amounts — so it is arithmetic, not a typed number.
 */
const inflow = buckets.reduce((sum, b) => sum + b.amount, 0);
const kept = buckets[buckets.length - 1]!;
const centsKept = Math.round((kept.amount / inflow) * 100);

/*
 * The near-miss amount, taken from the row the scene actually animates rather
 * than typed into the sentence beside it.
 */
const nearMiss = moneyShort(reconcile.left.rows[reconcile.sourceIndex]!.amount);

/**
 * Whether the page may make a licensure claim at all.
 *
 * `firm.ru.ts` sets `bookkeeping`, so both of these resolve to null and every
 * slot that could print a credential disappears. The mechanism is kept rather
 * than deleted because the shape is shared with English, where it is a legal
 * requirement rather than a preference.
 */
export const cpaClaim: string | null =
  firm.licensure === 'cpa-firm'
    ? 'Аудиторская фирма'
    : firm.licensure === 'cpa-owned'
      ? 'Под руководством аудитора'
      : null;

export const licensureNote = firm.licensure === 'cpa-owned' ? firm.licensureNote : null;

/** Rounded down to the nearest ten: "40 подрядчиков" reads as counted this morning. */
const clientsRounded = Math.floor(firm.proof.clientCount / 10) * 10;

export const hero = {
  /*
   * Answers "where am I / what is this" — the first line the eye lands on.
   *
   * Two lines, because the composition sets them differently: A is the heavy
   * sans discipline, B is the italic serif qualifier under it. Russian puts the
   * preposition and the case ending here, where they belong, instead of in the
   * template.
   *
   * Line A is NOT `firm.discipline`, which English can use because "Bookkeeping" is one
   * short word. «Бухгалтерия и закрытие месяца» is five, sets at `--fs-hero`
   * over two lines, and makes the hero 84px taller than the English one — which
   * is not a typographic nicety: the opening scene's sheets are positioned
   * around the copy block, and `scripts/sweep.js` caught paper landing on the
   * headline at thirteen of twenty-five viewport sizes. The long form still
   * carries the page title, where it costs nothing.
   */
  headlineA: 'Бухгалтерия',
  headlineB: `для ${firm.audience.clientType} в ${firm.audience.homeState}.`,
  /** The same sentence as one string, for the meta description. */
  get headline() {
    return `${this.headlineA} ${this.headlineB}`;
  },
  /** Answers "why should I care" — the outcome, with a date on it. */
  promise: firm.promise,
  /*
   * Answers "can I trust this" — factual chips, every one DERIVED, so a rescin
   * that changes the regions or the client count changes the screen. Each chip
   * is a nowrap pill with about 37 characters of room.
   *
   * TWO of them, where English has three.
   *
   * English fills its third slot with the licensure claim; Russian has none to
   * make, and the years chip that stood in its place cost a third row of pills.
   * At 390px that row was both the lowest and the widest thing in the hero, and
   * it landed on the receipts sheet at the left edge of the desk. The years are
   * on the page twice over in «Кто мы», where they are counted rather than
   * asserted.
   */
  chips: [
    cpaClaim,
    `${clientsRounded}+ подрядчиков в ${firm.audience.homeState}`,
    firm.audience.states.join(' · '),
  ].filter(Boolean) as string[],
  cta: firm.cta.primary,
  ctaHint: firm.cta.primaryHint,
  /** Under the pile. Honest about the demo, and it dates the data. 35 characters. */
  pileCaption: `Условные цифры · ${meta.period} · ${meta.currency}`,
  /** The invitation to scroll. Not a bouncing arrow — a pencil rule. */
  scrollCue: 'как закрывается месяц',
};

/**
 * The story's beats, in words.
 *
 * The animation illustrates the sentence; it does not replace it. A scene that
 * moves paper around in silence is a screensaver, and a visitor who has to
 * work out what he just watched has already been lost.
 */
export const beats = {
  /* The month lands on the desk. This is the PROBLEM, not an achievement. */
  arrive: {
    eyebrow: 'Один месяц · один подрядчик',
    heading: 'Вот так приходит месяц.',
    line: 'Акты, выписка, расчёт зарплаты, коробка первички. Он приходит одинаково каждый раз, и сам по себе **не говорит вам ничего**.',
    tally: 5400000,
    tallyLabel: 'прошло через компанию в марте',
    tallyNote: 'ни одна строка не проверена',
  },
  /* First move: separate and name. Order arrives AFTER the heap, never before. */
  sort: {
    eyebrow: 'Шаг первый · Разбор',
    heading: 'Сначала — понять, что вообще на руках.',
    line: 'Пять документов, пять итогов, у каждого имя и дата. Пока это не сделано, сверять нечего — и **до этой части учёт чаще всего не доходит**.',
    /** 33 characters: `.onward` is nowrap and centred (Opening.astro:735). */
    next: 'Дальше: банк подтверждает?',
  },

  /*
   * The beat the page is built around.
   *
   * Reconciling is the whole job and it is invisible on every accounting site
   * ever written, because there is nothing to photograph. There is something
   * to ANIMATE, though: a line looking for its pair, finding one that is
   * wrong, and saying so. The near-miss is the point — an amount matching is
   * not a payment matching, and the visitor who has never thought about that
   * is exactly the visitor who needs a bookkeeper.
   */
  match: {
    eyebrow: 'Шаг второй · Сверка',
    heading: 'Каждую строку нужно найти дважды.',
    line: `Один раз там, где её закрыли актом, второй — там, где пришли деньги. Перевод ниже — те же [[${nearMiss}]] до рубля, и **это не заказчик вам платит**.`,
    /*
     * THE WORKING, NAMED. Twenty seconds of animation written down as a
     * worksheet, in the order a bookkeeper actually does it. It is the
     * cheapest piece of proof on the page: seven lines a generalist could not
     * have written, beside an animation that shows them happening.
     *
     * 27 characters each — the slip's width is fixed (Reconcile.astro:686).
     * `tone` is what the line settles as: agreed, or thrown out. Only one line
     * in a clean month is ever `bad`, and it is the whole point of the scene.
     */
    workLead: 'Работа',
    work: [
      /* Count last, so the phrase never has to agree with a number it does
         not know: "5 приходов" and "2 прихода" take different endings. */
      { t: `Строк в выписке: ${reconcile.right.rows.length}`, tone: 'ok' },
      { t: `Ищем ${reconcile.left.rows[reconcile.sourceIndex]!.label}`, tone: 'ok' },
      { t: `Две строки по ${nearMiss}`, tone: 'ok' },
      { t: 'Сверяем плательщика', tone: 'ok' },
      { t: 'Перевод себе, не выручка', tone: 'bad' },
      { t: `Приход ${reconcile.right.rows[reconcile.matchIndex]!.meta} сошёлся`, tone: 'ok' },
      { t: 'Остальные строки сошлись', tone: 'ok' },
    ] as { t: string; tone: 'ok' | 'bad' }[],
    /* Not "we found a problem" — "there is nothing left to find". */
    verdictLabel: 'Расхождение к разбору',
    verdict: money(0),
    verdictNote: 'каждый акт найден, каждый приход объяснён',
    next: 'Дальше: что из этого ваше?',
  },

  /*
   * The beat that sells the trade.
   *
   * Every owner has looked at a bank balance and quietly assumed some part of
   * it was profit. It is the most expensive mistake in the trade: the crew is
   * owed, the materials are already gone, and the VAT in the account belongs
   * to the budget. What survives all three is the only figure anybody can act
   * on, and producing it every month is exactly what a bookkeeper is for.
   */
  split: {
    eyebrow: 'Шаг третий · Раскладка',
    heading: 'Сколько из этого на самом деле ваше?',
    line: 'Не остаток на счёте и не сумма закрытых актов. На эти деньги уже стоят **трое в очереди раньше вас**: бригада, стройка и [[налоги, которые никогда не были вашими]].',
    /** Both stack in one small-caps cell: 33 characters (Allocate.astro:1701). */
    startLabel: 'Проверено до рубля',
    runningLabel: 'Что осталось',
    /** Why each claim is a claim. 25 characters — the slot ellipsises. */
    claims: {
      payroll: 'выдаётся 5-го и 20-го',
      operating: 'материалы, техника, ГСМ',
      tax: 'удержано для бюджета',
    } as Record<string, string>,
    /*
     * What gets stamped on a piece as it comes off the desk. A rubber stamp is
     * the most recognisable object in the trade and says in one word what a
     * sentence would. Eight characters for the two struck into the corners.
     */
    stamps: {
      payroll: 'Выдано',
      operating: 'Ушло',
      tax: 'Отложено',
    } as Record<string, string>,
    countNote: 'месяц, посчитанный до рубля',
    startedNote: 'с чего месяц начался',

    /* The claim an owner has never once thought about, so it gets its own
       heading rather than sharing the opening one. */
    heldHeading: 'А часть и не была вашей.',
    heldLine:
      'НДС, который вы предъявили заказчику, и взносы за бригаду. Прямо сейчас они лежат на счёте и [[выглядят как деньги]].',
    heldTag: 'Отложено для бюджета',

    /* Heading only — no supporting line. The band has to stay the height it is
       today or the guard that fails first at 1440×700 fails. */
    countHeading: 'Теперь посчитаем то, на что уже никто не претендует.',

    keepHeading: 'Вот цифра, от которой можно планировать.',
    keepLine: '**Одна и та же цифра, посчитанная одинаково, в один и тот же день каждый месяц.** Нанимайте на неё, берите технику или заберите себе.',
    /* The knife the whole scene has been sharpening. Two objects are left on
       the desk and this is the only place to say what the difference is. */
    bothLine: 'На счёте лежит и то и другое. Ваше — только одно.',
    /* The line somebody repeats to somebody else, set apart from its sentence.
       "копеек" is the right ending for every plausible value of this figure
       between five and twenty; below five it would need "копейки". */
    keepCents: `${centsKept} копеек`,
    keepNote: 'с каждого пришедшего рубля — и вот их можно тратить.',
  },
};

/**
 * Step four — the coda.
 *
 * It does NOT present three more numbers. Nobody distrusts the arithmetic by
 * now. What every owner has actually been burned by is a bookkeeper who went
 * quiet in July, so the closing scene argues RECURRENCE — unprovable in words
 * because every firm claims it, and provable in one picture: the same stamp,
 * the same day, three months running, and one empty folder with next month's
 * date already on the tab.
 */
export const close = {
  eyebrow: 'Шаг четвёртый · Закрытие',
  heading: 'И месяц закрывается.',
  line: 'Каждый документ на месте, каждая цифра сверена дважды, ничего не висит и **ничего не ждёт, пока вы вспомните**.',

  sealHeading: 'Закрыт, датирован, подшит.',
  sealLine: 'Одна папка на месяц, с тремя цифрами на обложке. **Открывать её вам не придётся** — ради этого и платят за закрытие месяца.',

  nextHeading: 'А у следующего уже есть дата.',
  nextLine: 'Не «когда дойдут руки». [[Один и тот же рабочий день, каждый месяц]], независимо от того, напомнили вы или нет.',

  /**
   * PRE-PRINTED on the folder's label, before anything is written on it —
   * which is why it names the file rather than claiming the month is finished.
   * The claim is the stamp's job, and the stamp lands later.
   */
  labelLead: 'Дело',
  figures: [
    { label: 'Заработали', id: 'earned' },
    { label: 'Свободных денег', id: 'cash' },
    { label: 'Обе стороны', id: 'balance' },
  ],
  /** Twelve characters on the stamp, seventeen on the ghost folder's due tag. */
  stamp: 'Закрыт',
  due: 'к 10-му',
  ghostNote: 'уже в календаре',
  /* Points at BOTH sections below it — scope first, then the price. 33 chars. */
  onward: 'Дальше: что входит и цена',
};

/**
 * The commercial half of the page.
 *
 * The story is pinned and cinematic. Everything from here down is an ordinary
 * scrolling page, and that change of rhythm is deliberate: after four scenes
 * of being shown something, the visitor wants solid ground and plain answers.
 */
export const services = {
  eyebrow: 'Что вы покупаете',
  heading: 'Система, которая работает, а не одолжение, о котором надо просить.',
  line: 'Всё из этого списка происходит независимо от того, вспомнили вы прислать документы или нет. Список один и тот же каждый месяц — поэтому десятое число — это дата, а не надежда.',
  /** Printed at the head of the checklist sheet, like the artefact it is. */
  sheetTitle: 'Регламент закрытия · стандарт',
  sheetMeta: 'Подряд · абонентское обслуживание',
  boundaryLead: 'И чего мы не делаем',
  tradesLead: 'Кого мы закрываем',
  softwareLead: 'В чём вы уже работаете',
  softwareNote:
    'Мы забираем данные из того, что у вас стоит, и сводим их в вашем учёте. Никого не заставляем менять программу ради того, чтобы стать нашим клиентом.',
};

export const pricing = {
  eyebrow: 'Сколько это стоит',
  heading: 'Фиксированная сумма в месяц, названная до начала работы.',
  line: 'Никогда не по часам. Почасовому бухгалтеру выгодно, чтобы ваш учёт занимал больше времени, — так невыгодно нам обоим.',
  /** Shown instead of a figure when a plan is marked `quoted`. */
  quotedLabel: 'Назовём на звонке',
  includesLead: 'Входит',
  withoutLead: 'Не входит',

  /*
   * THE DELIVERABLE, printed beside the price. Three plans and a list of
   * inclusions describe a service; they do not show anybody what they get. Its
   * three lines are not written here — they are `understand` in story.ru.ts,
   * the same three questions the whole story is built to answer.
   */
  deliverableLead: 'Что приходит каждый месяц',
  deliverableTitle: 'Отчёт за месяц',
  /** Followed by the derived date — "Отправлен 10 апреля". */
  deliverableSentLead: 'Отправлен',
  deliverableFoot: 'Одна страница · человеческим языком · расшифровка по запросу',
  terms: [
    {
      q: 'Из чего складывается цена',
      a: 'Из числа операций и количества объектов — **а не из того, сколько времени мы на них потратим**.',
    },
    { q: 'На какой срок она фиксируется', a: '**На двенадцать месяцев** со дня начала работы.' },
    {
      q: 'Как уйти',
      a: 'Помесячно, начиная со второго квартала. **Предупреждать заранее не нужно, платы за выход нет.**',
    },
  ],
  cta: firm.cta.primary,
  ctaHint: firm.cta.primaryHint,
};

/**
 * Trust — the last question left once the price has been read.
 *
 * It sits AFTER the price on purpose: before it nobody cares who you are;
 * immediately after, it is the only thing they still want to know.
 *
 * The access paragraph is the emptiest space in the whole competitive set. It
 * answers the fear that actually stops a director hiring an outsourced
 * bookkeeper — that somebody he has never met will have his bank.
 */
export const trust = {
  eyebrow: 'Кто мы',
  heading: 'Ваш учёт ведёт один человек, и вы знаете, кто именно.',
  line: 'Не отдел, не тикет-система и не новый сотрудник каждый квартал. Когда что-то не сходится, вы пишете конкретному человеку, а не в поддержку.',
  countLead: {
    years: 'Закрываем месяцы с',
    clients: 'На обслуживании',
    states: 'Где работаем',
  },
  dataLead: 'Как мы обращаемся с доступами',
  data: [
    'Доступ к клиент-банку — только на просмотр. Мы видим операции и не можем перевести ни рубля.',
    'Никаких общих паролей. Если у вас их просят — это не мы.',
    'Документы ходят через ЭДО, а не вложениями в почте.',
    'Доступ только у тех, кого вы назвали. Вы знаете, у кого он есть, и он меняется, когда вы скажете.',
  ],
  saidLead: 'Что говорят',
  /*
   * Printed beside the average rating when `proof.reviewSource` claims one.
   * It is null here, so this never renders. If it is ever switched on for a
   * Russian firm the source is wrong as well as the label: contractors in Kazan
   * leave reviews on Яндекс Картах and 2ГИС, not on Google. Widen
   * `reviewSource` before trusting this string.
   */
  sourceLabel: 'Опубликовано в Google',
  /*
   * Russian counts in three forms — 1 год, 2 года, 11 лет — and the teens all
   * take the third one, which is why this is a rule and not a suffix. The
   * rating is spoken, so it is written the way it is said.
   */
  yearsNote: (n: number) => {
    const t = n % 100;
    const u = n % 10;
    const word = t >= 11 && t <= 14 ? 'лет' : u === 1 ? 'год' : u >= 2 && u <= 4 ? 'года' : 'лет';
    return `${n} ${word}`;
  },
  starsLabel: (n: number) => `${n} из 5`,
};

/**
 * The small print. Boilerplate, templated with the firm's name, written to be
 * read rather than to be long.
 *
 * Two things it deliberately does not do. It does not claim an accessibility
 * "certificate" — there is no standard a private Russian company can be
 * measured against, so the claim would be unprovable; it states what was
 * actually built instead. And it does not pretend to be the personal-data
 * policy the firm publishes under 152-ФЗ — that is a different document doing
 * a different job, and conflating the two means neither gets done.
 */
export const legal = {
  eyebrow: 'Мелкий шрифт',
  /* See the note in content.en.ts. */
  docTitle: 'мелкий шрифт',
  heading: 'Приватность, условия и чем эта страница не является.',
  intro: `Написано, чтобы это читали. Если что-то здесь непонятно, спросите ${firm.person.nameAccusative} до того, как на это опираться, — это быстрее юриста и обычно достаточно.`,
  updated: 'Проверено при публикации',
  back: 'Вернуться на сайт',
  sections: [
    {
      id: 'privacy',
      title: 'Приватность',
      body: [
        'Эта страница вас не отслеживает. Нет ни аналитики, ни рекламного пикселя, ни записи сессий, ни виджета чата, ни единого шрифта с чужого сервера. О вашем визите никуда ничего не уходит — поэтому здесь и нет баннера о куках: соглашаться не с чем, куков нет.',
        'Если вы отправите форму, мы получим то, что вы в неё вписали: имя, почту, компанию, сообщение и телефон, если вы его оставили. Используем это, чтобы вам ответить, и больше ни для чего. Не продаём, не передаём и не добавляем вас ни в какую рассылку. Попросите удалить — удалим.',
        `Это уведомление про сайт. Это не политика обработки персональных данных, которую «${firm.name}» публикует по 152-ФЗ, и не соглашение, которое вы подписываете, становясь клиентом, — это отдельные документы про другое.`,
      ],
    },
    {
      id: 'terms',
      title: 'Условия использования',
      body: [
        'Всё на этом сайте — информация. Чтение не делает вас клиентом и не создаёт никаких обязательств ни у одной из сторон. Работа начинается с подписанного договора, где написан объём, цена и срок, — и не раньше.',
        'Показанный на этой странице месяц — иллюстрация на вымышленных цифрах. Это не результат клиента и не прогноз ваших результатов.',
        'Цена на странице — текущая стоимость обслуживания в описанном рядом объёме. Ваша считается от числа операций и количества объектов и подтверждается письменно до начала работы.',
      ],
    },
    {
      id: 'disclaimer',
      title: 'Это не консультация',
      body: [
        'Ничего на этой странице не является налоговой, юридической или бухгалтерской консультацией применительно к вашей ситуации. Общее описание того, как закрывается месяц, — не рекомендация по вашему учёту, вашему режиму, вашей отчётности или вашим срокам.',
        'Не действуйте по написанному здесь, не показав свои документы человеку, который в них посмотрит. Для этого и нужен звонок.',
      ],
    },
    {
      id: 'accessibility',
      title: 'Доступность',
      body: [
        'Мы не заявляем сертификат и не ставим виджет-«наложение» для доступности. Обязательной проверки на доступность для частной компании в России нет, поэтому любой, кто продаёт «сертификат соответствия», продаёт вам бумажку.',
        'Вот что вместо этого действительно сделано. Страница полностью управляется с клавиатуры. Контраст текста проверен арифметикой на этапе сборки, а не на глаз. Текст нигде не мельче шестнадцати пикселей. Заголовки и ориентиры — настоящие элементы разметки. Анимация при прокрутке декоративна: с включённым в системе «уменьшением движения» страница останавливается и остаётся читаемой.',
        `Если что-то у вас не работает, напишите на ${firm.contact.email} и скажите, что именно сломалось. Это чинится быстрее любого виджета.`,
      ],
    },
  ],
};

export const faq = {
  eyebrow: 'Прежде чем спросите',
  heading: 'Вопросы, которые подрядчик задаёт на самом деле.',
  line: 'Не «что такое бухгалтерия». Это те шесть, по которым сразу видно, вёл человек учёт по объектам хоть раз в жизни или нет.',
  tab: 'Вопросы',
};

/**
 * The ask. The last frame of the document.
 *
 * The call PRODUCES something — a one-page note on last month that the visitor
 * keeps whether or not he hires anybody. A review is a thing; a consultation
 * is a conversation, and nobody schedules a conversation. The three steps live
 * here rather than in a "process" section of their own, because the doubt is
 * not "how does a month work" — ninety seconds of story just answered that —
 * it is "what happens if I click", and that doubt occurs at the button.
 */
export const book = {
  eyebrow: 'Следующий шаг',
  heading: 'Принесите прошлый месяц. Скажем, что с ним не так.',
  line: 'Двадцать минут на звонке и страница о том, что мы нашли в вашем учёте, — она остаётся у вас в любом случае.',
  steps: [
    {
      name: 'Звонок',
      when: '20 минут',
      text: 'Вы рассказываете, мы спрашиваем про объекты и про то, в чём вы уже ведёте учёт. Если мы вам не подходим, скажем это на звонке, а не после него.',
    },
    {
      name: 'Разбор',
      when: 'Страница в ответ',
      text: 'Доступ на чтение к прошлому месяцу, больше ничего. Вы получаете страницу: что нашли, во что это обходится и что мы сделали бы первым.',
    },
    {
      name: 'Первое закрытие',
      when: 'За 3 недели',
      text: 'Если работаем дальше, первый месяц закрываем за три недели. После этого — десятое число, каждый месяц, без напоминаний.',
    },
  ],
  formTitle: 'Заявка на звонок',
  formMeta: 'Без предоплаты. Без договора. Без обязательств.',
  fields: {
    name: 'Как вас зовут',
    email: 'Почта',
    phone: 'Телефон',
    company: 'Компания',
    message: 'Что нам стоит знать',
    messageHint: 'Необязательно — чем занимаетесь, в чём ведёте учёт, что идёт не так.',
  },
  send: 'Отправить',
  /* The form is inert in the demo, but a click has to visibly do something. A
     form that swallows a submit in silence is the same broken promise as a
     button that goes nowhere. */
  sentStamp: 'Принято',
  sentHeading: 'Заявка у нас.',
  sentLine: 'Ответит человек в течение одного рабочего дня — не автоответчик и не цепочка писем.',
  orCall: 'Или позвоните',
  demoNote: 'Это демонстрация. Форма ничего не отправляет.',
};

/**
 * The foot of the page. A local service business with no address reads as a
 * scam however good the rest is.
 */
export const footer = {
  reachLead: 'Связаться',
  visitLead: 'Где мы',
  servesLead: 'Где работаем',
  legalLead: 'Мелкий шрифт',
  langLead: 'Язык',
  langOther: 'English version',
  legal: [
    { label: 'Приватность', href: '/legal#privacy' },
    { label: 'Условия', href: '/legal#terms' },
    { label: 'Оговорка', href: '/legal#disclaimer' },
    { label: 'Доступность', href: '/legal#accessibility' },
  ],
  builtLine: 'Сделано одной страницей намеренно. Ни трекеров, ни баннера о куках, ничего не подгружается со стороны.',
  /** Closes the sentence that starts with the pile caption's period and currency. */
  figuresTail: '— учебный пример, а не результат клиента.',

  /**
   * Printed only while `firm.indexable` is false — that is, only while this is
   * a demonstration rather than a firm's live site. It names the one thing the
   * other disclaimers do not: the firm on this page does not exist.
   */
  demoLine: `Это демонстрация дизайна. Компания «${firm.name}», её сотрудники, отзывы и контакты вымышлены.`,
};

/**
 * The value in the corner that resolves as you scroll. This is the progress
 * bar, made out of the thing the visitor actually cares about.
 *
 * The corner must never be ahead of the beat: it changes as the counter in the
 * middle of the desk finishes, not while it is still running. A strip that
 * already says 5 400 000 ₽ while the big number reads 900 000 ₽ hands over the
 * answer and turns the count into a formality.
 *
 * Values are derived from the buckets rather than typed, so a rescin that
 * edits the month cannot leave the corner announcing last month's figure.
 * Nineteen characters for a note; thirty-three for the whole slot.
 */
export const ledgerStrip = {
  label: 'На столе',
  states: [
    { at: 0, value: '— не разобрано —', tone: 'idle' },
    { at: storyAt('opening', 0.41), value: moneyShort(inflow), note: 'не проверено', tone: 'idle' },
    { at: storyAt('reconcile', 0.8), value: moneyShort(inflow), note: 'сверено', tone: 'good' },
    { at: storyAt('allocate', 0.9), value: moneyShort(kept.amount), note: 'ваше', tone: 'good' },
    /*
     * The last state of the last scene can never be more resolved than the end
     * of the document, because the fade has to finish somewhere. Placed on the
     * beat the stamp lands, and it reaches full strength across the hold.
     */
    { at: storyAt('close', 0.7), value: moneyShort(kept.amount), note: 'закрыт 10 апр.', tone: 'good' },
  ],
};

/* See the note in content.en.ts. */
export const a11y = {
  /** Names the two navigations: the masthead's, and the legal page's contents. */
  sections: 'Разделы',
};
