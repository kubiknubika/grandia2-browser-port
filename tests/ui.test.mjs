/**
 * DOM-тест реального UIController в jsdom (Chromium в песочнице недоступен).
 * Проверяем: отсутствие утечки <style>, HP-бары, выбор цели, экран исхода.
 */
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const dom = new JSDOM(`<!DOCTYPE html><body>
  <canvas id="renderCanvas"></canvas>
  <div id="ui-layer">
    <div id="party-container"></div>
    <div id="ip-gauge-container"></div>
  </div>
</body>`, { pretendToBeVisual: true });

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });

const { UIController } = await import(`${REPO}/src/system/UIController.js`);
const { BattleSystem } = await import(`${REPO}/src/system/BattleSystem.js`);
const { makeUnitData, DEFAULT_ENCOUNTER } = await import(`${REPO}/src/data/battle_data.js`);
const { Vector3, Matrix } = await import(`@babylonjs/core/Maths/math.vector.js`);

const ui = new UIController();
// Мини-контекст Babylon: showFloatingText проецирует 3D->2D.
ui.setBabylonContext(
  { getTransformMatrix: () => Matrix.Identity() },
  { viewport: { toGlobal: () => ({ x: 0, y: 0, width: 1280, height: 800 }) } },
  { getRenderWidth: () => 1280, getRenderHeight: () => 800 },
);

const makeMesh = (x, z) => ({
  position: new Vector3(x, 0, z),
  lookAt() {},
  getAbsolutePosition() { return this.position; },
  getChildren() { return []; },
});

const system = new BattleSystem(ui);
for (const e of DEFAULT_ENCOUNTER.players) {
  const { presetKey, ...rest } = e;
  const d = makeUnitData(presetKey, rest);
  system.addUnit({ id: d.id, data: d, mesh: makeMesh(d.position.x, d.position.z) }, true);
}
for (const e of DEFAULT_ENCOUNTER.enemies) {
  const { presetKey, ...rest } = e;
  const d = makeUnitData(presetKey, rest);
  system.addUnit({ id: d.id, data: d, mesh: makeMesh(d.position.x, d.position.z) }, false);
}

const $ = (s) => document.querySelectorAll(s);
const results = [];
const check = (name, fn) => {
  try { fn(); results.push(`  ok   ${name}`); }
  catch (err) { results.push(`  FAIL ${name}\n       ${err.message}`); process.exitCode = 1; }
};

check('карточки создаются только для партии, иконки — для всех', () => {
  const players = DEFAULT_ENCOUNTER.players.length;
  const total = players + DEFAULT_ENCOUNTER.enemies.length;
  assert.equal($('.character-card').length, players);
  assert.equal($('.ip-icon').length, total);
});

check('HP-бар отражает текущее HP', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ryudo.hp = Math.round(ryudo.maxHp * 0.5);
  ui.updateUnit(ryudo);
  const bar = document.querySelector('[data-hp-bar]');
  assert.equal(bar.style.width, '50%');
  assert.ok(bar.classList.contains('warn'), 'при 50% HP полоса должна желтеть');

  ryudo.hp = Math.round(ryudo.maxHp * 0.1);
  ui.updateUnit(ryudo);
  assert.ok(document.querySelector('[data-hp-bar]').classList.contains('crit'));
  ryudo.hp = ryudo.maxHp;
  ui.updateUnit(ryudo);
});

check('COM-маркер стоит на канонической позиции 700/1000', () => {
  const marker = document.querySelector('.com-marker');
  assert.equal(marker.style.left, '68%'); // 5 + 0.7*90
});

// Главная проверка: утечка <style> при повторных ходах.
check('повторные вызовы кольца не плодят <style>', () => {
  const before = $('style').length;
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  for (let i = 0; i < 40; i += 1) {
    ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});
    ui.hideCommandRing();
  }
  assert.equal($('style').length, before, `<style> утёк: было ${before}, стало ${$('style').length}`);
  assert.equal($('#battle-ui-styles').length, 1);
});

check('кольцо не дублируется в DOM', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});
  assert.equal($('#command-ring').length, 1);
  ui.hideCommandRing();
  assert.equal($('#command-ring').length, 0);
});

check('недоступный по SP приём отрисован как disabled', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ryudo.sp = 0;
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});

  // Команды разложены по вкладкам, приёмы живут на вкладке «Приёмы».
  const movesTab = [...$('#command-ring .cmd-tab')].find((t) => /приёмы/i.test(t.textContent));
  assert.ok(movesTab, 'должна быть вкладка приёмов');
  movesTab.click();

  const buttons = [...$('#command-ring .cmd-btn')];
  const tenseiken = buttons.find((b) => /tenseiken/i.test(b.textContent));
  assert.ok(tenseiken, 'кнопка приёма должна быть');
  assert.equal(tenseiken.disabled, true);
  assert.ok(/24 SP/.test(tenseiken.textContent), 'должна показываться стоимость');
  ui.hideCommandRing();
  ryudo.sp = 34;
});

check('панель описания объясняет разницу между Combo и Critical', () => {
  // Игрок не понимал, чем эти две базовые атаки отличаются.
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});

  const buttons = [...$('#command-ring .cmd-btn')];
  const combo = buttons.find((b) => /combo/i.test(b.textContent));
  const critical = buttons.find((b) => /critical/i.test(b.textContent));

  const infoText = () => document.querySelector('#command-ring .cmd-info').textContent;

  combo.dispatchEvent(new window.MouseEvent('mouseenter'));
  const comboText = infoText();

  critical.dispatchEvent(new window.MouseEvent('mouseenter'));
  const critText = infoText();

  assert.notEqual(comboText, critText, 'описания должны различаться');
  assert.ok(/сбива/i.test(critText), `Critical должен упоминать сбив хода: ${critText}`);
  assert.ok(/IP|SP/i.test(comboText), `Combo должен упоминать накопление: ${comboText}`);
  ui.hideCommandRing();
});

check('вкладки переключают показанные команды', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});

  const tabs = [...$('#command-ring .cmd-tab')];
  assert.ok(tabs.length >= 3, `должно быть несколько вкладок, найдено ${tabs.length}`);

  const firstCount = document.querySelector('#command-ring .cmd-scroll').children.length;
  const magicTab = tabs.find((t) => /магия/i.test(t.textContent));
  assert.ok(magicTab, 'у Рюдо должна быть вкладка магии поддержки');
  magicTab.click();

  const magicButtons = [...$('#command-ring .cmd-btn')];
  assert.ok(magicButtons.length > 0, 'на вкладке магии должны быть заклинания');
  assert.ok(
    magicButtons.every((b) => !/^\s*combo/i.test(b.textContent)),
    'обычная атака не должна попадать на вкладку магии',
  );
  assert.notEqual(magicButtons.length, firstCount + 999, 'список должен перерисовываться');
  ui.hideCommandRing();
});

check('выбор цели: клик по Critical открывает список живых врагов', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  let chosen = null;
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), (id, target) => {
    chosen = { id, target: target?.id };
  });
  [...$('#command-ring button')].find((b) => /critical/i.test(b.textContent)).click();

  const targets = [...$('#command-ring .target-btn')];
  assert.equal(targets.length, 2, 'должно быть 2 живых паука');
  assert.ok(/Mottled Spider A/.test(targets[0].textContent));
  assert.ok(/145 \/ 145/.test(targets[0].textContent), 'должно показываться HP цели');

  targets[1].click();
  assert.deepEqual(chosen, { id: 'critical', target: 'spider2' }, 'должна выбраться вторая цель');
  assert.equal($('#command-ring').length, 0, 'кольцо должно закрыться после выбора');
});

check('кнопка Back возвращает список команд', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), () => {});
  [...$('#command-ring button')].find((b) => /critical/i.test(b.textContent)).click();
  assert.ok($('#command-ring .target-btn').length > 0, 'открыт выбор цели');
  [...$('#command-ring button')].find((b) => /^back$/i.test(b.textContent.trim())).click();
  const labels = [...$('#command-ring button')].map((b) => b.textContent);
  assert.ok(labels.some((l) => /combo/i.test(l)), 'Back должен вернуть список команд');
  ui.hideCommandRing();
});

check('единственная цель выбирается без лишнего клика', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  const spider2 = system.units.find((u) => u.id === 'spider2');
  spider2.hp = 0; spider2.phase = 'DEAD';

  let chosen = null;
  ui.showCommandRing(ryudo, system.getAvailableActions(ryudo), (id, t) => { chosen = { id, target: t?.id }; });
  [...$('#command-ring button')].find((b) => /combo/i.test(b.textContent)).click();
  assert.deepEqual(chosen, { id: 'combo', target: 'spider1' });

  spider2.hp = spider2.maxHp; spider2.phase = 'WAIT';
});

check('мёртвый юнит гаснет на шкале IP', () => {
  const spider = system.units.find((u) => u.id === 'spider1');
  spider.hp = 0;
  system.handleDeath(spider);
  const icon = ui.gaugeIcons.spider1;
  assert.ok(icon.classList.contains('dead'));
});

check('всплывающий текст появляется и очищается', () => {
  const ryudo = system.units.find((u) => u.id === 'ryudo');
  const before = $('.float-text').length;
  ui.showFloatingText(ryudo.mesh, '123', 'damage');
  assert.equal($('.float-text').length, before + 1);
  assert.equal([...$('.float-text')].pop().textContent, '123');
});

check('баннер исхода показывается один раз', () => {
  ui.showOutcome('victory');
  ui.showOutcome('victory');
  assert.equal($('#outcome-banner').length, 1);
  assert.ok(/VICTORY/.test(document.querySelector('#outcome-banner').textContent));
});

console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.includes(' ok ')).length} passed, ${results.filter((r) => r.includes('FAIL')).length} failed`);
