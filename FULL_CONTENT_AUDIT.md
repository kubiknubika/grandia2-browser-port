# FULL_CONTENT_AUDIT

Этот файл честно проверяет не только **story campaign**, но и более широкий вопрос: насколько текущий browser port покрывает **всю оригинальную Grandia II** по контенту и presentation-слоям.

## Короткий вывод

- ✅ **Кампания / story spine:** 19/19 битов, story audit = 100/100.
- ❌ **Все оригинальные катсцены:** нет покадровой 1:1 реплики всего оригинала; есть 19 beat intro/victory flows, 46 location scenes и 17 bespoke setpieces.
- ❌ **Все оригинальные скиллы/магия:** нет; реализовано 138 боевых actions, но это не полный original move/magic list Grandia II.
- 🟡 **Все оригинальные меню:** нет; полного консольного 1:1 menu parity нет, но есть отдельные original-like screens: status / skills / mana eggs / items / bestiary / config — плюс handbook-панели и richer command menu.
- 🟡 **Все спрайты/арт-ассеты:** нет; полный 1:1 арт-порт отсутствует, но теперь в репозитории есть sprite/backdrop pipeline на 96 image assets.
- ✅ **Все основные играбельные герои партии:** да; Ryudo, Elena, Millenia, Tio, Roan, Mareg присутствуют.
- ❌ **Все оригинальные мобы/боссы:** нет; есть 74 enemy presets (52 с drop tables), это заметный curated subset, но не вся энциклопедия оригинала.
- ❌ **Все оригинальные предметы/экипировка:** нет; есть 57 inventory items, 53 shop SKUs и 126 equipment entries, это не весь original item database.
- ❌ **Все оригинальные секреты:** нет; есть 33 treasure nodes, 40 travel encounters и 96 world/event nodes, но это не полный secret compendium оригинала.
- 🟡 **Все оригинальные диалоги:** нет; story/dialogue coverage большая (234 dialogue blocks + 70 narration blocks + 30 optional NPC dialogues), но не весь original script.

## Что реально на 100%

- Story audit: **100% overall**, **100% beat coverage**.
- Все 9 арок и все 19 сюжетных битов закрыты по текущему internal audit.
- Для campaign-слоя есть **46** location scenes и **17** setpiece battle overrides.
- Основная играбельная партия присутствует полностью: ryudo, elena, tio, millenia, roan, mareg.
- World/campaign layer покрывает **99** локаций.

## Что не является 100% полной оригинальной Grandia II

### 1. Катсцены и полный script оригинала
- Есть сильное story-покрытие, но это не означает буквальное наличие **всех** оригинальных катсцен и **всех** строк оригинального сценария.
- Сейчас в данных найдено примерно **234 dialogue blocks** и **70 narration blocks**.
- Это много для browser-port prototype, но это не полноценная покадровая реконструкция original script/cutscene direction.

### 2. Скиллы, магия, умения
- Сейчас реализовано **138** боевых actions: combo, critical, endure, evade, tenseiken, impactBomb, nightmareBall, heal, medicinalHerb, antidote, woundSalve, healingHerb, eyeDrops, moveBlessing, magicBlessing, panacea, yomisElixir, blueberry, lumirFlower, healingIncense, wow, diggin, speedy, stram, cold, burn, zap, wingSlice, fallenWings, earthQuake, tornadoHorn, lotusFlower, webTrap, beastFangCut, poisonSpit, killerVoltage, destructionRay, spellbindDust, flyingTenseiken, purpleLightning, skyDragonSlash, dropletsOfLife, whiteApocalypse, goldenHammer, dragonRise, snowballFight, vitalityMarch, trueDragonRise, icePrison, beastKingSmash, beastKingBlast, lionsRoar, fastDanceWhirl, tornado, whisperToStars, arrowShot, heelCrush, starvingTongue, spellbindingEye, grudgingClaws, healer, healerPlus, alhealer, tremor, quake, crackle, crackling, snooze, shhh, fiora, gravity, cure, refresh, runner, burnflame, burnstrike, hellburner, howl, howlslash, howlnado, zapAll, dragonZap, freeze, defLoss, resurrect, boom, baBoom, meteorStrike, gadZap, poizn, craze, paralysisWave, halvah, scarletPotion, purifyingHerb, poffNut, seedOfLife, seedOfPsyche, seedOfMagic, manaCrystal, caterpillarSoup, paralysisSalve, firebomb, mogayBomb, handGrenade, meteorScroll, whirlwindScroll, scrollOfAlheal, healingFruit, potionOfAzure, tortesReedpipe, smellingSalts, blessingScroll, vaccine, holyAshes, myriadPowerNut, patienceNut, swiftnessNut, slowpokeNut, dynamite, hyperMogayBomb, superMogayBomb, redGoblinToad, sandmanWhiskers, spiderweb, toadOil, magicalMedicine, goldenPotion, heroElixir, demonAsh, redBirdStone, icefangStone, electrumStone, galeStone, flameStone, quakeStone, sympathyNut, seedOfRunning.
- Добавлен каталог **Mana Eggs** (8 яиц) с уровнями изучения и MC-ценами — magic egg layer теперь представим в UI.
- Это рабочая и уже богатая combat-система, но не полный original database всех skills / spells / special moves Grandia II.

### 3. Меню и UX оригинала
- Есть top-level browser sections: menu-screen, play-section, campaign-section, debug-section, compare-section.
- Есть play/campaign/debug/compare, replay viewer, compare lab, scenario browser, balance editor, stat editor, growth/equipment/quest/audit panels.
- Есть отдельные handbook/menu-style summaries для skills/magic, items, bestiary и progression внутри campaign UI.
- Добавлен отдельный **menu parity tab** с original-like screens: hero/status, skill screen, magic egg screen, item/bag/equipment screen, bestiary encyclopedia с drop tables и options screen.
- Но это **не** покадровый console-style 1:1 оригинала (нет консольной навигации курсором и полного набора оригинальных опций).

### 4. Спрайты и art pipeline
- Реальных image assets в репозитории: **96**.
- В battle/campaign presentation теперь есть SVG-based art pipeline для юнитов (включая новых), backdrops и menu hero.
- Но это всё ещё не полный 1:1 спрайтовый и иллюстрационный порт оригинала.

### 5. Герои, NPC, мобы
- Playable party presets: **6** → ryudo, elena, tio, millenia, roan, mareg.
- Enemy presets: **74** → milleniaShade, granasaberWarden, innerShadowRyudo, valmarCoreHerald, garmiaRuinCore, moonWombSentinel, melficeEcho, cathedralExecutioner, troglodyte, wingEye, guardian, tongueValmar, clawsValmar, heartValmar, zeraAvatar, durhamMinotaur, cragSnake, frostFrog, gargoyle, giantMantis, ghoul, hammerhead, hugeCaterpillar, hellHound, giantCrab, landCougar, fennyBird, manEatingTree, gigaMantis, salamadile, nyarmot, dragonKnight, evilManeuver, immuneCell, killerTree, mindEater, valmarMoth, valmarMagna, mottledSpider, sandman, pitViper, scalyWarrior, skullSnail, twinOgre, warpWarrior, veinBrain, starMirage, tarantula, valmarFly, valmarYoung, yeti, dodo, bigFoot, chameleon, dragonoid, flameToad, clayBird, crimsonClaw, desertDiver, brainBat, dinoFreezer, venomousLarva, devil, snowLeopard, emeraldBird, ancientWarrior, deathDoberman, eyeOfValmar, crimsonTails, nagaQueens, dualFists, birthplaceGuardian, eggGuardian, finalValmar.
- Drop tables: **52** enemy presets из 74 имеют авторские drop tables (по каноничным гайдам).
- Главная играбельная шестерка есть, но весь NPC roster и весь bestiary оригинала не закрыты.

### 6. Предметы, экипировка, секреты
- Inventory item catalog: **57**.
- Shop catalog: **53**.
- Equipment catalog: **126**.
- Treasure nodes: **33**.
- Travel encounter nodes: **40**.
- World event nodes: **39**.
- Additional scripted world events: **57**.
- Optional NPC dialogues: **30** (31 страниц).
- Это хороший campaign layer, но не полный original item/secret/dialogue completionist layer.

## Итоговая честная оценка

- **Сюжетная кампания как story-layer внутри этого browser port — действительно доведена до 100% по текущему internal audit.**
- **Но весь оригинальный Grandia II целиком по ассетам, полному script, всем меню, всем умениям, всем мобам, всем предметам и всем секретам — ещё не перенесён на 100%.**
- То есть: **story parity = да**, **full game content parity = пока нет**.

## Следующий логичный большой этап

Если идти дальше уже не по story spine, а по full-content parity, следующий этап должен быть отдельным и честно называться так:

1. Continue script/dialogue expansion into NPC optional conversations and room-specific side talk
2. Continue sprite/art presentation from the current SVG pipeline toward fuller character/location coverage
3. Secrets/NPC optional content pass
4. Continue enemy/bestiary expansion toward fuller original coverage
5. Push menu parity further into separate original-like hero/item/status screens

