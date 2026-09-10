/**
 * Headless-тесты боевой системы.
 *
 * BattleSystem не зависит от рендера напрямую: ему нужны только объекты с
 * .position/.lookAt и UI-контроллер. Подменяем их заглушками и гоняем бой в
 * ускоренном времени, проверяя инварианты (нет зависаний, бой заканчивается,
 * HP не уходит в минус, Cancel работает).
 *
 * Запуск: npm test
 */

import assert from 'node:assert/strict';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

import { BattleSystem } from '../src/system/BattleSystem.js';
import { makeUnitData, DEFAULT_ENCOUNTER, PARTY_ENCOUNTER } from '../src/data/battle_data.js';
import { COM_START, IP_MAX, PRESETS, ACTION_LIBRARY, getBattleStat } from '../src/entities/combat.js';
import { describeAction, describeNumbers } from '../src/data/action_text.js';

// --- Заглушки -------------------------------------------------------------

function makeMesh(x, z) {
    return {
        position: new Vector3(x, 0, z),
        lookAt() {},
        getAbsolutePosition() { return this.position; },
        getChildren() { return []; },
    };
}

/** Детерминированный ГПСЧ: тесты не должны мигать от прогона к прогону. */
function makeRng(seed) {
    let a = seed | 0;
    return () => {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** UI-заглушка, которая ещё и записывает всё показанное — удобно для ассертов. */
function makeUiStub({ autoCommand = null } = {}) {
    return {
        events: [],
        pendingRing: null,
        addUnit() {},
        updateUnit() {},
        markDead(unit) { this.events.push({ type: 'dead', id: unit.id }); },
        showFloatingText(_mesh, text) { this.events.push({ type: 'text', text: String(text) }); },
        flashMesh() {},
        showOutcome(outcome) { this.events.push({ type: 'outcome', outcome }); },
        showModelWarning() {},
        hideCommandRing() { this.pendingRing = null; },
        showCommandRing(unit, actions, onSelected) {
            this.events.push({ type: 'ring', id: unit.id, actions: actions.map((a) => a.id) });
            if (autoCommand) {
                const choice = autoCommand(unit, actions);
                // Имитируем клик игрока в следующем «кадре», а не синхронно.
                this.pendingRing = () => onSelected(choice.actionId, choice.target);
            } else {
                this.pendingRing = () => onSelected('combo', actions[0]?.targets?.[0] ?? null);
            }
        },
    };
}

function buildBattle({ autoCommand, encounter = DEFAULT_ENCOUNTER, inventory, rng } = {}) {
    const ui = makeUiStub({ autoCommand });
    const system = new BattleSystem(ui, { inventory, rng });

    for (const entry of encounter.players) {
        const { presetKey, ...rest } = entry;
        const data = makeUnitData(presetKey, rest);
        system.addUnit({ id: data.id, data, mesh: makeMesh(data.position.x, data.position.z) }, true);
    }
    for (const entry of encounter.enemies) {
        const { presetKey, ...rest } = entry;
        const data = makeUnitData(presetKey, rest);
        system.addUnit({ id: data.id, data, mesh: makeMesh(data.position.x, data.position.z) }, false);
    }

    return { system, ui };
}

/** Прогоняет бой фиксированным шагом, отвечая на кольцо команд. */
function runBattle(system, ui, { maxSeconds = 240, step = 1 / 60 } = {}) {
    let elapsed = 0;
    while (elapsed < maxSeconds && !system.outcome) {
        system.update(step);
        if (ui.pendingRing) {
            const respond = ui.pendingRing;
            ui.pendingRing = null;
            respond();
        }
        elapsed += step;
    }
    return elapsed;
}

// --- Тест-раннер ----------------------------------------------------------

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// --- Тесты ----------------------------------------------------------------

test('юниты стартуют с полным HP из канонических пресетов', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');

    assert.equal(ryudo.hp, 340, 'HP Рюдо должно браться из PRESETS.ryudo');
    assert.equal(ryudo.maxHp, 340);
    assert.ok(ryudo.str > 0 && ryudo.vit > 0, 'статы должны быть перенесены в корень юнита');

    // Пресет без правок энкаунтера отдаёт канонические числа.
    const canonical = makeUnitData('mottledSpider', { id: 'canon' });
    assert.equal(canonical.maxHp, 230, 'PRESETS.mottledSpider не должен меняться');
});

test('энкаунтер может переопределить статы, не трогая пресет', () => {
    // Пауки в DEFAULT_ENCOUNTER ослаблены под соло-бой Рюдо, но правка
    // обязана жить только в энкаунтере: PRESETS — общий источник правды.
    const { system } = buildBattle();
    const spider = system.units.find((u) => u.id === 'spider1');

    assert.equal(spider.maxHp, 58, 'в бою используется настройка энкаунтера');
    assert.equal(spider.hp, spider.maxHp, 'юнит стартует с полным HP');
    assert.equal(PRESETS.mottledSpider.maxHp, 230, 'канонический пресет не мутирован');
});

test('бой доходит до исхода и не зависает', () => {
    // Проверяем отсутствие зависаний, а НЕ конкретный исход: пауки в соло-бою
    // настроены так, что небрежная игра (только Combo) иногда проигрывает.
    // Сид фиксируем, чтобы тест не мигал от прогона к прогону.
    for (let seed = 1; seed <= 12; seed += 1) {
        const { system, ui } = buildBattle({
            rng: makeRng(seed),
            autoCommand: (unit, actions) => {
                const combo = actions.find((a) => a.id === 'combo' && a.enabled);
                return { actionId: combo.id, target: combo.targets[0] };
            },
        });

        const elapsed = runBattle(system, ui);
        assert.ok(
            system.outcome !== null,
            `сид ${seed}: бой не завершился за ${elapsed.toFixed(1)} с (зависание)`,
        );
        assert.ok(
            system.outcome === 'victory' || system.outcome === 'defeat',
            `сид ${seed}: неожиданный исход ${system.outcome}`,
        );
        assert.ok(ui.events.some((e) => e.type === 'outcome'), 'UI должен получить событие исхода');
    }
});

test('внимательная игра стабильно выигрывает соло-бой', () => {
    // Баланс: Рюдо один против двух пауков. Если игрок лечится и сбивает
    // заряженные ходы Critical'ом, бой должен выигрываться всегда.
    let wins = 0;
    const total = 12;

    for (let seed = 1; seed <= total; seed += 1) {
        const { system, ui } = buildBattle({
            rng: makeRng(seed),
            autoCommand: (unit, actions) => {
                const enabled = actions.filter((a) => a.enabled);
                const byId = (id) => enabled.find((a) => a.id === id);
                const foes = system.livingOpponents(unit);
                const weakest = [...foes].sort((a, b) => a.hp - b.hp)[0];

                if (byId('medicinalHerb') && unit.hp / unit.maxHp < 0.34) {
                    return { actionId: 'medicinalHerb', target: unit };
                }
                const charging = foes.find((f) => f.phase === 'COM' || f.phase === 'ACT');
                if (charging && byId('critical')) {
                    return { actionId: 'critical', target: charging };
                }
                if (byId('tenseiken') && weakest.hp > 60) {
                    return { actionId: 'tenseiken', target: weakest };
                }
                const combo = byId('combo') ?? enabled[0];
                return { actionId: combo.id, target: combo.targets?.[0] ?? null };
            },
        });

        runBattle(system, ui, { maxSeconds: 300 });
        if (system.outcome === 'victory') wins += 1;
    }

    assert.ok(wins >= total - 1, `внимательная игра должна побеждать: ${wins}/${total}`);
});

test('соло-бой не превращается в затяжную пилёжку', () => {
    // До настройки пауков бой шёл ~88 с почти без риска. Проверяем, что
    // он укладывается в разумное время при внимательной игре.
    const durations = [];

    for (let seed = 1; seed <= 6; seed += 1) {
        const { system, ui } = buildBattle({
            rng: makeRng(seed + 100),
            autoCommand: (unit, actions) => {
                const enabled = actions.filter((a) => a.enabled);
                const byId = (id) => enabled.find((a) => a.id === id);
                if (byId('medicinalHerb') && unit.hp / unit.maxHp < 0.34) {
                    return { actionId: 'medicinalHerb', target: unit };
                }
                const combo = byId('combo') ?? enabled[0];
                return { actionId: combo.id, target: combo.targets?.[0] ?? null };
            },
        });
        durations.push(runBattle(system, ui, { maxSeconds: 300 }));
    }

    durations.sort((a, b) => a - b);
    const median = durations[Math.floor(durations.length / 2)];
    assert.ok(median < 80, `бой слишком долгий: медиана ${median.toFixed(1)} с`);
    assert.ok(median > 15, `бой подозрительно короткий: медиана ${median.toFixed(1)} с`);
});

test('HP никогда не уходит в минус и мертвые не воскресают', () => {
    const { system, ui } = buildBattle({
        autoCommand: (unit, actions) => {
            const critical = actions.find((a) => a.id === 'critical' && a.enabled) ?? actions[0];
            return { actionId: critical.id, target: critical.targets[0] };
        },
    });

    let deaths = 0;
    const step = 1 / 60;
    for (let t = 0; t < 240 && !system.outcome; t += step) {
        system.update(step);
        if (ui.pendingRing) { const r = ui.pendingRing; ui.pendingRing = null; r(); }

        for (const unit of system.units) {
            assert.ok(unit.hp >= 0, `${unit.id} ушёл в отрицательное HP: ${unit.hp}`);
            assert.ok(unit.hp <= unit.maxHp, `${unit.id} превысил maxHp: ${unit.hp}/${unit.maxHp}`);
            if (unit.hp === 0) {
                assert.equal(unit.phase, 'DEAD', `${unit.id} с 0 HP должен быть в фазе DEAD`);
            }
        }
    }

    deaths = system.units.filter((u) => u.phase === 'DEAD').length;
    assert.ok(deaths > 0, 'кто-то должен был погибнуть за бой');
});

test('мёртвые юниты не действуют и не накапливают IP', () => {
    const { system, ui } = buildBattle({
        autoCommand: (unit, actions) => {
            const a = actions.find((x) => x.id === 'critical' && x.enabled) ?? actions[0];
            return { actionId: a.id, target: a.targets[0] };
        },
    });

    runBattle(system, ui);

    for (const unit of system.units.filter((u) => u.phase === 'DEAD')) {
        assert.equal(unit.ip, 0, `мёртвый ${unit.id} накопил IP`);
        assert.equal(unit.pendingAction, null, `мёртвый ${unit.id} сохранил действие`);
    }
});

test('Critical по юниту в фазе ACT срабатывает как CANCEL', () => {
    const { system, ui } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');
    const other = system.units.find((u) => u.id === 'spider2');
    other.hp = 0;
    other.phase = 'DEAD';

    // Ставим паука в занос удара.
    spider.phase = 'ACT';
    spider.ip = 900;
    spider.pendingAction = { definition: { chargeMultiplier: 1 }, targetId: 'ryudo' };

    system.applyIpDamage(spider, { cancel: true, cancelPushback: 260, ipDamage: 180 });

    assert.equal(spider.phase, 'WAIT', 'цель должна быть сбита в WAIT');
    assert.equal(spider.ip, 640, 'IP должен откатиться на cancelPushback');
    assert.equal(spider.pendingAction, null, 'подготовленное действие должно потеряться');
    assert.ok(ui.events.some((e) => e.text === 'CANCEL!'), 'должна показаться надпись CANCEL!');
});

test('приём в фазе EXECUTE не сбивается — урон дойдёт', () => {
    // Регрессия: когда отмена работала и в EXECUTE, взаимные атаки в начале
    // боя гасили друг друга и никто не получал урона вовсе.
    const { system } = buildBattle();
    const spider = system.units.find((u) => u.id === 'spider1');
    spider.phase = 'EXECUTE';
    spider.ip = IP_MAX;
    spider.hitsDone = 0;
    spider.pendingAction = { definition: { id: 'bite', power: 1 } };

    system.applyIpDamage(spider, { cancel: true, cancelPushback: 260, ipDamage: 180 });

    assert.equal(spider.phase, 'EXECUTE', 'начатый приём отыгрывается до конца');
    assert.ok(spider.pendingAction, 'приём не должен теряться');
    assert.equal(spider.ip, IP_MAX);
});

test('размен ударами в начале боя доводит урон до обеих сторон', () => {
    // Прямая проверка жалобы: раньше первое же combo обнуляло и урон Рюдо,
    // и урон пауков — бой начинался с обоюдного «ничего не произошло».
    const { system, ui } = buildBattle({
        autoCommand: (unit, actions) => {
            const combo = actions.find((a) => a.id === 'combo' && a.enabled);
            return { actionId: combo.id, target: combo.targets[0] };
        },
        rng: makeRng(7),
    });

    runBattle(system, ui, { maxSeconds: 60 });

    const cancels = ui.events.filter((e) => e.type === 'text' && e.text === 'CANCEL!');
    assert.equal(cancels.length, 0, 'обычное combo не должно ничего отменять');

    const ryudo = system.units.find((u) => u.id === 'ryudo');
    assert.ok(ryudo.hp < ryudo.maxHp, 'пауки должны были нанести урон Рюдо');
    assert.equal(system.outcome, 'victory');
});

test('описания баффов не содержат NaN', () => {
    // Поле в ACTION_LIBRARY называется amount, а текст читал shift.stages —
    // из-за этого Runner описывался как "NaN скорость бега".
    const runner = ACTION_LIBRARY.runner;
    const text = `${describeAction(runner)} ${describeNumbers(runner)}`;

    assert.ok(!text.includes('NaN'), `в описании Runner есть NaN: ${text}`);
    assert.ok(/\+1 скорость бега/.test(text), `ожидался бафф скорости: ${text}`);

    // И ни у одного из 138 приёмов тоже.
    for (const definition of Object.values(ACTION_LIBRARY)) {
        const full = `${describeAction(definition)} ${describeNumbers(definition)}`;
        assert.ok(!full.includes('NaN'), `NaN в описании ${definition.id}: ${full}`);
    }
});

test('пока идёт спецприём, чужие шкалы IP стоят', () => {
    // Спецприём — отдельная сцена: остальные замирают, IP не капает.
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.phase = 'EXECUTE';
    ryudo.actionState = 'ATTACK';
    ryudo.attackTimer = 5;
    ryudo.hitsDone = 0;
    ryudo.pendingAction = { definition: ACTION_LIBRARY.tenseiken };

    spider.phase = 'WAIT';
    spider.ip = 100;
    const before = spider.ip;

    for (let i = 0; i < 30; i += 1) system.update(1 / 60);

    assert.equal(spider.ip, before, 'IP наблюдателя не должен расти во время приёма');
});

test('обычная атака сцену не останавливает', () => {
    // Иначе бой превратился бы в пошаговую очередь.
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.phase = 'EXECUTE';
    ryudo.actionState = 'ATTACK';
    ryudo.attackTimer = 5;
    ryudo.hitsDone = 0;
    ryudo.pendingAction = { definition: ACTION_LIBRARY.combo };

    spider.phase = 'WAIT';
    spider.ip = 100;

    for (let i = 0; i < 30; i += 1) system.update(1 / 60);

    assert.ok(spider.ip > 100, 'на обычной атаке шкалы продолжают идти');
});

test('попадание подсвечивает цель и её иконку на шкале IP', () => {
    const { system, ui } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    const flashed = [];
    ui.flashGaugeIcon = (id) => flashed.push(id);

    system.dealDamage(ryudo, spider, { power: 1 }, 10);

    assert.ok(flashed.includes('spider1'), 'иконка цели на шкале должна вспыхнуть');
});

test('обычный откат по IP не опускает ниже нуля и не выше COM', () => {
    const { system } = buildBattle();
    const spider = system.units.find((u) => u.id === 'spider1');
    spider.phase = 'WAIT';
    spider.ip = 50;

    system.applyIpDamage(spider, { ipDamage: 180 });
    assert.equal(spider.ip, 0, 'IP не должен уходить в минус');
});

test('одновременный выход двух игроков на COM не вешает очередь', () => {
    const encounter = {
        players: [
            { presetKey: 'ryudo', id: 'ryudo', position: { x: -6, z: 0 } },
            { presetKey: 'elena', id: 'elena', position: { x: -6, z: 4 } },
        ],
        enemies: [
            { presetKey: 'mottledSpider', id: 'spider1', position: { x: 4, z: 3 } },
        ],
    };

    const { system, ui } = buildBattle({
        encounter,
        autoCommand: (unit, actions) => {
            const combo = actions.find((a) => a.id === 'combo' && a.enabled) ?? actions[0];
            return { actionId: combo.id, target: combo.targets[0] };
        },
    });

    // Принудительно выставляем обоих ровно на COM в одном кадре — именно этот
    // сценарий раньше приводил к «зависанию» одного из юнитов на шкале.
    for (const unit of system.units.filter((u) => u.isPlayer)) {
        unit.ip = COM_START - 1;
    }

    const elapsed = runBattle(system, ui, { maxSeconds: 240 });

    assert.ok(system.outcome !== null, `бой завис на ${elapsed.toFixed(1)} с`);
    const rings = ui.events.filter((e) => e.type === 'ring').map((e) => e.id);
    assert.ok(rings.includes('ryudo'), 'Рюдо должен был получить ход');
    assert.ok(rings.includes('elena'), 'Елена должна была получить ход, а не зависнуть');
});

test('ни один живой юнит не стоит в COM дольше секунды без запроса приказа', () => {
    // Прямая проверка бага из ARCHITECTURE.md: юнит доходил до COM и застревал
    // там навсегда, если в тот же кадр до COM дошёл кто-то ещё.
    const encounter = {
        players: [
            { presetKey: 'ryudo', id: 'ryudo', position: { x: -6, z: 0 } },
            { presetKey: 'elena', id: 'elena', position: { x: -6, z: 4 } },
        ],
        enemies: [
            { presetKey: 'mottledSpider', id: 'spider1', position: { x: 4, z: 3 } },
            { presetKey: 'mottledSpider', id: 'spider2', position: { x: 5, z: -2 } },
        ],
    };

    const { system, ui } = buildBattle({
        encounter,
        autoCommand: (unit, actions) => {
            const combo = actions.find((a) => a.id === 'combo' && a.enabled) ?? actions[0];
            return { actionId: combo.id, target: combo.targets[0] };
        },
    });

    for (const unit of system.units.filter((u) => u.isPlayer)) {
        unit.ip = COM_START - 1;
    }

    const step = 1 / 60;
    const stuckFor = new Map();

    for (let t = 0; t < 240 && !system.outcome; t += step) {
        system.update(step);
        if (ui.pendingRing) { const r = ui.pendingRing; ui.pendingRing = null; r(); }

        for (const unit of system.units) {
            const waitingForOrders = unit.phase === 'COM'
                && unit.hp > 0
                && unit.isPlayer
                && system.awaitingInput !== unit;

            const elapsed = waitingForOrders ? (stuckFor.get(unit.id) ?? 0) + step : 0;
            stuckFor.set(unit.id, elapsed);

            assert.ok(
                elapsed < 1,
                `${unit.id} застрял в фазе COM на ${elapsed.toFixed(2)} с без кольца команд`,
            );
        }
    }

    assert.ok(system.outcome !== null, 'бой должен завершиться');
});

test('Endure снижает урон и не тратит фазу EXECUTE', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.phase = 'COM';
    system.commitAction(ryudo, 'endure');
    assert.equal(ryudo.guard, 'endure', 'Endure должен выставить защиту');
    assert.equal(ryudo.phase, 'WAIT', 'мгновенное действие возвращает юнита в WAIT');
    assert.equal(ryudo.ip, 0);

    const before = ryudo.hp;
    system.applyHit(spider, ryudo, { power: 1, hitCount: 1, ipDamage: 0 });
    const guarded = before - ryudo.hp;

    ryudo.guard = null;
    ryudo.hp = before;
    system.applyHit(spider, ryudo, { power: 1, hitCount: 1, ipDamage: 0 });
    const unguarded = before - ryudo.hp;

    assert.ok(guarded < unguarded, `Endure должен снижать урон (${guarded} vs ${unguarded})`);
});

test('лечение не превышает maxHp', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.hp = ryudo.maxHp - 5;

    system.applyHeal(ryudo, ryudo, { powerBase: 200 });
    assert.equal(ryudo.hp, ryudo.maxHp, 'HP не должно переполняться');
});

test('стоимость SP/MP списывается при подтверждении приёма', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.sp = 100;
    ryudo.phase = 'COM';
    system.commitAction(ryudo, 'tenseiken', spider);

    assert.equal(ryudo.sp, 76, 'Tenseiken стоит 24 SP');
    assert.equal(ryudo.phase, 'ACT');
});

test('недоступные по ресурсам действия помечаются disabled', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.sp = 0;

    const actions = system.getAvailableActions(ryudo);
    const tenseiken = actions.find((a) => a.id === 'tenseiken');

    assert.ok(tenseiken, 'приём должен быть в списке');
    assert.equal(tenseiken.enabled, false, 'без SP приём должен быть недоступен');
    assert.equal(actions.find((a) => a.id === 'combo').enabled, true, 'Combo бесплатен');
});

test('большая дельта кадра не телепортирует юнита сквозь цель', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.phase = 'EXECUTE';
    ryudo.pendingAction = { definition: { power: 0.58, hitCount: 2, melee: true, ipDamage: 35 } };
    ryudo.target = spider;

    const start = ryudo.mesh.position.clone();
    const maxStep = system.moveSpeed(ryudo) * 0.05; // MAX_DELTA

    // Вкладка была свёрнута: движок отдаёт дельту в 2 секунды.
    system.update(2);

    const travelled = Vector3.Distance(start, ryudo.mesh.position);
    assert.ok(
        travelled <= maxStep + 1e-6,
        `за один кадр пройдено ${travelled.toFixed(2)} при лимите ${maxStep.toFixed(2)} — дельта не ограничена`,
    );

    const distance = Vector3.Distance(ryudo.mesh.position, spider.mesh.position);
    assert.ok(distance > 0.5, `юнит не должен оказаться внутри цели (dist=${distance.toFixed(2)})`);
});

test('IP не накапливается во время паузы на выбор команды', () => {
    const { system } = buildBattle();
    const spider = system.units.find((u) => u.id === 'spider1');

    system.isPaused = true;
    const before = spider.ip;
    for (let i = 0; i < 60; i += 1) system.update(1 / 60);

    assert.equal(spider.ip, before, 'на паузе шкала IP должна стоять');
});

// --- Перенесённые из оригинала механики -----------------------------------

test('яд снимает HP в начале хода и сам истекает', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.statuses.poison = 2;

    const before = ryudo.hp;
    const skipped = system.processTurnStartStatuses(ryudo);

    const expected = Math.max(1, Math.round(ryudo.maxHp * 0.06));
    assert.equal(before - ryudo.hp, expected, 'яд снимает 6% от максимума HP');
    assert.equal(ryudo.statuses.poison, 1, 'счётчик яда должен уменьшаться');
    assert.equal(skipped, false, 'яд сам по себе не отнимает ход');
});

test('яд может добить юнита и это корректно обрабатывается', () => {
    const { system, ui } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.statuses.poison = 3;
    ryudo.hp = 1;

    const skipped = system.processTurnStartStatuses(ryudo);

    assert.equal(ryudo.hp, 0);
    assert.equal(ryudo.phase, 'DEAD');
    assert.equal(skipped, true, 'мёртвый не ходит');
    assert.ok(ui.events.some((e) => e.type === 'dead' && e.id === 'ryudo'));
});

test('сон отнимает ход, а урон будит', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.statuses.sleep = 2;
    assert.equal(system.processTurnStartStatuses(ryudo), true, 'спящий теряет ход');
    assert.equal(ryudo.ip, 0, 'после потери хода шкала сбрасывается');

    ryudo.statuses.sleep = 2;
    system.applyHit(spider, ryudo, { power: 1, hitCount: 1, ipDamage: 0 });
    assert.equal(ryudo.statuses.sleep, 0, 'урон должен будить');
});

test('Endure режет и урон, и откат по шкале IP', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');
    const definition = { power: 1, hitCount: 1, ipDamage: 100 };

    ryudo.ip = 500;
    ryudo.guard = null;
    system.applyHit(spider, ryudo, definition);
    const normalPushback = 500 - ryudo.ip;

    ryudo.ip = 500;
    ryudo.guard = 'endure';
    system.applyHit(spider, ryudo, definition);
    const endurePushback = 500 - ryudo.ip;

    assert.ok(endurePushback < normalPushback, `Endure должен смягчать откат (${endurePushback} vs ${normalPushback})`);
    assert.equal(endurePushback, Math.round(normalPushback * 0.4), 'откат режется до 40%');
});

test('контрудар: попадание по юниту с IP>=930 усилено', () => {
    const { system, ui } = buildBattle({ rng: () => 0.5 });
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');
    const definition = { power: 1, hitCount: 1, ipDamage: 0 };

    // Обычное попадание.
    ryudo.ip = 100;
    ryudo.pendingAction = null;
    const hpBefore = ryudo.hp;
    system.applyHit(spider, ryudo, definition);
    const normal = hpBefore - ryudo.hp;

    // Цель уже занесла оружие.
    ryudo.hp = hpBefore;
    ryudo.ip = 950;
    ryudo.pendingAction = { definition: { chargeMultiplier: 1 } };
    system.applyHit(spider, ryudo, definition);
    const counter = hpBefore - ryudo.hp;

    assert.ok(counter > normal, `контрудар должен быть сильнее (${counter} vs ${normal})`);
    assert.ok(ui.events.some((e) => e.text === 'COUNTER!'), 'должна показаться надпись COUNTER!');
});

test('защищающийся копит SP за полученный удар', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.sp = 0;
    system.applyHit(spider, ryudo, { power: 1, hitCount: 1, ipDamage: 0 });
    assert.equal(ryudo.sp, 3, 'обычный удар даёт цели 3 SP');

    ryudo.sp = 0;
    ryudo.guard = 'endure';
    system.applyHit(spider, ryudo, { power: 1, hitCount: 1, ipDamage: 0 });
    assert.equal(ryudo.sp, 5, 'при Endure цель получает 5 SP');
});

test('магия учитывает стихию и сопротивление цели', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER, rng: () => 0.5 });
    const elena = system.units.find((u) => u.id === 'elena');
    const spider = system.units.find((u) => u.id === 'spider1');

    // У пятнистого паука resistances.fire = 1.2 (уязвим к огню).
    assert.equal(spider.resistances.fire, 1.2, 'предпосылка теста: паук уязвим к огню');

    const definition = { kind: 'magic', spellPower: 0.92, spellBase: 18, ipDamage: 0 };

    const before = spider.hp;
    system.applyMagicHit(elena, spider, { ...definition, element: 'fire' });
    const fire = before - spider.hp;

    spider.hp = before;
    system.applyMagicHit(elena, spider, { ...definition, element: null });
    const neutral = before - spider.hp;

    assert.ok(fire > neutral, `огонь должен бить больнее (${fire} vs ${neutral})`);
});

test('статусный приём накладывает статус с учётом сопротивления', () => {
    const { system } = buildBattle({ rng: () => 0 }); // rng=0 -> шанс всегда срабатывает
    const spider = system.units.find((u) => u.id === 'spider1');
    const ryudo = system.units.find((u) => u.id === 'ryudo');

    system.applySupportEffects(spider, ryudo, {
        statusEffects: [{ name: 'poison', turns: 3, chance: 0.88 }],
    });

    assert.equal(ryudo.statuses.poison, 3, 'яд должен наложиться');
});

test('баффы поднимают стат и истекают со временем', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');

    const before = getBattleStat(ryudo, 'MOV');
    system.applySupportEffects(ryudo, ryudo, {
        statShifts: [{ stat: 'mov', amount: 1, turns: 2, target: 'ally' }],
    });

    assert.ok(getBattleStat(ryudo, 'MOV') > before, 'Runner должен ускорять бег');

    // Два начала хода — и бафф истекает.
    system.processTurnStartStatuses(ryudo);
    system.processTurnStartStatuses(ryudo);
    assert.equal(getBattleStat(ryudo, 'MOV'), before, 'бафф должен истечь');
});

test('предмет лечит и тратится из общего инвентаря', () => {
    const { system } = buildBattle({ inventory: { medicinalHerb: 2 } });
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.hp = 100;

    const definition = system.getDefinition(ryudo, 'medicinalHerb');
    system.applyInstantAction(ryudo, definition, ryudo);

    assert.equal(ryudo.hp, 178, 'Medicinal Herb лечит на 78');
    assert.equal(system.inventory.medicinalHerb, 1, 'предмет должен списаться');
});

test('предмет с нулевым остатком недоступен в кольце', () => {
    const { system } = buildBattle({ inventory: { medicinalHerb: 0, antidote: 1 } });
    const ryudo = system.units.find((u) => u.id === 'ryudo');

    const actions = system.getAvailableActions(ryudo);
    assert.ok(!actions.some((a) => a.id === 'medicinalHerb'), 'закончившийся предмет не показывается');
    assert.ok(actions.some((a) => a.id === 'antidote'), 'доступный предмет показывается');
});

test('антидот снимает яд', () => {
    const { system } = buildBattle({ inventory: { antidote: 1 } });
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    ryudo.statuses.poison = 3;

    system.applyInstantAction(ryudo, system.getDefinition(ryudo, 'antidote'), ryudo);
    assert.equal(ryudo.statuses.poison, 0, 'яд должен быть снят');
});

test('воскрешение поднимает павшего союзника', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER, inventory: { yomisElixir: 1 } });
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const elena = system.units.find((u) => u.id === 'elena');

    elena.hp = 0;
    system.handleDeath(elena);
    assert.equal(elena.phase, 'DEAD');

    system.applyInstantAction(ryudo, system.getDefinition(ryudo, 'yomisElixir'), elena);

    assert.ok(elena.hp > 0, 'союзник должен ожить');
    assert.equal(elena.phase, 'WAIT', 'и вернуться в бой');
});

test('magicBlock запрещает магию, но не обычную атаку', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const elena = system.units.find((u) => u.id === 'elena');
    elena.mp = elena.maxMp;
    elena.statuses.magicBlock = 2;

    const actions = system.getAvailableActions(elena);
    const heal = actions.find((a) => a.id === 'heal');
    const combo = actions.find((a) => a.id === 'combo');

    assert.equal(heal.enabled, false, 'магия должна быть запечатана');
    assert.equal(heal.disabledReason, 'magic sealed');
    assert.equal(combo.enabled, true, 'обычная атака доступна');
});

test('moveBlock не даёт подбегать к цели', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.statuses.moveBlock = 2;
    ryudo.phase = 'EXECUTE';
    ryudo.pendingAction = { definition: { power: 0.58, hitCount: 1, melee: true, ipDamage: 0 } };
    ryudo.target = spider;

    const start = ryudo.mesh.position.clone();
    system.update(1 / 60);

    assert.equal(Vector3.Distance(start, ryudo.mesh.position), 0, 'юнит не должен сдвинуться');
    assert.equal(ryudo.actionState, 'ATTACK', 'он бьёт с места');
});

test('групповая атака задевает всех живых врагов', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const enemies = system.units.filter((u) => !u.isPlayer);
    const before = enemies.map((e) => e.hp);

    const definition = system.getDefinition(ryudo, 'skyDragonSlash');
    assert.equal(definition.targeting, 'all-enemies', 'предпосылка: приём групповой');

    const targets = system.resolveTargets(ryudo, definition);
    assert.equal(targets.length, enemies.length, 'должны попасть под удар все враги');

    system.applyActionToTargets(ryudo, definition, targets);
    enemies.forEach((enemy, index) => {
        assert.ok(enemy.hp < before[index], `${enemy.id} должен получить урон`);
    });
});

test('лечение и воскрешение выбирают правильные цели', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const elena = system.units.find((u) => u.id === 'elena');
    const ryudo = system.units.find((u) => u.id === 'ryudo');

    ryudo.hp = 50;
    const healTarget = system.pickDefaultTarget(elena, system.getDefinition(elena, 'heal'));
    assert.equal(healTarget.id, 'ryudo', 'лечим самого раненого');

    ryudo.hp = 0;
    system.handleDeath(ryudo);
    const reviveTarget = system.pickDefaultTarget(elena, system.getDefinition(elena, 'resurrect'));
    assert.equal(reviveTarget.id, 'ryudo', 'воскрешаем павшего');
});

test('кольцо команд содержит магию Елены и предметы партии', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER, inventory: { medicinalHerb: 2 } });
    const elena = system.units.find((u) => u.id === 'elena');
    elena.mp = elena.maxMp;

    const actions = system.getAvailableActions(elena);
    const ids = actions.map((a) => a.id);

    assert.ok(ids.includes('heal'), 'должно быть лечение');
    assert.ok(ids.includes('burn'), 'должна быть атакующая магия');
    assert.ok(ids.includes('medicinalHerb'), 'должны быть предметы');
    assert.ok(ids.includes('endure') && ids.includes('evade'), 'должна быть защита');

    // Категории идут в каноничном порядке.
    const order = actions.map((a) => a.category);
    const sorted = [...order].sort(
        (a, b) => ['basic', 'move', 'magic', 'item', 'defense'].indexOf(a)
                - ['basic', 'move', 'magic', 'item', 'defense'].indexOf(b),
    );
    assert.deepEqual(order, sorted, 'команды должны быть сгруппированы по категориям');
});

test('враг применяет статусные приёмы из своего loadout', () => {
    // rng=0.1 -> проходит проверка шанса 0.35 на статусный приём.
    const { system } = buildBattle({ rng: () => 0.1 });
    const spider = system.units.find((u) => u.id === 'spider1');
    spider.sp = spider.maxSp;

    const choice = system.chooseEnemyAction(spider);
    assert.ok(
        ['poisonSpit', 'spellbindDust'].includes(choice.actionId),
        `паук должен использовать статусный приём, а не ${choice.actionId}`,
    );
});

test('бой с полным набором механик доходит до конца', () => {
    // Игрок использует всё подряд, включая магию и предметы.
    const { system, ui } = buildBattle({
        autoCommand: (unit, actions) => {
            const usable = actions.filter((a) => a.enabled);
            const action = usable[Math.floor(Math.random() * usable.length)] ?? actions[0];
            return { actionId: action.id, target: action.targets[0] ?? null };
        },
    });

    const elapsed = runBattle(system, ui, { maxSeconds: 400 });
    assert.ok(system.outcome !== null, `бой завис на ${elapsed.toFixed(1)} с`);

    for (const unit of system.units) {
        assert.ok(unit.hp >= 0 && unit.hp <= unit.maxHp, `${unit.id}: HP вне диапазона`);
        assert.ok(unit.sp >= 0 && unit.sp <= unit.maxSp, `${unit.id}: SP вне диапазона`);
        assert.ok(unit.mp >= 0 && unit.mp <= unit.maxMp, `${unit.id}: MP вне диапазона`);
    }
    for (const [key, count] of Object.entries(system.inventory)) {
        assert.ok(count >= 0, `инвентарь ушёл в минус: ${key}=${count}`);
    }
});


// --- Приёмы бьют с места, а не подбегают ----------------------------------

test('спецприём выполняется без подбегания к цели', () => {
    // Раньше любой melee-приём гнал юнита через всю арену; теперь бежит
    // только обычная атака, а приёмы играются на своей позиции.
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    ryudo.sp = 100;
    const start = ryudo.mesh.position.clone();
    system.commitAction(ryudo, 'tenseiken', spider);

    // commitAction переводит в ACT; до EXECUTE юнит доходит по шкале IP.
    let travelled = 0;
    for (let i = 0; i < 1200 && spider.hp === spider.maxHp; i += 1) {
        system.update(1 / 60);
        travelled = Math.max(travelled, Vector3.Distance(start, ryudo.mesh.position));
    }

    assert.ok(travelled < 0.5, `приём не должен двигать юнита, сместился на ${travelled.toFixed(2)}`);
    assert.ok(spider.hp < spider.maxHp, 'приём всё равно обязан нанести урон');
});

test('обычная атака по-прежнему подбегает к цели', () => {
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    const start = ryudo.mesh.position.clone();
    system.commitAction(ryudo, 'combo', spider);

    let travelled = 0;
    for (let i = 0; i < 1200 && spider.hp === spider.maxHp; i += 1) {
        system.update(1 / 60);
        travelled = Math.max(travelled, Vector3.Distance(start, ryudo.mesh.position));
    }

    assert.ok(travelled > 2, `Combo должен сближать с целью, сместился на ${travelled.toFixed(2)}`);
});

test('длинный приём тратит своё animationSeconds', () => {
    // Приём с места не должен срабатывать мгновенно — иначе нет анимации.
    const { system } = buildBattle();
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const spider = system.units.find((u) => u.id === 'spider1');

    const definition = system.getDefinition(ryudo, 'tenseiken');
    assert.ok(definition.animationSeconds > 0, 'предпосылка: у приёма есть длительность');

    ryudo.sp = 100;
    const hpBefore = spider.hp;
    system.commitAction(ryudo, 'tenseiken', spider);

    // Считаем время с момента входа в EXECUTE до попадания.
    let elapsed = 0;
    let executing = false;
    for (let i = 0; i < 1200 && spider.hp === hpBefore; i += 1) {
        system.update(1 / 60);
        if (ryudo.phase === 'EXECUTE') executing = true;
        if (executing) elapsed += 1 / 60;
    }

    assert.ok(spider.hp < hpBefore, 'предпосылка: приём должен сработать');
    assert.ok(
        elapsed >= definition.animationSeconds * 0.8,
        `урон пришёл слишком рано: ${elapsed.toFixed(2)}с при анимации ${definition.animationSeconds}с`,
    );
});

// --- Выбор цели противником -----------------------------------------------

test('враги не фокусируются вечно на одном герое', () => {
    // Баг: цель выбиралась строгим минимумом доли HP, поэтому Елена
    // (меньший максимум HP) получала весь урон, а Рюдо — ноль.
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const spider = system.units.find((u) => u.id === 'spider1');

    const picks = new Map();
    for (let i = 0; i < 400; i += 1) {
        const victim = system.pickVictim(system.livingOpponents(spider));
        picks.set(victim.id, (picks.get(victim.id) ?? 0) + 1);
    }

    assert.equal(picks.size, 2, 'должны выбираться оба героя');
    for (const [id, count] of picks) {
        assert.ok(count > 40, `${id} выбирается слишком редко: ${count}/400`);
    }
});

test('раненый герой притягивает больше внимания', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const spider = system.units.find((u) => u.id === 'spider1');
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const elena = system.units.find((u) => u.id === 'elena');

    ryudo.hp = Math.round(ryudo.maxHp * 0.15);
    elena.hp = elena.maxHp;

    let hurtPicks = 0;
    for (let i = 0; i < 400; i += 1) {
        if (system.pickVictim(system.livingOpponents(spider)).id === 'ryudo') hurtPicks += 1;
    }

    assert.ok(hurtPicks > 200, `раненого должны выбирать чаще: ${hurtPicks}/400`);
    assert.ok(hurtPicks < 400, 'но не абсолютно всегда');
});

test('и Рюдо, и Елена получают урон за бой', () => {
    // Интегральная проверка того же бага: за полный бой оба должны пострадать.
    let ryudoHurt = 0;
    let elenaHurt = 0;

    for (let seed = 0; seed < 6; seed += 1) {
        const { system, ui } = buildBattle({
            encounter: PARTY_ENCOUNTER,
            autoCommand: (unit, actions) => {
                const combo = actions.find((a) => a.id === 'combo' && a.enabled) ?? actions[0];
                return { actionId: combo.id, target: combo.targets?.[0] ?? null };
            },
            rng: makeRng(seed + 1),
        });
        runBattle(system, ui, { maxSeconds: 240 });
        const ryudo = system.units.find((u) => u.id === 'ryudo');
        const elena = system.units.find((u) => u.id === 'elena');
        if (ryudo.hp < ryudo.maxHp) ryudoHurt += 1;
        if (elena.hp < elena.maxHp) elenaHurt += 1;
    }

    assert.ok(ryudoHurt >= 4, `Рюдо почти не получает урона: ${ryudoHurt}/6 боёв`);
    assert.ok(elenaHurt >= 4, `Елена почти не получает урона: ${elenaHurt}/6 боёв`);
});

// --- Описания приёмов -----------------------------------------------------

test('у каждой команды есть описание, а Combo и Critical различимы', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const elena = system.units.find((u) => u.id === 'elena');

    const actions = system.getAvailableActions(elena);
    assert.ok(actions.length > 5, 'предпосылка: команд много');

    for (const action of actions) {
        assert.ok(
            typeof action.description === 'string' && action.description.length > 0,
            `у команды ${action.id} нет описания`,
        );
    }

    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const ryudoActions = system.getAvailableActions(ryudo);
    const combo = ryudoActions.find((a) => a.id === 'combo');
    const critical = ryudoActions.find((a) => a.id === 'critical');

    assert.notEqual(combo.description, critical.description, 'описания должны отличаться');
    assert.match(critical.description, /сбива/i, 'Critical должен объяснять сбив хода');
});

// --- Запуск ---------------------------------------------------------------

let passed = 0;
let failed = 0;

test('каст на группу целится в центр масс, каст на себя — никуда', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const caster = system.units.find((u) => u.isPlayer && u.hp > 0);
    const enemies = system.units.filter((u) => !u.isPlayer && u.hp > 0);

    // Расставляем врагов заведомо асимметрично, чтобы центр не совпал
    // ни с одним из них.
    enemies[0].mesh.position.x = -4;
    enemies[0].mesh.position.z = 2;
    if (enemies[1]) {
        enemies[1].mesh.position.x = 6;
        enemies[1].mesh.position.z = 8;
    }

    const group = system.castAim(caster, { targeting: 'all-enemies' });
    assert.equal(group.onSelf, false, 'каст по врагам не может быть «на себя»');

    const expectedX = enemies.reduce((sum, u) => sum + u.mesh.position.x, 0) / enemies.length;
    const expectedZ = enemies.reduce((sum, u) => sum + u.mesh.position.z, 0) / enemies.length;
    assert.ok(
        Math.abs(group.position.x - expectedX) < 1e-6
        && Math.abs(group.position.z - expectedZ) < 1e-6,
        `центр целей неверен: (${group.position.x}, ${group.position.z})`,
    );

    // Группа, включающая саму Елену, — это каст «на себя»: поза над головой.
    const allies = system.castAim(caster, { targeting: 'all-allies' });
    assert.equal(allies.onSelf, true, 'каст на свою группу должен считаться «на себя»');
    assert.equal(allies.position, null, 'на себя поворачиваться не нужно');

    assert.equal(system.castAim(caster, { targeting: 'self' }).onSelf, true);
});

test('одиночный каст целится ровно в цель и разворачивает кастующего', () => {
    const { system } = buildBattle({ encounter: PARTY_ENCOUNTER });
    const caster = system.units.find((u) => u.isPlayer && u.hp > 0);
    const enemy = system.units.find((u) => !u.isPlayer && u.hp > 0);
    enemy.mesh.position.x = 5;
    enemy.mesh.position.z = -3;
    // Без явной цели resolveTargets берёт цель по умолчанию — фиксируем её,
    // иначе проверяем не тот юнит, что подвинули.
    caster.target = enemy;

    const aim = system.castAim(caster, { targeting: 'single' });
    assert.equal(aim.onSelf, false);
    assert.ok(
        aim.position.x === 5 && aim.position.z === -3,
        `цель одиночного каста неверна: (${aim.position.x}, ${aim.position.z})`,
    );

    // Возвращается копия: сдвиг цели не должен задним числом менять прицел.
    enemy.mesh.position.x = 99;
    assert.equal(aim.position.x, 5, 'castAim вернул ссылку на позицию цели');
});

for (const { name, fn } of tests) {
    try {
        fn();
        console.log(`  ok   ${name}`);
        passed += 1;
    } catch (error) {
        console.error(`  FAIL ${name}`);
        console.error(`       ${error.message}`);
        failed += 1;
    }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
