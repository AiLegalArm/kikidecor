export type Lang = "ru" | "en";

export const translations = {
  // ── Nav ──
  nav: {
    home: { ru: "Главная", en: "Home" },
    decor: { ru: "Decor Studio", en: "Decor Studio" },
    showroom: { ru: "Showroom", en: "Showroom" },
    about: { ru: "О нас", en: "About" },
    contact: { ru: "Контакты", en: "Contact" },
  },

  // ── Footer ──
  footer: {
    tagline: { ru: "Красота в каждой детали", en: "Beauty in every detail" },
    decorStudio: { ru: "Decor Studio", en: "Decor Studio" },
    decorServices: { ru: "Услуги декора", en: "Decor Services" },
    portfolio: { ru: "Портфолио", en: "Portfolio" },
    packages: { ru: "Пакеты", en: "Packages" },
    booking: { ru: "Бронирование", en: "Booking" },
    showroom: { ru: "Showroom", en: "Showroom" },
    collection: { ru: "Коллекция", en: "Collection" },
    stylist: { ru: "Стилист", en: "Stylist" },
    calculator: { ru: "Калькулятор", en: "Calculator" },
    navigation: { ru: "Навигация", en: "Navigation" },
    contacts: { ru: "Контакты", en: "Contacts" },
    rights: { ru: "Все права защищены.", en: "All rights reserved." },
    getInTouch: { ru: "Связаться", en: "Get in Touch" },
    backToTop: { ru: "Наверх", en: "Back to top" },
  },

  // ── Home Hero ──
  home: {
    subtitle: { ru: "Luxury Events & Fashion", en: "Luxury Events & Fashion" },
    exploreDecor: { ru: "Decor Studio", en: "Explore Decor Studio" },
    visitShowroom: { ru: "Showroom", en: "Visit Showroom" },
    scroll: { ru: "Листайте", en: "Scroll" },

    // Story
    storyOverline: { ru: "Наша история", en: "Our Story" },
    storyTitle1: { ru: "История", en: "The Story" },
    storyTitle2: { ru: "бренда", en: "of" },
    storyParagraph1: {
      ru: "KiKi родился из простой веры — красота не роскошь, а образ жизни. То, что начиналось как страсть к преображению пространств в незабываемые впечатления, превратилось в лайфстайл-бренд, затрагивающий каждый аспект эстетической жизни.",
      en: "KiKi was born from a simple belief — that beauty is not a luxury, it's a way of life. What started as a passion for transforming spaces into unforgettable experiences has grown into a lifestyle brand that touches every aspect of aesthetic living.",
    },
    storyParagraph2: {
      ru: "Наша Decor Studio создаёт иммерсивные атмосферы для свадеб, торжеств и частных мероприятий — где каждый лепесток, свеча и драпировка рассказывают историю. Наш Showroom курирует моду, воплощающую ту же утончённую элегантность — одежда и аксессуары для женщин, видящих в стиле самовыражение.",
      en: "Our Decor Studio crafts immersive atmospheres for weddings, celebrations, and private events — where every petal, candle, and drape tells a story. Our Showroom curates fashion that embodies the same refined elegance — clothing and accessories chosen for women who see style as self-expression.",
    },
    storyPhilosophy: {
      ru: "Два мира, одна философия: окружай себя красотой — всегда.",
      en: "Two worlds, one philosophy: surround yourself with beauty, always.",
    },

    // Two Worlds
    discoverOverline: { ru: "Откройте", en: "Discover" },
    twoWorldsTitle: { ru: "Два мира", en: "Two Worlds of" },
    divisionI: { ru: "Направление I", en: "Division I" },
    divisionII: { ru: "Направление II", en: "Division II" },
    decorDescription: {
      ru: "Студия декора для свадеб, дней рождения и торжеств. Мы создаём атмосферу, которая живёт в памяти вечно.",
      en: "Luxury event decoration studio for weddings, birthdays and celebrations. We craft atmospheres that live in memory forever.",
    },
    showroomDescription: {
      ru: "Модный шоурум с курированными коллекциями одежды и аксессуаров. Стиль, который вдохновляет уверенность и элегантность.",
      en: "Fashion showroom with curated clothing collections and accessories. Style that inspires confidence and elegance.",
    },

    // Testimonials
    testimonialsOverline: { ru: "Отзывы", en: "Testimonials" },
    testimonialsTitle: { ru: "Что говорят наши клиенты", en: "What Our Clients Say" },

    // Contact CTA
    ctaOverline: { ru: "Свяжитесь", en: "Get in Touch" },
    ctaTitle: { ru: "Готовы создать нечто", en: "Ready to create something" },
    ctaTitleItalic: { ru: "прекрасное", en: "beautiful" },
    ctaSubtitle: {
      ru: "Будь то мероприятие мечты или идеальный гардероб — давайте воплотим это вместе.",
      en: "Whether it's a dream event or your perfect wardrobe — let's make it happen together.",
    },
    bookConsultation: { ru: "Консультация", en: "Book a Consultation" },
    contactUs: { ru: "Связаться", en: "Contact Us" },
  },

  // ── Testimonials data ──
  testimonials: [
    {
      name: "Анна и Дмитрий",
      event: "Wedding Decor",
      text: {
        ru: "KiKi Decor превратили нашу свадебную площадку в настоящую сказку. Каждая деталь была продумана до мелочей — от цветочных арок до свечей на столах.",
        en: "KiKi Decor transformed our wedding venue into a real fairy tale. Every detail was thought through — from floral arches to candles on the tables.",
      },
    },
    {
      name: "Екатерина М.",
      event: "Facade Design",
      text: {
        ru: "Невероятное преображение нашего дома! Крыльцо и входная группа стали выглядеть как из журнала. Команда — настоящие волшебники.",
        en: "An incredible transformation of our home! The porch and entrance now look like something from a magazine. The team are true magicians.",
      },
    },
    {
      name: "Ольга и Сергей",
      event: "Photo Zone",
      text: {
        ru: "Заказывали фотозону на юбилей — результат превзошёл все ожидания. Живые цветы, подсветка, продуманный стиль.",
        en: "We ordered a photo zone for an anniversary — the result exceeded all expectations. Fresh flowers, lighting, thoughtful styling.",
      },
    },
  ],

  // ── About ──
  about: {
    metaTitle: {
      ru: "О студии Ki Ki Decor — 500+ проектов декора",
      en: "About Ki Ki Decor — 500+ Decoration Projects",
    },
    ourStory: { ru: "Наша история", en: "Our Story" },
    heroTitle: { ru: "Красота в каждой детали", en: "Beauty in every detail" },
    heroParagraph1: {
      ru: "Ki Ki Decor — студия декора, которая творит волшебство. Мы специализируемся на оформлении фасадов домов, входных групп, свадебных площадок, праздников и тематических фотозон.",
      en: "Ki Ki Decor is a decoration studio that creates magic. We specialize in decorating house facades, entrance groups, wedding venues, celebrations and themed photo zones.",
    },
    heroParagraph2: {
      ru: "Работаем по всей России — от Ростова до Геленджика и далеко за их пределами. Каждый проект для нас — это возможность преобразить пространство и создать эмоции, которые запомнятся навсегда.",
      en: "We work across Russia — from Rostov to Gelendzhik and far beyond. Every project is an opportunity to transform a space and create emotions that will be remembered forever.",
    },
    stats: {
      projects: { ru: "Проектов", en: "Projects" },
      experience: { ru: "Лет опыта", en: "Years Experience" },
      reviews: { ru: "Отзывов 5★", en: "5★ Reviews" },
      geography: { number: { ru: "Вся", en: "All" }, label: { ru: "Россия", en: "Russia" } },
    },
    approach: { ru: "Наш подход", en: "Our Approach" },
    approachTitle: { ru: "Уют, стиль и внимание к деталям", en: "Comfort, style and attention to detail" },
    approachText: {
      ru: "Мы верим в силу визуального преображения. Наш подход — это природные цвета, актуальные тренды и индивидуальный стиль для каждого проекта. Будь то стиль «Аля Русс» для свадьбы или современный минимализм для фасада — мы найдём идеальное решение.",
      en: "We believe in the power of visual transformation. Our approach is natural colors, current trends and individual style for every project. Whether it's 'À la Russe' for a wedding or modern minimalism for a facade — we'll find the perfect solution.",
    },
    ourServices: { ru: "Наши услуги", en: "Our Services" },
  },

  // ── Services ──
  services: {
    overline: { ru: "Что мы делаем", en: "What We Do" },
    title: { ru: "Наши услуги", en: "Our Services" },
    subtitle: {
      ru: "Каждый проект уникален — мы подбираем решение под ваш стиль, пространство и бюджет.",
      en: "Every project is unique — we find the right solution for your style, space and budget.",
    },
    priceLabel: { ru: "Стоимость", en: "Price" },
    order: { ru: "Заказать", en: "Order" },
    customTitle: { ru: "Есть особенная идея?", en: "Have a special idea?" },
    customText: {
      ru: "Мы обожаем воплощать нестандартные задумки. Расскажите о вашем проекте — и мы создадим нечто особенное.",
      en: "We love bringing unconventional ideas to life. Tell us about your project — and we'll create something special.",
    },
    discussProject: { ru: "Обсудить проект", en: "Discuss Project" },
    items: [
      {
        title: { ru: "Декор фасадов", en: "Facade Decoration" },
        desc: {
          ru: "Преображение фасадов домов, крылечек и входных групп — сезонное оформление, праздничный декор, стильные композиции из живых и искусственных материалов.",
          en: "Transformation of house facades, porches and entrance groups — seasonal decoration, holiday decor, stylish compositions from natural and artificial materials.",
        },
        price: { ru: "от 15 000 ₽", en: "from ₽15,000" },
      },
      {
        title: { ru: "Свадебный декор", en: "Wedding Decoration" },
        desc: {
          ru: "Цветочные арки, оформление столов, освещение и инсталляции — создаём атмосферу вашей мечты для самого важного дня.",
          en: "Floral arches, table settings, lighting and installations — creating the atmosphere of your dreams for the most important day.",
        },
        price: { ru: "от 30 000 ₽", en: "from ₽30,000" },
      },
      {
        title: { ru: "Оформление праздников", en: "Celebration Decoration" },
        desc: {
          ru: "Дни рождения, юбилеи, детские праздники — шары, цветы, тематический декор и сладкие столы для любого торжества.",
          en: "Birthdays, anniversaries, children's parties — balloons, flowers, themed decor and dessert tables for any celebration.",
        },
        price: { ru: "от 10 000 ₽", en: "from ₽10,000" },
      },
      {
        title: { ru: "Фотозоны", en: "Photo Zones" },
        desc: {
          ru: "Стильные фотозоны для свадеб, корпоративов и частных мероприятий — цветочные стены, неоновые вывески, авторские инсталляции.",
          en: "Stylish photo zones for weddings, corporate events and private parties — flower walls, neon signs, custom installations.",
        },
        price: { ru: "от 12 000 ₽", en: "from ₽12,000" },
      },
      {
        title: { ru: "Декор входных групп", en: "Entrance Decoration" },
        desc: {
          ru: "Оформление входных зон ресторанов, отелей, магазинов и частных домов — создаём первое впечатление, которое запоминается.",
          en: "Decorating entrance areas of restaurants, hotels, shops and private homes — creating a first impression that lasts.",
        },
        price: { ru: "от 8 000 ₽", en: "from ₽8,000" },
      },
      {
        title: { ru: "Корпоративные мероприятия", en: "Corporate Events" },
        desc: {
          ru: "Брендированный декор для конференций, презентаций, гала-ужинов и корпоративных праздников любого масштаба.",
          en: "Branded decor for conferences, presentations, gala dinners and corporate celebrations of any scale.",
        },
        price: { ru: "от 25 000 ₽", en: "from ₽25,000" },
      },
    ],
  },

  // ── Contact ──
  contact: {
    overline: { ru: "Связаться", en: "Get in Touch" },
    title: { ru: "Контакты", en: "Contact" },
    subtitle: {
      ru: "Выберите удобный способ связи — мы ответим в течение нескольких часов.",
      en: "Choose a convenient way to reach us — we'll respond within a few hours.",
    },
    callBtn: { ru: "Позвонить", en: "Call" },
    whatsappBtn: { ru: "WhatsApp", en: "WhatsApp" },
    instagramBtn: { ru: "Instagram", en: "Instagram" },
    emailBtn: { ru: "Email", en: "Email" },
    phone: { ru: "Телефон", en: "Phone" },
    geography: { ru: "География", en: "Geography" },
    geographyValue: {
      ru: "Ростов-на-Дону, Геленджик и вся Россия",
      en: "Rostov-on-Don, Gelendzhik and all of Russia",
    },
    workHoursLabel: { ru: "Режим работы", en: "Working Hours" },
    workHoursValue: { ru: "Пн–Сб, 9:00–18:00", en: "Mon–Sat, 9:00–18:00" },
    formIntro: {
      ru: "Хотите обсудить проект, задать вопрос или просто поздороваться — мы всегда на связи. Напишите в WhatsApp для быстрого ответа.",
      en: "Want to discuss a project, ask a question, or just say hello — we're always in touch. Write on WhatsApp for a quick reply.",
    },
    nameLabel: { ru: "Имя", en: "Name" },
    emailLabel: { ru: "Email", en: "Email" },
    subjectLabel: { ru: "Тема", en: "Subject" },
    messageLabel: { ru: "Сообщение", en: "Message" },
    send: { ru: "Отправить", en: "Send" },
    sending: { ru: "Отправка...", en: "Sending..." },
    successMsg: {
      ru: "Сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
      en: "Message sent! We'll get back to you soon.",
    },
    errorMsg: { ru: "Ошибка отправки. Попробуйте позже.", en: "Failed to send. Please try again later." },
    mapOverline: { ru: "Где мы", en: "Where We Are" },
    mapTitle: { ru: "На карте", en: "On the Map" },
  },

  // ── Booking ──
  booking: {
    overline: { ru: "Бронирование", en: "Booking" },
    title: { ru: "Забронировать мероприятие", en: "Book Your Event" },
    subtitle: {
      ru: "Заполните детали вашего мероприятия и выберите дату — мы свяжемся с вами в течение 24 часов.",
      en: "Fill in your event details and choose a date — we'll get back to you within 24 hours.",
    },
    selected: { ru: "Выбрано", en: "Selected" },
    almostBooked: { ru: "Почти занято", en: "Almost Booked" },
    unavailable: { ru: "Недоступно", en: "Unavailable" },
    bookingTitle: { ru: "Бронирование", en: "Booking Request" },
    nameLabel: { ru: "Ваше имя", en: "Your Name" },
    phoneLabel: { ru: "Телефон", en: "Phone" },
    emailLabel: { ru: "Email", en: "Email" },
    eventTypeLabel: { ru: "Тип мероприятия", en: "Event Type" },
    selectPlaceholder: { ru: "Выберите...", en: "Select..." },
    guestsLabel: { ru: "Количество гостей", en: "Guest Count" },
    locationLabel: { ru: "Локация / Площадка", en: "Location / Venue" },
    budgetLabel: { ru: "Бюджет", en: "Budget Range" },
    decorStyleLabel: { ru: "Стиль декора", en: "Decor Style" },
    wishesLabel: { ru: "Пожелания", en: "Additional Wishes" },
    wishesPlaceholder: {
      ru: "Расскажите о цветовой гамме, особых пожеланиях, вдохновении...",
      en: "Tell us about color palette, special requests, inspiration...",
    },
    dateLabel: { ru: "Дата мероприятия", en: "Event Date" },
    pickDate: { ru: "Выберите дату", en: "Pick a date" },
    stepDetails: { ru: "Детали", en: "Details" },
    stepDate: { ru: "Дата", en: "Date" },
    stepContact: { ru: "Контакты", en: "Contact" },
    submitBtn: { ru: "Отправить заявку", en: "Submit Request" },
    submitting: { ru: "Отправка...", en: "Sending..." },
    successTitle: { ru: "Заявка отправлена!", en: "Request Submitted!" },
    successMsg: { ru: "Спасибо! Мы свяжемся с вами в течение 24 часов для обсуждения деталей.", en: "Thank you! We'll contact you within 24 hours to discuss the details." },
    errorMsg: { ru: "Ошибка отправки. Попробуйте позже.", en: "Failed to send. Please try again later." },
    eventTypes: [
      { ru: "Свадьба", en: "Wedding" },
      { ru: "День рождения", en: "Birthday" },
      { ru: "Юбилей", en: "Anniversary" },
      { ru: "Декор фасада", en: "Facade Decoration" },
      { ru: "Фотозона", en: "Photo Zone" },
      { ru: "Входная группа", en: "Entrance Group" },
      { ru: "Корпоратив", en: "Corporate Event" },
      { ru: "Предложение руки", en: "Proposal" },
      { ru: "Другое", en: "Other" },
    ],
    budgetRanges: [
      { ru: "до 30 000 ₽", en: "up to ₽30,000" },
      { ru: "30 000 – 80 000 ₽", en: "₽30,000 – ₽80,000" },
      { ru: "80 000 – 150 000 ₽", en: "₽80,000 – ₽150,000" },
      { ru: "150 000 – 300 000 ₽", en: "₽150,000 – ₽300,000" },
      { ru: "300 000+ ₽", en: "₽300,000+" },
    ],
    decorStyles: [
      { ru: "Минимализм", en: "Minimalism" },
      { ru: "Классика", en: "Classic" },
      { ru: "Романтика", en: "Romantic" },
      { ru: "Люкс", en: "Luxury" },
      { ru: "Бохо", en: "Boho" },
      { ru: "Тематический", en: "Themed" },
      { ru: "На ваше усмотрение", en: "Designer's choice" },
    ],
    validationName: { ru: "Укажите имя", en: "Enter your name" },
    validationPhone: { ru: "Укажите телефон", en: "Enter your phone" },
    validationEmail: { ru: "Неверный email", en: "Invalid email" },
    validationType: { ru: "Выберите тип", en: "Select type" },
  },

  // ── Portfolio ──
  portfolio: {
    coverOverline: { ru: "Коллекция", en: "The Collection" },
    coverTitle1: { ru: "Истории,", en: "Stories Told" },
    coverTitle2: { ru: "рассказанные дизайном", en: "Through Design" },
    coverSubtitle: {
      ru: "Каждый проект — это повествование, сочетание видения, мастерства и эмоций. Листайте нашу редакционную коллекцию эксклюзивных дизайнов.",
      en: "Each project is a narrative — a convergence of vision, craft, and emotion. Browse our editorial collection of bespoke event designs.",
    },
    closingQuote: {
      ru: "«Каждое мероприятие — это чистый холст. Мы превращаем его в шедевр.»",
      en: '"Every event is a blank canvas. We turn it into a masterpiece."',
    },
    theConcept: { ru: "Концепция", en: "The Concept" },
    designStyle: { ru: "Стиль дизайна", en: "Design Style" },
    decorElements: { ru: "Элементы декора", en: "Décor Elements" },
    viewProject: { ru: "Смотреть проект", en: "View Project" },
  },

  // ── Packages ──
  packages: {
    overline: { ru: "Цены", en: "Pricing" },
    title: { ru: "Пакеты декора", en: "Decor Packages" },
    subtitle: {
      ru: "От камерных торжеств до масштабных праздников — выберите пакет, а мы настроим каждую деталь под вас.",
      en: "From intimate celebrations to grand events — choose a package and we'll customize every detail for you.",
    },
    popular: { ru: "Популярный", en: "Popular" },
    from: { ru: "от", en: "from" },
    included: { ru: "Включено", en: "Included" },
    orderPackage: { ru: "Заказать пакет", en: "Order Package" },
    contactDecorator: { ru: "Связаться с декоратором", en: "Contact Decorator" },
    comparisonOverline: { ru: "Сравнение", en: "Comparison" },
    comparisonTitle: { ru: "Сравнение пакетов", en: "Package Comparison" },
    option: { ru: "Опция", en: "Feature" },
    notSure: {
      ru: "Не уверены, какой пакет вам подходит? Мы с радостью поможем.",
      en: "Not sure which package suits you? We'll be happy to help.",
    },
    contactUs: { ru: "Связаться с нами", en: "Contact Us" },
    decor: { ru: "Декор", en: "Decor" },
    setup: { ru: "Монтаж", en: "Setup" },
    balloons: { ru: "Шары", en: "Balloons" },
    flowers: { ru: "Цветы", en: "Flowers" },
    backdrop: { ru: "Задник", en: "Backdrop" },
    names: [
      {
        name: { ru: "Базовый", en: "Basic" },
        subtitle: { ru: "Для небольших праздников", en: "For small celebrations" },
      },
      {
        name: { ru: "Стандарт", en: "Standard" },
        subtitle: { ru: "Самый популярный", en: "Most popular" },
      },
      {
        name: { ru: "Премиум", en: "Premium" },
        subtitle: { ru: "Полный люкс", en: "Full luxury" },
      },
    ],
  },

  // ── Calculator ──
  calc: {
    overline: { ru: "Онлайн-расчёт", en: "Online Calculator" },
    title: { ru: "Калькулятор стоимости", en: "Cost Calculator" },
    subtitle: {
      ru: "Получите предварительную оценку стоимости оформления за пару кликов. Финальная цена уточняется после консультации.",
      en: "Get a preliminary cost estimate in a few clicks. Final price is confirmed after consultation.",
    },
    eventType: { ru: "Тип мероприятия", en: "Event Type" },
    selectType: { ru: "Выберите тип", en: "Select type" },
    guests: { ru: "Количество гостей", en: "Number of Guests" },
    decorStyle: { ru: "Стиль декора", en: "Decor Style" },
    selectStyle: { ru: "Выберите стиль", en: "Select style" },
    extras: { ru: "Дополнительные услуги", en: "Extra Services" },
    estimate: { ru: "Предварительный расчёт", en: "Preliminary Estimate" },
    range: { ru: "Ориентировочный диапазон", en: "Estimated Range" },
    type: { ru: "Тип", en: "Type" },
    guestsLabel: { ru: "Гости", en: "Guests" },
    style: { ru: "Стиль", en: "Style" },
    extrasCount: { ru: "Доп. услуги", en: "Extras" },
    pcs: { ru: "шт.", en: "pcs" },
    people: { ru: "чел.", en: "people" },
    disclaimer: {
      ru: "Это предварительная оценка. Точная стоимость зависит от деталей и площадки.",
      en: "This is a preliminary estimate. The exact cost depends on details and venue.",
    },
    submitRequest: { ru: "Оставить заявку", en: "Submit Request" },
    discussDecorator: { ru: "Обсудить с декоратором", en: "Discuss with Decorator" },
    emptyState: {
      ru: "Выберите тип мероприятия и стиль декора, чтобы увидеть расчёт",
      en: "Select event type and decor style to see the estimate",
    },
    eventTypes: [
      { value: "wedding", ru: "Свадьба", en: "Wedding" },
      { value: "birthday", ru: "День рождения", en: "Birthday" },
      { value: "corporate", ru: "Корпоратив", en: "Corporate" },
      { value: "kids", ru: "Детский праздник", en: "Kids Party" },
      { value: "proposal", ru: "Предложение руки", en: "Proposal" },
      { value: "anniversary", ru: "Юбилей", en: "Anniversary" },
      { value: "other", ru: "Другое", en: "Other" },
    ],
    decorStyles: [
      { value: "minimal", ru: "Минимализм", en: "Minimalism" },
      { value: "classic", ru: "Классика", en: "Classic" },
      { value: "romantic", ru: "Романтика", en: "Romantic" },
      { value: "luxury", ru: "Люкс", en: "Luxury" },
      { value: "themed", ru: "Тематический", en: "Themed" },
    ],
    extraServices: [
      { id: "balloons", ru: "Шары и арки", en: "Balloons & Arches" },
      { id: "flowers", ru: "Живые цветы", en: "Fresh Flowers" },
      { id: "lighting", ru: "Световой дизайн", en: "Lighting Design" },
      { id: "photozone", ru: "Фотозона", en: "Photo Zone" },
      { id: "sweetbar", ru: "Сладкий стол", en: "Dessert Table" },
      { id: "lounge", ru: "Лаунж-зона", en: "Lounge Zone" },
      { id: "signage", ru: "Таблички и нумерация", en: "Signage & Numbering" },
      { id: "cleanup", ru: "Полная уборка", en: "Full Cleanup" },
    ],
    from: { ru: "от", en: "from" },
  },

  // ── Showroom ──
  showroom: {
    divisionII: { ru: "Направление II", en: "Division II" },
    aboutOverline: { ru: "О шоуруме", en: "About" },
    aboutTitle: { ru: "Стиль, который", en: "Style that" },
    aboutTitleItalic: { ru: "вдохновляет", en: "inspires" },
    aboutP1: {
      ru: "KiKi Showroom — это пространство, где мода встречается с элегантностью. Мы курируем коллекции, которые подчёркивают индивидуальность и уверенность.",
      en: "KiKi Showroom is a space where fashion meets elegance. We curate collections that emphasize individuality and confidence.",
    },
    aboutP2: {
      ru: "Приглашаем на персональную консультацию — подберём образ для любого случая.",
      en: "We invite you for a personal consultation — we'll find the perfect look for any occasion.",
    },
    address: { ru: "Адрес", en: "Address" },
    addressValue: { ru: "Ростов-на-Дону, ул. Примерная, 42", en: "Rostov-on-Don, Example St. 42" },
    hours: { ru: "Часы работы", en: "Working Hours" },
    hoursValue1: { ru: "Пн–Сб: 10:00 – 20:00", en: "Mon–Sat: 10:00 – 20:00" },
    hoursValue2: { ru: "Вс: по записи", en: "Sun: by appointment" },
    phoneLabel: { ru: "Телефон", en: "Phone" },
    collectionsOverline: { ru: "Коллекции", en: "Collections" },
    comingSoon: { ru: "Скоро", en: "Coming Soon" },
    comingSoonText: {
      ru: "Каталог коллекций будет доступен в ближайшее время. Подпишитесь на Instagram, чтобы не пропустить обновления.",
      en: "The collections catalog will be available soon. Follow us on Instagram to stay updated.",
    },
    bookVisit: { ru: "Записаться на визит", en: "Book a Visit" },
  },

  // ── Lead Capture ──
  lead: {
    overline: { ru: "Бесплатная консультация", en: "Free Consultation" },
    title: { ru: "Давайте создадим нечто", en: "Let's create something" },
    titleItalic: { ru: "необыкновенное", en: "extraordinary" },
    subtitle: {
      ru: "Мечтаете об идеальном мероприятии или ищете персональный стиль — наша команда поможет воплотить вашу идею. Запишитесь на бесплатную консультацию — без обязательств.",
      en: "Whether you're dreaming of the perfect event or looking for personal styling, our team is here to bring your vision to life. Book a free consultation — no commitment required.",
    },
    nameLabel: { ru: "Имя", en: "Name" },
    namePlaceholder: { ru: "Ваше имя", en: "Your name" },
    phoneLabel: { ru: "Телефон", en: "Phone" },
    emailLabel: { ru: "Email", en: "Email" },
    interestLabel: { ru: "Меня интересует", en: "I'm interested in" },
    decorOption: { ru: "Decor Studio", en: "Decor Studio" },
    showroomOption: { ru: "Showroom", en: "Showroom" },
    submitBtn: { ru: "Записаться на консультацию", en: "Book Free Consultation" },
    submitting: { ru: "Отправка...", en: "Sending..." },
    thankYou: { ru: "Спасибо!", en: "Thank You" },
    thankYouText: {
      ru: "Мы получили вашу заявку и свяжемся с вами в ближайшее время для планирования бесплатной консультации.",
      en: "We've received your request and will contact you shortly to schedule your free consultation.",
    },
    validationName: { ru: "Введите имя", en: "Enter your name" },
    validationPhone: { ru: "Введите телефон", en: "Enter your phone" },
    validationEmail: { ru: "Введите корректный email", en: "Enter a valid email" },
    validationInterest: { ru: "Выберите направление", en: "Select an interest" },
    errorGeneric: { ru: "Произошла ошибка. Попробуйте ещё раз.", en: "An error occurred. Please try again." },
  },

  // ── Signature Decor ──
  signature: {
    overline: { ru: "Портфолио", en: "Portfolio" },
    title: { ru: "Моменты авторского", en: "Signature Decor" },
    titleItalic: { ru: "декора", en: "Moments" },
    viewProject: { ru: "Смотреть проект", en: "View Project" },
    viewFull: { ru: "Всё портфолио", en: "View Full Portfolio" },
  },

  // ── Showroom Collection (homepage) ──
  showroomCollection: {
    overline: { ru: "KiKi Showroom", en: "KiKi Showroom" },
    title: { ru: "Коллекция", en: "Showroom" },
    titleItalic: { ru: "Showroom", en: "Collection" },
    viewProduct: { ru: "Смотреть", en: "View Product" },
    viewFull: { ru: "Вся коллекция", en: "View Full Collection" },
  },

  // ── Lifestyle Gallery ──
  lifestyle: {
    overline: { ru: "Наш стиль жизни", en: "Our Lifestyle" },
    title: { ru: "Жизнь через", en: "Life Through" },
    subtitle: {
      ru: "Мероприятия, мода, красота — взгляд в оба мира.",
      en: "Events, fashion, beauty — a glimpse into both worlds.",
    },
    followDecor: { ru: "KiKi Decor", en: "Follow KiKi Decor" },
    followShowroom: { ru: "KiKi Showroom", en: "Follow KiKi Showroom" },
    viewOnInstagram: { ru: "Смотреть в Instagram", en: "View on Instagram" },
  },

  // ── 404 ──
  notFound: {
    title: { ru: "Страница не найдена", en: "Page not found" },
    cta: { ru: "На главную", en: "Return to Home" },
  },
} as const;

export type Translations = typeof translations;
