export const LOCATION_STATE_VARIANTS = {
  carbo_village: [
    {
      id: 'carbo-before-disaster',
      beats: ['carbo_contract'],
      label: 'Carbo до катастрофы',
      description: 'Тихая деревня с церковным укладом, трактиром и ощущением, будто большая беда ещё далеко.',
      tags: ['деревня', 'церковь', 'старт'],
    },
    {
      id: 'carbo-after-garmia',
      beats: ['garmia_failure', 'millenia_first_attack'],
      label: 'Carbo после Гармии',
      description: 'После провала ритуала в Карбо чувствуется тревога: обычная деревенская жизнь треснула, а разговоры крутятся вокруг Вальмара и Елены.',
      tags: ['тревога', 'последствия ритуала'],
    },
  ],
  carbo_inn: [
    {
      id: 'carbo-inn-contract',
      beats: ['carbo_contract'],
      label: 'Трактир Карбо: начало задания',
      description: 'Именно здесь Кариус переводит историю из уровня простой просьбы в настоящий церковный контракт для геохаунда.',
      tags: ['контракт', 'трактир', 'вступление'],
      serviceOverrides: ['inn'],
    },
    {
      id: 'carbo-inn-night-watch',
      beats: ['millenia_first_attack'],
      label: 'Трактир Карбо: тревожная ночь',
      description: 'Трактир уже не место отдыха, а точка тревожного ожидания перед ночным вторжением Миллении.',
      tags: ['ночь', 'тревога', 'предчувствие'],
      serviceOverrides: ['inn'],
    },
  ],
  carbo_store: [
    {
      id: 'carbo-store-quiet',
      beats: ['carbo_contract'],
      label: 'Лавка Карбо до беды',
      description: 'Местная лавка всё ещё живёт обычным ритмом деревни: припасы, советы в дорогу и ощущение маленького мира, который пока не знает собственной хрупкости.',
      tags: ['быт', 'магазин', 'тишина'],
      serviceOverrides: ['shop'],
    },
    {
      id: 'carbo-store-anxious',
      beats: ['garmia_failure', 'millenia_first_attack'],
      label: 'Лавка Карбо после катастрофы',
      description: 'После Гармии даже обычные покупки звучат как подготовка к худшему, а деревенская суета меняется на нервную запасливость.',
      tags: ['последствия', 'припасы', 'тревога'],
      serviceOverrides: ['shop'],
    },
  ],
  carbo_church: [
    {
      id: 'carbo-church-song',
      beats: ['carbo_contract'],
      label: 'Церковь Карбо: песнь Елены',
      description: 'Церковь звучит как место веры и ритуала, где голос Елены ещё кажется защитой, а не предвестием разлома.',
      tags: ['церковь', 'Елена', 'ритуал'],
      serviceOverrides: ['church'],
    },
    {
      id: 'carbo-church-aftermath',
      beats: ['garmia_failure'],
      label: 'Церковь Карбо: после катастрофы',
      description: 'Даже стены церкви теперь не внушают покоя: ритуал уже сломан, а молитва звучит поздно.',
      tags: ['последствия', 'сломанная вера'],
      serviceOverrides: ['church'],
    },
  ],
  carbo_house_2: [
    {
      id: 'carbo-house-domestic',
      beats: ['carbo_contract'],
      label: 'Обычный дом Карбо до ухода партии',
      description: 'Небольшой жилой дом подчёркивает, ради чего вообще имеет смысл выходить в путь: обычные люди всё ещё пытаются жить спокойно, пока большая беда только подбирается к деревне.',
      tags: ['быт', 'дом', 'мирная жизнь'],
      serviceOverrides: ['home'],
    },
  ],
  agear_town: [
    {
      id: 'agear-broken-garrison',
      beats: ['agear_roan'],
      label: 'Агир как разбитый пограничный город',
      description: 'Агир уже не спорит о том, случится ли беда: он живёт после удара, который разнёс порядок и вытолкнул Роана прямо к пещере.',
      tags: ['разрушение', 'беженцы', 'кризис'],
      serviceOverrides: ['inn', 'shop', 'cave-gate'],
    },
  ],
  agear_guard_tent: [
    {
      id: 'agear-guard-supply',
      beats: ['agear_roan'],
      label: 'Палатка снабжения на осадном положении',
      description: 'Импровизированный пункт снабжения подчёркивает, что Агир уже живёт не торговлей, а выживанием и спешной обороной.',
      tags: ['снабжение', 'гарнизон', 'осада'],
      serviceOverrides: ['shop'],
    },
  ],
  liligue_city: [
    {
      id: 'liligue-engineer-bustle',
      beats: ['liligue_and_mareg'],
      label: 'Лилиг во время инженерской суеты',
      description: 'Город живёт рынком, skyway и спорами инженеров, но под этим слоем уже чувствуется скрытая порча под руинами.',
      tags: ['город', 'инженеры', 'руины'],
    },
  ],
  liligue_inn: [
    {
      id: 'liligue-inn-gold',
      beats: ['liligue_and_mareg'],
      label: 'Лилигская гостиница перед спуском в руины',
      description: 'Тепло, хороший свет и разговоры о деньгах делают Лилиг почти комфортным — именно поэтому подземная язва под городом ощущается ещё резче.',
      tags: ['уют', 'городской фасад', 'контраст'],
      serviceOverrides: ['inn'],
    },
  ],
  liligue_store: [
    {
      id: 'liligue-store-wealth',
      beats: ['liligue_and_mareg'],
      label: 'Лавка богатого города',
      description: 'Местная торговля до последнего поддерживает иллюзию благополучия, хотя весь город уже живёт на краю древней порчи.',
      tags: ['богатство', 'рынок', 'иллюзия порядка'],
      serviceOverrides: ['shop'],
    },
  ],
  liligue_engineer_house: [
    {
      id: 'liligue-engineer-house-noise',
      beats: ['liligue_and_mareg'],
      label: 'Дом инженеров под шум расчётов',
      description: 'Чертежи, спор и деловая суета подчёркивают, что Лилиг привык решать проблемы техникой и долго не хочет признавать настоящую природу беды.',
      tags: ['чертежи', 'спор', 'техника'],
      serviceOverrides: ['house'],
    },
  ],
  liligue_church: [
    {
      id: 'liligue-church-small-faith',
      beats: ['liligue_and_mareg'],
      label: 'Небольшая церковь в богатом городе',
      description: 'Даже церковь Лилига ощущается здесь не как центр мира, а как маленький островок привычной веры посреди инженерного города и растущей порчи.',
      tags: ['церковь', 'город', 'неуверенная вера'],
      serviceOverrides: ['church'],
    },
  ],
  liligue_cave: [
    {
      id: 'liligue-cave-seals',
      beats: ['liligue_and_mareg'],
      label: 'Пещера Лилига: древние печати',
      description: 'Лилигская пещера ощущается не просто дорогой к боссу, а серией древних запирающих механизмов и ритуальных узлов.',
      tags: ['печати', 'руины', 'древний механизм'],
      serviceOverrides: ['save-point'],
    },
  ],
  liligue_temple_ruins: [
    {
      id: 'liligue-ruins-threshold',
      beats: ['liligue_and_mareg'],
      label: 'Храмовые руины под городом',
      description: 'Руины под Лилигом уже не выглядят как просто секрет под городом — это священная трещина, где городской фасад окончательно уступает место телу Вальмара.',
      tags: ['руины', 'порог', 'Вальмар'],
    },
  ],
  skyway_station: [
    {
      id: 'skyway-boundary',
      beats: ['liligue_and_mareg', 'st_heim_zera'],
      label: 'Skyway как граница между частями мира',
      description: 'Skyway Station ощущается настоящим переходным узлом: здесь маршрут Grandia II меняет климат, масштаб и тон следующего куска истории.',
      tags: ['переход', 'маршрут', 'граница региона'],
      serviceOverrides: ['travel-hub'],
    },
  ],
  mirumu_village: [
    {
      id: 'mirumu-quarantine',
      beats: ['st_heim_zera'],
      label: 'Мирума под тенью Селены',
      description: 'Мирума уже не просто снежная деревня, а место страха, странной болезни и религиозного давления.',
      tags: ['карантин', 'снег', 'страх'],
    },
  ],
  mirumu_inn: [
    {
      id: 'mirumu-inn-whisper',
      beats: ['st_heim_zera'],
      label: 'Таверна Мирумы под шёпотом болезни',
      description: 'Даже в тёплой комнате Мирумы люди говорят вполголоса, будто страх уже научился сидеть за одним столом с ними.',
      tags: ['шёпот', 'холод', 'усталость'],
      serviceOverrides: ['inn'],
    },
  ],
  mirumu_town_hall: [
    {
      id: 'mirumu-hall-quarantine',
      beats: ['st_heim_zera'],
      label: 'Зал Мирумы под давлением Селены',
      description: 'Общественный дом уже не воспринимается как обычная civic-точка: здесь сходятся страх, болезнь и религиозный контроль.',
      tags: ['собрание', 'страх', 'давление'],
      serviceOverrides: ['civic'],
    },
  ],
  mirumu_chief_house: [
    {
      id: 'mirumu-chief-burden',
      beats: ['st_heim_zera'],
      label: 'Дом старосты на грани бессилия',
      description: 'Дом старосты подчёркивает, насколько обычная местная власть уже бессильна перед церковным давлением и болезнью.',
      tags: ['староста', 'бессилие', 'деревенская власть'],
      serviceOverrides: ['home'],
    },
  ],
  mysterious_fissure: [
    {
      id: 'fissure-descent-corruption',
      beats: ['st_heim_zera'],
      label: 'Разлом как спуск в чужую болезнь',
      description: 'Разлом под Мирумой ощущается не просто данжем, а прямым погружением в источник страха, который уже захватил деревню сверху.',
      tags: ['разлом', 'порча', 'спуск'],
      serviceOverrides: ['save-point'],
    },
  ],
  fissure_depths: [
    {
      id: 'fissure-depths-threshold',
      beats: ['st_heim_zera'],
      label: 'Глубины разлома перед Aira\'s Space',
      description: 'На нижнем уровне разлома маршрут перестаёт быть просто опасным и становится почти духовным провалом внутрь боли Аиры.',
      tags: ['глубина', 'сон', 'Аира'],
    },
  ],
  st_heim_papal_state: [
    {
      id: 'stheim-first-visit',
      beats: ['st_heim_zera'],
      label: 'St. Heim: фасад святого города',
      description: 'Сент-Хейм выглядит как центр света, порядка и благочестия, но уже чувствуется, что этот блеск слишком отполирован, чтобы быть честным.',
      tags: ['собор', 'политика', 'ложная святость'],
      serviceOverrides: ['inn', 'shop', 'library', 'cathedral', 'pasture'],
    },
    {
      id: 'stheim-day-of-darkness',
      beats: ['cathedral_massacre', 'zera_revealed'],
      label: 'St. Heim: День Тьмы',
      description: 'Священный город превращён в место резни. Собор, лестницы и площади больше не про уютные визиты, а про бегство, кровь и разоблачение церкви.',
      tags: ['апокалипсис', 'резня', 'церковный крах'],
      serviceOverrides: ['cathedral', 'library'],
    },
  ],
  st_heim_inn: [
    {
      id: 'stheim-inn-polish',
      beats: ['st_heim_zera'],
      label: 'Гостиница святого города',
      description: 'Комфорт St. Heim слишком тщательно выстроен, и даже отдых здесь ощущается частью церковного сценария, а не простым гостеприимством.',
      tags: ['комфорт', 'церковный фасад', 'подозрение'],
      serviceOverrides: ['inn'],
    },
  ],
  st_heim_store: [
    {
      id: 'stheim-store-order',
      beats: ['st_heim_zera'],
      label: 'Магазин под идеальным порядком',
      description: 'Даже торговля в St. Heim подчёркивает странную чистоту святого города: слишком безупречную, чтобы не вызывать вопросов.',
      tags: ['порядок', 'церковь', 'витрина'],
      serviceOverrides: ['shop'],
    },
  ],
  st_heim_bakery: [
    {
      id: 'stheim-bakery-normalcy',
      beats: ['st_heim_zera'],
      label: 'Пекарня как мелкая бытовая маска нормальности',
      description: 'Небольшая пекарня даёт городу нужный слой повседневности, из-за которого последующий крах церкви ощущается ещё болезненнее.',
      tags: ['быт', 'хлеб', 'нормальность'],
      serviceOverrides: ['bakery'],
    },
    {
      id: 'stheim-bakery-ash',
      beats: ['cathedral_massacre', 'zera_revealed'],
      label: 'Пекарня после краха',
      description: 'Даже маленькая мирная пекарня в позднем St. Heim ощущается как доказательство того, что День Тьмы добрался до самой ткани обычной жизни.',
      tags: ['пепел', 'крах', 'гражданская цена'],
      serviceOverrides: ['bakery'],
    },
  ],
  st_heim_library: [
    {
      id: 'stheim-library-inquiry',
      beats: ['st_heim_zera'],
      label: 'Библиотека как тихий разлом догмы',
      description: 'Именно в библиотеке святой фасад St. Heim начинает впервые трещать под натиском вопросов о Граносе, Вальмаре и Зере.',
      tags: ['книги', 'догма', 'сомнение'],
      serviceOverrides: ['library'],
    },
    {
      id: 'stheim-library-aftermath',
      beats: ['cathedral_massacre', 'zera_revealed'],
      label: 'Библиотека после краха',
      description: 'После начала катастрофы даже библиотека воспринимается уже не как место знания, а как хранилище поздней, болезненной правды.',
      tags: ['поздняя правда', 'крах'],
      serviceOverrides: ['library'],
    },
  ],
  st_heim_guestroom: [
    {
      id: 'stheim-guestroom-unease',
      beats: ['st_heim_zera'],
      label: 'Гостевая комната между доверием и тревогой',
      description: 'Комната отдыха в соборе нужна именно как пауза между церемониями: здесь подозрение успевает догнать внешний блеск города.',
      tags: ['пауза', 'недоверие', 'собор'],
      serviceOverrides: ['inn', 'save-point'],
    },
  ],
  st_heim_balcony: [
    {
      id: 'stheim-balcony-facade',
      beats: ['st_heim_zera'],
      label: 'Балкон святого фасада',
      description: 'С балкона святой город ещё выглядит цельным, но именно здесь особенно сильно чувствуется разница между официальной позолотой и настоящей напряжённостью пути.',
      tags: ['фасад', 'спокойствие перед ложью'],
      serviceOverrides: ['viewpoint'],
    },
  ],
  st_heim_audience_chamber: [
    {
      id: 'stheim-audience-polished',
      beats: ['st_heim_zera'],
      label: 'Аудиенционный зал как театр церкви',
      description: 'Зал аудиенций здесь работает как сцена церковной власти, где каждая реплика Зеры звучит одновременно благословением и политическим приказом.',
      tags: ['аудиенция', 'власть', 'театр'],
      serviceOverrides: ['civic'],
    },
    {
      id: 'stheim-audience-collapse',
      beats: ['cathedral_massacre', 'zera_revealed'],
      label: 'Аудиенционный зал после падения маски',
      description: 'Поздний зал аудиенций уже не про церемонию. Это место, где ложная святость разваливается прямо в политическую жестокость.',
      tags: ['разоблачение', 'крушение власти'],
      serviceOverrides: ['civic'],
    },
  ],
  zera_room: [
    {
      id: 'zera-room-private-order',
      beats: ['zera_revealed'],
      label: 'Комната Зеры как личный штаб лжи',
      description: 'Личный кабинет Зеры ощущается не уединением, а местом, где религиозная маска сходит окончательно и остаётся только хорошо организованная власть.',
      tags: ['кабинет', 'контроль', 'улика'],
      serviceOverrides: ['story'],
    },
  ],
  st_heim_forbidden_room: [
    {
      id: 'stheim-forbidden-late',
      beats: ['zera_revealed', 'moon_assault'],
      label: 'Запретная комната как поздний раскол мира',
      description: 'Запретная комната уже не ощущается как просто hidden room — это переход из церковной истории в апокалиптическую.',
      tags: ['запретное знание', 'порог'],
      serviceOverrides: ['story'],
    },
  ],
  st_heim_cathedral_lobby: [
    {
      id: 'stheim-lobby-massacre',
      beats: ['cathedral_massacre', 'zera_revealed'],
      label: 'Собор под кровью и хаосом',
      description: 'Лобби собора больше не служит торжественному входу: оно превращено в коридор катастрофы и религиозной жестокости.',
      tags: ['паника', 'катастрофа', 'церковь'],
      serviceOverrides: ['cathedral'],
    },
  ],
  st_heim_pasture: [
    {
      id: 'stheim-pasture-breath',
      beats: ['st_heim_zera'],
      label: 'Пастбище как редкий бытовой выдох',
      description: 'Небольшое пастбище даёт святому городу человеческую деталь — и тем сильнее подчёркивает, насколько ненастоящим окажется весь фасад позже.',
      tags: ['быт', 'контраст', 'мирный штрих'],
      serviceOverrides: ['pasture'],
    },
  ],
  cyrum_kingdom: [
    {
      id: 'cyrum-crown-festival',
      beats: ['cyrum_and_claws'],
      label: 'Цайрум до вскрытия правды',
      description: 'Снаружи Цайрум ещё играет в нормальную столицу: площадь, шатры, дворец и молодого принца любят как символ покоя.',
      tags: ['столица', 'принц', 'скрытая ложь'],
      serviceOverrides: ['inn', 'shop', 'castle', 'port', 'town-square'],
    },
    {
      id: 'cyrum-war-mobilization',
      beats: ['cyrum_defense', 'birthplace_descent'],
      label: 'Цайрум на военном положении',
      description: 'Поздний Цайрум — уже не праздничная столица, а мобилизованный тыл войны против Вальмара.',
      tags: ['оборона', 'мобилизация', 'тыл'],
      serviceOverrides: ['inn', 'shop', 'castle', 'port', 'town-square'],
    },
  ],
  cyrum_inn: [
    {
      id: 'cyrum-inn-first-night',
      beats: ['cyrum_and_claws'],
      label: 'Гостиница перед вскрытием подземной правды',
      description: 'Ночь в Цайруме нужна как отдельная пауза: город ещё похож на дом, хотя под ним уже лежит завод и линия Тио.',
      tags: ['дом', 'ночь', 'маска столицы'],
      serviceOverrides: ['inn'],
    },
    {
      id: 'cyrum-inn-war-rest',
      beats: ['cyrum_defense'],
      label: 'Гостиница как прифронтовой привал',
      description: 'В позднем Цайруме даже постоялый двор уже звучит как место краткого сна между приказами и паникой.',
      tags: ['фронт', 'усталость', 'короткий отдых'],
      serviceOverrides: ['inn'],
    },
  ],
  cyrum_castle_square: [
    {
      id: 'cyrum-square-festival',
      beats: ['cyrum_and_claws'],
      label: 'Площадь Цайрума как маска нормальности',
      description: 'Площадь Цайрума ещё умеет притворяться мирной и праздничной, хотя под ней уже скрыт путь к заводу и Когтям Вальмара.',
      tags: ['праздник', 'маска', 'городской фасад'],
      serviceOverrides: ['square'],
    },
    {
      id: 'cyrum-square-war',
      beats: ['cyrum_defense'],
      label: 'Площадь Цайрума как узел обороны',
      description: 'Поздняя площадь Цайрума уже ощущается как место сбора, паники и военного командования.',
      tags: ['мобилизация', 'паника', 'война'],
      serviceOverrides: ['square'],
    },
  ],
  hemble_tent: [
    {
      id: 'hemble-tent-festival',
      beats: ['cyrum_and_claws'],
      label: 'Шатёр Хембла как карнавальная передышка',
      description: 'Фестивальный шатёр важен как бытовая странность большой столицы: смешной снаружи и сюжетно необходимый перед спуском к серьёзной правде.',
      tags: ['фестиваль', 'быт', 'контраст'],
      serviceOverrides: ['event'],
    },
  ],
  cyrum_port: [
    {
      id: 'cyrum-port-bright',
      beats: ['cyrum_and_claws'],
      label: 'Порт перед тайным спуском',
      description: 'Шумный причал подчёркивает, как близко к обычной жизни спрятана скрытая государственная машина Цайрума.',
      tags: ['порт', 'граница', 'скрытая инфраструктура'],
      serviceOverrides: ['port'],
    },
    {
      id: 'cyrum-port-war',
      beats: ['cyrum_defense'],
      label: 'Порт как тыловая артерия обороны',
      description: 'Поздний порт Цайрума живёт уже не от торговли, а от срочности: снабжение, слухи и движение людей к фронту.',
      tags: ['снабжение', 'тыл', 'война'],
      serviceOverrides: ['port'],
    },
  ],
  cyrum_kings_chamber: [
    {
      id: 'cyrum-kings-room-burden',
      beats: ['cyrum_and_claws'],
      label: 'Покои правителя и линия Роана',
      description: 'Личные покои двора смещают историю Цайрума из просто городской интриги в вопрос о взрослении Роана и цене власти.',
      tags: ['Роан', 'дворец', 'долг'],
      serviceOverrides: ['story'],
    },
    {
      id: 'cyrum-kings-room-war',
      beats: ['cyrum_defense'],
      label: 'Покои правителя как комната военного долга',
      description: 'В late-state версии покои правителя больше не про статус, а про тяжесть решений, которые уже нельзя отложить.',
      tags: ['долг', 'война', 'взросление'],
      serviceOverrides: ['story'],
    },
  ],
  cyrum_secret_passage: [
    {
      id: 'cyrum-secret-infiltration',
      beats: ['cyrum_and_claws'],
      label: 'Тайный проход под замком',
      description: 'Секретный проход работает как постепенное вскрытие скрытой стороны Цайрума: рычаги, скрытые двери и тёмный спуск вниз.',
      tags: ['тайный путь', 'инфильтрация', 'дворцовая тень'],
      serviceOverrides: ['save-point'],
    },
  ],
  underground_plant: [
    {
      id: 'plant-terminal-stage',
      beats: ['cyrum_and_claws'],
      label: 'Underground Plant: терминалы и трубы',
      description: 'Подземный завод ощущается не как одна арена, а как техноданж с терминалами, трубами и контролем маршрута.',
      tags: ['технология', 'трубы', 'контроль'],
      serviceOverrides: ['save-point'],
    },
  ],
  underground_control_room: [
    {
      id: 'plant-control-core',
      beats: ['cyrum_and_claws'],
      label: 'Контрольная комната перед Когтями Вальмара',
      description: 'Последний отсек завода должен ощущаться как скрытое сердце всей техно-лжи Цайрума, а не просто последняя комната данжа.',
      tags: ['control room', 'сердце завода', 'Тио'],
    },
  ],
  cyrum_kingdom_south: [
    {
      id: 'cyrum-south-front',
      beats: ['cyrum_defense', 'birthplace_descent'],
      label: 'Южный фронт Цайрума',
      description: 'Южный подход больше не выглядит как обычная полевая зона — это уже фронтовой участок с ощущением осады и спешки.',
      tags: ['фронт', 'оборона', 'война'],
      serviceOverrides: ['camp'],
    },
  ],
  garlan_village: [
    {
      id: 'garlan-hostile-homecoming',
      beats: ['garlan_return', 'melfice_duel'],
      label: 'Гарлан: враждебное возвращение',
      description: 'Гарлан — это уже не просто деревня, а место, где на каждом углу Рюдо сталкивается с обвинением, памятью и тенью Мелфиса.',
      tags: ['прошлое', 'вина', 'возвращение'],
    },
  ],
  garlan_inn: [
    {
      id: 'garlan-inn-heavy-night',
      beats: ['garlan_return'],
      label: 'Ночь в Гарлане под грузом прошлого',
      description: 'Ночёвка в Гарлане работает здесь как сюжетный нож: она не успокаивает, а только сильнее затягивает Рюдо в старую травму.',
      tags: ['ночь', 'прошлое', 'давление'],
      serviceOverrides: ['inn'],
    },
  ],
  garlan_store: [
    {
      id: 'garlan-store-cold-trade',
      beats: ['garlan_return'],
      label: 'Лавка Гарлана без домашнего тепла',
      description: 'Даже обычная торговля в Гарлане ощущается холодно и отчуждённо: деревня помнит слишком многое, чтобы встретить Рюдо как своего.',
      tags: ['отчуждение', 'быт', 'прошлое'],
      serviceOverrides: ['shop'],
    },
  ],
  garlan_store: [
    {
      id: 'garlan-store-cold',
      beats: ['garlan_return'],
      label: 'Лавка деревни, которая не рада возвращению',
      description: 'Даже обычная лавка Гарлана держит холодную дистанцию: здесь бытовой интерьер работает как ещё одно напоминание, что Рюдо вернулся не домой, а в старую вину.',
      tags: ['холод', 'быт', 'отчуждение'],
      serviceOverrides: ['shop'],
    },
  ],
  garlan_chief_house: [
    {
      id: 'garlan-chief-house-judgement',
      beats: ['garlan_return'],
      label: 'Дом старосты и память деревни',
      description: 'Дом старосты концентрирует всю тяжесть общественной памяти Гарлана: здесь прошлое Рюдо звучит уже не как слух, а как коллективный приговор.',
      tags: ['староста', 'приговор', 'память'],
      serviceOverrides: ['home'],
    },
  ],
  grail_mountain: [
    {
      id: 'grail-climb-memory',
      beats: ['melfice_duel'],
      label: 'Грайл как подъём к памяти',
      description: 'Подъём на Grail Mountain должен ощущаться как постепенное сужение мира до личной развязки Рюдо и Мелфиса.',
      tags: ['подъём', 'память', 'дуэль'],
      serviceOverrides: ['save-point'],
    },
  ],
  plateau_of_memories: [
    {
      id: 'plateau-duel-threshold',
      beats: ['melfice_duel'],
      label: 'Плато воспоминаний',
      description: 'Плато уже не просто боевая точка, а порог, где прошлое и настоящее Рюдо схлопываются в одну развязку.',
      tags: ['порог', 'прошлое', 'дуэль'],
    },
  ],
  nanan_village: [
    {
      id: 'nanan-edge-of-world',
      beats: ['nanan_and_cyclone'],
      label: 'Нанан у края мира',
      description: 'Нанан ощущается как последняя человеческая точка перед бурей, разломом и древней машиной.',
      tags: ['край света', 'шторм', 'порог'],
    },
  ],
  nanan_inn: [
    {
      id: 'nanan-inn-last-rest',
      beats: ['nanan_and_cyclone'],
      label: 'Последний человеческий привал',
      description: 'Ночёвка в Нанане ощущается не отдыхом, а последней узнаваемой остановкой перед тем, как маршрут уйдёт в шторм, разлом и древнюю машину.',
      tags: ['последний привал', 'край света', 'буря'],
      serviceOverrides: ['inn'],
    },
  ],
  nanan_store: [
    {
      id: 'nanan-store-clan',
      beats: ['nanan_and_cyclone'],
      label: 'Северная лавка как клановый сбор перед походом',
      description: 'Даже обычная торговая точка в Нанане работает как место подготовки к дороге за край привычного мира.',
      tags: ['клан', 'подготовка', 'дорога'],
      serviceOverrides: ['shop'],
    },
  ],
  great_rift: [
    {
      id: 'great-rift-storm-path',
      beats: ['nanan_and_cyclone'],
      label: 'Великий Разлом под давлением шторма',
      description: 'Разлом чувствуется как место, где сама география сопротивляется продвижению и выжимает из партии весь запас темпа.',
      tags: ['шторм', 'разлом', 'древний маршрут'],
      serviceOverrides: ['save-point'],
    },
  ],
  demons_law: [
    {
      id: 'demons-law-control',
      beats: ['nanan_and_cyclone', 'granasaber_ship'],
      label: 'Demons Law как древний командный узел',
      description: 'Demons Law работает как переход от стихийного внешнего мира к техно-археологической правде о Гранасабере.',
      tags: ['контроль', 'технология', 'древний механизм'],
      serviceOverrides: ['save-point'],
    },
  ],
  valmar_body: [
    {
      id: 'valmar-organic-hunt',
      beats: ['granasaber_ship'],
      label: 'Тело Вальмара: живой лабиринт',
      description: 'Тело Вальмара ощущается как мерзкий, биологический и враждебный коридор между партией и следующим большим откровением о мире.',
      tags: ['органика', 'ужас', 'плоть'],
      serviceOverrides: ['save-point'],
    },
  ],
  valmars_moon: [
    {
      id: 'moon-organic-siege',
      beats: ['moon_assault'],
      label: 'Луна Вальмара: осада органической крепости',
      description: 'Луна больше похожа на живую крепость и требовательный позднеигровой штурм, чем на обычный данж.',
      tags: ['осада', 'луна', 'поздняя игра'],
      serviceOverrides: ['save-point'],
    },
  ],
  valmars_womb: [
    {
      id: 'moon-womb-threshold',
      beats: ['moon_assault'],
      label: 'Чрево Луны как внутренняя развязка штурма',
      description: 'Чрево Луны ощущается как точка, где осада перестаёт быть дорогой и становится личной жертвой и последним рывком.',
      tags: ['чрево', 'жертва', 'внутренняя кульминация'],
    },
  ],
  birthplace_of_the_gods: [
    {
      id: 'birthplace-ancient-truth',
      beats: ['birthplace_descent'],
      label: 'Исток богов: разобранная мифология',
      description: 'Каждый уровень Истока богов не подтверждает догму, а разрушает её и заменяет древней технологической правдой.',
      tags: ['древность', 'правда', 'технология'],
    },
    {
      id: 'birthplace-after-trial',
      beats: ['inner_trial'],
      label: 'Исток богов после личного суда Рюдо',
      description: 'После внутреннего испытания это место ощущается уже не просто архивом правды, а мостом к последней воле людей против ложных богов.',
      tags: ['послесловие', 'истина', 'решимость'],
    },
  ],
  inner_trial: [
    {
      id: 'inner-trial-solitude',
      beats: ['inner_trial'],
      label: 'Внутренний суд Рюдо',
      description: 'Это не внешний данж, а метафорическая и жёсткая личная конфронтация, где шаги важны не меньше боя.',
      tags: ['вина', 'самосуд', 'психология'],
    },
  ],
  new_valmar: [
    {
      id: 'new-valmar-organic-finale',
      beats: ['zera_inside_valmar'],
      label: 'Новый Вальмар: живая последняя ложь',
      description: 'Внутренности Нового Вальмара выглядят как смесь бога, органики и лжи, где каждый проход будто спорит с правом человека выбирать своё будущее.',
      tags: ['финал', 'органика', 'ложный бог'],
      serviceOverrides: ['save-point'],
    },
    {
      id: 'new-valmar-final-quiet',
      beats: ['true_finale'],
      label: 'Новый Вальмар перед самым приговором',
      description: 'В beat перед финалом тот же данж читается уже иначе: не как вражеское чрево, а как последняя дорога к человеческому выбору.',
      tags: ['последняя дорога', 'ядро', 'приговор'],
      serviceOverrides: ['save-point'],
    },
  ],
  new_valmar_room_of_chaos: [
    {
      id: 'new-valmar-chaos-hall',
      beats: ['zera_inside_valmar'],
      label: 'Комната Хаоса как зал ложных форм',
      description: 'Room of Chaos ощущается как место, где Зера воюет ложью не меньше, чем силой.',
      tags: ['хаос', 'ложь', 'Зера'],
    },
  ],
  new_valmar_core: [
    {
      id: 'new-valmar-core-judgement',
      beats: ['true_finale'],
      label: 'Ядро Нового Вальмара',
      description: 'Ядро финальной развязки должно ощущаться не просто как арена, а как приговор всему порядку ложных богов и навязанной судьбы.',
      tags: ['ядро', 'приговор', 'финал'],
    },
  ],
};

export const DUNGEON_STAGE_CHAINS = {
  garmia_tower: {
    title: 'Garmia Tower progression',
    steps: [
      { flagId: 'flag_garmia_floor1', label: 'Пройти первые этажи', locationId: 'garmia_tower' },
      { flagId: 'flag_garmia_window', label: 'Найти путь через окно к верхней площадке', locationId: 'garmia_tower' },
    ],
  },
  durham_cave_entrance: {
    title: 'Durham Cave progression',
    steps: [
      { flagId: 'flag_durham_bridge', label: 'Открыть мосты и рычаги', locationId: 'durham_cave_entrance' },
      { flagId: 'flag_durham_roan_found', label: 'Выйти на след Роана', locationId: 'durham_cave_entrance' },
    ],
  },
  liligue_cave: {
    title: 'Liligue Cave progression',
    steps: [
      { flagId: 'flag_liligue_seals', label: 'Активировать руинные печати и открыть путь глубже', locationId: 'liligue_cave' },
    ],
  },
  st_heim_mountains: {
    title: 'St. Heim Mountains progression',
    steps: [
      { flagId: 'flag_stheim_inn_stay', label: 'Пережить путь до святого города', locationId: 'st_heim_mountains' },
      { flagId: 'flag_scene_stheim_inn_arrival', label: 'Освоиться в святом городе перед аудиенцией', locationId: 'st_heim_inn' },
      { flagId: 'flag_scene_stheim_bakery_facade', label: 'Увидеть бытовой фасад St. Heim за пределами собора', locationId: 'st_heim_bakery' },
      { flagId: 'flag_scene_stheim_guestroom_evening', label: 'Пережить вечер между аудиенциями', locationId: 'st_heim_guestroom' },
    ],
  },
  cyrum_secret_passage: {
    title: 'Cyrum Secret Passage progression',
    steps: [
      { flagId: 'flag_scene_cyrum_kings_burden', label: 'Услышать дворцовую цену правды', locationId: 'cyrum_kings_chamber' },
      { flagId: 'flag_cyrum_passage', label: 'Вскрыть глубинный путь под замком', locationId: 'cyrum_secret_passage' },
    ],
  },
  underground_plant: {
    title: 'Underground Plant progression',
    steps: [
      { flagId: 'flag_plant_terminal', label: 'Включить терминалы комплекса', locationId: 'underground_plant' },
      { flagId: 'flag_plant_pipe', label: 'Провести маршрут через трубы и лифты', locationId: 'underground_plant' },
    ],
  },
  great_rift: {
    title: 'Great Rift progression',
    steps: [
      { flagId: 'flag_scene_nanan_clan_council', label: 'Получить клановый совет Нанана', locationId: 'nanan_store' },
      { flagId: 'flag_rift_cross', label: 'Понять маршрут к Разлому', locationId: 'ghoss_forest_east' },
      { flagId: 'flag_demons_law', label: 'Открыть путь к Demons Law', locationId: 'great_rift' },
    ],
  },
  demons_law: {
    title: 'Demons Law progression',
    steps: [
      { flagId: 'flag_demons_law', label: 'Открыть путь к древнему комплексу', locationId: 'great_rift' },
      { flagId: 'flag_scene_demons_law_console', label: 'Понять природу древней машины', locationId: 'demons_law' },
      { flagId: 'flag_valmar_body_core', label: 'Пройти за пределы Demons Law к телу Вальмара', locationId: 'demons_law' },
    ],
  },
  valmar_body: {
    title: 'Valmar Body progression',
    steps: [
      { flagId: 'flag_valmar_body_core', label: 'Дойти до сердцевины Тела Вальмара', locationId: 'valmar_body' },
    ],
  },
  valmars_moon: {
    title: 'Valmar Moon progression',
    steps: [
      { flagId: 'flag_moon_surface', label: 'Пройти поверхность Луны', locationId: 'valmars_moon' },
      { flagId: 'flag_moon_womb_route', label: 'Открыть путь к Чреву Луны', locationId: 'valmars_moon' },
    ],
  },
  birthplace_of_the_gods: {
    title: 'Birthplace of the Gods progression',
    steps: [
      { flagId: 'flag_birthplace_truth', label: 'Собрать древнюю правду', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_truth_hall', label: 'Прочитать первый зал правды', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_blue', label: 'Активировать синий механизм', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_blue', label: 'Открыть синий архивный зал', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_yellow', label: 'Активировать жёлтый механизм', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_yellow', label: 'Открыть жёлтый архивный зал', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_red', label: 'Активировать красный механизм', locationId: 'birthplace_of_the_gods' },
    ],
  },
  inner_trial: {
    title: 'Inner Trial progression',
    steps: [
      { flagId: 'flag_inner_trial_accept', label: 'Принять внутреннее испытание', locationId: 'inner_trial' },
    ],
  },
  new_valmar: {
    title: 'New Valmar progression',
    steps: [
      { flagId: 'flag_new_valmar_will', label: 'Осознать последнюю волю перед финалом', locationId: 'new_valmar' },
      { flagId: 'flag_scene_new_valmar_vein_whisper', label: 'Услышать, как данж пытается говорить волей Зеры', locationId: 'new_valmar' },
      { flagId: 'flag_scene_new_valmar_vein_choir', label: 'Пережить хор живых стен и вторую волну давления', locationId: 'new_valmar' },
      { flagId: 'flag_new_valmar_outer', label: 'Пробить внешний барьер', locationId: 'new_valmar' },
      { flagId: 'flag_new_valmar_chaos', label: 'Открыть путь к Room of Chaos', locationId: 'new_valmar' },
      { flagId: 'flag_scene_room_of_chaos_echo', label: 'Пережить ложные голоса Комнаты Хаоса', locationId: 'new_valmar_room_of_chaos' },
      { flagId: 'flag_true_finale_core', label: 'Дойти до ядра финальной развязки', locationId: 'new_valmar_core' },
    ],
  },
  new_valmar_core: {
    title: 'New Valmar core progression',
    steps: [
      { flagId: 'flag_scene_new_valmar_core_threshold', label: 'Пересечь финальный порог к ядру', locationId: 'new_valmar_core' },
      { flagId: 'flag_scene_new_valmar_core_judgement', label: 'Услышать финальный приговор ложным богам', locationId: 'new_valmar_core' },
      { flagId: 'flag_true_finale_core', label: 'Подготовить ядро финальной развязки', locationId: 'new_valmar_core' },
    ],
  },
};

function matchStateVariant(variant, beatId) {
  return Array.isArray(variant?.beats) ? variant.beats.includes(beatId) : false;
}

export function resolveLocationStateProfile(locationId, beatId) {
  const variants = LOCATION_STATE_VARIANTS[locationId] ?? [];
  return variants.find((variant) => matchStateVariant(variant, beatId)) ?? null;
}

export function resolveDungeonStageChain(locationId) {
  return DUNGEON_STAGE_CHAINS[locationId] ?? null;
}
