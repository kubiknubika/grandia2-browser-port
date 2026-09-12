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

// Состав боя по умолчанию: один Рюдо против пятнистых пауков.
// Елена временно выведена из партии — сейчас настраивается баланс соло-боя,
// и второй персонаж с лечением/воскрешением смазывал бы картину.
// Её пресет остаётся в combat.js, а PARTY_ENCOUNTER ниже держит групповые
// механики (лечение, воскрешение, выбор союзника) под тестами.
// Пауки ослаблены по HP и ускорены по сравнению с каноническим пресетом:
// вдвоём против одного Рюдо оригинальные 230 HP превращали бой в двухминутную
// пилёжку (15 ходов на добивание при запасе прочности в 18 раундов), где
// исход не зависел от игры. Замер 200 боёв на каждый вариант: с этими
// числами внимательная игра выигрывает всегда (~42% HP в конце), а небрежная
// (только Combo, без лечения и без Critical по заряженной цели) — лишь в 62%.
// Канонические PRESETS не трогаем: правка живёт только в этом энкаунтере.
const SPIDER_TUNING = { maxHp: 58 };

export const DEFAULT_ENCOUNTER = {
    players: [
        { presetKey: 'ryudo', id: 'ryudo', position: { x: -6, z: 0 } },
    ],
    enemies: [
        { presetKey: 'mottledSpider', id: 'spider1', name: 'Mottled Spider A', position: { x: 4, z: 3 }, ...SPIDER_TUNING },
        { presetKey: 'mottledSpider', id: 'spider2', name: 'Mottled Spider B', position: { x: 5, z: -2 }, ...SPIDER_TUNING },
    ],
};

// Состав с напарником. В самой игре не используется, но нужен, чтобы
// групповые механики не остались без покрытия тестами.
export const PARTY_ENCOUNTER = {
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
