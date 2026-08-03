# Story to encounters mapping

Этот файл связывает сюжетные арки Grandia II с тем, что уже есть в боевом прототипе, и тем, что логично строить дальше.

## 1. Что уже можно привязать к сюжету прямо сейчас

| Сюжетная арка | Что происходит | Уже подходящий шаблон в прототипе | Theme | Комментарий |
|---|---|---|---|---|
| Failed seal / Garmia | Срыв печати, первый кризис с Еленой | `Duel 2v2` / `Mini-boss solo` | `forest`, `cavern` | Хорошо подходит как ранний обучающий бой и первый spike-файт |
| Road to St. Heim | Дорожные столкновения, первые части Валмара | `Duel 2v2`, `Skirmish 3v3` | `forest`, `cavern` | Лучшая зона для обычных обучающих encounter-ов |
| Liligue / Tongue of Valmar | Порча города, вскрытие древних руин | `Skirmish 3v3` | `ruins` | Идеально под руины, контроль и смешанную группу мобов |
| Cyrum / Claws arc | Тайны Цайрума, древний комплекс, Тио | `Guardian trial`, `Boss swarm test` | `cavern`, `ruins` | Уже близко к midgame-dungeon боям |
| Melfice / Garlan | Личная драма Рьюдо | `Mini-boss escort`, `Mini-boss solo` | `forest`, `ruins` | Отлично работает как дуэльный или полу-дуэльный encounter |
| Granasaber / Demon's Law | Артефакты, древняя техника, escalation | `Full party 4v4` | `ruins`, `volcano` | Хорошо для больших партийных столкновений |
| Day of Darkness | Падение Святого Хайма, раскрытие Зеры | `Guardian trial`, `Boss swarm test` | `ruins` | Подходит под церковные элиты и волны врагов |
| Moon / sacrifice arc | Луна Валмара, жертва Марега | `Mini-boss escort`, `Boss swarm test` | `volcano` | Есть место и для линейного штурма, и для волнового давления |
| Birthplace of the Gods | Древние истины и внутреннее испытание | `Guardian trial`, `Mini-boss solo` | `ruins`, `cavern` | Хорошая зона для испытаний и артефактных боссов |
| New Valmar finale | Зера, ложная Милления, финальный спуск | `Boss swarm test`, `Mini-boss solo` | `volcano` | Финальная арка требует самых жирных boss templates |

## 2. Текущие encounter roles и их сюжетное применение

### Игроки
- **Ryudo** — frontline / cancel specialist
  - хорошо отражает его сюжетную роль как человека, который первым лезет в опасность и ломает чужой темп;
- **Elena** — support / light control
  - идеальна для сценариев, где важно удерживать партию и спасать её в кризис;
- **Tio** — fast utility / line pressure
  - подходит к dungeon-аркам про древние комплексы и техно-руины;
- **Millenia** — aoe-caster / dark burst
  - сильнее всего подходит к поздним аркам, где моральная серость и мощь Валмара выходят вперёд.

### Враги
- **Troglodyte** — bruiser
  - хороший ранний/средний “честный урон”;
- **Wing Eye** — controller / disruptor
  - хорошо чувствуется как pressure-support enemy;
- **Mottled Spider** — status harasser
  - добавляет грязный midgame pressure и раздражающие статусы;
- **Guardian** — elite caster
  - хорошо ложится на церковные/древнетехнологические encounter-ы;
- **Durham Minotaur** — mini-boss bruiser
  - хороший ранний или midgame spike boss.

## 3. Что уже просится в следующие boss templates

### Tongue of Valmar template
Что важно передать:
- body-horror;
- абсорбцию / пожирание;
- corruption-ауру;
- моральный дискомфорт, потому что цель раньше была человеком.

Механически это может быть:
- высокий single-target pressure;
- self-heal / devour move;
- phase trigger на low HP;
- summon small corrupted adds.

### Claws of Valmar template
Что важно передать:
- фабричную / механическую жуть;
- связь с Тио;
- ощущение, что это не просто монстр, а часть древней системы.

Механически:
- fast attacks;
- moveBlock / magicBlock;
- multi-part pressure;
- возможно, shared core + side parts.

### Heart of Valmar template
Что важно передать:
- религиозное предательство;
- Селену как фанатичную фигуру;
- почти апокалиптический scale.

Механически:
- holy-looking, but dark-meaning fight;
- mixed magic + control;
- phase transition в более агрессивную форму;
- party-wide pressure.

### Zera / New Valmar finale template
Что важно передать:
- фальшивое “светлое” лицо;
- манипуляцию;
- космический масштаб финала.

Механически:
- scripted phases;
- false-image / decoy gimmicks;
- summons or split formations;
- severe AoE + control windows.

## 4. Narrative campaign roadmap для прототипа

Если переводить сюжет в последовательность будущих играбельных battle slices, я бы шёл так:

1. **Chapter slice A — Carbo / Garmia**
   - базовые обучающие бои;
   - один story miniboss;
   - первая демонстрация Millenia.

2. **Chapter slice B — Agear / Durham / Liligue**
   - подключить Roan/Mareg conceptually;
   - сделать первый полноценный dungeon-flow;
   - Tongue of Valmar template.

3. **Chapter slice C — St. Heim / Cyrum**
   - Guardian/Claws-like encounters;
   - stronger dungeon scripting;
   - включить Tio в стабильную партию.

4. **Chapter slice D — Garlan / Melfice**
   - character-driven boss duel;
   - emphasis на Ryudo story beats.

5. **Chapter slice E — Granasaber / Day of Darkness**
   - большие encounter templates;
   - mixed party fights;
   - scripted religious-collapse scenarios.

6. **Chapter slice F — Moon / Birthplace / New Valmar**
   - сложные boss phase fights;
   - multi-stage finales;
   - финальный Zera / Valmar track.

## 5. Что делать следующим по сюжету

Самые практичные следующие шаги:

1. Завести **story chapter selector** в debug UI.
2. Создать отдельные encounter presets под:
   - Tongue of Valmar
   - Claws of Valmar
   - Heart of Valmar
   - Zera / New Valmar
3. Добавить в replay/export поле `storyBeatId`, чтобы логи можно было группировать не только по template, но и по сюжетной задаче.
4. После этого уже можно собирать прототип не как набор свободных песочниц, а как **вертикальный story slice**.
