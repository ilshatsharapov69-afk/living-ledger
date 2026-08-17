/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE RESCIN FILE — RUSSIAN.  Same job as `firm.en.ts`: the one file you edit
 *  to point this demo at a new prospect.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This is a LOCALISATION, not a translation. The English demo is a Texas
 * general contractor's bookkeeper, and its proof points — G702, WH-347, the
 * franchise-tax COGS subtraction — are worth nothing to a director in Kazan.
 * Every one of them has been replaced by the thing that occupies the same slot
 * in a Russian contractor's month: КС-2 and КС-3, гарантийное удержание,
 * генподрядный процент, разрыв по НДС, объектный учёт.
 *
 * WHAT IS DELIBERATELY NOT ON THIS PAGE. A fact-check run against nalog.gov.ru,
 * glavkniga, buh.ru and consultant turned up a list of numbers that are either
 * disputed between sources or changed for 2026, and none of them are printed
 * here: УСН rates, the income boundaries for the reduced VAT rates, the
 * accident-insurance tariff, the МРОТ, and — the one most likely to be got
 * wrong — whether construction kept the 15% small-business contribution
 * tariff. The page describes PROCESS and quotes only what was verified: the
 * 25th/28th calendar, the VAT rate that changed on 1 January 2026, personal income tax paid
 * twice a month, contributions at the general 30%.
 *
 * The firm, the client, the people, the reviews and the figures are invented.
 * The footer says so, and `indexable: false` keeps them out of search.
 */

export const firm = {
  /* ── 0. Publication ──────────────────────────────────────────────────── */

  indexable: false,

  /* ── 1. Identity ─────────────────────────────────────────────────────── */

  /*
   * «Свод» carries both halves of the job in four letters: a свод is what an
   * accountant produces (сводный отчёт, оборотно-сальдовая ведомость) and what
   * a builder builds. Short matters — the letterhead clips the name with an
   * ellipsis below 620px.
   */
  name: 'Свод',

  logo: {
    src: null as string | null,
    alt: 'Свод',
    /** Rendered height in px. The lockup is built around 26–32. */
    height: 26,
    includesName: false,
    /*
     * A С, drawn as one open arc on the same 32×32 grid and at the same stroke
     * weight as the English N. Round caps rather than square: a square cap on
     * the end of a curve reads as a snapped-off stub, where on the N's straight
     * strokes it reads as a pen lifted.
     */
    mark: { d: 'M20.1 11.1A6.4 6.4 0 1 0 20.1 20.9', cap: 'round' as 'square' | 'round' },
  },

  brandColor: '#146B4F',

  /* ── 2. What they do, for whom ───────────────────────────────────────── */

  discipline: 'Бухгалтерия и закрытие месяца',

  /** Shares one nowrap strip with the phone and the CTA. 39 characters of room. */
  descriptor: 'Бухгалтерия для подрядчиков · Казань',

  audience: {
    clientType: 'строительных подрядчиков',
    homeState: 'Татарстане',
    /*
     * Not licences. Russia stopped licensing construction in 2010 and never
     * licensed bookkeeping at all, so the honest content of this slot is where
     * the firm actually works — and for a firm that files everything through
     * ЭДО, that is "anywhere".
     */
    states: ['Казань', 'Татарстан', 'ЭДО по России'],
  },

  /*
   * Without the «Вы получаете» opener, which cost thirteen characters and a
   * third line of the hero at 390px wide — and with it the clearance the
   * opening scene needs between the copy and the paper. Sixty-eight characters
   * is the working budget here; the English line is sixty-seven.
   */
  promise: 'Закрытый месяц и **три цифры, с которыми можно работать** — [[до 10-го числа]].',

  /* ── 3. Proof ────────────────────────────────────────────────────────── */

  /*
   * 'bookkeeping' — and that is a decision, not a default.
   *
   * The whole CPA mechanism exists because Texas 22 TAC §501.81 makes the
   * claim illegal for an unlicensed entity. Russia has no equivalent: there is
   * no protected title for a bookkeeper, and the nearest things that exist —
   * аттестат аудитора, членство в ИПБ — belong to a real person who earned
   * them. Inventing one for a demo firm would be inventing a credential.
   *
   * At 'bookkeeping' the chip, the credential line and the disclaimer are all
   * impossible to render, which is the quiet state this field's own comment in
   * `firm.en.ts` recommends when in doubt.
   */
  licensure: 'bookkeeping' as 'cpa-firm' | 'cpa-owned' | 'bookkeeping',

  /** Never printed at 'bookkeeping'. Kept because the shape is shared. */
  licensureNote:
    'Фирма не является аудиторской организацией и не оказывает аудиторских услуг.',

  proof: {
    credentials: ['1С:Специалист — Бухгалтерия предприятия', 'ГРАНД-Смета'],
    /** Printed only when licensure allows it, so never on this build. */
    cpaCredential: 'Аттестованный бухгалтер',
    yearsInBusiness: 11,
    clientCount: 42,
    /*
     * Three, each with a full name, a company, a trade and one figure. The
     * companies are the ones already named in the worked month, so a visitor
     * who reads the whole page meets the same invented world twice rather than
     * two disconnected sets of names.
     */
    testimonials: [
      {
        quote:
          'В конце объекта выяснилось, что две допработы никто не закрыл допсоглашением, и в КС-2 они не попали. Это был последний месяц до Гульнары. С тех пор такого не было, и я перестал открывать 1С в одиннадцать вечера.',
        name: 'Дамир Хайруллин',
        role: 'Директор',
        company: 'ООО «Ярус»',
        trade: 'Генподряд · 8 человек в штате',
        /** How a review site prints its age. Relative, so it never goes stale. */
        when: '2 месяца назад',
        stars: 5,
      },
      {
        quote:
          'Банк под гарантию попросил расшифровку дебиторки по объектам, отдельно гарантийные удержания. У меня её просто не было. Через четыре дня она была, и теперь она есть десятого числа каждого месяца.',
        name: 'Сергей Плетнёв',
        role: 'Директор',
        company: 'Полюс-Инжиниринг',
        trade: 'Инженерные сети',
        when: '5 месяцев назад',
        stars: 5,
      },
      {
        quote:
          'Приходящему бухгалтеру я платила 90 тысяч в тяжёлый месяц и 25 в спокойный и никогда не знала заранее, какой будет. Фиксированная цифра, которую можно заложить в бюджет, оказалась важнее самой экономии.',
        name: 'Алия Фаттахова',
        role: 'Владелец',
        company: 'Каскад-Девелопмент',
        trade: 'Отделка и фит-аут',
        when: 'год назад',
        stars: 5,
      },
    ],

    /*
     * `null`, and it must stay `null` while the reviews are invented. See the
     * long note in `firm.en.ts`: the value 'google' prints "Опубликовано в
     * Google" under a map pin, which is borrowed credibility for three reviews
     * that were written in this file.
     */
    reviewSource: null as 'google' | null,
  },

  person: {
    name: 'Гульнара Сафина',
    /* Russian inflects. Anything that puts the name INSIDE a sentence needs
       this form; the nominative above is for standing alone under a portrait. */
    nameAccusative: 'Гульнару Сафину',
    role: 'Основатель',
    initials: 'ГС',
    portrait: null as string | null,
    line: 'Девять лет я закрывала месяц внутри генподрядчика и только потом стала делать это для других. Всё, что на этом сайте, устроено так, как я хотела, чтобы это было устроено, когда это была моя работа.',
  },

  /* ── 4. Contact ──────────────────────────────────────────────────────── */

  contact: {
    /*
     * INVENTED, AND RUSSIA HAS NO 555. The English file could reach for a
     * number block reserved for fiction; there is no such block in the Russian
     * numbering plan, so this is a plausible Kazan number that somebody could
     * in principle hold. Replace it from the prospect's own site before this
     * page is shown to anyone — it is the first line of the rescin checklist.
     */
    phone: '+7 (843) 555-01-48',
    phoneHref: 'tel:+78435550148',
    email: 'mail@svod-uchet.ru',
    calendarUrl: '/#book',
    /*
     * Their existing portal — 1С:Кабинет сотрудника, Диадок, СБИС, whatever
     * they already run. We never host one. `null` removes the link everywhere
     * rather than leaving it dead.
     */
    clientLoginUrl: null as string | null,
    /** Deliberately not a real office. Somebody works at a real address. */
    street: 'ул. Образцовая, 7, офис 210',
    city: 'Казань',
    state: 'Татарстан',
    zip: '420015',
    hours: 'Пн–Пт, 9:00–18:00 МСК',
  },

  /*
   * Facebook, Instagram and LinkedIn are null and that is not an oversight:
   * Meta's services are blocked in Russia, and a Russian firm's letterhead
   * carrying their marks is the loudest possible tell that the page was
   * translated rather than written.
   *
   * WhatsApp is null for two reasons and only one of them is that argument.
   * The weak reason is that WhatsApp is Meta too, and the exact status of the
   * messenger in Russia in 2026 is not something this file is willing to
   * assert. The strong reason needs no checking at all: the link pointed at a
   * Kazan LANDLINE, and a wa.me link on a city number is its own quiet tell.
   * Telegram is where a Kazan bookkeeper is actually reached.
   */
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
    telegram: 'https://t.me/svod_uchet',
    whatsapp: null as string | null,
    google: null as string | null,
  },

  /* ── 5. Labels ───────────────────────────────────────────────────────── */

  cta: {
    /*
     * ELEVEN CHARACTERS. Measured, not guessed: at 621px the letterhead tab is
     * the tightest slot on the site, and Cyrillic runs about 16% wider per
     * character in Geist than Latin does. «Записаться на звонок» pushes the
     * button off the sheet.
     */
    primary: 'Записаться',
    primaryHint: '20 минут · без продаж',
    login: 'Личный кабинет',
  },

  /* ── 6. Scope ────────────────────────────────────────────────────────── */

  /*
   * The close checklist, grouped by how often each thing happens. Grouping by
   * cadence does the selling on its own: it says "this is a system that runs"
   * rather than "here are some services".
   *
   * Every line is a lead and a tail — the `**…**` markers set the first few
   * words heavier, so sixteen lines can be skimmed in four seconds. Mark the
   * NOUN, the thing that gets done.
   */
  scope: [
    {
      cadence: 'Каждую неделю',
      items: [
        '**Банк и касса разнесены** по объектам, а не свалены в «прочее»',
        '**Первичка собрана** — и выбита у тех, кто её не прислал',
        '**Счета поставщиков в очереди на вашу подпись**, а не оплачены за вашей спиной',
      ],
    },
    {
      cadence: 'Каждый месяц',
      items: [
        '**Каждый расчётный счёт сверен с выпиской**, строка за строкой',
        '**Зарплата, НДФЛ и взносы** посчитаны и отражены — НДФЛ дважды в месяц, как теперь и положено',
        '**Затраты разнесены по объектам**: материалы, техника, субподряд',
        '**Гарантийные удержания выделены отдельно**, а не растворены в общей дебиторке',
        '**Налоги отложены** — чтобы их не потратили по дороге',
        '**Период закрыт и заблокирован**, задним числом ничего не двинется',
        '**Три цифры у вас в почте** до 10-го',
      ],
    },
    {
      cadence: 'Каждый квартал',
      items: [
        '**Декларация по НДС сдана**, книги покупок и продаж сверены с контрагентами',
        '**6-НДФЛ, РСВ и раздел 2 ЕФС-1** сданы к 25-му',
        '**Авансовый платёж посчитан заранее**, а не вечером 27-го',
      ],
    },
    {
      cadence: 'Каждый год',
      items: [
        '**Годовая отчётность и декларация** сданы в срок',
        '**Акты сверки** с заказчиками и поставщиками разосланы и собраны',
        '**Основные средства и амортизация** выверены',
      ],
    },
  ],

  /*
   * The boundary, stated before anybody has to ask. The second line is the one
   * that earns the most: a director who has been offered «бумажный НДС» by a
   * previous bookkeeper recognises immediately which kind of firm this is.
   */
  outOfScope: [
    '**Мы не считаем сметы и не трогаем ваши цены.** Это ваша работа и ваш риск — мы считаем то, что уже подписано.',
    '**Мы не «оптимизируем» НДС.** Ни бумажного НДС, ни техничек, ни разрывов, которые кто-то закроет. Это не бухгалтерия, это статья 54.1, и отвечать по ней вам.',
  ],

  /*
   * The objections, in a language only somebody who has done this niche can
   * speak. This is the highest proof-per-pixel block on the page and the one a
   * template vendor structurally cannot copy: their FAQ has to work for
   * dentists too, so it can never mention КС-3 or АСК НДС-2.
   */
  faq: [
    {
      q: 'Договор подписан в 2025-м, объект закрываем в 2026-м. НДС по какой ставке?',
      a: 'По ставке на дату подписания акта, а не на дату договора. Ставка с этого года выросла, и на длящемся подряде часть КС-2 закрыта по прежней, а всё, что подписано в этом году, — по новой. Переходного периода закон не установил. Практический вопрос обычно не «сколько», а «кто платит разницу»: цену договора в одностороннем порядке поднять нельзя, нужно допсоглашение. Мы считаем, во что вам обходится каждый вариант, до того как вы сядете за стол с заказчиком.',
    },
    {
      q: 'Заказчик держит гарантийное удержание год. Почему налоги с него платятся сразу?',
      a: 'Потому что и НДС, и налоговая база возникают на дату подписания КС-2, а не на дату денег. Заказчик заплатил 90–95%, оставшиеся 5–10% придут через год, а обязательство появилось сегодня — это и есть кассовый разрыв, который в подряде убивает больше компаний, чем убытки. Мы ведём гарантийки отдельным аналитическим срезом: сколько, по какому объекту, с какого месяца лежит и когда наступает срок возврата. Иначе они теряются при смене бухгалтера, и это происходит чаще, чем кажется.',
    },
    {
      q: 'Прилетело требование по НДС из-за субподрядчика, о котором я впервые слышу.',
      a: 'Разрыв по цепочке — это не про вашу добросовестность, это про то, что АСК НДС-2 не нашла парный счёт-фактуру у кого-то во втором или третьем звене. Отбивается доказательствами реальности работ: журналы, пропуска на объект, исполнительная документация, люди на площадке, переписка. Мы собираем это досье заранее, по каждому субподрядчику, а не в тот момент, когда пришло требование и осталось пять рабочих дней.',
    },
    {
      q: 'Бригады оформлены как самозанятые. Насколько это опасно?',
      a: 'Опасность не в самом статусе, а в признаках трудовых отношений: график, подчинение прорабу, одинаковая сумма каждый месяц, работа на вашей технике, единственный заказчик. Совокупность этих признаков — основание переквалифицировать договор, доначислить НДФЛ и взносы, пени и штраф. Мы смотрим, как у вас реально устроено, говорим прямо, где тонко, и приводим договоры и акты в форму, которую можно защищать. Чего мы не сделаем — не скажем, что рисков нет, если они есть.',
    },
    {
      q: 'Я вижу прибыль по фирме, но не вижу, сколько заработал конкретный объект.',
      a: 'Это самая частая причина, по которой подрядчик работает в убыток и узнаёт об этом через год. Позаказный учёт: каждая стройка — отдельный объект с собственными затратами, включая субподряд, аренду техники, материалы и удержанный генподрядный процент. Тогда видно не «прибыль по фирме», а какой объект вы вытягиваете за счёт другого. И становится понятно, почему цифра прибыли не совпадает с остатком на расчётном счёте: между ними стоят НЗП, дебиторка и гарантийки.',
    },
    {
      q: 'Открываем участок в другом регионе. Что меняется?',
      a: 'Если рабочие места создаются больше чем на месяц, возникает обособленное подразделение: постановка на учёт, НДФЛ и отчётность по месту подразделения. Отдельно всплывают вахтовая надбавка, СОУТ на удалённом участке и уведомления по иностранным работникам — там срок три рабочих дня и очень дорогой штраф. Скажите про участок на звонке, до того как туда поехала первая бригада: задним числом это оформляется дороже.',
    },
  ],

  /*
   * The niche, stated three ways. All three are narrow enough to read as
   * expensive, and together they cost about forty words.
   */
  niche: {
    trades: [
      'Генподряд',
      'Отделка и фит-аут',
      'Электромонтаж',
      'ОВиК и вентиляция',
      'Слаботочка и АСУ',
      'Фасады и кровля',
      'Инженерные сети',
    ],
    /* What they already run. Set as wordmarks in the page's own type — logo
       images would break the desk, and the constraint improves it. */
    software: ['1С:Бухгалтерия', '1С:ЗУП', 'ГРАНД-Смета', 'Диадок', 'СБИС', 'Контур.Экстерн'],
    /* Rendered nowhere today; kept because the shape is shared with English. */
    fitFrom: 25000000,
    fitTo: 400000000,
    notFor:
      '**Меньше 25 млн ₽ в год — вам пока хватит приходящего бухгалтера**, а больше 400 млн — нужен свой финансовый директор в штате. Это вы услышите на звонке, а не через полгода.',
  },

  /* ── 7. Price ────────────────────────────────────────────────────────── */

  pricing: {
    /* No currency symbol: `moneyShort` knows where the ruble sign goes. */
    period: '/мес',
    plans: [
      {
        /* Thirteen characters. `.plan__name` is set at --fs-xl in a column
           that can be as narrow as a third of the sheet. */
        name: 'Учёт',
        for: 'Подрядчик до 30 млн в год, зарплату ведёт кто-то другой.',
        price: 45000,
        quoted: false,
        includes: [
          'Недельный и месячный список целиком',
          'Налоги посчитаны и отложены заранее',
          'Годовая отчётность и декларация',
        ],
        without: 'Зарплата, объектный учёт и гарантийные удержания',
        stamp: null as string | null,
      },
      {
        name: 'С зарплатой',
        for: 'То же самое плюс бригада и всё, что бригада за собой приносит.',
        price: 85000,
        quoted: false,
        includes: [
          'Зарплата, НДФЛ дважды в месяц, взносы',
          '6-НДФЛ, РСВ и раздел 2 ЕФС-1 по кругу',
          'Приём и увольнение в СФР на следующий рабочий день',
        ],
        without: 'Учёт по объектам и гарантийные удержания',
        stamp: 'Чаще всего берут',
      },
      {
        name: 'Полный цикл',
        for: 'Несколько объектов, субподряд и заказчик, который держит гарантийку.',
        price: 140000,
        quoted: false,
        includes: [
          'Себестоимость по каждому объекту',
          'Гарантийные удержания и акты сверки',
          'Разбор на полчаса каждый месяц',
        ],
        without: null as string | null,
        stamp: null as string | null,
      },
    ],
  },

  /*
   * Four labels, 44 characters between them — the nav is one nowrap flex row
   * and it only appears above 1180px, where the strip is already carrying the
   * name, the phone, the socials and the button.
   */
  nav: [
    { label: 'Как идёт месяц', href: '/#story' },
    { label: 'Что входит', href: '/#services' },
    { label: 'Цены', href: '/#pricing' },
    { label: 'О нас', href: '/#trust' },
  ],
};
