function scene(id, beatId, locationId, title, subtitle, pages, extra = {}) {
  return {
    id,
    beatId,
    locationId,
    title,
    subtitle,
    pages,
    requiresFlags: extra.requiresFlags ?? [],
    grantsFlags: extra.grantsFlags ?? [],
    summary: extra.summary ?? title,
  };
}

function page(kind, title, text, extra = {}) {
  return {
    kind,
    title,
    speaker: extra.speaker ?? null,
    subtitle: extra.subtitle ?? null,
    text: Array.isArray(text) ? text : [text],
  };
}

export const LOCATION_SCENES = [
  scene(
    'carbo-church-opening',
    'carbo_contract',
    'carbo_church',
    'Песнь Елены в церкви Карбо',
    'Church of Granas',
    [
      page('narration', 'Тихая церковь перед разломом', [
        'В оригинальной Grandia II Карбо сначала должен ощущаться почти обманчиво спокойным местом: деревня, церковь, песня, контракт. Мир ещё не выглядит сломанным.',
      ]),
      page('dialogue', 'Елена поёт в тишине', 'Её голос заполняет церковь так, будто зло действительно можно удержать одной лишь верой.', { speaker: 'Narration' }),
      page('dialogue', 'Рюдо', 'Слишком чисто для работы геохаунда. Обычно после таких песен сразу начинается что-то плохое.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_carbo_church_opening'],
      summary: 'Открывающая церковная сцена в Карбо.',
    },
  ),
  scene(
    'carbo-store-tutorial-hush',
    'carbo_contract',
    'carbo_store',
    'Лавка, где мир ещё кажется простым',
    'Carbo General Store',
    [
      page('narration', 'Последняя нормальность перед трещиной', [
        'В самом начале Grandia II магазин в Карбо — это почти мирный JRPG-жест: закупка, обучение, бытовой шум. Именно поэтому он так важен как контраст к тому, что сломается дальше.',
      ]),
      page('dialogue', 'Narration', 'Пока деревня ещё думает о снаряжении и мелких покупках, никто не понимает, насколько близко уже подошла большая беда.', { speaker: 'Narration' }),
    ],
    {
      grantsFlags: ['flag_scene_carbo_store_hush'],
      summary: 'Мирный бытовой тон старта в магазине Карбо.',
    },
  ),
  scene(
    'carbo-inn-contract',
    'carbo_contract',
    'carbo_inn',
    'Контракт у Кариуса',
    'Carbo Inn',
    [
      page('dialogue', 'Кариус не просит веры, он просит результата', 'Кариус прямо переводит разговор из церковной просьбы в профессиональный контракт для геохаунда.', { speaker: 'Narration' }),
      page('dialogue', 'Кариус', 'Доведи Елену до Гармии. Пока она жива, у этого мира остаётся хотя бы один шанс.', { speaker: 'Father Carius' }),
      page('dialogue', 'Рюдо', 'Если работа платит и цель ещё дышит — значит, договорились.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_carbo_inn_contract'],
      summary: 'Сцена заключения контракта в трактире Карбо.',
    },
  ),
  scene(
    'carbo-house-farewell',
    'carbo_contract',
    'carbo_house_2',
    'Обычный дом, из которого путь уже выглядит иначе',
    'Carbo House',
    [
      page('narration', 'Тихая жизнь, которую партия оставляет позади', [
        'Чтобы вступление в Grandia II звучало по-оригинальному, Карбо должен дать не только церковь и трактир, но и короткий взгляд на обычную мирную жизнь, ради которой вообще имеет смысл идти дальше.',
      ]),
      page('dialogue', 'Narration', 'В маленьком доме слышно не пророчество и не войну, а простую тревогу людей, которые ещё надеются, что большая беда пройдёт мимо их дверей.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Вот из-за таких комнат вся эта работа и перестаёт быть просто контрактом.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_carbo_house_farewell'],
      summary: 'Карбо получает ещё один тихий бытовой штрих перед выходом.',
    },
  ),
  scene(
    'carbo-night-prelude',
    'millenia_first_attack',
    'carbo_inn',
    'Тревожная ночь в Карбо',
    'Carbo Inn at night',
    [
      page('narration', 'Ночь перестаёт быть безопасной', [
        'В оригинальном ритме Grandia II эта ночь нужна как перелом: деревня уже не стартовый хаб, а место, которое ждёт вторжения.',
      ]),
      page('dialogue', 'Скай', 'Слишком тихо. Даже для деревни после катастрофы. Не люблю такую тишину.', { speaker: 'Skye' }),
      page('dialogue', 'Елена', 'Будто кто-то стоит за окном и ждёт, когда мы погасим свет.', { speaker: 'Elena' }),
    ],
    {
      requiresFlags: ['flag_carbo_departure'],
      grantsFlags: ['flag_scene_carbo_night_prelude'],
      summary: 'Ночная прелюдия перед атакой Миллении.',
    },
  ),
  scene(
    'agear-inn-collapse',
    'agear_roan',
    'agear_inn',
    'Разбитый Агир',
    'Agear Inn',
    [
      page('narration', 'Город, в котором уже поздно притворяться', [
        'Агир должен ощущаться как первая большая человеческая трещина на дороге: здесь уже видно, что зло бьёт не по ритуалам, а по обычной жизни.',
      ]),
      page('dialogue', 'Вайкс', 'Мы уже не про торговлю и постояльцев думаем. Мы думаем, кто доживёт до следующего утра.', { speaker: 'Vyx' }),
      page('dialogue', 'Рюдо', 'Значит, церковная прогулка кончилась. Началась нормальная работа.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_agear_inn_collapse'],
      summary: 'Сцена, где Агир ощущается настоящей жертвой катастрофы.',
    },
  ),
  scene(
    'liligue-inn-gilded-pause',
    'liligue_and_mareg',
    'liligue_inn',
    'Тёплый вечер Лилига перед спуском под город',
    'Liligue Inn',
    [
      page('narration', 'Город ещё умеет казаться богатым и живым', [
        'В Лилиге важен не только спуск к Языку Вальмара, но и короткая пауза наверху: дорогая обстановка, людской шум и ощущение, что под полом уже лежит древняя гниль.',
      ]),
      page('dialogue', 'Elena', 'Даже здесь люди стараются жить как обычно. Наверное, именно это и страшнее всего.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'Чем громче город делает вид, что всё в порядке, тем охотнее я смотрю, что у него спрятано в подвале.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_liligue_inn_evening'],
      summary: 'Лилиг получает тихую бытовую паузу перед руинами.',
    },
  ),
  scene(
    'liligue-engineer-bench',
    'liligue_and_mareg',
    'liligue_engineer_house',
    'Инженерный дом и город, который чинит не то',
    'Engineers House',
    [
      page('narration', 'Техника как маска беспомощности', [
        'Инженеры Лилига бесконечно спорят о поломках, давлении и выгоде, но никто из них не умеет починить саму причину порчи под городом.',
      ]),
      page('dialogue', 'Narration', 'Город привык решать проблемы шестернями и расчётами. Именно поэтому древнее зло под ним так долго оставалось без настоящего имени.', { speaker: 'Narration' }),
      page('dialogue', 'Mareg', 'Когда зверь под землёй дышит, поздно спорить о цене деталей.', { speaker: 'Mareg' }),
    ],
    {
      requiresFlags: ['flag_scene_liligue_inn_evening'],
      grantsFlags: ['flag_scene_liligue_engineer_bench'],
      summary: 'Инженерный быт Лилига превращается в сюжетную ступень к руинам.',
    },
  ),
  scene(
    'liligue-gadan-lore',
    'liligue_and_mareg',
    'liligue_gadan_house',
    'Дом Гадана и страх под городом',
    'Liligue City',
    [
      page('narration', 'Лилиг живёт торговлей, но говорит уже языком скрытого страха', [
        'Под роскошью и инженерной суетой Лилига должен чувствоваться другой сюжет: под городом есть древняя язва, которую уже невозможно не признать.',
      ]),
      page('dialogue', 'Gadan', 'Если под городом и правда шевелится часть Вальмара, то вы пришли слишком поздно — или как раз вовремя.', { speaker: 'Gadan' }),
      page('dialogue', 'Mareg', 'Если это плоть Вальмара, она больше не уйдёт от охоты.', { speaker: 'Mareg' }),
    ],
    {
      grantsFlags: ['flag_scene_liligue_gadan'],
      summary: 'Лилиг как переход от городской суеты к руинам и Вальмару.',
    },
  ),
  scene(
    'mirumu-inn-whispers',
    'st_heim_zera',
    'mirumu_inn',
    'Таверна Мирумы как дом усталого страха',
    'Mirumu Inn',
    [
      page('narration', 'Слухи звучат тише молитв, но честнее', [
        'Мирума особенно хорошо работает в тех quiet-сценах, где люди уже почти перестали надеяться и потому говорят правду без церковной позолоты.',
      ]),
      page('dialogue', 'Narration', 'Даже у печи люди разговаривают так, будто в комнате может стоять не сосед, а чьё-то невидимое осуждение.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Если целая деревня шепчет, значит кто-то слишком долго заставлял её молчать.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_mirumu_inn_whispers'],
      summary: 'Мирума получает quiet-сцену перед дорогой в St. Heim.',
    },
  ),
  scene(
    'mirumu-sandra-fear',
    'st_heim_zera',
    'mirumu_sandra_house',
    'Дом Сандры как личное лицо эпидемии',
    'Sandra\'s House',
    [
      page('narration', 'Беда, которая уже слишком близко', [
        'Через дом Сандры история Мирумы перестаёт быть абстрактной деревенской проблемой и становится личной бедой конкретной семьи.',
      ]),
      page('dialogue', 'Sandra', 'Когда ребёнок страдает, уже неважно, как красиво это назовут жрецы. Для матери это просто ужас.', { speaker: 'Sandra' }),
      page('dialogue', 'Elena', 'Если вера вообще чего-то стоит, она должна помогать живым людям, а не только словам о спасении.', { speaker: 'Elena' }),
    ],
    {
      summary: 'Мирума как личная, семейная трагедия, а не только village quest.',
    },
  ),
  scene(
    'mirumu-hall-pressure',
    'st_heim_zera',
    'mirumu_town_hall',
    'Общий дом под церковным нажимом',
    'Mirumu Town Hall',
    [
      page('narration', 'Общественное место как комната осады', [
        'Town Hall в Мируме должен ощущаться не как формальная civic-точка, а как место, где деревня уже говорит языком страха и вынужденного подчинения.',
      ]),
      page('dialogue', 'Narration', 'Даже общие разговоры здесь звучат не как спор соседей, а как шёпот людей, которые слишком устали, чтобы спорить с религиозной властью.', { speaker: 'Narration' }),
    ],
    {
      summary: 'Town Hall как комната давления и коллективного страха.',
    },
  ),
  scene(
    'stheim-inn-arrival',
    'st_heim_zera',
    'st_heim_inn',
    'Первая ночь в святом городе',
    'St. Heim Inn',
    [
      page('narration', 'Комфорт, который слишком идеально выстроен', [
        'В оригинальном pacing St. Heim важен не только собор, но и сама первая ночь в городе: безопасная снаружи и подозрительно выверенная изнутри.',
      ]),
      page('dialogue', 'Elena', 'Здесь всё должно было успокаивать. Но почему-то мне кажется, что нас уже расставили по местам.', { speaker: 'Elena' }),
      page('dialogue', 'Skye', 'Потому что так и есть. Когда хозяин слишком вежлив, смотри не на улыбку, а на замки.', { speaker: 'Skye' }),
    ],
    {
      requiresFlags: ['flag_stheim_inn_stay'],
      grantsFlags: ['flag_scene_stheim_inn_arrival'],
      summary: 'Ночёвка в St. Heim отделяется от самой аудиенции.',
    },
  ),
  scene(
    'stheim-first-audience',
    'st_heim_zera',
    'st_heim_audience_chamber',
    'Первая аудиенция у Зеры',
    'Audience Chamber',
    [
      page('narration', 'Священная позолота как политическая сцена', [
        'В оригинальной Grandia II Зера сначала не раскрывается как злодей. Он появляется как идеально отполированный авторитет, который уже слишком гладок, чтобы быть честным.',
      ]),
      page('dialogue', 'Zera', 'Если вы хотите спасти мир и Елену, найдите Гранасабер. Иного пути нет.', { speaker: 'Zera' }),
      page('dialogue', 'Рюдо', 'Когда человек в золоте говорит “иного пути нет”, я обычно жду, когда он скажет, кому именно этот путь выгоден.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_stheim_first_audience'],
      summary: 'Первая аудиенция у Зеры как политический театр.',
    },
  ),
  scene(
    'stheim-library-doubt',
    'st_heim_zera',
    'st_heim_library',
    'Библиотека как первая трещина в догме',
    'St. Heim Library',
    [
      page('narration', 'Тихое место, где фасад начинает ломаться', [
        'Библиотека в St. Heim важна не как просто lore-room, а как место, где церковная версия мира впервые начинает звучать подозрительно даже без прямого разоблачения.',
      ]),
      page('dialogue', 'Roan', 'Чем больше читаешь, тем чаще видишь не ответы, а пропуски.', { speaker: 'Roan' }),
      page('dialogue', 'Mareg', 'Если правда пахнет так слабо, значит, её слишком долго прятали.', { speaker: 'Mareg' }),
    ],
    {
      requiresFlags: ['flag_stheim_first_audience'],
      grantsFlags: ['flag_scene_stheim_library_doubt'],
      summary: 'Сцена сомнения в библиотеке St. Heim.',
    },
  ),
  scene(
    'stheim-guestroom-evening',
    'st_heim_zera',
    'st_heim_guestroom',
    'Гостевая комната как вечер перед большим обманом',
    'Cathedral Guestroom',
    [
      page('narration', 'Тишина между аудиенциями', [
        'В оригинальном pacing St. Heim должен давать не только торжественные залы, но и комнаты ожидания — места, где партия успевает почувствовать напряжение между официальной позолотой и растущим недоверием.',
      ]),
      page('dialogue', 'Ryudo', 'Чем мягче у них кровати, тем сильнее мне хочется спать в доспехах.', { speaker: 'Ryudo' }),
      page('dialogue', 'Mareg', 'Слабый дом прячет силу за золотом. Сильный дом не нуждается в такой позолоте.', { speaker: 'Mareg' }),
    ],
    {
      requiresFlags: ['flag_stheim_first_audience'],
      grantsFlags: ['flag_scene_stheim_guestroom_evening'],
      summary: 'St. Heim через quiet room tension.',
    },
  ),
  scene(
    'stheim-bakery-facade',
    'st_heim_zera',
    'st_heim_bakery',
    'Маленькая пекарня под слишком большим церковным фасадом',
    'St. Heim Bakery',
    [
      page('narration', 'Быт, который делает будущий крах больнее', [
        'Для правильного ощущения St. Heim нужен не только собор. Нужны и маленькие мирные комнаты города, чтобы позднее разоблачение Зеры ломало не абстрактный институт, а привычную человеческую жизнь.',
      ]),
      page('dialogue', 'Elena', 'Странно… здесь пахнет хлебом и обычным утром, но город всё равно будто боится сам себя.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'Когда фасад слишком святой, даже тёплый хлеб кажется частью декорации.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_scene_stheim_inn_arrival'],
      grantsFlags: ['flag_scene_stheim_bakery_facade'],
      summary: 'St. Heim получает бытовую паузу перед второй фазой cathedral chain.',
    },
  ),
  scene(
    'cyrum-inn-evening',
    'cyrum_and_claws',
    'cyrum_inn',
    'Ночь в Цайруме как пауза перед вскрытием правды',
    'Cyrum Inn',
    [
      page('narration', 'Гостеприимство перед скрытым подвалом мира', [
        'В Цайруме важно, что до завода и Когтей Вальмара город ещё выглядит цивилизованным и почти тёплым. Именно это делает скрытую правду сильнее.',
      ]),
      page('dialogue', 'Roan', 'Я всегда знал этот город как дом. Хуже всего понять, что дом может скрывать такое годами.', { speaker: 'Roan' }),
    ],
    {
      requiresFlags: ['flag_cyrum_inn'],
      grantsFlags: ['flag_scene_cyrum_inn_evening'],
      summary: 'Цайрум как тёплый хаб перед техно-ужасом.',
    },
  ),
  scene(
    'cyrum-square-mask',
    'cyrum_and_claws',
    'cyrum_castle_square',
    'Площадь как маска мирной столицы',
    'Cyrum Castle Square',
    [
      page('narration', 'Праздник поверх тайны', [
        'Цайрум должен ощущаться как город, который ещё умеет казаться нормальным, даже когда под ним уже работает совсем другая история.',
      ]),
      page('dialogue', 'Narration', 'Шатры, игры и суета не скрывают того, что под дворцом лежит завод и ещё одна рана мира.', { speaker: 'Narration' }),
      page('dialogue', 'Tio', 'Поверхностная активность города не соответствует данным о скрытых энергетических структурах под замком.', { speaker: 'Tio' }),
    ],
    {
      grantsFlags: ['flag_scene_cyrum_square_mask'],
      summary: 'Цайрум как праздничная маска над скрытым заводом.',
    },
  ),
  scene(
    'cyrum-kings-burden',
    'cyrum_and_claws',
    'cyrum_kings_chamber',
    'Покои короля и вес, который падает на Роана',
    'Kings Chamber',
    [
      page('narration', 'Личный долг посреди государственной лжи', [
        'Покои правителя нужны не только для лора. Они показывают, что линия Роана — это не side note, а человеческий центр всей арки Цайрума.',
      ]),
      page('dialogue', 'Roan', 'Если во дворце прятали такое, значит и мой титул всё это время стоял на чужой тени.', { speaker: 'Roan' }),
      page('dialogue', 'Ryudo', 'Титул тут ни при чём. Важно, что ты сделаешь, когда правда уже перестанет быть удобной.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_cyrum_juice'],
      grantsFlags: ['flag_scene_cyrum_kings_burden'],
      summary: 'Личная сцена Роана в замковых покоях.',
    },
  ),
  scene(
    'cyrum-port-departure',
    'cyrum_and_claws',
    'cyrum_port',
    'Порт как граница между столицей и тайной',
    'Cyrum Port',
    [
      page('narration', 'У самого края дворцовой нормальности', [
        'Порт в Цайруме важен как граница: ещё шаг — и городской сюжет превращается в вторжение в скрытое тело государства.',
      ]),
      page('dialogue', 'Tio', 'Наблюдение: поверхность государства и глубинная инфраструктура противоречат друг другу по всем ключевым параметрам.', { speaker: 'Tio' }),
    ],
    {
      summary: 'Порт как переход из city script в infiltration script.',
    },
  ),
  scene(
    'garlan-house-pressure',
    'garlan_return',
    'ryudo_house',
    'Дом Рюдо как незажившая рана',
    'Ryudo\'s House',
    [
      page('narration', 'Не убежище, а рана', [
        'Дом Рюдо в оригинальной истории должен сжимать, а не успокаивать. Это место, где прошлое не вспоминается, а давит физически.',
      ]),
      page('dialogue', 'Skye', 'Ты можешь сколько угодно говорить, что тебя это больше не держит. Но стены знают, где ты врёшь.', { speaker: 'Skye' }),
      page('dialogue', 'Ryudo', 'Хорошо. Тогда пусть стены досмотрят это до конца вместе со мной.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_garlan_house_pressure'],
      summary: 'Дом Рюдо как эмоциональный узел арки Гарана.',
    },
  ),
  scene(
    'garlan-chief-resentment',
    'garlan_return',
    'garlan_chief_house',
    'Дом старосты и деревня, которая не простила',
    'Village Chief\'s House',
    [
      page('narration', 'Возвращение без права на уют', [
        'Для верности оригиналу Гарлан должен не просто помнить Рюдо, а держать его на расстоянии. Даже официальные разговоры тут звучат как приговор, отложенный на годы.',
      ]),
      page('dialogue', 'Narration', 'Старые люди помнят не подвиги, а похороны. И потому каждое слово здесь тяжелее обычной деревенской вежливости.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Не надо делать вид, что я пришёл за прощением. Я пришёл закончить то, что давно висит над всеми нами.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_garlan_past'],
      grantsFlags: ['flag_scene_garlan_chief_resentment'],
      summary: 'Гарлан усиливает мотив вины перед ночёвкой.',
    },
  ),
  scene(
    'garlan-store-cold-trade',
    'garlan_return',
    'garlan_store',
    'Даже торговля в Гарлане звучит как старая обида',
    'Garlan General Store',
    [
      page('narration', 'Обычная лавка без обычного тепла', [
        'Для верности оригинальному возвращению в Гарлан даже бытовые комнаты должны держать дистанцию от Рюдо. Здесь никто не встречает его как дома — даже если разговор начинается с припасов.',
      ]),
      page('dialogue', 'Narration', 'Продавец говорит о ценах и еде, но за каждым словом всё равно слышно старое нежелание подпускать Рюдо слишком близко.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Понимаю. Можно не улыбаться. Мне от этого и самому легче.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_garlan_past'],
      grantsFlags: ['flag_scene_garlan_store_cold_trade'],
      summary: 'Возвращение в Гарлан получает ещё одну бытовую, но холодную паузу.',
    },
  ),
  scene(
    'garlan-tombs-grief',
    'garlan_return',
    'garlan_tombs',
    'Могилы как место, где Гарлан перестаёт быть просто деревней',
    'Village Tombs',
    [
      page('narration', 'Память, которая не даёт отступить', [
        'Могилы в Гарлане нужны не как лишняя scenic-точка, а как место, где история Рюдо перестаёт быть рассказом и снова становится личной раной.',
      ]),
      page('dialogue', 'Skye', 'Память не отпускает, пока её не досмотрят до конца.', { speaker: 'Skye' }),
    ],
    {
      summary: 'Гарлан как память и утрата.',
    },
  ),
  scene(
    'grail-vow-before-climb',
    'melfice_duel',
    'grail_mountain',
    'Подъём, после которого уже нельзя врать себе',
    'Grail Mountain',
    [
      page('narration', 'Гора сужает мир до одной личной задачи', [
        'Подъём к Грайлу важен тем, что постепенно вычищает из маршрута всё лишнее. Остаются только Рюдо, память о Мелфисе и неизбежность встречи.',
      ]),
      page('dialogue', 'Elena', 'Чем выше мы поднимаемся, тем меньше остаётся слов, которые можно сказать вместо правды.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'И отлично. Значит, на вершину не дотащится ни одна лишняя ложь.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_garlan_night'],
      grantsFlags: ['flag_scene_grail_vow'],
      summary: 'Подъём к Грайлу превращается в отдельную драматическую ступень.',
    },
  ),
  scene(
    'plateau-before-duel',
    'melfice_duel',
    'plateau_of_memories',
    'Плато молчит так, будто уже знает исход',
    'Plateau of Memories',
    [
      page('narration', 'Тишина перед личной казнью прошлого', [
        'До самой дуэли Плато воспоминаний должно дать одну короткую паузу: место, где прошлое больше не преследует Рюдо издалека, а становится почти осязаемым.',
      ]),
      page('dialogue', 'Skye', 'Здесь даже ветер говорит старым голосом.', { speaker: 'Skye' }),
      page('dialogue', 'Ryudo', 'Пусть. Я слишком долго шёл сюда, чтобы опять от него отворачиваться.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_grail_shrine'],
      grantsFlags: ['flag_scene_plateau_hush'],
      summary: 'Перед дуэлью появляется quiet beat на самом плато.',
    },
  ),
  scene(
    'nanan-inn-edge-rest',
    'nanan_and_cyclone',
    'nanan_inn',
    'Последний отдых перед краем мира',
    'Nanan Inn',
    [
      page('narration', 'Ночёвка перед бурей', [
        'Нанан должен ощущаться как последняя человеческая пауза перед storm / rift / Granasaber escalation. Поэтому даже inn здесь работает не как отдых, а как задержанный вдох.',
      ]),
      page('dialogue', 'Mareg', 'После этой ночи начинается путь, где дом уже останется позади даже в памяти.', { speaker: 'Mareg' }),
    ],
    {
      summary: 'Inn в Нанане как последний человеческий привал.',
    },
  ),
  scene(
    'nanan-clan-council',
    'nanan_and_cyclone',
    'nanan_store',
    'Северный склад как совет перед Разломом',
    'Nanan General Store',
    [
      page('narration', 'Даже лавка звучит как пограничный пост', [
        'В Нанане магазин важен не покупками, а тем, что здесь люди говорят уже не о быте, а о подготовке к дороге, с которой можно не вернуться прежними.',
      ]),
      page('dialogue', 'Narration', 'Разговоры о припасах здесь всегда переходят в разговоры о долге, клане и цене, которую Марег однажды уже выбрал заплатить.', { speaker: 'Narration' }),
      page('dialogue', 'Mareg', 'Край мира не любит тех, кто идёт без решимости. Запомните это до Разлома.', { speaker: 'Mareg' }),
    ],
    {
      requiresFlags: ['flag_nanan_edge'],
      grantsFlags: ['flag_scene_nanan_clan_council'],
      summary: 'Нанан получает ещё одну клановую паузу перед Great Rift.',
    },
  ),
  scene(
    'great-rift-abyss-threshold',
    'nanan_and_cyclone',
    'great_rift',
    'Разлом как переход за пределы обычного мира',
    'The Great Rift',
    [
      page('narration', 'География начинает спорить с человеком', [
        'Great Rift должен ощущаться не как просто dangerous path, а как место, где сам мир будто сопротивляется правде, к которой идёт партия.',
      ]),
      page('dialogue', 'Ryudo', 'Если дорога выглядит так, будто сама не хочет нас пропускать, значит мы идём в правильную сторону.', { speaker: 'Ryudo' }),
    ],
    {
      summary: 'Great Rift как граница между старым языком мира и древней правдой.',
    },
  ),
  scene(
    'demons-law-machine-awe',
    'granasaber_ship',
    'demons_law',
    'Древняя машина как предисловие к Гранасаберу',
    'Demon\'s Law',
    [
      page('narration', 'Не руины, а работающая чужая система', [
        'Demons Law важен тем, что ломает привычный fantasy-язык. Здесь партия уже не просто в древнем месте — она внутри системы, чей масштаб и логика намного старше церковных мифов.',
      ]),
      page('dialogue', 'Tio', 'Это не святыня. Это инфраструктура.', { speaker: 'Tio' }),
    ],
    {
      grantsFlags: ['flag_scene_demons_law_console'],
      summary: 'Demons Law как точка перехода к техно-правде мира.',
    },
  ),
  scene(
    'cathedral-massacre-entry',
    'cathedral_massacre',
    'st_heim_cathedral_lobby',
    'Собор, в который уже вошла бойня',
    'Late St. Heim',
    [
      page('narration', 'Город света перевёрнут наизнанку', [
        'Поздний собор St. Heim должен ощущаться как место, где сама идея святости уже сгнила и превратилась в удобную сцену для резни.',
      ]),
      page('dialogue', 'Elena', 'Если здесь ещё осталось хоть что-то святое, то только то, что люди всё ещё не перестали бояться и молиться.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'Тогда пусть их страх закончится на нас, а не на тех, кто уже лежит на полу.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_cathedral_massacre_entry'],
      summary: 'Late St. Heim как точка без возврата.',
    },
  ),
  scene(
    'stheim-audience-ruin',
    'zera_revealed',
    'st_heim_audience_chamber',
    'Аудиенционный зал после падения маски',
    'Audience Chamber Ruins',
    [
      page('narration', 'Тот же зал, но уже без святой роли', [
        'Для финальной точности St. Heim должен показать, как один и тот же зал меняет смысл между первой аудиенцией и поздним возвратом: больше нет церемонии, есть только оголённая власть.',
      ]),
      page('dialogue', 'Narration', 'Там, где раньше звучали благословения, теперь слышно только эхо приказов и слишком позднего ужаса.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Ну вот. Золото смыли, и под ним наконец показалась настоящая морда.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_stheim_massacre_entry'],
      grantsFlags: ['flag_scene_stheim_audience_ruin'],
      summary: 'Поздний Audience Chamber получает собственную сцену разоблачения.',
    },
  ),
  scene(
    'zera-room-truth',
    'zera_revealed',
    'zera_room',
    'Комната Зеры как кабинет тщательно упакованной лжи',
    'Pope Zera\'s Room',
    [
      page('narration', 'Личная комната как политическая улика', [
        'Кабинет Зеры работает не как случайный интерьер, а как место, где частная аккуратность злодея только сильнее подчёркивает масштаб его публичной лжи.',
      ]),
      page('dialogue', 'Elena', 'Он столько лет говорил от имени света… а жил среди вещей, где каждая деталь была рассчитана на управление.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'Хороший запах, чистые стены, удобные книги. Ложь всегда любит порядок, когда ей есть что прятать.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_scene_stheim_audience_ruin'],
      grantsFlags: ['flag_scene_zera_room_truth'],
      summary: 'Комната Зеры становится обязательной поздней уликой перед reveal.',
    },
  ),
  scene(
    'moon-womb-threshold',
    'moon_assault',
    'valmars_womb',
    'Чрево Луны как внутренняя кульминация штурма',
    'Valmar\'s Womb',
    [
      page('narration', 'Осада перестаёт быть дорогой и становится ценой', [
        'К этой точке Moon assault уже должен ощущаться не как ещё один late dungeon, а как место, где сам поход требует жертвы и полного отказа от пути назад.',
      ]),
      page('dialogue', 'Narration', 'Здесь фронт становится личным, и любая победа уже звучит как что-то, купленное слишком дорогой ценой.', { speaker: 'Narration' }),
    ],
    {
      summary: 'Valmar\'s Womb как внутренняя кульминация штурма.',
    },
  ),
  scene(
    'cyrum-front-command',
    'cyrum_defense',
    'cyrum_kingdom_south',
    'Южный фронт как короткий совет перед обороной',
    'Cyrum South Front',
    [
      page('narration', 'У города больше нет роскоши на дистанцию', [
        'Поздний Цайрум должен звучать иначе ещё до входа в столицу. На южном фронте видно, что война уже добралась до самой структуры повседневной жизни.',
      ]),
      page('dialogue', 'Roan', 'Если я войду в город как принц, а не как человек, который готов его удерживать, то титул только помешает.', { speaker: 'Roan' }),
      page('dialogue', 'Tio', 'Рекомендация: перейти из режима реакции в режим командования до входа в столицу.', { speaker: 'Tio' }),
    ],
    {
      grantsFlags: ['flag_scene_cyrum_front_command'],
      summary: 'Появляется отдельная фронтовая сцена перед поздним Цайрумом.',
    },
  ),
  scene(
    'cyrum-war-room-late',
    'cyrum_defense',
    'cyrum_kingdom',
    'Цайрум как военный тыл',
    'Late Cyrum',
    [
      page('narration', 'Столица, которая теперь живёт войной', [
        'Поздний Цайрум уже нельзя читать как “тот же город, просто позже”. Это другой режим мира: мобилизация, срочность, выживание.',
      ]),
      page('dialogue', 'Roan', 'Теперь я уже не мальчик, которого прятали за титулом. Теперь, если город падёт, он падёт и на моей совести тоже.', { speaker: 'Roan' }),
      page('dialogue', 'Tio', 'Текущий статус города: не столица мира, а временный штаб сопротивления.', { speaker: 'Tio' }),
    ],
    {
      grantsFlags: ['flag_scene_cyrum_war_room'],
      summary: 'Цайрум как поздний военный хаб.',
    },
  ),
  scene(
    'birthplace-truth-hall',
    'birthplace_descent',
    'birthplace_of_the_gods',
    'Зал, где мифология перестаёт работать',
    'Birthplace of the Gods',
    [
      page('narration', 'Древний мир без церковной маски', [
        'Исток богов важен именно как место, где догма уже не может объяснить происходящее. Здесь остаётся только древняя реальность, слишком большая для религиозной сказки.',
      ]),
      page('dialogue', 'Elena', 'Если правда настолько стара и настолько искажена… значит, весь мир жил внутри чужого пересказа.', { speaker: 'Elena' }),
      page('dialogue', 'Ryudo', 'Хорошо. Тогда мы дойдём до той правды, которую уже нельзя будет переписать.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_birthplace_truth_hall'],
      summary: 'Birthplace of the Gods как полный разрыв с церковной версией мира.',
    },
  ),
  scene(
    'birthplace-blue-archive',
    'birthplace_descent',
    'birthplace_of_the_gods',
    'Синий архив и первая послушная машина древнего мира',
    'Blue Mechanism Hall',
    [
      page('narration', 'Истина отвечает не словами, а системой', [
        'После первого механизма Исток богов должен раскрывать себя дальше не монолитной локацией, а серией смысловых комнат, где древняя система будто постепенно допускает партию к настоящей истории.',
      ]),
      page('dialogue', 'Tio', 'Подтверждение: этот комплекс не поклоняется богам. Он исполняет протоколы.', { speaker: 'Tio' }),
    ],
    {
      requiresFlags: ['flag_birthplace_blue'],
      grantsFlags: ['flag_scene_birthplace_blue'],
      summary: 'Синий механизм получает отдельную room-scene.',
    },
  ),
  scene(
    'birthplace-yellow-archive',
    'birthplace_descent',
    'birthplace_of_the_gods',
    'Жёлтый узел и мир, который уже невозможно собрать обратно в догму',
    'Yellow Mechanism Hall',
    [
      page('narration', 'Чем глубже, тем меньше остаётся места для старой веры', [
        'Вторая поздняя комната Истока богов нужна, чтобы древняя правда не свалилась на игрока одним блоком, а раскрывалась ступенями — почти как серия обвинений против всей официальной истории мира.',
      ]),
      page('dialogue', 'Elena', 'Если церковь и правда знала хотя бы часть этого, то она защищала не людей. Она защищала удобный страх.', { speaker: 'Elena' }),
    ],
    {
      requiresFlags: ['flag_birthplace_yellow'],
      grantsFlags: ['flag_scene_birthplace_yellow'],
      summary: 'Жёлтый механизм получает отдельный этап драматургии.',
    },
  ),
  scene(
    'room-of-chaos-false-face',
    'zera_inside_valmar',
    'new_valmar_room_of_chaos',
    'Комната Хаоса как зал ложных лиц',
    'Room of Chaos',
    [
      page('narration', 'Последняя ложь перед ядром', [
        'Room of Chaos должна ощущаться не как ещё одна поздняя арена, а как зал, где Зера пытается сломать не тела, а восприятие — подменой, ложью и усталостью.',
      ]),
      page('dialogue', 'Zera', 'Человек ломается не от силы. Человек ломается, когда начинает сомневаться, что вообще видел правду.', { speaker: 'Zera' }),
      page('dialogue', 'Ryudo', 'Тогда тебе не повезло. Мы уже слишком далеко, чтобы снова перепутать боль с истиной.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_room_of_chaos_false_face'],
      summary: 'Room of Chaos как последняя психологическая ловушка.',
    },
  ),
  scene(
    'room-of-chaos-echo',
    'zera_inside_valmar',
    'new_valmar_room_of_chaos',
    'Эхо лжи, которое пытается говорить голосами партии',
    'Room of Chaos Echo',
    [
      page('narration', 'Вражеская идеология становится почти интимной', [
        'Для последней room-by-room parity одной сцены в Room of Chaos мало. Нужен ещё короткий удар, где ложь Зеры пытается не напугать, а переозвучить самих героев.',
      ]),
      page('dialogue', 'Narration', 'Комната отвечает знакомыми голосами, но в каждом из них уже чувствуется чужая расстановка воли и вины.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Можешь хоть всю комнату набить нашими лицами. Правды там всё равно не прибавится.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_scene_room_of_chaos_false_face'],
      grantsFlags: ['flag_scene_room_of_chaos_echo'],
      summary: 'Комната Хаоса получает второй удар перед поздним setpiece.',
    },
  ),
  scene(
    'new-valmar-entry-breath',
    'zera_inside_valmar',
    'new_valmar',
    'Вход в Новый Вальмар как вход в живую ложь',
    'New Valmar',
    [
      page('narration', 'Не данж, а аргумент врага', [
        'Новый Вальмар должен ощущаться не просто как финальный коридор, а как целый аргумент Зеры: живой, органический и пытающийся навязать партии мысль, что человек не справится без хозяина.',
      ]),
      page('dialogue', 'Ryudo', 'Чем больше эта штука хочет казаться богом, тем охотнее я буду резать её как мясо.', { speaker: 'Ryudo' }),
    ],
    {
      grantsFlags: ['flag_scene_new_valmar_vein_whisper'],
      summary: 'Вход в Новый Вальмар как вход в живую идеологическую ловушку.',
    },
  ),
  scene(
    'new-valmar-vein-choir',
    'zera_inside_valmar',
    'new_valmar',
    'Живые стены начинают говорить уже не образами, а хором',
    'New Valmar Veins',
    [
      page('narration', 'Ложь становится навязчивее по мере продвижения', [
        'После первого входа Новый Вальмар должен усиливать давление не только видом, но и ритмом. Следующая комната уже не просто пугает — она пытается переозвучить саму волю партии и растворить её в общем хоре чужой необходимости.',
      ]),
      page('dialogue', 'Narration', 'Органические стены отвечают эхом так, будто весь данж повторяет одну и ту же мысль: человеку нужен хозяин, а не выбор.', { speaker: 'Narration' }),
      page('dialogue', 'Ryudo', 'Чем громче эта дрянь проповедует, тем яснее мне, куда именно бить.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_scene_new_valmar_vein_whisper'],
      grantsFlags: ['flag_scene_new_valmar_vein_choir'],
      summary: 'Новый Вальмар получает ещё одну ступень живой идеологической атаки.',
    },
  ),
  scene(
    'new-valmar-core-threshold',
    'true_finale',
    'new_valmar_core',
    'Перед ядром мир уже не обещает ничего, кроме выбора',
    'New Valmar Core Threshold',
    [
      page('narration', 'Финальная дорога сжимается до одной идеи', [
        'Прямо перед ядром Новый Вальмар должен дать не только boss room, но и короткий коридор смысла: здесь уже не спорят о силе, здесь спорят о праве человека выбирать собственную судьбу.',
      ]),
      page('dialogue', 'Millenia', 'Вот и всё. Дальше уже нельзя будет свалить решение ни на богов, ни на чудовищ.', { speaker: 'Millenia' }),
    ],
    {
      requiresFlags: ['flag_new_valmar_chaos'],
      grantsFlags: ['flag_scene_new_valmar_core_threshold'],
      summary: 'Финальный коридор к ядру получает собственную сцену.',
    },
  ),
  scene(
    'new-valmar-core-judgement',
    'true_finale',
    'new_valmar_core',
    'Ядро как приговор ложным богам',
    'New Valmar Core',
    [
      page('narration', 'Финальная комната должна говорить сама', [
        'Ядро Нового Вальмара — это не просто “последний босс”. Это место, где весь спор Grandia II должен схлопнуться в один вывод: будущее не отдаётся богам, его берут люди.',
      ]),
      page('dialogue', 'Millenia', 'Если этот мир и останется кому-то, то не потому, что ему приказали жить. А потому, что он сам этого захотел.', { speaker: 'Millenia' }),
      page('dialogue', 'Ryudo', 'Значит, заканчиваем не просто врага. Заканчиваем саму привычку жить под чужой волей.', { speaker: 'Ryudo' }),
    ],
    {
      requiresFlags: ['flag_scene_new_valmar_core_threshold'],
      grantsFlags: ['flag_scene_new_valmar_core_judgement'],
      summary: 'Final core как идеологическая развязка.',
    },
  ),
];

export function locationScenesForBeatAndLocation(beatId, locationId) {
  return LOCATION_SCENES.filter((entry) => entry.beatId === beatId && entry.locationId === locationId);
}
