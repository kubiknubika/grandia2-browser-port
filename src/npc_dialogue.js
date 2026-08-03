// Optional NPC dialogue layer — room-specific side talk for the campaign.
// Each entry: { id, locationId, beatIds (optional whitelist), label, pages: [{speaker, text}], setFlags?, rewards? }
// This fills the "NPC optional dialogue / extra room conversations" script gap.

export const NPC_DIALOGUES = [
  {
    id: 'carbo-church-elder',
    locationId: 'carbo_church',
    label: 'Поговорить со старушкой у алтаря',
    pages: [
      { speaker: 'Пожилая прихожанка', text: 'Всю жизнь молюсь Граносу, сынок. Но сегодня даже молитва звучит как-то иначе — будто кто-то подпевает ей с той стороны.' },
      { speaker: 'Рюдо', text: 'Если подпевает — надеюсь, хотя бы в такт.' },
    ],
  },
  {
    id: 'carbo-store-merchant-tips',
    locationId: 'carbo_store',
    label: 'Расспросить торговца о травах',
    pages: [
      { speaker: 'Торговец', text: 'Корень жизни, семя магии — всё, что в дороге пригодится. Но запомни: в горах дороже всего не зелье, а запас терпения.' },
    ],
  },
  {
    id: 'carbo-inn-skye-rumor',
    locationId: 'carbo_inn',
    label: 'Спросить Ская о церковных заказах',
    pages: [
      { speaker: 'Скай', text: 'Церковные заказы бывают двух видов: те, где платят хорошо, и те, где платят плохо. Обычно одно переходит в другое к середине пути.' },
    ],
  },
  {
    id: 'black-forest-herbalist',
    locationId: 'black_forest',
    beatIds: ['garmia_failure'],
    label: 'Осмотреть следы на тропе',
    pages: [
      { speaker: 'Narration', text: 'Следы чудовищ идут прямо от башни. Рядом с ними — оброненный мешочек целебных трав, который кто-то потерял в спешке.' },
    ],
    rewards: { medicinalHerb: 1 },
  },
  {
    id: 'garmia-tower-watchman',
    locationId: 'garmia_tower',
    label: 'Найти записку смотрителя',
    pages: [
      { speaker: 'Narration', text: 'Помятая записка смотрителя: «Если сегодня ритуал сорвётся, бежать надо не вниз — а через окно на верхней площадке. Я пометил путь».' },
    ],
    setFlags: ['flag_garmia_window'],
  },
  {
    id: 'agear-vyx-confession',
    locationId: 'agear_inn',
    label: 'Выслушать Вайкса до конца',
    pages: [
      { speaker: 'Вайкс', text: 'Я видел, как этот мальчишка Роан уходил в пещеру. Хотел остановить — а рука не поднялась. Такая же гордость была у его отца.' },
    ],
  },
  {
    id: 'agear-refugee-flower',
    locationId: 'agear_town',
    label: 'Отдать припасы беженке',
    pages: [
      { speaker: 'Беженка', text: 'Спасибо тебе. Мы потеряли дом, но не потеряли память. Возьми орех — он согревает так же, как доброе слово.' },
    ],
    rewards: { poffNut: 1 },
  },
  {
    id: 'durham-cave-prospector',
    locationId: 'durham_cave_entrance',
    label: 'Поговорить со старателем',
    pages: [
      { speaker: 'Старатель', text: 'Раньше здесь искали руду. Теперь ищут то, что осталось от рудокопов. Если встретишь мою кирку — значит, я был слишком жадным.' },
    ],
  },
  {
    id: 'baked-plains-sandman-lore',
    locationId: 'baked_plains',
    beatIds: ['liligue_and_mareg'],
    label: 'Спросить о песчаных духах',
    pages: [
      { speaker: 'Путник', text: 'На раскалённых равнинах водятся песчаные духи. Они не убивают — они усыпляют, чтобы забрать у тебя то, что ты не успел защитить.' },
    ],
  },
  {
    id: 'liligue-engineer-story',
    locationId: 'liligue_engineer_house',
    label: 'Выслушать историю инженера',
    pages: [
      { speaker: 'Инженер', text: 'Мой дед строил skyway. Говорил, что камень помнит только то, что в него вложили. А под Лилигом вложили что-то очень старое и очень злое.' },
    ],
  },
  {
    id: 'liligue-gadan-final-warning',
    locationId: 'liligue_gadan_house',
    label: 'Спросить Гадана о языке Вальмара',
    pages: [
      { speaker: 'Гадан', text: 'Язык — это то, чем существо пьёт. Если Вальмар разевает пасть под городом, значит, он уже почувствовал, что здесь есть чем утолить голод.' },
    ],
  },
  {
    id: 'mirumu-healer-advice',
    locationId: 'mirumu_village',
    label: 'Поговорить с деревенской знахаркой',
    pages: [
      { speaker: 'Знахарка', text: 'Болезнь здесь не от холода. Холод — лишь одежда. Внутри людей что-то шепчет, и это что-то пришло снизу, из разлома.' },
    ],
  },
  {
    id: 'mirumu-shed-tools',
    locationId: 'mirumu_shed',
    label: 'Осмотреть инструменты в сарае',
    pages: [
      { speaker: 'Narration', text: 'Среди инструментов — верёвка, факел и мелок. Кто-то явно готовился спускаться в разлом и хотел уметь вернуться.' },
    ],
  },
  {
    id: 'stheim-attendant-secret',
    locationId: 'st_heim_inn',
    label: 'Шёпотом спросить служителя о Зере',
    pages: [
      { speaker: 'Служитель', text: 'Тише, прошу вас. Его Святейшество слышит даже эхо в этих стенах. Но если вы ищете правду — ищите не в зале, а в книгах, которые «потерялись».' },
    ],
  },
  {
    id: 'stheim-library-keeper',
    locationId: 'st_heim_library',
    label: 'Спросить библиотекаря о запретных книгах',
    pages: [
      { speaker: 'Библиотекарь', text: 'Вся история Граноса умещается в один том. Весь страх перед Вальмаром — в один абзац. А то, что между строк… я вам этого не говорил.' },
    ],
  },
  {
    id: 'stheim-pasture-shepherd',
    locationId: 'st_heim_pasture',
    label: 'Поговорить с пастухом',
    pages: [
      { speaker: 'Пастух', text: 'Животные чуют беду раньше людей. Сегодня стадо отказывается идти к собору. И, честно говоря, я их понимаю.' },
    ],
  },
  {
    id: 'cyrum-port-sailor-rumor',
    locationId: 'cyrum_port',
    label: 'Послушать моряцкую байку',
    pages: [
      { speaker: 'Моряк', text: 'Говорят, под дворцом стоит машина старше самого моря. И что принц об этом не знает. Хотя, глядя на него… может, и знает. Просто молчит.' },
    ],
  },
  {
    id: 'cyrum-kings-chamber-steward',
    locationId: 'cyrum_kings_chamber',
    label: 'Расспросить стюарда о короле',
    pages: [
      { speaker: 'Стюард', text: 'Его величество редко говорит о прошлом. Но когда смотрит на принца, в глазах у него — страх человека, который знает цену трона.' },
    ],
  },
  {
    id: 'garlan-tombs-gravekeeper',
    locationId: 'garlan_tombs',
    label: 'Выслушать смотрителя могил',
    pages: [
      { speaker: 'Смотритель', text: 'Здесь лежат те, кого деревня не смогла защитить. И один из них — тот, кого винят во всём. Скажу тебе: мёртвые винят меньше, чем живые.' },
    ],
  },
  {
    id: 'garlan-inn-old-friend',
    locationId: 'garlan_inn',
    beatIds: ['garlan_return'],
    label: 'Поговорить с ровесником Рюдо',
    pages: [
      { speaker: 'Ровесник', text: 'Мы играли вместе, когда были детьми. Потом случилось то, что случилось. Я не знаю, кто виноват. Но я знаю, что Рюдо не возвращался — до сегодняшнего дня.' },
    ],
  },
  {
    id: 'grail-mountain-monk',
    locationId: 'grail_mountain',
    beatIds: ['melfice_duel'],
    label: 'Встретить отшельника у святилища',
    pages: [
      { speaker: 'Отшельник', text: 'На вершине тебя ждёт не меч и не враг, а отражение. Победишь отражение — поймёшь, зачем вообще поднимался.' },
    ],
  },
  {
    id: 'nanan-clan-elder',
    locationId: 'nanan_village',
    beatIds: ['nanan_and_cyclone'],
    label: 'Выслушать старейшину клана',
    pages: [
      { speaker: 'Старейшина', text: 'Марег был лучшим среди нас. То, что он ищет, — не демон. Это его собственная тень, которая слишком долго шла рядом.' },
    ],
  },
  {
    id: 'nanan-store-trader-scrolls',
    locationId: 'nanan_store',
    label: 'Рассмотреть свитки на прилавке',
    pages: [
      { speaker: 'Торговец', text: 'Свитки урагана и алхимии — работа старых мастеров. На краю мира такие вещи не продают за деньги. Их отдают тем, кто идёт туда, откуда не возвращаются.' },
    ],
  },
  {
    id: 'demons-law-ghost-echo',
    locationId: 'demons_law',
    label: 'Прислушаться к эху в зале управления',
    pages: [
      { speaker: 'Narration', text: 'Эхо в пустом зале повторяет не слова, а шаги. Кажется, древняя система до сих пор считает, что здесь кто-то должен быть.' },
    ],
  },
  {
    id: 'valmar-body-scientist',
    locationId: 'valmar_body',
    beatIds: ['granasaber_ship'],
    label: 'Найти журнал погибшего исследователя',
    pages: [
      { speaker: 'Narration', text: '«День 14: плоть реагирует на свет. День 15: реагирует на страх. День 16: понял — она реагирует на то, что мы о ней думаем».' },
    ],
  },
  {
    id: 'stheim-late-citizen',
    locationId: 'st_heim_papal_state',
    beatIds: ['cathedral_massacre', 'zera_revealed'],
    label: 'Спрятаться с горожанином за колонной',
    pages: [
      { speaker: 'Горожанин', text: 'Я всю жизнь верил, что этот собор спасёт меня. Теперь я молюсь, чтобы он хотя бы не убил. Какая же это вера, если от неё остался один страх?' },
    ],
  },
  {
    id: 'moon-fallen-knight',
    locationId: 'valmars_moon',
    beatIds: ['moon_assault'],
    label: 'Осмотреть доспех павшего рыцаря',
    pages: [
      { speaker: 'Narration', text: 'Рыцарь кафедрала, судя по гербу. Он шёл сюда «очистить луну» и стал частью её стены. На груди — записка: «Прости, Елена. Я ошибался».' },
    ],
  },
  {
    id: 'cyrum-south-commander',
    locationId: 'cyrum_kingdom_south',
    beatIds: ['cyrum_defense'],
    label: 'Выслушать командира южного фронта',
    pages: [
      { speaker: 'Командир', text: 'Принц держит строй не потому, что умеет воевать. А потому, что его солдаты видят: он не прячется за титулом. Это дороже любого меча.' },
    ],
  },
  {
    id: 'birthplace-archive-voice',
    locationId: 'birthplace_of_the_gods',
    label: 'Ответить голосу архива',
    pages: [
      { speaker: 'Голос архива', text: 'Вы спрашиваете, кто из богов победил. Ошибка в вопросе: боги не воюют. Их переписывают те, кто хочет править их именем.' },
    ],
  },
  {
    id: 'new-valmar-echo-memories',
    locationId: 'new_valmar',
    beatIds: ['zera_inside_valmar'],
    label: 'Слушать эхо в живых стенах',
    pages: [
      { speaker: 'Narration', text: 'Стены повторяют обрывки чужих воспоминаний: колыбельную, клятву, прощание. Вальмар не ест тела — он ест то, чем люди держатся друг за друга.' },
    ],
  },

  {
    id: 'carbo-house-2-farewell',
    locationId: 'carbo_house_2',
    label: 'Поговорить с хозяйкой дома',
    pages: [
      { speaker: 'Хозяйка', text: 'Мой сын ушёл в церковь и не вернулся. Говорят, там красивая песня. Но я слышу в ней что-то, от чего сердце ноет.' },
    ],
  },
  {
    id: 'witt-forest-hermit',
    locationId: 'witt_forest',
    label: 'Встретить отшельника на опушке',
    pages: [
      { speaker: 'Отшельник', text: 'Лес у Карбо всегда был тихим. Сегодня тишина другая — она ждёт. Идите осторожно, геохаунд.' },
    ],
  },
  {
    id: 'garmia-top-fallen-knight',
    locationId: 'garmia_tower_top',
    beatIds: ['garmia_failure'],
    label: 'Осмотреть доспех павшего рыцаря',
    pages: [
      { speaker: 'Narration', text: 'Рыцарь церкви лежит у разбитого окна. В руке — обрывок молитвы и медальон с портретом. Он пытался защитить то, во что верил.' },
    ],
  },
  {
    id: 'inor-mountains-prospector',
    locationId: 'inor_mountains',
    label: 'Разговорить горного старателя',
    pages: [
      { speaker: 'Старатель', text: 'Золото в этих горах есть. Но дороже золота — путь назад. Половина моих знакомых забыла, как он выглядит.' },
    ],
  },
  {
    id: 'agear-guard-sergeant',
    locationId: 'agear_guard_tent',
    label: 'Выслушать сержанта гарнизона',
    pages: [
      { speaker: 'Сержант', text: 'Мы держимся, пока есть припасы. А припасы тают. Если пещера не отдаст мальчишку — нам придётся выбирать.' },
    ],
  },
  {
    id: 'durham-depths-roan-scarf',
    locationId: 'durham_cave_depths',
    beatIds: ['agear_roan'],
    label: 'Поднять шарф Роана',
    pages: [
      { speaker: 'Narration', text: 'Обрывок шарфа зацепился за камень. Он здесь недавно — и следы ведут вглубь, к рёву минотавра.' },
    ],
    setFlags: ['flag_agear_roan_plea'],
  },
  {
    id: 'liligue-store-gossip',
    locationId: 'liligue_store',
    label: 'Послушать разговоры у прилавка',
    pages: [
      { speaker: 'Покупатель', text: 'Инженеры говорят, что под городом просто вода. А мой дед говорил, что вода так не дышит.' },
    ],
  },
  {
    id: 'liligue-church-father',
    locationId: 'liligue_church',
    label: 'Спросить священника Лилига',
    pages: [
      { speaker: 'Священник', text: 'Гранос милостив. Но я молюсь уже не о спасении, а о том, чтобы мы успели уйти до того, как проснётся древнее.' },
    ],
  },
  {
    id: 'liligue-cave-miner-ghost',
    locationId: 'liligue_cave',
    label: 'Услышать шёпот в пещере',
    pages: [
      { speaker: 'Narration', text: 'Из глубины доносится шёпот: «Не считай свечи, считай шаги. Печать держится на том, кто помнит».' },
    ],
  },
  {
    id: 'skyway-station-conductor',
    locationId: 'skyway_station',
    label: 'Поговорить с проводником скайвея',
    pages: [
      { speaker: 'Проводник', text: 'Скайвей ходит между Лилигом и востоком. Но в последнее время птицы летят в другую сторону. Я бы тоже улетел, будь у меня крылья.' },
    ],
  },
  {
    id: 'lumir-forest-ranger',
    locationId: 'lumir_forest',
    label: 'Спросить лесника',
    pages: [
      { speaker: 'Лесник', text: 'Зимой лес молчит. Сегодня он не молчит — он слушает. И кажется, ему не нравится то, что он слышит.' },
    ],
  },
  {
    id: 'mirumu-town-hall-clerk',
    locationId: 'mirumu_town_hall',
    label: 'Выслушать писаря',
    pages: [
      { speaker: 'Писарь', text: 'Мы записываем роды, смерти и долги. Сегодня записали уже третью семью, которая ушла в разлом и не вернулась.' },
    ],
  },
  {
    id: 'mirumu-chief-house-wife',
    locationId: 'mirumu_chief_house',
    label: 'Поговорить с женой старосты',
    pages: [
      { speaker: 'Жена старосты', text: 'Мой муж пытается держать деревню вместе. Но как держать то, что рассыпается изнутри? Мы не знаем даже, кто теперь наш враг.' },
    ],
  },
  {
    id: 'fissure-depths-screams',
    locationId: 'fissure_depths',
    label: 'Прислушаться к глубинам',
    pages: [
      { speaker: 'Narration', text: 'Глубина разлома отвечает голосами. Среди них — голос Аиры: «Не будите его. Он уже проснулся».' },
    ],
  },
  {
    id: 'stheim-store-attendant',
    locationId: 'st_heim_store',
    label: 'Расспросить лавочника',
    pages: [
      { speaker: 'Лавочник', text: 'Товары приходят из Цайрума и Нанана. А слухи приходят отовсюду. Хотите совет? Слушайте слухи, но не доверяйте ни одному.' },
    ],
  },
  {
    id: 'stheim-balcony-sister',
    locationId: 'st_heim_balcony',
    label: 'Поговорить с сестрой на балконе',
    pages: [
      { speaker: 'Сестра', text: 'С балкона видно весь город. И видно, как он боится. Боится не тьмы — а того, что свет окажется ложным.' },
    ],
  },
  {
    id: 'stheim-audience-scribe',
    locationId: 'st_heim_audience_chamber',
    label: 'Поговорить с писцом аудиенций',
    pages: [
      { speaker: 'Писец', text: 'Я записываю речи Святейшества. Интересно, есть ли у меня записи, которые я не должен был записывать?' },
    ],
  },
  {
    id: 'zera-room-steward',
    locationId: 'zera_room',
    beatIds: ['zera_revealed'],
    label: 'Найти записку стюарда',
    pages: [
      { speaker: 'Narration', text: 'В ящике стола — записка: «Если меня не будет, скажите геохаунду: правда не в книгах. Правда в том, что он уже видел».' },
    ],
  },
  {
    id: 'pilgrim-road-monk',
    locationId: 'pilgrim_road',
    label: 'Встретить монаха на дороге паломников',
    pages: [
      { speaker: 'Монах', text: 'Паломники идут в Сент-Хейм за благословением. Я иду обратно — и у меня их нет. Зато есть вопросы.' },
    ],
  },
  {
    id: 'cyrum-store-merchant',
    locationId: 'cyrum_store',
    label: 'Поговорить с торговцем Цайрума',
    pages: [
      { speaker: 'Торговец', text: 'У нас лучшие клинки и броня. Но лучший товар — информация. И её я продаю только тем, кто умеет слушать.' },
    ],
  },
  {
    id: 'hemble-tent-assistant',
    locationId: 'hemble_tent',
    label: 'Поговорить с помощником Хембла',
    pages: [
      { speaker: 'Помощник', text: 'Хембл говорит, что чемпионом становится тот, кто умеет ждать. Но сам он всегда бьёт первым.' },
    ],
  },
  {
    id: 'cyrum-passage-guard',
    locationId: 'cyrum_secret_passage',
    label: 'Осмотреть следы в проходе',
    pages: [
      { speaker: 'Narration', text: 'Свежие следы идут вниз — и вверх уже не возвращаются. Тайный проход стал односторонним.' },
    ],
  },
  {
    id: 'plant-control-engineer',
    locationId: 'underground_control_room',
    label: 'Прочитать дневник инженера',
    pages: [
      { speaker: 'Narration', text: '«День 21: машина говорит. День 22: машина говорит на нашем языке. День 23: мы поняли, что машина говорит с нами давно».' },
    ],
  },
  {
    id: 'boat-bakala-tale',
    locationId: 'boat_50_50',
    label: 'Послушать байку капитана Бакалы',
    pages: [
      { speaker: 'Капитан Бакала', text: 'Я плавал к краю мира и обратно. И скажу: на краю мира не ветер страшен, а тишина. Сегодня море слишком тихое.' },
    ],
  },
  {
    id: 'ceceile-reef-diver',
    locationId: 'ceceile_reef',
    label: 'Поговорить с ныряльщиком',
    pages: [
      { speaker: 'Ныряльщик', text: 'Риф полон сокровищ и хищников. Но самые опасные — не те, что под водой, а те, что ждут на берегу.' },
    ],
  },
  {
    id: 'garlan-chief-wife',
    locationId: 'garlan_chief_house',
    label: 'Поговорить с женой старосты Гарлана',
    pages: [
      { speaker: 'Жена старосты', text: 'Деревня помнит Рюдо мальчиком. Теперь он вернулся мужчиной. Но память не прощает — она только ждёт.' },
    ],
  },
  {
    id: 'ghoss-west-trapper',
    locationId: 'ghoss_forest_west',
    label: 'Спросить охотника',
    pages: [
      { speaker: 'Охотник', text: 'Я ставлю силки на зверя. Но последний улов — не зверь, а то, что носит его шкуру. Больше в этот лес я не хожу.' },
    ],
  },
  {
    id: 'ghoss-east-scout',
    locationId: 'ghoss_forest_east',
    label: 'Поговорить с разведчиком',
    pages: [
      { speaker: 'Разведчик', text: 'Разлом впереди. Идти туда — значит идти навстречу ветру, который сдувает имена с карт.' },
    ],
  },
  {
    id: 'great-rift-survivor',
    locationId: 'great_rift',
    beatIds: ['nanan_and_cyclone'],
    label: 'Встретить выжившего у края',
    pages: [
      { speaker: 'Выживший', text: 'Я видел, как шторм утащил целый караван. Не ветром — чем-то внутри ветра. Не ходите туда без причины.' },
    ],
  },
  {
    id: 'womb-last-sentinel',
    locationId: 'valmars_womb',
    beatIds: ['moon_assault'],
    label: 'Осмотреть последнего стража',
    pages: [
      { speaker: 'Narration', text: 'Страж чрева Луны замер на пороге. Под доспехом — записка: «Я охранял не вход. Я охранял выход».' },
    ],
  },
  {
    id: 'inner-trial-whisper',
    locationId: 'inner_trial',
    beatIds: ['inner_trial'],
    label: 'Услышать шёпот в испытании',
    pages: [
      { speaker: 'Шёпот', text: 'Ты спрашиваешь, кто ты. Но правильный вопрос — кем ты решаешь быть, когда никто не смотрит.' },
    ],
  },
  {
    id: 'chaos-room-echo-self',
    locationId: 'new_valmar_room_of_chaos',
    beatIds: ['zera_inside_valmar'],
    label: 'Ответить эху комнаты хаоса',
    pages: [
      { speaker: 'Эхо', text: 'Мы показываем тебе твоё лицо. Ты узнаёшь его? Или предпочитаешь верить тому, что тебе удобно?' },
    ],
  },
  {
    id: 'core-final-whisper',
    locationId: 'new_valmar_core',
    beatIds: ['true_finale'],
    label: 'Прислушаться к ядру',
    pages: [
      { speaker: 'Голос ядра', text: 'Вы пришли судить бога. Помните: боги — это то, что люди решают почитать. Сегодня вы решаете иначе.' },
    ],
  },
  {
    id: 'raul-special-stage-echo',
    locationId: 'raul_hills_special',
    label: 'Прислушаться к эху башни',
    pages: [
      { speaker: 'Narration', text: 'Башня лабиринта хранит эхо искателей сокровищ. Они все искали одно и то же — и все оставили здесь часть себя.' },
    ],
  },
];

export function npcDialoguesForLocation(locationId, beatId = null) {
  return NPC_DIALOGUES.filter((entry) => entry.locationId === locationId)
    .filter((entry) => !entry.beatIds || entry.beatIds.length === 0 || entry.beatIds.includes(beatId));
}
