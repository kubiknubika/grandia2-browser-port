/**
 * Процедурная анимация моделей.
 *
 * Ключей и скелетной анимации из GLB у нас нет, поэтому позы считаются
 * математически из фазы боя: idle-дыхание, бег с махом рук и ног, замах,
 * удар, каст, вздрагивание от урона и падение.
 *
 * Аниматор ничего не решает про бой — он только читает состояние юнита
 * (phase/actionState) и двигает суставы. Логика остаётся в BattleSystem.
 */

const TWO_PI = Math.PI * 2;

// Позы смерти: угол падения и подъём корня, который не даёт телу
// провалиться сквозь пол арены. Значения подобраны по габаритам моделей.
const SWING_SECONDS = 0.42;

// Доворот кисти на бегу. Основную работу делает сгиб локтя (он и выводит
// клинок параллельно полу), кисть лишь довершает поворот, поэтому значения
// небольшие. Замер: без сгиба локтя клинок висит на y=-0.69, со сгибом 0.02.
/**
 * Позы двуручного посоха, подобранные численным перебором при условии, что
 * ОБЕ кисти остаются на древке (промах хвата < 0.09), а левая рука не
 * вытягивается за пределы комфортной зоны. Исключение — каст «на себя»:
 * поднятые над головой руки естественно распрямляются, и там лимит снят.
 *
 * Значения — ДОБАВКА к позе покоя, поэтому при смене стойки их приходится
 * пересчитывать: диагональная стойка «ремень безопасности» сделала прежние
 * дельты негодными, хват рвался на 0.6-0.9. Значения — добавка к
 * позе покоя. Разносить их по формулам вручную нельзя: суставы связаны, и
 * правка одного угла заваливает посох набок.
 *
 *   castTarget — каст в цель: локти разгибаются, посох выносится вперёд;
 *   castSelf   — каст на себя: руки подняты, посох над головой кончиком ВВЕРХ
 *                (кисть упирается в анатомический предел 1.45). Подбирался
 *                с учётом наклона корпуса -0.18, который даёт сам каст:
 *                без него посох в бою заваливался набок;
 *   windup     — занос замаха: посох поднимается НАД ГОЛОВОЙ, откуда идёт
 *                удар сверху вниз. Занос за спину или вбок недостижим —
 *                хват рвётся, а древко проходит перед лицом.
 */
const STAFF_POSES = {
    castTarget: {
        shoulderRX: 0.40, shoulderRZ: -0.30, elbowR: 0.25, wrist: 0.40,
        shoulderLX: 0.65, shoulderLZ: 0.00, elbowL: 0.56,
    },
    castSelf: {
        shoulderRX: -1.34, shoulderRZ: -0.25, elbowR: 0.00, wrist: 1.45,
        shoulderLX: -1.12, shoulderLZ: 0.00, elbowL: 1.60,
    },
    windup: {
        shoulderRX: -0.40, shoulderRZ: -0.50, elbowR: -0.30, wrist: 0.66,
        shoulderLX: -0.60, shoulderLZ: 0.00, elbowL: 0.93,
    },
};

const CARRY_WRIST_X = 0.30;
const CARRY_WRIST_Z = 0.10;
const CAST_SECONDS = 0.8;
const HUMANOID_DEATH_ROT = 1.45;
const HUMANOID_DEATH_LIFT = 0.68;
const SPIDER_DEATH_ROT = Math.PI * 0.92;
const SPIDER_DEATH_LIFT = 1.62;

function lerp(from, to, t) {
    return from + (to - from) * t;
}

/** Плавное приближение, не зависящее от частоты кадров. */
function damp(current, target, lambda, dt) {
    return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Анатомические пределы суставов (радианы). Процедурная анимация легко
 * заводит сустав за естественный предел — рука выгибается в обратную
 * сторону, и удар выглядит как вывих. Позы клампятся этими рамками.
 *
 * Замер на текущих приёмах: локоть упирается в верхнюю границу (-0.05) —
 * без клампа он разгибался бы в обратную сторону. Плечо доходит до -2.41
 * при пределе -2.7, то есть его рамка сейчас с запасом; она оставлена как
 * страховка для более размашистых приёмов.
 */
const LIMITS = {
    // Локоть только сгибается: 0 — прямая рука, отрицательное — сгиб.
    elbow: [-2.5, -0.05],
    // Плечо: рука свободно поднимается над головой (назад-вверх) и
    // выносится вперёд. Прежний предел -1.0 блокировал замах и каст.
    shoulderX: [-2.7, 3.0],
    shoulderZ: [-1.5, 1.5],
    // Кисть отсчитывается от хвата, поэтому предел задаётся отклонением.
    wristDeviation: 1.45,
};

/**
 * Профиль удара: занос поднимает оружие до 1, удар сбрасывает до −1
 * (проводка ниже стойки), возврат приводит обратно к 0.
 */
function attackBlend(windup, strike, recover) {
    return (windup - strike * 2) * (1 - recover);
}

export class Animator {
    constructor() {
        this.states = new Map();
    }

    register(unitId, model) {
        this.states.set(unitId, {
            model,
            time: Math.random() * TWO_PI, // рассинхрон, чтобы юниты не дышали в такт
            swing: 0,      // 1 -> 0 прогресс взмаха оружием
            swingSpan: SWING_SECONDS,
            hitFlash: 0,   // затухающее вздрагивание от урона
            cast: 0,       // 1 -> 0 подъём оружия при касте
            selfCast: 0,   // 1 — каст на себя: посох идёт над головой
            castSpan: CAST_SECONDS,
            death: 0,      // 0..1 прогресс падения
            speed: 0,      // сглаженная скорость бега для микса поз
            lastPosition: model.root.position.clone(),
        });
    }

    /** Вызывается BattleSystem при попадании по юниту. */
    playHit(unitId) {
        const state = this.states.get(unitId);
        if (state) state.hitFlash = 1;
    }

    /**
     * Замах. duration — длительность приёма (animationSeconds): длинные
     * спецприёмы должны и выглядеть длиннее обычного удара.
     */
    playSwing(unitId, duration = SWING_SECONDS) {
        const state = this.states.get(unitId);
        if (!state) return;
        state.swing = 1;
        state.swingSpan = Math.max(0.2, duration);
    }

    /**
     * Каст. `onSelf` — заклинание направлено на самого кастующего (или на
     * группу, в которую он входит): посох поднимается над головой, а не
     * выносится вперёд в цель.
     */
    playCast(unitId, duration = CAST_SECONDS, { onSelf = false } = {}) {
        const state = this.states.get(unitId);
        if (!state) return;
        state.cast = 1;
        state.castSpan = Math.max(0.25, duration);
        state.selfCast = onSelf ? 1 : 0;
    }

    update(units, deltaTime) {
        const dt = Math.min(deltaTime, 0.05);

        for (const unit of units) {
            const state = this.states.get(unit.id);
            if (!state) continue;

            state.time += dt;

            // Насколько быстро юнит реально движется по арене.
            const moved = unit.mesh.position.subtract(state.lastPosition).length();
            state.lastPosition.copyFrom(unit.mesh.position);
            const instantSpeed = dt > 0 ? moved / dt : 0;
            state.speed = damp(state.speed, instantSpeed, 12, dt);

            state.swing = Math.max(0, state.swing - dt / state.swingSpan);
            state.hitFlash = Math.max(0, state.hitFlash - dt / 0.3);
            state.cast = Math.max(0, state.cast - dt / state.castSpan);

            const dying = unit.phase === 'DEAD';
            state.death = dying
                ? Math.min(1, state.death + dt / 0.55)
                : Math.max(0, state.death - dt / 0.3);

            if (state.model.rig.kind === 'spider') {
                this.animateSpider(state, unit, dt);
            } else {
                this.animateHumanoid(state, unit, dt);
            }
        }
    }

    animateHumanoid(state, unit, dt) {
        const { rig, root } = state.model;
        const t = state.time;

        const rest = rig.rest;

        // Бег: чем быстрее, тем шире шаг. runBlend гасит покой на месте.
        const runBlend = Math.min(1, state.speed / 6);
        const stride = t * (6 + state.speed * 0.9);
        const breathe = Math.sin(t * 1.7) * 0.035;

        // Удар делится на три фазы, как в рисованной анимации: медленный
        // замах (anticipation) -> резкий рубящий удар -> возврат. Раньше
        // «удар» линейно растягивался на 65% времени и выглядел вялым.
        const swingP = 1 - state.swing;                       // 0 -> 1
        const WINDUP_END = 0.42;   // занос: долгий, чтобы читался
        const STRIKE_END = 0.62;   // сам удар: короткий и быстрый

        // Занос замедляется к концу — оружие «зависает» перед ударом.
        const windupRaw = Math.min(1, swingP / WINDUP_END);
        const windup = windupRaw * windupRaw * (3 - 2 * windupRaw);

        // Удар: резкий старт с торможением в конце (ease-out cubic).
        const strikeRaw = clamp01((swingP - WINDUP_END) / (STRIKE_END - WINDUP_END));
        const strike = 1 - Math.pow(1 - strikeRaw, 3);

        // Возврат в стойку после удара.
        const recoverRaw = clamp01((swingP - STRIKE_END) / (1 - STRIKE_END));
        const recover = recoverRaw * recoverRaw * (3 - 2 * recoverRaw);

        // Итоговая доля «занесённости»: 0 в стойке, 1 на пике заноса.
        const swingPose = attackBlend(windup, strike, recover);
        const swingEase = Math.sin(state.swing * Math.PI);
        const attacking = state.swing > 0;

        // Каст тоже делим на фазы: сбор энергии (руки вверх) -> короткая
        // задержка -> выброс вперёд. Раньше это был один синус туда-обратно,
        // из-за чего заклинание выглядело как пожимание плечами.
        const castProgress = state.cast > 0 ? 1 - state.cast : 0;
        const GATHER_END = 0.45;
        const HOLD_END = 0.62;

        const gatherRaw = clamp01(castProgress / GATHER_END);
        const gather = gatherRaw * gatherRaw * (3 - 2 * gatherRaw);
        const releaseRaw = clamp01((castProgress - HOLD_END) / (1 - HOLD_END));
        const release = 1 - Math.pow(1 - releaseRaw, 3);

        // castP — «сколько сейчас накоплено»: растёт на сборе, падает на выбросе.
        const castP = state.cast > 0 ? gather * (1 - release) : 0;
        // castPush — рывок вперёд в момент выброса.
        const castPush = state.cast > 0 ? release * (1 - release * 0.35) : 0;
        const casting = state.cast > 0;

        // Корпус: дыхание, наклон на бегу, доворот плечом при ударе.
        rig.torso.rotation.x = damp(
            rig.torso.rotation.x,
            runBlend * 0.22
            + (attacking ? (-windup * 0.24 + strike * 0.62) * (1 - recover) : 0)
            - castP * 0.18 + castPush * 0.3,
            attacking ? 22 : 14, dt,
        );
        // Скручивание корпуса: замах уводит плечо назад, удар проносит вперёд.
        rig.torso.rotation.y = damp(
            rig.torso.rotation.y,
            attacking ? (windup * 0.85 - strike * 1.5) * (1 - recover) : 0,
            attacking ? 24 : 16, dt,
        );
        // Приседание перед ударом и подъём на проводке — вес тела.
        rig.hips.position.y = rest.hipsY + breathe * (1 - runBlend)
            + Math.abs(Math.sin(stride)) * 0.09 * runBlend
            + castP * 0.12 - castPush * 0.06
            + (attacking ? (-windup * 0.09 + strike * 0.05) * (1 - recover) : 0);

        // Бёдра доворачиваются вслед за корпусом — удар идёт от земли.
        if (rig.hips.rotation) {
            rig.hips.rotation.y = damp(
                rig.hips.rotation.y,
                attacking ? (windup * 0.42 - strike * 0.7) * (1 - recover) : 0,
                attacking ? 20 : 12, dt,
            );
        }

        // Ноги: противофазный шаг; при ударе — выпад вперёд.
        const legSwing = Math.sin(stride) * 0.85 * runBlend;
        const lunge = attacking ? (strike * 0.5 - windup * 0.12) * (1 - recover) : 0;
        rig.hipL.rotation.x = damp(rig.hipL.rotation.x, legSwing - lunge, 18, dt);
        rig.hipR.rotation.x = damp(rig.hipR.rotation.x, -legSwing + lunge, 18, dt);
        rig.kneeL.rotation.x = damp(rig.kneeL.rotation.x, Math.max(0, -legSwing) * 1.1, 18, dt);
        rig.kneeR.rotation.x = damp(rig.kneeR.rotation.x, Math.max(0, legSwing) * 1.1, 18, dt);

        // Посох Елена держит ДВУМЯ руками, поэтому левая не машет маятником,
        // а остаётся на древке: её поза строится от rest, а не от нуля.
        const twoHanded = rig.weapon === 'staff';
        const selfCast = state.selfCast;

        // Добавка к позе покоя: замах (занос, затем пронос в обратную сторону)
        // и каст (в цель или на себя). Обе берутся из STAFF_POSES целиком,
        // чтобы суставы двигались согласованно и хват не рвался.
        const swingAmt = attacking ? (windup - strike * 1.25) * (1 - recover) : 0;
        const staffAdd = (key) => {
            const castPose = lerp(STAFF_POSES.castTarget[key], STAFF_POSES.castSelf[key], selfCast);
            return swingAmt * STAFF_POSES.windup[key] + castP * castPose;
        };

        if (twoHanded) {
            rig.shoulderL.rotation.x = damp(
                rig.shoulderL.rotation.x, (rest.shoulderLX ?? 0) + staffAdd('shoulderLX'),
                attacking ? 22 : (casting ? 26 : 16), dt,
            );
            rig.shoulderL.rotation.y = damp(
                rig.shoulderL.rotation.y, rest.shoulderLY ?? 0, 12, dt,
            );
            rig.shoulderL.rotation.z = damp(
                rig.shoulderL.rotation.z, rest.shoulderLZ + staffAdd('shoulderLZ'),
                casting ? 26 : 12, dt,
            );
            rig.elbowL.rotation.x = clamp(damp(
                rig.elbowL.rotation.x, rest.elbowLX + staffAdd('elbowL'),
                casting ? 26 : 14, dt,
            ), LIMITS.elbow[0], LIMITS.elbow[1]);
        } else {
            // Левая рука: маятник на бегу, поднимается при касте.
            rig.shoulderL.rotation.x = damp(
                rig.shoulderL.rotation.x,
                -legSwing * 0.75 - castP * 1.9 + castPush * 1.1
                + (attacking ? (windup * 0.5 - strike * 0.7) * (1 - recover) : 0),
                attacking ? 20 : 16, dt,
            );
            rig.shoulderL.rotation.z = damp(rig.shoulderL.rotation.z, rest.shoulderLZ, 10, dt);
            rig.elbowL.rotation.x = clamp(damp(
                rig.elbowL.rotation.x,
                rest.elbowLX - castP * 0.95 + castPush * 0.8,
                casting ? 18 : 12, dt,
            ), LIMITS.elbow[0], LIMITS.elbow[1]);
        }

        // Бег с мечом: клинок выводится ПАРАЛЛЕЛЬНО полу, локоть сгибается,
        // рука прижимается к корпусу. В стойке меч опущен остриём к земле —
        // бежать в такой позе значило бы черпать остриём землю.
        const carrying = rig.weapon === 'sword';
        const carry = carrying ? runBlend : 0;

        // Правая рука с оружием: занос за плечо, затем рубящий удар вниз.
        const armTarget = twoHanded
            ? rest.shoulderRX + staffAdd('shoulderRX')
            : (attacking
                ? rest.shoulderRX + (-windup * 2.6 + strike * 2.2) * (1 - recover)
                : rest.shoulderRX - legSwing * -0.4 - castP * 2.6 + castPush * 1.4);

        // На ударе руку ведём жёстче, чем на возврате: резкость важнее плавности.
        rig.shoulderR.rotation.x = clamp(damp(
            rig.shoulderR.rotation.x, armTarget,
            attacking ? (strikeRaw > 0 && recoverRaw === 0 ? 34 : 20) : 12, dt,
        ), LIMITS.shoulderX[0], LIMITS.shoulderX[1]);
        rig.shoulderR.rotation.z = clamp(damp(
            rig.shoulderR.rotation.z,
            rest.shoulderRZ
            + (twoHanded
                ? staffAdd('shoulderRZ')
                : (attacking ? (-windup * 0.7 + strike * 0.95) * (1 - recover) : 0)
                  - castP * 0.25)
            + carry * 0.16, // локоть подбирается к рёбрам
            attacking ? 20 : (casting && twoHanded ? 26 : 14), dt,
        ), LIMITS.shoulderZ[0], LIMITS.shoulderZ[1]);
        // Локоть: сгибается на заносе, распрямляется в момент удара, и
        // заметно согнут на бегу — так несут оружие, чтобы не мешало шагу.
        rig.elbowR.rotation.x = clamp(damp(
            rig.elbowR.rotation.x,
            rest.elbowRX
            + (twoHanded
                ? staffAdd('elbowR')
                : (attacking ? (-windup * 0.66 + strike * 0.66) * (1 - recover) : 0))
            - carry * 0.80,
            attacking ? 26 : 14, dt,
        ), LIMITS.elbow[0], LIMITS.elbow[1]);

        // Кисть держит клинок. rest-углы уже задают режущую кромку вперёд,
        // поэтому анимация только ДОБАВЛЯЕТ к ним, не перетирая разворот.
        if (rig.weaponPivot) {
            // На бегу кисть распрямляется, выводя меч параллельно полу.
            const carryX = carry * CARRY_WRIST_X;

            const wristLimit = LIMITS.wristDeviation;
            rig.weaponPivot.rotation.x = clamp(damp(
                rig.weaponPivot.rotation.x,
                rest.weaponX + carryX
                + (twoHanded
                    // На себя доворот кисти выводит КОНЧИК посоха вверх,
                    // а не назад за голову, как было бы на замахе.
                    ? staffAdd('wrist')
                    : (attacking ? (-windup * 0.9 + strike * 0.5) * (1 - recover) : 0)
                      - castP * 0.5 + castPush * 0.7),
                attacking ? 26 : (casting && twoHanded ? 26 : 16), dt,
            ), rest.weaponX - wristLimit, rest.weaponX + wristLimit);
            // Разворот хвата (режущая кромка вперёд) держится постоянно:
            // анимация его не трогает, иначе меч уходит плашмя.
            rig.weaponPivot.rotation.y = damp(
                rig.weaponPivot.rotation.y, rest.weaponY ?? 0,
                attacking ? 24 : 14, dt,
            );
            rig.weaponPivot.rotation.z = clamp(damp(
                rig.weaponPivot.rotation.z,
                // Боковой доворот кисти — только для меча. Посох он валит
                // набок: подъём над головой считался при rest.weaponZ.
                rest.weaponZ + (twoHanded ? 0 : castP * 0.4) + carry * CARRY_WRIST_Z
                + (twoHanded
                    ? 0
                    : (attacking ? (-windup * 0.3 + strike * 0.8) * (1 - recover) : 0)),
                attacking ? 22 : 12, dt,
            ), rest.weaponZ - wristLimit, rest.weaponZ + wristLimit);
        }

        // Плащ отстаёт от корпуса — простая имитация инерции ткани.
        if (rig.cape) {
            rig.cape.rotation.x = damp(
                rig.cape.rotation.x,
                -runBlend * 0.5 - swingEase * 0.25 + Math.sin(t * 2.3) * 0.05,
                8, dt,
            );
        }

        // Вздрагивание от удара.
        if (state.hitFlash > 0) {
            const shake = Math.sin(state.hitFlash * Math.PI * 6) * state.hitFlash;
            rig.torso.rotation.z = shake * 0.18;
            rig.neck.rotation.x = shake * 0.22;
        } else {
            rig.torso.rotation.z = damp(rig.torso.rotation.z, 0, 12, dt);
            rig.neck.rotation.x = damp(rig.neck.rotation.x, 0, 12, dt);
        }

        // Смерть: заваливается назад.
        // Корень крутится вокруг ступней, поэтому лежащее тело уходит под
        // арену — компенсируем подъёмом (DEATH_LIFT подобран по габаритам).
        root.rotation.x = damp(root.rotation.x, -state.death * HUMANOID_DEATH_ROT, 9, dt);
        root.position.y = damp(root.position.y, state.death * HUMANOID_DEATH_LIFT, 9, dt);
    }

    animateSpider(state, unit, dt) {
        const { rig, root } = state.model;
        const t = state.time;

        const runBlend = Math.min(1, state.speed / 6);
        const gait = t * (7 + state.speed * 1.1);
        const swingEase = Math.sin(state.swing * Math.PI);

        // Ноги шагают двумя чередующимися четвёрками (как у настоящих пауков).
        for (const leg of rig.legs) {
            const group = (leg.index + (leg.side > 0 ? 1 : 0)) % 2;
            const phase = gait + group * Math.PI;
            const step = Math.sin(phase);

            leg.hip.rotation.y = leg.restHipY + step * 0.34 * runBlend;
            // Шаг ПОДНИМАЕТ лапу (бедро выше), а не вдавливает её в пол:
            // в позе покоя кончик лапы уже лежит на арене.
            const lift = Math.max(0, step);
            leg.hip.rotation.z = leg.restHipZ
                + leg.side * lift * 0.26 * runBlend
                + leg.side * Math.sin(t * 1.5 + leg.index) * 0.025 * (1 - runBlend);
            // Поза покоя берётся из рига: геометрия ноги живёт в models.js.
            leg.knee.rotation.z = damp(
                leg.knee.rotation.z,
                leg.restKneeZ - leg.side * lift * 0.22 * runBlend,
                16, dt,
            );
        }

        // Тело покачивается на ходу и приседает перед броском.
        rig.body.position.y = rig.restBodyY
            + Math.sin(gait * 2) * 0.06 * runBlend
            + Math.sin(t * 1.6) * 0.03 * (1 - runBlend)
            - swingEase * 0.16;
        rig.body.rotation.x = damp(rig.body.rotation.x, -swingEase * 0.42, 18, dt);

        // Жвалы раскрываются в момент укуса.
        for (let i = 0; i < rig.fangs.length; i += 1) {
            const side = i === 0 ? -1 : 1;
            rig.fangs[i].rotation.z = damp(rig.fangs[i].rotation.z, side * swingEase * 0.6, 20, dt);
        }

        if (state.hitFlash > 0) {
            const shake = Math.sin(state.hitFlash * Math.PI * 7) * state.hitFlash;
            rig.body.rotation.z = shake * 0.2;
        } else {
            rig.body.rotation.z = damp(rig.body.rotation.z, 0, 12, dt);
        }

        // Смерть: паук переворачивается на спину и поджимает ноги.
        // Переворот вокруг корня опускает головогрудь ниже пола — поднимаем.
        root.rotation.z = damp(root.rotation.z, state.death * SPIDER_DEATH_ROT, 8, dt);
        root.position.y = damp(root.position.y, state.death * SPIDER_DEATH_LIFT, 8, dt);
        if (state.death > 0) {
            // Лапы поджимаются к телу — классическая поза мёртвого паука.
            for (const leg of rig.legs) {
                leg.knee.rotation.z = damp(leg.knee.rotation.z, leg.restKneeZ - leg.side * 1.1, 6, dt);
                leg.hip.rotation.z = damp(leg.hip.rotation.z, leg.restHipZ + leg.side * 0.5, 6, dt);
            }
        }
    }
}
