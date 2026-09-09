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

export class Animator {
    constructor() {
        this.states = new Map();
    }

    register(unitId, model) {
        this.states.set(unitId, {
            model,
            time: Math.random() * TWO_PI, // рассинхрон, чтобы юниты не дышали в такт
            swing: 0,      // 0..1 прогресс взмаха оружием
            hitFlash: 0,   // затухающее вздрагивание от урона
            cast: 0,       // свечение/подъём оружия при касте
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

    /** Замах: вызывается в момент удара, отыгрывается за ~0.35 с. */
    playSwing(unitId) {
        const state = this.states.get(unitId);
        if (state) state.swing = 1;
    }

    playCast(unitId) {
        const state = this.states.get(unitId);
        if (state) state.cast = 1;
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

            state.swing = Math.max(0, state.swing - dt / 0.35);
            state.hitFlash = Math.max(0, state.hitFlash - dt / 0.3);
            state.cast = Math.max(0, state.cast - dt / 0.8);

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

        // Бег: чем быстрее, тем шире шаг. runBlend гасит покой на месте.
        const runBlend = Math.min(1, state.speed / 6);
        const stride = t * (6 + state.speed * 0.9);
        const breathe = Math.sin(t * 1.7) * 0.035;

        const swingEase = Math.sin(state.swing * Math.PI); // 0 -> 1 -> 0
        const attacking = state.swing > 0;

        // Корпус: дыхание в покое, наклон вперёд на бегу, доворот при ударе.
        rig.torso.rotation.x = damp(
            rig.torso.rotation.x,
            runBlend * 0.22 + swingEase * 0.28,
            14, dt,
        );
        rig.torso.rotation.y = damp(rig.torso.rotation.y, swingEase * -0.5, 16, dt);
        rig.hips.position.y = 1.45 + breathe * (1 - runBlend)
            + Math.abs(Math.sin(stride)) * 0.09 * runBlend;

        // Ноги: противофазный шаг.
        const legSwing = Math.sin(stride) * 0.85 * runBlend;
        rig.hipL.rotation.x = damp(rig.hipL.rotation.x, legSwing, 18, dt);
        rig.hipR.rotation.x = damp(rig.hipR.rotation.x, -legSwing, 18, dt);
        rig.kneeL.rotation.x = damp(rig.kneeL.rotation.x, Math.max(0, -legSwing) * 1.1, 18, dt);
        rig.kneeR.rotation.x = damp(rig.kneeR.rotation.x, Math.max(0, legSwing) * 1.1, 18, dt);

        // Левая рука: маятник на бегу.
        rig.shoulderL.rotation.x = damp(rig.shoulderL.rotation.x, -legSwing * 0.75, 16, dt);
        rig.shoulderL.rotation.z = damp(rig.shoulderL.rotation.z, 0.16, 10, dt);

        // Правая рука несёт оружие: замах назад-вверх, затем рубящий удар.
        const castPose = state.cast > 0 ? Math.sin(state.cast * Math.PI) : 0;
        const swordTarget = attacking
            ? lerp(-2.1, 0.85, Math.min(1, (1 - state.swing) * 1.6))
            : -legSwing * -0.4;

        rig.shoulderR.rotation.x = damp(
            rig.shoulderR.rotation.x,
            castPose > 0 ? -2.2 * castPose : swordTarget,
            attacking ? 22 : 12, dt,
        );
        rig.shoulderR.rotation.z = damp(rig.shoulderR.rotation.z, -0.16 - swingEase * 0.3, 14, dt);
        rig.elbowR.rotation.x = damp(rig.elbowR.rotation.x, -0.35 + swingEase * 0.3, 14, dt);

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
            // Idle: ноги чуть перебирают, даже когда паук стоит.
            leg.hip.rotation.z = leg.restHipZ
                + Math.max(0, step) * 0.3 * runBlend
                + Math.sin(t * 1.5 + leg.index) * 0.03 * (1 - runBlend);
            leg.knee.rotation.z = damp(
                leg.knee.rotation.z,
                leg.side * (1.32 - Math.max(0, step) * 0.34 * runBlend),
                16, dt,
            );
        }

        // Тело покачивается на ходу и приседает перед броском.
        rig.body.position.y = 0.78
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
            for (const leg of rig.legs) {
                leg.knee.rotation.z = damp(leg.knee.rotation.z, leg.side * 2.3, 6, dt);
            }
        }
    }
}
