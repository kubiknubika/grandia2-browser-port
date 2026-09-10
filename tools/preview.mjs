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
    animator.playSwing('ryudo');
    animator.playHit('spiderA');
    for (let i = 0; i < 7; i += 1) animator.update(actors.map((a) => a.unit), 1 / 60);
}

// --- Камера ---------------------------------------------------------------

const VIEWS = {
    front: { eye: new Vector3(0, 3.0, 12.5), target: new Vector3(0, 1.1, 0) },
    heroes: { eye: new Vector3(-3.4, 2.1, 3.6), target: new Vector3(-3.4, 1.4, 0) },
    face: { eye: new Vector3(-3.4, 2.7, 2.0), target: new Vector3(-3.4, 2.3, 0) },
    back: { eye: new Vector3(-3.4, 2.1, -3.6), target: new Vector3(-3.4, 1.4, 0) },
    spider: { eye: new Vector3(4.3, 2.2, 5.2), target: new Vector3(4.3, 0.7, 0) },
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
        color[i] = 0.09 + 0.05 * t;
        color[i + 1] = 0.10 + 0.06 * t;
        color[i + 2] = 0.15 + 0.09 * t;
    }
}

const light = new Vector3(-0.45, 1, -0.75).normalize();

for (const { model } of actors) {
    model.root.computeWorldMatrix(true);
    model.root.getChildMeshes(false).forEach((m) => m.computeWorldMatrix(true));

    for (const mesh of model.meshes) {
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const normals = mesh.getVerticesData(VertexBuffer.NormalKind);
        const indices = mesh.getIndices();
        if (!positions || !indices) continue;

        const world = mesh.getWorldMatrix();
        const diffuse = mesh.material?.diffuseColor ?? { r: 0.8, g: 0.8, b: 0.8 };
        const count = positions.length / 3;

        const wp = new Array(count);
        const wn = new Array(count);
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

        for (let t = 0; t < indices.length; t += 3) {
            const tri = [indices[t], indices[t + 1], indices[t + 2]].map((i) => {
                const c = Vector3.TransformCoordinates(wp[i], vp);
                return { x: (c.x * 0.5 + 0.5) * W, y: (1 - (c.y * 0.5 + 0.5)) * H, z: c.z, n: wn[i] };
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
                    const shade = 0.32 + 0.78 * Math.max(0, Vector3.Dot(n, light));

                    const ci = di * 3;
                    color[ci] = Math.min(1, diffuse.r * shade);
                    color[ci + 1] = Math.min(1, diffuse.g * shade);
                    color[ci + 2] = Math.min(1, diffuse.b * shade);
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
