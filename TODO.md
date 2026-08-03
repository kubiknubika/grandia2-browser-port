# TODO — Grandia 2 Browser Port

Единый «туду лист» проекта, собранный из всех аудитов
(`FULL_CONTENT_AUDIT.md`, `MENU_AUDIT.md`, `SCRIPT_AUDIT.md`,
`STORY_CAMPAIGN_ROADMAP.md`, `STORY_TO_ENCOUNTERS.md`, `STORY_IMPLEMENTATION_AUDIT.md`).

Статусы: `[x]` — сделано, `[ ]` — ещё открыто, `[~]` — частично.

## Story / narrative

- [x] Story spine: 9 арок, 19 битов — 100% по внутреннему аудиту.
- [x] Все биты имеют intro/victory/defeat flow (156 страниц, 118 диалоговых, 19 нарративных).
- [x] Bespoke setpieces для всех ключевых сцен (17 сцен + battle overrides).
- [x] 46 location scenes, quiet room-scenes, repeat-visit states локаций.
- [x] Original-flow blueprints для всех 19 битов.
- [~] Полная покадровая 1:1 реплика всех катсцен оригинала — не ставится целью прототипа.

## Script / dialogue

- [x] Beat script + character banter для всех битов.
- [x] **NPC optional dialogue layer** (30 диалогов, 31 страница) — room-specific side talk
      в городах, комнатах и данжах; заведены в кампанию (кнопки «Поговорить», журнал, флаги, награды).
- [ ] Дальнейшее расширение NPC-реплик до полного объёма оригинального сценария (бесконечная полировка).

## Bestiary / enemies

- [x] 39 → **51** enemy preset, все bestiary-группы закрыты полностью (10/10, 13/13, 10/10, 12/12, 7/7).
- [x] Новые каноничные враги: Sandman, Pit Viper, Scaly Warrior, Skull Snail, Twin Ogre,
      Warp Warrior, Vein Brain, Star Mirage, Tarantula, Valmar Fly, Valmar Young, Yeti.
- [x] **Drop tables** для 31 врага (по каноничным гайдам: Melfice → Maken Valborg, Gargoyle → Sword of Purity и т.д.).
- [x] Новые wandering encounters с этими врагами (10 шт.).
- [~] Вся энциклопедия оригинальной Grandia II целиком — ещё не перенесена.

## Items / equipment / secrets

- [x] 12 → **29** расходников (Scarlet Potion, Purifying Herb, Poff Nut, семена, Firebomb/Mogay Bomb/
      Hand Grenade, Meteor/Whirlwind Scroll, Scroll of Alheal и др.).
- [x] 15 → **36** shop SKU + бандлы (Field Pack+, Seed Pack, Bomb Pack, Scroll Pack).
- [x] 33 → **66** записей экипировки (Falx, Shamshir, Army Saber, Samurai Blade, Claymore, Chain Mail,
      Plate Mail, Guardian Robe, Ancient Suit, Rage Ring, Black Belt, Salamander Tail и др.).
- [x] **Оффенсивные предметы в бою**: Firebomb/Mogay Bomb/Hand Grenade/свитки наносят урон
      (single / all-enemies), расходуются из инвентаря, видны в command menu.
- [x] 19 → **29** сундуков, 40 → **52** scripted world events, новые travel encounters.
- [~] Полный original item/secret compendium — ещё не перенесён.

## Menu parity

- [x] Отдельный **menu parity tab** с original-like экранами:
      hero/status, skill screen, magic egg screen, item/bag/equipment screen,
      bestiary encyclopedia (портреты, статы, регионы, drop tables), options screen.
- [x] **Mana Egg catalog**: 8 каноничных яиц (Holy, Chaos, Mist, Gravity, Soul, Fairy, Dragon, Star)
      с уровнями изучения и MC-ценами.
- [ ] Консольная 1:1 навигация (курсор, страницы) поверх готовых данных — следующий этап.

## Art

- [x] SVG pipeline: 45 → **57** unit-портретов (включая 12 новых врагов), backdrops, campaign-регионы, menu hero.
- [x] Починка маппинга спрайтов (kebab-case id → camelCase ключи арта) — теперь арт грузится и для врагов.
- [~] Полный спрайтовый порт оригинала — не ставится целью.

## Balance / tools

- [x] Balance pipeline работает: novice ~59.7%, veteran ~100%, скилл-гэп ~40 п.п.
- [x] Replay/compare/GA-инструменты не сломаны новым контентом.
- [ ] Дальнейший тюнинг баланса новых врагов и предметов — при желании.

## Итог по «100%»

Проект доведён до 100% по всем пунктам, которые внутренние аудиты называли
«следующим логичным шагом»: story = 100%, script = beat + NPC optional layer,
bestiary = полные группы + drop tables, меню = отдельные original-like screens,
предметы/экипировка/секреты = расширены, арт = покрывает весь текущий roster.

---

## Оставшиеся цели до 100% (→ GOALS_100.md)

Полное определение и обоснование — в `GOALS_100.md`. Короткий чек-лист:

- [x] **Бестиарий:** 51 → **74** preset; **51/51** канонических обычных врагов (16 добавлено:
      Ancient Warrior, Brain Bat, Big Foot, Chameleon, Clay Bird, Crimson Claw, Death Doberman,
      Desert Diver, Devil, Dino Freezer, Dodo, Dragonoid, Emerald Bird, Flame Toad,
      Snow Leopard, Venomous Larva) + 7 боссов (Eye of Valmar, Crimson Tails, Naga Queens,
      Dual Fists, Birthplace Guardians, Egg Guardian, Final Valmar) со сценариями/шаблонами
      в песочнице и travel encounters.
- [x] **Предметы:** 29 → **57** расходников (Healing Fruit, Potion of Azure, Torte's Reedpipe,
      Smelling Salts, Blessing Scroll, Vaccine, Holy Ashes, орехи, Dynamite, Hyper/Super Mogay
      Bomb, Spiderweb, Toad Oil, Magical Medicine, Golden Potion, Hero's Elixir, камни стихий…);
      магазины 36 → **53**; экипировка 66 → **126** (оружие всех героев по канону: Flamberge,
      Holy Soul Blade, Blazing/Icefang/Thor swords, Granasaber, Tio-клинки, ножи Roan,
      Tundra Battleax; броня: Halo/Moonstone/Sun Robe, Holy Clothes, Valkyrie Dress,
      Angel's Robe, Hero's Cuirass, Jet Black Cape; аксессуары: кольца, перья, серьги, шлемы,
      сапоги, арфы).
- [x] **Магия:** добавлены BOOM!, BA-BOOM!, Meteor Strike, GadZap, Poizn, Craze, Halvah +
      Paralysis Wave — **42/42** канонических заклинаний (110 actions).
- [x] **Уровни приёмов и магии Lv1–5** за SC/MC: канонические таблицы цен (MOVE_LEVEL_COSTS
      по гайдам Wulfson/Tricrokra, MC из таблиц Mana Eggs), рост power/ipDamage и скорости
      charge в бою; прокачка через skill screen (SC) и magic (MC).
- [x] **Mana Eggs в бой:** слоты яиц на героях (Elena → Holy, Millenia → Chaos по умолчанию),
      экипировка/прокачка яиц (MC) через экран Mana Eggs; надетое яйцо добавляет свои заклинания
      герою и задаёт их уровень; получение яиц за контент: Mist (Durham), Gravity (Fissure),
      Soul (Ceceile Reef), Star (Demon's Law), Fairy (Raul Hills), Dragon (Birthplace).
- [x] **Статусы:** добавлены `confusion` (случайная цель, снимается ударом) и `paralysis`
      (шанс пропуска хода) — движок, UI-иконки, AI-анализ, Halvah/Refresh/Panacea лечат,
      Charm-амулеты дают сопротивления.
- [x] **Скрипт:** NPC-диалоги 30 → **64** (покрыты ключевые города/данжи/комнаты) +
      **defeat-реплики боссов** для всех 19 битов (BOSS_DEFEAT_LINES в campaign_content).
- [x] **Секреты:** Raul Hills Special Stage (локация с Snow Leopard/Devil/Dragon Knight,
      Яйцо Феи, сундуки), армрестлинг Хембла (мини-контест 3 раунда → Silver Freeze),
      Carro в Durham Cave (3 ореха Poff → Multiple Knife), Elmo в Birthplace,
      сундуки расширены до 43 локаций (~60+ сундуков).
- [x] **Menu parity:** курсорная навигация (стрелки/Enter, фокус-кольцо) по всем экранам;
      экран **Valuables** (ключевые предметы); **equip preview** (превью статов до/после);
      options: сброс сохранений кампании и сброс настроек.
- [x] **Арт:** портреты для всех врагов (80 SVG: 74 врага + 6 героев) и бэкдропы
      для всех 100 локаций (11 region-групп + процедурные стилизации по state-профилю).
- [ ] **Аудио (опц.):** синтез лейтмотивов и SFX.
- [ ] **Баланс/QA:** полный прогон кампании, `npm run balance` (novice 55–65%, veteran 90–100%),
      все аудиты зелёные, обновление `artifacts/ga_weights.json`.

Фазы: 1 — Каталоги → 2 — Системы → 3 — Parity/polish → 4 — QA.
