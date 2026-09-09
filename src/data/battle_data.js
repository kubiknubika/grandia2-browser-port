// Боевые данные для 3D-прототипа.
//
// Единственный источник правды по характеристикам — PRESETS из combat.js
// (80 юнитов, выверенный баланс). Здесь мы только выбираем нужных бойцов и
// добавляем то, что нужно исключительно 3D-слою: цвет заглушки и тип модели.
//
// Раньше этот файл содержал собственные копии статов (str/vit/act/mov), которые
// расходились с движком. Теперь расхождение невозможно by design.

import { PRESETS } from '../entities/combat.js';

// Как рисовать юнита процедурной заглушкой, пока нет реальных GLB-моделей.
const MESH_KINDS = {
    ryudo: 'humanoid',
    elena: 'humanoid',
    mottledSpider: 'spider',
    tarantula: 'spider',
};

// Цвета заглушек. Берём из пресета, если он есть, иначе — запасной вариант.
const MESH_COLORS = {
    ryudo: '#3498db',
    elena: '#c084fc',
    mottledSpider: '#8e44ad',
    tarantula: '#3f6212',
};

/**
 * Собирает описание юнита для 3D-сцены из канонического пресета.
 * @param {string} presetKey ключ в PRESETS
 * @param {object} overrides поля, которые нужно переопределить (id, name, ...)
 */
export function makeUnitData(presetKey, overrides = {}) {
    const preset = PRESETS[presetKey];
    if (!preset) {
        throw new Error(`Unknown preset "${presetKey}". Available: ${Object.keys(PRESETS).join(', ')}`);
    }

    return {
        // Всё из пресета: maxHp/str/vit/agi/spd/mag/men, loadout, resistances...
        ...preset,
        presetKey,
        // id пресета вида 'mottled-spider' не годится как уникальный ключ сцены,
        // когда на арене два одинаковых паука — вызывающий код передаёт свой.
        id: overrides.id ?? preset.id,
        meshKind: MESH_KINDS[presetKey] ?? 'humanoid',
        color: MESH_COLORS[presetKey] ?? preset.color ?? '#95a5a6',
        ...overrides,
    };
}

// Состав боя по умолчанию: Рюдо и Елена против двух пятнистых пауков
// (Башня Гармия). Елена нужна, чтобы в бою были лечение, поддержка и
// воскрешение — то, ради чего в оригинале держат второго персонажа.
export const DEFAULT_ENCOUNTER = {
    players: [
        { presetKey: 'ryudo', id: 'ryudo', position: { x: -6, z: -2 } },
        { presetKey: 'elena', id: 'elena', position: { x: -7, z: 2.5 } },
    ],
    enemies: [
        { presetKey: 'mottledSpider', id: 'spider1', name: 'Mottled Spider A', position: { x: 4, z: 3 } },
        { presetKey: 'mottledSpider', id: 'spider2', name: 'Mottled Spider B', position: { x: 5, z: -2 } },
    ],
};

// Стартовый инвентарь партии (общий, как в оригинале).
export const DEFAULT_INVENTORY = {
    medicinalHerb: 3,
    antidote: 2,
    yomisElixir: 1,
};
