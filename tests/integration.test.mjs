/**
 * Интеграционный тест: настоящий Babylon (NullEngine) + настоящий DOM (jsdom).
 *
 * Юнит-тесты гоняют логику на заглушках, а здесь собирается вся связка —
 * сцена, меши, UIController и BattleSystem, — и бой играется от начала до
 * конца. Ловит то, что не видно по отдельности: ошибки инициализации,
 * рассинхрон UI и логики, исключения в цикле рендера.
 *
 * Запуск: npm test
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const html = fs.readFileSync(`${REPO}/index.html`, 'utf8');

// --- Окружение браузера ---------------------------------------------------

const consoleErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('error', (...args) => consoleErrors.push(args.map(String).join(' ')));
virtualConsole.on('jsdomError', (error) => consoleErrors.push(error.detail?.message ?? error.message));

const dom = new JSDOM(html, { pretendToBeVisual: true, url: 'http://localhost:3000/', virtualConsole });
const { window } = dom;

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
globalThis.HTMLElement = window.HTMLElement;
globalThis.URLSearchParams = window.URLSearchParams;

// --- Реальные модули ------------------------------------------------------

const { BattleSystem } = await import(`${REPO}/src/system/BattleSystem.js`);
const { UIController } = await import(`${REPO}/src/system/UIController.js`);
const { makeUnitData, DEFAULT_ENCOUNTER } = await import(`${REPO}/src/data/battle_data.js`);

const { NullEngine } = await import('@babylonjs/core/Engines/nullEngine.js');
const { Scene } = await import('@babylonjs/core/scene.js');
const { ArcRotateCamera } = await import('@babylonjs/core/Cameras/arcRotateCamera.js');
const { Vector3 } = await import('@babylonjs/core/Maths/math.vector.js');
const { MeshBuilder } = await import('@babylonjs/core/Meshes/meshBuilder.js');

const engine = new NullEngine();
const scene = new Scene(engine);
const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 22, Vector3.Zero(), scene);

const ui = new UIController();
ui.setBabylonContext(scene, camera, engine);
const system = new BattleSystem(ui);

for (const [team, isPlayer] of [['players', true], ['enemies', false]]) {
    for (const entry of DEFAULT_ENCOUNTER[team]) {
        const { presetKey, ...rest } = entry;
        const data = makeUnitData(presetKey, rest);
        const mesh = MeshBuilder.CreateBox(data.id, { size: 1 }, scene);
        mesh.position = new Vector3(data.position.x, 0, data.position.z);
        system.addUnit({ id: data.id, data, mesh }, isPlayer);
    }
}

// --- Полный бой -----------------------------------------------------------

const stylesAtStart = window.document.querySelectorAll('style').length;
let frames = 0;
const step = 1 / 60;

for (let t = 0; t < 300 && !system.outcome; t += step) {
    scene.render();
    system.update(step);
    frames += 1;

    // «Игрок»: жмём первую доступную команду и первую цель.
    const ring = window.document.querySelector('#command-ring');
    if (ring) {
        const target = ring.querySelector('.target-btn');
        if (target) {
            target.click();
        } else {
            [...ring.querySelectorAll('button')]
                .find((b) => !b.disabled && !/back/i.test(b.textContent))
                ?.click();
        }
    }
}

// --- Проверки -------------------------------------------------------------

const results = [];
const check = (name, fn) => {
    try { fn(); results.push(`  ok   ${name}`); }
    catch (error) { results.push(`  FAIL ${name}\n       ${error.message}`); process.exitCode = 1; }
};

check('бой завершается за разумное время', () => {
    assert.ok(system.outcome !== null, `бой не закончился за ${frames} кадров`);
    assert.ok(frames > 60, 'бой не должен заканчиваться мгновенно');
});

check('в консоли нет ошибок за весь бой', () => {
    assert.deepEqual(consoleErrors, [], `ошибки в консоли: ${consoleErrors.slice(0, 3).join(' | ')}`);
});

check('победа отражена и в системе, и в DOM', () => {
    assert.equal(system.outcome, 'victory');
    const banner = window.document.querySelector('#outcome-banner');
    assert.ok(banner, 'баннер исхода должен быть в DOM');
    assert.ok(/VICTORY/.test(banner.textContent));
});

check('все враги мертвы, игрок жив', () => {
    const enemies = system.units.filter((u) => !u.isPlayer);
    const players = system.units.filter((u) => u.isPlayer);
    assert.ok(enemies.every((u) => u.hp === 0), 'враги должны быть повержены');
    assert.ok(players.every((u) => u.hp > 0), 'игрок должен выжить');
});

check('HP в UI совпадает с HP в системе', () => {
    const ryudo = system.units.find((u) => u.id === 'ryudo');
    const shown = window.document.querySelector('[data-hp]').textContent;
    assert.equal(shown, `${ryudo.hp} / ${ryudo.maxHp}`, 'карточка должна показывать актуальное HP');
});

check('за весь бой не утекли <style> и кольца команд', () => {
    assert.equal(window.document.querySelectorAll('style').length, stylesAtStart, '<style> не должны накапливаться');
    assert.equal(window.document.querySelectorAll('#command-ring').length, 0, 'кольцо должно быть закрыто');
});

check('шкала IP осталась в допустимых пределах', () => {
    for (const unit of system.units) {
        assert.ok(unit.ip >= 0 && unit.ip <= 1000, `${unit.id}: IP вне диапазона (${unit.ip})`);
    }
});

console.log(results.join('\n'));
const passed = results.filter((r) => r.includes(' ok ')).length;
const failed = results.filter((r) => r.includes('FAIL')).length;
console.log(`\n${passed} passed, ${failed} failed  (${frames} frames simulated)`);

engine.dispose();
