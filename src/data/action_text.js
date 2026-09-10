/**
 * Человекочитаемые описания приёмов.
 *
 * В ACTION_LIBRARY 138 действий и ни одного описания, поэтому игрок не мог
 * понять, чем Critical отличается от Combo. Тексты здесь НЕ пишутся руками
 * для каждого приёма: они собираются из реальных полей определения, поэтому
 * не могут разойтись с балансом. Правится число в combat.js — меняется и
 * подсказка в интерфейсе.
 *
 * Исключение — короткие «фирменные» пояснения к базовым командам, где важен
 * смысл механики, а не цифры (см. SIGNATURE_NOTES).
 */

/** Пояснения к механикам, которые из чисел не выводятся. */
const SIGNATURE_NOTES = {
    combo: 'Серия быстрых ударов. Не сбивает чужой ход, зато быстро копит IP и SP.',
    critical: 'Один тяжёлый удар. СБИВАЕТ ход противника, если тот уже занёс оружие, и отбрасывает его по шкале IP.',
    endure: 'Стойка: входящий урон снижается примерно втрое, а откат по шкале — почти вдвое. Копит больше SP.',
    evade: 'Уход в сторону: юнит разрывает дистанцию, чтобы выйти из-под удара.',
};

const ELEMENT_LABELS = {
    fire: 'огонь',
    water: 'вода',
    earth: 'земля',
    wind: 'ветер',
    light: 'свет',
    dark: 'тьма',
    lightning: 'молния',
    ice: 'лёд',
};

const STATUS_LABELS = {
    poison: 'яд',
    sleep: 'сон',
    paralysis: 'паралич',
    confusion: 'замешательство',
    moveBlock: 'запрет приёмов',
    magicBlock: 'печать магии',
};

const STAT_LABELS = {
    atk: 'атака',
    def: 'защита',
    act: 'скорость хода',
    mov: 'скорость бега',
};

const TARGET_LABELS = {
    single: 'одна цель',
    'single-ally': 'один союзник',
    'all-enemies': 'все враги',
    'all-allies': 'вся группа',
    line: 'линия',
    self: 'на себя',
    point: 'по месту',
};

/** Короткая строка «что это за приём» для кольца команд. */
export function describeAction(definition) {
    if (!definition) return '';
    if (SIGNATURE_NOTES[definition.id]) return SIGNATURE_NOTES[definition.id];

    const parts = [];

    // Урон и его характер.
    if (definition.kind === 'magic' && (definition.spellPower || definition.spellBase)) {
        parts.push('Магический урон');
    } else if (definition.power) {
        const hits = definition.hitCount ?? 1;
        parts.push(hits > 1 ? `Физический урон, ударов: ${hits}` : 'Физический урон');
    }

    if (definition.healBase || definition.powerBase) parts.push('восстанавливает HP');
    if (definition.revive) parts.push('поднимает павшего');
    if (definition.restoreSp) parts.push(`+${definition.restoreSp} SP`);
    if (definition.restoreMp) parts.push(`+${definition.restoreMp} MP`);

    if (definition.element && ELEMENT_LABELS[definition.element]) {
        parts.push(`стихия: ${ELEMENT_LABELS[definition.element]}`);
    }

    // Статусы, которые накладывает приём.
    const statuses = (definition.statusEffects ?? [])
        .map((effect) => STATUS_LABELS[effect.name] ?? effect.name);
    if (statuses.length) parts.push(`накладывает ${statuses.join(', ')}`);

    if (definition.cureStatuses?.length) {
        const cured = definition.cureStatuses.map((n) => STATUS_LABELS[n] ?? n);
        parts.push(`снимает ${cured.join(', ')}`);
    }

    // Баффы и дебаффы.
    for (const shift of definition.statShifts ?? []) {
        const stat = STAT_LABELS[shift.stat] ?? shift.stat;
        // Поле в ACTION_LIBRARY называется amount; обращение к shift.stages
        // давало "NaN скорость бега" во всех описаниях баффов.
        const amount = shift.amount ?? 0;
        const turns = shift.turns ? ` на ${shift.turns} х.` : '';
        parts.push(`${amount > 0 ? '+' : '−'}${Math.abs(amount)} ${stat}${turns}`);
    }

    if (definition.cancel) parts.push('сбивает занесённый ход');

    // Куда бьёт.
    const targetLabel = TARGET_LABELS[definition.targeting];
    if (targetLabel && definition.targeting !== 'single') parts.push(targetLabel);

    // Бежит ли юнит к цели: это прямо влияет на тактику.
    if (definition.commandType === 'basic' && definition.melee) {
        parts.push('нужно подбежать');
    } else if (definition.commandType === 'move' || definition.melee === false) {
        parts.push('бьёт с места');
    }

    if (!parts.length) return 'Особое действие.';

    const text = parts.join(', ');
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

/** Строка с числами для тех, кто хочет сравнить приёмы. */
export function describeNumbers(definition) {
    if (!definition) return '';
    const bits = [];

    if (definition.power) bits.push(`сила ${definition.power.toFixed(2)}`);
    if (definition.spellPower) bits.push(`магия ${definition.spellPower.toFixed(2)}`);
    if (definition.spellBase) bits.push(`база ${definition.spellBase}`);
    if (definition.healBase) bits.push(`лечение ${definition.healBase}`);
    if ((definition.hitCount ?? 1) > 1) bits.push(`${definition.hitCount} удара`);
    if (definition.ipDamage) bits.push(`откат IP ${definition.ipDamage}`);

    // Баффы/дебаффы: без этой строки у поддержки числовая сводка была пустой.
    for (const shift of definition.statShifts ?? []) {
        const stat = STAT_LABELS[shift.stat] ?? shift.stat;
        const amount = shift.amount ?? 0;
        bits.push(`${amount > 0 ? '+' : '−'}${Math.abs(amount)} ${stat}`);
    }

    return bits.join(' · ');
}
