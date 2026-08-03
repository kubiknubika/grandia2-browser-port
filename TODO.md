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

Единственное, что осознанно остаётся не-100% — это полный 1:1 перенос **всей**
оригинальной Grandia II (весь скрипт, вся энциклопедия, все консольные меню),
что для браузерного прототипа не является целью и честно отражено в
`FULL_CONTENT_AUDIT.md`.
