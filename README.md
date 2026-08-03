# Grandia 2 Browser Port

Небольшой честный прототип браузерной боёвки по мотивам Grandia 2.

Сейчас в репозитории есть vertical slice боёвки, а не заглушка:
- бой **2x2**;
- **IP Gauge** с фазами `WAIT -> COM -> ACT`;
- действия `Combo`, `Critical`, `Endure`, `Evade`;
- более грандиевское ручное меню с разделами `Combo / Critical / Moves / Magic / Items / Defend`;
- `Ryudo -> Tenseiken Slash` как cancel move;
- `Elena -> Impact Bomb`, `Nightmare Ball`, `Burn!`, `Heal`;
- дополнительный герой `Tio` с `Lotus Flower` и `Zap!`;
- дополнительные герои: `Roan`, `Mareg`, `Tio`, `Millenia`;
- дополнительные враги: `Mottled Spider`, `Guardian` и мини-босс `Durham Minotaur`;
- support / debuff magic: `WOW!`, `Diggin'`, `Speedy`, `Stram`, `Cold`;
- статусы `sleep`, `moveBlock`, `magicBlock`, `poison`;
- элементы и сопротивления (`fire`, `lightning`) + status resistances;
- предметы `Medicinal Herb` и `Antidote` в бою, с настраиваемым инвентарём;
- боевой HUD на canvas: карточки бойцов, статусы, inventory, cast bars;
- простые event-animations: вспышки по actor/target, floating texts и event banner;
- позиционка на поле и line-of-hit для вражеской линейной атаки;
- **ручное управление героями в браузере** через командную панель на COM;
- более JRPG-подобная структура команд: `Combo / Critical / Moves / Magic / Items / Defend`;
- **главное меню** с входом в игру, story campaign, дебаг и replay compare lab;
- **story campaign** как отдельный линейный режим: chapter cards, катсцены, interstitial-сцены, переходы по миру, overworld-переезды между регионами, города с подлокациями, кликабельный canvas-route view, аватар с перемещением по town/field scene, простые коллизии, точки дверей/NPC, wandering encounters, сундуки/лут, quest flags, многошаговые городские и данжевые цепочки, carryover инвентарь, золото, магазины расходников, persistent party state, слоты `weapon/armor/accessory`, EXP/levels, `SC/MC`, skill books и mana eggs, а также bespoke setpiece-сегменты для ключевых сцен;
- **seeded scenario browser**, encounter templates, battlefield themes и opening advantage;
- **balance vector editor** прямо в UI;
- враги уже имеют разные роли: bruiser (`Troglodyte`), controller/disruptor (`Wing Eye`), status harasser (`Mottled Spider`), caster/elite (`Guardian`) и mini-boss bruiser (`Durham Minotaur`);
- мини-босс / encounter шаблоны: `Mini-boss solo`, `Mini-boss escort`, `Boss swarm test`, `Full party 4v4`, `Guardian trial`;
- у `Guardian` и `Durham Minotaur` есть фазовые переходы, scripted patterns, усиления и новые приёмы;
- **дебаг-меню** с запуском AI-vs-AI боёв, замером винрейта и обучением veteran AI;
- **экспорт JSON-лога боя** с событиями, decision log и snapshots;
- **replay viewer** для battle-log JSON прямо в браузере, с подсветкой action/target, timeline scrubber и autoplay;
- **side-by-side replay compare** для двух логов одновременно;
- **экспорт compare diff в JSON/TXT**;
- **decision heatmap / статистика действий AI** и графики winrate/action frequency;
- сохранённый **GA-артефакт** с весами и тюнингом баланса.

## Что здесь есть по балансу
- **novice AI** — простой базовый игрок для smoke/balance тестов;
- **veteran AI** — весовой бот, который можно доучивать через genetic search;
- быстрый баланс-снапшот по винрейтам;
- full-режим, который прогоняет тренировку veteran-бота и подбор баланса;
- JSON-артефакт `artifacts/ga_weights.json`, который можно грузить и использовать повторно.

Цель текущего баланса:
- новичок должен выигрывать **чуть выше 50%**;
- сильный бот должен выигрывать **около 90-100%**;
- разница между ними должна быть заметной, чтобы скилл действительно решал.

## Чего здесь пока нет
- полноценного порта всей игры;
- полной системы Mana Eggs / Skill Books;
- полноценной анимационной боёвки;
- production-ready архитектуры.

## Запуск

### Браузер
Из корня репозитория подними любой статический сервер, например:

```bash
python3 -m http.server
```

После этого открой `http://localhost:8000/index.html`.

### Что можно делать в браузере

#### Главное меню
- открыть режим `Игра`;
- открыть режим `Story campaign`;
- открыть `Дебаг-меню`;
- открыть `Replay compare lab`.

#### Story campaign
- запускать **полноценный story run** кнопкой `Новая кампания`;
- проходить последовательность `opening -> beat intro -> travel phase -> overworld travel -> сюжетный бой / checkpoint -> victory scene -> next beat`;
- читать chapter cards, narrative interstitial'ы и диалоговые катсцены для всех текущих story beats;
- **ходить между локациями** внутри текущей главы, а не просто кликать следующий beat;
- пользоваться **кликабельной навигацией на canvas**: двери, выходы, сюжетные NPC-узлы и переходы маршрута;
- водить аватар партии по сцене через **WASD / стрелки** и ловить door trigger / travel trigger зоны;
- натыкаться на **wandering encounters** на дорогах и в данжах, открывать сундуки и забирать лут прямо во время исследования;
- проходить **многошаговые town/dungeon chains** в духе оригинальной Grandia II: сначала нужная сцена, потом нужная комната/маршрут, потом доступ к следующему выходу;
- собирать **quest flags** и видеть, каких именно сюжетных триггеров ещё не хватает до следующей развязки;
- развивать партию через **EXP / уровень / SC / MC / skill books / mana eggs**;
- заходить в **городские подлокации**: гостиницы, магазины, церкви, дома, библиотеку, балкон собора и т.д.;
- видеть отдельный **overworld screen** при крупных переходах между регионами;
- видеть, как старые маршруты **сюжетно закрываются**, а кампания переносит партию в новые регионы мира;
- получать **carryover inventory** между боями, тратить **золото**, покупать расходники и собирать **слоты weapon / armor / accessory** для персонажей;
- вести **persistent состояние партии** по HP/MP/SP между боями и восстанавливать его в гостиницах / лагерях / safe точках;
- получать честную **placeholder-заглушку**, если на каком-то узле пока нет отдельного encounter-а;
- сохранять и загружать весь текущий campaign run через localStorage;
- параллельно пользоваться ручной навигацией по `arc / beat` в sandbox-блоке;
- автоматически тащить в экспорт `storyArcId`, `storyBeatId`, `storyBeatTitle`, `campaignRunId`, `campaignBeatIndex`, `campaignLocationId` и `campaignGold`.

#### Seeded scenarios / presets
- переключать готовые сценарии боя;
- менять `battle seed` прямо в UI;
- загружать заранее заготовленные seed presets для повторяемых тестов;
- выбирать **encounter template** (`Duel 2v2`, `Skirmish 3v3`, `Mini-boss solo`, `Mini-boss escort`, `Boss swarm test`, `Full party 4v4`, `Guardian trial`);
- выбирать **battlefield theme** (`forest`, `cavern`, `ruins`, `volcano`);
- выбирать **opening advantage** (`neutral`, `players first`, `enemy ambush`);
- задавать инвентарь (`Medicinal Herb`, `Antidote`) прямо в UI;
- включать `Roan`, `Mareg`, `Tio`, `Millenia`, `MottledSpider`, `Guardian` для расширенных сценариев;
- запускать шаблоны с `Durham Minotaur`, `Guardian`, `Tongue of Valmar`, `Claws of Valmar`, `Heart of Valmar`, `Zera / New Valmar finale` как story-specific или элитные бои;
- смотреть разные темы поля боя (`forest`, `cavern`, `ruins`, `volcano`);
- тестировать баффы/дебаффы, фазовые переходы, scripted boss patterns, summons, boss reactions и theme-гиммики.

#### Вкладка «Игра»
- выбрать, против кого сражается человек: `Novice AI` или `Veteran AI`;
- играть руками за Ryudo + Elena;
- пошагово продвигать бой;
- экспортировать JSON-лог боя;
- потом открыть этот же лог в replay viewer.

#### Вкладка «Дебаг-меню»
- выбрать matchup `Novice/Veteran AI` vs `Novice/Veteran AI`;
- запустить **один AI-бой** и смотреть его на том же поле;
- посчитать **винрейт** на серии симуляций;
- **обучить veteran AI** прямо в браузере;
- загрузить veteran из `artifacts/ga_weights.json`;
- импортировать внешний локальный JSON-артефакт через file picker;
- скачать текущий тюнинг в отдельный JSON;
- менять статы Ryudo, Elena, Roan, Mareg, Tio, Millenia, Troglodyte, Wing Eye, Mottled Spider, Guardian и Durham Minotaur прямо в форме;
- тестировать разные роли: support, controller, bruiser, status harasser, mini-boss bruiser, AoE caster;
- редактировать **balance vector** прямо в UI;
- запускать мини-босс шаблоны вроде `Durham Minotaur` solo/escort/swarm;
- тестировать разные **battlefield themes**;
- загрузить `battle-log.json` в replay viewer, пролистывать бой по шагам, двигать timeline scrubber и запускать autoplay;
- смотреть **decision heatmap / статистику действий** для live battle или replay;
- смотреть **графики** по winrate и частоте действий;
- тестировать более сложные составы с магией, предметами и статусами в party skirmish 3v3.

#### Вкладка «Replay compare»
- загрузить **два replay JSON** одновременно;
- синхронно листать их по шагам;
- включать autoplay для сравнения;
- смотреть краткую сводку по каждой стороне и compare summary по decision logs;
- видеть **step diff** между левым и правым replay;
- экспортировать compare diff в **JSON** и **TXT**.

## CLI-команды

### Быстрый баланс-снапшот

```bash
npm run balance
```

Показывает текущий тюнинг и винрейты novice/veteran ботов.

### Быстрый тест симуляции

```bash
npm run simulate
```

### Полный прогон тренировки и подбора

```bash
npm run balance:full
```

Это более тяжёлый прогон: тренирует veteran-бота и проверяет баланс на новой серии симуляций.

### Сохранить текущий JSON-артефакт весов

```bash
npm run balance:save-artifact
```

### Перегенерировать JSON-артефакт после полного GA-прогона

```bash
npm run balance:save-artifact-full
```

Артефакт хранится в `artifacts/ga_weights.json` и автоматически подхватывается `npm run balance`, если файл существует.

## Структура
- `index.html` — браузерный интерфейс с вкладками «Игра» и «Дебаг-меню»;
- `src/entities/combat.js` — логика боя, IP Gauge, ручные команды, decision log и симуляции;
- `src/entities/balance.js` — novice/veteran AI, genetic search и balance evaluation;
- `src/main.js` — UI, режимы игры/дебага, запуск тренировок и экспорт лога;
- `bot.js` — консольный отчёт по балансу;
- `balance_artifact.js` — сохранение/загрузка JSON-артефакта весов;
- `artifacts/ga_weights.json` — текущий сохранённый артефакт обучения.
