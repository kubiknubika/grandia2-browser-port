# Battle Design — Grandia II browser port

Ниже — не фантазии про «всё уже готово», а нормальный дизайн-док для следующей итерации боёвки.

## 1. Что берём из канона Grandia II

### Основа темпа боя
- В бою есть **IP Gauge** с участками **WAIT -> COM -> ACT**.
- Когда маркер бойца доходит до **COM**, игрок или AI выбирает действие.
- Само действие происходит только когда маркер доходит до **ACT**.
- Скорость движения по шкале завязана на **AGI / ACT**, а перемещение по полю — на **SPD / MOV**.

### Базовые команды
- **Combo** — быстрый базовый удар, в оригинале это 2 удара.
- **Critical** — более медленный одиночный удар, который отталкивает цель по IP Gauge и может **cancel**-ить действие.
- **Moves/Magic** — спецприёмы за **SP** и магия за **MP**.
- **Items** — предметы.
- **Defend** — снижение входящего урона.
- **Evade** — смена позиции, попытка уйти из радиуса обычной атаки.
- **Escape** — побег.

### Контроль поля и тайминги
- Сильная сторона Grandia II — не просто «урон в цифрах», а **контроль хода врага**:
  - delay / pushback по IP Gauge;
  - cancel в окне между COM и ACT;
  - counter, если попасть по цели в начале её действия;
  - позиционка: успел добежать / не успел добежать / ушёл из радиуса.

### Прогрессия
- У персонажей есть обычные уровни, но боевая глубина идёт ещё из 3 систем:
  1. **Moves** — личные спецприёмы;
  2. **Skill Books** — пассивки;
  3. **Mana Eggs** — магия.
- **Special Coins (SC)** тратятся на moves и физические/общие skills.
- **Magic Coins (MC)** тратятся на magic и магические skills.
- У moves / magic / skills есть уровни; рост уровня ускоряет срабатывание, а для moves и magic ещё и усиливает эффект.

### Статы, которые действительно нужны в порте
- Базовые: `HP, SP, MP, STR, VIT, AGI, SPD, MAG, MEN`
- Производные боевые: `ATK, DEF, ACT, MOV`

## 2. Минимальная аутентичная модель для браузерного порта

Наша цель — не идеально воспроизвести всю игру сразу, а собрать **рабочее ядро**, которое уже ощущается как Grandia II.

### Состав боя v1.0
- До **4 союзников**.
- От **1 до 5 врагов**.
- Один бой происходит на 2D-поле с реальными координатами.
- Каждый боец имеет:
  - текущую позицию;
  - радиус столкновения;
  - время добегания до цели;
  - текущий статус на IP Gauge;
  - выбранное действие и фазу его исполнения.

### Состояния бойца
```ts
idle -> waiting -> com -> charging -> moving -> acting -> recovery -> waiting
```

Дополнительно:
- `defending`
- `evading`
- `stunned/cancelled`
- `down`

## 3. Правила IP Gauge

### Шкала
Предлагаю нормализовать шкалу в **0..1000**:
- `0..699` = WAIT
- `700..799` = COM
- `800..1000` = ACT / resolve

Это не канонические цифры оригинала, а **удобная внутренняя модель** для реализации.

### Скорость движения
Предлагаемая формула на прототип:
```ts
ipSpeedPerSecond = ACT * actionStateMultiplier
```

Где:
- `ACT` — производный stat;
- `actionStateMultiplier = 1` в WAIT;
- на фазе charge скорость может зависеть от выбранного действия.

### Важный принцип
- **Combo** почти мгновенно уходит из COM в действие.
- **Critical** медленнее Combo.
- **Moves/Magic** имеют разный charge-time.
- При прокачке skill/magic charge-time уменьшается.

## 4. Команды и их поведение

### 4.1 Combo
Назначение:
- основной быстрый физический DPS;
- лучший способ добивать слабых врагов;
- хороший инструмент для counter.

Правила v1.0:
- 2 попадания по одной цели;
- если цель умерла после 1-го удара, 2-й удар переходит в ближайшую доступную цель;
- базовый IP pushback маленький;
- базовый charge-time минимальный.

Предлагаемые числа:
- `hits = 2`
- `powerPerHit = 0.58 * ATK`
- `ipDamagePerHit = 35`
- `chargeTime = 0.20s`

### 4.2 Critical
Назначение:
- не максимум урона, а **сбивание темпа врага**.

Правила v1.0:
- 1 удар;
- сильнее по IP damage, чем Combo;
- если попадание пришлось по врагу между COM и ACT, то действие врага **cancelled**;
- при cancel цель получает большой откат назад по шкале.

Предлагаемые числа:
- `power = 0.95 * ATK`
- `ipDamage = 180`
- `cancelWindow = [700..999]`
- `onCancelPushback = 260`
- `chargeTime = 0.55s`

### 4.3 Defend
В оригинале defend полезен, а не «кнопка для новичков». Так и делаем.

#### Endure
- мгновенное действие;
- снижает физический и магический урон;
- режет IP pushback;
- даёт чуть больше прироста SP при получении удара.

Предлагаемые числа:
- `damageTakenMultiplier = 0.35`
- `ipDamageTakenMultiplier = 0.40`
- `spGainOnHitMultiplier = 1.5`
- действует до следующего COM персонажа.

#### Evade
- мгновенный выбор точки на поле;
- персонаж перебегает в точку;
- обычные атаки и line/projectile-атаки могут промахнуться, если цель ушла из зоны попадания;
- magic и targeted special не evade-ятся автоматически.

### 4.4 Moves
Начинаем с **первых “фирменных” приёмов**, потому что они задают Grandia-ощущение:

- **Ryudo — Tenseiken Slash**
- **Elena — Impact Bomb**
- **Millenia — Arrow Shot**

Для v1.0 у всех троих это должны быть:
- single target;
- cancel-capable;
- умеренный HP damage;
- высокий IP damage;
- ощутимая, но не долгая анимация/charge.

### 4.5 Magic
Для первого среза не надо тащить все яйца и все школы сразу. Достаточно стартового набора ролей:
- heal single-target;
- fire nuke single/small-AoE;
- speed buff;
- defense buff;
- move buff;
- act/def debuff.

Стартовый пул на v1.0:
- `Heal`
- `Healer`
- `Burn!`
- `Runner`
- `Diggin'`
- `Speedy`
- `Stram`
- `Cold`

## 5. Позиционирование

Вот где прошлый бот врал сильнее всего: без позиционки это не Grandia.

### Поле
- прямоугольная арена, например `1280 x 720` в world-space;
- у каждого бойца есть `x/y`, `moveSpeed`, `hitRadius`, `hurtRadius`.

### Типы таргетинга
Нужно закладывать формы, которыми реально пользуется Grandia II:
- `single`
- `line`
- `smallCircle`
- `largeCircle`
- `allEnemies`
- `allAllies`

### Правило досягаемости
- физическая атака должна проверять, **успел ли боец добежать** до точки удара;
- если цель сместилась и вышла за пределы reach, удар может сорваться или уйти в новую ближайшую точку;
- ranged moves (вроде Arrow Shot / Impact Bomb) менее зависимы от подбегания.

## 6. SP / MP / экономика боя

### SP
Предлагаю модель:
- базовая атака даёт SP;
- получение урона даёт немного SP;
- блок под defend даёт SP чуть больше;
- moves расходуют SP.

Пример для прототипа:
- Combo hit landed: `+4 SP`
- Critical landed: `+5 SP`
- received hit: `+3 SP`
- received hit while defending: `+5 SP`

Это хорошо поддерживает Grandia-ритм: обычными действиями «раскачиваешься» в спецприёмы.

### MP
- magic только через Mana Egg loadout;
- стоимость MP фиксирована на заклинании;
- прокачка уровня magic уменьшает charge-time и увеличивает potency.

## 7. Статусы

На первую итерацию хватит такого набора:
- `poison`
- `sleep`
- `confusion`
- `paralysis`
- `moveBlock`
- `magicBlock`
- `fallen`

Но реально в v1.0 я бы включил только:
- `sleep`
- `moveBlock`
- `magicBlock`
- `fallen`

Остальные — вторым этапом.

## 8. Формулы для прототипа

Точные оригинальные формулы можно потом отдельно ресёрчить глубже. Сейчас нужна **честная, стабильная и тюнимaя** модель.

### Физический урон
```ts
physicalDamage = max(1, round((ATK * skillPower - DEF * defenseFactor) * variance))
```

Где:
- `skillPower`:
  - Combo hit = `0.58`
  - Critical = `0.95`
  - Tenseiken / Impact Bomb / Arrow Shot = `1.15`
- `defenseFactor = 0.45`
- `variance = random(0.94..1.06)`

### Магический урон
```ts
magicDamage = max(1, round((MAG * spellPower - MEN * 0.35) * elementalMultiplier * variance))
```

### Лечение
```ts
healAmount = round(MAG * 0.55 + MEN * 0.30 + spellBase)
```

## 9. AI, который будет ощущаться по-грандиевски

### Базовые приоритеты AI
1. Если враг почти дошёл до ACT и есть cancel-способность — **cancel**.
2. Если союзник в danger-zone — heal / defend.
3. Если 2+ цели можно задеть AoE — использовать AoE.
4. Если не хватает SP/MP — Combo / Critical.
5. Если цель далеко и есть ranged move — использовать ranged move.

### Роли
- **Bruiser** — ищет damage + cancel.
- **Caster** — держит distance, следит за ACT debuff / heals.
- **Harasser** — пытается ломать опасные касты и быстро добивать low HP цели.

## 10. Срезы разработки

### Vertical Slice A — честное ядро
- 2 героя vs 2 врага
- IP Gauge
- Combo / Critical / Endure / Evade
- один cancel move
- одна heal magic
- позиционка и line-of-hit

### Vertical Slice B — уже похоже на Grandia II
- 3 героя
- 6-8 spells / moves
- IP damage / cancel / counter
- AoE shapes
- базовый AI tactics profile

### Vertical Slice C — можно развивать дальше
- 4-членная партия
- Mana Eggs
- Skill Books
- инициативные старты боя: head-on / sneak / ambush
- больше статусов

## 11. Что я бы делал прямо сейчас в коде

Порядок работ:
1. Переписать боевую модель под **много бойцов**, а не 1v1.
2. Ввести отдельную сущность **IPGaugeTimeline**.
3. Развести `Combo`, `Critical`, `Move`, `Magic`, `DefendEndure`, `DefendEvade` в отдельные action-types.
4. Добавить реальные `position`, `moveTarget`, `castTarget`, `areaShape`.
5. После этого уже рисовать UI/IP-bar и лог.

## 12. Источники для канона и данных

- GameFAQs Dreamcast guide (MetroidMoo):
  https://gamefaqs.gamespot.com/dreamcast/197485-grandia-ii/faqs/30107
- GameFAQs PS2 guide (Shotgunnova):
  https://gamefaqs.gamespot.com/ps2/530934-grandia-ii/faqs/47099
- GameFAQs PC guide (King_Kamangren):
  https://gamefaqs.gamespot.com/pc/531098-grandia-ii/faqs/20327
- IGN walkthrough:
  https://www.ign.com/articles/2004/05/06/grandia-ii-walkthrough-511801

## Итог

Если коротко: нормальная боёвка для этого репо — это **не просто ATB-полоска и урон**, а связка из:
- IP Gauge,
- cancel / counter / delay,
- реального перемещения по полю,
- defend / evade,
- SP-спецприёмов,
- magic через Mana Eggs,
- и читаемого tactical AI.

Именно это даст ощущение «да, это уже похоже на Grandia II», а не очередной фейковый placeholder.
