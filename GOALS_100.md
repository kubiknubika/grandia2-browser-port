# GOALS_100 — оставшиеся цели до 100%

Согласованное определение **«100%»** для этого проекта:

> **Играбельный content-parity браузерного порта с оригинальной Grandia II**
> в рамках текущей архитектуры: каждый каноничный враг, босс, предмет, заклинание,
> статус, навык, меню, секрет и локация оригинала присутствуют и играбельны,
> все аудиты (`npm run audit:*`) зелёные, баланс прогоняется без регрессий.

Покадровая 1:1 реплика графики/консольной анимации оригинала **не** входит в 100%
(это отдельная не-цель прототипа, зафиксирована в `FULL_CONTENT_AUDIT.md`).

Статусы: `[ ]` — открыто, `[~]` — частично, `[x]` — сделано.
Оценки: S ≤ 1 день, M 2–3 дня, L ~неделя, XL > недели (на одного разработчика).

---

## 1. Бестиарий — 51 → 67+ врагов, полный канонический ростер

Текущее: **74 preset — 51/51 канонических обычных врагов и 7 недостающих боссов закрыты (✅)**.
Осталось: только полировка статов/дропов отдельных врагов под канон.

| Враг (канон) | Где появляется в оригинале | Оценка |
|---|---|---|
| Ancient Warrior | Birthplace of the Gods | S |
| Brain Bat | Valmar's Body | S |
| Big Foot | Lumir Forest, St. Heim Mtns, Pilgrim Road | S |
| Chameleon | St. Heim Mtns, Pilgrim Rd, Raul Hills, Cyrum passage | S |
| Clay Bird | Grail Mountain | S |
| Crimson Claw | Ceceile Reef, Grail Mountain | S |
| Death Doberman | Birthplace of the Gods | S |
| Desert Diver | Great Rift | S |
| Devil | Raul Hills Special Stage | S |
| Dino Freezer | Valmar's Body | S |
| Dodo | Black Forest, Inor Mtns, Baked Plains | S |
| Dragonoid | Raul Hills, Cyrum passage, Underground Plant | S |
| Emerald Bird | Birthplace of the Gods | S |
| Flame Toad | Ceceile Reef, Grail Mt, Ghoss West | S |
| Snow Leopard | Raul Hills Special Stage | S |
| Venomous Larva | Valmar's Body | ✅ |

**Боссы: ✅** Eye of Valmar, Crimson Tails, Naga Queens, Dual Fists, Birthplace Guardians,
Egg Guardian и полноценный Final Valmar добавлены как presets с фазами/призывами +
шаблоны и сценарии в песочнице (seeds 6767–7373).

DoD: **выполнено** — все 51/51 канонических обычных + 7 боссов в `PRESETS`, bestiary-группы,
travel encounters, портреты (80 SVG), `BESTIARY_AUDIT.md` = 100% канон-покрытие.

---

## 2. Предметы и экипировка — 29 → ~45 расходников, 66 → ~120 экипировки

Текущее: **57 расходников, 53 shop SKU, 126 экипировки (✅ основной канонический ассортимент закрыт)**.
Осталось: точечные дропы/редкости и часть аксессуаров — полировка, не каркас.

**Недостающие расходники (примерный список, ~15–20):**
Healing Fruit, Potion of Azure, Torte's Reedpipe, Smelling Salts, Blessing Scroll, Vaccine,
Butter Roll, Fresh Sandwich, Holy Ashes, Myriad Power Nut, Patience Nut, Swiftness Nut,
Slowpoke Nut, Sleep Charm, Confusion Charm, Paralysis Charm, Poison Charm, Move Block Charm,
Magic Block Charm, Healing Ring, Relief Tag, Dynamite, Hyper Mogay Bomb, Super Mogay Bomb,
Red Goblin Toad, Sandman Whiskers, Spiderweb, Snake Earrings, Toad Oil, Calming Harp,
Seed of Defense/Power/Swift/Spells, All-Around Seed, Omnipotent Seed, Icefang Stone, Electrum Stone.

**Недостающая экипировка (~50+):** оружие всех 6 героев по канону (Maken Valborg, Flamberge,
Silver Freeze, Holy Soul Blade, Blazing/Thor/Icefang swords, все клинки Tio/Roan/Millenia…),
headgear (Bandana, Guardian Hat, Iron Helm, Stone Head…), footwear (Elf King's Boots,
Charming Heels, Goddess Hi-Heels…), armor (Ancient Cuirass, Halo Armor, Moonstone Armor,
Sun Robe, Holy Clothes, Ninja Clothes…), аксессуары (Talisman, Phoenix Ring, Angel's Ring,
King's Pride, Kojin Charm, Dark Ring…).

DoD: **выполнено** — новые предметы работают в бою (оффенсивные бомбы/камни, лечение,
возрождение Holy Ashes, Spiderweb с moveBlock), в магазинах и drop tables; `FULL_CONTENT_AUDIT.md`
обновлён.

---

## 3. Магия: недостающие заклинания + уровни магии/приёмов + экипировка Mana Eggs

### 3.1 Недостающие канонические заклинания — ✅ **42/42**
`BOOM!`, `BA-BOOM!`, `Meteor Strike`, `GadZap`, `Poizn`, `Craze`, `Halvah` добавлены
(+ `Paralysis Wave` для врагов). Все школы обновлены в mana_eggs.js.

### 3.2 Уровни магии и special moves (Lv 1–5) — ✅
Канонические таблицы SC для всех приёмов героев (по гайдам Wulfson/Tricrokra) и MC для магии
(из таблиц Mana Eggs); `power`/`ipDamage` растут, `chargeMultiplier` ускоряется с уровнем;
skill screen показывает уровень и кнопки прокачки за SC/MC; уровни применяются в бою
через `fighter.actionLevels`.

### 3.3 Mana Eggs: из каталога в бой — ✅
Слоты яиц на героях (дефолт: Elena Holy, Millenia Chaos); надетое яйцо добавляет герою свои
заклинания и задаёт их уровень; прокачка яйца за MC; получение за контент: Mist (Durham),
Gravity (Fissure Depths), Soul (Ceceile Reef), Star (Demon's Law), Fairy (Raul Hills),
Dragon (Birthplace).

---

## 4. Статусы: `confusion` и `paralysis` — ✅
`confusion` (случайная цель, включая союзников; снимается ударом), `paralysis` (50% пропуск хода).
В движке, UI, AI-анализе, лечении (Halvah/Refresh/Panacea) и амулетах сопротивления.

Сейчас в движке: `sleep`, `moveBlock`, `magicBlock`, `poison`.
Канон добавляет: `confusion` (Craze — бьёт случайные цели/своих), `paralysis` (шанс пропуска хода).

DoD: оба статуса в `fighter.statuses`, в UI (иконки/баджи), в AI-анализе, в предметах
(Sleep Charm → sleep, Confusion Charm → confusion, Paralysis Charm → paralysis, Halvah → снятие всех),
в bestiary (сопротивления). Приоритет: **P1**.

---

## 5. Скрипт: расширение NPC-диалогов и room-покрытие — M

Текущее: 30 optional NPC dialogues, 46 location scenes, beat-скрипт 156 страниц.
Цель: у **каждой** локации кампании есть минимум 1–2 необязательных NPC/room-разговора
(≈ 50–60 диалогов суммарно), у каждого босса — defeat-реплики, у каждого бита — вариант
повторного прохождения (repeat-visit banter).

DoD: `SCRIPT_AUDIT.md` показывает 100% покрытие локаций NPC-слоем. Приоритет: **P2**.

---

## 6. Секреты и опциональный контент — M/L

- **Raul Hills Special Stage — ✅** опциональный данж (Snow Leopard, Devil, Dragon Knight, Яйцо Феи, 3 сундука), открывается после `flag_cyrum_war_room`.
- **Армрестлинг Хембла — ✅** мини-контест 3 раунда в палатке Цайрума; 2+ победы → Silver Freeze.
- **Carro в Durham Cave — ✅** 3 ореха Poff → Multiple Knife (расход предметов через `consumeItems`).
- **Elmo в Birthplace — ✅** «пощекотать Эльмо» → Hero's Elixir + MC.
- **Сундуки — ✅** 29 → 43 локаций (~60+ сундуков), включая все основные локации кампании.

---

## 7. Menu parity: консольная навигация и недостающие экраны — L

Текущее: 6 экранов (status/skills/eggs/items/bestiary/config) работают как лабы.
Цель:
- курсорная навигация (стрелки/Enter, списки-страницы) по всем экранам; **P1**
- equip flow с превью статов до/после; **P1**
- **magic egg equip screen** (надевание яиц на героев — см. 3.3); **P1**
- options: имя партии/героя, скорость текста, громкость (заглушка), сброс сохранений; **P2**
- экран «Valuables» (ключевые предметы — Roan's Medal, Book of Sages и т.д.); **P2**

DoD: `MENU_AUDIT.md` = все экраны 1:1 по функциям (не по пикселям). Приоритет: **P1**.

---

## 8. Арт: портреты и бэкдропы до 100% покрытия — M/L

Текущее: 57 unit-портретов, 4 battlefield, 11 region backdrops (остальные локации —
процедурный canvas-арт).
Цель:
- портрет для **каждого** enemy preset (после п.1 — 67+) и всех 6 героев; **P1**
- персональный backdrop-слой для всех ключевых локаций (99) — хотя бы 12 новых
  region-групп, остальные процедурные стилизации по state-профилю; **P2**
- босс-вариации портретов (фаза 2/3 — изменение палитры) — опционально. **P3**

---

## 9. Аудио: музыка и SFX — L (опциональная цель)

В оригинале культовый саундтрек (~40 треков). Реалистично для прототипа:
- WebAudio/синтез: 4–6 тематических лейтмотивов (боевая тема, город, данж, финал) + 8–10 SFX
  (удар, заклинание, хил, крит); **P2**
- переключатель звука в options (см. п.7). **P2**

Если аудио не нужно — помечаем как «вне 100%» и фиксируем в документе.

---

## 10. Баланс и QA после контентного закрытия — M

- Полный прогон `npm run balance` на новом ростере; цель: novice 55–65%, veteran 90–100%,
  скилл-гэп ≥ 25 п.п.; обновить `artifacts/ga_weights.json`. **P0** (после п.1–4)
- Полное прохождение кампании 19 битов без сломанных переходов (ручной smoke-тест). **P0**
- Все `npm run audit:*` зелёные после каждого п.1–8. **P0**

---

## Дорожная карта (фазы)

| Фаза | Содержание | Что даёт |
|---|---|---|
| **Фаза 1 — Каталоги** | п.1 (враги/боссы), п.2 (предметы/экипировка), п.3.1 (7 заклинаний), п.4 (статусы) | Content parity по спискам: 51/51 врагов, 42/42 spell, ~45 предметов, 2 статуса |
| **Фаза 2 — Системы** | п.3.2 (уровни), п.3.3 (экипировка яиц), п.6 (Special Stage, мини-игры), п.10 (баланс) | Полноценная прогрессия как в оригинале |
| **Фаза 3 — Parity/polish** | п.5 (скрипт), п.7 (меню-навигация), п.8 (арт), п.9 (аудио, опц.) | Внешний вид и ощущение оригинальных меню/сцен |
| **Фаза 4 — QA** | полный прогон кампании, регресс, обновление аудитов и артефактов | 100% по определению выше |

## Как измеряем прогресс

- `node scripts/generate_bestiary_audit.js` → `BESTIARY_AUDIT.md` (51/51 канон)
- `node scripts/generate_full_content_audit.js` → `FULL_CONTENT_AUDIT.md` (числа каталогов)
- `node scripts/generate_menu_audit.js` → `MENU_AUDIT.md`
- `node scripts/generate_script_audit.js` → `SCRIPT_AUDIT.md`
- `npm run balance` → винрейты novice/veteran

Единый чек-лист с галочками по всем пунктам — в `TODO.md` (раздел «Оставшиеся цели до 100%»).
