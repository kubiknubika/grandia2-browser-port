function page(kind, title, subtitle, text, extra = {}) {
  return {
    kind,
    title,
    subtitle,
    text: Array.isArray(text) ? text : [text],
    ...extra,
  };
}

const SETPIECES = {
  carbo_contract: {
    unlockFlag: 'flag_setpiece_carbo_departure',
    title: 'Bespoke setpiece: First escort step from Carbo',
    pages: [
      page('setpiece', 'У ворот Карбо дорога впервые отвечает враждой', 'Carbo Village edge — bespoke scene', [
        'В оригинальном ритме Grandia II стартовый выход из Карбо должен чувствоваться не как безличный переход по меню, а как первый настоящий шаг из мирной деревни в мир, который уже трещит по швам.',
        'Рюдо ещё может думать, что это обычный escort job, но сама дорога быстро напоминает: после Гармии и Елены никаких “обычных” контрактов больше не будет.',
      ]),
      page('dialogue', 'Skye', 'Первые шаги уже пахнут плохо', [
        'Я бы сказал, что нас просто провожают недобрыми взглядами… если бы в этих кустах ещё и не шевелилась настоящая зубастая дрянь.',
      ]),
      page('dialogue', 'Ryudo', 'Контракт перестаёт быть теорией', [
        'Отлично. Значит, объясним дороге с самого начала: певчую я доведу живой.',
      ]),
      page('setpiece', 'Первые метры escort-маршрута', 'Village edge battle setup', [
        'Эта сцена должна быть камерной и стартовой: не большая катастрофа, а первый честный укус мира по контракту Рюдо и Елены.',
      ], { action: 'launch-battle' }),
    ],
  },
  garmia_failure: {
    unlockFlag: 'flag_setpiece_garmia_catastrophe',
    title: 'Bespoke setpiece: Garmia catastrophe',
    pages: [
      page('setpiece', 'Башня больше не держит печать', 'Garmia Tower Top Floor — bespoke scene', [
        'Вершина Гармии должна ощущаться не как очередная комната с боем, а как место, где мир впервые физически ломается у партии на глазах.',
        'Пол, свет, церковный ритуал и сама идея безопасности трескаются одновременно — после этого история уже не возвращается к прежнему тону.',
      ]),
      page('dialogue', 'Elena', 'Песнь, которая больше не спасает', [
        'Нет… это не просто провал. Я чувствую, как сама печать отвечает чем-то чужим и живым.',
      ]),
      page('dialogue', 'Skye', 'Первый запах катастрофы', [
        'Плохое место, плохой ветер и слишком много мёртвой святости. Похоже, мы прибыли ровно туда, где мир решил расколоться.',
      ]),
      page('setpiece', 'Верхняя площадка как нулевая точка бедствия', 'Collapse battle setup', [
        'Эта схватка должна работать как начало глобального перелома: не “босс башни”, а первый настоящий разрыв между церковной сказкой и тьмой Вальмара.',
      ], { action: 'launch-battle' }),
    ],
  },
  millenia_first_attack: {
    unlockFlag: 'flag_setpiece_millenia_attack',
    title: 'Bespoke setpiece: Millenia night attack',
    pages: [
      page('setpiece', 'Ночь, в которой Карбо трескается', 'Carbo Village — bespoke scene', [
        'Тихий Карбо больше не звучит как деревня старта. Ночь ломается рывком ветра, чужим смехом и тем ощущением, что ритуал в Гармии уже разорвал привычный порядок мира.',
        'Для Grandia II этот момент важен не как обычный бой, а как первое настоящее вторжение Миллении в ритм пути Рюдо и Елены.',
      ]),
      page('dialogue', 'Millenia', 'Крылья в темноте', [
        'Ну что, геохаунд? Ты правда думал, что можешь просто увести певчую и жить дальше как раньше?',
        'С этого момента твоя работа — это уже не контракт. Это катастрофа, которая научилась говорить.',
      ]),
      page('dialogue', 'Elena', 'Разрыв внутри', [
        'Её голос… я чувствую его будто в себе. Словно я и клетка, и ключ одновременно.',
      ]),
      page('setpiece', 'Невозможная тишина перед ударом', 'Setpiece battle setup', [
        'Эта сцена должна ощущаться как полу-дуэль, полу-кошмар: не обычная засадная стычка, а момент, когда Милления входит в историю как сила, нарушающая саму структуру мира.',
      ], { action: 'launch-battle' }),
    ],
  },
  agear_roan: {
    unlockFlag: 'flag_setpiece_agear_rescue',
    title: 'Bespoke setpiece: Durham Cave rescue',
    pages: [
      page('setpiece', 'Пещера перестаёт быть просто дорогой', 'Durham Cave Depths — bespoke scene', [
        'Durham Cave в оригинальном ритме Grandia II должна закончиться не просто “пещерным мини-боссом”, а спасением ребёнка, который полез слишком глубоко в мир, уже разорванный чудовищами.',
        'Здесь Агир окончательно перестаёт быть фоновым разрушенным городом: беда получает лицо Роана, а грубая сила Вальмара становится почти осязаемой.',
      ]),
      page('dialogue', 'Roan', 'Запоздалая смелость', [
        'Я… я не хотел, чтобы за меня снова всё решили. Но теперь эта штука отрезала путь назад.',
      ]),
      page('dialogue', 'Ryudo', 'Спасение без рыцарской позы', [
        'Тогда стой смирно и не путай героизм с глупостью. Сначала вытащим тебя живым, потом будешь расти в принцев.',
      ]),
      page('setpiece', 'Рога и камень сминают проход', 'Durham rescue setup', [
        'Эта схватка должна чувствоваться как тесная пещерная спасательная драка: обвал, давление и звериная грубая сила вместо церковной театральности.',
      ], { action: 'launch-battle' }),
    ],
  },
  st_heim_zera: {
    unlockFlag: 'flag_setpiece_stheim_sanction',
    title: 'Bespoke setpiece: St. Heim hidden sanction',
    pages: [
      page('setpiece', 'Под сиянием собора уже чувствуется принуждение', 'Audience Chamber / cathedral pressure — bespoke scene', [
        'У St. Heim нет права ощущаться только красивой цепочкой комнат. Чем ближе партия подходит ко второй аудиенции, тем яснее должно становиться: этот город не просто святой, он давит, распределяет роли и проверяет послушание.',
        'Такой setpiece нужен не как ломка оригинала, а как игровая форма той скрытой церковной враждебности, которую Grandia II долго подаёт словами, позолотой и ритуалом.',
      ]),
      page('dialogue', 'Zera', 'Благословение, которое звучит как приказ', [
        'Если вы действительно идёте спасать мир, то должны понимать: для великих задач недостаточно сомнений и своеволия.',
      ]),
      page('dialogue', 'Ryudo', 'Святость под нажимом', [
        'Когда люди начинают учить меня послушанию таким тоном, я обычно проверяю, что они прячут за алтарём.',
      ]),
      page('setpiece', 'Скрытое давление святого города', 'Cathedral sanction setup', [
        'Эта сцена должна ощущаться не как босс, а как церковный нажим, впервые получивший форму прямого столкновения.',
      ], { action: 'launch-battle' }),
    ],
  },
  melfice_duel: {
    unlockFlag: 'flag_setpiece_melfice_duel',
    title: 'Bespoke setpiece: Melfice confrontation',
    pages: [
      page('setpiece', 'Путь, который сужается до одного имени', 'Plateau of Memories — bespoke scene', [
        'Подъём к Плато Воспоминаний должен ощущаться не как дорога к очередному боссу, а как постепенное схлопывание мира Рюдо до одного-единственного конфликта.',
        'Мелфис здесь — не просто сильный мечник, а сгусток вины, ревности, насилия и искажённой братской связи.',
      ]),
      page('dialogue', 'Melfice', 'Издёвка над прошлым', [
        'Ты пришёл так далеко только затем, чтобы снова увидеть, как я держу твою жизнь в одной руке?',
      ]),
      page('dialogue', 'Ryudo', 'Ответ брату', [
        'Нет. Я пришёл, чтобы наконец перестать жить внутри твоей тени.',
      ]),
      page('setpiece', 'Дуэль как приговор прошлому', 'Memory plateau setup', [
        'Эта сцена должна ощущаться личной и узкой: меньше про мир, больше про тот узел, который годами держал Рюдо в прошлом.',
      ], { action: 'launch-battle' }),
    ],
  },
  garlan_return: {
    unlockFlag: 'flag_setpiece_garlan_homecoming',
    title: 'Bespoke setpiece: Hostile homecoming in Garlan',
    pages: [
      page('setpiece', 'Даже родная деревня встречает как чужого', 'Garlan Village night edge — bespoke scene', [
        'Возвращение в Гарлан должно звучать не только через дом и воспоминания, но и через то, как сам воздух деревни выталкивает Рюдо обратно наружу.',
        'Эта сцена нужна как игровая форма hostile homecoming: прошлого слишком много, и даже короткий путь по ночной деревне ощущается как давление, а не как отдых.',
      ]),
      page('dialogue', 'Skye', 'Прошлое не любит тихих возвращений', [
        'Ты ведь сам чувствуешь, да? Здесь даже ночь смотрит на тебя так, будто ты всё ещё должен ей объяснение.',
      ]),
      page('dialogue', 'Ryudo', 'Дом, который не даёт укрыться', [
        'Плевать. Если эта деревня хочет отдать меня прошлому обратно, ей придётся драться за это вместе с моими кошмарами.',
      ]),
      page('setpiece', 'Ночь давит сильнее, чем стены домов', 'Garlan homecoming setup', [
        'Эта схватка должна ощущаться как ночной срыв памяти и враждебной дороги, а не как обычный field fight.',
      ], { action: 'launch-battle' }),
    ],
  },
  nanan_and_cyclone: {
    unlockFlag: 'flag_setpiece_nanan_cyclone',
    title: 'Bespoke setpiece: Great Rift cyclone push',
    pages: [
      page('setpiece', 'Край мира начинает давить в ответ', 'The Great Rift — bespoke scene', [
        'Великий Разлом в оригинальной Grandia II важен не только географией, но и тем, что сама дорога начинает выглядеть как активное сопротивление миру людей.',
        'После Нанана поход должен ощущаться уже не как путешествие по карте, а как продавливание маршрута через ветер, бездну и древний страх перед Гранасабером.',
      ]),
      page('dialogue', 'Tio', 'Маршрут под циклонным давлением', [
        'Текущий вывод: шторм сопротивляется продвижению не как природное явление, а как система, охраняющая следующий слой правды.',
      ]),
      page('dialogue', 'Mareg', 'Последняя дорога перед древней машиной', [
        'Хорошо. Значит, и шторму придётся узнать, как пахнет упорство живых.',
      ]),
      page('setpiece', 'Разлом как враждебный проход', 'Cyclone assault setup', [
        'Эта сцена должна работать как боевой прорыв через давление среды, а не как обычный road encounter.',
      ], { action: 'launch-battle' }),
    ],
  },
  moon_assault: {
    unlockFlag: 'flag_setpiece_moon_siege',
    title: 'Bespoke setpiece: Assault on Valmar\'s Moon',
    pages: [
      page('setpiece', 'Живая крепость над миром', 'Valmar\'s Moon — bespoke scene', [
        'Штурм Луны Вальмара должен ощущаться не просто как ещё один поздний данж, а как тяжёлый и почти отчаянный поход в биомеханическую крепость, где сама среда агрессивна.',
        'Это не путь к обычному боссу. Это наступление на место, которое уже живёт войной против партии.',
      ]),
      page('dialogue', 'Mareg', 'Точка без возврата', [
        'Если здесь кому-то и суждено остаться, то пусть это решение будет моим, а не трусостью судьбы.',
      ]),
      page('dialogue', 'Ryudo', 'Последний рывок к Elena', [
        'Сначала прорвёмся. Потом уже будем решать, что именно от нас потребует эта луна.',
      ]),
      page('setpiece', 'Штурм как осада, а не коридор', 'Moon siege setup', [
        'Эта сцена должна чувствоваться как затяжное давление: партия не просто идёт по карте, а буквально продирается через враждебный живой фронт.',
      ], { action: 'launch-battle' }),
    ],
  },
  granasaber_ship: {
    unlockFlag: 'flag_setpiece_granasaber_reveal',
    title: 'Bespoke setpiece: True Granasaber reveal',
    pages: [
      page('setpiece', 'Меч, который оказался кораблём', 'Valmar Body / ancient reveal', [
        'Оригинальная Grandia II делает этот момент не просто "следующим данжем", а полномасштабным переворотом мифа: Гранасабер оказывается не символическим мечом героя, а древним судном и системой иной цивилизации.',
        'В этой точке рушится не только церковная сказка, но и язык, которым партия до сих пор описывала мир.',
      ]),
      page('dialogue', 'Tio', 'Техническая истина', [
        'Подтверждение: объект Granasaber не является мифическим клинком. Это древняя транспортно-боевая платформа.',
        'Религиозная интерпретация системы оказалась намеренно искажённой.',
      ]),
      page('dialogue', 'Ryudo', 'Удар по догме', [
        'Значит, всё их благочестие держалось на красивой лжи. Отлично. Такую правду я люблю больше любой молитвы.',
      ]),
      page('setpiece', 'Мир после разоблачения', 'Ancient machine transition', [
        'С этого места история должна ощущаться уже не как дорожное приключение, а как разбор древней лжи под конец света.',
      ], { action: 'launch-battle' }),
    ],
  },
  cathedral_massacre: {
    unlockFlag: 'flag_setpiece_cathedral_massacre',
    title: 'Bespoke setpiece: Day of Darkness in St. Heim',
    pages: [
      page('setpiece', 'Святой город как бойня', 'St. Heim Cathedral — bespoke scene', [
        'День Тьмы не должен ощущаться просто как “ещё один поздний бит в соборе”. Это момент, где город света окончательно оборачивается ритуальной мясорубкой.',
        'Лестницы, коридоры и святилища больше не служат вере — они служат массовому страху и прикрывают рождение Сердца Вальмара.',
      ]),
      page('dialogue', 'Elena', 'Крах веры как личная рана', [
        'Если всё это называли святостью… сколько же лжи держало этот город живым до сегодняшнего дня?',
      ]),
      page('dialogue', 'Ryudo', 'Свет против slaughter', [
        'Тогда с сегодняшнего дня у них не храм. У них место, где я остановлю их собственными руками.',
      ]),
      page('setpiece', 'Собор как арена коллапса', 'Massacre battle setup', [
        'Эта сцена должна чувствоваться как рубеж: после неё St. Heim уже нельзя видеть прежним городом.',
      ], { action: 'launch-battle' }),
    ],
  },
  zera_revealed: {
    unlockFlag: 'flag_setpiece_zera_reveal',
    title: 'Bespoke setpiece: Zera revealed',
    pages: [
      page('setpiece', 'Позолота сходит с последнего лжеца', 'Forbidden Room / late cathedral — bespoke scene', [
        'Разоблачение Зеры должно ощущаться как распад всей политической и религиозной оболочки Grandia II. Здесь рушится не только план церкви, но и финальный образ “спасителя”.',
      ]),
      page('dialogue', 'Zera', 'Голос ложного мессианства', [
        'Свобода людей — всего лишь их привычка к хаосу. Миру нужен господин, а не выбор.',
      ]),
      page('dialogue', 'Millenia', 'Ненависть к красивой лжи', [
        'Вот теперь это уже не священник. Это просто человек, который слишком любит власть, чтобы оставить мир живым.',
      ]),
      page('setpiece', 'Порог к Луне', 'Reveal battle setup', [
        'После этой сцены Зера должен восприниматься уже не как distant authority, а как конкретный поздний антагонист.',
      ], { action: 'launch-battle' }),
    ],
  },
  cyrum_defense: {
    unlockFlag: 'flag_setpiece_cyrum_defense',
    title: 'Bespoke setpiece: Defense of Cyrum',
    pages: [
      page('setpiece', 'Столица живёт уже не короной, а приказами', 'Cyrum South Front / Late Cyrum — bespoke scene', [
        'Возвращение в Цайрум после Луны должно ощущаться не просто как ещё один late-game хаб, а как фронтовой узел, где Роан впервые по-настоящему принимает вес власти.',
        'Это уже не сцена про скрытую правду под дворцом. Это сцена про людей, которых надо удержать в живом городе, пока мир окончательно не рухнул.',
      ]),
      page('dialogue', 'Roan', 'Корона больше не прячет ребёнка', [
        'Если этот город падёт, он падёт и на мне. Значит, сегодня я не имею права быть только символом.',
      ]),
      page('dialogue', 'Ryudo', 'Оборона без позолоты', [
        'Тогда не играй принца. Играй человека, который удержит линию ровно столько, сколько нужно остальным.',
      ]),
      page('setpiece', 'Оборона как поздний военный рывок', 'Late Cyrum defense setup', [
        'Эта схватка должна чувствоваться как удержание фронта и сбор поздней партии под новое командование.',
      ], { action: 'launch-battle' }),
    ],
  },
  birthplace_descent: {
    unlockFlag: 'flag_setpiece_birthplace_descent',
    title: 'Bespoke setpiece: Birthplace truth descent',
    pages: [
      page('setpiece', 'Мифология начинает рассыпаться по комнатам', 'Birthplace of the Gods — bespoke scene', [
        'Исток богов должен работать не просто как “ещё один древний данж”, а как нисходящая серия ударов по официальной теологии мира.',
        'Здесь особенно важно чувствовать room-by-room переход от сакрального языка к языку древней системы, механизмов и переписанной истории.',
      ]),
      page('dialogue', 'Elena', 'Вера без чужого пересказа', [
        'Если правда мира настолько стара и настолько искажена… значит, нам придётся сохранить свет уже без готовых ответов.',
      ]),
      page('dialogue', 'Tio', 'Архив не подтверждает догму', [
        'Ключевое наблюдение: структура комплекса не указывает на поклонение. Она указывает на эксплуатацию, контроль и намеренное искажение памяти.',
      ]),
      page('setpiece', 'Цветные механизмы как боевой приговор мифу', 'Ancient archive setup', [
        'Эта сцена должна чувствоваться как столкновение с самой машиной древней лжи, а не только с её охранниками.',
      ], { action: 'launch-battle' }),
    ],
  },
  inner_trial: {
    unlockFlag: 'flag_setpiece_inner_trial_vision',
    title: 'Bespoke setpiece: Inner Trial',
    pages: [
      page('setpiece', 'Комната, где остаётся только Рюдо', 'Inner Trial — bespoke scene', [
        'В оригинале это должен быть не просто “ещё один соло-бой”, а полноценный внутренний суд. Здесь у Рюдо забирают маршрут, партию и привычные внешние оправдания.',
        'Остаётся только человек, его вина, его страх и его решение не отдавать своё будущее ни богу, ни брату, ни тьме.',
      ]),
      page('dialogue', 'Shadow Ryudo', 'Голос вины', [
        'Ты не герой. Ты просто человек, который слишком хорошо умеет убивать и слишком плохо умеет прощать.',
      ]),
      page('dialogue', 'Ryudo', 'Ответ самому себе', [
        'Может быть. Но этого всё ещё достаточно, чтобы выбрать свой путь самому — и не позволить тебе жить за меня.',
      ]),
      page('setpiece', 'Испытание начинается осознанно', 'Solo confrontation', [
        'Эта сцена должна работать как эмоциональная перегрузка перед истинным Гранасабером: не победа силы, а победа принятия.',
      ], { action: 'launch-battle' }),
    ],
  },
  zera_inside_valmar: {
    unlockFlag: 'flag_setpiece_room_of_chaos',
    title: 'Bespoke setpiece: Room of Chaos',
    pages: [
      page('setpiece', 'Комната Хаоса как зал ложных форм', 'New Valmar / Room of Chaos — bespoke scene', [
        'Room of Chaos должен ощущаться не как просто ещё один коридор к финалу, а как место, где Зера сражается не только силой, но и самими образами, личностями и надеждами партии.',
      ]),
      page('dialogue', 'Zera', 'Ложь как оружие', [
        'Если человек слаб перед страхом, достаточно дать ему правильную иллюзию — и он сам попросит о цепях.',
      ]),
      page('dialogue', 'Ryudo', 'Отказ от подмены', [
        'Нет. Мы уже прошли слишком далеко, чтобы снова спутать правду с тем, что тебе удобно показывать.',
      ]),
      page('setpiece', 'Порог к ядру через ложь', 'Chaos room setup', [
        'Эта сцена должна чувствоваться как последняя психологическая оборона Зеры перед ядром Нового Вальмара.',
      ], { action: 'launch-battle' }),
    ],
  },
  true_finale: {
    unlockFlag: 'flag_setpiece_true_finale',
    title: 'Bespoke setpiece: True Finale',
    pages: [
      page('setpiece', 'Финальная комната как приговор богам', 'New Valmar Core — bespoke scene', [
        'К финалу Grandia II приходит не как к “самому сильному боссу”, а как к идеологическому разрыву с миром, где судьбу человека определяли ложные боги, церковь и чужая воля.',
        'Здесь должны сойтись сразу три линии: вера Елены, свобода Миллении и решение Рюдо оставить будущее людям.',
      ]),
      page('dialogue', 'Millenia', 'Свобода без хозяина', [
        'Никаких клеток. Никаких хозяев. Никаких новых богов. Если этот мир и останется кому-то — то живым людям, а не чьей-то великой лжи.',
      ]),
      page('dialogue', 'Elena', 'Вера после краха', [
        'Если в мире и есть святость, то только в том, что мы всё равно можем выбрать свет сами, без приказа сверху.',
      ]),
      page('dialogue', 'Ryudo', 'Последний выбор', [
        'Тогда заканчиваем это. Не во имя судьбы. Не во имя церкви. Не во имя богов. А просто потому, что это наш мир.',
      ]),
      page('setpiece', 'Последний бой как человеческий финал', 'Final confrontation', [
        'После этой сцены финальная битва должна восприниматься уже не как boss check, а как запечатывание всей темы Grandia II: человек выбирает сам.',
      ], { action: 'launch-battle' }),
    ],
  },
};

const BATTLE_OVERRIDES = {
  carbo_contract: {
    battleLabel: 'Setpiece: First escort step from Carbo',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'carbo-first-road',
    battlefieldTheme: 'forest',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — the road out of Carbo bites at the escort job the moment Ryudo and Elena take their first real steps outward.',
    players: ['ryudo', 'elena'],
    enemies: [
      { presetKey: 'troglodyte', position: { x: 732, y: 182 }, name: 'Forest Ravager' },
      { presetKey: 'wingEye', position: { x: 820, y: 244 }, name: 'Roadwatch Eye' },
    ],
  },
  garmia_failure: {
    battleLabel: 'Setpiece: Garmia catastrophe',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'garmia-collapse',
    battlefieldTheme: 'cavern',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the top floor of Garmia Tower cracks under a live rupture of Valmar corruption.',
    players: ['ryudo', 'elena'],
    enemies: [
      { presetKey: 'garmiaRuinCore', position: { x: 760, y: 180 }, name: 'Ruptured Seal Core' },
    ],
  },
  millenia_first_attack: {
    battleLabel: 'Setpiece: Millenia night attack',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'millenia-night',
    battlefieldTheme: 'forest',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — Millenia dives out of the night and tears through the village calm.',
    players: ['ryudo', 'elena'],
    enemies: [
      { presetKey: 'milleniaShade', position: { x: 760, y: 170 }, name: 'Millenia' },
    ],
  },
  agear_roan: {
    battleLabel: 'Setpiece: Durham Cave rescue',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'durham-rescue',
    battlefieldTheme: 'cavern',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the party corners the Durham brute while trying to pull Roan out of the cave alive.',
    players: ['ryudo', 'elena', 'millenia'],
    enemies: [
      { presetKey: 'durhamMinotaur', position: { x: 734, y: 184 }, name: 'Durham Minotaur' },
    ],
  },
  st_heim_zera: {
    battleLabel: 'Setpiece: St. Heim hidden sanction',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'stheim-sanction',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the holy city turns hidden pressure into direct force before letting the party walk away with Zera\'s command.',
    players: ['ryudo', 'elena', 'roan', 'mareg'],
    enemies: [
      { presetKey: 'guardian', position: { x: 734, y: 176 }, name: 'Papal Oathguard' },
      { presetKey: 'cathedralExecutioner', position: { x: 820, y: 254 }, name: 'Silent Templar' },
    ],
  },
  melfice_duel: {
    battleLabel: 'Setpiece: Melfice confrontation',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'melfice-duel',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — Ryudo finally meets Melfice on the Plateau of Memories.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'melficeEcho', position: { x: 742, y: 180 }, name: 'Melfice' },
    ],
  },
  garlan_return: {
    battleLabel: 'Setpiece: Hostile homecoming in Garlan',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'garlan-night-pressure',
    battlefieldTheme: 'forest',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the road through Garlan at night turns every memory and every shadow into pressure on Ryudo.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'guardian', position: { x: 730, y: 180 }, name: 'Pastshade Hound' },
      { presetKey: 'wingEye', position: { x: 818, y: 248 }, name: 'Night Watcher' },
    ],
  },
  nanan_and_cyclone: {
    battleLabel: 'Setpiece: Great Rift cyclone push',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'great-rift-storm',
    battlefieldTheme: 'volcano',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the Great Rift answers with crosswinds, living pressure, and predators buried inside the cyclone route.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'guardian', position: { x: 730, y: 180 }, name: 'Rift Behemoth' },
      { presetKey: 'wingEye', position: { x: 818, y: 246 }, name: 'Cyclone Eye' },
    ],
  },
  moon_assault: {
    battleLabel: 'Setpiece: Assault on Valmar\'s Moon',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'moon-siege',
    battlefieldTheme: 'volcano',
    openingAdvantage: 'players',
    introLog: 'Setpiece battle — the Moon itself fights back as the party tears toward Valmar\'s Womb.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'moonWombSentinel', position: { x: 738, y: 178 }, name: 'Moon Womb Sentinel' },
      { presetKey: 'wingEye', position: { x: 816, y: 252 }, name: 'Lunar Eye' },
    ],
  },
  granasaber_ship: {
    battleLabel: 'Setpiece: The true Granasaber',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'granasaber-reveal',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'players',
    introLog: 'Setpiece battle — ancient wardens resist the revelation of the true Granasaber.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'granasaberWarden', position: { x: 735, y: 180 }, name: 'Ancient Granasaber Warden' },
      { presetKey: 'wingEye', position: { x: 820, y: 255 }, name: 'Control Eye' },
    ],
  },
  cathedral_massacre: {
    battleLabel: 'Setpiece: Day of Darkness',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'cathedral-massacre',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — St. Heim collapses into bloodshed as the Heart of Valmar emerges.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: [
      { presetKey: 'heartValmar', position: { x: 736, y: 176 }, name: 'Heart of Valmar' },
      { presetKey: 'cathedralExecutioner', position: { x: 822, y: 262 }, name: 'Cathedral Executioner' },
    ],
  },
  zera_revealed: {
    battleLabel: 'Setpiece: Zera revealed',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'zera-reveal',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — Zera abandons the mask of sanctity and moves as a late-game tyrant.',
    players: ['ryudo', 'mareg', 'tio', 'millenia'],
    enemies: [
      { presetKey: 'zeraAvatar', position: { x: 736, y: 176 }, name: 'Zera' },
    ],
  },
  cyrum_defense: {
    battleLabel: 'Setpiece: Defense of Cyrum',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'cyrum-last-stand',
    battlefieldTheme: 'cavern',
    openingAdvantage: 'enemies',
    introLog: 'Setpiece battle — the late party digs in on Cyrum\'s southern line while Roan turns a retreat into a defense.',
    players: ['ryudo', 'elena', 'roan', 'tio'],
    enemies: [
      { presetKey: 'guardian', position: { x: 726, y: 176 }, name: 'Frontline Breaker' },
      { presetKey: 'troglodyte', position: { x: 810, y: 232 }, name: 'Siege Maw' },
      { presetKey: 'wingEye', position: { x: 808, y: 302 }, name: 'Moonfall Eye' },
    ],
  },
  birthplace_descent: {
    battleLabel: 'Setpiece: Birthplace truth descent',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'birthplace-archive',
    battlefieldTheme: 'ruins',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — ancient archive sentinels answer as the party tears through the myth of gods room by room.',
    players: ['ryudo', 'elena', 'roan', 'tio'],
    enemies: [
      { presetKey: 'granasaberWarden', position: { x: 732, y: 178 }, name: 'Archive Sentinel' },
      { presetKey: 'guardian', position: { x: 820, y: 262 }, name: 'Truth Custodian' },
    ],
  },
  inner_trial: {
    battleLabel: 'Setpiece: Ryudo inner trial',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'inner-trial',
    battlefieldTheme: 'cavern',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — Ryudo faces a shadow forged from guilt, anger, and memory.',
    players: ['ryudo'],
    enemies: [
      { presetKey: 'innerShadowRyudo', position: { x: 720, y: 180 }, name: 'Shadow Ryudo' },
    ],
  },
  zera_inside_valmar: {
    battleLabel: 'Setpiece: Room of Chaos',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'room-of-chaos',
    battlefieldTheme: 'volcano',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — the Room of Chaos turns lies and false forms into direct pressure.',
    players: ['ryudo', 'elena', 'roan', 'tio'],
    enemies: [
      { presetKey: 'zeraAvatar', position: { x: 736, y: 176 }, name: 'Zera' },
      { presetKey: 'milleniaShade', position: { x: 826, y: 258 }, name: 'False Millenia' },
    ],
  },
  true_finale: {
    battleLabel: 'Setpiece: End of Valmar',
    encounterSource: 'setpiece-bespoke',
    customScriptId: 'new-valmar-core',
    battlefieldTheme: 'volcano',
    openingAdvantage: 'neutral',
    introLog: 'Setpiece battle — the final core of Valmar answers with everything it has left.',
    players: ['ryudo', 'elena', 'millenia'],
    enemies: [
      { presetKey: 'valmarCoreHerald', position: { x: 730, y: 180 }, name: 'Valmar Core' },
    ],
  },
};

export function setpieceConfigForBeat(beatId) {
  return SETPIECES[beatId] ?? null;
}

export function setpieceBattleOverrideForBeat(beatId) {
  return BATTLE_OVERRIDES[beatId] ?? null;
}
