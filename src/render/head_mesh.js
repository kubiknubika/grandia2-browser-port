/**
 * Голова как ЕДИНАЯ поверхность, а не набор склеенных шаров.
 *
 * Метод: голова описана горизонтальными сечениями (от подбородка к темени).
 * Каждое сечение — замкнутый контур, заданный радиусами по 12 направлениям.
 * Радиусы подобраны по анатомии: череп шире всего на уровне висков, скулы
 * выступают вперёд-вбок, челюсть сужается к подбородку, затылок длиннее лба.
 * Между сечениями строятся треугольники — получается сплошная кожа с
 * настоящими плоскостями лица (лоб, скула, щека, челюсть), а не «кружочки».
 *
 * Нормали усредняются по вершинам, поэтому поверхность выглядит гладкой,
 * а рёбра между планами лица дают мягкие блики вместо стыков шаров.
 */

import { Mesh, VertexData } from '@babylonjs/core';

/**
 * Сечения черепа снизу вверх.
 *
 * y     — высота сечения (0 — низ подбородка, ~0.62 — темя);
 * back  — насколько контур уходит назад (глубина затылка);
 * front — насколько выступает вперёд (лицо);
 * half  — половина ширины;
 * squareness — 0 круглый контур, 1 близкий к прямоугольному (скулы, челюсть).
 */
const PROFILE = [
    { y: 0.055, back: 0.072, front: 0.092, half: 0.092, squareness: 0.42 }, // низ подбородка
    { y: 0.100, back: 0.110, front: 0.126, half: 0.133, squareness: 0.52 }, // подбородок
    { y: 0.150, back: 0.138, front: 0.146, half: 0.166, squareness: 0.58 }, // челюсть
    { y: 0.200, back: 0.158, front: 0.158, half: 0.189, squareness: 0.55 }, // угол челюсти
    { y: 0.252, back: 0.171, front: 0.168, half: 0.202, squareness: 0.45 }, // щёки
    { y: 0.295, back: 0.182, front: 0.176, half: 0.212, squareness: 0.38 }, // скулы (самое широкое)
    { y: 0.350, back: 0.188, front: 0.170, half: 0.210, squareness: 0.28 }, // глазницы
    { y: 0.405, back: 0.190, front: 0.163, half: 0.202, squareness: 0.20 }, // брови
    { y: 0.462, back: 0.188, front: 0.158, half: 0.192, squareness: 0.14 }, // лоб
    { y: 0.520, back: 0.178, front: 0.146, half: 0.174, squareness: 0.10 }, // верх лба
    { y: 0.572, back: 0.152, front: 0.122, half: 0.143, squareness: 0.06 }, // темя
    { y: 0.610, back: 0.100, front: 0.080, half: 0.092, squareness: 0.03 }, // макушка
    { y: 0.635, back: 0.038, front: 0.030, half: 0.036, squareness: 0.00 }, // полюс
];

/** Направления обхода контура: 0 — строго вперёд, PI — назад. */
const SEGMENTS = 16;

/**
 * Радиус контура в заданном направлении.
 * Смешиваем круг и прямоугольник: `squareness` придаёт лицу плоские планы.
 */
function contourRadius(angle, section) {
    const forward = Math.cos(angle);
    const side = Math.sin(angle);

    // Глубина зависит от того, смотрим мы вперёд (лицо) или назад (затылок).
    const depth = forward >= 0 ? section.front : section.back;

    const circle = 1 / Math.sqrt(
        (forward / depth) ** 2 + (side / section.half) ** 2 || 1,
    );

    // Прямоугольный контур — граница по большей из осей.
    const square = 1 / Math.max(
        Math.abs(forward) / depth,
        Math.abs(side) / section.half,
    );

    return circle * (1 - section.squareness) + square * section.squareness;
}

/**
 * Строит меш головы. Возвращает Mesh с гладкими нормалями.
 * Локальная система: +Z — вперёд (лицо), +Y — вверх, центр в основании шеи.
 */
export function createHeadMesh(scene, name) {
    const positions = [];
    const indices = [];

    // --- Вершины -----------------------------------------------------------
    for (const section of PROFILE) {
        for (let s = 0; s < SEGMENTS; s += 1) {
            const angle = (s / SEGMENTS) * Math.PI * 2;
            const radius = contourRadius(angle, section);

            let z = Math.cos(angle) * radius;
            const x = Math.sin(angle) * radius;
            let y = section.y;

            // Подбородок и челюсть уходят вперёд-вниз, а не висят шаром.
            if (section.y < 0.18 && z > 0) {
                z += (0.18 - section.y) * 0.22;
                y -= (0.18 - section.y) * 0.05;
            }

            // Надбровные дуги: небольшой козырёк над глазами.
            if (section.y > 0.375 && section.y < 0.45 && z > 0) {
                z += 0.016 * (1 - Math.abs(x) / section.half);
            }

            // Глазницы слегка утоплены — под бровью тень.
            if (section.y > 0.315 && section.y < 0.375 && z > 0) {
                const centrality = 1 - Math.min(1, Math.abs(Math.abs(x) - 0.085) / 0.075);
                z -= 0.022 * centrality;
            }

            // Височные впадины: череп сжат по бокам выше скул.
            if (section.y > 0.40 && Math.abs(x) > section.half * 0.7) {
                const temple = (section.y - 0.40) / 0.2;
                z *= 1 - 0.05 * Math.min(1, temple);
            }

            positions.push(x, y, z);
        }
    }

    // Полюс макушки — замыкает поверхность сверху.
    const apexIndex = positions.length / 3;
    positions.push(0, 0.648, -0.01);

    // --- Треугольники ------------------------------------------------------
    for (let r = 0; r < PROFILE.length - 1; r += 1) {
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

    const topRow = (PROFILE.length - 1) * SEGMENTS;
    for (let s = 0; s < SEGMENTS; s += 1) {
        const next = (s + 1) % SEGMENTS;
        indices.push(topRow + s, apexIndex, topRow + next);
    }

    // Низ шеи закрываем веером, иначе внутрь головы видно насквозь.
    const baseCenter = positions.length / 3;
    positions.push(0, -0.005, 0.01);
    for (let s = 0; s < SEGMENTS; s += 1) {
        const next = (s + 1) % SEGMENTS;
        indices.push(s, next, baseCenter);
    }

    const normals = [];
    VertexData.ComputeNormals(positions, indices, normals);

    const mesh = new Mesh(name, scene);
    const data = new VertexData();
    data.positions = positions;
    data.indices = indices;
    data.normals = normals;
    data.applyToMesh(mesh);

    return mesh;
}
