import { writeFileSync } from 'node:fs';
import { buildCampaignScriptAuditSnapshot } from '../src/campaign_content.js';

const snapshot = buildCampaignScriptAuditSnapshot();

const lines = [
  '# SCRIPT_AUDIT',
  '',
  'Этот файл фиксирует состояние **script / dialogue expansion pass** внутри browser-порта Grandia II.',
  '',
  `- Сюжетных битов с hand-authored beat script: **${snapshot.totalBeats}**`,
  `- Всего beat-script pages: **${snapshot.totalPages}**`,
  `- Dialogue pages: **${snapshot.totalDialoguePages}**`,
  `- Narration pages: **${snapshot.totalNarrationPages}**`,
  `- Result pages: **${snapshot.totalResultPages}**`,
  '',
  '## Beat-by-beat density',
  '',
  ...snapshot.beats.flatMap((entry) => [
    `### ${entry.beatId}`,
    `- Opening pages: ${entry.openingCount}`,
    `- Victory pages: ${entry.victoryCount}`,
    `- Defeat pages: ${entry.defeatCount}`,
    `- Dialogue pages: ${entry.dialogueCount}`,
    `- Narration pages: ${entry.narrationCount}`,
    `- Result pages: ${entry.resultCount}`,
    `- Total pages: ${entry.totalPages}`,
    '',
  ]),
  '## Вывод',
  '',
  '- Beat script layer заметно плотнее, чем раньше: у каждого бита теперь есть не только базовый intro/result, но и дополнительный character banter layer.',
  '- Это улучшает story readability, но всё ещё не означает полный 1:1 перенос всего оригинального сценария Grandia II.',
  '- Следующий рост script-покрытия — это NPC optional dialogue, extra room conversations и дальнейшее приближение к полному original script.',
  '',
];

writeFileSync(new URL('../SCRIPT_AUDIT.md', import.meta.url), `${lines.join('\n')}\n`, 'utf8');
console.log('SCRIPT_AUDIT.md regenerated.');
