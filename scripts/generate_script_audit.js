import { writeFileSync } from 'node:fs';
import { buildCampaignScriptAuditSnapshot } from '../src/campaign_content.js';
import { NPC_DIALOGUES } from '../src/npc_dialogue.js';

const snapshot = buildCampaignScriptAuditSnapshot();
const npcDialogues = NPC_DIALOGUES;
const npcPages = npcDialogues.reduce((sum, entry) => sum + (entry.pages?.length ?? 0), 0);
const npcDialogueBlocks = npcDialogues.reduce((sum, entry) => sum + (entry.pages ?? []).filter((page) => page.speaker).length, 0);
const byLocation = new Map();
for (const entry of npcDialogues) {
  if (!byLocation.has(entry.locationId)) byLocation.set(entry.locationId, []);
  byLocation.get(entry.locationId).push(entry);
}

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
  `- Optional NPC dialogues: **${npcDialogues.length}**`,
  `- NPC dialogue pages: **${npcPages}**`,
  `- NPC dialogue blocks: **${npcDialogueBlocks}**`,
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
  '## Optional NPC dialogue layer',
  '',
  ...[...byLocation.entries()].flatMap(([locationId, entries]) => [
    `### ${locationId}`,
    ...entries.map((entry) => `- ${entry.label} (${entry.pages?.length ?? 0} стр., ${(entry.pages ?? []).filter((page) => page.speaker).length} реплик)`),
    '',
  ]),
  '## Вывод',
  '',
  '- Beat script layer заметно плотнее, чем раньше: у каждого бита теперь есть не только базовый intro/result, но и дополнительный character banter layer.',
  '- Отдельный optional NPC dialogue слой закрывает разговоры в комнатах, городах и данжах: room-specific side talk больше не отсутствует.',
  '- Это всё ещё не полный 1:1 перенос всего оригинального сценария Grandia II, но script/dialogue coverage теперь включает и необязательные ветки.',
  '',
];

writeFileSync(new URL('../SCRIPT_AUDIT.md', import.meta.url), `${lines.join('\n')}\n`, 'utf8');
console.log('SCRIPT_AUDIT.md regenerated.');
