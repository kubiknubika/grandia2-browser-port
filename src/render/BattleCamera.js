/**
 * Боевая камера.
 *
 * Раньше ArcRotateCamera просто висела над ареной и никогда не двигалась,
 * поэтому у приёмов не было акцента: удар за 30 метров выглядел так же,
 * как ожидание на шкале. Здесь камера плавно наезжает на того, кто бьёт,
 * и возвращается к общему плану, когда бой идёт в фоне.
 *
 * Управление игрока не отбирается: пока пользователь тащит мышью, камера
 * не вмешивается (userControlled), а автонаезд включается только на время
 * действия. Клемп дельты — как в остальном коде, чтобы свёрнутая вкладка
 * не телепортировала кадр.
 */

import { Vector3 } from '@babylonjs/core';

const MAX_DELTA = 0.05;

// Общий план: камера над центром арены.
const IDLE_RADIUS = 22;
const IDLE_BETA = Math.PI / 3;
const IDLE_TARGET = new Vector3(0, 1.2, 0);

// Крупный план во время приёма.
const ACTION_RADIUS = 13.5;
const ACTION_BETA = Math.PI / 2.6;

/** Экспоненциальное сглаживание, не зависящее от частоты кадров. */
function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export class BattleCamera {
    constructor(camera, { enabled = true } = {}) {
        this.camera = camera;
        this.enabled = enabled;
        this.userControlled = false;
        this.focus = null;
        this.holdTimer = 0;

        // Если игрок сам крутит камеру, автоматика умолкает до конца боя.
        const stop = () => { this.userControlled = true; };
        camera.getScene()?.getEngine()?.getRenderingCanvas()
            ?.addEventListener('pointerdown', stop, { once: true });
    }

    /** Кто сейчас в кадре. Вызывается BattleSystem в начале действия. */
    focusOn(unit, seconds = 1.2) {
        if (!unit) return;
        this.focus = unit;
        this.holdTimer = Math.max(this.holdTimer, seconds);
    }

    update(units, deltaTime) {
        if (!this.enabled || this.userControlled) return;

        const dt = Math.min(deltaTime, MAX_DELTA);
        this.holdTimer = Math.max(0, this.holdTimer - dt);

        // Пока кто-то исполняет приём — держим его в кадре.
        const acting = this.focus && this.holdTimer > 0 && this.focus.phase === 'EXECUTE'
            ? this.focus
            : (units.find((u) => u.phase === 'EXECUTE' && u.hp > 0) ?? null);

        if (acting) this.focus = acting;

        const active = acting ?? (this.holdTimer > 0 ? this.focus : null);

        if (active?.mesh) {
            // Смотрим между бойцом и его целью, чтобы в кадр попали оба.
            const point = active.target?.mesh
                ? Vector3.Center(active.mesh.position, active.target.mesh.position)
                : active.mesh.position;

            const target = new Vector3(point.x, point.y + 1.3, point.z);
            this.camera.target.x = damp(this.camera.target.x, target.x, 4, dt);
            this.camera.target.y = damp(this.camera.target.y, target.y, 4, dt);
            this.camera.target.z = damp(this.camera.target.z, target.z, 4, dt);

            this.camera.radius = damp(this.camera.radius, ACTION_RADIUS, 3, dt);
            this.camera.beta = damp(this.camera.beta, ACTION_BETA, 3, dt);

            // Медленный доворот вокруг сцены — кадр не «замерзает».
            this.camera.alpha += 0.12 * dt;
            return;
        }

        // Возврат к общему плану.
        this.camera.target.x = damp(this.camera.target.x, IDLE_TARGET.x, 2.2, dt);
        this.camera.target.y = damp(this.camera.target.y, IDLE_TARGET.y, 2.2, dt);
        this.camera.target.z = damp(this.camera.target.z, IDLE_TARGET.z, 2.2, dt);
        this.camera.radius = damp(this.camera.radius, IDLE_RADIUS, 2, dt);
        this.camera.beta = damp(this.camera.beta, IDLE_BETA, 2, dt);
        this.camera.alpha += 0.05 * dt;
    }
}
