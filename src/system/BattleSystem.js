import { Vector3 } from '@babylonjs/core';
import {
    ACTION_LIBRARY,
    COM_START,
    IP_MAX,
    WAIT_SPEED_SCALE,
    calcHealAmount,
    calcPhysicalDamage,
    getBattleStat,
} from '../entities/combat.js';

// --- Константы связки "движок <-> 3D-сцена" ---------------------------------

// combat.js оперирует полем 960x360 условных единиц, сцена — ареной диаметром 30.
// MOV = 180 + spd*8 (около 356 у Рюдо), после масштабирования ~11 ед/сек.
const WORLD_SCALE = 30 / 960;

// Ограничитель кадровой дельты: если вкладку свернуть, engine.getDeltaTime()
// вернёт сотни миллисекунд и юниты «телепортируются» сквозь цель.
const MAX_DELTA = 0.05;

// Насколько близко нужно подбежать, чтобы удар засчитался (в мировых единицах).
const MELEE_RANGE = 2.2;
// Порог «добежал домой», чтобы не дрожать вокруг точки при большой скорости.
const HOME_EPSILON = 0.15;

const ENDURE_MULTIPLIER = 0.35; // из applyHitEffects() в combat.js
const AI_THINK_SECONDS = 0.45;
const HIT_RECOVERY_SECONDS = 0.35; // пауза между ударами комбо
const WINDUP_SECONDS = 0.12;       // замах перед первым ударом

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Боевая система: IP-шкала, перемещение по арене, урон, смерть и исход боя.
 *
 * Числа (урон, откат по IP, стоимость приёмов) не выдумываются здесь заново —
 * они берутся из ACTION_LIBRARY/PRESETS и формул combat.js, чтобы 3D-прототип
 * и симулятор баланса не разъезжались.
 */
export class BattleSystem {
    constructor(uiController) {
        this.units = [];
        this.ui = uiController;

        this.isPaused = false;      // пауза на время выбора команды игроком
        this.outcome = null;        // null | 'victory' | 'defeat'
        this.commandQueue = [];     // игроки, дошедшие до COM и ждущие приказа
        this.awaitingInput = null;  // юнит, для которого сейчас открыто кольцо
    }

    // --- Регистрация юнитов -------------------------------------------------

    addUnit(unitData, isPlayer) {
        const preset = unitData.data;

        const unit = {
            // Канонические статы (str/vit/agi/spd/mag/men) кладём в корень юнита,
            // чтобы getBattleStat() и calcPhysicalDamage() принимали его как есть.
            ...preset,

            id: unitData.id,
            name: preset.name,
            isPlayer,
            team: isPlayer ? 'players' : 'enemies',

            hp: preset.maxHp,
            maxHp: preset.maxHp,
            sp: preset.startSp ?? 0,
            maxSp: preset.maxSp ?? 0,
            mp: preset.startMp ?? 0,
            maxMp: preset.maxMp ?? 0,

            ip: 0,
            phase: 'WAIT',          // WAIT -> COM -> ACT -> EXECUTE -> WAIT
            pendingAction: null,
            guard: null,            // 'endure' до следующего хода
            buffs: { atk: 0, def: 0, act: 0, mov: 0 },
            debuffs: { atk: 0, def: 0, act: 0, mov: 0 },

            actionState: null,
            target: null,
            hitsDone: 0,
            attackTimer: 0,
            aiThinkTimer: 0,

            mesh: unitData.mesh,
            homePosition: unitData.mesh.position.clone(),
        };

        this.units.push(unit);
        this.ui.addUnit(unit);
        return unit;
    }

    // --- Выборки ------------------------------------------------------------

    isAlive(unit) {
        return unit.hp > 0;
    }

    livingUnits() {
        return this.units.filter((unit) => this.isAlive(unit));
    }

    livingOpponents(unit) {
        return this.units.filter((other) => this.isAlive(other) && other.isPlayer !== unit.isPlayer);
    }

    livingAllies(unit) {
        return this.units.filter((other) => this.isAlive(other) && other.isPlayer === unit.isPlayer);
    }

    // --- Главный цикл -------------------------------------------------------

    update(rawDelta) {
        if (this.outcome) return;

        const deltaTime = Math.min(rawDelta, MAX_DELTA);
        if (deltaTime <= 0) return;

        if (!this.isPaused) {
            for (const unit of this.units) {
                if (!this.isAlive(unit)) continue;

                switch (unit.phase) {
                    case 'WAIT':
                        this.tickWait(unit, deltaTime);
                        break;
                    case 'COM':
                        this.tickCom(unit, deltaTime);
                        break;
                    case 'ACT':
                        this.tickAct(unit, deltaTime);
                        break;
                    case 'EXECUTE':
                        this.tickExecute(unit, deltaTime);
                        break;
                    default:
                        break;
                }

                this.ui.updateUnit(unit);
            }
        }

        // Кольцо команд открываем строго по одному юниту за раз: раньше при
        // одновременном достижении COM второй игрок «зависал» на шкале навсегда.
        this.pumpCommandQueue();
        this.checkBattleEnd();
    }

    tickWait(unit, deltaTime) {
        unit.ip += this.ipSpeed(unit) * deltaTime;

        if (unit.ip >= COM_START) {
            unit.ip = COM_START;
            unit.phase = 'COM';
            unit.guard = null; // защита действует только до своего следующего хода

            if (unit.isPlayer) {
                this.commandQueue.push(unit);
            } else {
                unit.aiThinkTimer = AI_THINK_SECONDS;
            }
        }
    }

    tickCom(unit, deltaTime) {
        // Игрок ждёт приказа через очередь; здесь двигаем только AI.
        if (unit.isPlayer) return;

        unit.aiThinkTimer -= deltaTime;
        if (unit.aiThinkTimer <= 0) {
            const action = this.chooseEnemyAction(unit);
            if (action) {
                this.commitAction(unit, action.actionId, action.target);
            } else {
                // Совсем нечего делать (например, все цели мертвы) — сброс.
                this.resetToWait(unit);
            }
        }
    }

    tickAct(unit, deltaTime) {
        const multiplier = unit.pendingAction?.definition.chargeMultiplier ?? 1;
        unit.ip += this.ipSpeed(unit) * multiplier * deltaTime;

        if (unit.ip >= IP_MAX) {
            unit.ip = IP_MAX;
            unit.phase = 'EXECUTE';
            unit.actionState = null;
        }
    }

    ipSpeed(unit) {
        return getBattleStat(unit, 'ACT') * WAIT_SPEED_SCALE;
    }

    moveSpeed(unit) {
        return getBattleStat(unit, 'MOV') * WORLD_SCALE;
    }

    // --- Выбор команды ------------------------------------------------------

    pumpCommandQueue() {
        if (this.awaitingInput || this.outcome) return;

        // Отбрасываем тех, кто успел умереть в очереди.
        while (this.commandQueue.length > 0 && !this.isAlive(this.commandQueue[0])) {
            this.commandQueue.shift();
        }

        const unit = this.commandQueue.shift();
        if (!unit) return;

        if (this.livingOpponents(unit).length === 0) return;

        this.awaitingInput = unit;
        this.isPaused = true;

        this.ui.showCommandRing(unit, this.getAvailableActions(unit), (actionId, target) => {
            this.awaitingInput = null;
            this.isPaused = false;
            this.commitAction(unit, actionId, target);
        });
    }

    /** Список доступных действий с учётом SP/MP и живых целей. */
    getAvailableActions(unit) {
        const opponents = this.livingOpponents(unit);
        const allies = this.livingAllies(unit);
        const loadout = unit.loadout ?? {};

        const ids = ['combo', 'critical'];
        if (loadout.cancelMove) ids.push(loadout.cancelMove);
        if (loadout.healMagic) ids.push(loadout.healMagic);
        ids.push('endure', 'evade');

        const actions = [];
        for (const id of ids) {
            const definition = ACTION_LIBRARY[id];
            if (!definition) continue;

            const costSp = definition.costSp ?? 0;
            const costMp = definition.costMp ?? 0;
            const affordable = unit.sp >= costSp && unit.mp >= costMp;

            const needsEnemy = definition.targeting === 'single' || definition.targeting === 'all-enemies';
            const needsAlly = definition.targeting === 'single-ally';
            if (needsEnemy && opponents.length === 0) continue;
            if (needsAlly && allies.length === 0) continue;

            actions.push({
                id,
                label: definition.label,
                definition,
                enabled: affordable,
                costSp,
                costMp,
                targets: needsAlly ? allies : needsEnemy ? opponents : [],
            });
        }

        return actions;
    }

    /**
     * AI противника. Каноничная для Grandia логика: если герой уже занёс
     * оружие (фаза COM/ACT), выгодно ударить Critical и сбить ему ход.
     */
    chooseEnemyAction(unit) {
        const opponents = this.livingOpponents(unit);
        if (opponents.length === 0) return null;

        // Приоритет — прервать того, кто ближе всех к удару.
        const interruptible = opponents
            .filter((foe) => foe.phase === 'COM' || foe.phase === 'ACT')
            .sort((a, b) => b.ip - a.ip)[0];

        if (interruptible) {
            return { actionId: 'critical', target: interruptible };
        }

        // Иначе добиваем самого раненого.
        const weakest = [...opponents].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        return { actionId: 'combo', target: weakest };
    }

    commitAction(unit, actionId, explicitTarget = null) {
        const definition = ACTION_LIBRARY[actionId];
        if (!definition) {
            this.resetToWait(unit);
            return;
        }

        // Мгновенные защитные действия не доходят до фазы EXECUTE.
        if (definition.instant) {
            this.applyInstantAction(unit, definition);
            return;
        }

        let target = explicitTarget;
        if (!target || !this.isAlive(target)) {
            target = this.pickDefaultTarget(unit, definition);
        }

        if (!target) {
            this.resetToWait(unit);
            return;
        }

        // Списываем стоимость в момент подтверждения приказа.
        unit.sp = clamp(unit.sp - (definition.costSp ?? 0), 0, unit.maxSp);
        unit.mp = clamp(unit.mp - (definition.costMp ?? 0), 0, unit.maxMp);

        unit.pendingAction = { definition, targetId: target.id };
        unit.target = target;
        unit.phase = 'ACT';
        this.ui.updateUnit(unit);
    }

    pickDefaultTarget(unit, definition) {
        if (definition.targeting === 'single-ally') {
            const allies = this.livingAllies(unit);
            return [...allies].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ?? null;
        }
        const opponents = this.livingOpponents(unit);
        return opponents[Math.floor(Math.random() * opponents.length)] ?? null;
    }

    applyInstantAction(unit, definition) {
        if (definition.id === 'endure') {
            unit.guard = 'endure';
            this.ui.showFloatingText(unit.mesh, 'ENDURE', 'guard');
        } else if (definition.id === 'evade') {
            // Уходим от центра боя — простая имитация evade-точек combat.js.
            const away = unit.homePosition.clone();
            away.x += unit.isPlayer ? -3 : 3;
            unit.homePosition = away;
            unit.mesh.position.copyFrom(away);
            this.ui.showFloatingText(unit.mesh, 'EVADE', 'guard');
        }

        this.resetToWait(unit);
        this.ui.updateUnit(unit);
    }

    // --- Исполнение действия ------------------------------------------------

    tickExecute(unit, deltaTime) {
        if (!unit.actionState) {
            unit.actionState = 'RUN_FORWARD';
            unit.hitsDone = 0;
            unit.attackTimer = WINDUP_SECONDS;
        }

        const definition = unit.pendingAction?.definition;
        if (!definition) {
            this.finishAction(unit);
            return;
        }

        // Цель могла погибнуть, пока мы бежали, — перенацеливаемся.
        if (!unit.target || !this.isAlive(unit.target)) {
            const replacement = definition.targeting === 'single-ally'
                ? this.pickDefaultTarget(unit, definition)
                : this.livingOpponents(unit)[0] ?? null;

            if (!replacement) {
                unit.actionState = 'RUN_BACK';
                unit.target = null;
            } else {
                unit.target = replacement;
            }
        }

        switch (unit.actionState) {
            case 'RUN_FORWARD':
                this.tickRunForward(unit, definition, deltaTime);
                break;
            case 'ATTACK':
                this.tickAttack(unit, definition, deltaTime);
                break;
            case 'RUN_BACK':
                this.tickRunBack(unit, deltaTime);
                break;
            default:
                break;
        }
    }

    tickRunForward(unit, definition, deltaTime) {
        // Дальнобойные приёмы и лечение бьют с места.
        if (definition.melee === false || definition.kind === 'magic') {
            if (unit.target) this.faceTowards(unit, unit.target.mesh.position);
            unit.actionState = 'ATTACK';
            return;
        }

        if (!unit.target) {
            unit.actionState = 'RUN_BACK';
            return;
        }

        const targetPos = unit.target.mesh.position.clone();
        targetPos.y = unit.mesh.position.y;

        this.faceTowards(unit, targetPos);

        const distance = Vector3.Distance(unit.mesh.position, targetPos);
        if (distance <= MELEE_RANGE) {
            unit.actionState = 'ATTACK';
            return;
        }

        const step = this.moveSpeed(unit) * deltaTime;
        const direction = targetPos.subtract(unit.mesh.position).normalize();
        // Не перепрыгиваем цель за один кадр.
        unit.mesh.position.addInPlace(direction.scale(Math.min(step, distance - MELEE_RANGE)));
    }

    tickAttack(unit, definition, deltaTime) {
        unit.attackTimer -= deltaTime;
        if (unit.attackTimer > 0) return;

        const target = unit.target;
        if (!target || !this.isAlive(target)) {
            unit.actionState = 'RUN_BACK';
            return;
        }

        if (definition.kind === 'magic') {
            this.applyHeal(unit, target, definition);
        } else {
            this.applyHit(unit, target, definition);
        }

        unit.hitsDone += 1;

        const hitCount = definition.hitCount ?? 1;
        if (unit.hitsDone < hitCount && this.isAlive(target)) {
            unit.attackTimer = HIT_RECOVERY_SECONDS;
        } else {
            unit.actionState = 'RUN_BACK';
        }
    }

    tickRunBack(unit, deltaTime) {
        const home = unit.homePosition;
        const distance = Vector3.Distance(unit.mesh.position, home);

        if (distance <= HOME_EPSILON) {
            unit.mesh.position.copyFrom(home);
            unit.mesh.lookAt(Vector3.Zero());
            this.finishAction(unit);
            return;
        }

        const step = this.moveSpeed(unit) * deltaTime;
        const direction = home.subtract(unit.mesh.position).normalize();
        unit.mesh.position.addInPlace(direction.scale(Math.min(step, distance)));
        // Смотрим в сторону центра арены, а не «спиной вперёд».
        this.faceTowards(unit, Vector3.Zero());
    }

    faceTowards(unit, position) {
        const flat = position.clone();
        flat.y = unit.mesh.position.y;
        if (Vector3.DistanceSquared(unit.mesh.position, flat) > 1e-6) {
            unit.mesh.lookAt(flat);
        }
    }

    finishAction(unit) {
        unit.pendingAction = null;
        unit.target = null;
        unit.actionState = null;
        unit.hitsDone = 0;
        this.resetToWait(unit);
        this.ui.updateUnit(unit);
    }

    resetToWait(unit) {
        unit.phase = 'WAIT';
        unit.ip = 0;
        unit.pendingAction = null;
        unit.aiThinkTimer = 0;
    }

    // --- Урон, лечение, смерть ---------------------------------------------

    applyHit(attacker, target, definition) {
        const power = definition.power ?? 1;
        const raw = calcPhysicalDamage(attacker, target, power);
        const mitigated = target.guard === 'endure' ? raw * ENDURE_MULTIPLIER : raw;
        const damage = Math.max(1, Math.round(mitigated));

        target.hp = clamp(target.hp - damage, 0, target.maxHp);

        this.ui.showFloatingText(target.mesh, String(damage), 'damage');
        this.ui.flashMesh(target.mesh);

        // Атакующий копит SP за попадание.
        attacker.sp = clamp(attacker.sp + (definition.spGainOnHit ?? 0), 0, attacker.maxSp);

        this.applyIpDamage(target, definition);

        this.ui.updateUnit(attacker);
        this.ui.updateUnit(target);

        if (!this.isAlive(target)) {
            this.handleDeath(target);
        }
    }

    applyHeal(caster, target, definition) {
        const amount = calcHealAmount(caster, definition.powerBase ?? 0);
        const before = target.hp;
        target.hp = clamp(target.hp + amount, 0, target.maxHp);

        this.ui.showFloatingText(target.mesh, `+${target.hp - before}`, 'heal');
        this.ui.updateUnit(target);
    }

    /**
     * Откат по шкале IP. Если цель уже занесла оружие (COM/ACT) и приём умеет
     * прерывать — это CANCEL: действие теряется целиком.
     */
    applyIpDamage(target, definition) {
        if (!this.isAlive(target)) return;

        const canCancel = definition.cancel && (target.phase === 'COM' || target.phase === 'ACT');

        if (canCancel) {
            const pushback = definition.cancelPushback ?? definition.ipDamage ?? 0;
            target.ip = clamp(target.ip - pushback, 0, IP_MAX);
            target.phase = 'WAIT';
            target.pendingAction = null;
            target.target = null;
            target.actionState = null;
            target.aiThinkTimer = 0;

            // Юнит, стоявший в очереди на приказ, больше в ней не нужен.
            this.commandQueue = this.commandQueue.filter((queued) => queued !== target);

            this.ui.showFloatingText(target.mesh, 'CANCEL!', 'cancel');
            return;
        }

        // Юнит в EXECUTE уже «выстрелил» — сбивать его поздно.
        if (target.phase === 'EXECUTE') return;

        target.ip = clamp(target.ip - (definition.ipDamage ?? 0), 0, COM_START);
    }

    handleDeath(unit) {
        unit.phase = 'DEAD';
        unit.ip = 0;
        unit.pendingAction = null;
        unit.target = null;
        unit.actionState = null;
        unit.guard = null;

        this.commandQueue = this.commandQueue.filter((queued) => queued !== unit);
        if (this.awaitingInput === unit) {
            this.awaitingInput = null;
            this.isPaused = false;
            this.ui.hideCommandRing();
        }

        // Живые юниты не должны продолжать бить труп.
        for (const other of this.units) {
            if (other.target === unit) {
                other.target = null;
            }
        }

        this.ui.showFloatingText(unit.mesh, 'DOWN', 'cancel');
        this.ui.markDead(unit);
    }

    checkBattleEnd() {
        if (this.outcome) return;

        const playersAlive = this.units.some((unit) => unit.isPlayer && this.isAlive(unit));
        const enemiesAlive = this.units.some((unit) => !unit.isPlayer && this.isAlive(unit));

        if (enemiesAlive && playersAlive) return;

        this.outcome = playersAlive ? 'victory' : 'defeat';
        this.isPaused = true;
        this.awaitingInput = null;
        this.commandQueue = [];
        this.ui.hideCommandRing();
        this.ui.showOutcome(this.outcome);
    }
}
