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
import { makeUnitData, DEFAULT_ENCOUNTER } from '../src/data/battle_data.js';
import { COM_START, IP_MAX } from '../src/entities/combat.js';

// --- Заглушки -------------------------------------------------------------

function makeMesh(x, z) {
    return {
        position: new Vector3(x, 0, z),
        lookAt() {},
        getAbsolutePosition() { return this.position; },
        getChildren() { return []; },
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

function buildBattle({ autoCommand, encounter = DEFAULT_ENCOUNTER } = {}) {
    const ui = makeUiStub({ autoCommand });
    const system = new BattleSystem(ui);

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
    const spider = system.units.find((u) => u.id === 'spider1');

    assert.equal(ryudo.hp, 340, 'HP Рюдо должно браться из PRESETS.ryudo');
    assert.equal(ryudo.maxHp, 340);
    assert.equal(spider.hp, 230, 'HP паука должно браться из PRESETS.mottledSpider');
    assert.ok(ryudo.str > 0 && ryudo.vit > 0, 'статы должны быть перенесены в корень юнита');
});

test('бой доходит до исхода и не зависает', () => {
    const { system, ui } = buildBattle({
        autoCommand: (unit, actions) => {
            const combo = actions.find((a) => a.id === 'combo' && a.enabled);
            return { actionId: combo.id, target: combo.targets[0] };
        },
    });

    const elapsed = runBattle(system, ui);
    assert.ok(system.outcome !== null, `бой не завершился за ${elapsed.toFixed(1)} с (зависание)`);
    assert.equal(system.outcome, 'victory');
    assert.ok(ui.events.some((e) => e.type === 'outcome'), 'UI должен получить событие исхода');
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

test('юнит в фазе EXECUTE не сбивается (удар уже нанесён)', () => {
    const { system } = buildBattle();
    const spider = system.units.find((u) => u.id === 'spider1');
    spider.phase = 'EXECUTE';
    spider.ip = IP_MAX;

    system.applyIpDamage(spider, { cancel: true, cancelPushback: 260, ipDamage: 180 });

    assert.equal(spider.phase, 'EXECUTE', 'EXECUTE прерывать нельзя');
    assert.equal(spider.ip, IP_MAX);
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

// --- Запуск ---------------------------------------------------------------

let passed = 0;
let failed = 0;

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
