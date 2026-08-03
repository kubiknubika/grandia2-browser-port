import { readFileSync, writeFileSync } from 'node:fs';
import { ACTION_LIBRARY } from '../src/entities/combat.js';
import { ITEM_CATALOG, EQUIPMENT_CATALOG, SHOP_CATALOG } from '../src/world_map.js';
import { MANA_EGGS } from '../src/mana_eggs.js';
import { NPC_DIALOGUES } from '../src/npc_dialogue.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
const campaignPanels = ids.filter((id) => id.startsWith('campaign-'));
const debugPanels = ids.filter((id) => id.startsWith('debug-') || id.startsWith('replay-') || id.startsWith('compare-'));
const parityPanels = ids.filter((id) => id.startsWith('mp-'));

const lines = [
  '# MENU_AUDIT',
  '',
  'Этот файл фиксирует текущее состояние **menu parity pass** относительно оригинальной Grandia II.',
  '',
  '## Что уже есть',
  '',
  `- Top-level sections: menu-screen, play-section, campaign-section, debug-section, compare-section, menu-parity-section.`,
  `- Всего HTML ids / menu nodes: **${ids.length}**.`,
  `- Campaign-related menu nodes: **${campaignPanels.length}**.`,
  `- Debug / replay / compare menu nodes: **${debugPanels.length}**.`,
  `- Menu-parity (original-like screens) menu nodes: **${parityPanels.length}**.`,
  `- Боевых actions, которые теперь могут быть показаны в command menus и handbooks: **${Object.keys(ACTION_LIBRARY).length}**.`,
  `- Inventory item catalog для menu/item layer: **${ITEM_CATALOG.length}**.`,
  `- Shop catalog: **${SHOP_CATALOG.length}**.`,
  `- Equipment catalog: **${EQUIPMENT_CATALOG.length}**.`,
  `- Mana Egg catalog: **${MANA_EGGS.length}**.`,
  `- Optional NPC dialogue entries: **${NPC_DIALOGUES.length}**.`,
  '',
  '## Усиления текущего menu parity pass',
  '',
  '- Командное меню боя больше не держится только на старом коротком наборе навыков: оно уже умеет показывать расширенный боевой roster.',
  '- В campaign UI теперь есть отдельные handbook-панели для **skills/magic** и **items/field menu**.',
  '- В campaign UI уже есть отдельные панели для growth, equipment, quests, bestiary, audit и original flow — это сильнее приближает проект к multi-menu feeling оригинальной JRPG.',
  '- Фильтр решений по actions теперь может динамически покрывать весь текущий ACTION_LIBRARY, а не только вручную вписанный короткий список.',
  '- Появился отдельный **menu parity tab** с original-like экранами:',
  '  - hero/status screen с портретами, статами, слотами экипировки и состоянием партии;',
  '  - skill screen с группировкой действий каждого героя по категориям;',
  '  - magic egg screen со всеми 8 каноничными Mana Eggs, уровнями изучения и MC-ценами;',
  '  - item/bag/equipment screen с каталогами расходников, магазинов и экипировки;',
  '  - bestiary encyclopedia screen с портретами, статами, сопротивлениями, регионами и drop tables;',
  '  - options/config screen с сохранением настроек в localStorage.',
  '',
  '## Что ещё не 1:1 к оригинальной Grandia II',
  '',
  '- Экраны menu parity реализованы как функциональные лабы, но не являются покадровой консольной репликой оригинальных меню (нет консольного курсора/анимаций перелистывания).',
  '- Нет полного original-like дерева навыков с попарным превью до/после покупки уровня.',
  '- Нет полного консольного flow экипировки с мини-анимациями и точной раскладкой оригинала.',
  '- Нет отдельного configuration/options screen parity с полным набором оригинальных опций (имя, звук, скорость текста и т.д.).',
  '',
  '## Честный вывод',
  '',
  '- **Menu parity pass начат серьёзно и теперь включает отдельные original-like screens для status/skills/magic eggs/items/bestiary/config.**',
  '- **Полная консольная 1:1 parity оригинальной Grandia II всё ещё не достигнута** (нет точной консольной навигации и полного набора опций), но системный каркас меню закрыт.',
  '- Следующий логичный шаг — консольная навигация (курсор/страницы) и точная раскладка оригинальных экранов поверх уже готовых данных.',
  '',
];

writeFileSync(new URL('../MENU_AUDIT.md', import.meta.url), `${lines.join('\n')}\n`, 'utf8');
console.log('MENU_AUDIT.md regenerated.');
