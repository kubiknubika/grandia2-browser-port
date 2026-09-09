import { Vector3, Matrix, Color3 } from '@babylonjs/core';
import { COM_START, IP_MAX } from '../entities/combat.js';

// Все стили инжектятся ровно один раз при создании контроллера.
// Раньше showCommandRing() добавлял новый <style> на каждый ход игрока,
// оставляя в <head> сотни дублей за бой.
const STYLE_ID = 'battle-ui-styles';

const STYLES = `
.gauge-line {
    position: absolute; top: 50%; left: 5%; right: 5%;
    height: 2px; background: #5a6e8c; transform: translateY(-50%);
}
.com-marker {
    position: absolute; top: 0; width: 2px; height: 100%;
    background: #e74c3c; box-shadow: 0 0 5px #e74c3c;
}
.act-marker {
    position: absolute; top: 0; right: 5%; width: 2px; height: 100%;
    background: #f1c40f; box-shadow: 0 0 5px #f1c40f;
}
.ip-icon {
    position: absolute; top: 50%; width: 32px; height: 32px;
    border-radius: 50%; border: 2px solid white;
    transform: translate(-50%, -50%); display: flex;
    align-items: center; justify-content: center;
    font-weight: bold; font-size: 14px; color: white;
    text-shadow: 1px 1px 2px black; box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
    transition: left 0.1s linear, opacity 0.3s ease; z-index: 10;
}
.ip-icon.enemy { border-color: #e74c3c; }
.ip-icon.player { border-color: #3498db; }
.ip-icon.dead { opacity: 0.25; filter: grayscale(1); }

.cmd-btn {
    background: #34495e; color: white; border: 1px solid #7f8c8d;
    padding: 10px 20px; border-radius: 6px; cursor: pointer;
    font-size: 16px; font-weight: bold; text-transform: uppercase;
    transition: background 0.15s; text-align: left;
}
.cmd-btn:hover:not(:disabled) { background: #e74c3c; border-color: #c0392b; }
.cmd-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cmd-cost { font-size: 12px; color: #f1c40f; font-weight: normal; margin-left: 8px; }
.cmd-name { margin-right: 2px; }
.cmd-hint { font-size: 12px; color: #8da3c7; margin-top: 4px; }

.target-btn {
    background: #2c3e50; color: #ecf0f1; border: 1px solid #7f8c8d;
    padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;
    display: flex; justify-content: space-between; gap: 16px; align-items: center;
}
.target-btn:hover { background: #c0392b; }
.target-hp { font-size: 12px; color: #2ecc71; }

.float-text {
    position: absolute; font-weight: 900; pointer-events: none;
    transform: translate(-50%, -50%); z-index: 20;
    text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
    transition: top 1s cubic-bezier(0, 0, 0.2, 1), opacity 1s ease-in;
}
.float-text.damage { color: #fff; font-size: 36px; }
.float-text.heal   { color: #2ecc71; font-size: 32px; }
.float-text.cancel { color: #f1c40f; font-size: 30px; letter-spacing: 2px; }
.float-text.guard  { color: #5dade2; font-size: 26px; letter-spacing: 2px; }
.float-text.counter { color: #ff7b00; font-size: 40px; letter-spacing: 1px; }
.float-text.poison { color: #9b59b6; font-size: 30px; }
.float-text.status { color: #e67e22; font-size: 24px; letter-spacing: 2px; }
.float-text.buff   { color: #1abc9c; font-size: 24px; letter-spacing: 2px; }
.float-text.element-fire      { color: #ff6b35; }
.float-text.element-lightning { color: #f7dc6f; }
.float-text.element-ice       { color: #85c1e9; }
.float-text.element-earth     { color: #b9770e; }
.float-text.element-wind      { color: #a9dfbf; }

/* Иконки статусов под карточкой и над юнитом на шкале */
.status-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; min-height: 16px; }
.status-chip {
    font-size: 10px; padding: 1px 5px; border-radius: 3px; font-weight: bold;
    text-transform: uppercase; letter-spacing: 0.5px; background: #7f8c8d; color: #fff;
}
.status-chip.poison { background: #8e44ad; }
.status-chip.sleep { background: #34495e; }
.status-chip.paralysis { background: #f39c12; color: #000; }
.status-chip.confusion { background: #e91e63; }
.status-chip.moveBlock { background: #c0392b; }
.status-chip.magicBlock { background: #2980b9; }
.status-chip.buff { background: #16a085; }
.status-chip.debuff { background: #d35400; }

/* Категории в кольце команд */
.cmd-group-label {
    font-size: 11px; color: #8da3c7; text-transform: uppercase; letter-spacing: 1px;
    margin-top: 8px; border-bottom: 1px solid #2c3e50; padding-bottom: 2px;
}
.cmd-btn .cmd-reason { font-size: 11px; color: #e74c3c; font-weight: normal; margin-left: 8px; }
.cmd-scroll { max-height: 58vh; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
.cmd-el { font-size: 11px; margin-left: 6px; padding: 1px 4px; border-radius: 3px; background: rgba(255,255,255,0.12); }

.hp-bar-track {
    height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px;
    overflow: hidden; margin-top: 2px;
}
.hp-bar-fill { height: 100%; background: #2ecc71; transition: width 0.25s ease, background 0.25s ease; }
.hp-bar-fill.warn { background: #f1c40f; }
.hp-bar-fill.crit { background: #e74c3c; }
.character-card.dead { opacity: 0.45; filter: grayscale(0.8); }

#outcome-banner {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 64px; font-weight: 900; letter-spacing: 6px; text-align: center;
    text-shadow: 3px 3px 0 #000, 0 0 30px currentColor; z-index: 30;
}
#outcome-banner .sub {
    font-size: 18px; letter-spacing: 2px; color: #d1d8e0; margin-top: 12px; font-weight: normal;
}
#model-warning {
    position: absolute; top: 80px; right: 20px; max-width: 320px;
    background: rgba(120, 60, 10, 0.92); border: 1px solid #e67e22;
    border-radius: 8px; padding: 10px 14px; font-size: 13px; line-height: 1.4;
}
`;

export class UIController {
    constructor() {
        this.gaugeContainer = document.getElementById('ip-gauge-container');
        this.partyContainer = document.getElementById('party-container');
        this.uiLayer = document.getElementById('ui-layer');

        this.gaugeIcons = {};
        this.cards = {};
        this.commandRing = null;

        this.injectStyles();

        // COM-маркер ставим по канонической константе, а не по «на глаз 80%».
        const comPercent = 5 + (COM_START / IP_MAX) * 90;
        this.gaugeContainer.innerHTML = `
            <div class="gauge-line"></div>
            <div class="com-marker" style="left: ${comPercent}%"></div>
            <div class="act-marker"></div>
        `;
    }

    injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    setBabylonContext(scene, camera, engine) {
        this.scene = scene;
        this.camera = camera;
        this.engine = engine;
    }

    // --- Регистрация юнита в интерфейсе ------------------------------------

    addUnit(unit) {
        const icon = document.createElement('div');
        icon.className = `ip-icon ${unit.isPlayer ? 'player' : 'enemy'}`;
        icon.style.background = unit.color;
        icon.textContent = unit.name.charAt(0);
        icon.style.left = '5%';
        this.gaugeContainer.appendChild(icon);
        this.gaugeIcons[unit.id] = icon;

        if (unit.isPlayer) {
            this.addPartyCard(unit);
        }
    }

    addPartyCard(unit) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="char-name">${unit.name} <span style="font-size:12px; color:#aaa;">${unit.role ?? ''}</span></div>
            <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value hp" data-hp></span></div>
            <div class="hp-bar-track"><div class="hp-bar-fill" data-hp-bar></div></div>
            <div class="stat-row" style="margin-top:6px"><span class="stat-label">SP</span><span class="stat-value sp" data-sp></span></div>
            <div class="stat-row"><span class="stat-label">MP</span><span class="stat-value mp" data-mp></span></div>
            <div class="status-row" data-statuses></div>
        `;
        this.partyContainer.appendChild(card);
        this.cards[unit.id] = card;
        this.updateUnit(unit);
    }

    updateUnit(unit) {
        const icon = this.gaugeIcons[unit.id];
        if (icon) {
            if (unit.phase === 'DEAD') {
                icon.classList.add('dead');
            } else {
                const percent = 5 + (unit.ip / IP_MAX) * 90;
                icon.style.left = `${percent}%`;
                icon.style.boxShadow = (unit.phase === 'ACT' || unit.phase === 'EXECUTE')
                    ? `0 0 10px ${unit.color}`
                    : '2px 2px 5px rgba(0,0,0,0.5)';
            }
        }

        const card = this.cards[unit.id];
        if (card) {
            card.querySelector('[data-hp]').textContent = `${unit.hp} / ${unit.maxHp}`;
            card.querySelector('[data-sp]').textContent = `${unit.sp} / ${unit.maxSp}`;
            card.querySelector('[data-mp]').textContent = `${unit.mp} / ${unit.maxMp}`;

            const ratio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 0;
            const bar = card.querySelector('[data-hp-bar]');
            bar.style.width = `${Math.max(0, ratio) * 100}%`;
            bar.classList.toggle('warn', ratio <= 0.5 && ratio > 0.25);
            bar.classList.toggle('crit', ratio <= 0.25);

            card.classList.toggle('dead', unit.phase === 'DEAD');

            const statusRow = card.querySelector('[data-statuses]');
            if (statusRow) {
                statusRow.innerHTML = this.renderStatusChips(unit);
            }
        }
    }

    /** Активные статусы и модификаторы статов в виде компактных плашек. */
    renderStatusChips(unit) {
        const chips = [];

        for (const [name, turns] of Object.entries(unit.statuses ?? {})) {
            if (turns > 0) {
                chips.push(`<span class="status-chip ${name}">${name} ${turns}</span>`);
            }
        }
        for (const [stat, stage] of Object.entries(unit.buffs ?? {})) {
            if (stage > 0) chips.push(`<span class="status-chip buff">${stat}+${stage}</span>`);
        }
        for (const [stat, stage] of Object.entries(unit.debuffs ?? {})) {
            if (stage > 0) chips.push(`<span class="status-chip debuff">${stat}-${stage}</span>`);
        }

        return chips.join('');
    }

    markDead(unit) {
        this.updateUnit(unit);
    }

    markRevived(unit) {
        const icon = this.gaugeIcons[unit.id];
        if (icon) icon.classList.remove('dead');
        this.updateUnit(unit);
    }

    // --- Кольцо команд ------------------------------------------------------

    showCommandRing(unit, actions, onCommandSelected) {
        this.hideCommandRing();
        // Запоминаем, чтобы кнопка Back в выборе цели вернула тот же список.
        this.lastActions = actions;

        const ring = document.createElement('div');
        ring.id = 'command-ring';
        Object.assign(ring.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(20, 30, 45, 0.95)', padding: '20px', borderRadius: '12px',
            border: '2px solid #5a6e8c', display: 'flex', flexDirection: 'column',
            gap: '10px', pointerEvents: 'auto', boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            minWidth: '280px',
        });

        const title = document.createElement('div');
        title.style.cssText = 'font-size: 20px; margin-bottom: 6px; color: #f1c40f;';
        title.textContent = `${unit.name}'s Turn`;
        ring.appendChild(title);

        const scroll = document.createElement('div');
        scroll.className = 'cmd-scroll';
        ring.appendChild(scroll);

        // Группируем команды по категориям, как в оригинальном кольце.
        const GROUP_TITLES = {
            basic: 'Attack', move: 'Special Moves', magic: 'Magic', item: 'Items', defense: 'Defense',
        };
        let lastCategory = null;

        for (const action of actions) {
            const category = action.category ?? 'basic';
            if (category !== lastCategory) {
                const label = document.createElement('div');
                label.className = 'cmd-group-label';
                label.textContent = GROUP_TITLES[category] ?? category;
                scroll.appendChild(label);
                lastCategory = category;
            }

            const button = document.createElement('button');
            button.className = 'cmd-btn';
            button.disabled = !action.enabled;

            const cost = [];
            if (action.costSp) cost.push(`${action.costSp} SP`);
            if (action.costMp) cost.push(`${action.costMp} MP`);
            if (action.count != null) cost.push(`x${action.count}`);

            const element = action.element
                ? `<span class="cmd-el">${action.element}</span>` : '';
            const reason = !action.enabled && action.disabledReason
                ? `<span class="cmd-reason">${action.disabledReason}</span>` : '';
            const costLabel = cost.length
                ? `<span class="cmd-cost">${cost.join(' / ')}</span>` : '';

            button.innerHTML = `<span class="cmd-name">${action.label}</span>${element}${costLabel}${reason}`;

            button.onclick = () => {
                // Действие без выбора цели (Endure/Evade/групповые) выполняем сразу.
                if (action.targets.length === 0) {
                    this.hideCommandRing();
                    onCommandSelected(action.id, null);
                    return;
                }
                // Одна возможная цель — не мучаем игрока лишним кликом.
                if (action.targets.length === 1) {
                    this.hideCommandRing();
                    onCommandSelected(action.id, action.targets[0]);
                    return;
                }
                this.showTargetPicker(unit, action, onCommandSelected);
            };

            scroll.appendChild(button);
        }

        this.uiLayer.appendChild(ring);
        this.commandRing = ring;
    }

    /** Второй экран кольца: выбор конкретной цели (раньше цель была случайной). */
    showTargetPicker(unit, action, onCommandSelected) {
        this.hideCommandRing();

        const picker = document.createElement('div');
        picker.id = 'command-ring';
        Object.assign(picker.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(20, 30, 45, 0.95)', padding: '20px', borderRadius: '12px',
            border: '2px solid #5a6e8c', display: 'flex', flexDirection: 'column',
            gap: '8px', pointerEvents: 'auto', boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            minWidth: '280px',
        });

        const title = document.createElement('div');
        title.style.cssText = 'font-size: 18px; margin-bottom: 6px; color: #f1c40f;';
        title.textContent = `${action.label} — select target`;
        picker.appendChild(title);

        for (const target of action.targets) {
            const button = document.createElement('button');
            button.className = 'target-btn';
            button.innerHTML = `<span>${target.name}</span><span class="target-hp">${target.hp} / ${target.maxHp}</span>`;
            button.onmouseenter = () => this.flashMesh(target.mesh, '#f1c40f', 120);
            button.onclick = () => {
                this.hideCommandRing();
                onCommandSelected(action.id, target);
            };
            picker.appendChild(button);
        }

        const back = document.createElement('button');
        back.className = 'cmd-btn';
        back.textContent = 'Back';
        back.onclick = () => {
            this.showCommandRing(unit, this.lastActions ?? [], onCommandSelected);
        };
        picker.appendChild(back);

        this.uiLayer.appendChild(picker);
        this.commandRing = picker;
    }

    hideCommandRing() {
        if (this.commandRing) {
            this.commandRing.remove();
            this.commandRing = null;
        }
    }

    // --- Всплывающий текст --------------------------------------------------

    showFloatingText(targetMesh, text, kind = 'damage') {
        if (!this.scene || !this.camera || !targetMesh) return;

        const position = targetMesh.getAbsolutePosition().clone();
        position.y += 3.5;

        const viewport = this.camera.viewport.toGlobal(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight(),
        );
        const projected = Vector3.Project(
            position,
            Matrix.Identity(),
            this.scene.getTransformMatrix(),
            viewport,
        );

        const div = document.createElement('div');
        div.className = `float-text ${kind}`;
        div.textContent = text;
        div.style.left = `${projected.x}px`;
        div.style.top = `${projected.y}px`;
        this.uiLayer.appendChild(div);

        requestAnimationFrame(() => {
            div.style.top = `${projected.y - 120}px`;
            div.style.opacity = '0';
        });

        setTimeout(() => div.remove(), 1100);
    }

    flashMesh(mesh, hexColor = '#ff0000', duration = 200) {
        if (!mesh) return;
        const body = mesh.getChildren().find((child) => child.name.includes('_body')) ?? mesh;
        if (!body.material) return;

        const previous = body.material.emissiveColor;
        body.material.emissiveColor = Color3.FromHexString(hexColor);
        setTimeout(() => {
            body.material.emissiveColor = previous ?? new Color3(0, 0, 0);
        }, duration);
    }

    // --- Итог боя -----------------------------------------------------------

    showOutcome(outcome) {
        if (document.getElementById('outcome-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'outcome-banner';
        const isVictory = outcome === 'victory';
        banner.style.color = isVictory ? '#f1c40f' : '#e74c3c';
        banner.innerHTML = `
            ${isVictory ? 'VICTORY' : 'DEFEAT'}
            <div class="sub">Reload the page to fight again</div>
        `;
        this.uiLayer.appendChild(banner);
    }

    showModelWarning() {
        if (document.getElementById('model-warning')) return;
        const warning = document.createElement('div');
        warning.id = 'model-warning';
        warning.innerHTML = `
            <b>GLB models not found.</b><br>
            Run <code>python3 download_model.py</code> to fetch them.
            Using procedural placeholders for now.
        `;
        this.uiLayer.appendChild(warning);
    }
}
