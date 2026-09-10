/**
 * Тесты процедурных моделей и аниматора на настоящем Babylon (NullEngine).
 *
 * Проверяем то, что нельзя увидеть в юнит-тестах логики: модель собирается,
 * суставы существуют, анимация реально меняет позы и не ломается на
 * экстремальных дельтах, а имена мешей совместимы с подсветкой урона.
 *
 * Запуск: npm test
 */

import assert from 'node:assert/strict';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import '@babylonjs/core/Meshes/meshBuilder.js';

import { createHumanoid, createSpider, createUnitModel } from '../src/render/models.js';
import { Animator } from '../src/render/Animator.js';
import { makeUnitData } from '../src/data/battle_data.js';

const engine = new NullEngine();
const scene = new Scene(engine);

const results = [];
// Асинхронные проверки складываем в очередь и дожидаемся перед итогом:
// иначе упавший await печатался уже ПОСЛЕ счётчика и не попадал в него.
const pending = [];
const check = (name, fn) => {
    const ok = () => results.push(`  ok   ${name}`);
    const fail = (error) => {
        results.push(`  FAIL ${name}\n       ${error.message}`);
        process.exitCode = 1;
    };
    try {
        const result = fn();
        if (result && typeof result.then === 'function') {
            pending.push(result.then(ok, fail));
        } else {
            ok();
        }
    } catch (error) { fail(error); }
};

/** Юнит-заглушка поверх модели — как его видит BattleSystem. */
function fakeUnit(id, model, phase = 'WAIT') {
    return { id, phase, mesh: model.root };
}

// --- Сборка моделей -------------------------------------------------------

check('гуманоид собирается с полным набором суставов', () => {
    const model = createHumanoid(scene, { id: 'testHero', color: '#3498db' });
    const required = [
        'hips', 'torso', 'neck', 'head',
        'shoulderL', 'shoulderR', 'elbowL', 'elbowR',
        'hipL', 'hipR', 'kneeL', 'kneeR', 'weaponPivot',
    ];
    for (const bone of required) {
        assert.ok(model.rig[bone], `нет сустава ${bone}`);
    }
    assert.ok(model.meshes.length > 15, `слишком мало деталей: ${model.meshes.length}`);
    assert.equal(model.rig.kind, 'humanoid');
});

check('паук собирается с восемью двухсегментными ногами', () => {
    const model = createSpider(scene, { id: 'testSpider', color: '#8e44ad' });
    assert.equal(model.rig.legs.length, 8, 'у паука должно быть 8 ног');
    for (const leg of model.rig.legs) {
        assert.ok(leg.hip && leg.knee, 'нога должна состоять из бедра и колена');
    }
    assert.equal(model.rig.fangs.length, 2, 'должны быть жвалы');
});

check('у каждой модели есть меш *_body для подсветки урона', () => {
    // UIController ищет именно его, когда мигает целью при попадании.
    for (const [id, factory] of [['h', createHumanoid], ['s', createSpider]]) {
        const model = factory(scene, { id });
        const body = model.meshes.find((m) => m.name.includes('_body'));
        assert.ok(body, `у модели ${id} нет меша *_body`);
        assert.ok(body.material, 'у тела должен быть материал');
    }
});

check('тело находится рекурсивным поиском от корня', () => {
    // Регрессия: детали висят на суставах, поэтому getChildren() без флага
    // (только прямые потомки) тело уже не найдёт.
    const model = createHumanoid(scene, { id: 'depth' });
    const direct = model.root.getChildren().filter((c) => c.name.includes('_body'));
    const deep = model.root.getChildMeshes(false).filter((c) => c.name.includes('_body'));

    assert.equal(direct.length, 0, 'тело не должно быть прямым потомком корня');
    assert.equal(deep.length, 1, 'рекурсивный поиск обязан его находить');
});

check('createUnitModel выбирает модель по meshKind', () => {
    const ryudo = createUnitModel(scene, makeUnitData('ryudo', { id: 'r1', position: { x: 0, z: 0 } }));
    const spider = createUnitModel(scene, makeUnitData('mottledSpider', { id: 's1', position: { x: 0, z: 0 } }));
    const elena = createUnitModel(scene, makeUnitData('elena', { id: 'e1', position: { x: 0, z: 0 } }));

    assert.equal(ryudo.rig.kind, 'humanoid');
    assert.equal(spider.rig.kind, 'spider');
    assert.equal(elena.rig.kind, 'humanoid');
});

check('Рюдо получает меч, а Елена — посох', () => {
    const ryudo = createUnitModel(scene, makeUnitData('ryudo', { id: 'r2', position: { x: 0, z: 0 } }));
    const elena = createUnitModel(scene, makeUnitData('elena', { id: 'e2', position: { x: 0, z: 0 } }));

    assert.ok(ryudo.meshes.some((m) => m.name.includes('_blade')), 'у Рюдо должен быть клинок');
    assert.ok(elena.meshes.some((m) => m.name.includes('_orb')), 'у Елены должен быть навершие-сфера');
    assert.ok(!elena.meshes.some((m) => m.name.includes('_blade')), 'у Елены не должно быть меча');
});

// --- Анимация -------------------------------------------------------------

check('idle-анимация шевелит модель', () => {
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'idle' });
    animator.register('idle', model);
    const unit = fakeUnit('idle', model);

    const before = model.rig.hips.position.y;
    for (let i = 0; i < 40; i += 1) animator.update([unit], 1 / 60);
    const after = model.rig.hips.position.y;

    assert.notEqual(before, after, 'в покое юнит должен дышать');
});

check('бег включает мах ногами', () => {
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'run' });
    animator.register('run', model);
    const unit = fakeUnit('run', model);

    // Двигаем модель, как это делает BattleSystem во время забега.
    let maxSwing = 0;
    for (let i = 0; i < 60; i += 1) {
        model.root.position.x += 0.18; // ~11 ед/сек
        animator.update([unit], 1 / 60);
        maxSwing = Math.max(maxSwing, Math.abs(model.rig.hipL.rotation.x));
    }

    assert.ok(maxSwing > 0.2, `ноги должны заметно шагать, получили ${maxSwing.toFixed(3)}`);
});

check('удар: клинок заносится над головой и рубит вниз', () => {
    // Проверяем ТРАЕКТОРИЮ ОСТРИЯ, а не знак поворота плеча: знак зависит от
    // сборки рига, а видимая дуга — то, ради чего анимация существует.
    const animator = new Animator();
    const model = createUnitModel(scene, makeUnitData('ryudo', {
        id: 'swingArc', position: { x: 0, z: 0 },
    }));
    animator.register('swingArc', model);
    const unit = fakeUnit('swingArc', model);

    const tip = model.meshes.find((m) => m.name.includes('_bladeTip'));
    assert.ok(tip, 'у меча должно быть остриё');

    const tipAt = () => {
        model.root.computeWorldMatrix(true);
        model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));
        return tip.getBoundingInfo().boundingBox.centerWorld.clone();
    };

    for (let i = 0; i < 40; i += 1) animator.update([unit], 1 / 60);
    const rest = tipAt();

    animator.playSwing('swingArc', 0.42);
    let highest = -Infinity;
    let lowest = Infinity;
    let backMost = Infinity;
    let frontMost = -Infinity;
    let peakStep = 0;
    let previous = tipAt();

    for (let i = 0; i < 30; i += 1) {
        animator.update([unit], 1 / 60);
        const now = tipAt();
        highest = Math.max(highest, now.y);
        lowest = Math.min(lowest, now.y);
        backMost = Math.min(backMost, now.z);
        frontMost = Math.max(frontMost, now.z);
        peakStep = Math.max(peakStep, now.subtract(previous).length());
        previous = now;
    }

    assert.ok(highest > rest.y + 0.6, `замах должен поднять остриё (пик ${highest.toFixed(2)}, покой ${rest.y.toFixed(2)})`);
    assert.ok(lowest < rest.y - 0.5, `удар должен опустить остриё (низ ${lowest.toFixed(2)})`);
    assert.ok(highest - lowest > 1.5, `дуга слишком мелкая: ${(highest - lowest).toFixed(2)}`);

    // Занос уходит назад, проводка выносит клинок вперёд.
    assert.ok(frontMost - backMost > 1.2, `дуга должна идти назад-вперёд: ${(frontMost - backMost).toFixed(2)}`);

    // Удар должен быть резким, а не равномерным сползанием.
    assert.ok(peakStep * 60 > 25, `удар слишком вялый: пик ${(peakStep * 60).toFixed(1)} ед/с`);

    // После завершения поза возвращается.
    for (let i = 0; i < 120; i += 1) animator.update([unit], 1 / 60);
    const settled = tipAt();
    assert.ok(
        Math.abs(settled.y - rest.y) < 0.35,
        `после удара клинок должен вернуться в стойку: ${settled.y.toFixed(2)} vs ${rest.y.toFixed(2)}`,
    );
});

check('каст: руки собирают энергию вверху, затем выброс вперёд', () => {
    const animator = new Animator();
    const model = createUnitModel(scene, makeUnitData('ryudo', {
        id: 'castArc', position: { x: 0, z: 0 },
    }));
    animator.register('castArc', model);
    const unit = fakeUnit('castArc', model);

    const grip = model.meshes.find((m) => m.name.includes('_grip'));
    const handAt = () => {
        model.root.computeWorldMatrix(true);
        model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));
        return grip.getBoundingInfo().boundingBox.centerWorld.clone();
    };

    for (let i = 0; i < 40; i += 1) animator.update([unit], 1 / 60);
    const rest = handAt();

    animator.playCast('castArc', 0.8);
    let highest = -Infinity;
    let peakAtFrame = 0;
    for (let i = 0; i < 52; i += 1) {
        animator.update([unit], 1 / 60);
        const now = handAt();
        if (now.y > highest) { highest = now.y; peakAtFrame = i; }
    }

    assert.ok(highest > rest.y + 1.0, `руки должны подняться (${highest.toFixed(2)} vs ${rest.toFixed?.(2) ?? rest.y.toFixed(2)})`);

    // Пик приходится на середину, а не на самый конец: после сбора идёт выброс.
    assert.ok(peakAtFrame > 8 && peakAtFrame < 42, `пик сбора не на месте: кадр ${peakAtFrame}`);

    for (let i = 0; i < 120; i += 1) animator.update([unit], 1 / 60);
    assert.ok(
        Math.abs(handAt().y - rest.y) < 0.35,
        'после каста руки должны вернуться в стойку',
    );
});

check('попадание вызывает вздрагивание', () => {
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'hit' });
    animator.register('hit', model);
    const unit = fakeUnit('hit', model);

    animator.update([unit], 1 / 60);
    animator.playHit('hit');

    let maxTilt = 0;
    for (let i = 0; i < 10; i += 1) {
        animator.update([unit], 1 / 60);
        maxTilt = Math.max(maxTilt, Math.abs(model.rig.torso.rotation.z));
    }
    assert.ok(maxTilt > 0.02, `корпус должен дёрнуться, получили ${maxTilt.toFixed(3)}`);
});

check('смерть заваливает гуманоида и переворачивает паука', () => {
    const animator = new Animator();
    const hero = createHumanoid(scene, { id: 'deadHero' });
    const spider = createSpider(scene, { id: 'deadSpider' });
    animator.register('deadHero', hero);
    animator.register('deadSpider', spider);

    const units = [fakeUnit('deadHero', hero, 'DEAD'), fakeUnit('deadSpider', spider, 'DEAD')];
    for (let i = 0; i < 90; i += 1) animator.update(units, 1 / 60);

    assert.ok(hero.root.rotation.x < -0.8, `герой должен упасть, rotation.x=${hero.root.rotation.x.toFixed(2)}`);
    assert.ok(spider.root.rotation.z > 1.5, `паук должен перевернуться, rotation.z=${spider.root.rotation.z.toFixed(2)}`);
});

check('павший юнит не встаёт обратно сам по себе', () => {
    const animator = new Animator();
    const model = createSpider(scene, { id: 'stayDown' });
    animator.register('stayDown', model);
    const unit = fakeUnit('stayDown', model, 'DEAD');

    for (let i = 0; i < 120; i += 1) animator.update([unit], 1 / 60);
    const settled = model.root.rotation.z;
    for (let i = 0; i < 120; i += 1) animator.update([unit], 1 / 60);

    assert.ok(Math.abs(model.root.rotation.z - settled) < 0.05, 'поза смерти должна быть стабильной');
});

check('воскрешение возвращает модель в вертикаль', () => {
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'revive' });
    animator.register('revive', model);

    const dead = fakeUnit('revive', model, 'DEAD');
    for (let i = 0; i < 90; i += 1) animator.update([dead], 1 / 60);
    assert.ok(model.root.rotation.x < -0.8, 'предпосылка: юнит лежит');

    const alive = fakeUnit('revive', model, 'WAIT');
    for (let i = 0; i < 90; i += 1) animator.update([alive], 1 / 60);
    assert.ok(model.root.rotation.x > -0.1, 'после воскрешения юнит должен встать');
});

check('анимация устойчива к огромной дельте кадра', () => {
    const animator = new Animator();
    const model = createSpider(scene, { id: 'bigDelta' });
    animator.register('bigDelta', model);
    const unit = fakeUnit('bigDelta', model);

    animator.update([unit], 5); // свёрнутая вкладка

    for (const leg of model.rig.legs) {
        assert.ok(Number.isFinite(leg.hip.rotation.y), 'поворот сустава должен остаться числом');
        assert.ok(Number.isFinite(leg.knee.rotation.z));
    }
    assert.ok(Number.isFinite(model.rig.body.position.y), 'позиция тела не должна стать NaN');
});

check('огромная дельта клемпится до одного шага 0.05 с', () => {
    // Иначе после переключения вкладки поза скачком «телепортируется»:
    // update(5) обязан дать ровно то же, что update(0.05).
    const animator = new Animator();

    const huge = createHumanoid(scene, { id: 'clampHuge' });
    const step = createHumanoid(scene, { id: 'clampStep' });
    animator.register('clampHuge', huge);
    animator.register('clampStep', step);

    // Уравниваем стартовую фазу: register() специально её рандомизирует.
    animator.states.get('clampHuge').time = 1.234;
    animator.states.get('clampStep').time = 1.234;

    animator.update([fakeUnit('clampHuge', huge)], 5);
    animator.update([fakeUnit('clampStep', step)], 0.05);

    assert.equal(
        huge.rig.hips.position.y.toFixed(6),
        step.rig.hips.position.y.toFixed(6),
        'дельта кадра должна быть ограничена сверху',
    );
});

check('спрятанный кадр не заставляет юнита «пробежать» на месте', () => {
    // moved/dt при нескольких секундах простоя не должен читаться как рывок.
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'teleport' });
    animator.register('teleport', model);
    const unit = fakeUnit('teleport', model);

    model.root.position = new Vector3(12, 0, 9); // юнит «переместился», пока вкладка спала
    animator.update([unit], 5);

    assert.ok(
        Math.abs(model.rig.hipL.rotation.x) < 0.6,
        `ноги не должны улететь в предельный шаг, получили ${model.rig.hipL.rotation.x.toFixed(3)}`,
    );
});

check('аниматор игнорирует незарегистрированных юнитов', () => {
    const animator = new Animator();
    const model = createHumanoid(scene, { id: 'ghost' });
    // register() намеренно не вызываем.
    assert.doesNotThrow(() => animator.update([fakeUnit('ghost', model)], 1 / 60));
    assert.doesNotThrow(() => animator.playHit('nobody'));
    assert.doesNotThrow(() => animator.playSwing('nobody'));
});

check('юниты не анимируются синхронно', () => {
    const animator = new Animator();
    const a = createHumanoid(scene, { id: 'syncA' });
    const b = createHumanoid(scene, { id: 'syncB' });
    animator.register('syncA', a);
    animator.register('syncB', b);

    const units = [fakeUnit('syncA', a), fakeUnit('syncB', b)];
    for (let i = 0; i < 30; i += 1) animator.update(units, 1 / 60);

    assert.notEqual(
        a.rig.hips.position.y,
        b.rig.hips.position.y,
        'у юнитов должна быть разная фаза дыхания',
    );
});

// --- Габариты и посадка на пол --------------------------------------------

/** Самая нижняя точка модели в мировых координатах. */
function lowestPoint(model) {
    model.root.computeWorldMatrix(true);
    model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));
    let min = Infinity;
    for (const mesh of model.meshes) {
        min = Math.min(min, mesh.getBoundingInfo().boundingBox.minimumWorld.y);
    }
    return min;
}

check('модели имеют правдоподобные пропорции', () => {
    const hero = createUnitModel(scene, makeUnitData('ryudo', { id: 'dimHero', position: { x: 0, z: 0 } }));
    const spider = createUnitModel(scene, makeUnitData('mottledSpider', { id: 'dimSpider', position: { x: 0, z: 0 } }));

    const size = (model) => {
        model.root.computeWorldMatrix(true);
        model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));
        let min = null; let max = null;
        for (const mesh of model.meshes) {
            const bb = mesh.getBoundingInfo().boundingBox;
            if (!min) { min = bb.minimumWorld.clone(); max = bb.maximumWorld.clone(); }
            min.minimizeInPlace(bb.minimumWorld);
            max.maximizeInPlace(bb.maximumWorld);
        }
        return { h: max.y - min.y, w: max.x - min.x };
    };

    const h = size(hero);
    const s = size(spider);

    // Герой — вертикальный силуэт, паук — приземистый и широкий.
    assert.ok(h.h > 2 && h.h < 4, `рост героя вне диапазона: ${h.h.toFixed(2)}`);
    assert.ok(h.h > h.w, 'герой должен быть выше, чем шире');
    assert.ok(s.w > s.h, 'паук должен быть шире, чем выше');

    // Пауки стоят в 5 единицах друг от друга — не должны пересекаться.
    assert.ok(s.w < 5, `паук слишком широкий (${s.w.toFixed(2)}), модели будут пересекаться`);
});

check('модели стоят на полу, а не парят и не тонут', () => {
    for (const key of ['ryudo', 'elena', 'mottledSpider']) {
        const model = createUnitModel(scene, makeUnitData(key, { id: `stand_${key}`, position: { x: 0, z: 0 } }));
        const bottom = lowestPoint(model);
        assert.ok(bottom > -0.05, `${key} тонет в арене: y=${bottom.toFixed(3)}`);
        assert.ok(bottom < 0.35, `${key} парит над ареной: y=${bottom.toFixed(3)}`);
    }
});

check('во время бега ноги не проваливаются сквозь пол', () => {
    const animator = new Animator();
    for (const key of ['ryudo', 'mottledSpider']) {
        const id = `runFloor_${key}`;
        const model = createUnitModel(scene, makeUnitData(key, { id, position: { x: 0, z: 0 } }));
        animator.register(id, model);
        const unit = fakeUnit(id, model);

        let worst = Infinity;
        for (let i = 0; i < 180; i += 1) {
            model.root.position.x += 0.15;
            animator.update([unit], 1 / 60);
            worst = Math.min(worst, lowestPoint(model));
        }
        assert.ok(worst > -0.1, `${key} проваливается на бегу: y=${worst.toFixed(3)}`);
    }
});

check('павшее тело не проваливается сквозь арену', () => {
    // Регрессия: поза смерти вращает корень вокруг ступней, из-за чего
    // тело уходило под пол почти на 1.6 единицы.
    const animator = new Animator();
    for (const key of ['ryudo', 'mottledSpider']) {
        const id = `deadFloor_${key}`;
        const model = createUnitModel(scene, makeUnitData(key, { id, position: { x: 0, z: 0 } }));
        animator.register(id, model);
        const unit = fakeUnit(id, model, 'DEAD');

        for (let i = 0; i < 180; i += 1) animator.update([unit], 1 / 60);

        const bottom = lowestPoint(model);
        assert.ok(bottom > -0.15, `труп ${key} утонул в арене: y=${bottom.toFixed(3)}`);
        assert.ok(bottom < 0.6, `труп ${key} завис в воздухе: y=${bottom.toFixed(3)}`);
    }
});

check('у Рюдо есть наушники, шарф и рюкзак, но нет плаща', () => {
    // Атрибуты из оригинального дизайна. Плащ носит только Елена — вместе
    // с рюкзаком за спиной они сливались в кашу.
    const model = createUnitModel(scene, makeUnitData('ryudo', {
        id: 'gear_ryudo', position: { x: 0, z: 0 },
    }));
    const names = model.meshes.map((m) => m.name);

    assert.ok(names.some((n) => n.includes('_phoneCup')), 'нет наушников');
    assert.ok(names.some((n) => n.includes('_phoneBand')), 'нет дужки наушников');
    assert.ok(names.some((n) => n.includes('_scarf')), 'нет шарфа');
    assert.ok(names.some((n) => n.includes('_pack')), 'нет рюкзака');
    assert.ok(!names.some((n) => n.endsWith('_cape')), 'у Рюдо не должно быть плаща');

    // Узел плаща нужен аниматору, даже когда самого плаща нет.
    assert.ok(model.rig.cape, 'узел cape должен существовать всегда');
});

check('у Елены остаётся плащ и нет снаряжения Рюдо', () => {
    const model = createUnitModel(scene, makeUnitData('elena', {
        id: 'gear_elena', position: { x: 0, z: 0 },
    }));
    const names = model.meshes.map((m) => m.name);

    assert.ok(names.some((n) => n.endsWith('_cape')), 'плащ Елены пропал');
    assert.ok(!names.some((n) => n.includes('_pack')), 'рюкзак только у Рюдо');
    assert.ok(!names.some((n) => n.includes('_phoneCup')), 'наушники только у Рюдо');
});

check('подсветка попадания снимается даже при ударах внахлёст', async () => {
    // Регрессия: вторая вспышка запоминала уже КРАСНЫЙ цвет как исходный,
    // и модель оставалась подсвеченной навсегда.
    const { UIController } = await import('../src/system/UIController.js');
    const ui = Object.create(UIController.prototype);
    ui.gaugeIcons = {};
    ui.gaugeFlashTimers = {};

    const model = createUnitModel(scene, makeUnitData('ryudo', {
        id: 'flashUnit', position: { x: 0, z: 0 },
    }));
    const body = model.meshes.find((m) => m.name.includes('_body'));
    const before = body.material.emissiveColor.clone();

    ui.flashMesh(model.root, '#ff0000', 40);
    assert.ok(body.material.emissiveColor.r > 0.5, 'первая вспышка должна подсветить');

    // Второй удар приходит, пока первая подсветка ещё горит.
    ui.flashMesh(model.root, '#ff0000', 40);

    await new Promise((resolve) => setTimeout(resolve, 120));

    const after = body.material.emissiveColor;
    assert.ok(
        Math.abs(after.r - before.r) < 0.01
        && Math.abs(after.g - before.g) < 0.01
        && Math.abs(after.b - before.b) < 0.01,
        `подсветка залипла: было (${before.r},${before.g},${before.b}), стало (${after.r},${after.g},${after.b})`,
    );
});

// --- Итог -----------------------------------------------------------------

await Promise.all(pending);

console.log(results.join('\n'));
const passed = results.filter((r) => r.includes(' ok ')).length;
const failed = results.filter((r) => r.includes('FAIL')).length;
console.log(`\n${passed} passed, ${failed} failed`);

engine.dispose();
