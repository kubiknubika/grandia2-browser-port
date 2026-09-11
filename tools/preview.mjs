/**
 * Оффскрин-рендер моделей в PNG.
 *
 * Браузер в этом окружении недоступен, а Babylon NullEngine не даёт пикселей,
 * поэтому здесь минимальный софт-растеризатор: он проецирует меши сцены и
 * заливает треугольники с ламбертовым освещением. Нужен, чтобы глазами
 * проверять силуэты и позы, а не только цифры в тестах.
 *
 *   node tools/preview.mjs [--pose=idle|action|dead] [--view=front|side|top]
 *                          [--out=preview.png]
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import '@babylonjs/core/Meshes/meshBuilder.js';

import { createUnitModel } from '../src/render/models.js';
import { Animator } from '../src/render/Animator.js';
import { makeUnitData } from '../src/data/battle_data.js';

const args = Object.fromEntries(
    process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]),
);
const POSE = args.pose ?? 'idle';
const VIEW = args.view ?? 'front';
const OUT = args.out ?? 'preview.png';

const W = 1000;
const H = 460;

const engine = new NullEngine();
const scene = new Scene(engine);
const animator = new Animator();

const LINEUP = [
    ['elena', 'elena', -7.2],
    ['ryudo', 'ryudo', -3.4],
    ['mottledSpider', 'spiderA', 1.4],
    ['mottledSpider', 'spiderB', 5.6],
];

const actors = [];
for (const [presetKey, id, x] of LINEUP) {
    const model = createUnitModel(scene, makeUnitData(presetKey, { id, position: { x, z: 0 } }));
    model.root.position.x = x;
    animator.register(id, model);
    actors.push({ id, model, unit: { id, phase: 'WAIT', mesh: model.root } });
}

if (POSE === 'dead') {
    actors.forEach((a) => { a.unit.phase = 'DEAD'; });
}

// Прогоняем анимацию, чтобы позы устоялись.
for (let i = 0; i < 240; i += 1) animator.update(actors.map((a) => a.unit), 1 / 60);

if (POSE === 'action') {
    // --frame=N — сколько кадров (1/60 с) отыграть после начала удара.
    // Позволяет разглядеть занос, момент удара и проводку по отдельности.
    const frames = Number(args.frame ?? 7);
    animator.playSwing('ryudo');
    animator.playHit('spiderA');
    for (let i = 0; i < frames; i += 1) animator.update(actors.map((a) => a.unit), 1 / 60);
}

if (POSE === 'run') {
    // Гоним героя вперёд с боевой скоростью, чтобы устоялась поза бега:
    // клинок выводится параллельно полу, локоть сгибается.
    //
    // Останавливаемся на кадре МАКСИМАЛЬНОГО разведения ног, иначе превью
    // ловит случайную фазу: на кадре 180 ноги почти сведены, и вынос ноги
    // выглядит слабым, хотя в движении он полный.
    const hero = actors.find((a) => a.unit.id === 'ryudo');
    const frames = Number(args.frame ?? 0);
    let bestFrame = frames;

    if (!frames && hero) {
        let bestSpread = -Infinity;
        for (let i = 0; i < 180; i += 1) {
            hero.model.root.position.z += 11.13 / 60;
            animator.update(actors.map((a) => a.unit), 1 / 60);
            if (i < 90) continue;   // ждём, пока поза устоится
            const spread = Math.abs(
                hero.model.rig.hipL.rotation.x - hero.model.rig.hipR.rotation.x,
            );
            if (spread > bestSpread) { bestSpread = spread; bestFrame = i; }
        }
        // Прогон заново до найденного кадра: аниматор не отматывается назад.
        for (const actor of actors) animator.register(actor.unit.id, actor.model);
        hero.model.root.position.z = 0;
    }

    for (let i = 0; i <= bestFrame; i += 1) {
        if (hero) hero.model.root.position.z += 11.13 / 60;
        animator.update(actors.map((a) => a.unit), 1 / 60);
    }
    if (hero) hero.model.root.position.z = 0;
}

if (POSE === 'cast') {
    const frames = Number(args.frame ?? 20);
    animator.playCast('ryudo');
    for (let i = 0; i < frames; i += 1) animator.update(actors.map((a) => a.unit), 1 / 60);
}

// Касты Елены: --pose=ecast (в цель), --pose=eself (на себя), --pose=eswing.
if (POSE === 'ecast' || POSE === 'eself' || POSE === 'eswing') {
    const frames = Number(args.frame ?? 24);
    if (POSE === 'eswing') animator.playSwing('elena', 0.6);
    else animator.playCast('elena', 0.8, { onSelf: POSE === 'eself' });
    for (let i = 0; i < frames; i += 1) animator.update(actors.map((a) => a.unit), 1 / 60);
}

// --- Камера ---------------------------------------------------------------

const VIEWS = {
    front: { eye: new Vector3(0, 3.0, 12.5), target: new Vector3(0, 1.1, 0) },
    heroes: { eye: new Vector3(-3.4, 2.3, 4.3), target: new Vector3(-3.4, 1.6, 0) },
    face: { eye: new Vector3(-3.4, 2.7, 2.0), target: new Vector3(-3.4, 2.3, 0) },
    head: { eye: new Vector3(-3.4, 2.92, 1.1), target: new Vector3(-3.4, 2.82, 0) },
    head34: { eye: new Vector3(-2.6, 3.0, 1.0), target: new Vector3(-3.4, 2.82, 0) },
    headside: { eye: new Vector3(-2.1, 2.88, 0.05), target: new Vector3(-3.4, 2.82, 0) },
    elena: { eye: new Vector3(-7.2, 2.9, 1.1), target: new Vector3(-7.2, 2.8, 0) },
    headback: { eye: new Vector3(-3.4, 2.95, -1.15), target: new Vector3(-3.4, 2.82, 0) },
    elenaback: { eye: new Vector3(-7.2, 2.95, -1.2), target: new Vector3(-7.2, 2.78, 0) },
    ryudobelly: { eye: new Vector3(-3.4, 1.75, 1.9), target: new Vector3(-3.4, 1.45, 0) },
    ryudoelbow: { eye: new Vector3(-2.1, 1.85, 1.7), target: new Vector3(-3.15, 1.72, 0) },
    ryudoleg: { eye: new Vector3(-3.4, 1.35, 2.2), target: new Vector3(-3.4, 1.15, 0) },
    // ТОЧНАЯ камера боя из main.js: ArcRotate alpha=PI/2, beta=PI/3, r=22.
    battlecam: { eye: new Vector3(0, 11, 19.05), target: new Vector3(0, 0, 0) },
    battleryudo: { eye: new Vector3(-3.4, 6.0, 9.5), target: new Vector3(-3.4, 1.6, 0) },
    battleelena: { eye: new Vector3(-7.2, 6.0, 9.5), target: new Vector3(-7.2, 1.6, 0) },
    // Кадр замаха: клинок уходит на высоту ~4.2, обычные виды его срезают.
    ryudoswing: { eye: new Vector3(-1.2, 3.2, 6.4), target: new Vector3(-3.4, 2.6, 0) },
    ryudofull: { eye: new Vector3(-3.4, 1.9, 4.2), target: new Vector3(-3.4, 1.7, 0) },
    ryudochest: { eye: new Vector3(-3.4, 2.3, 2.4), target: new Vector3(-3.4, 2.1, 0) },
    ryudoclav: { eye: new Vector3(-2.6, 2.7, 1.9), target: new Vector3(-3.4, 2.35, 0) },
    // Елена сбоку и в три четверти — проверка женского силуэта.
    elenaside2: { eye: new Vector3(-10.8, 1.9, 0.4), target: new Vector3(-7.2, 1.7, 0) },
    elena34b: { eye: new Vector3(-4.4, 2.0, 3.6), target: new Vector3(-7.2, 1.7, 0) },
    elenafull: { eye: new Vector3(-7.2, 1.9, 4.2), target: new Vector3(-7.2, 1.7, 0) },
    elena34: { eye: new Vector3(-5.1, 2.2, 3.4), target: new Vector3(-7.2, 1.7, 0) },
    elenaside: { eye: new Vector3(-3.9, 2.0, 0.2), target: new Vector3(-7.2, 1.7, 0) },
    back: { eye: new Vector3(-3.4, 2.1, -3.6), target: new Vector3(-3.4, 1.4, 0) },
    spider: { eye: new Vector3(4.3, 2.2, 5.2), target: new Vector3(4.3, 0.7, 0) },
    duel: { eye: new Vector3(-0.4, 2.6, 3.4), target: new Vector3(-3.4, 1.6, 0) },
    side: { eye: new Vector3(13, 3.0, 0.5), target: new Vector3(0, 1.1, 0) },
    top: { eye: new Vector3(0.01, 12, 0.01), target: new Vector3(0, 0, 0) },
};
const { eye, target } = VIEWS[VIEW] ?? VIEWS.front;
const vp = Matrix.LookAtLH(eye, target, Vector3.Up())
    .multiply(Matrix.PerspectiveFovLH(0.9, W / H, 0.1, 100));

// --- Растеризация ---------------------------------------------------------

const color = new Float32Array(W * H * 3);
const depth = new Float32Array(W * H).fill(Infinity);

for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
        const i = (y * W + x) * 3;
        const t = y / H;
        color[i] = (0.29 + 0.06 * t) ** 2.2;
        color[i + 1] = (0.31 + 0.07 * t) ** 2.2;
        color[i + 2] = (0.38 + 0.09 * t) ** 2.2;
    }
}

// Трёхточечная схема вместо одного источника: рисующий сверху-слева,
// заполняющий снизу-справа (мягкие полутона в тенях) и контровой сзади,
// который отделяет силуэт от фона.
const keyLight = new Vector3(-0.45, 1, -0.75).normalize();
const fillLight = new Vector3(0.7, -0.15, -0.55).normalize();
const rimLight = new Vector3(0.15, 0.35, 0.95).normalize();

function shadeAt(n, ao, shadow = 1) {
    // Мягкий переход света в тень (wrap lighting) — на округлых формах
    // получается плавный градиент вместо резкой границы.
    const raw = Vector3.Dot(n, keyLight);
    const key = Math.max(0, (raw + 0.32) / 1.32) * shadow;
    const fill = Math.max(0, Vector3.Dot(n, fillLight));
    const rim = Math.pow(Math.max(0, Vector3.Dot(n, rimLight)), 3) * shadow;
    const sky = 0.5 + 0.5 * n.y;

    const ambient = (0.1 + 0.16 * sky) * ao;
    const direct = (0.95 * key + 0.16 * fill) * ao;

    // Тени холоднее и синее, света теплее — так работает глаз, и объём
    // читается даже на однотонной коже.
    return {
        level: ambient + direct + rim * 0.16,
        // 0 — глубокая тень, 1 — полный свет. Нужен для подцветки.
        lit: Math.min(1, key),
    };
}

// --- Карта теней ----------------------------------------------------------
// Рендерим глубину сцены со стороны рисующего света. Без неё брови, нос и
// причёска не отбрасывали тень на лицо, и оно выглядело плоским.
const SHADOW_SIZE = 1400;
const shadowDepth = new Float32Array(SHADOW_SIZE * SHADOW_SIZE).fill(Infinity);

const lightTarget = target.clone();
const lightEye = lightTarget.add(keyLight.scale(9));
const lightView = Matrix.LookAtLH(lightEye, lightTarget, Vector3.Up());
const lightProj = Matrix.OrthoLH(7.5, 7.5, 0.1, 22);
const lightVp = lightView.multiply(lightProj);

function toShadowMap(worldPoint) {
    const c = Vector3.TransformCoordinates(worldPoint, lightVp);
    return {
        x: (c.x * 0.5 + 0.5) * SHADOW_SIZE,
        y: (1 - (c.y * 0.5 + 0.5)) * SHADOW_SIZE,
        z: c.z,
    };
}

for (const { model } of actors) {
    model.root.computeWorldMatrix(true);
    model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));

    for (const mesh of model.meshes) {
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const indices = mesh.getIndices();
        if (!positions || !indices) continue;
        const world = mesh.getWorldMatrix();

        for (let t = 0; t < indices.length; t += 3) {
            const tri = [indices[t], indices[t + 1], indices[t + 2]].map((i) => toShadowMap(
                Vector3.TransformCoordinates(
                    new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
                    world,
                ),
            ));
            if (tri.some((p) => p.z < 0 || p.z > 1)) continue;

            const minx = Math.max(0, Math.floor(Math.min(...tri.map((p) => p.x))));
            const maxx = Math.min(SHADOW_SIZE - 1, Math.ceil(Math.max(...tri.map((p) => p.x))));
            const miny = Math.max(0, Math.floor(Math.min(...tri.map((p) => p.y))));
            const maxy = Math.min(SHADOW_SIZE - 1, Math.ceil(Math.max(...tri.map((p) => p.y))));

            const area = (tri[1].x - tri[0].x) * (tri[2].y - tri[0].y)
                - (tri[2].x - tri[0].x) * (tri[1].y - tri[0].y);
            if (Math.abs(area) < 1e-9) continue;

            for (let y = miny; y <= maxy; y += 1) {
                for (let x = minx; x <= maxx; x += 1) {
                    const px = x + 0.5;
                    const py = y + 0.5;
                    const w0 = ((tri[1].x - px) * (tri[2].y - py) - (tri[2].x - px) * (tri[1].y - py)) / area;
                    const w1 = ((tri[2].x - px) * (tri[0].y - py) - (tri[0].x - px) * (tri[2].y - py)) / area;
                    const w2 = 1 - w0 - w1;
                    if (w0 < 0 || w1 < 0 || w2 < 0) continue;

                    const z = w0 * tri[0].z + w1 * tri[1].z + w2 * tri[2].z;
                    const di = y * SHADOW_SIZE + x;
                    if (z < shadowDepth[di]) shadowDepth[di] = z;
                }
            }
        }
    }
}

/** Доля света в точке: 1 — освещена, 0.35 — в тени. Края мягкие (PCF 3x3). */
function shadowFactor(worldPoint) {
    const s = toShadowMap(worldPoint);
    if (s.x < 1 || s.y < 1 || s.x >= SHADOW_SIZE - 1 || s.y >= SHADOW_SIZE - 1) return 1;

    let lit = 0;
    let taps = 0;
    for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
            const di = (Math.floor(s.y) + oy) * SHADOW_SIZE + (Math.floor(s.x) + ox);
            const nearest = shadowDepth[di];
            lit += (nearest === Infinity || s.z <= nearest + 0.0022) ? 1 : 0;
            taps += 1;
        }
    }
    return 0.22 + 0.78 * (lit / taps);
}

for (const { model } of actors) {
    model.root.computeWorldMatrix(true);
    model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));

    for (const mesh of model.meshes) {
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const normals = mesh.getVerticesData(VertexBuffer.NormalKind);
        const indices = mesh.getIndices();
        if (!positions || !indices) continue;

        const world = mesh.getWorldMatrix();
        const srgb = mesh.material?.diffuseColor ?? { r: 0.8, g: 0.8, b: 0.8 };
        const diffuse = {
            r: srgb.r ** 2.2,
            g: srgb.g ** 2.2,
            b: srgb.b ** 2.2,
        };
        const count = positions.length / 3;

        const wp = new Array(count);
        const wn = new Array(count);
        const ao = mesh.getVerticesData('ao') ?? null;
        for (let i = 0; i < count; i += 1) {
            wp[i] = Vector3.TransformCoordinates(
                new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]), world,
            );
            wn[i] = normals
                ? Vector3.TransformNormal(
                    new Vector3(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]), world,
                ).normalize()
                : Vector3.Up();
        }

        // Затенение складок: если меша нет собственного AO, считаем 1.
        const aoData = ao ?? new Float32Array(count).fill(1);

        for (let t = 0; t < indices.length; t += 3) {
            const tri = [indices[t], indices[t + 1], indices[t + 2]].map((i) => {
                const c = Vector3.TransformCoordinates(wp[i], vp);
                return {
                    x: (c.x * 0.5 + 0.5) * W, y: (1 - (c.y * 0.5 + 0.5)) * H,
                    z: c.z, n: wn[i], ao: aoData[i], w: wp[i],
                };
            });
            if (tri.some((p) => p.z < 0.01 || p.z > 1)) continue;

            const minx = Math.max(0, Math.floor(Math.min(...tri.map((p) => p.x))));
            const maxx = Math.min(W - 1, Math.ceil(Math.max(...tri.map((p) => p.x))));
            const miny = Math.max(0, Math.floor(Math.min(...tri.map((p) => p.y))));
            const maxy = Math.min(H - 1, Math.ceil(Math.max(...tri.map((p) => p.y))));

            const area = (tri[1].x - tri[0].x) * (tri[2].y - tri[0].y)
                - (tri[2].x - tri[0].x) * (tri[1].y - tri[0].y);
            if (Math.abs(area) < 1e-9) continue;

            for (let y = miny; y <= maxy; y += 1) {
                for (let x = minx; x <= maxx; x += 1) {
                    const px = x + 0.5;
                    const py = y + 0.5;
                    const w0 = ((tri[1].x - px) * (tri[2].y - py) - (tri[2].x - px) * (tri[1].y - py)) / area;
                    const w1 = ((tri[2].x - px) * (tri[0].y - py) - (tri[0].x - px) * (tri[2].y - py)) / area;
                    const w2 = 1 - w0 - w1;
                    if (w0 < 0 || w1 < 0 || w2 < 0) continue;

                    const z = w0 * tri[0].z + w1 * tri[1].z + w2 * tri[2].z;
                    const di = y * W + x;
                    if (z >= depth[di]) continue;
                    depth[di] = z;

                    const n = new Vector3(
                        w0 * tri[0].n.x + w1 * tri[1].n.x + w2 * tri[2].n.x,
                        w0 * tri[0].n.y + w1 * tri[1].n.y + w2 * tri[2].n.y,
                        w0 * tri[0].n.z + w1 * tri[1].n.z + w2 * tri[2].n.z,
                    ).normalize();
                    const ao = w0 * tri[0].ao + w1 * tri[1].ao + w2 * tri[2].ao;

                    // Мировая точка нужна, чтобы спросить карту теней.
                    const world = new Vector3(
                        w0 * tri[0].w.x + w1 * tri[1].w.x + w2 * tri[2].w.x,
                        w0 * tri[0].w.y + w1 * tri[1].w.y + w2 * tri[2].w.y,
                        w0 * tri[0].w.z + w1 * tri[1].w.z + w2 * tri[2].w.z,
                    );
                    const shade = shadeAt(n, ao, shadowFactor(world));

                    // Тёплый свет / холодная тень: сдвигаем оттенок, но не
                    // трогаем насыщенность, иначе кожа сереет.
                    const warmth = 0.06 * shade.lit;
                    const chill = 0.05 * (1 - shade.lit);

                    const ci = di * 3;
                    color[ci] = Math.min(1, diffuse.r * shade.level * (1 + warmth));
                    color[ci + 1] = Math.min(1, diffuse.g * shade.level * (1 + warmth * 0.35));
                    color[ci + 2] = Math.min(1, diffuse.b * shade.level * (1 + chill));
                }
            }
        }
    }
}

// --- PNG ------------------------------------------------------------------

const raw = Buffer.alloc((W * 3 + 1) * H);
let o = 0;
for (let y = 0; y < H; y += 1) {
    raw[o] = 0; o += 1;
    for (let x = 0; x < W; x += 1) {
        const i = (y * W + x) * 3;
        raw[o] = Math.round(color[i] ** (1 / 2.2) * 255); o += 1;
        raw[o] = Math.round(color[i + 1] ** (1 / 2.2) * 255); o += 1;
        raw[o] = Math.round(color[i + 2] ** (1 / 2.2) * 255); o += 1;
    }
}

const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;

fs.writeFileSync(OUT, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
]));

console.log(`${OUT} (поза: ${POSE}, вид: ${VIEW})`);
engine.dispose();
