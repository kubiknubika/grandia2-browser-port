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
];

export function npcDialoguesForLocation(locationId, beatId = null) {
  return NPC_DIALOGUES.filter((entry) => entry.locationId === locationId)
    .filter((entry) => !entry.beatIds || entry.beatIds.length === 0 || entry.beatIds.includes(beatId));
}
