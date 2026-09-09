import { Vector3 } from '@babylonjs/core';
import {
    ACTION_LIBRARY,
    COM_START,
    IP_MAX,
    WAIT_SPEED_SCALE,
    applyStatShift,
    applyStatus,
    calcHealAmount,
    calcMagicDamage,
    calcPhysicalDamage,
    getBattleStat,
    processTimedModifiers,
    scaleActionDefinitionForLevel,
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

// --- Каноничные правила из applyHitEffects() (combat.js) --------------------

const ENDURE_DAMAGE_MULTIPLIER = 0.35;  // Endure режет урон
const ENDURE_IP_MULTIPLIER = 0.4;       // ...и откат по шкале
const COUNTER_IP_THRESHOLD = 930;       // удар по «занёсшему» юниту усилен
const COUNTER_MULTIPLIER = 1.25;
const SP_GAIN_ON_TAKING_HIT = 3;        // защищающийся тоже копит SP
const SP_GAIN_ON_TAKING_HIT_ENDURE = 5;
const POISON_HP_FRACTION = 0.06;        // яд за ход
const PARALYSIS_SKIP_CHANCE = 0.5;

const AI_THINK_SECONDS = 0.45;
const HIT_RECOVERY_SECONDS = 0.35; // пауза между ударами комбо
const WINDUP_SECONDS = 0.12;       // замах перед первым ударом

// Порядок команд в кольце — как в оригинале.
const COMMAND_CATEGORIES = ['basic', 'move', 'magic', 'item', 'defense'];

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
    constructor(uiController, { inventory, rng = Math.random } = {}) {
        this.units = [];
        this.ui = uiController;
        this.rng = rng;

        this.isPaused = false;      // пауза на время выбора команды игроком
        this.outcome = null;        // null | 'victory' | 'defeat'
        this.commandQueue = [];     // игроки, дошедшие до COM и ждущие приказа
        this.awaitingInput = null;  // юнит, для которого сейчас открыто кольцо

        // Инвентарь общий на партию, как в оригинале.
        this.inventory = { ...(inventory ?? { medicinalHerb: 3, antidote: 2, yomisElixir: 1 }) };
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
            guard: null,            // 'endure' / 'evade' до следующего хода

            // Модификаторы статов со сроком жизни в ходах (getBattleStat их читает).
            buffs: { atk: 0, def: 0, act: 0, mov: 0 },
            debuffs: { atk: 0, def: 0, act: 0, mov: 0 },
            buffTimers: { atk: 0, def: 0, act: 0, mov: 0 },
            debuffTimers: { atk: 0, def: 0, act: 0, mov: 0 },

            // Статусы из канона: сон, блок движения/магии, яд, замешательство, паралич.
            statuses: { sleep: 0, moveBlock: 0, magicBlock: 0, poison: 0, confusion: 0, paralysis: 0 },
            resistances: { ...(preset.resistances ?? {}) },
            statusResistances: { ...(preset.statusResistances ?? {}) },
            actionLevels: { ...(preset.actionLevels ?? {}) },

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

            // Яд/сон/паралич и истечение баффов срабатывают в начале хода.
            if (this.processTurnStartStatuses(unit)) {
                return; // ход потерян (или юнит погиб от яда)
            }

            if (unit.isPlayer) {
                this.commandQueue.push(unit);
            } else {
                unit.aiThinkTimer = AI_THINK_SECONDS;
            }
        }
    }

    /**
     * Статусы, срабатывающие в начале хода — порт processTurnStartStatuses()
     * из combat.js. Возвращает true, если ход пропущен.
     */
    processTurnStartStatuses(unit) {
        const statuses = unit.statuses;

        if ((statuses.poison ?? 0) > 0) {
            const damage = Math.max(1, Math.round(unit.maxHp * POISON_HP_FRACTION));
            unit.hp = clamp(unit.hp - damage, 0, unit.maxHp);
            statuses.poison = Math.max(0, statuses.poison - 1);

            this.ui.showFloatingText(unit.mesh, String(damage), 'poison');
            this.ui.updateUnit(unit);

            if (unit.hp <= 0) {
                this.handleDeath(unit);
                return true;
            }
        }

        if ((statuses.paralysis ?? 0) > 0) {
            statuses.paralysis = Math.max(0, statuses.paralysis - 1);
            if (this.rng() < PARALYSIS_SKIP_CHANCE) {
                this.ui.showFloatingText(unit.mesh, 'PARALYZED', 'status');
                this.resetToWait(unit);
                this.ui.updateUnit(unit);
                return true;
            }
        }

        if ((statuses.confusion ?? 0) > 0) {
            statuses.confusion = Math.max(0, statuses.confusion - 1);
        }

        for (const key of ['moveBlock', 'magicBlock']) {
            if ((statuses[key] ?? 0) > 0) {
                statuses[key] = Math.max(0, statuses[key] - 1);
            }
        }

        if ((statuses.sleep ?? 0) > 0) {
            statuses.sleep = Math.max(0, statuses.sleep - 1);
            this.ui.showFloatingText(unit.mesh, 'ASLEEP', 'status');
            this.resetToWait(unit);
            this.ui.updateUnit(unit);
            return true;
        }

        processTimedModifiers(unit);
        this.ui.updateUnit(unit);
        return false;
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

    /** Определение приёма с учётом уровня владения (как getActionDefinition в движке). */
    getDefinition(unit, actionId) {
        const base = ACTION_LIBRARY[actionId];
        if (!base) return null;
        return scaleActionDefinitionForLevel(base, unit?.actionLevels?.[actionId] ?? 1);
    }

    /**
     * Полный список команд юнита, собранный из его loadout — как в оригинале:
     * Combo/Critical, приёмы за SP, магия за MP, предметы из общего инвентаря,
     * Endure/Evade. Учитывает блокировку магии (magicBlock) и движения (moveBlock).
     */
    collectActionIds(unit) {
        const loadout = unit.loadout ?? {};
        const ids = ['combo', 'critical'];

        const push = (value) => {
            for (const id of [value].flat()) {
                if (id && !ids.includes(id)) ids.push(id);
            }
        };

        push(loadout.cancelMove);
        push(loadout.cancelMoves);
        push(loadout.singleMoves);
        push(loadout.aoeMoves);
        push(loadout.statusMoves);
        push(loadout.healMagic);
        push(loadout.healMagics);
        push(loadout.offensiveMagic);
        push(loadout.offensiveMagics);
        push(loadout.supportMagics);
        push(loadout.debuffMagics);

        // Предметы доступны только партии и только те, что есть в наличии.
        if (unit.isPlayer) {
            for (const [key, count] of Object.entries(this.inventory)) {
                if (count > 0 && ACTION_LIBRARY[key]) push(key);
            }
        }

        ids.push('endure', 'evade');
        return ids;
    }

    /** Список доступных действий с учётом ресурсов, статусов и живых целей. */
    getAvailableActions(unit) {
        const opponents = this.livingOpponents(unit);
        const allies = this.livingAllies(unit);
        const downedAllies = this.units.filter((u) => u.isPlayer === unit.isPlayer && u.hp <= 0);

        const magicBlocked = (unit.statuses?.magicBlock ?? 0) > 0;
        const moveBlocked = (unit.statuses?.moveBlock ?? 0) > 0;

        const actions = [];
        for (const id of this.collectActionIds(unit)) {
            const definition = this.getDefinition(unit, id);
            if (!definition) continue;

            const costSp = definition.costSp ?? 0;
            const costMp = definition.costMp ?? 0;

            // Воскрешение целится в павших, всё остальное — в живых.
            const targetsDowned = Boolean(definition.revive);
            const needsEnemy = definition.targeting === 'single'
                || definition.targeting === 'all-enemies'
                || definition.targeting === 'line';
            const needsAlly = definition.targeting === 'single-ally' || definition.targeting === 'all-allies';

            let targets = [];
            if (needsEnemy) targets = opponents;
            else if (needsAlly) targets = targetsDowned ? downedAllies : allies;

            if ((needsEnemy || needsAlly) && targets.length === 0) continue;

            // Групповые действия цель не выбирают.
            const pickable = definition.targeting === 'single' || definition.targeting === 'single-ally';

            const reasons = [];
            if (unit.sp < costSp) reasons.push('not enough SP');
            if (unit.mp < costMp) reasons.push('not enough MP');
            if (magicBlocked && definition.kind === 'magic') reasons.push('magic sealed');
            // moveBlock запрещает приёмы с подбеганием, но не базовые атаки.
            if (moveBlocked && definition.commandType === 'move') reasons.push('move sealed');
            if (definition.inventoryKey && (this.inventory[definition.inventoryKey] ?? 0) <= 0) reasons.push('none left');

            actions.push({
                id,
                label: definition.label,
                definition,
                category: definition.commandType ?? 'basic',
                enabled: reasons.length === 0,
                disabledReason: reasons[0] ?? null,
                costSp,
                costMp,
                count: definition.inventoryKey ? (this.inventory[definition.inventoryKey] ?? 0) : null,
                element: definition.element ?? null,
                targets: pickable ? targets : [],
            });
        }

        // Стабильный порядок: базовые -> приёмы -> магия -> предметы -> защита.
        return actions.sort((a, b) => {
            const byCategory = COMMAND_CATEGORIES.indexOf(a.category) - COMMAND_CATEGORIES.indexOf(b.category);
            return byCategory !== 0 ? byCategory : 0;
        });
    }

    /**
     * AI противника. Каноничная для Grandia логика: если герой уже занёс
     * оружие (фаза COM/ACT), выгодно ударить Critical и сбить ему ход.
     */
    chooseEnemyAction(unit) {
        // Замешательство: бьём случайную цель, включая своих.
        if ((unit.statuses?.confusion ?? 0) > 0) {
            const anyone = this.units.filter((u) => this.isAlive(u) && u !== unit);
            if (anyone.length === 0) return null;
            return {
                actionId: this.rng() < 0.5 ? 'combo' : 'critical',
                target: anyone[Math.floor(this.rng() * anyone.length)],
            };
        }

        const opponents = this.livingOpponents(unit);
        if (opponents.length === 0) return null;

        const available = this.getAvailableActions(unit).filter((a) => a.enabled);
        const canUse = (id) => available.some((a) => a.id === id);

        // Приоритет — прервать того, кто ближе всех к удару.
        const interruptible = opponents
            .filter((foe) => foe.phase === 'COM' || foe.phase === 'ACT')
            .sort((a, b) => b.ip - a.ip)[0];

        if (interruptible) {
            return { actionId: 'critical', target: interruptible };
        }

        const weakest = [...opponents].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

        // Иногда пускаем в ход фирменные статусные приёмы (яд, паутина, сон).
        const statusMoves = (unit.loadout?.statusMoves ?? []).filter(canUse);
        if (statusMoves.length > 0 && this.rng() < 0.35) {
            const move = statusMoves[Math.floor(this.rng() * statusMoves.length)];
            const definition = this.getDefinition(unit, move);
            // Не тратим приём, если статус уже висит на цели.
            const alreadyAfflicted = (definition?.statusEffects ?? [])
                .every((effect) => (weakest.statuses?.[effect.name] ?? 0) > 0);
            if (!alreadyAfflicted) {
                return { actionId: move, target: weakest };
            }
        }

        return { actionId: 'combo', target: weakest };
    }

    commitAction(unit, actionId, explicitTarget = null) {
        const definition = this.getDefinition(unit, actionId);
        if (!definition) {
            this.resetToWait(unit);
            return;
        }

        // Мгновенные действия (Endure/Evade/предметы) не доходят до фазы EXECUTE.
        if (definition.instant) {
            this.applyInstantAction(unit, definition);
            return;
        }

        const groupTargeting = definition.targeting === 'all-enemies'
            || definition.targeting === 'all-allies'
            || definition.targeting === 'line';

        let target = explicitTarget;
        if (!groupTargeting && (!target || !this.isValidTarget(target, definition))) {
            target = this.pickDefaultTarget(unit, definition);
        }

        if (!groupTargeting && !target) {
            this.resetToWait(unit);
            return;
        }

        // Списываем стоимость в момент подтверждения приказа.
        unit.sp = clamp(unit.sp - (definition.costSp ?? 0), 0, unit.maxSp);
        unit.mp = clamp(unit.mp - (definition.costMp ?? 0), 0, unit.maxMp);

        unit.pendingAction = { definition, targetId: target?.id ?? null };
        unit.target = target ?? null;
        unit.phase = 'ACT';
        this.ui.updateUnit(unit);
    }

    /** Воскрешение целится в павших, всё остальное — только в живых. */
    isValidTarget(target, definition) {
        return definition.revive ? target.hp <= 0 : this.isAlive(target);
    }

    pickDefaultTarget(unit, definition) {
        if (definition.revive) {
            return this.units.find((u) => u.isPlayer === unit.isPlayer && u.hp <= 0) ?? null;
        }
        if (definition.targeting === 'single-ally') {
            const allies = this.livingAllies(unit);
            return [...allies].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ?? null;
        }
        const opponents = this.livingOpponents(unit);
        return opponents[Math.floor(this.rng() * opponents.length)] ?? null;
    }

    /** Кого фактически заденет действие в момент исполнения. */
    resolveTargets(unit, definition) {
        switch (definition.targeting) {
            case 'all-enemies':
            case 'line':
                return this.livingOpponents(unit);
            case 'all-allies':
                return this.livingAllies(unit);
            case 'self':
                return [unit];
            default: {
                if (unit.target && this.isValidTarget(unit.target, definition)) return [unit.target];
                const fallback = this.pickDefaultTarget(unit, definition);
                return fallback ? [fallback] : [];
            }
        }
    }

    applyInstantAction(unit, definition, explicitTarget = null) {
        if (definition.id === 'endure') {
            unit.guard = 'endure';
            this.ui.showFloatingText(unit.mesh, 'ENDURE', 'guard');
        } else if (definition.id === 'evade') {
            // Уходим от центра боя — простая имитация evade-точек combat.js.
            const away = unit.homePosition.clone();
            away.x += unit.isPlayer ? -3 : 3;
            unit.homePosition = away;
            unit.mesh.position.copyFrom(away);
            unit.guard = 'evade';
            this.ui.showFloatingText(unit.mesh, 'EVADE', 'guard');
        } else if (definition.kind === 'item') {
            this.applyItem(unit, definition, explicitTarget);
        }

        this.resetToWait(unit);
        this.ui.updateUnit(unit);
    }

    /** Предметы: лечение, снятие статусов, воскрешение, восстановление SP/MP. */
    applyItem(unit, definition, explicitTarget = null) {
        const key = definition.inventoryKey;
        if (key && (this.inventory[key] ?? 0) <= 0) {
            this.ui.showFloatingText(unit.mesh, 'NONE LEFT', 'status');
            return;
        }
        if (key) this.inventory[key] -= 1;

        const targets = explicitTarget
            ? [explicitTarget]
            : this.resolveTargets(unit, definition);

        for (const target of targets) {
            if (target.hp <= 0 && definition.revive) {
                target.hp = Math.max(1, Math.round(target.maxHp * (definition.reviveRatio ?? 0.35)));
                target.phase = 'WAIT';
                target.ip = 0;
                this.ui.showFloatingText(target.mesh, 'REVIVE', 'heal');
                this.ui.markRevived?.(target);
            }

            if (target.hp <= 0) continue;

            if ((definition.healBase ?? 0) > 0) {
                const before = target.hp;
                target.hp = clamp(target.hp + definition.healBase, 0, target.maxHp);
                this.ui.showFloatingText(target.mesh, `+${target.hp - before}`, 'heal');
            }
            if ((definition.restoreSp ?? 0) > 0) {
                target.sp = clamp(target.sp + definition.restoreSp, 0, target.maxSp);
            }
            if ((definition.restoreMp ?? 0) > 0) {
                target.mp = clamp(target.mp + definition.restoreMp, 0, target.maxMp);
            }

            const cured = [];
            for (const status of definition.cureStatuses ?? []) {
                if ((target.statuses?.[status] ?? 0) > 0) {
                    target.statuses[status] = 0;
                    cured.push(status);
                }
            }
            if (cured.length > 0) {
                this.ui.showFloatingText(target.mesh, 'CURED', 'heal');
            }

            this.ui.updateUnit(target);
        }
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

        // Групповые действия цель не держат — там всё решает resolveTargets().
        const groupTargeting = definition.targeting === 'all-enemies'
            || definition.targeting === 'all-allies'
            || definition.targeting === 'line'
            || definition.targeting === 'self';

        if (!groupTargeting && (!unit.target || !this.isValidTarget(unit.target, definition))) {
            // Цель могла погибнуть, пока мы бежали, — перенацеливаемся.
            const replacement = this.pickDefaultTarget(unit, definition);
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
        // С места бьют: дальнобойные приёмы, магия, предметы, групповые атаки
        // и любой юнит со статусом moveBlock (движение заблокировано).
        const groupTargeting = definition.targeting === 'all-enemies'
            || definition.targeting === 'all-allies'
            || definition.targeting === 'line';

        if (definition.melee === false
            || definition.kind === 'magic'
            || definition.kind === 'item'
            || groupTargeting
            || (unit.statuses?.moveBlock ?? 0) > 0) {
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

        const targets = this.resolveTargets(unit, definition);
        if (targets.length === 0) {
            unit.actionState = 'RUN_BACK';
            return;
        }

        this.applyActionToTargets(unit, definition, targets);

        unit.hitsDone += 1;

        // Многоударные приёмы продолжают бить, пока цель жива.
        const hitCount = definition.hitCount ?? 1;
        const stillFighting = targets.some((t) => this.isAlive(t));
        if (unit.hitsDone < hitCount && stillFighting) {
            unit.attackTimer = HIT_RECOVERY_SECONDS;
        } else {
            unit.actionState = 'RUN_BACK';
        }
    }

    /** Диспетчер эффектов: урон, магия, лечение, баффы, статусы. */
    applyActionToTargets(unit, definition, targets) {
        for (const target of targets) {
            // Воскрешение и лечение павших.
            if (definition.revive && target.hp <= 0) {
                target.hp = Math.max(1, Math.round(target.maxHp * (definition.reviveRatio ?? 0.35)));
                target.phase = 'WAIT';
                target.ip = 0;
                this.ui.showFloatingText(target.mesh, 'REVIVE', 'heal');
                this.ui.markRevived?.(target);
                this.ui.updateUnit(target);
                continue;
            }

            const isHealing = (definition.powerBase ?? 0) > 0 || (definition.healBase ?? 0) > 0;
            const isOffensiveMagic = definition.kind === 'magic'
                && (definition.spellPower != null || definition.spellBase != null);

            if (isHealing) {
                this.applyHeal(unit, target, definition);
            } else if (isOffensiveMagic) {
                this.applyMagicHit(unit, target, definition);
            } else if (definition.kind === 'physical') {
                this.applyHit(unit, target, definition);
            }

            // Баффы/дебаффы и статусы могут висеть на любом типе действия.
            this.applySupportEffects(unit, target, definition);
        }
    }

    /** Баффы, дебаффы, снятие и наложение статусов. */
    applySupportEffects(actor, target, definition) {
        for (const shift of definition.statShifts ?? []) {
            // Дебаффы летят во врага, баффы — в союзника.
            const wantsAlly = (shift.target ?? 'ally') === 'ally';
            if (wantsAlly !== (target.isPlayer === actor.isPlayer)) continue;

            if (applyStatShift(target, shift)) {
                const label = `${shift.stat.toUpperCase()}${shift.amount > 0 ? '+' : '-'}`;
                this.ui.showFloatingText(target.mesh, label, shift.amount > 0 ? 'buff' : 'status');
            }
        }

        for (const status of definition.cureStatuses ?? []) {
            if ((target.statuses?.[status] ?? 0) > 0) {
                target.statuses[status] = 0;
                this.ui.showFloatingText(target.mesh, 'CURED', 'heal');
            }
        }

        if (this.isAlive(target)) {
            for (const effect of definition.statusEffects ?? []) {
                if (applyStatus(target, effect, this.rng)) {
                    this.ui.showFloatingText(target.mesh, effect.name.toUpperCase(), 'status');
                }
            }
        }

        this.ui.updateUnit(target);
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
        const raw = calcPhysicalDamage(attacker, target, definition.power ?? 1, this.rng);
        this.dealDamage(attacker, target, definition, raw);
    }

    /** Магический урон со стихией и сопротивлениями цели. */
    applyMagicHit(attacker, target, definition) {
        const raw = calcMagicDamage(
            attacker,
            target,
            definition.spellPower ?? 0.9,
            definition.spellBase ?? 0,
            this.rng,
            definition.element ?? null,
        );
        this.dealDamage(attacker, target, definition, raw, definition.element ?? null);
    }

    /**
     * Общая обработка попадания — порт applyHitEffects() из combat.js:
     * контрудар по «занёсшему» юниту, смягчение через Endure, набор SP
     * обеими сторонами, прерывание сна/замешательства уроном.
     */
    dealDamage(attacker, target, definition, rawDamage, element = null) {
        const enduring = target.guard === 'endure';

        // Цель, уже занёсшая оружие (IP >= 930), получает усиленный урон.
        const isCounter = Boolean(target.pendingAction) && target.ip >= COUNTER_IP_THRESHOLD;
        const countered = isCounter ? rawDamage * COUNTER_MULTIPLIER : rawDamage;
        const mitigated = enduring ? countered * ENDURE_DAMAGE_MULTIPLIER : countered;
        const damage = Math.max(1, Math.round(mitigated));

        target.hp = clamp(target.hp - damage, 0, target.maxHp);

        // Урон будит спящих и приводит в чувство запутанных.
        if (damage > 0) {
            if ((target.statuses?.sleep ?? 0) > 0) target.statuses.sleep = 0;
            if ((target.statuses?.confusion ?? 0) > 0) target.statuses.confusion = 0;
        }

        const kind = element ? `damage element-${element}` : 'damage';
        this.ui.showFloatingText(target.mesh, String(damage), isCounter ? 'counter' : kind);
        this.ui.flashMesh(target.mesh);
        if (isCounter) this.ui.showFloatingText(target.mesh, 'COUNTER!', 'counter');

        // SP копят обе стороны: атакующий за попадание, цель за полученный удар.
        attacker.sp = clamp(attacker.sp + (definition.spGainOnHit ?? 0), 0, attacker.maxSp);
        target.sp = clamp(
            target.sp + (enduring ? SP_GAIN_ON_TAKING_HIT_ENDURE : SP_GAIN_ON_TAKING_HIT),
            0,
            target.maxSp,
        );

        this.applyIpDamage(target, definition, enduring);

        this.ui.updateUnit(attacker);
        this.ui.updateUnit(target);

        if (!this.isAlive(target)) {
            this.handleDeath(target);
        }
    }

    applyHeal(caster, target, definition) {
        const base = definition.powerBase ?? definition.healBase ?? 0;
        const amount = definition.powerBase != null
            ? calcHealAmount(caster, definition.powerBase)
            : base;
        const before = target.hp;
        target.hp = clamp(target.hp + amount, 0, target.maxHp);

        this.ui.showFloatingText(target.mesh, `+${target.hp - before}`, 'heal');
        this.ui.updateUnit(target);
    }

    /**
     * Откат по шкале IP. Если цель уже занесла оружие (COM/ACT) и приём умеет
     * прерывать — это CANCEL: действие теряется целиком.
     */
    applyIpDamage(target, definition, enduring = false) {
        if (!this.isAlive(target)) return;

        // Endure смягчает не только урон, но и откат по шкале.
        const ipScale = enduring ? ENDURE_IP_MULTIPLIER : 1;
        const canCancel = definition.cancel && (target.phase === 'COM' || target.phase === 'ACT');

        if (canCancel) {
            const pushback = (definition.cancelPushback ?? definition.ipDamage ?? 0) * ipScale;
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

        target.ip = clamp(target.ip - (definition.ipDamage ?? 0) * ipScale, 0, COM_START);
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
