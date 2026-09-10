/**
 * Причёска как оболочка, повторяющая череп, а не шар с воткнутыми конусами.
 *
 * Прошлая версия: половина сферы поверх головы плюс десяток конусов-«прядей»,
 * торчащих сквозь неё. Конусы пересекали купол под случайными углами, из-за
 * чего причёска читалась как шлем с шипами, а не как волосы.
 *
 * Здесь причёска строится из той же системы сечений, что и голова
 * (`skullRadiusAt`), но с отступом наружу: волосы ЛЕЖАТ на черепе, повторяя
 * его форму. Нижняя граница — не ровный срез, а линия роста волос: она
 * поднимается над лбом, опускается перед ушами (виски) и уходит вниз на
 * затылке. Толщина слоя меняется: у линии роста волосы тонкие, к макушке
 * набирают объём.
 *
 * Пряди задаются как модуляция радиуса по углу — это выступы самой
 * поверхности, а не отдельные тела. Поэтому нет ни стыков, ни пересечений.
 */

import { Mesh, VertexData } from '@babylonjs/core';
import { skullRadiusAt, computeAmbientOcclusion } from './head_mesh.js';

const SEGMENTS = 28;
const RINGS = 16;

/**
 * Высота линии роста волос в направлении `angle`.
 * 0 — строго вперёд (лоб), PI — назад (затылок).
 */
function hairlineY(angle, style) {
    const forward = Math.cos(angle);
    const side = Math.abs(Math.sin(angle));

    if (forward > 0) {
        // Лоб: волосы начинаются высоко, открывая лицо.
        // На висках линия опускается — там растёт «мысок» к бакенбардам.
        const brow = style.foreheadY + (style.templeY - style.foreheadY) * (1 - forward);
        return brow - style.widowsPeak * Math.pow(forward, 3);
    }

    // Затылок: волосы спускаются к шее.
    const back = -forward;
    return style.templeY + (style.napeY - style.templeY) * Math.pow(back, 0.7)
        - style.sideDrop * side * (1 - back);
}

/**
 * Толщина слоя волос на нормализованной высоте `t` (0 — линия роста,
 * 1 — макушка) в направлении `angle`.
 */
function hairThickness(angle, t, style) {
    const forward = Math.cos(angle);

    // У корней слой тонкий, иначе причёска нависает козырьком над лбом.
    const growth = Math.pow(Math.min(1, t / 0.35), 0.8);
    let thickness = style.minThickness
        + (style.maxThickness - style.minThickness) * growth;

    // Надо лбом чуть пышнее — чёлка.
    if (forward > 0) thickness += style.fringe * Math.pow(forward, 2) * growth;

    // К самой макушке слой снова слегка утончается, чтобы силуэт не был шаром.
    thickness *= 1 - 0.22 * Math.pow(Math.max(0, t - 0.75) / 0.25, 2);

    return thickness;
}

/**
 * Пряди: модуляция радиуса по углу. Каждая прядь — плавный горб, который
 * усиливается к макушке, поэтому у корней поверхность гладкая.
 */
function strandBulge(angle, t, style) {
    if (style.strandDepth === 0) return 0;

    // Несколько гармоник дают неравномерные пряди вместо ровной гофры.
    const wave = Math.sin(angle * style.strandCount)
        + 0.5 * Math.sin(angle * style.strandCount * 2 + 1.1)
        + 0.3 * Math.sin(angle * style.strandCount * 3 + 2.3);

    return wave * style.strandDepth * Math.pow(t, 1.3);
}

const STYLES = {
    /** Рюдо: короткие колючие волосы, открытый лоб, шипы назад-вверх. */
    spiky: {
        foreheadY: 0.470,
        templeY: 0.372,
        napeY: 0.232,
        widowsPeak: 0.030,
        sideDrop: 0.020,
        minThickness: 0.012,
        maxThickness: 0.055,
        fringe: 0.022,
        strandCount: 7,
        strandDepth: 0.011,
        // Пряди зачёсаны НАЗАД, а не торчат венцом по кругу: короткие у
        // лба, длиннее к затылку, разной высоты — иначе силуэт читался
        // как ирокез или корона.
        spikes: [
            // [угол, доля высоты, длина, разлёт вбок]
            [Math.PI * 0.18, 0.80, 0.070, 0.04],
            [-Math.PI * 0.22, 0.76, 0.062, -0.04],
            [Math.PI * 0.46, 0.70, 0.082, 0.07],
            [-Math.PI * 0.50, 0.72, 0.075, -0.07],
            [Math.PI * 0.72, 0.60, 0.090, 0.05],
            [-Math.PI * 0.74, 0.56, 0.082, -0.05],
        ],
    },
    /** Елена: гладкие длинные волосы, мягкий объём, без шипов. */
    smooth: {
        // Подол: до какой высоты спускаются волосы и насколько расширяются
        // книзу. Раньше длину изображали две капсулы по бокам — они
        // читались как приклеенные трубы.
        drape: {
            bottomY: -0.28,
            frontLimit: 0.34,  // насколько далеко вперёд заходит масса
            flare: 0.062,      // расширение книзу
            thickness: 0.052,
        },
        foreheadY: 0.455,
        templeY: 0.350,
        napeY: 0.190,
        widowsPeak: 0.018,
        sideDrop: 0.035,
        minThickness: 0.016,
        maxThickness: 0.062,
        fringe: 0.030,
        strandCount: 5,
        strandDepth: 0.006,
        spikes: [],
    },
};

/**
 * Строит меш причёски, лежащий на черепе.
 * Локальная система совпадает с головой: +Z — лицо, +Y — вверх.
 */
export function createHairMesh(scene, name, styleName = 'spiky') {
    const style = STYLES[styleName] ?? STYLES.spiky;

    const positions = [];
    const indices = [];

    const apexY = 0.646;

    for (let r = 0; r <= RINGS; r += 1) {
        // Сгущаем кольца у линии роста: там форма меняется быстрее всего.
        const t = Math.pow(r / RINGS, 1.25);

        for (let s = 0; s < SEGMENTS; s += 1) {
            const angle = (s / SEGMENTS) * Math.PI * 2;

            const baseY = hairlineY(angle, style);
            const y = baseY + (apexY - baseY) * t;

            const skull = skullRadiusAt(angle, y);
            const offset = hairThickness(angle, t, style) + strandBulge(angle, t, style);
            const radius = skull + offset;

            positions.push(
                Math.sin(angle) * radius,
                y,
                Math.cos(angle) * radius,
            );
        }
    }

    for (let r = 0; r < RINGS; r += 1) {
        for (let s = 0; s < SEGMENTS; s += 1) {
            const next = (s + 1) % SEGMENTS;
            const a = r * SEGMENTS + s;
            const b = r * SEGMENTS + next;
            const c = (r + 1) * SEGMENTS + s;
            const d = (r + 1) * SEGMENTS + next;

            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    // Полюс: верхнее кольцо стягиваем в точку.
    const apexIndex = positions.length / 3;
    positions.push(0, apexY + 0.012, -0.012);
    const topRow = RINGS * SEGMENTS;
    for (let s = 0; s < SEGMENTS; s += 1) {
        const next = (s + 1) % SEGMENTS;
        indices.push(topRow + s, apexIndex, topRow + next);
    }

    // Нижняя кромка: заворачиваем слой внутрь к черепу, чтобы у линии роста
    // не было видно открытого края «жестянки».
    const rimStart = positions.length / 3;
    for (let s = 0; s < SEGMENTS; s += 1) {
        const angle = (s / SEGMENTS) * Math.PI * 2;
        const y = hairlineY(angle, style) - 0.012;
        const radius = skullRadiusAt(angle, y) - 0.004;
        positions.push(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
    }
    for (let s = 0; s < SEGMENTS; s += 1) {
        const next = (s + 1) % SEGMENTS;
        indices.push(s, rimStart + s, next);
        indices.push(next, rimStart + s, rimStart + next);
    }

    // Подол длинных волос — продолжение той же оболочки вниз.
    if (style.drape) addDrape(positions, indices, style);

    // Шипы — вытянутые продолжения той же поверхности, а не отдельные конусы.
    for (const [angle, heightFraction, length, spread] of style.spikes) {
        addSpike(positions, indices, angle, heightFraction, length, spread, style, apexY);
    }

    const normals = [];
    VertexData.ComputeNormals(positions, indices, normals);

    const mesh = new Mesh(name, scene);
    const data = new VertexData();
    data.positions = positions;
    data.indices = indices;
    data.normals = normals;
    data.applyToMesh(mesh);

    // Волосы — крупная гладкая масса, а не мелкие складки: радиус выборки
    // меньше и затенение слабее. С «лицевыми» настройками (0.17 / 1.6) вся
    // длина Елены уходила в грязную тень.
    mesh.setVerticesData('ao', computeAmbientOcclusion(positions, normals, {
        radius: 0.075, strength: 0.9, floor: 0.74,
    }), false, 1);

    return mesh;
}

/**
 * Длинные волосы: продолжаем оболочку вниз от линии роста. Масса заходит
 * на затылок и виски, спереди обрывается, чтобы не закрывать лицо.
 * Книзу слой слегка расширяется и разбивается на пряди.
 */
function addDrape(positions, indices, style) {
    const { bottomY, frontLimit, flare, thickness } = style.drape;

    const columns = [];
    for (let s = 0; s < SEGMENTS; s += 1) {
        const angle = (s / SEGMENTS) * Math.PI * 2;
        const forward = Math.cos(angle);

        // Спереди волос нет: масса начинается от висков и идёт назад.
        if (forward > frontLimit) {
            columns.push(null);
            continue;
        }

        // Начинаем чуть ВЫШЕ линии роста и с тем же радиусом, что у
        // оболочки, иначе между шапкой и длиной видна щель.
        columns.push({ angle, top: hairlineY(angle, style) + 0.05 });
    }

    const DROP_RINGS = 7;
    const ringStart = [];

    for (let r = 0; r <= DROP_RINGS; r += 1) {
        const t = r / DROP_RINGS;
        ringStart.push(positions.length / 3);

        for (const column of columns) {
            if (!column) continue;

            const y = column.top + (bottomY - column.top) * t;

            // Ниже черепа нельзя брать радиус по профилю: у подбородка он
            // сужается до 0.09, и «волосы» обтягивали шею чулком. Ниже
            // уровня скул держим ширину самой широкой части головы.
            const WIDEST_Y = 0.295;
            const base = y >= WIDEST_Y
                ? skullRadiusAt(column.angle, y)
                : skullRadiusAt(column.angle, WIDEST_Y);

            // Силуэт по высоте: у затылка масса плотная, ниже ушей слегка
            // поджимается к шее, к плечам снова расширяется. Ровная труба
            // читалась как капюшон.
            // Лёгкое поджатие под затылком и заметное расширение к плечам.
            // Сильный «waist» превращал массу в облегающий шею чулок.
            const waist = 1 - 0.12 * Math.exp(-((t - 0.28) ** 2) / 0.03);
            const shoulder = Math.pow(t, 1.35);

            const radius = base * waist
                + thickness
                + flare * (shoulder * 2.6 + 0.2)
                + 0.016 * Math.sin(column.angle * 5) * t
                + 0.008 * Math.sin(column.angle * 9 + 0.7) * t;

            positions.push(
                Math.sin(column.angle) * radius,
                y,
                Math.cos(column.angle) * radius,
            );
        }
    }

    // Нижняя кромка: заворачиваем массу внутрь, чтобы не было видно
    // открытого среза «жестянки».
    const hemStart = positions.length / 3;
    for (const column of columns) {
        if (!column) continue;
        const base = skullRadiusAt(column.angle, 0.295);
        positions.push(
            Math.sin(column.angle) * base * 0.72,
            bottomY + 0.045,
            Math.cos(column.angle) * base * 0.72,
        );
    }

    const live = columns.filter(Boolean).length;

    const lastRing = ringStart[DROP_RINGS];
    for (let c = 0; c < live - 1; c += 1) {
        indices.push(lastRing + c, hemStart + c, lastRing + c + 1);
        indices.push(lastRing + c + 1, hemStart + c, hemStart + c + 1);
    }

    for (let r = 0; r < DROP_RINGS; r += 1) {
        for (let c = 0; c < live - 1; c += 1) {
            const a = ringStart[r] + c;
            const b = ringStart[r] + c + 1;
            const cc = ringStart[r + 1] + c;
            const d = ringStart[r + 1] + c + 1;
            indices.push(a, cc, b);
            indices.push(b, cc, d);
        }
    }
}

/**
 * Одна прядь-шип: четырёхгранная пирамида, растущая из поверхности волос
 * наружу и назад. Основание сидит на оболочке, поэтому шов не виден.
 */
function addSpike(positions, indices, angle, heightFraction, length, spread, style, apexY) {
    const baseY = hairlineY(angle, style);
    const y = baseY + (apexY - baseY) * heightFraction;

    // Радиус должен совпадать с оболочкой В ТОЧНОСТИ, включая горб пряди,
    // иначе основание шипа висит в воздухе над волосами.
    const radius = skullRadiusAt(angle, y)
        + hairThickness(angle, heightFraction, style)
        + strandBulge(angle, heightFraction, style)
        - 0.012; // чуть утапливаем внутрь, чтобы шов гарантированно скрылся

    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const cx = sin * radius;
    const cz = cos * radius;

    // Направление роста: пряди ложатся НАЗАД вдоль черепа, лишь слегка
    // приподнимаясь. Прежний dirY=0.62 поднимал их вертикально вверх —
    // получался венец шипов вокруг макушки.
    const dirX = sin * 0.30 + spread;
    const dirY = 0.10;
    const dirZ = cos * 0.30 - 1.05;
    const dirLength = Math.hypot(dirX, dirY, dirZ);

    const tipX = cx + (dirX / dirLength) * length;
    const tipY = y + (dirY / dirLength) * length;
    const tipZ = cz + (dirZ / dirLength) * length;

    // Основание: четыре точки вокруг места крепления. Широкое — тогда
    // прядь выглядит подхваченной с массы волос, а не приклеенной.
    const width = 0.075;
    const start = positions.length / 3;

    const tangentX = cos;
    const tangentZ = -sin;

    positions.push(cx + tangentX * width, y - width * 0.5, cz + tangentZ * width);
    positions.push(cx - tangentX * width, y - width * 0.5, cz - tangentZ * width);
    positions.push(cx - tangentX * width * 0.6, y + width * 0.8, cz - tangentZ * width * 0.6);
    positions.push(cx + tangentX * width * 0.6, y + width * 0.8, cz + tangentZ * width * 0.6);
    positions.push(tipX, tipY, tipZ);

    const tip = start + 4;
    indices.push(start + 0, tip, start + 1);
    indices.push(start + 1, tip, start + 2);
    indices.push(start + 2, tip, start + 3);
    indices.push(start + 3, tip, start + 0);
}
