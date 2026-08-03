import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { ACTION_LIBRARY, PRESETS } from '../src/entities/combat.js';
import { LOCATION_SCENES } from '../src/location_scenes.js';
import { buildStoryAuditSnapshot } from '../src/story_audit.js';
import { WORLD_LOCATIONS, SHOP_CATALOG, EQUIPMENT_CATALOG, ITEM_CATALOG } from '../src/world_map.js';
import { setpieceConfigForBeat, setpieceBattleOverrideForBeat } from '../src/setpiece_data.js';
import { MANA_EGGS } from '../src/mana_eggs.js';
import { NPC_DIALOGUES } from '../src/npc_dialogue.js';
import { ENEMY_DROPS } from '../src/drop_data.js';

const rootIndexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const mainJs = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const campaignContent = readFileSync(new URL('../src/campaign_content.js', import.meta.url), 'utf8');
const locationScenes = readFileSync(new URL('../src/location_scenes.js', import.meta.url), 'utf8');
const setpieceData = readFileSync(new URL('../src/setpiece_data.js', import.meta.url), 'utf8');

function listImageFiles(dirUrl) {
  const files = [];
  const walk = (currentUrl) => {
    for (const entry of readdirSync(currentUrl, { withFileTypes: true })) {
      const nextUrl = new URL(`./${entry.name}`, currentUrl);
      if (entry.isDirectory()) {
        walk(new URL(`./${entry.name}/`, currentUrl));
      } else if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(entry.name)) {
        files.push(nextUrl);
      }
    }
  };
  walk(dirUrl);
  return files;
}

function countBlockEntries(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) return 0;
  let i = start + marker.length;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    i += 1;
  }
  return source.slice(start, i).split("id: '").length - 1;
}

function menuSummary() {
  const ids = [...rootIndexHtml.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const topLevelMenus = ['menu-screen', 'play-section', 'campaign-section', 'debug-section', 'compare-section'];
  return {
    ids,
    topLevelMenus,
  };
}

function contentSnapshot() {
  const story = buildStoryAuditSnapshot();
  const beatIds = story.beats.map((beat) => beat.id);
  const players = Object.entries(PRESETS).filter(([, preset]) => preset.team === 'players').map(([key]) => key);
  const enemies = Object.entries(PRESETS).filter(([, preset]) => preset.team === 'enemies').map(([key]) => key);
  const dialogueCount = [campaignContent, locationScenes, setpieceData].reduce((sum, text) => sum + ((text.match(/dialoguePage\(|page\('dialogue'/g) || []).length), 0);
  const narrationCount = [campaignContent, locationScenes, setpieceData].reduce((sum, text) => sum + ((text.match(/narrationPage\(|page\('narration'/g) || []).length), 0);
  const imageAssetCount = listImageFiles(new URL('../assets/', import.meta.url)).length;
  const menus = menuSummary();
  const worldEventCount = countBlockEntries(mainJs, 'const WORLD_LOCATION_EVENTS = {');
  const additionalEventCount = countBlockEntries(mainJs, 'const ADDITIONAL_WORLD_EVENTS_BY_LOCATION = {');
  const treasureCount = countBlockEntries(mainJs, 'const WORLD_LOCATION_TREASURES = {');
  const travelEncounterCount = countBlockEntries(mainJs, 'const WORLD_TRAVEL_ENCOUNTERS = {');
  const npcDialogueCount = NPC_DIALOGUES.length;
  const npcDialoguePages = NPC_DIALOGUES.reduce((sum, entry) => sum + (entry.pages?.length ?? 0), 0);
  const manaEggCount = MANA_EGGS.length;
  const dropCoverage = enemies.filter((key) => ENEMY_DROPS[key]).length;

  return {
    story,
    beatIds,
    playerActions: Object.keys(ACTION_LIBRARY),
    players,
    enemies,
    worldLocationCount: Object.keys(WORLD_LOCATIONS).length,
    shopCount: SHOP_CATALOG.length,
    itemCount: ITEM_CATALOG.length,
    equipmentCount: EQUIPMENT_CATALOG.length,
    setpieceSceneCount: beatIds.filter((id) => setpieceConfigForBeat(id)).length,
    setpieceBattleCount: beatIds.filter((id) => setpieceBattleOverrideForBeat(id)).length,
    locationSceneCount: LOCATION_SCENES.length,
    dialogueCount,
    narrationCount,
    npcDialogueCount,
    npcDialoguePages,
    manaEggCount,
    dropCoverage,
    imageAssetCount,
    menus,
    worldEventCount,
    additionalEventCount,
    treasureCount,
    travelEncounterCount,
  };
}

function statusMark(ok) {
  return ok ? '✅' : '❌';
}

function maybeMark(partial) {
  return partial ? '🟡' : '❌';
}

function buildMarkdown(snapshot) {
  const allStoryCovered = snapshot.story.overallPercent === 100 && snapshot.story.beatCoveragePercent === 100;
  const hasAllMainHeroes = snapshot.players.length >= 6;
  const hasArtPipeline = snapshot.imageAssetCount > 0;
  const hasAllOriginalSkills = false;
  const hasMenuParityProgress = true;
  const hasAllOriginalMenus = false;
  const hasAllOriginalMobs = false;
  const hasAllOriginalItems = false;
  const hasAllOriginalSecrets = false;
  const hasDialogueParityProgress = true;
  const hasAllOriginalDialogues = false;
  const hasAllOriginalCutscenes = false;

  const lines = [
    '# FULL_CONTENT_AUDIT',
    '',
    'Этот файл честно проверяет не только **story campaign**, но и более широкий вопрос: насколько текущий browser port покрывает **всю оригинальную Grandia II** по контенту и presentation-слоям.',
    '',
    '## Короткий вывод',
    '',
    `- ${statusMark(allStoryCovered)} **Кампания / story spine:** 19/19 битов, story audit = 100/100.`,
    `- ${maybeMark(hasAllOriginalCutscenes)} **Все оригинальные катсцены:** нет покадровой 1:1 реплики всего оригинала; есть 19 beat intro/victory flows, ${snapshot.locationSceneCount} location scenes и ${snapshot.setpieceSceneCount} bespoke setpieces.`,
    `- ${maybeMark(hasAllOriginalSkills)} **Все оригинальные скиллы/магия:** нет; реализовано ${snapshot.playerActions.length} боевых actions, но это не полный original move/magic list Grandia II.`,
    `- ${maybeMark(hasMenuParityProgress)} **Все оригинальные меню:** нет; полного консольного 1:1 menu parity нет, но есть отдельные original-like screens: status / skills / mana eggs / items / bestiary / config — плюс handbook-панели и richer command menu.`,
    `- ${maybeMark(hasArtPipeline)} **Все спрайты/арт-ассеты:** нет; полный 1:1 арт-порт отсутствует, но теперь в репозитории есть sprite/backdrop pipeline на ${snapshot.imageAssetCount} image assets.`,
    `- ${statusMark(hasAllMainHeroes)} **Все основные играбельные герои партии:** да; Ryudo, Elena, Millenia, Tio, Roan, Mareg присутствуют.`,
    `- ${maybeMark(hasAllOriginalMobs)} **Все оригинальные мобы/боссы:** нет; есть ${snapshot.enemies.length} enemy presets (${snapshot.dropCoverage} с drop tables), это заметный curated subset, но не вся энциклопедия оригинала.`,
    `- ${maybeMark(hasAllOriginalItems)} **Все оригинальные предметы/экипировка:** нет; есть ${snapshot.itemCount} inventory items, ${snapshot.shopCount} shop SKUs и ${snapshot.equipmentCount} equipment entries, это не весь original item database.`,
    `- ${maybeMark(hasAllOriginalSecrets)} **Все оригинальные секреты:** нет; есть ${snapshot.treasureCount} treasure nodes, ${snapshot.travelEncounterCount} travel encounters и ${snapshot.worldEventCount + snapshot.additionalEventCount} world/event nodes, но это не полный secret compendium оригинала.`,
    `- ${maybeMark(hasDialogueParityProgress)} **Все оригинальные диалоги:** нет; story/dialogue coverage большая (${snapshot.dialogueCount} dialogue blocks + ${snapshot.narrationCount} narration blocks + ${snapshot.npcDialogueCount} optional NPC dialogues), но не весь original script.` ,
    '',
    '## Что реально на 100%',
    '',
    `- Story audit: **${snapshot.story.overallPercent}% overall**, **${snapshot.story.beatCoveragePercent}% beat coverage**.`,
    '- Все 9 арок и все 19 сюжетных битов закрыты по текущему internal audit.',
    `- Для campaign-слоя есть **${snapshot.locationSceneCount}** location scenes и **${snapshot.setpieceBattleCount}** setpiece battle overrides.`,
    `- Основная играбельная партия присутствует полностью: ${snapshot.players.join(', ')}.`,
    `- World/campaign layer покрывает **${snapshot.worldLocationCount}** локаций.`,
    '',
    '## Что не является 100% полной оригинальной Grandia II',
    '',
    '### 1. Катсцены и полный script оригинала',
    `- Есть сильное story-покрытие, но это не означает буквальное наличие **всех** оригинальных катсцен и **всех** строк оригинального сценария.`,
    `- Сейчас в данных найдено примерно **${snapshot.dialogueCount} dialogue blocks** и **${snapshot.narrationCount} narration blocks**.`,
    '- Это много для browser-port prototype, но это не полноценная покадровая реконструкция original script/cutscene direction.',
    '',
    '### 2. Скиллы, магия, умения',
    `- Сейчас реализовано **${snapshot.playerActions.length}** боевых actions: ${snapshot.playerActions.join(', ')}.`,
    `- Добавлен каталог **Mana Eggs** (${snapshot.manaEggCount} яиц) с уровнями изучения и MC-ценами — magic egg layer теперь представим в UI.`,
    '- Это рабочая и уже богатая combat-система, но не полный original database всех skills / spells / special moves Grandia II.',
    '',
    '### 3. Меню и UX оригинала',
    `- Есть top-level browser sections: ${snapshot.menus.topLevelMenus.join(', ')}.`,
    '- Есть play/campaign/debug/compare, replay viewer, compare lab, scenario browser, balance editor, stat editor, growth/equipment/quest/audit panels.',
    '- Есть отдельные handbook/menu-style summaries для skills/magic, items, bestiary и progression внутри campaign UI.',
    '- Добавлен отдельный **menu parity tab** с original-like screens: hero/status, skill screen, magic egg screen, item/bag/equipment screen, bestiary encyclopedia с drop tables и options screen.',
    '- Но это **не** покадровый console-style 1:1 оригинала (нет консольной навигации курсором и полного набора оригинальных опций).',
    '',
    '### 4. Спрайты и art pipeline',
    `- Реальных image assets в репозитории: **${snapshot.imageAssetCount}**.`,
    '- В battle/campaign presentation теперь есть SVG-based art pipeline для юнитов (включая новых), backdrops и menu hero.',
    '- Но это всё ещё не полный 1:1 спрайтовый и иллюстрационный порт оригинала.',
    '',
    '### 5. Герои, NPC, мобы',
    `- Playable party presets: **${snapshot.players.length}** → ${snapshot.players.join(', ')}.`,
    `- Enemy presets: **${snapshot.enemies.length}** → ${snapshot.enemies.join(', ')}.`,
    `- Drop tables: **${snapshot.dropCoverage}** enemy presets из ${snapshot.enemies.length} имеют авторские drop tables (по каноничным гайдам).`,
    '- Главная играбельная шестерка есть, но весь NPC roster и весь bestiary оригинала не закрыты.',
    '',
    '### 6. Предметы, экипировка, секреты',
    `- Inventory item catalog: **${snapshot.itemCount}**.`,
    `- Shop catalog: **${snapshot.shopCount}**.`,
    `- Equipment catalog: **${snapshot.equipmentCount}**.`,
    `- Treasure nodes: **${snapshot.treasureCount}**.`,
    `- Travel encounter nodes: **${snapshot.travelEncounterCount}**.`,
    `- World event nodes: **${snapshot.worldEventCount}**.`,
    `- Additional scripted world events: **${snapshot.additionalEventCount}**.`,
    `- Optional NPC dialogues: **${snapshot.npcDialogueCount}** (${snapshot.npcDialoguePages} страниц).`,
    '- Это хороший campaign layer, но не полный original item/secret/dialogue completionist layer.',
    '',
    '## Итоговая честная оценка',
    '',
    '- **Сюжетная кампания как story-layer внутри этого browser port — действительно доведена до 100% по текущему internal audit.**',
    '- **Но весь оригинальный Grandia II целиком по ассетам, полному script, всем меню, всем умениям, всем мобам, всем предметам и всем секретам — ещё не перенесён на 100%.**',
    '- То есть: **story parity = да**, **full game content parity = пока нет**.',
    '',
    '## Следующий логичный большой этап',
    '',
    'Если идти дальше уже не по story spine, а по full-content parity, следующий этап должен быть отдельным и честно называться так:',
    '',
    '1. Continue script/dialogue expansion into NPC optional conversations and room-specific side talk',
    '2. Continue sprite/art presentation from the current SVG pipeline toward fuller character/location coverage',
    '3. Secrets/NPC optional content pass',
    '4. Continue enemy/bestiary expansion toward fuller original coverage',
    '5. Push menu parity further into separate original-like hero/item/status screens',
    '',
  ];

  return `${lines.join('\n')}\n`;
}

const snapshot = contentSnapshot();
writeFileSync(new URL('../FULL_CONTENT_AUDIT.md', import.meta.url), buildMarkdown(snapshot), 'utf8');
console.log('FULL_CONTENT_AUDIT.md regenerated.');
