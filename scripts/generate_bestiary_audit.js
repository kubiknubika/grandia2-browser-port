import { writeFileSync } from 'node:fs';
import { PRESETS } from '../src/entities/combat.js';
import { BESTIARY_GROUPS, buildBestiaryGroupSnapshot } from '../src/bestiary_data.js';

const enemyEntries = Object.entries(PRESETS).filter(([, preset]) => preset.team === 'enemies');
const snapshot = buildBestiaryGroupSnapshot(PRESETS);

const lines = [
  '# BESTIARY_AUDIT',
  '',
  'Этот файл фиксирует текущее состояние **enemy / bestiary pass** внутри browser-порта Grandia II.',
  '',
  `- Всего enemy presets в боевом движке: **${enemyEntries.length}**`,
  `- Покрытых bestiary-групп: **${BESTIARY_GROUPS.length}**`,
  '',
  '## Общий вывод',
  '',
  '- В движке уже есть заметно более широкий bestiary, чем раньше: не только generic troglodyte/guardian, но и набор оригинально-похожих врагов по регионам.',
  '- Это всё ещё не вся оригинальная энциклопедия Grandia II, но уже отдельный полноценный слой данных, пригодный для дальнейшего region-by-region наполнения.',
  '',
  '## Группы bestiary',
  '',
  ...snapshot.flatMap((group) => [
    `### ${group.label}`,
    `- Локации: ${group.locations.join(', ')}`,
    `- Покрыто врагов: ${group.resolvedEnemies.length}/${group.enemyKeys.length}`,
    `- Нота: ${group.notes}`,
    ...group.resolvedEnemies.map(({ key, preset }) => `- ${preset.name} [${key}] — role: ${preset.role}`),
    ...(group.missingKeys.length ? [`- Отсутствуют ключи: ${group.missingKeys.join(', ')}`] : []),
    '',
  ]),
  '## Полный список enemy presets',
  '',
  ...enemyEntries.map(([key, preset]) => `- ${preset.name} [${key}] — role: ${preset.role}`),
  '',
];

writeFileSync(new URL('../BESTIARY_AUDIT.md', import.meta.url), `${lines.join('\n')}\n`, 'utf8');
console.log('BESTIARY_AUDIT.md regenerated.');
