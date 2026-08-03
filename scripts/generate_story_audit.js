import { writeFileSync } from 'node:fs';
import { buildStoryAuditSnapshot } from '../src/story_audit.js';

function buildMarkdown() {
  const audit = buildStoryAuditSnapshot();
  const sub100Beats = audit.beats.filter((beat) => beat.percent < 100);
  const sub100Categories = audit.categories.filter((category) => category.percent < 100);
  const concreteGoals = sub100Categories.length > 0
    ? [
        `Дожать категории ниже 100%: ${sub100Categories.map((category) => `${category.label} ${category.percent}%`).join(', ')}.`,
        `Довести биты ниже 100%: ${sub100Beats.map((beat) => `${beat.label} ${beat.percent}%`).join(', ') || 'нет'}.`,
        'Продолжать усиливать room-by-room pacing, quiet scenes и repeat-visit interiors без отхода от структуры оригинальной Grandia II.',
      ]
    : [
        'Все ключевые story-категории уже доведены до 100% по текущему аудиту.',
        `Биты ниже 100% для следующего художественного polishing pass: ${sub100Beats.map((beat) => `${beat.label} ${beat.percent}%`).join(', ') || 'нет'}.`,
        'Дальнейший рост — в polish текста, визуальной подаче и дополнительных необязательных атмосферных реакциях.',
      ];

  const lines = [
    '# STORY_IMPLEMENTATION_AUDIT',
    '',
    'Этот файл показывает **процент реализации story-слоя** относительно структуры оригинальной **Grandia II** внутри текущего браузерного порта.',
    '',
    `- Общая оценка реализации: **${audit.overallPercent}%**`,
    `- Средняя плотность реализации по 19 сюжетным битам: **${audit.beatCoveragePercent}%**`,
    `- Сильных битов (>= 80%): **${audit.doneBeats}**`,
    `- Промежуточных битов (40-79.9%): **${audit.partialBeats}**`,
    `- Слабых битов (< 40%): **${audit.lowBeats}**`,
    '',
    '## Методика',
    audit.methodology.note,
    '',
    '- `done` = 100%',
    '- `partial` = 50%',
    '- `todo` = 0%',
    '- Общий процент — среднее по ключевым категориям реализации.',
    '',
    '## Категории',
    '',
    ...audit.categories.flatMap((category) => [
      `### ${category.label} — ${category.percent}%`,
      `- done: ${category.doneCount}`,
      `- partial: ${category.partialCount}`,
      `- todo: ${category.todoCount}`,
      '',
      ...category.items.map((item) => `${item.status === 'done' ? '- ✅' : item.status === 'partial' ? '- 🟡' : '- ⬜'} **${item.label}**\n  - Сделано: ${item.done}\n  - Осталось: ${item.remaining}`),
      '',
    ]),
    '## Прогресс по аркам',
    '',
    ...audit.arcBreakdown.flatMap((arc) => [
      `### ${arc.label} — ${arc.percent}%`,
      ...arc.beats.map((beat) => `- ${beat.label}: ${beat.percent}%`),
      '',
    ]),
    '## Ближайшие конкретные цели',
    '',
    ...concreteGoals.map((goal) => `- ${goal}`),
    '',
    '## Beat-by-beat',
    '',
    ...audit.beats.flatMap((beat) => [
      `### ${beat.label} — ${beat.percent}%`,
      `- Сделано: ${beat.done}`,
      `- Осталось: ${beat.remaining}`,
      `- Слои: narrative=${beat.narrative}, route=${beat.route}, chain=${beat.chain}, encounter=${beat.encounter}, fidelity=${beat.fidelity}`,
      '',
    ]),
  ];

  return `${lines.join('\n')}\n`;
}

const outputPath = new URL('../STORY_IMPLEMENTATION_AUDIT.md', import.meta.url);
writeFileSync(outputPath, buildMarkdown(), 'utf8');
console.log('STORY_IMPLEMENTATION_AUDIT.md regenerated.');
