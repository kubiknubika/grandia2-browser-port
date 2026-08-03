const SCORE = {
  todo: 0,
  partial: 0.5,
  done: 1,
};

function percent(value) {
  return Math.round(value * 1000) / 10;
}

const ARC_GROUPS = [
  { id: 'arc_01_failed_seal', label: 'Arc 1 — Failed seal', beatIds: ['carbo_contract', 'garmia_failure'] },
  { id: 'arc_02_road_to_st_heim', label: 'Arc 2 — Road to St. Heim', beatIds: ['millenia_first_attack', 'agear_roan', 'liligue_and_mareg'] },
  { id: 'arc_03_st_heim_cyrum', label: 'Arc 3 — St. Heim and Cyrum', beatIds: ['st_heim_zera', 'cyrum_and_claws'] },
  { id: 'arc_04_melfice_and_garlan', label: 'Arc 4 — Melfice and Garlan', beatIds: ['garlan_return', 'melfice_duel'] },
  { id: 'arc_05_granasaber_truth', label: 'Arc 5 — Granasaber truth', beatIds: ['nanan_and_cyclone', 'granasaber_ship'] },
  { id: 'arc_06_day_of_darkness', label: 'Arc 6 — Day of Darkness', beatIds: ['cathedral_massacre', 'zera_revealed'] },
  { id: 'arc_07_moon_and_sacrifice', label: 'Arc 7 — Moon and sacrifice', beatIds: ['moon_assault', 'cyrum_defense'] },
  { id: 'arc_08_birthplace_of_gods', label: 'Arc 8 — Birthplace of the Gods', beatIds: ['birthplace_descent', 'inner_trial'] },
  { id: 'arc_09_new_valmar_finale', label: 'Arc 9 — New Valmar finale', beatIds: ['zera_inside_valmar', 'true_finale'] },
];

export const STORY_IMPLEMENTATION_AUDIT = {
  methodology: {
    note: 'Это не процент прохождения игрока, а процент реализации story-слоя по отношению к оригинальной Grandia II внутри текущего браузерного порта.',
    statuses: {
      done: 'Фича или сюжетный сегмент реализованы в играбельном виде.',
      partial: 'Есть рабочий прототип/стенд-ин, но пока без полной fidelity к оригиналу.',
      todo: 'Сегмент ещё не представлен или представлен слишком слабо.',
    },
  },
  categories: [
    {
      id: 'story_spine',
      label: 'Сюжетный хребет',
      weight: 1,
      items: [
        { id: 'beats-covered', label: 'Все 19 plot beats заведены в данных', status: 'done', done: 'Весь основной сюжет разложен по аркам и битам.', remaining: 'Дальше — только полировка сцен и текста.' },
        { id: 'cutscenes-covered', label: 'У каждого бита есть катсцены/интерлюдии', status: 'done', done: 'Все биты имеют intro/victory flow и локальные сюжетные сцены.', remaining: 'Можно поднимать литературную выразительность отдельных реплик.' },
        { id: 'campaign-flow', label: 'Полный campaign loop', status: 'done', done: 'Есть opening → travel → room scenes → fight/checkpoint → result → next beat.', remaining: 'Дальнейший рост — в polish UX и визуальной подаче.' },
      ],
    },
    {
      id: 'world_route',
      label: 'Мир, маршруты и города',
      weight: 1,
      items: [
        { id: 'route-graph', label: 'Маршрутный граф мира', status: 'done', done: 'Есть world route layer с переходами и overworld-шагами.', remaining: 'Можно расширять детализацию переходов между регионами.' },
        { id: 'town-interiors', label: 'Города и подлокации', status: 'done', done: 'Есть города, дома, inns, church, library, port и прочие interiors.', remaining: 'Следующий рост — дополнительные художественные штрихи, а не отсутствие комнат.' },
        { id: 'walking-avatar', label: 'Аватар и передвижение по сцене', status: 'done', done: 'Есть WASD/arrow navigation, click-to-move, простые коллизии и триггеры.', remaining: 'Можно улучшить pathing, анимацию и визуальную чистоту.' },
        { id: 'location-states', label: 'Состояния городов при повторных визитах', status: 'done', done: 'Ключевые города, важные interiors и late-game зоны имеют state-variants и меняют атмосферу по сюжету.', remaining: 'Дальше можно только наращивать сценографическую детализацию.' },
      ],
    },
    {
      id: 'town_dungeon_scripts',
      label: 'Городские и данжевые цепочки',
      weight: 1,
      items: [
        { id: 'quest-flags', label: 'Quest flags и gate logic', status: 'done', done: 'Сюжет продвигается через флаги, локальные сцены и открытия выходов.', remaining: 'Можно лишь тоньше подгонять названия и UX-подсказки.' },
        { id: 'town-chains', label: 'Многошаговые town chains', status: 'done', done: 'Есть hand-authored цепочки для всех ключевых городских сюжетных этапов кампании, включая quiet-сцены и late-state повторы.', remaining: 'Следующий рост — уже в текстовой режиссуре, а не в наличии цепочек.' },
        { id: 'dungeon-stages', label: 'Многостадийные dungeon flows', status: 'done', done: 'Есть stage chains и room-facing progression для ключевых данжей и late-game сегментов.', remaining: 'Дальнейший рост — уникальные визуальные gimmicks, не системный каркас.' },
      ],
    },
    {
      id: 'encounter_fidelity',
      label: 'Боевая и сюжетная fidelity',
      weight: 1,
      items: [
        { id: 'story-beat-battles', label: 'У всех битов есть playable story battle/checkpoint', status: 'done', done: 'Все основные шаги имеют играбельную форму.', remaining: '—' },
        { id: 'boss-specific-fights', label: 'Уникальные boss/arc encounters', status: 'done', done: 'Есть Tongue/Claws/Heart/Zera и развернутые bespoke setpiece encounters для Carbo departure, Garmia catastrophe, Millenia night attack, Durham rescue, hidden sanction of St. Heim, Garlan homecoming, Melfice duel, Great Rift cyclone push, Moon siege, reveal Granasaber, Day of Darkness, Zera reveal, late Cyrum defense, Birthplace archive descent, Inner Trial, Room of Chaos и финала New Valmar.', remaining: 'Дальнейший рост здесь уже скорее постановочный и балансный.' },
        { id: 'travel-encounters', label: 'Полевые стычки при исследовании', status: 'done', done: 'Есть wandering encounters и отдельный result flow.', remaining: 'Можно расширять variety и редкие маршрутовые события.' },
      ],
    },
    {
      id: 'progression_systems',
      label: 'Рост партии и economy loop',
      weight: 1,
      items: [
        { id: 'persistent-party', label: 'Persistent party state', status: 'done', done: 'HP/MP/SP, roster, inventory и checkpoints сохраняются.', remaining: 'Подчистить ещё более тонкие edge-cases.' },
        { id: 'equipment-system', label: 'Оружие/броня/аксессуары', status: 'done', done: 'Есть shop, loadout, equip/unequip и влияние на бой.', remaining: 'Расширить ассортимент и связь с оригинальным лутом при желании.' },
        { id: 'growth-tree', label: 'EXP / уровни / SC / MC / growth nodes', status: 'done', done: 'Есть level loop, skill books, mana eggs и unlocking tree.', remaining: 'Углубить связь роста с конкретными заклинаниями и умениями при следующем проходе.' },
      ],
    },
    {
      id: 'original_fidelity',
      label: 'Близость к оригинальной Grandia II',
      weight: 1,
      items: [
        { id: 'macro-structure', label: 'Правильная macro-структура путешествия', status: 'done', done: 'Маршрут, города, повторные визиты и продвижение вперёд ощущаются правильно.', remaining: '—' },
        { id: 'scene-density', label: 'Плотность локальных сцен и NPC', status: 'done', done: 'Есть плотный слой world events, hand-authored nodes, town-chain steps, auto-trigger location scenes и повторные состояния ключевых локаций.', remaining: 'Дальше рост уже художественный: тексты, визуальные штрихи, микрореакции.' },
        { id: 'full-parity', label: 'Почти полная parity с оригинальной игрой', status: 'done', done: 'Кампания получила quiet town scenes, repeat-visit interiors, room-by-room pacing, late-state cathedral/Cyrum/New Valmar chains и более оригинальный ритм inn → room → dialogue → route unlock.', remaining: 'Следующий шаг — не закрытие пробелов, а polish и ещё более тонкая режиссура.' },
      ],
    },
  ],
  beats: [
    { id: 'carbo_contract', label: 'Carbo contract', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Carbo теперь даёт church/inn/store/house pacing и отдельный bespoke escort-departure encounter у выхода из деревни.', remaining: 'Дальше — polish вступительных реплик и визуального контраста между миром и бедой.' },
    { id: 'garmia_failure', label: 'Garmia Tower disaster', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Башня встроена в progression, stage flow и catastrophe setpiece, а её последствия теперь лучше ощущаются через повторный Карбо.', remaining: 'Можно ещё сильнее усилить визуальный обвал и эвакуационный стресс.' },
    { id: 'millenia_first_attack', label: 'Millenia first attack', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Ночная цепочка Карбо теперь хорошо держит оригинальный ритм quiet village → тревожная ночь → вторжение Миллении.', remaining: 'Дальше — визуальный polish и ещё более жёсткая ночная подача.' },
    { id: 'agear_roan', label: 'Agear and Roan', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Agear и Durham Cave теперь держатся не только на route flow, но и на bespoke rescue-setpiece с Durham Minotaur и пещерным давлением.', remaining: 'Дальше — polishing текстов и визуальной подаче пещерного спасения.' },
    { id: 'liligue_and_mareg', label: 'Liligue and Mareg', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Лилиг получил quiet inn, engineer-house и richer city pacing до спуска в руины и битвы с Tongue of Valmar.', remaining: 'Дальше — только дополнительный лор/NPC polish.' },
    { id: 'st_heim_zera', label: 'Audience with Zera', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'St. Heim теперь играет по room-by-room ритму: inn stay → audience → library → bakery/guestroom → balcony → second audience, а скрытое церковное давление оформлено отдельным bespoke encounter.', remaining: 'Можно ещё обогащать отдельные церковные комнаты мелкими реакциями NPC.' },
    { id: 'cyrum_and_claws', label: 'Cyrum and the Claws', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Цайрум получил более точный city script: inn → square → king\'s chamber → port → secret passage → plant.', remaining: 'Следующий рост — уже в ещё более bespoke factory visuals и микро-диалогах.' },
    { id: 'garlan_return', label: 'Return to Garlan', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Возвращение в Гарлан держится на доме Рюдо, старосте, лавке, могилах и отдельном bespoke hostile-homecoming encounter ночной деревни.', remaining: 'Можно добавить ещё больше мелких village reactions в одном из следующих проходов.' },
    { id: 'melfice_duel', label: 'Melfice duel', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Grail Mountain и Plateau of Memories получили дополнительные драматические паузы, а сама дуэль уже оформлена как полноценный bespoke confrontation.', remaining: 'Можно ещё сильнее отличить climb/shrine/plateau визуально и ритмически.' },
    { id: 'nanan_and_cyclone', label: 'Nanan and cyclone', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Нанан теперь ощущается последним человеческим привалом, а Great Rift получил отдельный cyclone-setpiece прорыва к Demon\'s Law.', remaining: 'Следующий рост — визуально и атмосферно дожать сам шторм и дальний фон Разлома.' },
    { id: 'granasaber_ship', label: 'True Granasaber', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Demons Law и Valmar Body лучше разведены по смыслу: древняя машина → органический ужас → reveal Granasaber.', remaining: 'Можно добавлять только визуально-постановочный масштаб reveal-момента.' },
    { id: 'cathedral_massacre', label: 'Cathedral massacre', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Day of Darkness уже имеет сильный collapse state и late-city атмосферу.', remaining: 'Дальше — полировка late St. Heim visual beats.' },
    { id: 'zera_revealed', label: 'Zera revealed', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Поздняя соборная цепочка теперь точнее: lobby → ruined audience chamber → Zera room → forbidden room, а сам reveal уже закреплён bespoke confrontation.', remaining: 'Можно ещё усилить reveal отдельными атмосферными штрихами и FX.' },
    { id: 'moon_assault', label: 'Moon assault', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Moon route и hostile atmosphere уже работают как полноценный late-game assault с отдельным Womb threshold.', remaining: 'Следующий шаг — только усиление жертвы Марега и visual crescendo.' },
    { id: 'cyrum_defense', label: 'Cyrum defense', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Поздний Цайрум теперь начинается с фронтового brief и доходит до bespoke defensive stand, где Роан реально берёт линию на себя.', remaining: 'Можно добавить ещё больше camp/front microbeats.' },
    { id: 'birthplace_descent', label: 'Birthplace descent', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Исток богов получил room-specific truth/blue/yellow/red progression и отдельный bespoke archive confrontation под древнюю правду мира.', remaining: 'Дальше — только ещё более сильный puzzle/visual cadence.' },
    { id: 'inner_trial', label: 'Inner trial', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Inner Trial уже и механически, и сюжетно ощущается отдельным психологическим узлом.', remaining: 'Можно дальше усиливать визуальный язык сна и вины.' },
    { id: 'zera_inside_valmar', label: 'Zera inside New Valmar', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'New Valmar и Room of Chaos получили richer room-chain, второй органический vocal-pressure step и более выраженный bespoke hallucination encounter.', remaining: 'Следующий рост — уже художественный polish hallucination presentation и визуальных ложных форм.' },
    { id: 'true_finale', label: 'True finale', narrative: 'done', route: 'done', chain: 'done', encounter: 'done', fidelity: 'done', done: 'Финал получил собственный core threshold и идеологическую подготовку перед последней развязкой.', remaining: 'Остаётся только полировать масштаб финальной подачи и визуальное давление ядра.' },
  ],
};

export function scoreStatus(status) {
  return SCORE[status] ?? 0;
}

export function evaluateCategory(category) {
  const scores = category.items.map((item) => scoreStatus(item.status));
  const ratio = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  return {
    ...category,
    ratio,
    percent: percent(ratio),
    doneCount: category.items.filter((item) => item.status === 'done').length,
    partialCount: category.items.filter((item) => item.status === 'partial').length,
    todoCount: category.items.filter((item) => item.status === 'todo').length,
  };
}

export function evaluateBeat(beatAudit) {
  const fields = ['narrative', 'route', 'chain', 'encounter', 'fidelity'];
  const ratio = fields.reduce((sum, field) => sum + scoreStatus(beatAudit[field]), 0) / fields.length;
  return {
    ...beatAudit,
    ratio,
    percent: percent(ratio),
  };
}

export function buildStoryAuditSnapshot() {
  const categories = STORY_IMPLEMENTATION_AUDIT.categories.map(evaluateCategory);
  const beats = STORY_IMPLEMENTATION_AUDIT.beats.map(evaluateBeat);
  const arcBreakdown = ARC_GROUPS.map((arc) => {
    const arcBeats = beats.filter((beat) => arc.beatIds.includes(beat.id));
    const ratio = arcBeats.length ? arcBeats.reduce((sum, beat) => sum + beat.ratio, 0) / arcBeats.length : 0;
    return {
      ...arc,
      beats: arcBeats,
      ratio,
      percent: percent(ratio),
    };
  });
  const overallRatio = categories.length
    ? categories.reduce((sum, category) => sum + category.ratio * category.weight, 0) / categories.reduce((sum, category) => sum + category.weight, 0)
    : 0;
  const beatRatio = beats.length ? beats.reduce((sum, beat) => sum + beat.ratio, 0) / beats.length : 0;
  return {
    methodology: STORY_IMPLEMENTATION_AUDIT.methodology,
    categories,
    beats,
    arcBreakdown,
    overallRatio,
    overallPercent: percent(overallRatio),
    beatCoveragePercent: percent(beatRatio),
    doneBeats: beats.filter((beat) => beat.percent >= 80).length,
    partialBeats: beats.filter((beat) => beat.percent >= 40 && beat.percent < 80).length,
    lowBeats: beats.filter((beat) => beat.percent < 40).length,
  };
}
