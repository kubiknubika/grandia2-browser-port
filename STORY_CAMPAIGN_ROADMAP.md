# Story campaign roadmap

Этот файл — не пересказ, а именно план, как раскладывать сюжет Grandia II на последовательные игровые срезы внутри текущего браузерного прототипа.

## Цель

Сейчас проект очень силён как:
- battle sandbox,
- AI/debug lab,
- replay/compare tool.

Следующий логичный уровень — не просто добавлять новые механики, а упаковать их в **осмысленный сюжетный progression path**.

## Принцип

Каждый story slice должен содержать:
1. **нарративный контекст** — зачем бой вообще происходит;
2. **правильный состав партии**;
3. **правильный набор врагов/босса**;
4. **theme** поля боя;
5. **opening advantage**;
6. **1–2 уникальные механические идеи**, которые отражают сцену.

---

## Slice 01 — Failed Seal

### Сюжет
- Carbo Village;
- escort contract;
- Garmia Tower;
- провал ритуала.

### Что нужно в прототипе
- Ryudo + Elena;
- ранние простые враги;
- один маленький story boss;
- первый намёк на Millenia.

### Encounter shape
- mostly `Duel 2v2`;
- один `Mini-boss solo`.

### Mechanic focus
- basics;
- cancel;
- simple heal pressure.

---

## Slice 02 — Road Arc / Liligue

### Сюжет
- Agear;
- Durham Cave;
- Roan joins;
- Liligue ruins;
- Tongue of Valmar.

### Что нужно
- переход от “2 героя” к более сложной группе;
- первый серьёзный corrupted boss;
- первый dungeon-flow encounter chain.

### Encounter shape
- `Skirmish 3v3`;
- `Mini-boss solo` под Durham Minotaur;
- `Tongue of Valmar` template позже.

### Mechanic focus
- status pressure;
- первые большие руины;
- spatial control.

---

## Slice 03 — St. Heim / Cyrum / Tio

### Сюжет
- Zera sends the party after the Granasaber;
- Cyrum truth;
- underground plant;
- Claws of Valmar;
- Tio joins.

### Что нужно
- более техно-магическая атмосфера;
- элитные враги;
- encounters, где control важнее raw damage.

### Encounter shape
- `Guardian trial`;
- `Boss swarm test`;
- отдельный `Claws of Valmar` template.

### Mechanic focus
- moveBlock / magicBlock;
- line pressure;
- support/debuff magic becoming important.

---

## Slice 04 — Garlan / Melfice

### Сюжет
- возвращение Рьюдо домой;
- раскрытие правды о Рине;
- бой с Мелфисом.

### Что нужно
- личный, эмоциональный boss encounter;
- меньший scale, но выше драматичность.

### Encounter shape
- `Mini-boss solo` or `escort-like duel`.

### Mechanic focus
- single-target boss pressure;
- counters / cancels;
- Ryudo story-centric pacing.

---

## Slice 05 — Granasaber / Day of Darkness

### Сюжет
- Nanan;
- cyclone;
- discovery of Granasaber;
- Day of Darkness;
- Selene / Heart of Valmar;
- Zera reveal.

### Что нужно
- крупные encounter setpieces;
- переход от travel-RPG к apocalypse-scale battles.

### Encounter shape
- `Full party 4v4`;
- `Guardian trial`;
- custom `Heart of Valmar` fight.

### Mechanic focus
- mixed AoE pressure;
- support magic;
- boss phases;
- battlefield themes mattering more.

---

## Slice 06 — Moon / Birthplace / New Valmar

### Сюжет
- Moon of Valmar;
- Mareg sacrifice;
- Birthplace of the Gods;
- Ryudo inner trial;
- New Valmar;
- Zera finale.

### Что нужно
- сложные boss scripts;
- multiple phase encounters;
- symbolic, visually louder fights.

### Encounter shape
- `Mini-boss escort` for moon pressure;
- `Boss swarm test` for New Valmar internals;
- dedicated `Zera / Final Valmar` multi-stage boss template.

### Mechanic focus
- phase scripting;
- reactions;
- summons;
- terrain/theme gimmicks;
- support + debuff + burst coordination.

---

## Suggested new story beat ids for future use

Если захочется привязать battle logs и presets прямо к сюжету, я бы завёл такие stable ids:

- `failed_seal`
- `durham_cave_medal`
- `tongue_of_valmar`
- `st_heim_audience`
- `claws_of_valmar`
- `melfice_duel`
- `granasaber_cyclone`
- `day_of_darkness`
- `heart_of_valmar`
- `moon_escape`
- `birthplace_trial`
- `new_valmar_finale`

Их можно будет класть в:
- scenario presets,
- replay metadata,
- compare diff exports,
- future campaign save-state.

---

## Immediate practical next steps

### Very next
1. Добавить `storyBeatId` в экспорт battle log.
2. Сделать `story chapter selector` в debug UI.
3. Сконфигурировать 3–4 сюжетных боя из уже существующих templates.

### After that
4. Добавить отдельные boss templates:
   - Tongue of Valmar
   - Claws of Valmar
   - Heart of Valmar
   - Zera / New Valmar
5. Завести очень простой campaign flow: Next battle / Previous battle.
6. Привязать opening lines / victory lines к story beat id.

---

## Why this matters

Пока что проект уже отличный как техлаборатория. Но story roadmap нужен затем, чтобы:
- перестать теряться в “что делать дальше”; 
- понимать, **какие механики действительно нужны сюжету**;
- не строить боссов в вакууме;
- постепенно превращать sandbox в vertical slice кампании.
