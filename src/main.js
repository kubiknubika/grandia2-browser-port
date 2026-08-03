import {
  ACT_POINT,
  ACTION_LIBRARY,
  COM_START,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  IP_MAX,
  PRESETS,
  advanceBattle,
  analyzeActionChoice,
  battleWinner,
  createDefaultBattle,
  createManualPlayerController,
  describeFighter,
  exportBattleLog,
  getAwaitingInput,
  isBattleOver,
  queueManualAction,
} from './entities/combat.js';
import {
  DEFAULT_BALANCE_VECTOR,
  DEFAULT_VETERAN_WEIGHTS,
  createNoviceController,
  createSeededRng,
  createWeightedPlayerController,
  evaluatePlayerController,
  trainVeteranBot,
  vectorToBalanceProfile,
} from './entities/balance.js';
import {
  buildBeatDefeatPages,
  buildBeatIntroPages,
  buildBeatVictoryPages,
  buildCampaignEndingPages,
  buildCampaignIntroPages,
  buildCampaignScriptAuditSnapshot,
  buildPlaceholderResolutionPages,
  campaignBeatReward,
  summarizeCampaignScene,
} from './campaign_content.js';
import {
  setpieceBattleOverrideForBeat,
  setpieceConfigForBeat,
} from './setpiece_data.js';
import {
  buildStoryAuditSnapshot,
} from './story_audit.js';
import {
  getOriginalFlowForBeat,
} from './original_flow.js';
import {
  locationScenesForBeatAndLocation,
} from './location_scenes.js';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_STOCK_BY_LOCATION,
  ITEM_CATALOG,
  LOCATION_SCENE_LAYOUTS,
  SHOP_CATALOG,
  getAccessibleLocationIdsForBeat,
  getBeatWorldBinding,
  getShopEntriesForLocation,
  getVisibleExitsForBeat,
  getWorldChapterByBeatId,
  getWorldLocation,
  isLocationOpenForBeat,
  listMajorLocationsForBeat,
} from './world_map.js';
import {
  resolveDungeonStageChain,
  resolveLocationStateProfile,
} from './world_states.js';
import {
  buildBestiaryGroupSnapshot,
} from './bestiary_data.js';
import {
  NPC_DIALOGUES,
  npcDialoguesForLocation,
} from './npc_dialogue.js';
import {
  MANA_EGGS,
} from './mana_eggs.js';
import {
  EGG_LEVEL_COSTS,
  isMagicLevelable,
  isMoveLevelable,
  magicLevelCosts,
  moveLevelCosts,
} from './action_levels.js';
import {
  dropEntriesForPresetKey,
} from './drop_data.js';
import {
  ALL_ART_PATHS,
  battlefieldArtPath,
  campaignBackdropPathForLocation,
  unitArtPathForFighter,
} from './art_assets.js';

const manualPlayerController = createManualPlayerController();
const UNIT_KEYS = ['ryudo', 'elena', 'roan', 'mareg', 'tio', 'millenia', 'troglodyte', 'wingEye', 'mottledSpider', 'guardian', 'durhamMinotaur', 'tongueValmar', 'clawsValmar', 'heartValmar', 'zeraAvatar'];
const UNIT_POSITIONS = {
  ryudo: { x: 280, y: 70 },
  elena: { x: 280, y: 125 },
  roan: { x: 280, y: 180 },
  mareg: { x: 280, y: 235 },
  tio: { x: 280, y: 290 },
  millenia: { x: 280, y: 335 },
  troglodyte: { x: 680, y: 80 },
  wingEye: { x: 670, y: 150 },
  mottledSpider: { x: 680, y: 220 },
  guardian: { x: 700, y: 300 },
  durhamMinotaur: { x: 730, y: 210 },
  tongueValmar: { x: 730, y: 210 },
  clawsValmar: { x: 730, y: 210 },
  heartValmar: { x: 730, y: 210 },
  zeraAvatar: { x: 730, y: 210 },
  eyeOfValmar: { x: 730, y: 210 },
  crimsonTails: { x: 730, y: 210 },
  nagaQueens: { x: 730, y: 210 },
  dualFists: { x: 730, y: 210 },
  birthplaceGuardian: { x: 730, y: 210 },
  eggGuardian: { x: 730, y: 210 },
  finalValmar: { x: 730, y: 210 },
};
const STAT_FIELDS = ['maxHp', 'startSp', 'startMp', 'str', 'vit', 'agi', 'spd', 'mag', 'men'];

function clonePreset(key) {
  return JSON.parse(JSON.stringify(PRESETS[key]));
}

function cloneWeights(weights) {
  return JSON.parse(JSON.stringify(weights));
}

function cloneVector(vector) {
  return JSON.parse(JSON.stringify(vector));
}

function createDefaultUnitFormState() {
  const result = {};
  for (const key of UNIT_KEYS) {
    const preset = PRESETS[key];
    result[key] = {};
    for (const field of STAT_FIELDS) {
      result[key][field] = preset[field];
    }
  }
  return result;
}

const CAMPAIGN_PLAYABLE_UNITS = ['ryudo', 'elena', 'roan', 'mareg', 'tio', 'millenia'];
const STORY_BATTLE_PARTY_OVERRIDES = {
  liligue_and_mareg: ['ryudo', 'elena', 'mareg', 'millenia'],
  st_heim_zera: ['ryudo', 'elena', 'roan', 'mareg'],
  cyrum_and_claws: ['ryudo', 'elena', 'tio', 'roan'],
  garlan_return: ['ryudo', 'elena', 'mareg', 'tio'],
  melfice_duel: ['ryudo', 'elena', 'mareg', 'tio'],
  nanan_and_cyclone: ['ryudo', 'elena', 'mareg', 'tio'],
  granasaber_ship: ['ryudo', 'elena', 'mareg', 'tio'],
  cathedral_massacre: ['ryudo', 'elena', 'mareg', 'tio'],
  zera_revealed: ['ryudo', 'mareg', 'tio', 'millenia'],
  moon_assault: ['ryudo', 'elena', 'mareg', 'tio'],
  cyrum_defense: ['ryudo', 'elena', 'roan', 'tio'],
  birthplace_descent: ['ryudo', 'elena', 'roan', 'tio'],
  zera_inside_valmar: ['ryudo', 'elena', 'roan', 'tio'],
  true_finale: ['ryudo', 'elena', 'millenia'],
};

function createDefaultCampaignRoster() {
  return Object.fromEntries(CAMPAIGN_PLAYABLE_UNITS.map((key) => {
    const preset = PRESETS[key];
    return [key, {
      key,
      hp: Number(preset.maxHp ?? 1),
      sp: Number(preset.startSp ?? 0),
      mp: Number(preset.startMp ?? 0),
      available: key === 'ryudo' || key === 'elena',
    }];
  }));
}

function createDefaultEquipmentLoadout() {
  return Object.fromEntries(CAMPAIGN_PLAYABLE_UNITS.map((key) => [key, { weapon: null, armor: null, accessory: null }]));
}

function cloneCampaignRoster(roster) {
  return JSON.parse(JSON.stringify(roster ?? createDefaultCampaignRoster()));
}

function cloneCampaignEquipmentLoadout(loadout) {
  return JSON.parse(JSON.stringify(loadout ?? createDefaultEquipmentLoadout()));
}

function createBaseInventory(seed = {}) {
  const bag = Object.fromEntries(ITEM_CATALOG.map((item) => [item.key, 0]));
  for (const item of ITEM_CATALOG) {
    if (item.key in (seed ?? {})) {
      bag[item.key] = Math.max(0, Number(seed[item.key] ?? 0));
    }
  }
  return bag;
}

const DEFAULT_CAMPAIGN_INVENTORY = createBaseInventory({ medicinalHerb: 3, antidote: 2, woundSalve: 1 });

function inventoryLabel(key) {
  return ITEM_CATALOG.find((item) => item.key === key)?.label ?? key;
}

function inventoryEntries(inventory = {}) {
  return Object.entries(createBaseInventory(inventory))
    .map(([key, value]) => [key, Number(value ?? 0)])
    .filter(([, value]) => value > 0);
}

function actionDefinitionById(actionId) {
  return ACTION_LIBRARY[actionId] ?? null;
}

function loadoutActionIds(loadout = {}) {
  return [...new Set([
    loadout.cancelMove,
    ...(loadout.cancelMoves ?? []),
    loadout.lineMove,
    ...(loadout.lineMoves ?? []),
    loadout.aoeMove,
    ...(loadout.aoeMoves ?? []),
    loadout.singleMove,
    ...(loadout.singleMoves ?? []),
    loadout.healMagic,
    ...(loadout.healMagics ?? []),
    loadout.offensiveMagic,
    ...(loadout.offensiveMagics ?? []),
    loadout.statusMove,
    ...(loadout.statusMoves ?? []),
    ...(loadout.supportMagics ?? []),
    ...(loadout.debuffMagics ?? []),
  ].filter(Boolean))];
}

function handbookGroupLabelForAction(definition) {
  if (!definition) {
    return 'Other';
  }
  if (definition.commandType === 'item') {
    return 'Items';
  }
  if (definition.commandType === 'defense' || definition.commandType === 'basic') {
    return 'Core';
  }
  if (definition.targeting === 'all-allies' || definition.targeting === 'single-ally') {
    if (definition.revive || definition.powerBase || definition.healBase || (definition.cureStatuses ?? []).length) {
      return 'Healing / recovery';
    }
    return 'Party support';
  }
  if ((definition.statShifts ?? []).some((shift) => shift.amount < 0) || (definition.statusEffects ?? []).length) {
    return 'Control / debuff';
  }
  if (definition.targeting === 'line') {
    return 'Line / formation';
  }
  if (definition.targeting === 'all-enemies') {
    return 'Area offense';
  }
  if (definition.kind === 'magic') {
    return 'Offensive magic';
  }
  return 'Single-target offense';
}

function groupedActionDefinitions(actionIds = []) {
  const groups = new Map();
  for (const actionId of actionIds) {
    const definition = actionDefinitionById(actionId);
    if (!definition) continue;
    const label = handbookGroupLabelForAction(definition);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(definition);
  }
  return [...groups.entries()].map(([label, defs]) => ({
    label,
    definitions: defs.sort((a, b) => a.label.localeCompare(b.label, 'ru')),
  }));
}

function populateDecisionActionFilterOptions() {
  if (!elements.decisionFilterAction) {
    return;
  }
  const currentValue = elements.decisionFilterAction.value || 'all';
  const labels = [...new Set(Object.values(ACTION_LIBRARY).map((definition) => definition.label))].sort((a, b) => a.localeCompare(b, 'ru'));
  elements.decisionFilterAction.innerHTML = [
    '<option value="all">all</option>',
    ...labels.map((label) => `<option value="${label}">${label}</option>`),
  ].join('');
  elements.decisionFilterAction.value = labels.includes(currentValue) ? currentValue : 'all';
}

function createEmptyCampaignRun() {
  return {
    version: 2,
    active: false,
    finished: false,
    runId: null,
    startedAt: null,
    currentBeatIndex: 0,
    currentBeatId: null,
    phase: 'overview',
    sceneIndex: 0,
    completedBeatIds: [],
    battleAttempts: {},
    inventory: createBaseInventory(DEFAULT_CAMPAIGN_INVENTORY),
    gold: 180,
    experience: 0,
    partyLevel: 1,
    skillCoins: 0,
    magicCoins: 0,
    questFlags: {},
    growthUnlockIds: [],
    activeLocationSceneId: null,
    seenLocationSceneIds: [],
    seenNpcDialogueIds: [],
    actionLevels: {},
    eggLoadout: {
      ryudo: null,
      elena: 'holy_egg',
      tio: null,
      roan: null,
      mareg: null,
      millenia: 'chaos_egg',
    },
    eggLevels: {},
    ownedEggIds: [],
    roster: createDefaultCampaignRoster(),
    equipmentLoadout: createDefaultEquipmentLoadout(),
    journal: [],
    checkpointInventory: createBaseInventory(DEFAULT_CAMPAIGN_INVENTORY),
    checkpointGold: 180,
    checkpointRoster: createDefaultCampaignRoster(),
    checkpointEquipmentLoadout: createDefaultEquipmentLoadout(),
    pendingReward: { gold: 0, ...createBaseInventory() },
    currentLocationId: null,
    visitedLocationIds: [],
    locationHistory: [],
    seenWorldEventIds: [],
    openedTreasureIds: [],
    clearedTravelEncounterIds: [],
    purchasedUpgradeIds: [],
    pendingTravelFromLocationId: null,
    pendingTravelToLocationId: null,
    battleContext: null,
    travelMessage: null,
    lastBattleWinner: null,
    lastResultSummary: null,
    selectedDifficulty: 'novice',
    autoSceneAdvanceReady: false,
  };
}

const ENCOUNTER_TEMPLATES = {
  duel2v2: {
    label: 'Duel 2v2',
    description: 'Базовый бой Ryudo + Elena против Troglodyte + Wing Eye.',
    players: ['ryudo', 'elena'],
    enemies: ['troglodyte', 'wingEye'],
  },
  skirmish3v3: {
    label: 'Skirmish 3v3',
    description: 'Ryudo + Elena + Tio против Troglodyte + Wing Eye + Mottled Spider.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['troglodyte', 'wingEye', 'mottledSpider'],
  },
  miniBossSolo: {
    label: 'Mini-boss solo',
    description: 'Партия против Durham Minotaur.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['durhamMinotaur'],
  },
  miniBossEscort: {
    label: 'Mini-boss escort',
    description: 'Durham Minotaur с поддержкой Wing Eye.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['durhamMinotaur', 'wingEye'],
  },
  miniBossSwarm: {
    label: 'Boss swarm test',
    description: 'Durham Minotaur с Wing Eye и Mottled Spider.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['durhamMinotaur', 'wingEye', 'mottledSpider'],
  },
  fullParty4v4: {
    label: 'Full party 4v4',
    description: 'Ryudo + Elena + Tio + Millenia против Guardian-лид состава.',
    players: ['ryudo', 'elena', 'tio', 'millenia'],
    enemies: ['guardian', 'wingEye', 'troglodyte', 'mottledSpider'],
  },
  guardianTrial: {
    label: 'Guardian trial',
    description: 'Партия против Guardian с поддержкой Wing Eye.',
    players: ['ryudo', 'elena', 'tio', 'millenia'],
    enemies: ['guardian', 'wingEye'],
  },
  tongueValmarBoss: {
    label: 'Tongue of Valmar',
    description: 'Сюжетный corrupted boss в храмовых руинах.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['tongueValmar'],
  },
  clawsValmarBoss: {
    label: 'Claws of Valmar',
    description: 'Быстрый pressure boss из техно-арки Цайрума.',
    players: ['ryudo', 'elena', 'tio'],
    enemies: ['clawsValmar'],
  },
  heartValmarBoss: {
    label: 'Heart of Valmar',
    description: 'Поздний сюжетный boss под День Тьмы.',
    players: ['ryudo', 'elena', 'tio', 'millenia'],
    enemies: ['heartValmar', 'wingEye'],
  },
  zeraFinale: {
    label: 'Zera / New Valmar finale',
    description: 'Финальный scripted encounter против Зеры и поздней тьмы.',
    players: ['ryudo', 'elena', 'millenia'],
    enemies: ['zeraAvatar'],
  },
  eyeOfValmarBoss: {
    label: 'Eye of Valmar',
    description: 'Сюжетный босс Aira\'s Space: гравитационное око Вальмара.',
    players: ['ryudo', 'elena', 'roan', 'mareg'],
    enemies: ['eyeOfValmar'],
  },
  crimsonTailsBoss: {
    label: 'Crimson Tails',
    description: 'Двойной босс рифа Сесиль: две хвостовые сестры-охотницы.',
    players: ['ryudo', 'elena', 'roan', 'mareg'],
    enemies: ['crimsonTails'],
  },
  nagaQueensBoss: {
    label: 'Naga Queens',
    description: 'Королевы-наги из Demon\'s Law: молния, земля и ложная святость.',
    players: ['ryudo', 'elena', 'mareg', 'tio'],
    enemies: ['nagaQueens'],
  },
  dualFistsBoss: {
    label: 'Dual Fists',
    description: 'Суб-босс Birthplace: два кулака древнего стража.',
    players: ['ryudo', 'elena', 'roan', 'tio'],
    enemies: ['dualFists'],
  },
  birthplaceGuardianBoss: {
    label: 'Birthplace Guardians',
    description: 'Древние стражи Истока богов: пара архивных стражей.',
    players: ['ryudo', 'elena', 'roan', 'tio'],
    enemies: ['birthplaceGuardian', 'birthplaceGuardian'],
  },
  eggGuardianBoss: {
    label: 'Egg Guardian',
    description: 'Финальный страж Нового Вальмара с выводком битов.',
    players: ['ryudo', 'elena', 'millenia'],
    enemies: ['eggGuardian'],
  },
  finalValmarBoss: {
    label: 'Final Valmar',
    description: 'Полноценный финальный Вальмар: три фазы и ложные формы.',
    players: ['ryudo', 'elena', 'millenia'],
    enemies: ['finalValmar'],
  },
};

const SCENARIO_PRESETS = {
  starter: {
    label: 'Новичковый бой',
    description: 'Проще для человека: враги мягче, Elena лечит больше, враг по умолчанию novice.',
    encounterTemplate: 'duel2v2',
    battlefieldTheme: 'forest',
    playEnemyAi: 'novice',
    debugPlayerAi: 'novice',
    debugEnemyAi: 'novice',
    trainingStyle: 'safe',
    battleSeed: 1001,
    debugTrainingSeed: 1001,
    debugEvalCount: 100,
    enabledUnits: { tio: false, mottledSpider: false },
    unitOverrides: {
      ryudo: { maxHp: 360, startSp: 42, str: 43, vit: 28 },
      elena: { maxHp: 320, startMp: 50, mag: 36, men: 33 },
      troglodyte: { maxHp: 285, str: 31, vit: 20, agi: 19 },
      wingEye: { maxHp: 220, str: 26, agi: 22, spd: 24 },
    },
  },
  control: {
    label: 'Контрольный бой',
    description: 'Текущая базовая конфигурация vertical slice.',
    encounterTemplate: 'duel2v2',
    battlefieldTheme: 'cavern',
    playEnemyAi: 'novice',
    debugPlayerAi: 'novice',
    debugEnemyAi: 'novice',
    trainingStyle: 'balanced',
    battleSeed: 1337,
    debugTrainingSeed: 1337,
    debugEvalCount: 120,
    enabledUnits: { tio: false, mottledSpider: false },
    unitOverrides: createDefaultUnitFormState(),
  },
  'veteran-seed': {
    label: 'Ветеранский контрольный seed',
    description: 'Жёстче и быстрее враги, режим useful для проверки потолка veteran AI.',
    encounterTemplate: 'duel2v2',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 9001,
    debugTrainingSeed: 9001,
    debugEvalCount: 160,
    enabledUnits: { tio: false, mottledSpider: false },
    unitOverrides: {
      ryudo: { maxHp: 340, startSp: 34, str: 40, vit: 26, agi: 26, spd: 22, mag: 18, men: 18, startMp: 18 },
      elena: { maxHp: 300, startSp: 18, startMp: 42, str: 28, vit: 22, agi: 23, spd: 20, mag: 34, men: 31 },
      troglodyte: { maxHp: 345, str: 39, vit: 26, agi: 24, spd: 26, startSp: 30, startMp: 0, mag: 6, men: 12 },
      wingEye: { maxHp: 270, str: 33, vit: 19, agi: 27, spd: 30, startSp: 32, startMp: 0, mag: 10, men: 12 },
    },
  },
  'line-pressure': {
    label: 'Line pressure lab',
    description: 'Сценарий под проверку Evade/line-of-hit и Wing Slice.',
    encounterTemplate: 'duel2v2',
    battlefieldTheme: 'cavern',
    playEnemyAi: 'novice',
    debugPlayerAi: 'novice',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 4242,
    debugTrainingSeed: 4242,
    debugEvalCount: 120,
    enabledUnits: { tio: false, mottledSpider: false },
    unitOverrides: {
      ryudo: { maxHp: 330, startSp: 38, str: 40, vit: 25, agi: 26, spd: 22, mag: 18, men: 18, startMp: 18 },
      elena: { maxHp: 295, startSp: 18, startMp: 36, str: 28, vit: 22, agi: 24, spd: 20, mag: 32, men: 30 },
      troglodyte: { maxHp: 300, str: 35, vit: 23, agi: 22, spd: 24, startSp: 24, startMp: 0, mag: 6, men: 12 },
      wingEye: { maxHp: 255, str: 34, vit: 18, agi: 28, spd: 32, startSp: 36, startMp: 0, mag: 10, men: 12 },
    },
  },
  'party-skirmish': {
    label: 'Party skirmish 3v3',
    description: 'Добавляет Tio и Mottled Spider, чтобы тестировать расширенную партию и больше статусов.',
    encounterTemplate: 'skirmish3v3',
    battlefieldTheme: 'forest',
    playEnemyAi: 'novice',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 5150,
    debugTrainingSeed: 5150,
    debugEvalCount: 140,
    enabledUnits: { tio: true, mottledSpider: true, millenia: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      tio: { maxHp: 280, startSp: 24, startMp: 28, str: 26, vit: 20, agi: 30, spd: 28, mag: 30, men: 24 },
      mottledSpider: { maxHp: 230, startSp: 26, startMp: 0, str: 28, vit: 17, agi: 25, spd: 29, mag: 8, men: 10 },
    },
  },
  'full-party': {
    label: 'Full party 4v4',
    description: 'Полная партия с Millenia против состава во главе с Guardian.',
    encounterTemplate: 'fullParty4v4',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 8080,
    debugTrainingSeed: 8080,
    debugEvalCount: 140,
    enabledUnits: { tio: true, mottledSpider: true, millenia: true, guardian: true },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      tio: { maxHp: 280, startSp: 24, startMp: 28, str: 26, vit: 20, agi: 30, spd: 28, mag: 30, men: 24 },
      millenia: { maxHp: 290, startSp: 34, startMp: 24, str: 29, vit: 18, agi: 27, spd: 26, mag: 32, men: 20 },
      guardian: { maxHp: 620, startSp: 48, startMp: 0, str: 32, vit: 28, agi: 22, spd: 18, mag: 26, men: 20 },
      mottledSpider: { maxHp: 230, startSp: 26, startMp: 0, str: 28, vit: 17, agi: 25, spd: 29, mag: 8, men: 10 },
    },
  },
  'guardian-trial': {
    label: 'Guardian trial',
    description: 'Проверка партии против Guardian + Wing Eye.',
    encounterTemplate: 'guardianTrial',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 8282,
    debugTrainingSeed: 8282,
    debugEvalCount: 140,
    enabledUnits: { tio: true, mottledSpider: false, millenia: true, guardian: true },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      millenia: { maxHp: 290, startSp: 34, startMp: 24, str: 29, vit: 18, agi: 27, spd: 26, mag: 32, men: 20 },
      guardian: { maxHp: 620, startSp: 48, startMp: 0, str: 32, vit: 28, agi: 22, spd: 18, mag: 26, men: 20 },
    },
  },
  'miniboss-minotaur': {
    label: 'Mini-boss Durham Minotaur',
    description: 'Мини-босс шаблон: Durham Minotaur с тяжёлым уроном и линейным контролем.',
    encounterTemplate: 'miniBossSolo',
    battlefieldTheme: 'volcano',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6161,
    debugTrainingSeed: 6161,
    debugEvalCount: 120,
    enabledUnits: { tio: true, mottledSpider: false, millenia: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      tio: { maxHp: 280, startSp: 24, startMp: 28, str: 26, vit: 20, agi: 30, spd: 28, mag: 30, men: 24 },
      durhamMinotaur: { maxHp: 820, startSp: 52, startMp: 0, str: 46, vit: 30, agi: 20, spd: 22, mag: 6, men: 16 },
    },
  },
  'miniboss-escort': {
    label: 'Mini-boss escort',
    description: 'Durham Minotaur с Wing Eye: шаблон под мини-босс + adds.',
    encounterTemplate: 'miniBossEscort',
    battlefieldTheme: 'volcano',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 7171,
    debugTrainingSeed: 7171,
    debugEvalCount: 140,
    enabledUnits: { tio: true, mottledSpider: false, millenia: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      tio: { maxHp: 280, startSp: 24, startMp: 28, str: 26, vit: 20, agi: 30, spd: 28, mag: 30, men: 24 },
      durhamMinotaur: { maxHp: 820, startSp: 52, startMp: 0, str: 46, vit: 30, agi: 20, spd: 22, mag: 6, men: 16 },
      wingEye: { maxHp: 250, startSp: 34, startMp: 0, str: 32, vit: 18, agi: 26, spd: 29, mag: 10, men: 12 },
    },
  },
  'tongue-valmar': {
    label: 'Tongue of Valmar',
    description: 'Сюжетный corrupted boss для арки Liligue / храмовых руин.',
    encounterTemplate: 'tongueValmarBoss',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6262,
    debugTrainingSeed: 6262,
    debugEvalCount: 120,
    enabledUnits: { tio: true, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      tongueValmar: { maxHp: 560, startSp: 42, startMp: 0, str: 40, vit: 24, agi: 21, spd: 19, mag: 12, men: 18 },
    },
  },
  'claws-valmar': {
    label: 'Claws of Valmar',
    description: 'Сюжетный pressure boss для подземного завода и арки Тио.',
    encounterTemplate: 'clawsValmarBoss',
    battlefieldTheme: 'cavern',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6363,
    debugTrainingSeed: 6363,
    debugEvalCount: 120,
    enabledUnits: { tio: true, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      clawsValmar: { maxHp: 520, startSp: 44, startMp: 0, str: 38, vit: 22, agi: 29, spd: 30, mag: 10, men: 16 },
    },
  },
  'heart-valmar': {
    label: 'Heart of Valmar',
    description: 'Поздний сюжетный boss для Дня Тьмы и арки Селены.',
    encounterTemplate: 'heartValmarBoss',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6464,
    debugTrainingSeed: 6464,
    debugEvalCount: 140,
    enabledUnits: { tio: true, millenia: true, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      millenia: { maxHp: 290, startSp: 34, startMp: 24, str: 29, vit: 18, agi: 27, spd: 26, mag: 32, men: 20 },
      heartValmar: { maxHp: 760, startSp: 60, startMp: 0, str: 34, vit: 30, agi: 24, spd: 20, mag: 30, men: 22 },
    },
  },
  'zera-finale': {
    label: 'Zera / New Valmar finale',
    description: 'Финальный сюжетный бой против Зеры и поздней тьмы.',
    encounterTemplate: 'zeraFinale',
    battlefieldTheme: 'volcano',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6565,
    debugTrainingSeed: 6565,
    debugEvalCount: 160,
    enabledUnits: { tio: false, millenia: true, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      millenia: { maxHp: 290, startSp: 34, startMp: 24, str: 29, vit: 18, agi: 27, spd: 26, mag: 32, men: 20 },
      zeraAvatar: { maxHp: 880, startSp: 64, startMp: 0, str: 36, vit: 30, agi: 27, spd: 22, mag: 32, men: 24 },
    },
  },
  'eye-of-valmar': {
    label: 'Eye of Valmar',
    description: 'Гравитационное око Вальмара из Aira\'s Space.',
    encounterTemplate: 'eyeOfValmarBoss',
    battlefieldTheme: 'cavern',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6767,
    debugTrainingSeed: 6767,
    debugEvalCount: 140,
    enabledUnits: { tio: false, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      eyeOfValmar: { maxHp: 1400, startSp: 52, startMp: 34, str: 28, vit: 26, agi: 26, spd: 24, mag: 34, men: 26 },
    },
  },
  'crimson-tails': {
    label: 'Crimson Tails',
    description: 'Двойной босс рифа Сесиль.',
    encounterTemplate: 'crimsonTailsBoss',
    battlefieldTheme: 'forest',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6868,
    debugTrainingSeed: 6868,
    debugEvalCount: 140,
    enabledUnits: { tio: false, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      crimsonTails: { maxHp: 1300, startSp: 50, startMp: 0, str: 42, vit: 26, agi: 30, spd: 30, mag: 12, men: 18 },
    },
  },
  'naga-queens': {
    label: 'Naga Queens',
    description: 'Королевы-наги из Demon\'s Law.',
    encounterTemplate: 'nagaQueensBoss',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 6969,
    debugTrainingSeed: 6969,
    debugEvalCount: 160,
    enabledUnits: { tio: true, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      nagaQueens: { maxHp: 1700, startSp: 58, startMp: 34, str: 38, vit: 30, agi: 26, spd: 24, mag: 34, men: 28 },
    },
  },
  'dual-fists': {
    label: 'Dual Fists',
    description: 'Два кулака древнего стража Birthplace.',
    encounterTemplate: 'dualFistsBoss',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 7070,
    debugTrainingSeed: 7070,
    debugEvalCount: 140,
    enabledUnits: { tio: true, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      dualFists: { maxHp: 1600, startSp: 56, startMp: 0, str: 46, vit: 30, agi: 28, spd: 26, mag: 10, men: 20 },
    },
  },
  'birthplace-guardians': {
    label: 'Birthplace Guardians',
    description: 'Пара архивных стражей Истока богов.',
    encounterTemplate: 'birthplaceGuardianBoss',
    battlefieldTheme: 'ruins',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 7171,
    debugTrainingSeed: 7171,
    debugEvalCount: 140,
    enabledUnits: { tio: true, millenia: false, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      birthplaceGuardian: { maxHp: 1500, startSp: 54, startMp: 28, str: 40, vit: 32, agi: 24, spd: 22, mag: 30, men: 28 },
    },
  },
  'egg-guardian': {
    label: 'Egg Guardian',
    description: 'Финальный страж Нового Вальмара.',
    encounterTemplate: 'eggGuardianBoss',
    battlefieldTheme: 'volcano',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 7272,
    debugTrainingSeed: 7272,
    debugEvalCount: 160,
    enabledUnits: { tio: false, millenia: true, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      eggGuardian: { maxHp: 1900, startSp: 64, startMp: 38, str: 40, vit: 34, agi: 26, spd: 24, mag: 36, men: 30 },
    },
  },
  'final-valmar': {
    label: 'Final Valmar',
    description: 'Полноценный финальный бог: три фазы и ложные формы.',
    encounterTemplate: 'finalValmarBoss',
    battlefieldTheme: 'volcano',
    playEnemyAi: 'veteran',
    debugPlayerAi: 'veteran',
    debugEnemyAi: 'veteran',
    trainingStyle: 'control',
    battleSeed: 7373,
    debugTrainingSeed: 7373,
    debugEvalCount: 160,
    enabledUnits: { tio: false, millenia: true, mottledSpider: false, guardian: false },
    unitOverrides: {
      ...createDefaultUnitFormState(),
      finalValmar: { maxHp: 2600, startSp: 80, startMp: 44, str: 44, vit: 38, agi: 28, spd: 26, mag: 40, men: 34 },
    },
  },
};

const SCENARIO_RUN_LIBRARY = [
  { id: 'starter-1001', label: 'Starter #1001', scenario: 'starter', battleSeed: 1001, note: 'Мягкий входной seed для человека.' },
  { id: 'control-1337', label: 'Control #1337', scenario: 'control', battleSeed: 1337, note: 'Базовый контрольный seed.' },
  { id: 'control-2024', label: 'Control #2024', scenario: 'control', battleSeed: 2024, note: 'Альтернативный контрольный seed.' },
  { id: 'veteran-9001', label: 'Veteran #9001', scenario: 'veteran-seed', battleSeed: 9001, note: 'Жёсткий seed против veteran AI.' },
  { id: 'line-4242', label: 'Line pressure #4242', scenario: 'line-pressure', battleSeed: 4242, note: 'Для тестов Evade и Wing Slice.' },
  { id: 'party-5150', label: 'Party skirmish #5150', scenario: 'party-skirmish', battleSeed: 5150, note: '3v3 бой с Tio и Mottled Spider.' },
  { id: 'fullparty-8080', label: 'Full party #8080', scenario: 'full-party', battleSeed: 8080, note: 'Полная партия 4v4 с Millenia и Guardian.' },
  { id: 'guardian-8282', label: 'Guardian trial #8282', scenario: 'guardian-trial', battleSeed: 8282, note: 'Проба состава против Guardian + Wing Eye.' },
  { id: 'boss-6161', label: 'Mini-boss #6161', scenario: 'miniboss-minotaur', battleSeed: 6161, note: 'Solo Durham Minotaur.' },
  { id: 'boss-escort-7171', label: 'Mini-boss escort #7171', scenario: 'miniboss-escort', battleSeed: 7171, note: 'Durham Minotaur с сопровождением.' },
  { id: 'tongue-6262', label: 'Tongue of Valmar #6262', scenario: 'tongue-valmar', battleSeed: 6262, note: 'Сюжетный corrupted boss в храме.' },
  { id: 'claws-6363', label: 'Claws of Valmar #6363', scenario: 'claws-valmar', battleSeed: 6363, note: 'Быстрый заводской boss под арку Тио.' },
  { id: 'heart-6464', label: 'Heart of Valmar #6464', scenario: 'heart-valmar', battleSeed: 6464, note: 'Поздний сюжетный boss Дня Тьмы.' },
  { id: 'zera-6565', label: 'Zera finale #6565', scenario: 'zera-finale', battleSeed: 6565, note: 'Финальный сюжетный бой против Зеры.' },
  { id: 'eye-6767', label: 'Eye of Valmar #6767', scenario: 'eye-of-valmar', battleSeed: 6767, note: 'Гравитационное око Вальмара.' },
  { id: 'crimson-6868', label: 'Crimson Tails #6868', scenario: 'crimson-tails', battleSeed: 6868, note: 'Двойной босс рифа Сесиль.' },
  { id: 'naga-6969', label: 'Naga Queens #6969', scenario: 'naga-queens', battleSeed: 6969, note: 'Королевы-наги Demon\'s Law.' },
  { id: 'fists-7070', label: 'Dual Fists #7070', scenario: 'dual-fists', battleSeed: 7070, note: 'Кулаки древнего стража.' },
  { id: 'guardians-7171', label: 'Birthplace Guardians #7171', scenario: 'birthplace-guardians', battleSeed: 7171, note: 'Пара архивных стражей.' },
  { id: 'egg-7272', label: 'Egg Guardian #7272', scenario: 'egg-guardian', battleSeed: 7272, note: 'Страж с битами.' },
  { id: 'valmar-7373', label: 'Final Valmar #7373', scenario: 'final-valmar', battleSeed: 7373, note: 'Полноценный финальный Вальмар.' },
];

function resolveScenarioSource(key) {
  if (!key) {
    return null;
  }

  if (SCENARIO_PRESETS[key]) {
    return {
      key,
      sourceType: 'scenario',
      scenarioKey: key,
      encounterLabel: SCENARIO_PRESETS[key].label,
      battleSeed: SCENARIO_PRESETS[key].battleSeed,
      runId: null,
      bespoke: true,
    };
  }

  const run = SCENARIO_RUN_LIBRARY.find((entry) => entry.id === key) ?? null;
  if (!run) {
    return null;
  }

  return {
    key,
    sourceType: 'run',
    scenarioKey: run.scenario,
    encounterLabel: run.label,
    battleSeed: run.battleSeed,
    runId: run.id,
    note: run.note,
    bespoke: true,
  };
}

function applyScenarioSource(source) {
  if (!source) {
    return;
  }

  if (source.sourceType === 'run' && source.runId) {
    applyScenarioRunPreset(source.runId);
    return;
  }

  if (source.scenarioKey) {
    applyScenarioPreset(source.scenarioKey);
  }
}

const SETTINGS_STORAGE_KEY = 'grandia2-settings';

const DEFAULT_SETTINGS = {
  defaultPlayEnemyAi: 'novice',
  defaultBattlefieldTheme: 'forest',
  showCommandHints: true,
  replaySpeedMs: 550,
};

function loadPersistedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

function savePersistedSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings ?? DEFAULT_SETTINGS));
}

const state = {
  appScreen: 'menu',
  activeTab: 'play',
  settings: loadPersistedSettings(),
  menuParityScreen: 'status',
  battle: null,
  replay: null,
  replayAutoplayTimer: null,
  animationFrame: null,
  eventFx: null,
  eventFxQueue: [],
  compare: {
    left: null,
    right: null,
    index: 0,
    autoplayTimer: null,
  },
  storyData: null,
  storyLoadError: null,
  currentStoryArcId: null,
  currentStoryBeatId: null,
  appliedStoryArcId: null,
  appliedStoryBeatId: null,
  campaignProgress: {
    completedBeatIds: [],
    lastStartedBeatId: null,
  },
  campaignRun: createEmptyCampaignRun(),
  commandMenu: {
    fighterId: null,
    category: 'root',
  },
  battleLabel: '',
  unitFormState: createDefaultUnitFormState(),
  encounterTemplate: 'duel2v2',
  battlefieldTheme: 'forest',
  enabledUnits: { roan: false, mareg: false, tio: false, millenia: false, mottledSpider: false, guardian: false },
  inventoryOverrides: createBaseInventory(DEFAULT_CAMPAIGN_INVENTORY),
  openingAdvantage: 'neutral',
  selectedScenario: 'control',
  selectedScenarioRun: 'control-1337',
  battleSeed: 1337,
  decisionFilter: {
    action: 'all',
    controller: 'all',
    danger: 'all',
  },
  lastMetrics: null,
  canvasHotspots: [],
  navigationKeys: {},
  campaignAvatar: null,
  lastAnimationTime: null,
  veteranWeights: cloneWeights(DEFAULT_VETERAN_WEIGHTS),
  balanceVector: cloneVector(DEFAULT_BALANCE_VECTOR),
  playEnemyAi: 'novice',
  debugPlayerAi: 'novice',
  debugEnemyAi: 'novice',
  trainingStyle: 'balanced',
  debugOutput: 'Открой дебаг-вкладку, чтобы обучать ветерана, грузить артефакт, смотреть винрейт и запускать один AI-бой.',
  veteranSource: 'default constants',
};

const elements = {
  menuScreen: document.querySelector('#menu-screen'),
  appScreen: document.querySelector('#app-screen'),
  menuOpenPlay: document.querySelector('#menu-open-play'),
  menuOpenCampaign: document.querySelector('#menu-open-campaign'),
  menuOpenDebug: document.querySelector('#menu-open-debug'),
  menuOpenCompare: document.querySelector('#menu-open-compare'),
  backToMenu: document.querySelector('#back-to-menu'),
  tabPlay: document.querySelector('#tab-play'),
  tabCampaign: document.querySelector('#tab-campaign'),
  tabDebug: document.querySelector('#tab-debug'),
  tabCompare: document.querySelector('#tab-compare'),
  tabParity: document.querySelector('#tab-parity'),
  playSection: document.querySelector('#play-section'),
  campaignSection: document.querySelector('#campaign-section'),
  debugSection: document.querySelector('#debug-section'),
  compareSection: document.querySelector('#compare-section'),
  paritySection: document.querySelector('#menu-parity-section'),
  menuOpenParity: document.querySelector('#menu-open-parity'),
  mpStatus: document.querySelector('#mp-status'),
  mpSkills: document.querySelector('#mp-skills'),
  mpEggs: document.querySelector('#mp-eggs'),
  mpItems: document.querySelector('#mp-items'),
  mpBestiary: document.querySelector('#mp-bestiary'),
  mpConfig: document.querySelector('#mp-config'),
  mpOutput: document.querySelector('#mp-output'),
  mpImages: document.querySelector('#mp-images'),
  mpConfigAi: document.querySelector('#mp-config-ai'),
  mpConfigTheme: document.querySelector('#mp-config-theme'),
  mpConfigHints: document.querySelector('#mp-config-hints'),
  mpConfigSpeed: document.querySelector('#mp-config-speed'),
  mpConfigSave: document.querySelector('#mp-config-save'),
  battleLabel: document.querySelector('#battle-label'),
  status: document.querySelector('#status'),
  summary: document.querySelector('#summary'),
  log: document.querySelector('#log'),
  decisions: document.querySelector('#decisions'),
  decisionStats: document.querySelector('#decision-stats'),
  metricsGraph: document.querySelector('#metrics-graph'),
  actionGraph: document.querySelector('#action-graph'),
  graphInfo: document.querySelector('#graph-info'),
  decisionFilterAction: document.querySelector('#decision-filter-action'),
  decisionFilterController: document.querySelector('#decision-filter-controller'),
  decisionFilterDanger: document.querySelector('#decision-filter-danger'),
  scenarioSelect: document.querySelector('#scenario-select'),
  scenarioApply: document.querySelector('#scenario-apply'),
  scenarioInfo: document.querySelector('#scenario-info'),
  scenarioRunSelect: document.querySelector('#scenario-run-select'),
  scenarioRunApply: document.querySelector('#scenario-run-apply'),
  campaignStartRun: document.querySelector('#campaign-start-run'),
  campaignResumeRun: document.querySelector('#campaign-resume-run'),
  campaignNextScene: document.querySelector('#campaign-next-scene'),
  campaignLaunchBattle: document.querySelector('#campaign-launch-battle'),
  campaignContinueAfterBattle: document.querySelector('#campaign-continue-after-battle'),
  campaignRetryBeat: document.querySelector('#campaign-retry-beat'),
  campaignAbandonRun: document.querySelector('#campaign-abandon-run'),
  campaignSceneKicker: document.querySelector('#campaign-scene-kicker'),
  campaignSceneTitle: document.querySelector('#campaign-scene-title'),
  campaignSceneSubtitle: document.querySelector('#campaign-scene-subtitle'),
  campaignSceneBody: document.querySelector('#campaign-scene-body'),
  campaignSceneMeta: document.querySelector('#campaign-scene-meta'),
  campaignJournal: document.querySelector('#campaign-journal'),
  campaignWorldSummary: document.querySelector('#campaign-world-summary'),
  campaignLocationTags: document.querySelector('#campaign-location-tags'),
  campaignLocationActions: document.querySelector('#campaign-location-actions'),
  campaignExitButtons: document.querySelector('#campaign-exit-buttons'),
  campaignRouteMap: document.querySelector('#campaign-route-map'),
  campaignEquipmentSummary: document.querySelector('#campaign-equipment-summary'),
  campaignEquipmentActions: document.querySelector('#campaign-equipment-actions'),
  campaignEventsSummary: document.querySelector('#campaign-events-summary'),
  campaignGrowthSummary: document.querySelector('#campaign-growth-summary'),
  campaignGrowthActions: document.querySelector('#campaign-growth-actions'),
  campaignQuestSummary: document.querySelector('#campaign-quest-summary'),
  campaignAuditSummary: document.querySelector('#campaign-audit-summary'),
  campaignAuditBreakdown: document.querySelector('#campaign-audit-breakdown'),
  campaignOriginalFlowSummary: document.querySelector('#campaign-original-flow-summary'),
  campaignBestiarySummary: document.querySelector('#campaign-bestiary-summary'),
  campaignSkillbookSummary: document.querySelector('#campaign-skillbook-summary'),
  campaignItemSummary: document.querySelector('#campaign-item-summary'),
  campaignScriptSummary: document.querySelector('#campaign-script-summary'),
  campaignDialogueDetail: document.querySelector('#campaign-dialogue-detail'),
  campaignFidelityGoals: document.querySelector('#campaign-fidelity-goals'),
  campaignArcSelect: document.querySelector('#campaign-arc-select'),
  campaignBeatSelect: document.querySelector('#campaign-beat-select'),
  campaignPrevBeat: document.querySelector('#campaign-prev-beat'),
  campaignNextBeat: document.querySelector('#campaign-next-beat'),
  campaignStartBeat: document.querySelector('#campaign-start-beat'),
  campaignApplyOnly: document.querySelector('#campaign-apply-only'),
  campaignContinueFlow: document.querySelector('#campaign-continue-flow'),
  campaignCompleteNext: document.querySelector('#campaign-complete-next'),
  campaignSaveState: document.querySelector('#campaign-save-state'),
  campaignLoadState: document.querySelector('#campaign-load-state'),
  campaignResetState: document.querySelector('#campaign-reset-state'),
  campaignInfo: document.querySelector('#campaign-info'),
  encounterTemplate: document.querySelector('#encounter-template'),
  battlefieldTheme: document.querySelector('#battlefield-theme'),
  openingAdvantage: document.querySelector('#opening-advantage'),
  battleSeed: document.querySelector('#battle-seed'),
  inventoryHerb: document.querySelector('#inventory-herb'),
  inventoryAntidote: document.querySelector('#inventory-antidote'),
  includeRoan: document.querySelector('#include-roan'),
  includeMareg: document.querySelector('#include-mareg'),
  includeTio: document.querySelector('#include-tio'),
  includeMillenia: document.querySelector('#include-millenia'),
  includeMottledSpider: document.querySelector('#include-mottled-spider'),
  includeGuardian: document.querySelector('#include-guardian'),
  nextTurn: document.querySelector('#next-turn'),
  autoBattle: document.querySelector('#auto-battle'),
  exportLog: document.querySelector('#export-log'),
  resetBattle: document.querySelector('#reset-battle'),
  playEnemyAi: document.querySelector('#play-enemy-ai'),
  playStart: document.querySelector('#play-start'),
  simulate: document.querySelector('#simulate'),
  commandStatus: document.querySelector('#command-status'),
  commandButtons: document.querySelector('#command-buttons'),
  debugPlayerAi: document.querySelector('#debug-player-ai'),
  debugEnemyAi: document.querySelector('#debug-enemy-ai'),
  debugTrainStyle: document.querySelector('#debug-train-style'),
  debugGenerations: document.querySelector('#debug-generations'),
  debugPopulation: document.querySelector('#debug-population'),
  debugTrainingSims: document.querySelector('#debug-training-sims'),
  debugTrainingSeed: document.querySelector('#debug-training-seed'),
  debugEvalCount: document.querySelector('#debug-eval-count'),
  debugStartBattle: document.querySelector('#debug-start-battle'),
  debugWinrate: document.querySelector('#debug-winrate'),
  debugTrain: document.querySelector('#debug-train'),
  debugLoadArtifact: document.querySelector('#debug-load-artifact'),
  debugImportArtifact: document.querySelector('#debug-import-artifact'),
  debugImportArtifactInput: document.querySelector('#debug-import-artifact-input'),
  debugSaveCurrent: document.querySelector('#debug-save-current'),
  balanceApply: document.querySelector('#balance-apply'),
  balanceResetDefaults: document.querySelector('#balance-reset-defaults'),
  debugOutput: document.querySelector('#debug-output'),
  veteranStatus: document.querySelector('#veteran-status'),
  replayLoad: document.querySelector('#replay-load'),
  replayLoadInput: document.querySelector('#replay-load-input'),
  replayPrev: document.querySelector('#replay-prev'),
  replayNext: document.querySelector('#replay-next'),
  replayPlay: document.querySelector('#replay-play'),
  replaySpeed: document.querySelector('#replay-speed'),
  replaySlider: document.querySelector('#replay-slider'),
  replayClose: document.querySelector('#replay-close'),
  replayStatus: document.querySelector('#replay-status'),
  replayInfo: document.querySelector('#replay-info'),
  compareLoadLeft: document.querySelector('#compare-load-left'),
  compareLoadLeftInput: document.querySelector('#compare-load-left-input'),
  compareLoadRight: document.querySelector('#compare-load-right'),
  compareLoadRightInput: document.querySelector('#compare-load-right-input'),
  comparePrev: document.querySelector('#compare-prev'),
  compareNext: document.querySelector('#compare-next'),
  comparePlay: document.querySelector('#compare-play'),
  compareSpeed: document.querySelector('#compare-speed'),
  compareSlider: document.querySelector('#compare-slider'),
  compareExportJson: document.querySelector('#compare-export-json'),
  compareExportTxt: document.querySelector('#compare-export-txt'),
  compareClear: document.querySelector('#compare-clear'),
  compareStatus: document.querySelector('#compare-status'),
  compareLeftInfo: document.querySelector('#compare-left-info'),
  compareRightInfo: document.querySelector('#compare-right-info'),
  compareDiff: document.querySelector('#compare-diff'),
  compareDecisionStats: document.querySelector('#compare-decision-stats'),
  compareCanvasLeft: document.querySelector('#compare-canvas-left'),
  compareCanvasRight: document.querySelector('#compare-canvas-right'),
  canvas: document.querySelector('#battle-view'),
};

const MP_SCREENS = [
  { key: 'status', label: 'Статус / герой', button: 'mpStatus' },
  { key: 'skills', label: 'Навыки и магия', button: 'mpSkills' },
  { key: 'eggs', label: 'Mana Eggs', button: 'mpEggs' },
  { key: 'items', label: 'Предметы и снаряжение', button: 'mpItems' },
  { key: 'bestiary', label: 'Энциклопедия врагов', button: 'mpBestiary' },
  { key: 'config', label: 'Настройки', button: 'mpConfig' },
];

const context = elements.canvas.getContext('2d');
const compareContextLeft = elements.compareCanvasLeft.getContext('2d');
const compareContextRight = elements.compareCanvasRight.getContext('2d');
const metricsGraphContext = elements.metricsGraph.getContext('2d');
const actionGraphContext = elements.actionGraph.getContext('2d');
const imageAssetCache = new Map();

function getLoadedImageAsset(path) {
  if (!path) {
    return null;
  }
  const existing = imageAssetCache.get(path);
  if (existing?.loaded) {
    return existing.image;
  }
  if (existing?.failed) {
    return null;
  }
  if (!existing) {
    const image = new Image();
    const entry = { image, loaded: false, failed: false };
    image.onload = () => {
      entry.loaded = true;
      render();
    };
    image.onerror = () => {
      entry.failed = true;
    };
    image.src = path;
    imageAssetCache.set(path, entry);
  }
  return null;
}

function preloadArtAssets() {
  for (const path of ALL_ART_PATHS) {
    getLoadedImageAsset(path);
  }
}

function drawImageCover(ctx, image, x, y, width, height, alpha = 1) {
  if (!image) {
    return false;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
  return true;
}

const STORY_PARTY_UNIT_MAP = {
  Ryudo: 'ryudo',
  Elena: 'elena',
  Millenia: 'millenia',
  Tio: 'tio',
  Roan: 'roan',
  Mareg: 'mareg',
};

const WORLD_LOCATION_EVENTS = {
  carbo_church: [
    { id: 'carius-briefing', label: 'Поговорить с отцом Кариусом', text: 'Кариус просит Рюдо оставить цинизм за дверью и довести Елену до ритуала живой.', setFlags: ['flag_carbo_briefed'], rewards: { experience: 10, skillCoins: 3, magicCoins: 1, setFlags: ['flag_carbo_briefed'] } },
    { id: 'elena-song', label: 'Послушать песнь Елены', text: 'Из глубины церкви слышно пение Елены — тихое, чистое и слишком неуместное для мира, где всё уже трещит.', setFlags: ['flag_carbo_song_heard'], rewards: { experience: 10, skillCoins: 1, magicCoins: 3, setFlags: ['flag_carbo_song_heard'] } },
    { id: 'carbo-faith', label: 'Осмотреть алтарь', text: 'Даже мирный алтарь здесь напоминает, насколько вера в Grandia II завязана на страхе перед возвращением Вальмара.' },
  ],
  carbo_inn: [
    { id: 'carbo-dinner', label: 'Переночевать и послушать постояльцев', text: 'Постояльцы обсуждают геохаундов, церковь и слухи о тьме. Карбо ещё выглядит мирным, но это ощущение уже ложное.' },
  ],
  agear_inn: [
    { id: 'vyx-rumor', label: 'Спросить Вайкса о городе', text: 'Хозяин трактира рассказывает, что дорогу монстры отрезали совсем недавно, а мальчишка Роан уже полез в пещеру.', setFlags: ['flag_agear_briefed'], rewards: { experience: 12, skillCoins: 3, magicCoins: 2, setFlags: ['flag_agear_briefed'] } },
    { id: 'agear-refugees', label: 'Поговорить с беженцами', text: 'Люди из Агира жалуются не только на монстров, но и на ощущение, будто сама земля вокруг стала враждебной.' },
  ],
  liligue_inn: [
    { id: 'liligue-rich-rest', label: 'Послушать гостей Лилига', text: 'Даже спокойный разговор в трактире Лилига постоянно сворачивает к ценам, механизмам и слухам о том, что под городом что-то не так.' },
  ],
  liligue_engineer_house: [
    { id: 'liligue-drafts', label: 'Осмотреть инженерные чертежи', text: 'Чертежи и расчёты показывают, как город привык решать всё техникой и потому слишком долго не замечал настоящую природу древней порчи.' },
  ],
  liligue_gadan_house: [
    { id: 'gadan-lore', label: 'Расспросить Гадана', text: 'Гадан говорит о странной болезни города и о том, что под Лилигом есть нечто гораздо древнее, чем инженеры хотели бы признать.', setFlags: ['flag_liligue_gadan'], rewards: { experience: 14, skillCoins: 3, magicCoins: 3, setFlags: ['flag_liligue_gadan'] } },
    { id: 'liligue-anxiety', label: 'Слушать споры инженеров', text: 'Инженеры спорят о skyway, деньгах и поломках, а под этим шумом почти не замечают, как тьма подбирается всё ближе.' },
  ],
  liligue_city: [
    { id: 'liligue-market', label: 'Пройтись по рыночной части', text: 'Лилиг всё ещё живёт шумно и богато, но уже чувствуется, что город стоит на краю чего-то большого и дурного.' },
  ],
  mirumu_inn: [
    { id: 'mirumu-hearth', label: 'Посидеть у очага', text: 'Даже в тёплом углу Мирумы люди смотрят на дверь чаще, чем на собеседника: страх уже вошёл в привычку.' },
  ],
  mirumu_sandra_house: [
    { id: 'aira-vision', label: 'Поговорить с Сандрой и Аирой', text: 'В доме Сандры всё пропитано тревогой: Аира словно слышит мир глубже остальных, а потому и страдает первой.' },
    { id: 'mirumu-cold', label: 'Осмотреть комнату Аиры', text: 'Даже тёплая комната здесь кажется незащищённой. Болезнь в Мируме выглядит скорее проклятием, чем обычной бедой.' },
  ],
  mirumu_village: [
    { id: 'mirumu-selene', label: 'Посмотреть на деревню после речей Селены', text: 'После Селены в Мируме остаётся не надежда, а напряжение. Это уже не просто снежная деревня, а место осады верой.' },
  ],
  st_heim_inn: [
    { id: 'stheim-attendants', label: 'Послушать служителей гостиницы', text: 'Даже вежливость персонала St. Heim звучит так, будто гостей уже давно распределили по ролям внутри чужого церковного сценария.' },
  ],
  st_heim_bakery: [
    { id: 'stheim-bread-gossip', label: 'Поговорить в пекарне', text: 'Пекарня даёт редкий земной тон святому городу: запах хлеба, бытовой шум и слухи, в которых вера уже начинает путаться с политикой.' },
  ],
  st_heim_library: [
    { id: 'library-lore', label: 'Полистать книги о Граносе', text: 'Библиотека Сент-Хейма полна официальной догмы, но внимательный взгляд замечает, сколько в ней удобных пропусков и слишком гладких объяснений.', setFlags: ['flag_stheim_library'], rewards: { experience: 16, skillCoins: 2, magicCoins: 5, setFlags: ['flag_stheim_library'] } },
    { id: 'library-zera', label: 'Спросить о Зере', text: 'Даже книги и служители говорят о Зере с таким благоговением, что это уже больше похоже на культ личности, чем на веру.' },
  ],
  st_heim_balcony: [
    { id: 'balcony-millenia', label: 'Поговорить на балконе', text: 'На балконе Сент-Хейма легко увидеть красивый фасад мира, за которым скрывается церковь, переписывающая истину под себя.' },
  ],
  cyrum_inn: [
    { id: 'cyrum-night-guests', label: 'Послушать гостей столицы', text: 'Ночь в гостинице Цайрума напоминает, что город всё ещё умеет казаться тёплым домом, хотя под ним уже готовится другой, техничный кошмар.' },
  ],
  cyrum_castle_square: [
    { id: 'hemble-show', label: 'Осмотреть площадь и шатёр Хембла', text: 'Праздничный шум площади не скрывает того, что под роскошью Цайрума шевелится страх и государственная ложь.', setFlags: ['flag_cyrum_square'], rewards: { experience: 16, skillCoins: 4, magicCoins: 2, setFlags: ['flag_cyrum_square'] } },
    { id: 'cyrum-prince', label: 'Послушать разговоры о принце', text: 'Горожане любят принца-ребёнка, но почти ничего не понимают о том, насколько глубоко государственная машина уже тронута тьмой.' },
  ],
  cyrum_port: [
    { id: 'bakala-port', label: 'Поговорить с моряками в порту', text: 'У причала всё выглядит живо и шумно, но даже моряки говорят о странных переменах погоды и дурных предзнаменованиях.' },
  ],
  cyrum_kings_chamber: [
    { id: 'cyrum-kings-truth', label: 'Осмотреть покои правителя', text: 'Королевские покои дают понять, насколько глубоко прошлое и политика Цайрума завязаны на тайнах, которые группа только начинает вскрывать.', requiresFlags: ['flag_cyrum_inn'], rewards: { experience: 14, skillCoins: 2, magicCoins: 3 } },
    { id: 'cyrum-regalia', label: 'Осмотреть знаки власти', text: 'В роскошных покоях особенно ясно видно, что взросление Роана уже нельзя отделять от правды, которую приходится вскрывать под его собственным домом.' },
  ],
  ryudo_house: [
    { id: 'ryudo-memory', label: 'Осмотреть дом Рюдо', text: 'Дом Рюдо больше похож на рану, чем на убежище. Здесь прошлое не вспоминается — оно давит.', setFlags: ['flag_garlan_past'], rewards: { experience: 18, skillCoins: 5, magicCoins: 2, setFlags: ['flag_garlan_past'] } },
    { id: 'skye-memory', label: 'Поговорить со Скаем о прошлом', text: 'Скай напоминает, что история Мелфиса — не только про силу, но и про то, как гниль внутри человека ищет оправдание.' },
  ],
  garlan_chief_house: [
    { id: 'garlan-village-ledger', label: 'Выслушать старосту', text: 'У старосты Гарлана память хранится не в книгах, а в потерях. Поэтому разговор быстро становится не формальным, а почти обвинительным.' },
  ],
  garlan_village: [
    { id: 'garlan-hostility', label: 'Послушать, как деревня говорит о Рюдо', text: 'В Гарлане даже воздух сопротивляется возвращению Рюдо. Здесь каждая реплика — это обида, давно превратившаяся в привычку.' },
  ],
  nanan_store: [
    { id: 'nanan-provisions', label: 'Осмотреть северные припасы', text: 'Даже разговор о припасах в Нанане звучит как подготовка к дороге, после которой человек возвращается уже другим.' },
  ],
  nanan_village: [
    { id: 'nanan-song', label: 'Послушать разговоры в деревне', text: 'В Нанане чувствуется край мира: дальше уже не дом, а буря, разлом и древняя машина.', setFlags: ['flag_nanan_edge'], rewards: { experience: 20, skillCoins: 5, magicCoins: 4, setFlags: ['flag_nanan_edge'] } },
    { id: 'mareg-clan', label: 'Поговорить с жителями о Мареге', text: 'Для одних Марег — герой клана, для других — напоминание о цене, которую приходится платить за долг и честь.' },
  ],
  zera_room: [
    { id: 'zera-desk', label: 'Осмотреть стол Зеры', text: 'Личная комната Зеры производит ещё более холодное впечатление, чем его публичные речи: всё слишком чисто, слишком рассчитано, слишком подчинено контролю.' },
  ],
  cyrum_kingdom_south: [
    { id: 'cyrum-front-maps', label: 'Осмотреть карты фронта', text: 'На южном фронте даже карты выглядят как список отсроченных потерь. Здесь поздний Цайрум окончательно перестаёт быть просто столицей.' },
  ],
  raul_hills_special: [
    { id: 'special-stage-altar', label: 'Осмотреть алтарь башни', text: 'На вершине башни лабиринта — алтарь, хранящий защитное яйцо феи. Вокруг — следы древнего ритуала.', rewards: { experience: 40, skillCoins: 8, magicCoins: 10 } },
    { id: 'special-stage-echo', label: 'Прислушаться к эху развалин', text: 'Эхо повторяет шаги давно ушедших искателей сокровищ. Где-то здесь спрятан запас старой экспедиции.', rewards: { experience: 30, gold: 150 } },
  ],
  birthplace_of_the_gods: [
    { id: 'ancient-echo', label: 'Исследовать древние надписи', text: 'Древние надписи в Истоке богов говорят не о благочестии, а о технологиях, катастрофе и переписанной истории.', setFlags: ['flag_birthplace_truth'], rewards: { experience: 24, skillCoins: 4, magicCoins: 8, setFlags: ['flag_birthplace_truth'] } },
    { id: 'origin-reversal', label: 'Осмотреть центральный зал', text: 'Чем глубже партия идёт, тем яснее становится: мир Grandia II держался не на истине, а на удобной версии прошлого.' },
  ],
  new_valmar: [
    { id: 'new-valmar-breath', label: 'Прислушаться к живому данжу', text: 'Новый Вальмар не похож на место. Он дышит, реагирует и словно пытается убедить героев, что спасение возможно только через подчинение.', setFlags: ['flag_new_valmar_will'], rewards: { experience: 28, skillCoins: 6, magicCoins: 8, setFlags: ['flag_new_valmar_will'] } },
  ],
  new_valmar_core: [
    { id: 'new-valmar-core-hum', label: 'Слушать гул ядра', text: 'Даже до финальной развязки ядро Нового Вальмара звучит как место, где пытаются отменить человеческий выбор под видом высшего порядка.' },
  ],
};

const WORLD_LOCATION_TREASURES = {
  carbo_village: [

    { id: 'carbo-garden-cache', label: 'Садовая грядка', description: 'Кто-то припрятал запас в корнях старого дерева.', rewards: { gold: 20, poffNut: 1 } },
  
  ],
  black_forest: [

    { id: 'black-forest-cache', label: 'Корни у тропы', description: 'Старая сумка, брошенная кем-то в спешке.', rewards: { gold: 30, medicinalHerb: 1 } },
  
  ],
  garmia_tower: [

    { id: 'garmia-reliquary', label: 'Разбитый реликварий', description: 'Осколки святыни и немного полезных припасов.', rewards: { gold: 45, antidote: 1, eyeDrops: 1 } },
  
  ],
  inor_mountains: [

    { id: 'inor-cliff-chest', label: 'Сундук на уступе', description: 'Тайник у опасного горного прохода.', rewards: { gold: 55, medicinalHerb: 1, antidote: 1 } },
  
  ],
  agear_town: [

    { id: 'agear-ruin-cache', label: 'Развалины на окраине', description: 'Осколки арсенала, уцелевшие после налёта.', rewards: { gold: 25, firebomb: 1 } },
  
  ],
  durham_cave_entrance: [

    { id: 'durham-rock-cache', label: 'Тайник за валуном', description: 'Пещерный схрон возле старого рычага.', rewards: { gold: 70, medicinalHerb: 2 } },
    { id: 'durham-torte-cache', label: 'Дудочка в грязи', description: 'Кто-то обронил дудочку, которая умеет будить даже самых крепких сонь.', rewards: { tortesReedpipe: 1, gold: 20 } },
  
  ],
  durham_cave_depths: [

    { id: 'durham-mist-egg', label: 'Туманное яйцо', description: 'Воздушное яйцо маны, оставленное тварями пещеры: ветер, вода и мороз.', requiresFlags: ['flag_durham_roan_found'], rewards: { eggIds: ['mist_egg'] } },
  
  ],
  fissure_depths: [

    { id: 'fissure-gravity-egg', label: 'Яйцо гравитации', description: 'Землистое яйцо маны из глубин разлома: огонь, земля и взрывы.', rewards: { eggIds: ['gravity_egg'] } },
  
  ],
  ceceile_reef: [

    { id: 'reef-soul-egg', label: 'Яйцо души', description: 'Мудрое яйцо маны, выброшенное прибоем: ветер, вода и молнии.', rewards: { eggIds: ['soul_egg'] } },
  ,
    { id: 'reef-shell-cache', label: 'Сундук в кораллах', description: 'Тайник на рифе у кромки воды.', rewards: { gold: 120, medicinalHerb: 2 } },
  
  ],
  raul_hills: [

    { id: 'raul-fairy-egg', label: 'Яйцо феи', description: 'Защитное яйцо маны с вершины башни лабиринта: исцеление и поддержка.', rewards: { eggIds: ['fairy_egg'] } },
  ,
    { id: 'raul-star-cache', label: 'Звёздная расселина', description: 'Ящик, оставленный старыми охотниками за сокровищами.', rewards: { gold: 60, mogayBomb: 1 } },
  ,
    { id: 'raul-ruin-cache', label: 'Развалины с припасами', description: 'Кто-то оставил в руинах ценный запас.', rewards: { gold: 120, medicinalHerb: 2 } },
  
  ],
  demons_law: [

    { id: 'demons-law-star-egg', label: 'Звёздное яйцо', description: 'Ультимативное яйцо маны из контрольного зала: молнии и взрывы.', rewards: { eggIds: ['star_egg'] } },
  ,
    { id: 'demons-law-stone-cache', label: 'Алтарь стихий', description: 'Три камня, собранные древними мастерами для управления механизмами.', rewards: { flameStone: 1, galeStone: 1, quakeStone: 1 } },
  
  ],
  birthplace_of_the_gods: [

    { id: 'birthplace-dragon-egg', label: 'Яйцо дракона', description: 'Наступательное яйцо маны из алтаря Истока богов: вся боевая магия.', rewards: { eggIds: ['dragon_egg'] } },
  ,
    { id: 'birthplace-archive-cache', label: 'Древний архивный сундук', description: 'Редкий тайник из старого мира.', rewards: { gold: 260, medicinalHerb: 2, antidote: 2, equipmentIds: ['millenia-witch-ribbon'] } },
  
  ],
  baked_plains: [

    { id: 'baked-smoke-cache', label: 'Сундук у паровых трещин', description: 'Потрёпанный сундук среди горячих камней.', rewards: { gold: 65, antidote: 1 } },
    { id: 'baked-sandman-sack', label: 'Мешок песчаного духа', description: 'То, что песчаный дух не успел унести с собой.', rewards: { gold: 30, seedOfPsyche: 1 } },
  
  ],
  liligue_cave: [

    { id: 'liligue-ruin-cache', label: 'Тайник руин', description: 'Спрятанный сундук у храмовой стены.', rewards: { gold: 90, medicinalHerb: 1, antidote: 1 } },
    { id: 'liligue-reflection-cache', label: 'Зеркальная ниша', description: 'Древняя шкатулка с ювелирным кольцом.', rewards: { gold: 40, equipmentIds: ['roan-reflection-ring'] } },
    { id: 'liligue-flamberge-cache', label: 'Огненный тайник', description: 'Клинок, который ещё помнит жар древних печей Лилига.', rewards: { gold: 30, equipmentIds: ['ryudo-flamberge'] } },
  
  ],
  mirumu_shed: [

    { id: 'mirumu-shed-cache', label: 'Полка в сарае', description: 'Запас того, кто собирался спускаться в разлом.', rewards: { eyeDrops: 1, paralysisSalve: 1 } },
  
  ],
  st_heim_library: [

    { id: 'stheim-lost-tome-cache', label: 'Потерянный том', description: 'Книга, которую библиотекарь «потерял» — с закладкой из свитка.', rewards: { scrollOfAlheal: 1, magicCoins: 4 } },
  
  ],
  lumir_forest: [

    { id: 'lumir-snow-cache', label: 'Снежный тайник', description: 'Запорошенный ящик под елью.', rewards: { gold: 75, medicinalHerb: 1 } },
  
  ],
  mysterious_fissure: [

    { id: 'fissure-deep-cache', label: 'Светящийся сундук', description: 'Схрон у спиральной платформы.', rewards: { gold: 95, antidote: 2, lumirFlower: 1 } },
  
  ],
  st_heim_mountains: [

    { id: 'stheim-climb-cache', label: 'Сундук у водопада', description: 'Спрятан прямо у опасного горного перехода.', rewards: { gold: 110, medicinalHerb: 1, antidote: 1 } },
  
  ],
  cyrum_secret_passage: [

    { id: 'cyrum-secret-cache', label: 'Тайник замка', description: 'Спрятан у старой лестницы в проходе.', rewards: { gold: 130, medicinalHerb: 1, antidote: 1, moveBlessing: 1 } },
  
  ],
  underground_plant: [

    { id: 'plant-terminal-cache', label: 'Контейнер у терминала', description: 'Ящик с техно-лутом и припасами.', rewards: { gold: 150, antidote: 2 } },
  
  ],
  grail_mountain: [

    { id: 'grail-memory-cache', label: 'Тайник на склоне', description: 'Старый сундук у грязевого пути.', rewards: { gold: 155, medicinalHerb: 1, antidote: 1 } },
  
  ],
  great_rift: [

    { id: 'rift-wind-cache', label: 'Сундук у обрыва', description: 'Добраться трудно, но награда того стоит.', rewards: { gold: 170, medicinalHerb: 2, antidote: 1 } },
  
  ],
  valmar_body: [

    { id: 'valmar-flesh-cache', label: 'Странный биотайник', description: 'Слишком органичный сундук внутри тела Вальмара.', rewards: { gold: 190, medicinalHerb: 2, antidote: 2, panacea: 1 } },
    { id: 'valmar-vein-cache', label: 'Пульсирующая железа', description: 'Внутри плоти застряли припасы прежней экспедиции.', rewards: { gold: 60, caterpillarSoup: 1, manaCrystal: 1 } },
  
  ],
  cyrum_kingdom_south: [

    { id: 'cyrum-front-cache', label: 'Фронтовой схрон', description: 'Боезапас, спрятанный защитниками линии.', rewards: { scarletPotion: 1, handGrenade: 1 } },
  
  ],
  valmars_moon: [

    { id: 'moon-core-cache', label: 'Лунный контейнер', description: 'Схрон у розовых колонн.', rewards: { gold: 220, medicinalHerb: 2, antidote: 2, healingHerb: 1, magicBlessing: 1 } },
  
  ],
  new_valmar: [

    { id: 'new-valmar-core-cache', label: 'Сердцевинный тайник', description: 'Награда у последнего рывка.', rewards: { gold: 320, medicinalHerb: 3, antidote: 2, yomisElixir: 1, healingIncense: 1, equipmentIds: ['ryudo-geohound-mail'] } },
  ,
    { id: 'new-valmar-hero-cache', label: 'Ларец героя', description: 'Запас, спрятанный для тех, кто дойдёт до самого сердца тьмы.', rewards: { heroElixir: 1, goldenPotion: 1 } },
  
  ],
  cyrum_kingdom: [
    { id: 'cyrum-castle-cache', label: 'Кладовая замка', description: 'Запас замковой стражи, забытый при спешной смене караула.', rewards: { gold: 90, scarletPotion: 1 } },
  ],
  garlan_tombs: [
    { id: 'garlan-tombs-cache', label: 'Дар у могил', description: 'Кто-то оставил припасы у старых надгробий в память о погибших.', rewards: { gold: 60, sympathyNut: 1 } },
  ],
  nanan_village: [
    { id: 'nanan-north-cache', label: 'Северный тайник', description: 'Схрон охотников клана на краю деревни.', rewards: { gold: 80, swiftnessNut: 1 } },
  ],
  st_heim_forbidden_room: [
    { id: 'forbidden-room-cache', label: 'Сундук запретной комнаты', description: 'То, что церковь прятала за запретными дверями.', rewards: { gold: 160, blessingScroll: 1, holyAshes: 1 } },
  ],
  plateau_of_memories: [
    { id: 'plateau-cache', label: 'Памятный сундук', description: 'Сундук, оставленный у плато теми, кто пришёл раньше.', rewards: { gold: 130, healingFruit: 1 } },
  ],
  aira_space: [
    { id: 'aira-cache', label: 'Ларец снов', description: 'Предмет, выпавший из мира грёз Аиры.', rewards: { gold: 110, eyeDrops: 2, lumirFlower: 1 } },
  ],
  valmars_womb: [
    { id: 'womb-cache', label: 'Пульсирующий ларец', description: 'Схрон на границе чрева Луны.', rewards: { gold: 200, magicalMedicine: 1 } },
  ],
  underground_control_room: [
    { id: 'control-room-cache', label: 'Контрольный сейф', description: 'Ящик с техно-лутом главного зала завода.', rewards: { gold: 140, electrumStone: 1, manaCrystal: 1 } },
  ],
  liligue_temple_ruins: [
    { id: 'temple-ruins-cache', label: 'Руинный алтарь', description: 'Приношение, оставленное древним храмом под Лилигом.', rewards: { gold: 100, icefangStone: 1 } },
  ],
  garmia_tower_top: [
    { id: 'garmia-top-cache', label: 'Верхняя сокровищница', description: 'Тайник на руинах верхней площадки башни.', rewards: { gold: 80, hyperMogayBomb: 1 } },
  ],
  garden_of_dream: [
    { id: 'dream-garden-cache', label: 'Цветок сада грёз', description: 'Необычный цветок, который светится изнутри.', rewards: { lumirFlower: 2, gold: 40 } },
  ],
  boat_50_50: [
    { id: 'boat-cache', label: 'Матросский сундук', description: 'Любимый тайник капитана Бакалы.', rewards: { gold: 120, magicalMedicine: 1 } },
  ],
  ghoss_forest_west: [
    { id: 'ghoss-west-cache', label: 'Лесной тайник', description: 'Схрон в корнях старого дерева.', rewards: { gold: 90, slowpokeNut: 1 } },
  ],
  ghoss_forest_east: [
    { id: 'ghoss-east-cache', label: 'Восточный схрон', description: 'Запас, спрятанный у выхода к Разлому.', rewards: { gold: 100, galeStone: 1 } },
  ],
  new_valmar_room_of_chaos: [
    { id: 'chaos-room-cache', label: 'Ларец лжи', description: 'Сундук, который, кажется, притворяется сундуком.', rewards: { gold: 150, quakeStone: 1 } },
  ],
  new_valmar_core: [

    { id: 'core-meteor-cache', label: 'Архивный терминал ядра', description: 'Последний ящик снабжения перед финальной развязкой.', rewards: { meteorScroll: 1, yomisElixir: 1 } },
  
  ],
};

const WORLD_TRAVEL_ENCOUNTERS = {
  black_forest: [
    { id: 'enc-black-forest-spiders', label: 'Засада Crag Snake в Black Forest', description: 'Змея из каменных корней и паучий охотник перехватывают первый мрачный маршрут от Карбо к Гармии.', enemyKeys: ['cragSnake', 'mottledSpider'], theme: 'forest', openingAdvantage: 'enemies', rewards: { gold: 35, experience: 14, skillCoins: 4, magicCoins: 3, medicinalHerb: 1, antidote: 0 } },
    { id: 'enc-black-forest-dodo', label: 'Додо на тропе', description: 'Глупая, но быстрая птица додо клюёт всё, что шевелится, в тёмном лесу.', enemyKeys: ['dodo', 'cragSnake'], theme: 'forest', openingAdvantage: 'neutral', rewards: { gold: 28, experience: 12, skillCoins: 3, magicCoins: 2, poffNut: 1 } },
  ],
  inor_mountains: [
    { id: 'enc-inor-snakes', label: 'Горная стая Inor Mountains', description: 'Crag Snake и Gargoyle держат узкую горную дорогу под постоянной угрозой срыва.', enemyKeys: ['cragSnake', 'gargoyle'], theme: 'cavern', openingAdvantage: 'neutral', rewards: { gold: 45, experience: 18, skillCoins: 5, magicCoins: 3, medicinalHerb: 1, antidote: 1 } },
  ],
  durham_cave_entrance: [
    { id: 'enc-durham-pack', label: 'Пещерная стая Durham', description: 'Frost Frog и Hammerhead держат туннели под давлением ещё до встречи с самим Durham Minotaur.', enemyKeys: ['frostFrog', 'hammerhead'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 60, experience: 22, skillCoins: 6, magicCoins: 4, medicinalHerb: 1, antidote: 1, eyeDrops: 1 } },
  ],
  baked_plains: [
    { id: 'enc-baked-plain-heat', label: 'Жара Baked Plains', description: 'Giant Mantis и Crag Snake используют раскалённые равнины как идеальную засаду.', enemyKeys: ['giantMantis', 'cragSnake'], theme: 'volcano', openingAdvantage: 'neutral', rewards: { gold: 55, experience: 20, skillCoins: 5, magicCoins: 4, medicinalHerb: 1, antidote: 0 } },
    { id: 'enc-baked-sandmen', label: 'Песчаные духи', description: 'Sandman крадётся по горячим трещинам и усыпляет путников перед ударом.', enemyKeys: ['sandman', 'giantMantis'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 60, experience: 24, skillCoins: 6, magicCoins: 4, seedOfPsyche: 1, paralysisSalve: 1 } },
  ],
  liligue_cave: [
    { id: 'enc-liligue-corruption', label: 'Порча под Лилигом', description: 'Gargoyle, Ghoul и Giant Mantis уже выглядят как настоящая испорченная экосистема руин под городом.', enemyKeys: ['gargoyle', 'ghoul', 'giantMantis'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 75, experience: 28, skillCoins: 7, magicCoins: 5, medicinalHerb: 1, antidote: 1, eyeDrops: 1 } },
  ],
  lumir_forest: [
    { id: 'enc-lumir-ambush', label: 'Стычка в снегу', description: 'Huge Caterpillar и Giant Crab делают снежный лес более похожим на оригинальную северную фауну Grandia II.', enemyKeys: ['hugeCaterpillar', 'giantCrab'], theme: 'forest', openingAdvantage: 'enemies', rewards: { gold: 70, experience: 24, skillCoins: 6, magicCoins: 5, medicinalHerb: 1, antidote: 1, lumirFlower: 1 } },
    { id: 'enc-lumir-bigfoot', label: 'Следы Бигфута', description: 'Огромный снежный зверь выходит из чащи и отбрасывает путников в сугробы.', enemyKeys: ['bigFoot', 'hugeCaterpillar'], theme: 'forest', openingAdvantage: 'enemies', rewards: { gold: 80, experience: 30, skillCoins: 7, magicCoins: 5, woundSalve: 1, lumirFlower: 1 } },
  ],
  mysterious_fissure: [
    { id: 'enc-fissure-depth', label: 'Твари разлома', description: 'Hammerhead, Giant Crab и Hell Hound делают разлом более тяжёлым и разнородным по тону.', enemyKeys: ['hammerhead', 'giantCrab', 'hellHound'], theme: 'cavern', openingAdvantage: 'neutral', rewards: { gold: 85, experience: 32, skillCoins: 8, magicCoins: 6, medicinalHerb: 1, antidote: 2, moveBlessing: 1 } },
    { id: 'enc-fissure-ogres', label: 'Близнецы-огры', description: 'Twin Ogre держат нижний ярус разлома и отбрасывают чужаков к стенам.', enemyKeys: ['twinOgre', 'hammerhead'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 95, experience: 38, skillCoins: 9, magicCoins: 7, handGrenade: 1, woundSalve: 1 } },
  ],
  st_heim_mountains: [
    { id: 'enc-stheim-climb', label: 'Горная стычка', description: 'Giant Mantis, Hammerhead и Huge Caterpillar превращают путь к святому городу в более узнаваемую late-midgame climb pressure.', enemyKeys: ['giantMantis', 'hammerhead', 'hugeCaterpillar'], theme: 'cavern', openingAdvantage: 'neutral', rewards: { gold: 90, experience: 36, skillCoins: 9, magicCoins: 6, medicinalHerb: 1, antidote: 1, eyeDrops: 1 } },
    { id: 'enc-stheim-snails', label: 'Черепа у святой тропы', description: 'Skull Snail и Twin Ogre преграждают паломнический подъём к папскому государству.', enemyKeys: ['skullSnail', 'twinOgre'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 105, experience: 42, skillCoins: 10, magicCoins: 8, poffNut: 1, seedOfLife: 1 } },
  ],
  raul_hills: [
    { id: 'enc-raul-ruins', label: 'Развалины Raul Hills', description: 'Land Cougar и Giga Mantis делают развалины более похожими на опасный дикий фронтир, а не на generic encounter-зону.', enemyKeys: ['landCougar', 'gigaMantis'], theme: 'ruins', openingAdvantage: 'players', rewards: { gold: 100, experience: 40, skillCoins: 10, magicCoins: 7, medicinalHerb: 2, antidote: 1, blueberry: 1 } },
    { id: 'enc-raul-ogres', label: 'Руинные стражи холмов', description: 'Twin Ogre и Land Cougar стерегут башни лабиринта Raul Hills.', enemyKeys: ['twinOgre', 'landCougar'], theme: 'ruins', openingAdvantage: 'neutral', rewards: { gold: 115, experience: 44, skillCoins: 11, magicCoins: 8, mogayBomb: 1, seedOfPsyche: 1 } },
    { id: 'enc-raul-dragonoid', label: 'Дракониды развалин', description: 'Dragonoid выдыхает пламя из-за рухнувших колонн, прикрываясь отрядами ящеров.', enemyKeys: ['dragonoid', 'twinOgre'], theme: 'ruins', openingAdvantage: 'neutral', rewards: { gold: 110, experience: 42, skillCoins: 10, magicCoins: 8, firebomb: 1, seedOfLife: 1 } },
  ],
  raul_hills_special: [
    { id: 'enc-special-snow-leopard', label: 'Снежный барс башни', description: 'Snow Leopard стережёт вершину башни лабиринта Раул Хиллс.', enemyKeys: ['snowLeopard'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 180, experience: 70, skillCoins: 16, magicCoins: 12, paralysisSalve: 1, manaCrystal: 1 } },
    { id: 'enc-special-devil', label: 'Демон развалин', description: 'Devil хозяйничает в глубинах скрытой части лабиринта.', enemyKeys: ['devil', 'snowLeopard'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 220, experience: 84, skillCoins: 18, magicCoins: 14, demonAsh: 1, scarletPotion: 1 } },
    { id: 'enc-special-dragon-knight', label: 'Драконий рыцарь башни', description: 'Dragon Knight и Devil охраняют нижние ярусы скрытого лабиринта.', enemyKeys: ['dragonKnight', 'devil'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 240, experience: 88, skillCoins: 18, magicCoins: 14, dragonZap: 0, manaCrystal: 1 } },
  ],
  cyrum_secret_passage: [
    { id: 'enc-cyrum-secret', label: 'Охрана тайного прохода', description: 'В скрытом проходе остаются враждебные защитные группы.', enemyKeys: ['guardian', 'wingEye'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 125, experience: 46, skillCoins: 11, magicCoins: 8, medicinalHerb: 1, antidote: 1 } },
    { id: 'enc-cyrum-camo-squad', label: 'Камуфляжный патруль', description: 'Chameleon и Dragonoid охраняют рычаги тайного прохода.', enemyKeys: ['chameleon', 'dragonoid'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 130, experience: 48, skillCoins: 11, magicCoins: 8, purifyingHerb: 1, firebomb: 1 } },
  ],
  underground_plant: [
    { id: 'enc-plant-sentries', label: 'Сентри underground plant', description: 'Механический комплекс выпускает новую волну защитников.', enemyKeys: ['guardian', 'mottledSpider'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 140, experience: 52, skillCoins: 12, magicCoins: 9, medicinalHerb: 1, antidote: 2 } },
    { id: 'enc-plant-warp', label: 'Варп-патруль завода', description: 'Warp Warrior и Vein Brain охраняют глубинные узлы комплекса.', enemyKeys: ['warpWarrior', 'veinBrain'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 150, experience: 56, skillCoins: 13, magicCoins: 10, manaCrystal: 1, magicBlessing: 1 } },
    { id: 'enc-plant-dragonoid', label: 'Огненный дозор завода', description: 'Dragonoid и Warp Warrior встречают нарушителей у терминалов.', enemyKeys: ['dragonoid', 'warpWarrior'], theme: 'cavern', openingAdvantage: 'enemies', rewards: { gold: 155, experience: 58, skillCoins: 13, magicCoins: 10, firebomb: 1, manaCrystal: 1 } },
  ],
  ceceile_reef: [
    { id: 'enc-reef-claws', label: 'Стычка на рифе', description: 'Giant Crab, Salamadile и Fenny Bird лучше держат морской и прибрежный тон маршрута к Гарлану.', enemyKeys: ['giantCrab', 'salamadile', 'fennyBird'], theme: 'forest', openingAdvantage: 'neutral', rewards: { gold: 120, experience: 48, skillCoins: 11, magicCoins: 8, medicinalHerb: 2, antidote: 1, lumirFlower: 1 } },
    { id: 'enc-reef-scaly', label: 'Чешуйчатые воины рифа', description: 'Scaly Warrior и Giant Crab встречают прибывающих на риф путников.', enemyKeys: ['scalyWarrior', 'giantCrab'], theme: 'forest', openingAdvantage: 'neutral', rewards: { gold: 135, experience: 52, skillCoins: 12, magicCoins: 9, woundSalve: 1, scarletPotion: 1 } },
    { id: 'enc-reef-claws-boss', label: 'Красные когти рифа', description: 'Crimson Claw и Flame Toad охраняют подходы к гнезду рифовых охотников.', enemyKeys: ['crimsonClaw', 'flameToad'], theme: 'forest', openingAdvantage: 'enemies', rewards: { gold: 145, experience: 56, skillCoins: 13, magicCoins: 9, handGrenade: 1, firebomb: 1 } },
  ],
  grail_mountain: [
    { id: 'enc-grail-slope', label: 'Путь по Grail Mountain', description: 'Hell Hound, Man-Eating Tree и Fenny Bird дают подъёму к Мелфису более оригинально-опасный характер.', enemyKeys: ['hellHound', 'manEatingTree', 'fennyBird'], theme: 'ruins', openingAdvantage: 'neutral', rewards: { gold: 130, experience: 54, skillCoins: 12, magicCoins: 9, medicinalHerb: 2, antidote: 1, moveBlessing: 1 } },
    { id: 'enc-grail-vipers', label: 'Ядовитые тропы Грайла', description: 'Pit Viper и Hell Hound контролируют грязевые склоны над святилищем.', enemyKeys: ['pitViper', 'hellHound'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 140, experience: 58, skillCoins: 13, magicCoins: 9, purifyingHerb: 1, antidote: 2 } },
    { id: 'enc-grail-clay', label: 'Глиняные стражи склона', description: 'Clay Bird и Flame Toad кружат над подъёмом к святилищу.', enemyKeys: ['clayBird', 'flameToad'], theme: 'ruins', openingAdvantage: 'neutral', rewards: { gold: 150, experience: 60, skillCoins: 14, magicCoins: 10, mogayBomb: 1, scarletPotion: 1 } },
  ],
  great_rift: [
    { id: 'enc-rift-prowl', label: 'Хищники Великого Разлома', description: 'Giga Mantis и Fenny Bird помогают Разлому ощущаться последним диким краем мира перед Demons Law.', enemyKeys: ['gigaMantis', 'fennyBird'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 160, experience: 60, skillCoins: 14, magicCoins: 10, medicinalHerb: 2, antidote: 2, healingHerb: 1 } },
    { id: 'enc-rift-diver', label: 'Песчаные ныряльщики разлома', description: 'Desert Diver выныривает из горячих трещин и тащит путников вглубь шторма.', enemyKeys: ['desertDiver', 'gigaMantis'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 175, experience: 66, skillCoins: 15, magicCoins: 11, mogayBomb: 1, paralysisSalve: 1 } },
  ],
  valmar_body: [
    { id: 'enc-valmar-body', label: 'Живые ткани Вальмара', description: 'Immune Cell и Valmar Moth лучше передают органический внутренний бестиарий этого late-midgame данжа.', enemyKeys: ['immuneCell', 'valmarMoth', 'valmarMoth'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 180, experience: 68, skillCoins: 15, magicCoins: 11, medicinalHerb: 2, antidote: 2, panacea: 1 } },
    { id: 'enc-body-hunt', label: 'Охотники живой плоти', description: 'Tarantula и Immune Cell выходят на охоту в венах тела Вальмара.', enemyKeys: ['tarantula', 'immuneCell'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 200, experience: 74, skillCoins: 16, magicCoins: 12, purifyingHerb: 1, caterpillarSoup: 1 } },
    { id: 'enc-body-bats', label: 'Рой мозговых летунов', description: 'Brain Bat и Venomous Larva защищают живые коридоры тела Вальмара.', enemyKeys: ['brainBat', 'venomousLarva'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 205, experience: 76, skillCoins: 16, magicCoins: 12, eyeDrops: 1, caterpillarSoup: 1 } },
    { id: 'enc-body-freezer', label: 'Ледяной динозавр', description: 'Dino Freezer замораживает вены и преграждает путь своим ледяным дыханием.', enemyKeys: ['dinoFreezer', 'brainBat'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 215, experience: 80, skillCoins: 17, magicCoins: 13, paralysisSalve: 1, scarletPotion: 1 } },
  ],
  valmars_moon: [
    { id: 'enc-moon-guard', label: 'Стражи Луны', description: 'Nyarmot, Salamadile и Evil Maneuver лучше соответствуют экосистеме Луны Вальмара и позднему давлению маршрута.', enemyKeys: ['nyarmot', 'salamadile', 'evilManeuver'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 210, experience: 74, skillCoins: 16, magicCoins: 12, medicinalHerb: 2, antidote: 2, yomisElixir: 1 } },
    { id: 'enc-moon-young', label: 'Молодь Вальмара', description: 'Valmar Fly и Valmar Young роятся у лунных колонн, защищая внутренние узлы.', enemyKeys: ['valmarFly', 'valmarYoung'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 240, experience: 84, skillCoins: 18, magicCoins: 14, scarletPotion: 1, meteorScroll: 1 } },
  ],
  birthplace_of_the_gods: [
    { id: 'enc-birthplace-guardians', label: 'Древние хранители', description: 'Dragon Knight и Valmar Magna делают Исток богов более похожим на поздний древний bestiary-порог, а не на generic guardian room.', enemyKeys: ['dragonKnight', 'valmarMagna'], theme: 'ruins', openingAdvantage: 'neutral', rewards: { gold: 240, experience: 82, skillCoins: 18, magicCoins: 14, medicinalHerb: 2, antidote: 2, healingIncense: 1 } },
    { id: 'enc-birthplace-yeti', label: 'Ледяные стражи истока', description: 'Yeti и Dragon Knight охраняют цветные механизмы древнего комплекса.', enemyKeys: ['yeti', 'dragonKnight'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 260, experience: 90, skillCoins: 20, magicCoins: 16, paralysisSalve: 1, manaCrystal: 1 } },
    { id: 'enc-birthplace-ancients', label: 'Древние воины архива', description: 'Ancient Warrior и Death Doberman сторожат залы правды Истока богов.', enemyKeys: ['ancientWarrior', 'deathDoberman'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 270, experience: 94, skillCoins: 20, magicCoins: 16, scarletPotion: 1, meteorScroll: 1 } },
    { id: 'enc-birthplace-emerald', label: 'Изумрудный дозор', description: 'Emerald Bird реет над цветными механизмами и срывает заклинания путников.', enemyKeys: ['emeraldBird', 'ancientWarrior'], theme: 'ruins', openingAdvantage: 'enemies', rewards: { gold: 280, experience: 98, skillCoins: 21, magicCoins: 17, healingIncense: 1, seedOfMagic: 1 } },
  ],
  new_valmar: [
    { id: 'enc-new-valmar-vanguard', label: 'Передовые ужасы Нового Вальмара', description: 'Killer Tree, Mind Eater и Valmar Moth превращают финальный данж в более оригинально-чужой late-game bestiary слой.', enemyKeys: ['killerTree', 'mindEater', 'valmarMoth'], theme: 'volcano', openingAdvantage: 'enemies', rewards: { gold: 280, experience: 92, skillCoins: 20, magicCoins: 16, medicinalHerb: 3, antidote: 2, panacea: 1, yomisElixir: 1 } },
  ],
};

const BEAT_OBJECTIVE_FLAGS = {
  carbo_contract: ['flag_carbo_departure'],
  millenia_first_attack: ['flag_millenia_presence'],
  agear_roan: ['flag_durham_roan_found'],
  liligue_and_mareg: ['flag_liligue_seals'],
  st_heim_zera: ['flag_stheim_second_audience'],
  cyrum_and_claws: ['flag_plant_pipe'],
  garlan_return: ['flag_garlan_night'],
  melfice_duel: ['flag_plateau_memory'],
  nanan_and_cyclone: ['flag_demons_law'],
  granasaber_ship: ['flag_valmar_body_core'],
  cathedral_massacre: ['flag_stheim_massacre_entry'],
  zera_revealed: ['flag_zera_reveal_path'],
  moon_assault: ['flag_moon_womb_route'],
  cyrum_defense: ['flag_cyrum_war_room'],
  birthplace_descent: ['flag_birthplace_truth', 'flag_birthplace_red'],
  inner_trial: ['flag_inner_trial_accept'],
  zera_inside_valmar: ['flag_new_valmar_chaos', 'flag_scene_room_of_chaos_echo'],
  true_finale: ['flag_true_finale_core'],
};

const QUEST_FLAG_LABELS = {
  flag_carbo_briefed: 'Выслушан Кариус в Карбо',
  flag_carbo_song_heard: 'Услышана песнь Елены',
  flag_carbo_inn_meeting: 'Получена трактирная сводка от Кариуса',
  flag_carbo_departure: 'Путь из Карбо официально открыт',
  flag_carbo_night_watch: 'Ночная стража в Карбо проведена',
  flag_millenia_presence: 'Присутствие Миллении осознано',
  flag_agear_briefed: 'Получена сводка о беде Агира',
  flag_agear_roan_plea: 'Стало известно, что Роан ушёл в Durham Cave',
  flag_durham_bridge: 'Мосты и рычаги Durham Cave пройдены',
  flag_durham_roan_found: 'След Роана найден в глубине пещеры',
  flag_liligue_gadan: 'Выслушан Гадан о руинах Лилига',
  flag_liligue_seals: 'Печати руин Лилига вскрыты',
  flag_stheim_inn_stay: 'Партия переночевала в St. Heim',
  flag_stheim_first_audience: 'Первая аудиенция у Зеры проведена',
  flag_stheim_library: 'Проверены книги Сент-Хейма',
  flag_stheim_balcony: 'Завершена балконная сцена St. Heim',
  flag_stheim_second_audience: 'Получен официальный выход из St. Heim',
  flag_cyrum_inn: 'Ночь в Цайруме завершена',
  flag_cyrum_hemble: 'Сцена на площади Цайрума завершена',
  flag_cyrum_juice: 'Городская сцена с напитком закрыта',
  flag_cyrum_port: 'Путь к secret passage через порт открыт',
  flag_cyrum_passage: 'Тайный проход Цайрума вскрыт',
  flag_plant_terminal: 'Терминалы underground plant включены',
  flag_plant_pipe: 'Маршрут к control room проложен',
  flag_garlan_past: 'Рюдо столкнулся с прошлым в Гарлане',
  flag_garlan_night: 'Ночная сцена Гарлана завершена',
  flag_grail_shrine: 'След у святилища на Grail Mountain найден',
  flag_plateau_memory: 'Путь к Plateau of Memories закрыт как сюжетный шаг',
  flag_nanan_edge: 'Понята роль Нанана на краю мира',
  flag_rift_cross: 'Путь через восточный лес к Разлому найден',
  flag_demons_law: 'Путь к Demons Law открыт',
  flag_valmar_body_core: 'Сердцевина Тела Вальмара достигнута',
  flag_stheim_massacre_entry: 'Партия увидела падение St. Heim',
  flag_zera_reveal_path: 'Путь к разоблачению Зеры открыт',
  flag_moon_surface: 'Поверхность Луны Вальмара пройдена',
  flag_moon_womb_route: 'Открыт путь к Чреву Луны',
  flag_cyrum_war_room: 'Поздний Цайрум переведён в режим обороны',
  flag_birthplace_truth: 'Уловлена древняя правда Истока богов',
  flag_birthplace_blue: 'Синий механизм Истока богов активирован',
  flag_birthplace_yellow: 'Жёлтый механизм Истока богов активирован',
  flag_birthplace_red: 'Красный механизм Истока богов активирован',
  flag_inner_trial_accept: 'Рюдо принял внутреннее испытание',
  flag_new_valmar_will: 'Осознана последняя воля перед финалом',
  flag_new_valmar_outer: 'Пробит внешний барьер Нового Вальмара',
  flag_new_valmar_chaos: 'Открыт путь к Room of Chaos',
  flag_true_finale_core: 'Ядро финальной развязки достигнуто',
  flag_scene_carbo_store_hush: 'Увиден мирный бытовой тон лавки Карбо',
  flag_scene_carbo_house_farewell: 'Увиден тихий бытовой farewell-момент в доме Карбо',
  flag_scene_liligue_inn_evening: 'Пережита quiet-сцена в гостинице Лилига',
  flag_scene_liligue_engineer_bench: 'Выслушан инженерный быт Лилига',
  flag_scene_mirumu_inn_whispers: 'Услышан тревожный шёпот в трактире Мирумы',
  flag_scene_stheim_inn_arrival: 'Пережита первая ночь в святом городе',
  flag_scene_stheim_bakery_facade: 'Увиден мирный городской фасад St. Heim через пекарню',
  flag_scene_stheim_guestroom_evening: 'Пройдена вечерняя пауза в гостевой комнате',
  flag_scene_cyrum_inn_evening: 'Пройдена ночная сцена в гостинице Цайрума',
  flag_scene_cyrum_kings_burden: 'Роан столкнулся с весом дворца и власти',
  flag_scene_garlan_chief_resentment: 'Выслушан холодный суд Гарлана',
  flag_scene_garlan_store_cold_trade: 'Пережит холодный бытовой разговор в лавке Гарлана',
  flag_scene_grail_vow: 'Подъём к Грайлу стал личной клятвой',
  flag_scene_plateau_hush: 'Пережита тишина Плато воспоминаний',
  flag_scene_nanan_clan_council: 'Получен клановый совет Нанана',
  flag_scene_demons_law_console: 'Понята машинная природа Demons Law',
  flag_scene_stheim_audience_ruin: 'Увиден поздний зал аудиенций без маски',
  flag_scene_zera_room_truth: 'Осмотрен личный кабинет Зеры как улика',
  flag_scene_cyrum_front_command: 'Проведён совет на южном фронте Цайрума',
  flag_scene_birthplace_truth_hall: 'Прочитан первый зал правды в Истоке богов',
  flag_scene_birthplace_blue: 'Открыт синий архивный зал Истока богов',
  flag_scene_birthplace_yellow: 'Открыт жёлтый архивный зал Истока богов',
  flag_scene_new_valmar_vein_whisper: 'Услышан шёпот живого Нового Вальмара',
  flag_scene_new_valmar_vein_choir: 'Услышан хор живых стен Нового Вальмара',
  flag_scene_room_of_chaos_echo: 'Пережиты ложные голоса Комнаты Хаоса',
  flag_scene_new_valmar_core_threshold: 'Пересечён финальный порог к ядру',
  flag_scene_new_valmar_core_judgement: 'Выслушан приговор ложным богам в ядре',
  flag_setpiece_carbo_departure: 'Просмотрена bespoke-сцена первого шага escort-маршрута из Карбо',
  flag_setpiece_garmia_catastrophe: 'Просмотрена bespoke-сцена катастрофы в Гармии',
  flag_setpiece_millenia_attack: 'Просмотрена bespoke-сцена ночной атаки Миллении',
  flag_setpiece_agear_rescue: 'Просмотрена bespoke-сцена спасения Роана в Durham Cave',
  flag_setpiece_stheim_sanction: 'Просмотрена bespoke-сцена скрытого церковного давления St. Heim',
  flag_setpiece_melfice_duel: 'Просмотрена bespoke-сцена дуэли с Мелфисом',
  flag_setpiece_garlan_homecoming: 'Просмотрена bespoke-сцена враждебного возвращения в Гарлан',
  flag_setpiece_nanan_cyclone: 'Просмотрена bespoke-сцена прорыва через циклон Великого Разлома',
  flag_setpiece_moon_siege: 'Просмотрена bespoke-сцена штурма Луны',
  flag_setpiece_granasaber_reveal: 'Просмотрена bespoke-сцена reveal Granasaber',
  flag_setpiece_cathedral_massacre: 'Просмотрена bespoke-сцена Дня Тьмы в соборе',
  flag_setpiece_zera_reveal: 'Просмотрена bespoke-сцена разоблачения Зеры',
  flag_setpiece_cyrum_defense: 'Просмотрена bespoke-сцена обороны позднего Цайрума',
  flag_setpiece_birthplace_descent: 'Просмотрена bespoke-сцена нисхождения в Исток богов',
  flag_setpiece_inner_trial_vision: 'Просмотрена bespoke-сцена Inner Trial',
  flag_setpiece_room_of_chaos: 'Просмотрена bespoke-сцена Room of Chaos',
  flag_setpiece_true_finale: 'Просмотрена bespoke-сцена финала Вальмара',
};

const GROWTH_NODES = [
  { id: 'global_field_discipline', label: 'Field Discipline', category: 'skill-book', costSkill: 12, costMagic: 0, targetKey: null, bonuses: { maxHp: 10, vit: 1 }, description: 'Базовая выживаемость для всей партии.' },
  { id: 'global_mana_attunement', label: 'Mana Egg Attunement', category: 'mana-egg', costSkill: 0, costMagic: 10, targetKey: null, bonuses: { maxMp: 4, men: 1 }, description: 'Общее повышение магической ёмкости и устойчивости.' },
  { id: 'ryudo_sword_book', label: 'Ryudo: Sword Book', category: 'skill-book', costSkill: 10, costMagic: 0, targetKey: 'ryudo', bonuses: { str: 3, agi: 1 }, description: 'Лучше вскрывает single-target цели.' },
  { id: 'ryudo_survivor_book', label: 'Ryudo: Survivor Book', category: 'skill-book', costSkill: 14, costMagic: 0, targetKey: 'ryudo', bonuses: { maxHp: 24, vit: 2 }, description: 'Больше выживаемости для фронтовика.' },
  { id: 'ryudo_slayer_book', label: 'Ryudo: Slayer Book', category: 'skill-book', costSkill: 18, costMagic: 4, targetKey: 'ryudo', bonuses: { str: 4, spd: 1 }, description: 'Поздний рост урона и темпа для Рюдо.' },
  { id: 'elena_prayer_book', label: 'Elena: Prayer Book', category: 'skill-book', costSkill: 8, costMagic: 6, targetKey: 'elena', bonuses: { mag: 3, men: 2 }, description: 'Усиление поддержки и heal pressure.' },
  { id: 'elena_holy_egg', label: 'Elena: Holy Egg', category: 'mana-egg', costSkill: 0, costMagic: 12, targetKey: 'elena', bonuses: { maxMp: 10, mag: 2 }, description: 'Чуть выше магический ресурс и сила заклинаний.' },
  { id: 'elena_songstress_codex', label: 'Elena: Songstress Codex', category: 'mana-egg', costSkill: 4, costMagic: 16, targetKey: 'elena', bonuses: { mag: 3, men: 3, maxMp: 6 }, description: 'Укрепляет роль Elena как главного саппорта.' },
  { id: 'roan_command_book', label: 'Roan: Command Book', category: 'skill-book', costSkill: 10, costMagic: 5, targetKey: 'roan', bonuses: { agi: 2, mag: 2, men: 1 }, description: 'Тактический рост принца.' },
  { id: 'roan_regalia_book', label: 'Roan: Regalia Book', category: 'skill-book', costSkill: 12, costMagic: 8, targetKey: 'roan', bonuses: { maxHp: 18, men: 2, mag: 2 }, description: 'Укрепляет роль Roan как королевской поддержки.' },
  { id: 'mareg_hunter_book', label: 'Mareg: Hunter Book', category: 'skill-book', costSkill: 14, costMagic: 0, targetKey: 'mareg', bonuses: { str: 4, vit: 2 }, description: 'Упор в тяжёлый фронтлайн.' },
  { id: 'mareg_ferocity_book', label: 'Mareg: Ferocity Book', category: 'skill-book', costSkill: 20, costMagic: 0, targetKey: 'mareg', bonuses: { str: 5, maxHp: 18 }, description: 'Делает Марега позднеигровым бруизером.' },
  { id: 'tio_tuning_book', label: 'Tio: Tuning Book', category: 'mana-egg', costSkill: 4, costMagic: 12, targetKey: 'tio', bonuses: { spd: 3, mag: 2 }, description: 'Скорость и контроль для Тио.' },
  { id: 'tio_logic_array', label: 'Tio: Logic Array', category: 'mana-egg', costSkill: 6, costMagic: 16, targetKey: 'tio', bonuses: { spd: 2, agi: 2, mag: 2, men: 1 }, description: 'Разгоняет тактическую скорость и универсальность Tio.' },
  { id: 'millenia_valmar_egg', label: 'Millenia: Valmar Egg', category: 'mana-egg', costSkill: 0, costMagic: 14, targetKey: 'millenia', bonuses: { mag: 4, agi: 2 }, description: 'Урон и темп для Миллении.' },
  { id: 'millenia_chaos_book', label: 'Millenia: Chaos Book', category: 'mana-egg', costSkill: 4, costMagic: 18, targetKey: 'millenia', bonuses: { mag: 5, maxMp: 8 }, description: 'Позднеигровый рост burst-магии Миллении.' },
  { id: 'party_resolve_book', label: 'Party Resolve', category: 'skill-book', costSkill: 18, costMagic: 6, targetKey: null, bonuses: { maxHp: 14, str: 1, men: 1 }, description: 'Общий буст партии к лейтгейму.' },
  { id: 'party_arcana_egg', label: 'Party Arcana Egg', category: 'mana-egg', costSkill: 6, costMagic: 18, targetKey: null, bonuses: { maxMp: 6, mag: 1, spd: 1 }, description: 'Общий рост магического темпа.' },
  { id: 'party_true_granasaber', label: 'Party True Granasaber Doctrine', category: 'skill-book', costSkill: 26, costMagic: 12, targetKey: null, bonuses: { str: 2, mag: 2, maxHp: 18, maxMp: 6 }, description: 'Финальный мультибуст под последнюю часть кампании.' },
];

const GROWTH_NODE_RULES = {
  global_mana_attunement: { requiresLevel: 2 },
  ryudo_survivor_book: { requiresLevel: 2, requiresNodes: ['ryudo_sword_book'] },
  ryudo_slayer_book: { requiresLevel: 4, requiresNodes: ['ryudo_survivor_book'] },
  elena_holy_egg: { requiresLevel: 2, requiresNodes: ['elena_prayer_book'] },
  elena_songstress_codex: { requiresLevel: 4, requiresNodes: ['elena_holy_egg'] },
  roan_command_book: { requiresLevel: 3 },
  roan_regalia_book: { requiresLevel: 4, requiresNodes: ['roan_command_book'] },
  mareg_hunter_book: { requiresLevel: 3 },
  mareg_ferocity_book: { requiresLevel: 5, requiresNodes: ['mareg_hunter_book'] },
  tio_tuning_book: { requiresLevel: 3 },
  tio_logic_array: { requiresLevel: 5, requiresNodes: ['tio_tuning_book'] },
  millenia_valmar_egg: { requiresLevel: 4 },
  millenia_chaos_book: { requiresLevel: 6, requiresNodes: ['millenia_valmar_egg'] },
  party_resolve_book: { requiresLevel: 4, requiresNodes: ['global_field_discipline'] },
  party_arcana_egg: { requiresLevel: 5, requiresNodes: ['global_mana_attunement'] },
  party_true_granasaber: { requiresLevel: 7, requiresNodes: ['party_resolve_book', 'party_arcana_egg'] },
};

const QUEST_CHAINS = {
  carbo_contract: {
    title: 'Carbo opening chain',
    steps: [
      { flagId: 'flag_carbo_briefed', label: 'Поговорить с Кариусом в церкви', locationId: 'carbo_church' },
      { flagId: 'flag_carbo_song_heard', label: 'Услышать песнь Елены', locationId: 'carbo_church' },
      { flagId: 'flag_scene_carbo_store_hush', label: 'Зайти в лавку и почувствовать спокойный ритм Карбо', locationId: 'carbo_store' },
      { flagId: 'flag_scene_carbo_house_farewell', label: 'Зайти в обычный дом и увидеть мир, который партия оставляет позади', locationId: 'carbo_house_2' },
      { flagId: 'flag_carbo_inn_meeting', label: 'Получить задание в Carbo Inn', locationId: 'carbo_inn' },
      { flagId: 'flag_carbo_departure', label: 'Подготовить уход из Карбо', locationId: 'carbo_village' },
    ],
  },
  millenia_first_attack: {
    title: 'Millenia night attack chain',
    steps: [
      { flagId: 'flag_carbo_night_watch', label: 'Переждать тревожную ночь в Карбо', locationId: 'carbo_inn' },
      { flagId: 'flag_millenia_presence', label: 'Осознать вторжение Миллении', locationId: 'carbo_village' },
    ],
  },
  agear_roan: {
    title: 'Agear and Durham Cave chain',
    steps: [
      { flagId: 'flag_agear_briefed', label: 'Собрать сведения о беде Агира', locationId: 'agear_inn' },
      { flagId: 'flag_agear_roan_plea', label: 'Узнать о безрассудстве Роана', locationId: 'agear_town' },
      { flagId: 'flag_durham_bridge', label: 'Продвинуться по Durham Cave', locationId: 'durham_cave_entrance' },
      { flagId: 'flag_durham_roan_found', label: 'Найти след Роана в глубине', locationId: 'durham_cave_entrance' },
    ],
  },
  liligue_and_mareg: {
    title: 'Liligue ruins chain',
    steps: [
      { flagId: 'flag_scene_liligue_inn_evening', label: 'Провести quiet-вечер в гостинице Лилига', locationId: 'liligue_inn' },
      { flagId: 'flag_scene_liligue_engineer_bench', label: 'Зайти в дом инженеров и услышать городской быт', locationId: 'liligue_engineer_house' },
      { flagId: 'flag_liligue_gadan', label: 'Выслушать Гадана', locationId: 'liligue_gadan_house' },
      { flagId: 'flag_liligue_seals', label: 'Разобраться с печатями в пещере', locationId: 'liligue_cave' },
    ],
  },
  st_heim_zera: {
    title: 'St. Heim political chain',
    steps: [
      { flagId: 'flag_stheim_inn_stay', label: 'Переночевать в St. Heim', locationId: 'st_heim_inn' },
      { flagId: 'flag_scene_stheim_inn_arrival', label: 'Пережить первую ночь в святом городе', locationId: 'st_heim_inn' },
      { flagId: 'flag_stheim_first_audience', label: 'Первая аудиенция у Зеры', locationId: 'st_heim_audience_chamber' },
      { flagId: 'flag_stheim_library', label: 'Осмотреть библиотеку', locationId: 'st_heim_library' },
      { flagId: 'flag_scene_stheim_bakery_facade', label: 'Увидеть мирный городской фасад через маленькие комнаты St. Heim', locationId: 'st_heim_bakery' },
      { flagId: 'flag_scene_stheim_guestroom_evening', label: 'Провести quiet-сцену в гостевой комнате', locationId: 'st_heim_guestroom' },
      { flagId: 'flag_stheim_balcony', label: 'Поговорить на балконе', locationId: 'st_heim_balcony' },
      { flagId: 'flag_stheim_second_audience', label: 'Вторая аудиенция и выход из города', locationId: 'st_heim_audience_chamber' },
    ],
  },
  cyrum_and_claws: {
    title: 'Cyrum infiltration chain',
    steps: [
      { flagId: 'flag_cyrum_inn', label: 'Переночевать в Цайруме', locationId: 'cyrum_inn' },
      { flagId: 'flag_scene_cyrum_inn_evening', label: 'Прожить ночную сцену в гостинице', locationId: 'cyrum_inn' },
      { flagId: 'flag_cyrum_hemble', label: 'Пройти сцену на площади', locationId: 'cyrum_castle_square' },
      { flagId: 'flag_cyrum_juice', label: 'Завершить городскую сцену с напитком', locationId: 'cyrum_castle_square' },
      { flagId: 'flag_scene_cyrum_kings_burden', label: 'Зайти в королевские покои и услышать линию Роана', locationId: 'cyrum_kings_chamber' },
      { flagId: 'flag_cyrum_port', label: 'Подойти к порту и тайному пути', locationId: 'cyrum_port' },
      { flagId: 'flag_cyrum_passage', label: 'Продвинуться по secret passage', locationId: 'cyrum_secret_passage' },
      { flagId: 'flag_plant_terminal', label: 'Включить терминалы underground plant', locationId: 'underground_plant' },
      { flagId: 'flag_plant_pipe', label: 'Провести партию к control room', locationId: 'underground_plant' },
    ],
  },
  garlan_return: {
    title: 'Garlan return chain',
    steps: [
      { flagId: 'flag_garlan_past', label: 'Осмотреть дом Рюдо', locationId: 'ryudo_house' },
      { flagId: 'flag_scene_garlan_chief_resentment', label: 'Зайти к старосте и выслушать холодный суд деревни', locationId: 'garlan_chief_house' },
      { flagId: 'flag_scene_garlan_store_cold_trade', label: 'Зайти в лавку и почувствовать бытовой холод Гарлана', locationId: 'garlan_store' },
      { flagId: 'flag_garlan_night', label: 'Переночевать в деревне', locationId: 'garlan_inn' },
    ],
  },
  melfice_duel: {
    title: 'Grail Mountain duel chain',
    steps: [
      { flagId: 'flag_scene_grail_vow', label: 'Поднять личную клятву на склонах Грайла', locationId: 'grail_mountain' },
      { flagId: 'flag_grail_shrine', label: 'Дойти до святилища и получить след Мелфиса', locationId: 'grail_mountain' },
      { flagId: 'flag_scene_plateau_hush', label: 'Пережить тишину Плато воспоминаний', locationId: 'plateau_of_memories' },
      { flagId: 'flag_plateau_memory', label: 'Выйти на Plateau of Memories', locationId: 'plateau_of_memories' },
    ],
  },
  nanan_and_cyclone: {
    title: 'Nanan and Great Rift chain',
    steps: [
      { flagId: 'flag_nanan_edge', label: 'Понять значение Нанана', locationId: 'nanan_village' },
      { flagId: 'flag_scene_nanan_clan_council', label: 'Зайти в северную лавку и получить клановый совет', locationId: 'nanan_store' },
      { flagId: 'flag_rift_cross', label: 'Найти путь к Разлому', locationId: 'ghoss_forest_east' },
      { flagId: 'flag_demons_law', label: 'Открыть путь к Demons Law', locationId: 'great_rift' },
    ],
  },
  granasaber_ship: {
    title: 'Valmar body / true Granasaber chain',
    steps: [
      { flagId: 'flag_scene_demons_law_console', label: 'Прочитать Demons Law как древнюю машину', locationId: 'demons_law' },
      { flagId: 'flag_valmar_body_core', label: 'Дойти до сердцевины Тела Вальмара', locationId: 'valmar_body' },
    ],
  },
  cathedral_massacre: {
    title: 'Day of Darkness chain',
    steps: [
      { flagId: 'flag_stheim_massacre_entry', label: 'Войти в разваливающийся St. Heim', locationId: 'st_heim_cathedral_lobby' },
    ],
  },
  zera_revealed: {
    title: 'Zera reveal chain',
    steps: [
      { flagId: 'flag_scene_stheim_audience_ruin', label: 'Пройти поздний зал аудиенций', locationId: 'st_heim_audience_chamber' },
      { flagId: 'flag_scene_zera_room_truth', label: 'Осмотреть комнату Зеры', locationId: 'zera_room' },
      { flagId: 'flag_zera_reveal_path', label: 'Открыть путь к разоблачению Зеры', locationId: 'st_heim_forbidden_room' },
    ],
  },
  moon_assault: {
    title: 'Valmar Moon chain',
    steps: [
      { flagId: 'flag_moon_surface', label: 'Пройти внешний слой Луны', locationId: 'valmars_moon' },
      { flagId: 'flag_moon_womb_route', label: 'Открыть путь к Чреву Луны', locationId: 'valmars_moon' },
    ],
  },
  cyrum_defense: {
    title: 'Late Cyrum defense chain',
    steps: [
      { flagId: 'flag_scene_cyrum_front_command', label: 'Провести совет на южном фронте', locationId: 'cyrum_kingdom_south' },
      { flagId: 'flag_cyrum_war_room', label: 'Перевести Цайрум в режим обороны', locationId: 'cyrum_kingdom' },
    ],
  },
  birthplace_descent: {
    title: 'Birthplace of the Gods chain',
    steps: [
      { flagId: 'flag_birthplace_truth', label: 'Собрать древнюю правду', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_truth_hall', label: 'Прочитать первый зал правды', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_blue', label: 'Синий механизм', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_blue', label: 'Открыть синий архивный зал', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_yellow', label: 'Жёлтый механизм', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_scene_birthplace_yellow', label: 'Открыть жёлтый архивный зал', locationId: 'birthplace_of_the_gods' },
      { flagId: 'flag_birthplace_red', label: 'Красный механизм', locationId: 'birthplace_of_the_gods' },
    ],
  },
  inner_trial: {
    title: 'Inner trial chain',
    steps: [
      { flagId: 'flag_inner_trial_accept', label: 'Принять внутреннее испытание', locationId: 'inner_trial' },
    ],
  },
  zera_inside_valmar: {
    title: 'New Valmar chain',
    steps: [
      { flagId: 'flag_new_valmar_will', label: 'Услышать волю перед финалом', locationId: 'new_valmar' },
      { flagId: 'flag_scene_new_valmar_vein_whisper', label: 'Пережить шёпот живого данжа', locationId: 'new_valmar' },
      { flagId: 'flag_scene_new_valmar_vein_choir', label: 'Пережить хор живых стен и вторую волну навязанной воли', locationId: 'new_valmar' },
      { flagId: 'flag_new_valmar_outer', label: 'Пробить внешний органический барьер', locationId: 'new_valmar' },
      { flagId: 'flag_new_valmar_chaos', label: 'Открыть Room of Chaos', locationId: 'new_valmar' },
      { flagId: 'flag_scene_room_of_chaos_echo', label: 'Пережить вторую волну лжи в Room of Chaos', locationId: 'new_valmar_room_of_chaos' },
    ],
  },
  true_finale: {
    title: 'True finale chain',
    steps: [
      { flagId: 'flag_scene_new_valmar_core_threshold', label: 'Пересечь порог к ядру', locationId: 'new_valmar_core' },
      { flagId: 'flag_scene_new_valmar_core_judgement', label: 'Выслушать приговор ложным богам', locationId: 'new_valmar_core' },
      { flagId: 'flag_true_finale_core', label: 'Дойти до ядра финальной развязки', locationId: 'new_valmar_core' },
    ],
  },
};

const EXIT_REQUIREMENTS = {
  carbo_village: { black_forest: ['flag_carbo_departure'] },
  garmia_tower: { garmia_tower_top: ['flag_garmia_floor1', 'flag_garmia_window'] },
  agear_town: { durham_cave_entrance: ['flag_agear_roan_plea'] },
  durham_cave_entrance: { durham_cave_depths: ['flag_durham_bridge', 'flag_durham_roan_found'] },
  liligue_city: { liligue_cave: ['flag_liligue_gadan'] },
  liligue_cave: { liligue_temple_ruins: ['flag_liligue_seals'] },
  st_heim_papal_state: { pilgrim_road: ['flag_stheim_second_audience'] },
  cyrum_kingdom: { cyrum_secret_passage: ['flag_cyrum_port'], cyrum_kingdom_south: ['flag_cyrum_war_room'] },
  cyrum_secret_passage: { underground_plant: ['flag_cyrum_passage'] },
  underground_plant: { underground_control_room: ['flag_plant_terminal', 'flag_plant_pipe'] },
  garlan_village: { grail_mountain: ['flag_garlan_night'] },
  grail_mountain: { plateau_of_memories: ['flag_grail_shrine'] },
  nanan_village: { great_rift: ['flag_rift_cross'] },
  ghoss_forest_east: { great_rift: ['flag_rift_cross'] },
  great_rift: { demons_law: ['flag_demons_law'] },
  valmar_body: { st_heim_papal_state: ['flag_valmar_body_core'] },
  st_heim_cathedral_lobby: { st_heim_audience_chamber: ['flag_stheim_massacre_entry'] },
  st_heim_forbidden_room: { valmars_moon: ['flag_zera_reveal_path'] },
  valmars_moon: { valmars_womb: ['flag_moon_surface'] },
  cyrum_kingdom_south: { birthplace_of_the_gods: ['flag_cyrum_war_room'] },
  raul_hills: { raul_hills_special: ['flag_cyrum_war_room'] },
  birthplace_of_the_gods: { inner_trial: ['flag_birthplace_truth'], new_valmar: ['flag_birthplace_truth', 'flag_birthplace_red'] },
  new_valmar: { new_valmar_room_of_chaos: ['flag_new_valmar_outer'], new_valmar_core: ['flag_new_valmar_chaos'] },
};

const ADDITIONAL_WORLD_EVENTS_BY_LOCATION = {
  carbo_inn: [

    { id: 'carbo-inn-meeting', label: 'Встретиться с Кариусом в трактире', text: 'Кариус объясняет, почему сопровождение Елены — уже не обычный контракт, а опасный путь к ритуалу.', requiresFlags: ['flag_carbo_briefed'], setFlags: ['flag_carbo_inn_meeting'], rewards: { experience: 10, skillCoins: 2, magicCoins: 2, setFlags: ['flag_carbo_inn_meeting'] } },
    { id: 'carbo-night-watch', label: 'Остаться на ночной страже', text: 'Тревога нарастает, и ночь в Карбо уже не кажется безопасной. Именно сейчас в воздухе чувствуется присутствие Миллении.', allowedBeatIds: ['millenia_first_attack'], requiresFlags: ['flag_carbo_departure'], setFlags: ['flag_carbo_night_watch'], rewards: { experience: 12, skillCoins: 2, magicCoins: 3, setFlags: ['flag_carbo_night_watch'] } },
  
  ],
  carbo_village: [

    { id: 'carbo-departure', label: 'Подготовить выход из деревни', text: 'После разговора с Кариусом, песни Елены, quiet-паузы в лавке и короткого взгляда на обычную жизнь Карбо деревня остаётся позади — пора идти в Black Forest.', requiresFlags: ['flag_carbo_briefed', 'flag_carbo_song_heard', 'flag_scene_carbo_store_hush', 'flag_scene_carbo_house_farewell', 'flag_carbo_inn_meeting'], setFlags: ['flag_carbo_departure'], rewards: { experience: 12, skillCoins: 2, magicCoins: 2, setFlags: ['flag_carbo_departure'] } },
    { id: 'carbo-millenia-sign', label: 'Почуять вмешательство Миллении', text: 'Даже до прямой атаки становится ясно: в Карбо появилась чужая, насмешливая и слишком сильная воля.', allowedBeatIds: ['millenia_first_attack'], requiresFlags: ['flag_carbo_night_watch'], setFlags: ['flag_millenia_presence'], rewards: { experience: 14, skillCoins: 2, magicCoins: 4, setFlags: ['flag_millenia_presence'] } },
  ,
    { id: 'carbo-herb-garden', label: 'Собрать травы у забора', text: 'За деревенским забором растут дикие лечебные травы — редкая удача для такого места.', rewards: { medicinalHerb: 1, poffNut: 1 } },
  
  ],
  garmia_tower: [

    { id: 'garmia-lower-floors', label: 'Пробиться через нижние этажи', text: 'Первые этажи башни уже потеряны. Партия поднимается выше сквозь хаос.', setFlags: ['flag_garmia_floor1'], rewards: { experience: 14, skillCoins: 3, magicCoins: 2, setFlags: ['flag_garmia_floor1'] } },
    { id: 'garmia-window-route', label: 'Найти путь через разбитое окно', text: 'Обычный путь наверх сорван, остаётся только опасный маршрут к верхней площадке.', requiresFlags: ['flag_garmia_floor1'], setFlags: ['flag_garmia_window'], rewards: { experience: 14, skillCoins: 3, magicCoins: 3, setFlags: ['flag_garmia_window'] } },
  
  ],
  agear_town: [

    { id: 'agear-roan-plea', label: 'Услышать о Роане и медали', text: 'Становится ясно: Роан уже ушёл в Durham Cave, и оставлять его там нельзя.', requiresFlags: ['flag_agear_briefed'], setFlags: ['flag_agear_roan_plea'], rewards: { experience: 12, skillCoins: 2, magicCoins: 2, setFlags: ['flag_agear_roan_plea'] } },
  ,
    { id: 'agear-poff-stranger', label: 'Взять орех у странника на руинах', text: 'Странник у разрушенного дома молча протягивает орех Poff и кивает в сторону пещеры.', rewards: { poffNut: 1 } },
  
  ],
  durham_cave_entrance: [

    { id: 'durham-bridges', label: 'Разблокировать мосты пещеры', text: 'Партия находит рычаги и начинает вскрывать пещеру слой за слоем.', requiresFlags: ['flag_agear_roan_plea'], setFlags: ['flag_durham_bridge'], rewards: { experience: 14, skillCoins: 3, magicCoins: 2, setFlags: ['flag_durham_bridge'] } },
    { id: 'durham-roan-trail', label: 'Найти след Роана', text: 'Следы и чудовища ведут всё глубже. Роан действительно впереди.', requiresFlags: ['flag_durham_bridge'], setFlags: ['flag_durham_roan_found'], rewards: { experience: 16, skillCoins: 3, magicCoins: 3, setFlags: ['flag_durham_roan_found'] } },
    { id: 'carro-feed-1', label: 'Покормить Карро (орех 1/3)', text: 'Странный грызун Карро смотрит на тебя голодными глазами. Он явно хочет орех Poff.', consumeItems: { poffNut: 1 }, rewards: { experience: 6, gold: 10 } },
    { id: 'carro-feed-2', label: 'Покормить Карро (орех 2/3)', text: 'Карро довольно хрустит вторым орехом и начинает вилять хвостом. Кажется, он узнаёт Рюдо.', consumeItems: { poffNut: 1 }, rewards: { experience: 8, gold: 15 } },
    { id: 'carro-feed-3', label: 'Покормить Карро (орех 3/3)', text: 'Третий орех — и Карро счастлив как никогда. Грызун приносит находку, которую прятал в норе.', consumeItems: { poffNut: 1 }, rewards: { experience: 12, gold: 30, equipmentIds: ['roan-multiple-knife'] } },
  
  ],
  liligue_cave: [

    { id: 'liligue-seals', label: 'Активировать руинные печати', text: 'Чтобы пройти дальше, нужно понять и открыть древние механизмы пещеры.', requiresFlags: ['flag_liligue_gadan'], setFlags: ['flag_liligue_seals'], rewards: { experience: 20, skillCoins: 4, magicCoins: 4, setFlags: ['flag_liligue_seals'] } },
  
  ],
  st_heim_inn: [

    { id: 'stheim-inn-stay', label: 'Переночевать в священном городе', text: 'Ночь в St. Heim меняет тон всей истории: теперь поход касается не только Елены, но и судьбы мира.', setFlags: ['flag_stheim_inn_stay'], rewards: { experience: 16, skillCoins: 2, magicCoins: 4, setFlags: ['flag_stheim_inn_stay'] } },
  
  ],
  st_heim_audience_chamber: [

    { id: 'stheim-first-audience', label: 'Первая аудиенция у Зеры', text: 'Зера формально даёт направление, но оставляет слишком много скрытых смыслов.', requiresFlags: ['flag_stheim_inn_stay', 'flag_scene_stheim_inn_arrival'], setFlags: ['flag_stheim_first_audience'], rewards: { experience: 18, skillCoins: 2, magicCoins: 4, setFlags: ['flag_stheim_first_audience'] } },
    { id: 'stheim-second-audience', label: 'Вернуться к Зере после библиотеки и балкона', text: 'После quiet-паузы в гостевой комнате, маленьких человеческих штрихов святого города и дополнительных разговоров план похода утверждается, и партия может двигаться дальше.', requiresFlags: ['flag_stheim_library', 'flag_scene_stheim_bakery_facade', 'flag_scene_stheim_guestroom_evening', 'flag_stheim_balcony'], setFlags: ['flag_stheim_second_audience'], rewards: { experience: 20, skillCoins: 3, magicCoins: 4, setFlags: ['flag_stheim_second_audience'] } },
  
  ],
  st_heim_guestroom: [

    { id: 'stheim-guestroom-reflection', label: 'Поговорить в гостевой комнате', text: 'Ночь в гостевой комнате подчёркивает, что путь в St. Heim уже меняет отношения внутри партии и повышает ставки.', requiresFlags: ['flag_stheim_first_audience'], rewards: { experience: 12, skillCoins: 1, magicCoins: 3 } },
  
  ],
  st_heim_balcony: [

    { id: 'stheim-balcony-talk', label: 'Поговорить на балконе о настоящей цене пути', text: 'Вдали от официальных речей становится понятно, что задание Зеры опаснее, чем звучит.', requiresFlags: ['flag_stheim_first_audience', 'flag_stheim_library', 'flag_scene_stheim_guestroom_evening'], setFlags: ['flag_stheim_balcony'], rewards: { experience: 16, skillCoins: 2, magicCoins: 4, setFlags: ['flag_stheim_balcony'] } },
  
  ],
  cyrum_inn: [

    { id: 'cyrum-inn-stay', label: 'Провести вечер в Цайруме', text: 'Ночь в Цайруме становится частью местной политической интриги и открывает новые сцены.', setFlags: ['flag_cyrum_inn'], rewards: { experience: 18, skillCoins: 3, magicCoins: 3, setFlags: ['flag_cyrum_inn'] } },
  
  ],
  cyrum_castle_square: [

    { id: 'cyrum-hemble-duel', label: 'Сцена с Хемблом на площади', text: 'Площадь Цайрума служит театром для безобидной с виду, но сюжетно важной городской сцены.', requiresFlags: ['flag_cyrum_inn', 'flag_scene_cyrum_inn_evening'], setFlags: ['flag_cyrum_hemble'], rewards: { experience: 18, skillCoins: 3, magicCoins: 3, setFlags: ['flag_cyrum_hemble'] } },
    { id: 'cyrum-juice-scene', label: 'Вернуться с напитком и закончить сцену', text: 'Мелкая бытовая сцена оказывается обязательной частью раскрытия местного ритма и состава партии.', requiresFlags: ['flag_cyrum_hemble'], setFlags: ['flag_cyrum_juice'], rewards: { experience: 18, skillCoins: 2, magicCoins: 4, setFlags: ['flag_cyrum_juice'] } },
  
  ],
  hemble_tent: [

    { id: 'hemble-arm-wrestle', label: 'Сыграть с Хемблом в армрестлинг', text: 'Хембл вызывает на руку. Три раунда: сила Рюдо против удачи и хватки чемпиона палатки. Две победы — и приз твой.', minigameArmWrestle: true, rewards: { experience: 30, skillCoins: 6, magicCoins: 4 } },
  
  ],
  cyrum_port: [

    { id: 'cyrum-port-brief', label: 'Подойти к порту и стражникам', text: 'Путь в secret passage подтверждён. Дальше начинается не городской эпизод, а вторжение внутрь замка.', requiresFlags: ['flag_cyrum_juice', 'flag_scene_cyrum_kings_burden'], setFlags: ['flag_cyrum_port'], rewards: { experience: 18, skillCoins: 2, magicCoins: 3, setFlags: ['flag_cyrum_port'] } },
    { id: 'cyrum-war-room-port', label: 'Собрать позднюю оборону Цайрума через порт', text: 'Поздний Цайрум уже не про праздник и дворцовую игру — это военный тыл, который надо организовать перед следующим походом.', allowedBeatIds: ['cyrum_defense'], requiresFlags: ['flag_zera_reveal_path', 'flag_scene_cyrum_front_command'], setFlags: ['flag_cyrum_war_room'], rewards: { experience: 26, skillCoins: 4, magicCoins: 4, setFlags: ['flag_cyrum_war_room'] } },
  ,
    { id: 'cyrum-firebomb-trade', label: 'Выменять бомбу у моряка', text: 'Моряк меняет пару огненных бомб на обещание «доложить, что творится под дворцом».', rewards: { firebomb: 1 } },
  
  ],
  cyrum_secret_passage: [

    { id: 'cyrum-passage-levers', label: 'Открыть тайный проход глубже', text: 'Лестницы, рычаги и скрытые двери ведут к нижним уровням замка.', requiresFlags: ['flag_cyrum_port'], setFlags: ['flag_cyrum_passage'], rewards: { experience: 20, skillCoins: 4, magicCoins: 3, setFlags: ['flag_cyrum_passage'] } },
  
  ],
  underground_plant: [

    { id: 'plant-terminals', label: 'Активировать терминалы', text: 'Механический комплекс подчиняется только после серии включений и обходных путей.', requiresFlags: ['flag_cyrum_passage'], setFlags: ['flag_plant_terminal'], rewards: { experience: 22, skillCoins: 4, magicCoins: 4, setFlags: ['flag_plant_terminal'] } },
    { id: 'plant-pipe-route', label: 'Перенастроить трубы и лифты', text: 'После терминалов партия строит реальный путь к control room.', requiresFlags: ['flag_plant_terminal'], setFlags: ['flag_plant_pipe'], rewards: { experience: 24, skillCoins: 4, magicCoins: 5, setFlags: ['flag_plant_pipe'] } },
  
  ],
  garlan_tombs: [

    { id: 'garlan-tombs-memory', label: 'Посетить могилы деревни', text: 'У могил атмосфера Гарлана чувствуется сильнее всего: вина и память здесь почти физически давят на Рюдо.', requiresFlags: ['flag_garlan_past'], rewards: { experience: 14, skillCoins: 3, magicCoins: 2 } },
  
  ],
  garlan_inn: [

    { id: 'garlan-night', label: 'Переночевать в Гарлане', text: 'Только после разговора со старостой, холодной бытовой сцены в лавке и тяжёлой ночи прошлое окончательно догоняет Рюдо.', allowedBeatIds: ['garlan_return'], requiresFlags: ['flag_garlan_past', 'flag_scene_garlan_chief_resentment', 'flag_scene_garlan_store_cold_trade'], setFlags: ['flag_garlan_night'], rewards: { experience: 20, skillCoins: 4, magicCoins: 2, setFlags: ['flag_garlan_night'] } },
  
  ],
  grail_mountain: [

    { id: 'grail-shrine-trace', label: 'Дойти до святилища и уловить след Мелфиса', text: 'Подъём к святилищу Грайл даёт партии не только высоту, но и более чёткое понимание, где произойдёт решающая встреча.', allowedBeatIds: ['melfice_duel'], requiresFlags: ['flag_garlan_night', 'flag_scene_grail_vow'], setFlags: ['flag_grail_shrine'], rewards: { experience: 22, skillCoins: 4, magicCoins: 3, setFlags: ['flag_grail_shrine'] } },
  
  ],
  plateau_of_memories: [

    { id: 'plateau-memory-step', label: 'Выйти на Plateau of Memories', text: 'Путь доведён до точки, где воспоминания и вина Рюдо больше нельзя отложить. Дальше уже только сама дуэль.', allowedBeatIds: ['melfice_duel'], requiresFlags: ['flag_grail_shrine', 'flag_scene_plateau_hush'], setFlags: ['flag_plateau_memory'], rewards: { experience: 24, skillCoins: 4, magicCoins: 4, setFlags: ['flag_plateau_memory'] } },
  
  ],
  ghoss_forest_east: [

    { id: 'ghoss-scout', label: 'Разведать путь к Разлому', text: 'Лес открывает маршрут к Великому Разлому только после внимательного поиска и совета Нанана.', requiresFlags: ['flag_nanan_edge', 'flag_scene_nanan_clan_council'], setFlags: ['flag_rift_cross'], rewards: { experience: 22, skillCoins: 4, magicCoins: 3, setFlags: ['flag_rift_cross'] } },
  
  ],
  great_rift: [

    { id: 'rift-demons-law', label: 'Открыть путь к Demons Law', text: 'Через ветер, мосты и древние структуры партия находит путь к следующему механизму.', requiresFlags: ['flag_rift_cross'], setFlags: ['flag_demons_law'], rewards: { experience: 24, skillCoins: 5, magicCoins: 4, setFlags: ['flag_demons_law'] } },
  
  ],
  demons_law: [

    { id: 'demons-law-control', label: 'Добраться до control room Demons Law', text: 'Партия продавливает древний комплекс глубже и глубже, пока не находит путь дальше, к новому слою ужаса.', requiresFlags: ['flag_demons_law'], rewards: { experience: 26, skillCoins: 5, magicCoins: 5 } },
  ,
    { id: 'demons-law-crystal', label: 'Извлечь кристалл маны из консоли', text: 'Из треснувшей консоли древней системы можно вытащить кристалл чистой маны.', rewards: { manaCrystal: 1, magicCoins: 4 } },
  ,
    { id: 'demons-law-medicine', label: 'Взять магическое снадобье', text: 'В сундуке контрольного зала лежит запас магической медицины старой экспедиции.', rewards: { magicalMedicine: 1, magicCoins: 4 } },
  
  ],
  valmar_body: [

    { id: 'valmar-body-core', label: 'Прорваться к сердцевине Тела Вальмара', text: 'После длинного органического маршрута партия доходит до сердцевины Тела Вальмара и получает право двигаться к следующей крупной развязке.', allowedBeatIds: ['granasaber_ship'], requiresFlags: ['flag_demons_law', 'flag_scene_demons_law_console'], setFlags: ['flag_valmar_body_core'], rewards: { experience: 28, skillCoins: 5, magicCoins: 5, setFlags: ['flag_valmar_body_core'] } },
  
  ],
  birthplace_of_the_gods: [

    { id: 'birthplace-blue', label: 'Активировать синий механизм', text: 'Первый древний механизм отвечает и перестраивает маршрут.', requiresFlags: ['flag_birthplace_truth', 'flag_scene_birthplace_truth_hall'], setFlags: ['flag_birthplace_blue'], rewards: { experience: 26, skillCoins: 4, magicCoins: 5, setFlags: ['flag_birthplace_blue'] } },
    { id: 'birthplace-yellow', label: 'Активировать жёлтый механизм', text: 'Второй древний блок открывает новые проходы ниже.', requiresFlags: ['flag_birthplace_blue', 'flag_scene_birthplace_blue'], setFlags: ['flag_birthplace_yellow'], rewards: { experience: 26, skillCoins: 4, magicCoins: 5, setFlags: ['flag_birthplace_yellow'] } },
    { id: 'birthplace-red', label: 'Активировать красный механизм', text: 'Третий и последний ключ делает доступным путь ещё глубже.', requiresFlags: ['flag_birthplace_yellow', 'flag_scene_birthplace_yellow'], setFlags: ['flag_birthplace_red'], rewards: { experience: 28, skillCoins: 5, magicCoins: 5, setFlags: ['flag_birthplace_red'] } },
  ,
    { id: 'birthplace-archive-seed', label: 'Ответить архиву и получить семя магии', text: 'Архив распознаёт исследователя и выдаёт семя магии из хранилища припасов.', rewards: { seedOfMagic: 1, magicCoins: 4 } },
    { id: 'birthplace-tickle-elmo', label: 'Пощекотать Эльмо', text: 'Маленький механический Эльмо в Истоке богов заливается смехом и выплёвывает редкий припас: «Ещё! Ещё!»', rewards: { heroElixir: 1, magicCoins: 6 } },
  
  ],
  inner_trial: [

    { id: 'inner-trial-accept', label: 'Принять внутреннее испытание', text: 'Рюдо больше не бежит от себя. Он входит в испытание уже как человек, который осознанно выбирает пройти через собственную тьму.', allowedBeatIds: ['inner_trial'], requiresFlags: ['flag_birthplace_truth'], setFlags: ['flag_inner_trial_accept'], rewards: { experience: 30, skillCoins: 6, magicCoins: 6, setFlags: ['flag_inner_trial_accept'] } },
  
  ],
  st_heim_cathedral_lobby: [

    { id: 'stheim-massacre-entry', label: 'Войти в Собор в день резни', text: 'Теперь St. Heim — уже не город визита, а место катастрофы. Этот вход открывает поздний церковный этап.', allowedBeatIds: ['cathedral_massacre'], setFlags: ['flag_stheim_massacre_entry'], rewards: { experience: 26, skillCoins: 4, magicCoins: 5, setFlags: ['flag_stheim_massacre_entry'] } },
  
  ],
  st_heim_forbidden_room: [

    { id: 'stheim-zera-reveal', label: 'Открыть путь к разоблачению Зеры', text: 'После позднего аудиенционного зала и личной комнаты Зеры становится ясно, кто и как управлял всей ложью этого мира.', allowedBeatIds: ['zera_revealed'], requiresFlags: ['flag_stheim_massacre_entry', 'flag_scene_stheim_audience_ruin', 'flag_scene_zera_room_truth'], setFlags: ['flag_zera_reveal_path'], rewards: { experience: 30, skillCoins: 5, magicCoins: 6, setFlags: ['flag_zera_reveal_path'] } },
  
  ],
  valmars_moon: [

    { id: 'moon-surface-push', label: 'Пройти поверхность Луны', text: 'Партия продавливает внешний слой Луны Вальмара и открывает путь глубже.', allowedBeatIds: ['moon_assault'], requiresFlags: ['flag_zera_reveal_path'], setFlags: ['flag_moon_surface'], rewards: { experience: 30, skillCoins: 5, magicCoins: 6, setFlags: ['flag_moon_surface'] } },
    { id: 'moon-womb-route', label: 'Открыть путь к Чреву Луны', text: 'После нескольких прорывов и защитных систем маршрут к внутреннему узлу Луны становится доступен.', allowedBeatIds: ['moon_assault'], requiresFlags: ['flag_moon_surface'], setFlags: ['flag_moon_womb_route'], rewards: { experience: 32, skillCoins: 6, magicCoins: 6, setFlags: ['flag_moon_womb_route'] } },
  
  ],
  cyrum_kingdom: [

    { id: 'cyrum-war-room', label: 'Собрать оборону позднего Цайрума', text: 'Поздний Цайрум уже действует как военный штаб, а не как обычная столица. Партия подготавливает следующий этап похода.', requiresFlags: ['flag_zera_reveal_path', 'flag_scene_cyrum_front_command'], setFlags: ['flag_cyrum_war_room'], rewards: { experience: 26, skillCoins: 4, magicCoins: 4, setFlags: ['flag_cyrum_war_room'] } },
  
  ],
  new_valmar: [

    { id: 'newvalmar-outer', label: 'Пробить внешний барьер Нового Вальмара', text: 'Органическая оболочка данжа отступает только после того, как партия выдержит уже не один, а два навязанных хора воли этого места и всё равно пойдёт дальше.', allowedBeatIds: ['zera_inside_valmar'], requiresFlags: ['flag_new_valmar_will', 'flag_scene_new_valmar_vein_whisper', 'flag_scene_new_valmar_vein_choir'], setFlags: ['flag_new_valmar_outer'], rewards: { experience: 30, skillCoins: 5, magicCoins: 6, setFlags: ['flag_new_valmar_outer'] } },
    { id: 'newvalmar-chaos', label: 'Открыть Room of Chaos', text: 'После первого прорыва партия добирается до узла, ведущего к главной внутренней лжи Зеры.', allowedBeatIds: ['zera_inside_valmar'], requiresFlags: ['flag_new_valmar_outer'], setFlags: ['flag_new_valmar_chaos'], rewards: { experience: 32, skillCoins: 6, magicCoins: 6, setFlags: ['flag_new_valmar_chaos'] } },
  ,
    { id: 'new-valmar-nut-memory', label: 'Найти орех в живой стене', text: 'В складке живой стены застрял орех сочувствия — кто-то прятал его здесь, чтобы вернуться.', rewards: { sympathyNut: 1, experience: 10 } },
    { id: 'new-valmar-ash-memory', label: 'Собрать пепел демона', text: 'Тёмный пепел на стенах — остатки того, кто пытался пройти этот путь раньше.', rewards: { demonAsh: 1, experience: 12 } },
  
  ],
  new_valmar_room_of_chaos: [

    { id: 'newvalmar-false-masks', label: 'Пройти зал ложных образов', text: 'Даже в Room of Chaos Зера воюет не только силой, но и ложью, подменой личности и давлением на волю.', allowedBeatIds: ['zera_inside_valmar'], requiresFlags: ['flag_new_valmar_chaos', 'flag_scene_room_of_chaos_echo'], rewards: { experience: 20, skillCoins: 4, magicCoins: 5 } },
  
  ],
  new_valmar_core: [

    { id: 'true-finale-core', label: 'Подготовить ядро финальной развязки', text: 'Финальный проход к ядру Нового Вальмара открыт. Дальше — уже только последняя развязка.', allowedBeatIds: ['true_finale'], requiresFlags: ['flag_new_valmar_chaos', 'flag_scene_new_valmar_core_judgement'], setFlags: ['flag_true_finale_core'], rewards: { experience: 36, skillCoins: 7, magicCoins: 7, setFlags: ['flag_true_finale_core'] } },
  
  ],
  carbo_church: [

    { id: 'carbo-elder-blessing', label: 'Получить благословение старушки', text: 'Пожилая прихожанка благословляет партию на дорогу и делится последним запасом семян.', rewards: { experience: 8, skillCoins: 2, magicCoins: 2, seedOfLife: 1 } },
  
  ],
  liligue_city: [

    { id: 'liligue-bomb-trader', label: 'Поторговаться с инженером-взрывником', text: 'Инженер Лилига продаёт «настоящую могейскую взрывчатку» по цене дружбы.', rewards: { mogayBomb: 1, experience: 8 } },
  
  ],
  mirumu_village: [

    { id: 'mirumu-seed-gift', label: 'Принять семя жизни от знахарки', text: 'Знахарка Мирумы отдаёт семя жизни: «Для того, кто идёт в разлом. Оно согреет лучше любой песни».', rewards: { seedOfLife: 1, experience: 10 } },
  
  ],
  st_heim_library: [

    { id: 'stheim-lost-index', label: 'Найти «потерянный» индекс', text: 'Между страницами книги застрял индекс запретных текстов — и свиток алхимии, служивший закладкой.', rewards: { scrollOfAlheal: 1, magicCoins: 3 } },
  
  ],
  nanan_store: [

    { id: 'nanan-scroll-offer', label: 'Взять свиток урагана', text: 'Торговец Нанана вручает свиток урагана: «На краю мира такие вещи не продают. Их отдают тем, кто идёт в бурю».', rewards: { whirlwindScroll: 1, experience: 12 } },
  
  ],
};

function encounterTemplateIdByLabel(label) {
  return Object.entries(ENCOUNTER_TEMPLATES).find(([, value]) => value.label === label)?.[0] ?? null;
}

function getStoryArcs() {
  return state.storyData?.arcs ?? [];
}

function getCurrentStoryArc() {
  return getStoryArcs().find((arc) => arc.id === state.currentStoryArcId) ?? getStoryArcs()[0] ?? null;
}

function getCurrentStoryBeat() {
  const arc = getCurrentStoryArc();
  return arc?.plotBeats?.find((beat) => beat.id === state.currentStoryBeatId) ?? arc?.plotBeats?.[0] ?? null;
}

function allStoryBeatRefs() {
  return getStoryArcs().flatMap((arc) => (arc.plotBeats ?? []).map((beat) => ({ arcId: arc.id, beatId: beat.id })));
}

function setCurrentStoryBeat(arcId, beatId) {
  state.currentStoryArcId = arcId;
  state.currentStoryBeatId = beatId;
}

function getBeatRefById(beatId) {
  return allStoryBeatRefs().find((ref) => ref.beatId === beatId) ?? null;
}

function getStoryBeatById(beatId) {
  if (!beatId) {
    return null;
  }
  for (const arc of getStoryArcs()) {
    const beat = arc.plotBeats?.find((entry) => entry.id === beatId);
    if (beat) {
      return beat;
    }
  }
  return null;
}

function getStoryArcByBeatId(beatId) {
  if (!beatId) {
    return null;
  }
  return getStoryArcs().find((arc) => arc.plotBeats?.some((entry) => entry.id === beatId)) ?? null;
}

function getCurrentCampaignBeatRef() {
  return allStoryBeatRefs()[state.campaignRun.currentBeatIndex] ?? null;
}

function getCurrentCampaignBeat() {
  return getStoryBeatById(state.campaignRun.currentBeatId ?? getCurrentCampaignBeatRef()?.beatId ?? null);
}

function getCurrentCampaignArc() {
  return getStoryArcByBeatId(state.campaignRun.currentBeatId ?? getCurrentCampaignBeatRef()?.beatId ?? null);
}

function getCurrentCampaignWorldBinding() {
  return getBeatWorldBinding(state.campaignRun.currentBeatId ?? null);
}

function getCurrentCampaignChapter() {
  return getWorldChapterByBeatId(state.campaignRun.currentBeatId ?? null);
}

function getCurrentCampaignLocation() {
  return getWorldLocation(state.campaignRun.currentLocationId ?? null);
}

function activeLocationStateProfile(locationId = state.campaignRun.currentLocationId, beatId = state.campaignRun.currentBeatId) {
  if (!locationId || !beatId) {
    return null;
  }
  return resolveLocationStateProfile(locationId, beatId);
}

function resolvedLocationDescription(location, beatId = state.campaignRun.currentBeatId) {
  if (!location) {
    return 'n/a';
  }
  return activeLocationStateProfile(location.id, beatId)?.description ?? location.description;
}

function resolvedLocationStateLabel(location, beatId = state.campaignRun.currentBeatId) {
  if (!location) {
    return 'n/a';
  }
  return activeLocationStateProfile(location.id, beatId)?.label ?? 'Стандартное состояние';
}

function resolvedLocationTags(location, beatId = state.campaignRun.currentBeatId) {
  if (!location) {
    return [];
  }
  return activeLocationStateProfile(location.id, beatId)?.tags ?? [];
}

function resolvedFacilitiesForLocation(location, beatId = state.campaignRun.currentBeatId) {
  if (!location) {
    return [];
  }
  return activeLocationStateProfile(location.id, beatId)?.serviceOverrides ?? location.facilities ?? [];
}

function activeDungeonStageChain(locationId = state.campaignRun.currentLocationId) {
  return resolveDungeonStageChain(locationId);
}

function getNextStoryBeatRefByIndex(index) {
  return allStoryBeatRefs()[index + 1] ?? null;
}

function campaignStorageKey() {
  return 'grandia2-campaign-state';
}

function cloneCampaignRun(run = state.campaignRun) {
  return JSON.parse(JSON.stringify(run));
}

function normalizeCampaignRun(run) {
  return {
    ...createEmptyCampaignRun(),
    ...(run ?? {}),
    inventory: createBaseInventory({
      ...DEFAULT_CAMPAIGN_INVENTORY,
      ...(run?.inventory ?? {}),
    }),
    gold: Number(run?.gold ?? 180),
    experience: Number(run?.experience ?? 0),
    partyLevel: Math.max(1, Number(run?.partyLevel ?? 1)),
    skillCoins: Number(run?.skillCoins ?? 0),
    magicCoins: Number(run?.magicCoins ?? 0),
    questFlags: { ...(run?.questFlags ?? {}) },
    growthUnlockIds: Array.isArray(run?.growthUnlockIds) ? [...run.growthUnlockIds] : [],
    activeLocationSceneId: run?.activeLocationSceneId ?? null,
    seenLocationSceneIds: Array.isArray(run?.seenLocationSceneIds) ? [...run.seenLocationSceneIds] : [],
    seenNpcDialogueIds: Array.isArray(run?.seenNpcDialogueIds) ? [...run.seenNpcDialogueIds] : [],
    actionLevels: JSON.parse(JSON.stringify(run?.actionLevels ?? {})),
    eggLoadout: { ryudo: null, elena: 'holy_egg', tio: null, roan: null, mareg: null, millenia: 'chaos_egg', ...(run?.eggLoadout ?? {}) },
    eggLevels: JSON.parse(JSON.stringify(run?.eggLevels ?? {})),
    ownedEggIds: Array.isArray(run?.ownedEggIds) ? [...run.ownedEggIds] : [],
    roster: cloneCampaignRoster(run?.roster),
    equipmentLoadout: cloneCampaignEquipmentLoadout(run?.equipmentLoadout),
    checkpointInventory: createBaseInventory({
      ...DEFAULT_CAMPAIGN_INVENTORY,
      ...(run?.inventory ?? {}),
      ...(run?.checkpointInventory ?? {}),
    }),
    checkpointGold: Number(run?.checkpointGold ?? run?.gold ?? 180),
    checkpointRoster: cloneCampaignRoster(run?.checkpointRoster ?? run?.roster),
    checkpointEquipmentLoadout: cloneCampaignEquipmentLoadout(run?.checkpointEquipmentLoadout ?? run?.equipmentLoadout),
    pendingReward: {
      gold: Number(run?.pendingReward?.gold ?? 0),
      ...createBaseInventory(run?.pendingReward ?? {}),
    },
    completedBeatIds: Array.isArray(run?.completedBeatIds) ? [...run.completedBeatIds] : [],
    journal: Array.isArray(run?.journal) ? [...run.journal] : [],
    visitedLocationIds: Array.isArray(run?.visitedLocationIds) ? [...run.visitedLocationIds] : [],
    locationHistory: Array.isArray(run?.locationHistory) ? [...run.locationHistory] : [],
    seenWorldEventIds: Array.isArray(run?.seenWorldEventIds) ? [...run.seenWorldEventIds] : [],
    openedTreasureIds: Array.isArray(run?.openedTreasureIds) ? [...run.openedTreasureIds] : [],
    clearedTravelEncounterIds: Array.isArray(run?.clearedTravelEncounterIds) ? [...run.clearedTravelEncounterIds] : [],
    purchasedUpgradeIds: Array.isArray(run?.purchasedUpgradeIds) ? [...run.purchasedUpgradeIds] : [],
    battleContext: run?.battleContext ? { ...run.battleContext } : null,
    battleAttempts: { ...(run?.battleAttempts ?? {}) },
  };
}

function saveCampaignStateToLocalStorage() {
  const payload = {
    version: 2,
    currentStoryArcId: state.currentStoryArcId,
    currentStoryBeatId: state.currentStoryBeatId,
    appliedStoryArcId: state.appliedStoryArcId,
    appliedStoryBeatId: state.appliedStoryBeatId,
    campaignProgress: state.campaignProgress,
    campaignRun: cloneCampaignRun(),
  };
  localStorage.setItem(campaignStorageKey(), JSON.stringify(payload));
  return payload;
}

function loadCampaignStateFromLocalStorage() {
  const raw = localStorage.getItem(campaignStorageKey());
  if (!raw) {
    return false;
  }

  const payload = JSON.parse(raw);
  state.currentStoryArcId = payload.currentStoryArcId ?? state.currentStoryArcId;
  state.currentStoryBeatId = payload.currentStoryBeatId ?? state.currentStoryBeatId;
  state.appliedStoryArcId = payload.appliedStoryArcId ?? null;
  state.appliedStoryBeatId = payload.appliedStoryBeatId ?? null;
  state.campaignProgress = payload.campaignProgress ?? state.campaignProgress;
  state.campaignRun = normalizeCampaignRun(payload.campaignRun);
  if (state.campaignRun.active && state.campaignRun.currentBeatId) {
    const ref = getBeatRefById(state.campaignRun.currentBeatId);
    if (ref) {
      setCurrentStoryBeat(ref.arcId, ref.beatId);
    }
    if (state.campaignRun.phase === 'battle') {
      state.campaignRun.phase = 'intro';
      state.campaignRun.lastResultSummary = 'Сохранение восстановлено до предбоевого брифинга: live battle state отдельно не сериализуется.';
    }
    if (state.campaignRun.phase === 'travel') {
      ensureCampaignTravelLocation();
    }
    if (state.campaignRun.phase === 'overworld' && !state.campaignRun.pendingTravelToLocationId) {
      state.campaignRun.phase = 'travel';
      ensureCampaignTravelLocation();
    }
  }
  return true;
}

function resetCampaignState() {
  state.campaignProgress = { completedBeatIds: [], lastStartedBeatId: null };
  state.campaignRun = createEmptyCampaignRun();
  state.appliedStoryArcId = null;
  state.appliedStoryBeatId = null;
  localStorage.removeItem(campaignStorageKey());
}

function isBeatCompleted(beatId) {
  return state.campaignProgress.completedBeatIds.includes(beatId);
}

function markCurrentBeatCompleteAndAdvance() {
  const refs = allStoryBeatRefs();
  const currentBeat = getCurrentStoryBeat();
  if (!currentBeat) {
    return;
  }

  if (!state.campaignProgress.completedBeatIds.includes(currentBeat.id)) {
    state.campaignProgress.completedBeatIds.push(currentBeat.id);
  }

  const currentIndex = refs.findIndex((ref) => ref.arcId === state.currentStoryArcId && ref.beatId === state.currentStoryBeatId);
  const nextRef = currentIndex >= 0 && currentIndex < refs.length - 1 ? refs[currentIndex + 1] : null;
  if (nextRef) {
    setCurrentStoryBeat(nextRef.arcId, nextRef.beatId);
  }
  saveCampaignStateToLocalStorage();
}

function refreshStorySelectors() {
  const arcs = getStoryArcs();
  const currentArc = getCurrentStoryArc();
  const currentBeat = getCurrentStoryBeat();

  if (!elements.campaignArcSelect || !elements.campaignBeatSelect) {
    return;
  }

  elements.campaignArcSelect.innerHTML = arcs.map((arc) => `<option value="${arc.id}">${arc.title}</option>`).join('');
  if (currentArc) {
    elements.campaignArcSelect.value = currentArc.id;
  }

  const beats = currentArc?.plotBeats ?? [];
  elements.campaignBeatSelect.innerHTML = beats.map((beat) => `<option value="${beat.id}">${beat.title}</option>`).join('');
  if (currentBeat) {
    elements.campaignBeatSelect.value = currentBeat.id;
  }
}

function storyBeatMissingUnits(beat) {
  const names = [...(beat?.partyState?.core ?? []), ...(beat?.partyState?.temporary ?? [])];
  return names.filter((name) => STORY_PARTY_UNIT_MAP[name] === null);
}

const STORY_BEAT_SCENARIO_MAP = {
  carbo_contract: 'starter',
  garmia_failure: 'line-pressure',
  millenia_first_attack: 'veteran-seed',
  agear_roan: 'miniboss-minotaur',
  liligue_and_mareg: 'tongue-valmar',
  st_heim_zera: 'guardian-trial',
  cyrum_and_claws: 'claws-valmar',
  garlan_return: 'miniboss-escort',
  melfice_duel: 'miniboss-minotaur',
  nanan_and_cyclone: 'full-party',
  granasaber_ship: 'full-party',
  cathedral_massacre: 'heart-valmar',
  zera_revealed: 'miniboss-escort',
  moon_assault: 'boss-escort-7171',
  cyrum_defense: 'fullparty-8080',
  birthplace_descent: 'guardian-8282',
  inner_trial: 'miniboss-minotaur',
  zera_inside_valmar: 'boss-escort-7171',
  true_finale: 'zera-finale',
};

function storyBeatScenarioKey(beat) {
  if (!beat) {
    return null;
  }

  if (STORY_BEAT_SCENARIO_MAP[beat.id]) {
    return STORY_BEAT_SCENARIO_MAP[beat.id];
  }

  if (beat.currentPrototypeFit && SCENARIO_PRESETS[beat.currentPrototypeFit]) {
    return beat.currentPrototypeFit;
  }

  return null;
}

function storyBeatImplementationMeta(beat) {
  const scenarioKey = storyBeatScenarioKey(beat);
  const missingUnits = storyBeatMissingUnits(beat);
  const setpieceOverride = beat ? setpieceBattleOverrideForBeat(beat.id) : null;
  const resolvedSource = resolveScenarioSource(scenarioKey);

  if (setpieceOverride) {
    return {
      kind: 'battle',
      scenarioKey: scenarioKey ?? null,
      encounterLabel: setpieceOverride.battleLabel ?? beat?.title ?? 'setpiece encounter',
      runId: null,
      sourceType: 'setpiece-bespoke',
      battleSeed: state.battleSeed,
      status: 'Direct story-specific setpiece encounter is available.',
      bespoke: true,
      missingUnits,
    };
  }

  if (!scenarioKey || !resolvedSource) {
    return {
      kind: 'placeholder',
      scenarioKey: null,
      encounterLabel: null,
      sourceType: 'placeholder',
      status: 'No encounter mapped yet. Placeholder scene only.',
      bespoke: false,
      missingUnits,
    };
  }

  const bespoke = STORY_BEAT_SCENARIO_MAP[beat.id] != null;
  const sourceType = bespoke
    ? resolvedSource.sourceType
    : 'prototype-fit';
  const status = sourceType === 'prototype-fit'
    ? 'Uses a generic prototype-fit encounter as a temporary stand-in.'
    : sourceType === 'run'
      ? 'Uses a fixed seeded story run from the scenario library.'
      : 'Direct story-specific encounter is available.';

  return {
    kind: 'battle',
    scenarioKey: resolvedSource.scenarioKey,
    encounterLabel: resolvedSource.encounterLabel,
    runId: resolvedSource.runId,
    sourceType,
    battleSeed: resolvedSource.battleSeed,
    status,
    bespoke,
    missingUnits,
  };
}

function applyStoryBeat(beat, { startBattle = false } = {}) {
  if (!beat) {
    return;
  }

  state.appliedStoryArcId = state.currentStoryArcId;
  state.appliedStoryBeatId = beat.id;

  const scenarioKey = storyBeatScenarioKey(beat);
  const scenarioSource = resolveScenarioSource(scenarioKey);
  if (scenarioSource) {
    applyScenarioSource(scenarioSource);
  }

  const templateId = encounterTemplateIdByLabel(beat.recommendedTemplate);
  if (templateId) {
    state.encounterTemplate = templateId;
  }
  if (beat.recommendedTheme) {
    state.battlefieldTheme = beat.recommendedTheme;
  }
  if (beat.openingAdvantage) {
    state.openingAdvantage = beat.openingAdvantage;
  }

  const names = [...(beat.partyState?.core ?? []), ...(beat.partyState?.temporary ?? [])];
  const enabled = { roan: false, mareg: false, tio: false, millenia: false, mottledSpider: false, guardian: false };
  for (const name of names) {
    const key = STORY_PARTY_UNIT_MAP[name];
    if (key && key in enabled) {
      enabled[key] = true;
    }
  }
  state.enabledUnits = { ...state.enabledUnits, ...enabled };

  writeStateToForms();
  state.debugOutput = `Story beat applied: ${beat.title}`;

  if (startBattle) {
    state.battle = state.activeTab === 'debug' ? createDebugBattle() : createPlayBattle();
  }
}

async function loadStoryData() {
  try {
    const response = await fetch('./STORY_BEATS.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.storyData = await response.json();
    const firstArc = state.storyData.arcs?.[0] ?? null;
    if (firstArc) {
      state.currentStoryArcId = state.currentStoryArcId ?? firstArc.id;
      state.currentStoryBeatId = state.currentStoryBeatId ?? firstArc.plotBeats?.[0]?.id ?? null;
    }
    refreshStorySelectors();
  } catch (error) {
    state.storyLoadError = error.message;
  }
}

function normalizeFxEvent(event) {
  if (!event || event.type === 'awaiting-input') {
    return null;
  }

  const now = performance.now();
  return {
    key: `${event.type}:${event.actorId ?? 'none'}:${event.text}`,
    startedAt: now,
    until: now + 800,
    actorId: event.actorId ?? null,
    targetIds: event.targetIds ?? [],
    impacts: event.impacts ?? [],
    text: event.text,
    type: event.type,
  };
}

function startNextQueuedFx() {
  if (state.eventFxQueue.length === 0) {
    state.eventFx = null;
    return false;
  }

  const next = state.eventFxQueue.shift();
  state.eventFx = normalizeFxEvent(next);
  return Boolean(state.eventFx);
}

function ensureAnimationLoop() {
  if (state.animationFrame != null) {
    return;
  }

  const tick = () => {
    const now = performance.now();
    const hasFx = state.eventFx && now < state.eventFx.until;
    const avatarMoving = updateCampaignAvatar(now);
    render();

    if (hasFx || avatarMoving) {
      state.animationFrame = requestAnimationFrame(tick);
      return;
    }

    if (startNextQueuedFx()) {
      state.animationFrame = requestAnimationFrame(tick);
      return;
    }

    state.animationFrame = null;
  };

  state.animationFrame = requestAnimationFrame(tick);
}

function triggerEventFx(event) {
  if (!event || event.type === 'awaiting-input') {
    return;
  }

  const chain = [event, ...(event.supplementalEvents ?? [])].filter(Boolean);
  if (chain.length === 0) {
    return;
  }

  state.eventFxQueue = chain.slice(1);
  state.eventFx = normalizeFxEvent(chain[0]);
  ensureAnimationLoop();
}

function getEventFxProgress() {
  if (!state.eventFx) {
    return null;
  }
  const now = performance.now();
  const duration = Math.max(1, state.eventFx.until - state.eventFx.startedAt);
  return Math.max(0, Math.min(1, (now - state.eventFx.startedAt) / duration));
}

function openWorkspace(tab = state.activeTab) {
  state.appScreen = 'app';
  state.activeTab = tab;
  render();
}

function openMainMenu() {
  stopReplayAutoplay();
  stopCompareAutoplay();
  state.eventFx = null;
  state.eventFxQueue = [];
  state.appScreen = 'menu';
  render();
}

function setActiveTab(tab) {
  if (tab !== 'debug') {
    stopReplayAutoplay();
  }
  if (tab !== 'compare') {
    stopCompareAutoplay();
  }
  state.activeTab = tab;
  if (state.appScreen !== 'app') {
    state.appScreen = 'app';
  }
  render();
}

function gaugeX(ip) {
  const left = 70;
  const width = elements.canvas.width - 140;
  return left + (ip / IP_MAX) * width;
}

function getReplaySnapshot(index = state.replay?.index ?? 0) {
  if (!state.replay) {
    return null;
  }

  const snapshots = state.replay.data.snapshots ?? [];
  if (snapshots.length === 0) {
    return null;
  }

  return snapshots[Math.max(0, Math.min(index, snapshots.length - 1))] ?? null;
}

function getReplayDecision(index = state.replay?.index ?? 0) {
  if (!state.replay || index <= 0) {
    return null;
  }

  const decisions = state.replay.data.decisions ?? [];
  return decisions[Math.max(0, Math.min(index - 1, decisions.length - 1))] ?? null;
}

function getVisibleBattleState() {
  const snapshot = getReplaySnapshot();
  if (!snapshot) {
    if (!state.battle) {
      return {
        mode: 'live',
        battle: null,
        players: [],
        enemies: [],
        time: 0,
        turnCount: 0,
        awaitingInput: null,
        lastEventText: null,
      };
    }
    return {
      mode: 'live',
      battle: state.battle,
      players: state.battle.players,
      enemies: state.battle.enemies,
      time: state.battle.timeline.elapsedSeconds,
      turnCount: state.battle.turnCount,
      awaitingInput: getAwaitingInput(state.battle),
      lastEventText: state.battle.lastEvent?.text ?? null,
    };
  }

  return {
    mode: 'replay',
    battle: null,
    players: snapshot.players,
    enemies: snapshot.enemies,
    time: snapshot.time ?? 0,
    turnCount: snapshot.turnCount ?? 0,
    awaitingInput: snapshot.awaitingInput ?? null,
    lastEventText: snapshot.lastEventText ?? null,
  };
}

function findFighterById(fighterId) {
  const visible = getVisibleBattleState();
  return [...visible.players, ...visible.enemies].find((fighter) => fighter.id === fighterId) ?? null;
}

function downloadJson(filename, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function currentBalanceProfile() {
  return vectorToBalanceProfile(state.balanceVector);
}

function buildEncounterFromForm() {
  function buildUnit(key) {
    const preset = clonePreset(key);
    const values = state.unitFormState[key];
    for (const field of STAT_FIELDS) {
      preset[field] = Number(values[field]);
    }
    preset.position = { ...UNIT_POSITIONS[key] };
    return preset;
  }

  const template = ENCOUNTER_TEMPLATES[state.encounterTemplate] ?? ENCOUNTER_TEMPLATES.duel2v2;

  let playerKeys = [...template.players];
  let enemyKeys = [...template.enemies];

  if (state.encounterTemplate === 'duel2v2' || state.encounterTemplate === 'custom') {
    playerKeys = ['ryudo', 'elena'];
    enemyKeys = ['troglodyte', 'wingEye'];
    if (state.enabledUnits.roan) {
      playerKeys.push('roan');
    }
    if (state.enabledUnits.mareg) {
      playerKeys.push('mareg');
    }
    if (state.enabledUnits.tio) {
      playerKeys.push('tio');
    }
    if (state.enabledUnits.millenia) {
      playerKeys.push('millenia');
    }
    if (state.enabledUnits.mottledSpider) {
      enemyKeys.push('mottledSpider');
    }
    if (state.enabledUnits.guardian) {
      enemyKeys.push('guardian');
    }
  }

  return {
    players: playerKeys.map(buildUnit),
    enemies: enemyKeys.map(buildUnit),
  };
}

function controllerFromKind(kind) {
  if (kind === 'veteran') {
    return createWeightedPlayerController(state.veteranWeights);
  }
  return createNoviceController();
}

function baseInventoryForCurrentEncounter() {
  switch (state.encounterTemplate) {
    case 'skirmish3v3':
      return createBaseInventory({ medicinalHerb: 4, antidote: 3, eyeDrops: 1 });
    case 'miniBossSolo':
      return createBaseInventory({ medicinalHerb: 5, antidote: 2, woundSalve: 1, blueberry: 1 });
    case 'miniBossEscort':
    case 'miniBossSwarm':
      return createBaseInventory({ medicinalHerb: 6, antidote: 3, woundSalve: 1, moveBlessing: 1 });
    case 'fullParty4v4':
    case 'guardianTrial':
      return createBaseInventory({ medicinalHerb: 6, antidote: 4, woundSalve: 2, healingHerb: 1, magicBlessing: 1, healingFruit: 1, dynamite: 1 });
    case 'eyeOfValmarBoss':
    case 'crimsonTailsBoss':
    case 'nagaQueensBoss':
    case 'dualFistsBoss':
    case 'birthplaceGuardianBoss':
    case 'eggGuardianBoss':
    case 'finalValmarBoss':
      return createBaseInventory({ medicinalHerb: 6, antidote: 4, woundSalve: 2, healingHerb: 1, healingFruit: 2, scarletPotion: 1, dynamite: 2, blessingScroll: 1, magicalMedicine: 1 });
    default:
      return createBaseInventory(DEFAULT_CAMPAIGN_INVENTORY);
  }
}

function inventoryForCurrentEncounter() {
  return {
    ...baseInventoryForCurrentEncounter(),
    ...state.inventoryOverrides,
  };
}

function createPlayBattle() {
  const encounter = buildEncounterFromForm();
  const template = ENCOUNTER_TEMPLATES[state.encounterTemplate];
  state.battleLabel = `Игра: ${template?.label ?? state.encounterTemplate} vs ${state.playEnemyAi === 'veteran' ? 'Veteran AI' : 'Novice AI'} (seed ${state.battleSeed}, advantage ${state.openingAdvantage})`;
  return createDefaultBattle({
    ...encounter,
    inventory: inventoryForCurrentEncounter(),
    openingAdvantage: state.openingAdvantage,
    battlefieldTheme: state.battlefieldTheme,
    rng: createSeededRng(state.battleSeed),
    balance: currentBalanceProfile(),
    controllers: {
      players: manualPlayerController,
      enemies: controllerFromKind(state.playEnemyAi),
    },
  });
}

function createDebugBattle() {
  const encounter = buildEncounterFromForm();
  const template = ENCOUNTER_TEMPLATES[state.encounterTemplate];
  state.battleLabel = `Дебаг-бой: ${template?.label ?? state.encounterTemplate} / ${state.debugPlayerAi === 'veteran' ? 'Veteran' : 'Novice'} AI vs ${state.debugEnemyAi === 'veteran' ? 'Veteran' : 'Novice'} AI (seed ${state.battleSeed}, advantage ${state.openingAdvantage})`;
  return createDefaultBattle({
    ...encounter,
    inventory: inventoryForCurrentEncounter(),
    openingAdvantage: state.openingAdvantage,
    battlefieldTheme: state.battlefieldTheme,
    rng: createSeededRng(state.battleSeed),
    balance: currentBalanceProfile(),
    controllers: {
      players: controllerFromKind(state.debugPlayerAi),
      enemies: controllerFromKind(state.debugEnemyAi),
    },
  });
}

function createBattleForCurrentContext() {
  if (campaignRunActive() && state.activeTab === 'campaign' && state.campaignRun.phase === 'battle') {
    const beat = getCurrentCampaignBeat();
    if (beat) {
      return createCampaignBattle(beat);
    }
  }

  return state.activeTab === 'debug' ? createDebugBattle() : createPlayBattle();
}

function resetToPlayBattle() {
  closeReplay();
  state.battle = createPlayBattle();
}

function actionSortScore(action) {
  const order = {
    tenseiken: 0,
    impactBomb: 1,
    critical: 2,
    combo: 3,
    nightmareBall: 4,
    wow: 5,
    diggin: 6,
    speedy: 7,
    stram: 8,
    cold: 9,
    burn: 10,
    zap: 11,
    heal: 12,
    medicinalHerb: 13,
    antidote: 14,
    webTrap: 15,
    poisonSpit: 16,
    spellbindDust: 17,
    lotusFlower: 18,
    fallenWings: 19,
    beastFangCut: 20,
    tornadoHorn: 21,
    killerVoltage: 22,
    earthQuake: 23,
    destructionRay: 24,
    endure: 25,
    evade: 26,
    wingSlice: 27,
  };

  return order[action.id] ?? 99;
}

function commandMenuCategoriesForActions(actions) {
  const categories = [];
  const groups = [
    { key: 'combo', label: 'Combo', filter: (action) => action.id === 'combo' },
    { key: 'critical', label: 'Critical', filter: (action) => action.id === 'critical' },
    { key: 'moves', label: 'Special Moves', filter: (action) => action.definition.commandType === 'move' },
    { key: 'magic', label: 'Magic / Arts', filter: (action) => action.definition.commandType === 'magic' },
    { key: 'items', label: 'Items / Tools', filter: (action) => action.definition.commandType === 'item' },
    { key: 'defend', label: 'Defend / Evade', filter: (action) => action.definition.commandType === 'defense' },
  ];

  for (const group of groups) {
    const count = actions.filter(group.filter).length;
    if (count > 0) {
      categories.push({ ...group, count });
    }
  }

  return categories;
}

function actionsForMenuCategory(actions, category) {
  const predicates = {
    combo: (action) => action.id === 'combo',
    critical: (action) => action.id === 'critical',
    moves: (action) => action.definition.commandType === 'move',
    magic: (action) => action.definition.commandType === 'magic',
    items: (action) => action.definition.commandType === 'item',
    defend: (action) => action.definition.commandType === 'defense',
  };

  return actions.filter(predicates[category] ?? (() => true));
}

function commandSectionLabelForAction(action, category) {
  const definition = action.definition;
  if (category === 'moves') {
    if (definition.targeting === 'line') return 'Line / formation';
    if (definition.targeting === 'all-enemies') return 'Area offense';
    if ((definition.statusEffects ?? []).length > 0 && definition.targeting !== 'all-enemies') return 'Control / status';
    if (definition.cancel) return 'Cancel / burst';
    return 'Single-target offense';
  }
  if (category === 'magic') {
    if (definition.targeting === 'all-allies' || definition.targeting === 'single-ally') {
      if (definition.revive || definition.powerBase || definition.healBase || (definition.cureStatuses ?? []).length) return 'Healing / recovery';
      return 'Party support';
    }
    if ((definition.statShifts ?? []).some((shift) => shift.amount < 0) || (definition.statusEffects ?? []).length) return 'Control / debuff';
    if (definition.targeting === 'all-enemies') return 'Area offense';
    return 'Offensive magic';
  }
  if (category === 'items') {
    if (definition.revive) return 'Revive';
    if ((definition.restoreSp ?? 0) > 0 || (definition.restoreMp ?? 0) > 0) return 'Resource recovery';
    if ((definition.cureStatuses ?? []).length > 0 && !(definition.healBase ?? 0)) return 'Status recovery';
    if (definition.targeting === 'all-allies') return 'Party recovery';
    return 'Single-target recovery';
  }
  return 'Commands';
}

function groupActionsForMenuDisplay(actions, category) {
  const groups = new Map();
  for (const action of actions) {
    const label = commandSectionLabelForAction(action, category);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(action);
  }
  return [...groups.entries()].map(([label, groupedActions]) => ({
    label,
    actions: groupedActions,
  }));
}

function labelEvadePoint(point) {
  if (point.x <= 140 && point.y <= 120) {
    return 'верхняя точка';
  }
  if (point.x <= 140 && point.y >= 240) {
    return 'нижняя точка';
  }
  if (point.x <= 260) {
    return 'центральная точка';
  }
  if (point.x >= 820 && point.y <= 120) {
    return 'верхняя точка';
  }
  if (point.x >= 820 && point.y >= 240) {
    return 'нижняя точка';
  }
  return 'центральная точка';
}

function describeAction(action) {
  const costs = [];
  if (action.definition.costSp) costs.push(`${action.definition.costSp} SP`);
  if (action.definition.costMp) costs.push(`${action.definition.costMp} MP`);
  if (action.definition.inventoryKey) costs.push(`1 ${action.definition.inventoryKey}`);
  const costSuffix = costs.length > 0 ? ` [${costs.join(', ')}]` : '';

  if (action.id === 'endure') {
    return `Endure${costSuffix} — снизить урон и IP pushback`;
  }

  if (action.id === 'evade') {
    return `Evade${costSuffix} — ${labelEvadePoint(action.targetPoint)}`;
  }

  const target = action.targetId ? findFighterById(action.targetId) : null;
  const base = `${action.definition.label}${costSuffix}`;
  return target ? `${base} -> ${target.name}` : base;
}

function actionHint(action) {
  const fighter = findFighterById(action.actorId);
  const meta = analyzeActionChoice(state.battle, fighter, action);

  if (action.id === 'heal' || action.id === 'medicinalHerb') {
    return `heal ~${meta.healAmount}`;
  }

  if (action.id === 'antidote') {
    return `cure ${meta.itemCureScore.toFixed(1)}`;
  }

  if (action.id === 'evade') {
    return `safety ${meta.safetyScore.toFixed(2)}`;
  }

  const parts = [];
  if (meta.totalEstimatedDamage > 0) {
    parts.push(`dmg~${meta.totalEstimatedDamage}`);
  }
  if (meta.cancelWindow > 0) {
    parts.push(`cancel ${(meta.cancelWindow * 100).toFixed(0)}%`);
  }
  if (meta.targetCount > 1) {
    parts.push(`hits ${meta.targetCount}`);
  }
  if (meta.shiftPressure > 0) {
    parts.push(`shift ${meta.shiftPressure.toFixed(1)}`);
  }
  if (meta.itemCureScore > 0) {
    parts.push(`cure ${meta.itemCureScore.toFixed(1)}`);
  }
  if (meta.statusPressure > 0 && meta.statusNames?.length) {
    parts.push(`${meta.statusNames.join('+')} ${meta.statusPressure.toFixed(1)}`);
  }

  return parts.join(', ');
}

function applyTrainingStyle(baseWeights, style) {
  const next = cloneWeights(baseWeights);

  if (style === 'aggressive') {
    next.kill += 0.9;
    next.comboBias += 0.7;
    next.damage += 0.5;
    next.safety -= 0.5;
    next.healNeed -= 0.6;
  } else if (style === 'safe') {
    next.safety += 1.0;
    next.healNeed += 0.9;
    next.endureBias += 0.8;
    next.evadeBias += 0.5;
    next.kill -= 0.2;
  } else if (style === 'control') {
    next.interrupt += 1.2;
    next.threatControl += 1.1;
    next.cancelBias += 1.0;
    next.criticalBias += 0.6;
  }

  return next;
}

function renderTabs() {
  const playActive = state.activeTab === 'play';
  const campaignActive = state.activeTab === 'campaign';
  const debugActive = state.activeTab === 'debug';
  const compareActive = state.activeTab === 'compare';
  const parityActive = state.activeTab === 'parity';

  elements.menuScreen.hidden = state.appScreen !== 'menu';
  elements.appScreen.hidden = state.appScreen !== 'app';

  elements.playSection.hidden = !playActive;
  elements.campaignSection.hidden = !campaignActive;
  elements.debugSection.hidden = !debugActive;
  elements.compareSection.hidden = !compareActive;
  elements.paritySection.hidden = !parityActive;

  elements.tabPlay.dataset.active = String(playActive);
  elements.tabCampaign.dataset.active = String(campaignActive);
  elements.tabDebug.dataset.active = String(debugActive);
  elements.tabCompare.dataset.active = String(compareActive);
  elements.tabParity.dataset.active = String(parityActive);
}

function toCanvasPoint(point) {
  return {
    x: 20 + point.x,
    y: 20 + point.y,
  };
}

function themePalette(theme) {
  switch (theme) {
    case 'ruins':
      return { bg: '#151515', field: '#262626', line: '#525252', accent: '#78350f', overlay: 'rgba(120,53,15,0.12)', spark: '#f59e0b' };
    case 'volcano':
      return { bg: '#1c1110', field: '#2b1512', line: '#7f1d1d', accent: '#ea580c', overlay: 'rgba(234,88,12,0.14)', spark: '#fb7185' };
    case 'forest':
      return { bg: '#0f172a', field: '#111827', line: '#334155', accent: '#166534', overlay: 'rgba(22,101,52,0.12)', spark: '#4ade80' };
    case 'cavern':
    default:
      return { bg: '#0b1020', field: '#131a2e', line: '#374151', accent: '#1d4ed8', overlay: 'rgba(29,78,216,0.12)', spark: '#93c5fd' };
  }
}

function drawArena() {
  const palette = themePalette(state.battlefieldTheme);
  const backdrop = getLoadedImageAsset(battlefieldArtPath(state.battlefieldTheme));
  if (!drawImageCover(context, backdrop, 0, 0, elements.canvas.width, elements.canvas.height, 1)) {
    context.fillStyle = palette.bg;
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  } else {
    context.fillStyle = 'rgba(2, 6, 23, 0.28)';
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  }

  context.fillStyle = backdrop ? 'rgba(15, 23, 42, 0.48)' : palette.field;
  context.fillRect(20, 20, FIELD_WIDTH, FIELD_HEIGHT);

  context.fillStyle = backdrop ? 'rgba(255,255,255,0.05)' : palette.overlay;
  for (let stripe = 0; stripe < 6; stripe += 1) {
    context.fillRect(20, 20 + stripe * 60, FIELD_WIDTH, 24);
  }

  context.strokeStyle = palette.line;
  context.lineWidth = 2;
  context.strokeRect(20, 20, FIELD_WIDTH, FIELD_HEIGHT);

  context.strokeStyle = palette.accent;
  context.beginPath();
  context.moveTo(20 + FIELD_WIDTH / 2, 20);
  context.lineTo(20 + FIELD_WIDTH / 2, 20 + FIELD_HEIGHT);
  context.stroke();
}

function drawActionPreview(fighter) {
  if (!fighter.pendingAction) {
    return;
  }

  const action = fighter.pendingAction.definition;
  const start = {
    x: 20 + fighter.position.x,
    y: 20 + fighter.position.y,
  };

  const previewColor = action.commandType === 'magic'
    ? 'rgba(56, 189, 248, 0.85)'
    : action.commandType === 'item'
      ? 'rgba(74, 222, 128, 0.85)'
      : action.commandType === 'move'
        ? 'rgba(248, 113, 113, 0.85)'
        : 'rgba(148, 163, 184, 0.8)';

  if (action.targeting === 'line' && fighter.pendingAction.targetPoint) {
    context.strokeStyle = previewColor;
    context.lineWidth = action.lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(20 + fighter.pendingAction.targetPoint.x, 20 + fighter.pendingAction.targetPoint.y);
    context.stroke();
    return;
  }

  if (!fighter.pendingAction.targetPoint) {
    return;
  }

  context.strokeStyle = previewColor;
  context.lineWidth = 2;
  context.setLineDash([6, 6]);
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(20 + fighter.pendingAction.targetPoint.x, 20 + fighter.pendingAction.targetPoint.y);
  context.stroke();
  context.setLineDash([]);
}

function drawAwaitingMarker(fighter) {
  const awaiting = getVisibleBattleState().awaitingInput;
  if (!awaiting || awaiting.fighterId !== fighter.id) {
    return;
  }

  const x = 20 + fighter.position.x;
  const y = 20 + fighter.position.y;
  context.strokeStyle = '#f59e0b';
  context.lineWidth = 5;
  context.beginPath();
  context.arc(x, y, fighter.radius + 9, 0, Math.PI * 2);
  context.stroke();
}

function drawCombatant(fighter) {
  const x = 20 + fighter.position.x;
  const y = 20 + fighter.position.y;
  const hpRatio = fighter.hp / fighter.maxHp;
  const sprite = getLoadedImageAsset(unitArtPathForFighter(fighter));

  drawActionPreview(fighter);

  if (sprite) {
    drawImageCover(context, sprite, x - fighter.radius * 1.65, y - fighter.radius * 1.9, fighter.radius * 3.3, fighter.radius * 3.3, fighter.isAlive ? 1 : 0.4);
  } else {
    context.fillStyle = fighter.color;
    context.beginPath();
    context.arc(x, y, fighter.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = fighter.team === 'players' ? '#bfdbfe' : '#fecaca';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, fighter.radius + (sprite ? 4 : 0), 0, Math.PI * 2);
  context.stroke();

  drawAwaitingMarker(fighter);

  if (fighter.guard?.type === 'endure') {
    context.strokeStyle = '#fbbf24';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x, y, fighter.radius + 6, 0, Math.PI * 2);
    context.stroke();
  }

  if (fighter.guard?.type === 'evade') {
    context.strokeStyle = '#22c55e';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, fighter.radius + 4, 0, Math.PI * 2);
    context.stroke();
  }

  drawStatusIconsNearUnit(context, fighter, x, y);

  context.fillStyle = '#e5e7eb';
  context.font = '12px system-ui';
  context.textAlign = 'center';
  context.fillText(fighter.name, x, y - fighter.radius - 16);

  context.fillStyle = '#374151';
  context.fillRect(x - 28, y + fighter.radius + 8, 56, 6);
  context.fillStyle = hpRatio > 0.4 ? '#22c55e' : '#ef4444';
  context.fillRect(x - 28, y + fighter.radius + 8, 56 * hpRatio, 6);

  const stateLabel = fighter.pendingAction
    ? fighter.pendingAction.definition.label
    : fighter.guard?.type === 'endure'
      ? 'Endure'
      : fighter.guard?.type === 'evade'
        ? 'Evade'
        : fighter.state === 'com'
          ? 'COM'
          : fighter.isAlive
            ? fighter.state
            : 'KO';

  context.fillStyle = '#cbd5e1';
  context.fillText(`IP ${Math.round(fighter.ip)}`, x, y + fighter.radius + 28);
  context.fillText(stateLabel, x, y + fighter.radius + 42);

  drawCastBar(fighter);

  if (state.eventFx?.actorId === fighter.id) {
    const progress = getEventFxProgress() ?? 1;
    context.strokeStyle = `rgba(253, 224, 71, ${1 - progress})`;
    context.lineWidth = 6;
    context.beginPath();
    context.arc(x, y, fighter.radius + 12 + progress * 8, 0, Math.PI * 2);
    context.stroke();
  }

  if ((state.eventFx?.targetIds ?? []).includes(fighter.id)) {
    const progress = getEventFxProgress() ?? 1;
    context.strokeStyle = `rgba(239, 68, 68, ${1 - progress})`;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, y, fighter.radius + 16 + progress * 10, 0, Math.PI * 2);
    context.stroke();
  }
}

function drawCurrentReplayDecisionOverlay() {
  const decision = getReplayDecision();
  if (!decision?.selected) {
    return;
  }

  const actor = findFighterById(decision.fighterId);
  if (!actor) {
    return;
  }

  const actorPoint = toCanvasPoint(actor.home ?? actor.position);

  context.strokeStyle = '#fde047';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(20 + actor.position.x, 20 + actor.position.y, (actor.radius ?? 18) + 12, 0, Math.PI * 2);
  context.stroke();

  if (decision.selected.targetId) {
    const target = findFighterById(decision.selected.targetId);
    if (target) {
      const targetPoint = toCanvasPoint(target.position);
      context.strokeStyle = '#22d3ee';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(targetPoint.x, targetPoint.y, (target.radius ?? 18) + 10, 0, Math.PI * 2);
      context.stroke();

      context.setLineDash([8, 6]);
      context.beginPath();
      context.moveTo(actorPoint.x, actorPoint.y);
      context.lineTo(targetPoint.x, targetPoint.y);
      context.stroke();
      context.setLineDash([]);
    }
  }

  if (decision.selected.targetPoint) {
    const point = toCanvasPoint(decision.selected.targetPoint);
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(point.x - 10, point.y);
      context.lineTo(point.x + 10, point.y);
      context.moveTo(point.x, point.y - 10);
      context.lineTo(point.x, point.y + 10);
      context.stroke();

      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(actorPoint.x, actorPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.setLineDash([]);
  }

  context.fillStyle = 'rgba(15, 23, 42, 0.85)';
  context.fillRect(34, 28, 340, 44);
  context.strokeStyle = '#475569';
  context.lineWidth = 1;
  context.strokeRect(34, 28, 340, 44);
  context.fillStyle = '#fde68a';
  context.font = '13px system-ui';
  context.textAlign = 'left';
  const targetName = decision.selected.analysis?.targetName
    ?? decision.selected.targetId
    ?? (decision.selected.targetPoint ? labelEvadePoint(decision.selected.targetPoint) : 'self');
  context.fillText(`Replay action: ${decision.fighterName} -> ${decision.selected.label}`, 46, 46);
  context.fillStyle = '#cbd5e1';
  context.fillText(`Target: ${targetName}`, 46, 64);
}

function statusBadges(fighter) {
  return Object.entries(fighter.statuses ?? {})
    .filter(([, turns]) => turns > 0)
    .map(([name, turns]) => `${name}:${turns}`)
    .join(' ');
}

function fighterPortraitLabel(fighter) {
  return fighter.name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function roleAccent(role = 'combatant') {
  const map = {
    vanguard: '#60a5fa',
    support: '#c084fc',
    'speed-caster': '#67e8f9',
    'aoe-caster': '#f472b6',
    bruiser: '#f97316',
    controller: '#ef4444',
    'status harasser': '#84cc16',
    'elite-caster': '#93c5fd',
    'mini-boss bruiser': '#fb923c',
    'royal-strategist': '#facc15',
    'honor-bruiser': '#fb923c',
    'fallen-sorceress': '#ec4899',
    'ancient-warden': '#93c5fd',
    'shadow-duelist': '#94a3b8',
    'apex-core': '#f8fafc',
    'seal-rupture': '#a78bfa',
    'moon-sentinel': '#f472b6',
    'blade-echo': '#facc15',
    'fanatic-bruiser': '#f87171',
    combatant: '#94a3b8',
  };
  return map[role] ?? '#94a3b8';
}

function drawPortraitBadge(ctx, fighter, x, y, radius = 16) {
  ctx.fillStyle = roleAccent(fighter.role);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = fighter.team === 'players' ? '#dbeafe' : '#fee2e2';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(fighterPortraitLabel(fighter), x, y + 4);
}

function drawStatusIconsNearUnit(ctx, fighter, x, y) {
  const active = [];
  for (const [name, turns] of Object.entries(fighter.statuses ?? {})) {
    if (turns > 0) {
      active.push({ name, turns, label: String(turns) });
    }
  }
  for (const stat of ['atk', 'def', 'act', 'mov']) {
    if ((fighter.buffs?.[stat] ?? 0) > 0) {
      active.push({ name: `${stat}Up`, turns: fighter.buffTimers?.[stat] ?? 0, label: `+${fighter.buffs[stat]}` });
    }
    if ((fighter.debuffs?.[stat] ?? 0) > 0) {
      active.push({ name: `${stat}Down`, turns: fighter.debuffTimers?.[stat] ?? 0, label: `-${fighter.debuffs[stat]}` });
    }
  }
  if (active.length === 0) {
    return;
  }

  active.slice(0, 6).forEach((entry, index) => {
    const palette = {
      sleep: '#a78bfa',
      moveBlock: '#f59e0b',
      magicBlock: '#22d3ee',
      poison: '#84cc16',
      confusion: '#c084fc',
      paralysis: '#facc15',
      atkUp: '#60a5fa',
      defUp: '#34d399',
      actUp: '#f472b6',
      movUp: '#38bdf8',
      atkDown: '#ef4444',
      defDown: '#f59e0b',
      actDown: '#a855f7',
      movDown: '#0ea5e9',
    };
    const chipX = x - 40 + index * 16;
    const chipY = y - fighter.radius - 28;
    ctx.fillStyle = palette[entry.name] ?? '#94a3b8';
    ctx.beginPath();
    ctx.arc(chipX, chipY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(entry.label, chipX, chipY + 3);
  });
}

function drawFloatingTexts() {
  if (!state.eventFx) {
    return;
  }
  const progress = getEventFxProgress();
  if (progress == null) {
    return;
  }
  const alpha = 1 - progress;
  const impacts = state.eventFx.impacts?.length ? state.eventFx.impacts : (state.eventFx.targetIds ?? []).map((targetId) => ({ targetId }));

  impacts.forEach((impact, index) => {
    const fighter = findFighterById(impact.targetId);
    if (!fighter) return;
    const x = 20 + fighter.position.x;
    const baseY = 20 + fighter.position.y - fighter.radius - 34 - progress * 20 - index * 10;

    let lines = [];
    if (impact.damage != null) {
      lines.push({ text: `-${impact.damage}`, color: `rgba(248,113,113,${alpha})`, size: 'bold 14px system-ui' });
    }
    if (impact.heal != null) {
      lines.push({ text: `+${impact.heal}`, color: `rgba(74,222,128,${alpha})`, size: 'bold 14px system-ui' });
    }
    if (impact.statuses?.length) {
      lines.push({ text: impact.statuses.join('+').toUpperCase(), color: `rgba(250,204,21,${alpha})`, size: '11px system-ui' });
    }
    if (impact.label) {
      lines.push({ text: impact.label, color: `rgba(255,255,255,${alpha})`, size: '11px system-ui' });
    }
    if (lines.length === 0) {
      lines.push({ text: state.eventFx.type === 'boss-phase' ? 'PHASE' : 'HIT', color: `rgba(255,255,255,${alpha})`, size: 'bold 12px system-ui' });
    }

    lines.forEach((line, lineIndex) => {
      context.fillStyle = line.color;
      context.font = line.size;
      context.textAlign = 'center';
      context.fillText(line.text, x, baseY + lineIndex * 12);
    });
  });
}

function drawImpactBursts() {
  if (!state.eventFx) {
    return;
  }
  const progress = getEventFxProgress();
  if (progress == null) {
    return;
  }
  const palette = themePalette(state.battlefieldTheme);
  const alpha = 1 - progress;
  const impacts = state.eventFx.impacts?.length ? state.eventFx.impacts : (state.eventFx.targetIds ?? []).map((targetId) => ({ targetId }));

  impacts.forEach((impact) => {
    const fighter = findFighterById(impact.targetId);
    if (!fighter) return;
    const x = 20 + fighter.position.x;
    const y = 20 + fighter.position.y;
    context.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, fighter.radius + 8 + progress * 24, 0, Math.PI * 2);
    context.stroke();

    const sparkColor = impact.heal != null
      ? `rgba(74,222,128,${alpha})`
      : impact.statuses?.length
        ? `rgba(250,204,21,${alpha})`
        : `rgba(${palette.spark === '#fb7185' ? '251,113,133' : '255,255,255'},${alpha})`;

    context.strokeStyle = sparkColor;
    for (let ray = 0; ray < 6; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 6 + progress;
      const inner = fighter.radius + 4;
      const outer = fighter.radius + 14 + progress * 18;
      context.beginPath();
      context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
      context.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      context.stroke();
    }
  });
}

function drawCastBar(fighter) {
  if (!fighter.pendingAction) {
    return;
  }
  const x = 20 + fighter.position.x;
  const y = 20 + fighter.position.y + fighter.radius + 50;
  const progress = Math.max(0, Math.min(1, (fighter.ip - COM_START) / (ACT_POINT - COM_START)));
  context.fillStyle = '#0b1220';
  context.fillRect(x - 32, y, 64, 6);
  context.fillStyle = fighter.team === 'players' ? '#38bdf8' : '#f97316';
  context.fillRect(x - 32, y, 64 * progress, 6);
}

function drawBattleHudCard(fighter, x, y, align = 'left') {
  const width = 218;
  const height = 56;
  const hpRatio = fighter.maxHp > 0 ? fighter.hp / fighter.maxHp : 0;
  const spRatio = fighter.maxSp > 0 ? fighter.sp / fighter.maxSp : 0;
  const mpRatio = fighter.maxMp > 0 ? fighter.mp / fighter.maxMp : 0;
  const left = align === 'left' ? x : x - width;

  context.fillStyle = 'rgba(15,23,42,0.86)';
  context.fillRect(left, y, width, height);
  context.strokeStyle = fighter.team === 'players' ? '#60a5fa' : '#f87171';
  context.lineWidth = 1.5;
  context.strokeRect(left, y, width, height);

  const portraitX = left + 20;
  const portraitY = y + 28;
  drawPortraitBadge(context, fighter, portraitX, portraitY, 15);

  const textLeft = left + 42;
  context.textAlign = 'left';
  context.fillStyle = '#e5e7eb';
  context.font = '12px system-ui';
  context.fillText(fighter.name, textLeft, y + 13);
  context.fillStyle = roleAccent(fighter.role);
  context.font = '10px system-ui';
  context.fillText(fighter.role ?? 'combatant', textLeft, y + 24);

  context.fillStyle = '#374151';
  context.fillRect(textLeft, y + 18, 162, 5);
  context.fillStyle = '#22c55e';
  context.fillRect(textLeft, y + 18, 162 * hpRatio, 5);
  context.fillStyle = '#1d4ed8';
  context.fillRect(textLeft, y + 26, 162 * spRatio, 4);
  if (fighter.maxMp > 0) {
    context.fillStyle = '#a855f7';
    context.fillRect(textLeft, y + 32, 162 * mpRatio, 4);
  }

  context.fillStyle = '#cbd5e1';
  context.font = '11px system-ui';
  context.fillText(`HP ${fighter.hp}/${fighter.maxHp} SP ${fighter.sp}${fighter.maxMp > 0 ? ` MP ${fighter.mp}` : ''}`, textLeft, y + 48);

  if ((fighter.bossPhaseIndex ?? 0) > 0) {
    context.textAlign = 'right';
    context.fillStyle = '#fca5a5';
    context.fillText(`PHASE ${fighter.bossPhaseIndex + 1}`, left + width - 8, y + 13);
  } else {
    const badge = statusBadges(fighter);
    if (badge) {
      context.textAlign = 'right';
      context.fillStyle = '#fcd34d';
      context.fillText(badge, left + width - 8, y + 13);
    }
  }
}

function drawBattleHud() {
  const visible = getVisibleBattleState();
  visible.players.forEach((fighter, index) => drawBattleHudCard(fighter, 24, 22 + index * 62, 'left'));
  visible.enemies.forEach((fighter, index) => drawBattleHudCard(fighter, elements.canvas.width - 24, 22 + index * 62, 'right'));
}

function drawEventFxOverlay() {
  if (!state.eventFx) {
    return;
  }
  const progress = getEventFxProgress();
  if (progress == null) {
    return;
  }
  const alpha = 1 - progress;
  const tone = {
    combo: '255,255,255',
    critical: '253,224,71',
    tenseiken: '251,191,36',
    impactBomb: '248,113,113',
    nightmareBall: '192,132,252',
    wow: '96,165,250',
    diggin: '52,211,153',
    speedy: '244,114,182',
    stram: '245,158,11',
    cold: '125,211,252',
    burn: '251,146,60',
    zap: '56,189,248',
    fallenWings: '244,114,182',
    killerVoltage: '34,211,238',
    earthQuake: '196,181,253',
    destructionRay: '147,197,253',
    medicinalHerb: '74,222,128',
    antidote: '250,204,21',
    bossPhase: '248,113,113',
    bossReaction: '244,63,94',
    battlefield: '148,163,184',
    status: '132,204,22',
  };
  const rgb = tone[state.eventFx.type] ?? '255,255,255';
  context.fillStyle = `rgba(15,23,42,${0.72 * alpha})`;
  context.fillRect(150, 18, elements.canvas.width - 300, 46);
  context.strokeStyle = `rgba(${rgb},${alpha})`;
  context.lineWidth = 1.5;
  context.strokeRect(150, 18, elements.canvas.width - 300, 46);
  context.fillStyle = `rgba(${rgb},${alpha})`;
  context.font = 'bold 15px system-ui';
  context.textAlign = 'center';
  context.fillText(state.eventFx.text, elements.canvas.width / 2, 47);
  drawImpactBursts();
  drawFloatingTexts();
}

function drawIpGauge() {
  const topY = 440;
  const rowGap = 42;
  const left = gaugeX(0);
  const right = gaugeX(IP_MAX);
  const comX = gaugeX(COM_START);
  const actX = gaugeX(ACT_POINT);

  context.fillStyle = '#0b1220';
  context.fillRect(40, topY - 20, elements.canvas.width - 80, 100);
  context.strokeStyle = '#334155';
  context.lineWidth = 2;
  context.strokeRect(40, topY - 20, elements.canvas.width - 80, 100);

  for (let row = 0; row < 2; row += 1) {
    const y = topY + row * rowGap;
    context.strokeStyle = '#475569';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
  }

  context.strokeStyle = '#fbbf24';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(comX, topY - 8);
  context.lineTo(comX, topY + rowGap + 8);
  context.stroke();

  context.strokeStyle = '#fb7185';
  context.beginPath();
  context.moveTo(actX, topY - 8);
  context.lineTo(actX, topY + rowGap + 8);
  context.stroke();

  context.fillStyle = '#fbbf24';
  context.font = '12px system-ui';
  context.textAlign = 'center';
  context.fillText('COM', comX, topY - 12);
  context.fillStyle = '#fb7185';
  context.fillText('ACT', actX, topY - 12);

  const visible = getVisibleBattleState();
  const rows = [visible.enemies, visible.players];
  rows.forEach((fighters, rowIndex) => {
    const y = topY + rowIndex * rowGap;
    fighters.forEach((fighter) => {
      context.fillStyle = fighter.color;
      context.beginPath();
      context.arc(gaugeX(fighter.ip), y, 8, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = fighter.isAlive ? '#e5e7eb' : '#475569';
      context.lineWidth = 1.5;
      context.stroke();

      context.fillStyle = '#e5e7eb';
      context.textAlign = 'left';
      context.fillText(fighter.name, gaugeX(fighter.ip) + 12, y + 4);
    });
  });

  context.fillStyle = '#94a3b8';
  context.textAlign = 'left';
  context.fillText('Enemies', 50, topY + 4);
  context.fillText('Players', 50, topY + rowGap + 4);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/).filter(Boolean);
  let line = '';
  const lines = [];

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    lines.push(line);
  }

  lines.forEach((entry, index) => ctx.fillText(entry, x, y + index * lineHeight));
  return lines.length;
}

function clearCanvasHotspots() {
  state.canvasHotspots = [];
}

function registerCanvasHotspot(hotspot) {
  state.canvasHotspots.push(hotspot);
}

function drawCanvasTravelButton({ x, y, w, h, title, subtitle = null, accent = '#60a5fa', onClick }) {
  context.fillStyle = 'rgba(15,23,42,0.9)';
  context.fillRect(x, y, w, h);
  context.strokeStyle = accent;
  context.lineWidth = 2;
  context.strokeRect(x, y, w, h);
  context.fillStyle = '#f8fafc';
  context.font = 'bold 14px system-ui';
  context.textAlign = 'left';
  context.fillText(title, x + 12, y + 22);
  if (subtitle) {
    context.fillStyle = '#cbd5e1';
    context.font = '12px system-ui';
    drawWrappedText(context, subtitle, x + 12, y + 42, w - 24, 16);
  }
  registerCanvasHotspot({ x, y, w, h, onClick });
}

function drawScenePanel(x, y, w, h, title = null) {
  context.fillStyle = 'rgba(15, 23, 42, 0.78)';
  context.fillRect(x, y, w, h);
  context.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  context.lineWidth = 1.5;
  context.strokeRect(x, y, w, h);
  if (title) {
    context.fillStyle = '#93c5fd';
    context.font = '12px system-ui';
    context.textAlign = 'left';
    context.fillText(title, x + 12, y + 18);
  }
}

function drawCampaignTravelBackdrop(location, scene, beat) {
  const width = elements.canvas.width;
  const height = elements.canvas.height;
  const stateLabel = resolvedLocationStateLabel(location, beat?.id ?? null);
  const stateText = String(stateLabel).toLowerCase();
  const backdrop = getLoadedImageAsset(campaignBackdropPathForLocation(location));

  if (!drawImageCover(context, backdrop, 0, 0, width, height, 1)) {
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, width, height);
  } else {
    context.fillStyle = 'rgba(2, 6, 23, 0.22)';
    context.fillRect(0, 0, width, height);
  }

  const paintSky = (top, mid, ground) => {
    const topFill = backdrop ? rgba(top, 0.42) : top;
    const midFill = backdrop ? rgba(mid, 0.42) : mid;
    const groundFill = backdrop ? rgba(ground, 0.48) : ground;
    context.fillStyle = topFill;
    context.fillRect(0, 0, width, 140);
    context.fillStyle = midFill;
    context.fillRect(0, 140, width, 170);
    context.fillStyle = groundFill;
    context.fillRect(0, 310, width, 230);
  };

  const drawTowerColumns = (count = 4, color = '#475569') => {
    context.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      context.fillRect(140 + i * 170, 150 + (i % 2) * 10, 54, 220);
      context.fillRect(130 + i * 170, 142 + (i % 2) * 10, 74, 14);
    }
  };

  switch (location?.id) {
    case 'garmia_tower':
    case 'garmia_tower_top': {
      paintSky('#0b1020', stateText.includes('катастроф') ? '#2d0d2d' : '#171f34', '#261d20');
      drawTowerColumns(5, '#52525b');
      context.strokeStyle = 'rgba(167,139,250,0.45)';
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(650, 80);
      context.lineTo(760, 220);
      context.lineTo(840, 130);
      context.stroke();
      break;
    }
    case 'durham_cave_entrance': {
      paintSky('#09101a', '#1b2430', '#32261d');
      context.fillStyle = '#4b5563';
      context.beginPath();
      context.moveTo(90, 390);
      context.lineTo(250, 220);
      context.lineTo(430, 250);
      context.lineTo(540, 160);
      context.lineTo(720, 230);
      context.lineTo(890, 170);
      context.lineTo(930, 390);
      context.closePath();
      context.fill();
      break;
    }
    case 'underground_plant':
    case 'cyrum_secret_passage': {
      paintSky('#071019', '#13253a', '#17354b');
      context.strokeStyle = 'rgba(34,211,238,0.25)';
      context.lineWidth = 3;
      for (let i = 0; i < 7; i += 1) {
        context.beginPath();
        context.moveTo(80 + i * 120, 170);
        context.lineTo(120 + i * 120, 320);
        context.lineTo(60 + i * 120, 430);
        context.stroke();
      }
      context.fillStyle = '#0f172a';
      context.fillRect(0, 300, width, 30);
      break;
    }
    case 'great_rift':
    case 'demons_law': {
      paintSky('#081014', '#223046', '#2a1f24');
      context.strokeStyle = 'rgba(148,163,184,0.35)';
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(60, 420);
      context.lineTo(240, 250);
      context.lineTo(460, 360);
      context.lineTo(700, 180);
      context.lineTo(920, 260);
      context.stroke();
      break;
    }
    case 'valmar_body': {
      paintSky('#13070d', '#2b0f1d', '#3a1212');
      context.fillStyle = 'rgba(239,68,68,0.18)';
      for (let i = 0; i < 6; i += 1) {
        context.beginPath();
        context.arc(120 + i * 150, 280 + (i % 2) * 22, 90, 0, Math.PI * 2);
        context.fill();
      }
      break;
    }
    case 'valmars_moon':
    case 'valmars_womb': {
      paintSky('#140716', '#32103b', '#431a22');
      context.fillStyle = 'rgba(244,114,182,0.16)';
      for (let i = 0; i < 8; i += 1) {
        context.fillRect(90 + i * 108, 190 + (i % 2) * 18, 44, 180);
      }
      break;
    }
    case 'birthplace_of_the_gods': {
      paintSky('#08111f', '#16253b', '#272833');
      context.strokeStyle = 'rgba(147,197,253,0.35)';
      context.lineWidth = 3;
      for (let i = 0; i < 5; i += 1) {
        context.strokeRect(120 + i * 150, 160, 90, 170);
      }
      break;
    }
    case 'inner_trial': {
      paintSky('#070b14', '#0f172a', '#111827');
      context.strokeStyle = 'rgba(148,163,184,0.3)';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(280, 160);
      context.lineTo(720, 420);
      context.moveTo(720, 160);
      context.lineTo(280, 420);
      context.stroke();
      break;
    }
    case 'new_valmar':
    case 'new_valmar_room_of_chaos':
    case 'new_valmar_core': {
      paintSky('#12060b', '#2a0d18', '#2f1317');
      context.fillStyle = 'rgba(248,250,252,0.08)';
      context.beginPath();
      context.arc(780, 180, 120, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(239,68,68,0.25)';
      context.lineWidth = 4;
      context.beginPath();
      context.arc(780, 180, 82, 0, Math.PI * 2);
      context.stroke();
      break;
    }
    default: {
      if (location?.type === 'town') {
        paintSky(stateText.includes('день тьмы') ? '#1a0b0b' : '#0f172a', stateText.includes('войн') ? '#2b1d1d' : '#1e293b', stateText.includes('войн') ? '#334155' : '#1f3b29');
      } else {
        paintSky('#0b1324', '#11233f', '#234d20');
      }
    }
  }

  if (scene?.path?.length) {
    context.strokeStyle = 'rgba(255,255,255,0.08)';
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(scene.path[0].x, scene.path[0].y);
    scene.path.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
  }
}

function drawTravelBuilding({ x, y, w, h, label, subtitle, accent = '#60a5fa', onClick, targetPoint = null, autoTrigger = true }) {
  context.fillStyle = 'rgba(30, 41, 59, 0.95)';
  context.fillRect(x, y, w, h);
  context.fillStyle = accent;
  context.fillRect(x + 6, y + 8, w - 12, 18);
  context.fillStyle = '#0f172a';
  context.fillRect(x + w * 0.35, y + h - 34, w * 0.3, 28);
  context.strokeStyle = '#cbd5e1';
  context.lineWidth = 2;
  context.strokeRect(x, y, w, h);
  context.fillStyle = '#f8fafc';
  context.font = 'bold 12px system-ui';
  context.textAlign = 'center';
  context.fillText(label, x + w / 2, y + 21);
  if (subtitle) {
    context.fillStyle = '#cbd5e1';
    context.font = '11px system-ui';
    context.fillText(subtitle, x + w / 2, y + h - 42);
  }
  registerCanvasHotspot({ x, y, w, h, onClick, targetPoint, autoTrigger });
}

function drawTravelGate({ x, y, w, h, label, accent = '#34d399', onClick, targetPoint = null, autoTrigger = true }) {
  context.fillStyle = 'rgba(17, 24, 39, 0.9)';
  context.fillRect(x, y, w, h);
  context.strokeStyle = accent;
  context.lineWidth = 2;
  context.strokeRect(x, y, w, h);
  context.beginPath();
  context.moveTo(x + w / 2, y + 8);
  context.lineTo(x + w / 2, y + h - 8);
  context.stroke();
  context.fillStyle = '#f8fafc';
  context.font = 'bold 12px system-ui';
  context.textAlign = 'center';
  context.fillText(label, x + w / 2, y + h / 2 + 4);
  registerCanvasHotspot({ x, y, w, h, onClick, targetPoint, autoTrigger });
}

function drawTravelNpc({ x, y, label, accent = '#c084fc', onClick, targetPoint = null, autoTrigger = false }) {
  const bob = Math.sin(performance.now() / 260 + x * 0.01) * 3;
  const actualY = y + bob;
  context.fillStyle = accent;
  context.beginPath();
  context.arc(x, actualY, 14, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#f8fafc';
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = '#0f172a';
  context.font = 'bold 10px system-ui';
  context.textAlign = 'center';
  context.fillText('NPC', x, actualY + 3);
  context.fillStyle = '#f8fafc';
  context.font = '11px system-ui';
  context.fillText(label, x, actualY + 28);
  registerCanvasHotspot({ x: x - 16, y: actualY - 16, w: 32, h: 40, onClick, targetPoint, autoTrigger });
}

function drawTravelService({ x, y, label, accent = '#34d399', onClick, targetPoint = null, autoTrigger = false }) {
  context.fillStyle = accent;
  context.fillRect(x, y, 48, 24);
  context.strokeStyle = '#f8fafc';
  context.lineWidth = 2;
  context.strokeRect(x, y, 48, 24);
  context.fillStyle = '#0f172a';
  context.font = 'bold 10px system-ui';
  context.textAlign = 'center';
  context.fillText(label, x + 24, y + 15);
  registerCanvasHotspot({ x, y, w: 48, h: 24, onClick, targetPoint, autoTrigger });
}

function drawTravelTreasure({ x, y, label, onClick, targetPoint = null }) {
  context.fillStyle = '#f59e0b';
  context.fillRect(x - 16, y - 10, 32, 22);
  context.strokeStyle = '#fef3c7';
  context.lineWidth = 2;
  context.strokeRect(x - 16, y - 10, 32, 22);
  context.fillStyle = '#0f172a';
  context.font = 'bold 10px system-ui';
  context.textAlign = 'center';
  context.fillText('CHEST', x, y + 24);
  registerCanvasHotspot({ x: x - 18, y: y - 12, w: 36, h: 26, onClick, targetPoint, autoTrigger: false });
}

function drawTravelEncounterMarker({ x, y, label, onClick, targetPoint = null }) {
  const pulse = (Math.sin(performance.now() / 220 + x * 0.02) + 1) * 0.5;
  const radius = 14 + pulse * 4;
  context.fillStyle = '#ef4444';
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#fecaca';
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = '#0f172a';
  context.font = 'bold 10px system-ui';
  context.textAlign = 'center';
  context.fillText('MON', x, y + 3);
  context.fillStyle = '#fee2e2';
  context.font = '11px system-ui';
  context.fillText(label, x, y + 28);
  registerCanvasHotspot({ x: x - 18, y: y - 18, w: 36, h: 40, onClick, targetPoint, autoTrigger: true });
}

function townSceneBuildingSpots() {
  return [
    { x: 92, y: 182, w: 152, h: 92 },
    { x: 272, y: 166, w: 170, h: 108 },
    { x: 470, y: 176, w: 168, h: 98 },
    { x: 668, y: 188, w: 144, h: 86 },
    { x: 210, y: 292, w: 152, h: 88 },
    { x: 434, y: 298, w: 170, h: 82 },
  ];
}

function getCampaignTravelSceneModel() {
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!beat || !location) {
    return null;
  }

  const exits = campaignVisibleExitsForBeat(location.id, beat.id);
  const events = availableWorldEventsForCurrentLocation();
  const treasures = availableTreasuresForCurrentLocation();
  const encounters = availableTravelEncountersForCurrentLocation();
  const layout = LOCATION_SCENE_LAYOUTS[location.id] ?? null;
  const walkBounds = layout?.walkBounds ?? { x: 40, y: 164, w: 920, h: 334 };
  const spawn = layout?.spawn ?? { x: 172, y: 442 };

  if (location.type === 'town') {
    const internalExits = exits.filter((entry) => entry.type === 'interior' || entry.type === 'special');
    const outwardExits = exits.filter((entry) => entry.type !== 'interior' && entry.type !== 'special');
    const spots = layout?.buildingSlots ?? townSceneBuildingSpots();
    const buildings = internalExits.slice(0, spots.length).map((exitLocation, index) => {
      const spot = spots[index];
      return {
        ...spot,
        location: exitLocation,
        label: exitLocation.title,
        subtitle: exitLocation.type,
        accent: exitLocation.id === getCurrentCampaignWorldBinding()?.objectiveLocationId ? '#22c55e' : '#60a5fa',
        targetPoint: { x: spot.x + spot.w / 2, y: spot.y + spot.h + 18 },
      };
    });
    const gateLayouts = layout?.gateSlots ?? [];
    const gates = outwardExits.slice(0, 4).map((exitLocation, index) => ({
      x: gateLayouts[index]?.x ?? (86 + index * 210),
      y: gateLayouts[index]?.y ?? 444,
      w: gateLayouts[index]?.w ?? 162,
      h: gateLayouts[index]?.h ?? 40,
      location: exitLocation,
      label: exitLocation.title,
      accent: exitLocation.id === getCurrentCampaignWorldBinding()?.objectiveLocationId ? '#22c55e' : '#f59e0b',
      targetPoint: { x: (gateLayouts[index]?.x ?? (86 + index * 210)) + ((gateLayouts[index]?.w ?? 162) / 2), y: (gateLayouts[index]?.y ?? 444) - 6 },
    }));
    const npcLayouts = layout?.npcSlots ?? [];
    const npcs = events.slice(0, 4).map((event, index) => ({
      x: npcLayouts[index]?.x ?? (150 + index * 180),
      y: npcLayouts[index]?.y ?? (392 + (index % 2) * 28),
      label: event.label,
      event,
      targetPoint: { x: npcLayouts[index]?.x ?? (150 + index * 180), y: (npcLayouts[index]?.y ?? (392 + (index % 2) * 28)) + 18 },
    }));
    const services = [];
    const facilities = resolvedFacilitiesForLocation(location, beat.id);
    if (facilities.includes('save-point') || facilities.includes('inn')) {
      services.push({ x: 830, y: 336, label: 'REST', accent: '#34d399', action: restAtCurrentCampaignLocation, targetPoint: { x: 854, y: 370 } });
    }
    if (facilities.includes('shop')) {
      services.push({ x: 888, y: 336, label: 'SHOP', accent: '#38bdf8', action: inspectCurrentCampaignLocation, targetPoint: { x: 912, y: 370 } });
    }
    const treasureSlots = [
      { x: 134, y: 346 },
      { x: 706, y: 324 },
      { x: 594, y: 410 },
    ];
    const encounterSlots = [
      { x: 430, y: 354 },
      { x: 820, y: 404 },
    ];
    return {
      kind: 'town',
      walkBounds,
      spawn,
      obstacles: buildings.map((entry) => ({ x: entry.x, y: entry.y, w: entry.w, h: entry.h })),
      buildings,
      gates,
      npcs,
      treasures: treasures.slice(0, treasureSlots.length).map((entry, index) => ({ ...treasureSlots[index], treasure: entry, targetPoint: { x: treasureSlots[index].x, y: treasureSlots[index].y + 18 } })),
      encounters: encounters.slice(0, encounterSlots.length).map((entry, index) => ({ ...encounterSlots[index], encounter: entry, targetPoint: { x: encounterSlots[index].x, y: encounterSlots[index].y + 18 } })),
      services,
    };
  }

  if (location.type === 'interior') {
    const doorLayouts = layout?.doorSlots ?? [
      { x: 118, y: 228, w: 94, h: 126, targetPoint: { x: 165, y: 370 } },
      { x: 782, y: 228, w: 94, h: 126, targetPoint: { x: 829, y: 370 } },
      { x: 438, y: 402, w: 124, h: 72, targetPoint: { x: 500, y: 392 } },
      { x: 438, y: 190, w: 124, h: 72, targetPoint: { x: 500, y: 278 } },
    ];
    const doors = exits.slice(0, doorLayouts.length).map((exitLocation, index) => {
      const doorLayout = doorLayouts[index];
      return doorLayout ? {
        ...doorLayout,
        location: exitLocation,
        label: exitLocation.title,
        accent: exitLocation.id === getCurrentCampaignWorldBinding()?.objectiveLocationId ? '#22c55e' : '#60a5fa',
      } : null;
    }).filter(Boolean);
    const npcLayouts = layout?.npcSlots ?? [];
    const npcs = events.slice(0, Math.max(3, npcLayouts.length || 3)).map((event, index) => ({
      x: npcLayouts[index]?.x ?? (300 + index * 180),
      y: npcLayouts[index]?.y ?? 304,
      label: event.label,
      event,
      targetPoint: { x: npcLayouts[index]?.x ?? (300 + index * 180), y: (npcLayouts[index]?.y ?? 304) + 28 },
    }));
    const services = [];
    const facilities = resolvedFacilitiesForLocation(location, beat.id);
    if (facilities.includes('inn') || facilities.includes('save-point')) {
      services.push({ x: 818, y: 182, label: 'REST', accent: '#34d399', action: restAtCurrentCampaignLocation, targetPoint: { x: 842, y: 214 } });
    }
    if (facilities.includes('shop')) {
      services.push({ x: 874, y: 182, label: 'SHOP', accent: '#38bdf8', action: inspectCurrentCampaignLocation, targetPoint: { x: 898, y: 214 } });
    }
    const treasureSlots = layout?.treasureSlots ?? [{ x: 222, y: 380 }, { x: 742, y: 388 }];
    const encounterSlots = layout?.encounterSlots ?? [{ x: 500, y: 356 }];
    return {
      kind: 'interior',
      walkBounds,
      spawn,
      obstacles: layout?.obstacles ?? [{ x: 350, y: 170, w: 300, h: 64 }],
      doors,
      npcs,
      treasures: treasures.slice(0, treasureSlots.length).map((entry, index) => ({ ...treasureSlots[index], treasure: entry, targetPoint: { x: treasureSlots[index].x, y: treasureSlots[index].y + 18 } })),
      encounters: encounters.slice(0, encounterSlots.length).map((entry, index) => ({ ...encounterSlots[index], encounter: entry, targetPoint: { x: encounterSlots[index].x, y: encounterSlots[index].y + 18 } })),
      services,
    };
  }

  const routeNodeSlots = layout?.routeNodeSlots ?? [];
  const nodes = exits.slice(0, routeNodeSlots.length > 0 ? routeNodeSlots.length : 4).map((exitLocation, index) => ({
    x: routeNodeSlots[index]?.x ?? (228 + index * 190),
    y: routeNodeSlots[index]?.y ?? (index % 2 === 0 ? 254 : 218),
    radius: routeNodeSlots[index]?.radius ?? 26,
    location: exitLocation,
    label: exitLocation.title,
    accent: exitLocation.id === getCurrentCampaignWorldBinding()?.objectiveLocationId ? '#22c55e' : '#60a5fa',
    targetPoint: routeNodeSlots[index]?.targetPoint ?? { x: routeNodeSlots[index]?.x ?? (228 + index * 190), y: (routeNodeSlots[index]?.y ?? (index % 2 === 0 ? 254 : 218)) + 34 },
  }));
  const npcLayouts = layout?.npcSlots ?? [];
  const npcs = events.slice(0, Math.max(3, npcLayouts.length || 3)).map((event, index) => ({
    x: npcLayouts[index]?.x ?? (178 + index * 180),
    y: npcLayouts[index]?.y ?? 392,
    label: event.label,
    event,
    targetPoint: { x: npcLayouts[index]?.x ?? (178 + index * 180), y: (npcLayouts[index]?.y ?? 392) + 26 },
  }));
  const services = [];
  const facilities = resolvedFacilitiesForLocation(location, beat.id);
  if (facilities.some((facility) => ['camp', 'save-point'].includes(facility))) {
    services.push({ x: 848, y: 334, label: 'REST', accent: '#34d399', action: restAtCurrentCampaignLocation, targetPoint: { x: 872, y: 366 } });
  }
  const treasureSlots = layout?.treasureSlots ?? [{ x: 332, y: 406 }, { x: 724, y: 346 }];
  const encounterSlots = layout?.encounterSlots ?? [{ x: 470, y: 250 }, { x: 760, y: 250 }];
  return {
    kind: 'route',
    walkBounds,
    spawn,
    path: layout?.routePath ?? null,
    obstacles: layout?.obstacles ?? [{ x: 410, y: 310, w: 120, h: 52 }, { x: 620, y: 202, w: 92, h: 38 }],
    nodes,
    npcs,
    treasures: treasures.slice(0, treasureSlots.length).map((entry, index) => ({ ...treasureSlots[index], treasure: entry, targetPoint: { x: treasureSlots[index].x, y: treasureSlots[index].y + 18 } })),
    encounters: encounters.slice(0, encounterSlots.length).map((entry, index) => ({ ...encounterSlots[index], encounter: entry, targetPoint: { x: encounterSlots[index].x, y: encounterSlots[index].y + 18 } })),
    services,
  };
}

function createDefaultCampaignAvatar() {
  return {
    locationId: null,
    x: 160,
    y: 442,
    radius: 12,
    targetX: null,
    targetY: null,
    facing: 'right',
    pendingHotspot: null,
  };
}

function ensureCampaignAvatarForCurrentLocation() {
  const location = getCurrentCampaignLocation();
  const scene = getCampaignTravelSceneModel();
  if (!location || !scene) {
    return null;
  }
  if (!state.campaignAvatar || state.campaignAvatar.locationId !== location.id) {
    state.campaignAvatar = {
      ...createDefaultCampaignAvatar(),
      locationId: location.id,
      x: scene.spawn.x,
      y: scene.spawn.y,
    };
  }
  return state.campaignAvatar;
}

function resetCampaignAvatarForLocation(locationId) {
  const location = getWorldLocation(locationId);
  if (!location) {
    return;
  }
  const previous = state.campaignRun.currentLocationId;
  state.campaignRun.currentLocationId = location.id;
  const scene = getCampaignTravelSceneModel();
  state.campaignRun.currentLocationId = previous;
  state.campaignAvatar = {
    ...createDefaultCampaignAvatar(),
    locationId,
    x: scene?.spawn?.x ?? 160,
    y: scene?.spawn?.y ?? 442,
  };
}

function scenePointCollides(x, y, radius, rect) {
  return x + radius > rect.x && x - radius < rect.x + rect.w && y + radius > rect.y && y - radius < rect.y + rect.h;
}

function clampAvatarPosition(x, y, scene, radius) {
  return {
    x: Math.max(scene.walkBounds.x + radius, Math.min(x, scene.walkBounds.x + scene.walkBounds.w - radius)),
    y: Math.max(scene.walkBounds.y + radius, Math.min(y, scene.walkBounds.y + scene.walkBounds.h - radius)),
  };
}

function moveAvatarWithinScene(nextX, nextY, scene, radius, currentX, currentY) {
  const clamped = clampAvatarPosition(nextX, nextY, scene, radius);
  let resolvedX = clamped.x;
  let resolvedY = clamped.y;
  for (const obstacle of scene.obstacles ?? []) {
    if (scenePointCollides(resolvedX, currentY, radius, obstacle)) {
      resolvedX = currentX;
    }
    if (scenePointCollides(resolvedX, resolvedY, radius, obstacle)) {
      resolvedY = currentY;
    }
  }
  return { x: resolvedX, y: resolvedY };
}

function setCampaignAvatarTarget(x, y, pendingHotspot = null) {
  const avatar = ensureCampaignAvatarForCurrentLocation();
  const scene = getCampaignTravelSceneModel();
  if (!avatar || !scene) {
    return;
  }
  const clamped = clampAvatarPosition(x, y, scene, avatar.radius);
  avatar.targetX = clamped.x;
  avatar.targetY = clamped.y;
  avatar.pendingHotspot = pendingHotspot;
  ensureAnimationLoop();
}

function resolveCampaignAvatarArrival(avatar) {
  if (!avatar?.pendingHotspot?.onClick) {
    avatar.pendingHotspot = null;
    return;
  }
  const callback = avatar.pendingHotspot.onClick;
  avatar.pendingHotspot = null;
  avatar.targetX = null;
  avatar.targetY = null;
  callback();
}

function updateCampaignAvatar(now) {
  if (!(campaignRunActive() && state.appScreen === 'app' && state.activeTab === 'campaign' && state.campaignRun.phase === 'travel')) {
    state.lastAnimationTime = now;
    return false;
  }
  const avatar = ensureCampaignAvatarForCurrentLocation();
  const scene = getCampaignTravelSceneModel();
  if (!avatar || !scene) {
    state.lastAnimationTime = now;
    return false;
  }

  const dt = Math.min(0.033, Math.max(0.008, ((now - (state.lastAnimationTime ?? now)) / 1000) || 0.016));
  state.lastAnimationTime = now;
  const keys = state.navigationKeys ?? {};
  const horizontal = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0);
  const vertical = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
  const keyboardActive = horizontal !== 0 || vertical !== 0;
  let moveX = 0;
  let moveY = 0;

  if (keyboardActive) {
    avatar.pendingHotspot = null;
    avatar.targetX = null;
    avatar.targetY = null;
    const length = Math.hypot(horizontal, vertical) || 1;
    moveX = (horizontal / length) * 180 * dt;
    moveY = (vertical / length) * 180 * dt;
  } else if (avatar.targetX != null && avatar.targetY != null) {
    const dx = avatar.targetX - avatar.x;
    const dy = avatar.targetY - avatar.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 6) {
      avatar.x = avatar.targetX;
      avatar.y = avatar.targetY;
      resolveCampaignAvatarArrival(avatar);
      return Boolean(state.eventFx || avatar.pendingHotspot);
    }
    const travel = Math.min(distance, 180 * dt);
    moveX = (dx / distance) * travel;
    moveY = (dy / distance) * travel;
  }

  if (moveX === 0 && moveY === 0) {
    return false;
  }

  const next = moveAvatarWithinScene(avatar.x + moveX, avatar.y + moveY, scene, avatar.radius, avatar.x, avatar.y);
  if (next.x > avatar.x + 0.1) avatar.facing = 'right';
  else if (next.x < avatar.x - 0.1) avatar.facing = 'left';
  else if (next.y < avatar.y - 0.1) avatar.facing = 'up';
  else if (next.y > avatar.y + 0.1) avatar.facing = 'down';
  avatar.x = next.x;
  avatar.y = next.y;

  if (keyboardActive) {
    const autoHotspot = [...(state.canvasHotspots ?? [])].reverse().find((entry) => entry.autoTrigger && entry.targetPoint && Math.hypot(entry.targetPoint.x - avatar.x, entry.targetPoint.y - avatar.y) <= 16);
    if (autoHotspot?.onClick) {
      autoHotspot.onClick();
      return false;
    }
  }

  return true;
}

function drawCampaignAvatar() {
  const avatar = ensureCampaignAvatarForCurrentLocation();
  if (!avatar) {
    return;
  }
  const sprite = getLoadedImageAsset('./assets/units/ryudo.svg');
  if (sprite) {
    drawImageCover(context, sprite, avatar.x - 20, avatar.y - 34, 40, 40, 1);
  } else {
    context.fillStyle = '#f8fafc';
    context.beginPath();
    context.arc(avatar.x, avatar.y - 8, avatar.radius * 0.7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#2563eb';
    context.fillRect(avatar.x - 10, avatar.y + 2, 20, 24);
    context.strokeStyle = '#dbeafe';
    context.lineWidth = 2;
    context.strokeRect(avatar.x - 10, avatar.y + 2, 20, 24);
  }
  context.strokeStyle = '#dbeafe';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(avatar.x, avatar.y - 2, avatar.radius + 2, 0, Math.PI * 2);
  context.stroke();
}

function drawCampaignTravelCanvas(page, beat) {
  const location = getCurrentCampaignLocation();
  const objective = getWorldLocation(getCurrentCampaignWorldBinding()?.objectiveLocationId ?? null);
  const scene = getCampaignTravelSceneModel();
  const avatar = ensureCampaignAvatarForCurrentLocation();
  const questChain = activeQuestChainForBeat(beat?.id ?? null);
  const dungeonChain = activeDungeonStageChain(location?.id ?? null);
  const nextStep = nextQuestChainStepForBeat(beat?.id ?? null);

  drawCampaignTravelBackdrop(location, scene, beat);

  drawScenePanel(42, 40, 916, 88, 'Route header');
  context.fillStyle = '#f8fafc';
  context.font = 'bold 28px system-ui';
  context.textAlign = 'left';
  context.fillText(page?.title ?? location?.title ?? 'Travel', 60, 78);
  context.fillStyle = '#cbd5e1';
  context.font = '15px system-ui';
  context.fillText(page?.subtitle ?? location?.region ?? '', 60, 104);
  context.font = '12px system-ui';
  context.fillStyle = '#94a3b8';
  context.fillText(`State: ${resolvedLocationStateLabel(location, beat?.id)}${nextStep ? ` · next: ${nextStep.label}` : ''}`, 60, 126);

  if (scene?.kind === 'town') {
    scene.buildings.forEach((entry) => {
      drawTravelBuilding({
        ...entry,
        onClick: () => travelToCampaignLocation(entry.location.id),
        targetPoint: entry.targetPoint,
      });
    });
    scene.gates.forEach((entry) => {
      drawTravelGate({
        ...entry,
        onClick: () => travelToCampaignLocation(entry.location.id),
        targetPoint: entry.targetPoint,
      });
    });
  } else if (scene?.kind === 'interior') {
    drawScenePanel(140, 172, 720, 140, 'Interior');
    drawTravelBuilding({ x: 182, y: 202, w: 190, h: 80, label: location?.title ?? 'Interior', subtitle: 'scene node', accent: '#f59e0b', onClick: inspectCurrentCampaignLocation, targetPoint: { x: 278, y: 300 } });
    scene.doors.forEach((entry) => {
      drawTravelGate({
        ...entry,
        onClick: () => travelToCampaignLocation(entry.location.id),
        targetPoint: entry.targetPoint,
      });
    });
  } else if (scene?.kind === 'route') {
    const pathPoints = scene.path ?? [{ x: 118, y: 260 }, ...scene.nodes.map((node) => ({ x: node.x, y: node.y }))];
    context.strokeStyle = '#f8fafc';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(pathPoints[0]?.x ?? 118, pathPoints[0]?.y ?? 260);
    pathPoints.slice(1).forEach((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();
    scene.nodes.forEach((node) => {
      context.fillStyle = node.location?.id === objective?.id ? '#22c55e' : '#60a5fa';
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#f8fafc';
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = '#f8fafc';
      context.font = '11px system-ui';
      context.textAlign = 'center';
      drawWrappedText(context, node.label, node.x - 65, node.y + 42, 130, 14);
      registerCanvasHotspot({ x: node.x - node.radius, y: node.y - node.radius, w: node.radius * 2, h: node.radius * 2, onClick: () => travelToCampaignLocation(node.location.id), targetPoint: node.targetPoint });
    });
  }

  for (const treasure of scene?.treasures ?? []) {
    drawTravelTreasure({ x: treasure.x, y: treasure.y, label: treasure.treasure.label, onClick: () => openCampaignTreasure(treasure.treasure.id), targetPoint: treasure.targetPoint });
  }
  for (const encounter of scene?.encounters ?? []) {
    drawTravelEncounterMarker({ x: encounter.x, y: encounter.y, label: encounter.encounter.label, onClick: () => startCampaignTravelEncounter(encounter.encounter.id), targetPoint: encounter.targetPoint });
  }
  for (const event of scene?.npcs ?? []) {
    drawTravelNpc({ x: event.x, y: event.y, label: event.label, onClick: () => triggerWorldEvent(event.event.id), targetPoint: event.targetPoint });
  }
  for (const service of scene?.services ?? []) {
    drawTravelService({ x: service.x, y: service.y, label: service.label, accent: service.accent, onClick: service.action, targetPoint: service.targetPoint });
  }
  if (nextLocationSceneForCurrentContext()) {
    drawTravelService({
      x: 854,
      y: 302,
      label: 'SCN',
      accent: '#c084fc',
      onClick: () => openCurrentLocationScene(nextLocationSceneForCurrentContext()),
      targetPoint: { x: 878, y: 336 },
    });
  }
  if (campaignTravelObjectiveReady()) {
    drawTravelService({
      x: 908,
      y: 334,
      label: page?.action === 'launch-battle' ? 'GO' : page?.action === 'launch-setpiece' ? 'SCN' : 'OK',
      accent: '#ef4444',
      onClick: (page?.action === 'launch-battle' || page?.action === 'launch-setpiece') ? launchCampaignBattleFromCurrentScene : completeCurrentPlaceholderBeat,
      targetPoint: { x: 932, y: 370 },
    });
  }

  if (scene?.obstacles?.length) {
    context.save();
    context.strokeStyle = 'rgba(148,163,184,0.15)';
    context.lineWidth = 1;
    for (const obstacle of scene.obstacles) {
      context.strokeRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    }
    context.restore();
  }

  drawCampaignAvatar();

  drawScenePanel(42, 388, 916, 116, 'Travel log');
  context.fillStyle = '#fde68a';
  context.font = 'bold 15px system-ui';
  context.textAlign = 'left';
  context.fillText(`Objective: ${objective?.title ?? 'n/a'}`, 60, 410);
  context.fillStyle = '#e5e7eb';
  context.font = '14px system-ui';
  drawWrappedText(context, state.campaignRun.travelMessage ?? location?.description ?? '', 60, 434, 880, 20);
  context.fillStyle = '#93c5fd';
  context.font = '12px system-ui';
  context.fillText(`WASD / стрелки — движение. Сундуки: ${scene?.treasures?.length ?? 0}. Encounter-ы: ${scene?.encounters?.length ?? 0}.`, 60, 492);

  if (questChain?.steps?.length) {
    drawScenePanel(640, 150, 280, 172, 'Quest chain');
    context.fillStyle = '#e5e7eb';
    context.font = '12px system-ui';
    let y = 174;
    for (const step of questChain.steps.slice(0, 6)) {
      const marker = hasQuestFlag(step.flagId) ? '✓' : '·';
      const title = `${marker} ${step.label}`;
      const lines = drawWrappedText(context, title, 654, y, 246, 16);
      y += lines * 16 + 6;
    }
  }
  if (dungeonChain?.steps?.length) {
    drawScenePanel(640, 326, 280, 98, 'Dungeon stage');
    context.fillStyle = '#e5e7eb';
    context.font = '12px system-ui';
    let y = 350;
    for (const step of dungeonChain.steps.slice(0, 3)) {
      const marker = hasQuestFlag(step.flagId) ? '✓' : '·';
      const lines = drawWrappedText(context, `${marker} ${step.label}`, 654, y, 246, 16);
      y += lines * 16 + 4;
    }
  }
}

function drawCampaignOverworldCanvas(page, beat) {
  const fromLocation = getWorldLocation(state.campaignRun.pendingTravelFromLocationId ?? null);
  const toLocation = getWorldLocation(state.campaignRun.pendingTravelToLocationId ?? null);
  const chapter = getCurrentCampaignChapter();
  const nodes = listMajorLocationsForBeat(beat?.id ?? '').slice(0, 8);
  const backdrop = getLoadedImageAsset(campaignBackdropPathForLocation(toLocation ?? fromLocation));

  if (!drawImageCover(context, backdrop, 0, 0, elements.canvas.width, elements.canvas.height, 1)) {
    context.fillStyle = '#050b16';
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  } else {
    context.fillStyle = 'rgba(2, 6, 23, 0.3)';
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  }
  drawScenePanel(48, 44, 904, 88, 'Overworld');
  context.fillStyle = '#f8fafc';
  context.font = 'bold 30px system-ui';
  context.textAlign = 'left';
  context.fillText(page?.title ?? 'Overworld travel', 68, 84);
  context.fillStyle = '#cbd5e1';
  context.font = '15px system-ui';
  context.fillText(chapter?.title ?? '', 68, 110);
  context.fillStyle = '#94a3b8';
  context.font = '12px system-ui';
  context.fillText('Original-flow shift: old region closes behind the party, new route opens ahead.', 68, 128);

  context.strokeStyle = '#334155';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(120, 250);
  context.lineTo(880, 250);
  context.stroke();

  nodes.forEach((location, index) => {
    const x = 130 + index * 105;
    const y = 250 + (index % 2 === 0 ? -22 : 24);
    context.fillStyle = location.id === fromLocation?.id ? '#f59e0b' : location.id === toLocation?.id ? '#22c55e' : '#475569';
    context.beginPath();
    context.arc(x, y, location.id === fromLocation?.id || location.id === toLocation?.id ? 16 : 11, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#f8fafc';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#e5e7eb';
    context.font = '11px system-ui';
    context.textAlign = 'center';
    drawWrappedText(context, location.title, x - 48, y + 34, 96, 14);
  });

  drawScenePanel(90, 332, 820, 118, 'Route travel');
  context.fillStyle = '#e5e7eb';
  context.font = '16px system-ui';
  context.textAlign = 'left';
  const lines = Array.isArray(page?.text) ? page.text : [];
  let y = 356;
  for (const line of lines) {
    const count = drawWrappedText(context, line, 108, y, 784, 22);
    y += count * 22 + 8;
  }
  drawCanvasTravelButton({ x: 712, y: 456, w: 198, h: 42, title: 'Прибыть в регион', subtitle: toLocation?.title ?? 'destination', accent: '#22c55e', onClick: completeCampaignOverworldTravel });
}

function handleCanvasPointerMove(event) {
  const rect = elements.canvas.getBoundingClientRect();
  const scaleX = elements.canvas.width / rect.width;
  const scaleY = elements.canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const hover = (state.canvasHotspots ?? []).some((hotspot) => x >= hotspot.x && x <= hotspot.x + hotspot.w && y >= hotspot.y && y <= hotspot.y + hotspot.h);
  elements.canvas.style.cursor = hover ? 'pointer' : 'default';
}

function handleCanvasClick(event) {
  if (!(campaignRunActive() && state.activeTab === 'campaign' && isCampaignNarrativeMode())) {
    return;
  }
  const rect = elements.canvas.getBoundingClientRect();
  const scaleX = elements.canvas.width / rect.width;
  const scaleY = elements.canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const hotspot = [...(state.canvasHotspots ?? [])].reverse().find((entry) => x >= entry.x && x <= entry.x + entry.w && y >= entry.y && y <= entry.y + entry.h);

  if (state.campaignRun.phase === 'travel') {
    if (hotspot?.targetPoint) {
      setCampaignAvatarTarget(hotspot.targetPoint.x, hotspot.targetPoint.y, hotspot);
      return;
    }
    const scene = getCampaignTravelSceneModel();
    if (scene && x >= scene.walkBounds.x && x <= scene.walkBounds.x + scene.walkBounds.w && y >= scene.walkBounds.y && y <= scene.walkBounds.y + scene.walkBounds.h) {
      setCampaignAvatarTarget(x, y, null);
      return;
    }
  }

  if (hotspot?.onClick) {
    hotspot.onClick();
  }
}

function drawSetpieceBackdrop(beatId, page) {
  const w = elements.canvas.width;
  const h = elements.canvas.height;
  switch (beatId) {
    case 'millenia_first_attack': {
      context.fillStyle = '#090915';
      context.fillRect(0, 0, w, h);
      context.fillStyle = 'rgba(79, 70, 229, 0.22)';
      context.beginPath();
      context.arc(820, 110, 70, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#1f2937';
      for (let i = 0; i < 5; i += 1) {
        context.fillRect(80 + i * 170, 300 - (i % 2) * 24, 90, 110);
        context.fillRect(104 + i * 170, 268 - (i % 2) * 24, 42, 32);
      }
      context.strokeStyle = 'rgba(236,72,153,0.55)';
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(640, 140);
      context.quadraticCurveTo(760, 220, 870, 160);
      context.moveTo(640, 160);
      context.quadraticCurveTo(760, 100, 870, 210);
      context.stroke();
      break;
    }
    case 'moon_assault': {
      context.fillStyle = '#160816';
      context.fillRect(0, 0, w, h);
      context.fillStyle = 'rgba(244,114,182,0.14)';
      for (let i = 0; i < 8; i += 1) {
        context.fillRect(90 + i * 110, 190 + (i % 2) * 18, 42, 184);
      }
      context.strokeStyle = 'rgba(250,204,21,0.35)';
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(120, 420);
      context.lineTo(260, 300);
      context.lineTo(440, 340);
      context.lineTo(640, 240);
      context.lineTo(840, 180);
      context.stroke();
      break;
    }
    case 'granasaber_ship': {
      context.fillStyle = '#07111f';
      context.fillRect(0, 0, w, h);
      context.strokeStyle = 'rgba(147,197,253,0.5)';
      context.lineWidth = 4;
      context.beginPath();
      context.arc(760, 190, 120, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(760, 190, 70, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = 'rgba(59,130,246,0.16)';
      context.fillRect(150, 260, 680, 80);
      context.fillStyle = '#93c5fd';
      context.fillRect(350, 220, 280, 22);
      context.fillRect(390, 200, 200, 12);
      break;
    }
    case 'melfice_duel': {
      context.fillStyle = '#0d0a12';
      context.fillRect(0, 0, w, h);
      context.fillStyle = 'rgba(250,204,21,0.08)';
      context.fillRect(120, 290, 760, 90);
      context.strokeStyle = 'rgba(250,204,21,0.28)';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(120, 360);
      context.lineTo(260, 260);
      context.lineTo(420, 290);
      context.lineTo(600, 220);
      context.lineTo(760, 250);
      context.stroke();
      break;
    }
    case 'cathedral_massacre': {
      context.fillStyle = '#17080b';
      context.fillRect(0, 0, w, h);
      context.fillStyle = '#2a1b2b';
      for (let i = 0; i < 5; i += 1) {
        context.fillRect(120 + i * 150, 150, 50, 220);
      }
      context.fillStyle = 'rgba(239,68,68,0.14)';
      context.fillRect(90, 300, 820, 96);
      context.strokeStyle = 'rgba(248,113,113,0.4)';
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(460, 120);
      context.lineTo(540, 360);
      context.stroke();
      break;
    }
    case 'zera_revealed': {
      context.fillStyle = '#120913';
      context.fillRect(0, 0, w, h);
      context.strokeStyle = 'rgba(248,250,252,0.35)';
      context.lineWidth = 5;
      context.beginPath();
      context.arc(760, 180, 92, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = 'rgba(255,255,255,0.07)';
      context.fillRect(120, 300, 720, 70);
      break;
    }
    case 'inner_trial': {
      context.fillStyle = '#070b14';
      context.fillRect(0, 0, w, h);
      context.strokeStyle = 'rgba(148,163,184,0.28)';
      for (let i = 0; i < 4; i += 1) {
        context.strokeRect(160 + i * 170, 120 + (i % 2) * 28, 82, 170);
      }
      context.fillStyle = 'rgba(148,163,184,0.12)';
      context.beginPath();
      context.arc(760, 180, 110, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(100,116,139,0.7)';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(710, 120);
      context.lineTo(800, 260);
      context.moveTo(805, 120);
      context.lineTo(710, 260);
      context.stroke();
      break;
    }
    case 'zera_inside_valmar': {
      context.fillStyle = '#12060d';
      context.fillRect(0, 0, w, h);
      context.fillStyle = 'rgba(248,250,252,0.07)';
      context.beginPath();
      context.arc(760, 180, 110, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(236,72,153,0.32)';
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(150, 400);
      context.bezierCurveTo(320, 250, 520, 360, 760, 180);
      context.stroke();
      break;
    }
    case 'true_finale': {
      context.fillStyle = '#14070b';
      context.fillRect(0, 0, w, h);
      context.strokeStyle = 'rgba(248,250,252,0.42)';
      context.lineWidth = 5;
      context.beginPath();
      context.arc(760, 190, 125, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = 'rgba(239,68,68,0.5)';
      context.beginPath();
      context.arc(760, 190, 78, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = 'rgba(239,68,68,0.12)';
      context.fillRect(90, 310, 820, 80);
      context.fillStyle = '#fecaca';
      context.fillRect(490, 130, 16, 180);
      context.fillRect(440, 190, 116, 16);
      break;
    }
    default: {
      const palette = themePalette(page?.kind === 'setpiece' ? 'ruins' : 'cavern');
      context.fillStyle = palette.bg;
      context.fillRect(0, 0, w, h);
      context.fillStyle = palette.field;
      context.fillRect(24, 24, w - 48, h - 48);
      context.strokeStyle = palette.accent;
      context.lineWidth = 2;
      context.strokeRect(24, 24, w - 48, h - 48);
    }
  }
}

function drawCampaignSceneCanvas() {
  clearCanvasHotspots();
  const beat = getCurrentCampaignBeat();
  const page = getCurrentCampaignScenePage();

  if (state.campaignRun.phase === 'travel') {
    drawCampaignTravelCanvas(page, beat);
    return;
  }

  if (state.campaignRun.phase === 'overworld') {
    drawCampaignOverworldCanvas(page, beat);
    return;
  }

  drawSetpieceBackdrop(beat?.id, page);

  context.fillStyle = 'rgba(15, 23, 42, 0.78)';
  context.fillRect(56, 52, elements.canvas.width - 112, 88);
  context.fillRect(56, 158, elements.canvas.width - 112, 260);
  context.fillRect(56, 436, elements.canvas.width - 112, 60);

  context.textAlign = 'left';
  context.fillStyle = '#93c5fd';
  context.font = '12px system-ui';
  context.fillText(state.campaignRun.phase === 'setpiece' ? 'Bespoke setpiece' : state.campaignRun.phase === 'location-scene' ? 'Location scene' : state.campaignRun.phase === 'npc-dialogue' ? 'NPC dialogue' : page?.kind === 'dialogue' ? 'Dialogue scene' : 'Story scene', 76, 78);

  context.fillStyle = '#f8fafc';
  context.font = 'bold 28px system-ui';
  context.fillText(page?.title ?? 'Story campaign', 76, 112);

  context.fillStyle = '#cbd5e1';
  context.font = '15px system-ui';
  if (page?.subtitle) {
    context.fillText(page.subtitle, 76, 134);
  }

  if (page?.speaker) {
    context.fillStyle = '#fcd34d';
    context.font = 'bold 18px system-ui';
    context.fillText(page.speaker, 76, 192);
  }

  context.fillStyle = '#e5e7eb';
  context.font = '16px system-ui';
  let cursorY = page?.speaker ? 224 : 190;
  for (const paragraph of Array.isArray(page?.text) ? page.text : []) {
    const lines = drawWrappedText(context, paragraph, 76, cursorY, elements.canvas.width - 152, 24);
    cursorY += Math.max(1, lines) * 24 + 18;
  }

  context.fillStyle = '#94a3b8';
  context.font = '14px system-ui';
  context.fillText(`Beat ${state.campaignRun.currentBeatIndex + 1}/${allStoryBeatRefs().length} · ${beat?.title ?? 'n/a'}`, 76, 464);
  context.textAlign = 'right';
  context.fillText(`Inventory: ${campaignInventoryString()} · Gold: ${campaignGoldString()}`, elements.canvas.width - 76, 464);
  context.fillText(`Scene ${state.campaignRun.sceneIndex + 1}/${Math.max(1, currentCampaignScenePages().length)}`, elements.canvas.width - 76, 486);
  context.textAlign = 'left';
}

function renderCanvas() {
  if (isCampaignNarrativeMode()) {
    drawCampaignSceneCanvas();
    return;
  }

  clearCanvasHotspots();
  const visible = getVisibleBattleState();
  drawArena();
  drawBattleHud();
  [...visible.players, ...visible.enemies].forEach(drawCombatant);
  if (state.replay) {
    drawCurrentReplayDecisionOverlay();
  }
  drawEventFxOverlay();
  drawIpGauge();
}

function renderCommandPanel() {
  elements.commandButtons.innerHTML = '';

  if (state.appScreen !== 'app' || state.activeTab === 'compare') {
    elements.commandStatus.textContent = 'Ручные команды доступны только во вкладке «Игра».';
    return;
  }

  if (isCampaignNarrativeMode()) {
    const page = getCurrentCampaignScenePage();
    const actionHint = page?.action === 'launch-battle'
      ? 'Ты дошёл до нужной точки мира. Нажми «Начать сюжетный бой».'
      : page?.action === 'launch-setpiece'
        ? 'Перед боем здесь есть bespoke setpiece. Открой его кнопкой «Открыть bespoke scene».'
        : page?.action === 'complete-placeholder'
          ? 'Это сюжетная заглушка. Подтверди checkpoint в блоке кампании.'
          : page?.action === 'travel'
            ? nextLocationSceneForCurrentContext()
              ? 'В этой точке есть локальная сцена: открой её кнопкой SCN/«Открыть сцену» или продолжай исследование.'
              : 'Используй WASD/стрелки и клики по canvas, чтобы перемещаться между локациями.'
            : page?.action === 'arrive-location'
              ? 'Сейчас идёт overworld-переезд между регионами. Нажми «Дальше» или кликни по кнопке прибытия на canvas.'
              : 'Нажми «Дальше», чтобы продолжить катсцену.';
    elements.commandStatus.textContent = `Сейчас активна сюжетная часть кампании. ${actionHint}`;
    return;
  }

  if (state.replay) {
    elements.commandStatus.textContent = 'Во время replay ручные команды отключены.';
    return;
  }

  if (!state.battle) {
    elements.commandStatus.textContent = 'Активного боя нет.';
    return;
  }

  const awaiting = getAwaitingInput(state.battle);
  if (!awaiting) {
    state.commandMenu.fighterId = null;
    state.commandMenu.category = 'root';
    elements.commandStatus.textContent = 'Ручной ввод не нужен. Жми «Следующее событие» или «Играть до следующего COM».';
    return;
  }

  if (state.commandMenu.fighterId !== awaiting.fighterId) {
    state.commandMenu.fighterId = awaiting.fighterId;
    state.commandMenu.category = 'root';
  }

  const actions = awaiting.actions.slice().sort((left, right) => actionSortScore(left) - actionSortScore(right));
  const categories = commandMenuCategoriesForActions(actions);

  if (state.commandMenu.category === 'root') {
    const fighter = findFighterById(awaiting.fighterId);
    const commandSummary = [
      `${awaiting.fighterName} ждёт твою команду. Выбери раздел.`,
      fighter ? `HP ${fighter.hp}/${fighter.maxHp}, SP ${fighter.sp}/${fighter.maxSp}, MP ${fighter.mp}/${fighter.maxMp}` : '',
      state.battle?.inventory ? `Items: ${campaignInventoryString(state.battle.inventory)}` : '',
    ].filter(Boolean).join(' | ');
    elements.commandStatus.textContent = commandSummary;

    for (const category of categories) {
      const button = document.createElement('button');
      button.className = 'action-button';
      button.textContent = `${category.label} (${category.count})`;
      button.addEventListener('click', () => {
        state.commandMenu.category = category.key;
        render();
      });
      elements.commandButtons.appendChild(button);
    }
    return;
  }

  const categoryActions = actionsForMenuCategory(actions, state.commandMenu.category);
  const groupedActions = groupActionsForMenuDisplay(categoryActions, state.commandMenu.category);
  elements.commandStatus.textContent = `${awaiting.fighterName} → ${state.commandMenu.category}. Выбери конкретную команду.`;

  const backButton = document.createElement('button');
  backButton.className = 'action-button';
  backButton.textContent = '← Назад';
  backButton.addEventListener('click', () => {
    state.commandMenu.category = 'root';
    render();
  });
  elements.commandButtons.appendChild(backButton);

  for (const group of groupedActions) {
    const heading = document.createElement('div');
    heading.style.width = '100%';
    heading.style.marginTop = '8px';
    heading.style.marginBottom = '2px';
    heading.style.color = '#93c5fd';
    heading.style.fontWeight = '700';
    heading.textContent = group.label;
    elements.commandButtons.appendChild(heading);

    for (const action of group.actions) {
      const button = document.createElement('button');
      button.className = 'action-button';
      button.textContent = describeAction(action);

      if (state.settings.showCommandHints) {
        const hint = document.createElement('small');
        hint.textContent = actionHint(action);
        button.appendChild(document.createElement('br'));
        button.appendChild(hint);
      }

      button.addEventListener('click', () => {
        const accepted = queueManualAction(state.battle, awaiting.fighterId, action);
        if (!accepted) {
          render();
          return;
        }

        state.commandMenu.category = 'root';
        const event = advanceBattle(state.battle);
        triggerEventFx(event);
        render();
      });

      elements.commandButtons.appendChild(button);
    }
  }
}

function renderDecisionPanel() {
  if (isCampaignNarrativeMode()) {
    const page = getCurrentCampaignScenePage();
    elements.decisions.textContent = [
      'Во время катсцены журнал решений AI скрыт.',
      page ? `Текущая сцена: ${summarizeCampaignScene(page)}` : 'Сцена не выбрана.',
    ].join('\n');
    return;
  }

  const source = state.replay ? (state.replay.data.decisions ?? []) : (state.battle?.decisionLog ?? []);
  const currentReplayDecision = state.replay ? getReplayDecision() : null;
  const replaySlice = state.replay ? source.slice(0, state.replay.index) : source;
  const filtered = filterDecisions(replaySlice);
  const capped = state.replay ? filtered : filtered.slice(-8);
  const lines = capped.slice(-8).map((entry) => {
    const selected = entry.selected
      ? `${entry.selected.label}${entry.selected.targetId ? ` -> ${entry.selected.analysis?.targetName ?? entry.selected.targetId}` : ''}`
      : 'none';
    const topOptions = (entry.options ?? [])
      .slice()
      .sort((left, right) => ((right.analysis?.killScore ?? 0) + (right.analysis?.expectedDamageRatio ?? 0)) - ((left.analysis?.killScore ?? 0) + (left.analysis?.expectedDamageRatio ?? 0)))
      .slice(0, 3)
      .map((option) => `${option.label}${option.targetId ? `:${option.analysis?.targetName ?? option.targetId}` : ''}`)
      .join(', ');
    const marker = currentReplayDecision === entry ? '▶ ' : '';
    return `${marker}[${Number(entry.time ?? 0).toFixed(2)}s] ${entry.fighterName} (${entry.controller}) -> ${selected}\n  options: ${topOptions || 'n/a'}`;
  });

  elements.decisions.textContent = lines.length > 0 ? lines.join('\n') : 'Решения ещё не записаны.';
}

function selfDangerBucket(value = 0) {
  if (value < 0.25) return 'healthy';
  if (value < 0.5) return 'bruised';
  if (value < 0.75) return 'danger';
  return 'critical';
}

function decisionMatchesFilter(entry) {
  const actionFilter = state.decisionFilter.action;
  const controllerFilter = state.decisionFilter.controller;
  const dangerFilter = state.decisionFilter.danger;

  const actionLabel = entry.selected?.label ?? 'none';
  const controller = entry.controller ?? 'unknown';
  const bucket = selfDangerBucket(entry.selected?.analysis?.selfDanger ?? 0);

  if (actionFilter !== 'all' && actionLabel !== actionFilter) {
    return false;
  }

  if (controllerFilter !== 'all' && controller !== controllerFilter) {
    return false;
  }

  if (dangerFilter === 'lowhp') {
    return bucket === 'danger' || bucket === 'critical';
  }

  if (dangerFilter !== 'all' && bucket !== dangerFilter) {
    return false;
  }

  return true;
}

function filterDecisions(decisions = []) {
  return decisions.filter(decisionMatchesFilter);
}

function buildDecisionStats(decisions = []) {
  const byAction = new Map();
  const byController = new Map();
  const byTarget = new Map();
  const heatmap = new Map();

  for (const entry of decisions) {
    const action = entry.selected?.label ?? 'none';
    const controller = entry.controller ?? 'unknown';
    const target = entry.selected?.analysis?.targetName ?? entry.selected?.targetId ?? 'n/a';
    const bucket = selfDangerBucket(entry.selected?.analysis?.selfDanger ?? 0);

    byAction.set(action, (byAction.get(action) ?? 0) + 1);
    byController.set(controller, (byController.get(controller) ?? 0) + 1);
    byTarget.set(target, (byTarget.get(target) ?? 0) + 1);

    if (!heatmap.has(action)) {
      heatmap.set(action, { healthy: 0, bruised: 0, danger: 0, critical: 0 });
    }
    heatmap.get(action)[bucket] += 1;
  }

  return { byAction, byController, byTarget, heatmap, total: decisions.length };
}

function formatMapTop(map, limit = 6) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
}

function formatDecisionStats(decisions = [], title = 'Decision stats') {
  const stats = buildDecisionStats(decisions);
  const heatRows = [...stats.heatmap.entries()]
    .sort((left, right) => {
      const leftTotal = Object.values(left[1]).reduce((sum, value) => sum + value, 0);
      const rightTotal = Object.values(right[1]).reduce((sum, value) => sum + value, 0);
      return rightTotal - leftTotal;
    })
    .map(([action, buckets]) => `${action.padEnd(16)} | h:${String(buckets.healthy).padStart(2)} b:${String(buckets.bruised).padStart(2)} d:${String(buckets.danger).padStart(2)} c:${String(buckets.critical).padStart(2)}`)
    .join('\n');

  return [
    title,
    `Total decisions: ${stats.total}`,
    '',
    'By action:',
    formatMapTop(stats.byAction) || '- none',
    '',
    'By controller:',
    formatMapTop(stats.byController, 4) || '- none',
    '',
    'Top targets:',
    formatMapTop(stats.byTarget, 5) || '- none',
    '',
    'Heatmap (self danger bucket):',
    heatRows || 'none',
  ].join('\n');
}

function renderDecisionStatsPanel() {
  if (isCampaignNarrativeMode()) {
    elements.decisionStats.textContent = [
      'Decision heatmap временно недоступен во время сюжетной сцены.',
      'Он снова появится автоматически, как только начнётся или продолжится бой.',
    ].join('\n');
    return;
  }

  const source = state.replay ? (state.replay.data.decisions ?? []).slice(0, Math.max(0, state.replay.index)) : (state.battle?.decisionLog ?? []);
  const filtered = filterDecisions(source);
  elements.decisionStats.textContent = formatDecisionStats(filtered, state.replay ? 'Replay decision stats' : 'Live battle decision stats');
}

function drawBarGraph(ctx, canvas, { title, items, formatter }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(title, 16, 24);

  if (!items || items.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('No data', 16, 52);
    return;
  }

  const maxValue = Math.max(0.01, ...items.map((item) => item.value));
  const startY = 52;
  const rowHeight = Math.max(28, Math.floor((canvas.height - startY - 14) / items.length));

  items.forEach((item, index) => {
    const y = startY + index * rowHeight;
    const barWidth = (canvas.width - 220) * (item.value / maxValue);
    ctx.fillStyle = item.color ?? '#60a5fa';
    ctx.fillRect(16, y, barWidth, 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(item.label, 16, y - 4);
    ctx.textAlign = 'right';
    ctx.fillText(formatter(item.value), canvas.width - 16, y + 13);
    ctx.textAlign = 'left';
  });
}

function renderGraphsPanel() {
  if (isCampaignNarrativeMode()) {
    drawBarGraph(metricsGraphContext, elements.metricsGraph, {
      title: 'Campaign scene',
      items: [],
      formatter: (value) => String(value),
    });
    drawBarGraph(actionGraphContext, elements.actionGraph, {
      title: 'Action frequency',
      items: [],
      formatter: (value) => String(value),
    });
    elements.graphInfo.textContent = 'Графики скрыты до начала боя. Сейчас активна сюжетная сцена кампании.';
    return;
  }

  const metrics = state.lastMetrics;
  if (metrics?.series?.length) {
    drawBarGraph(metricsGraphContext, elements.metricsGraph, {
      title: metrics.title,
      items: metrics.series.map((item) => ({ ...item, value: item.winRate })),
      formatter: (value) => `${(value * 100).toFixed(1)}%`,
    });
  } else {
    drawBarGraph(metricsGraphContext, elements.metricsGraph, {
      title: 'Winrate graph',
      items: [],
      formatter: (value) => String(value),
    });
  }

  const source = state.replay
    ? (state.replay.data.decisions ?? []).slice(0, Math.max(0, state.replay.index))
    : (state.battle?.decisionLog ?? []);
  const filtered = filterDecisions(source);
  const actionStats = buildDecisionStats(filtered);
  const actionItems = [...actionStats.byAction.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([label, value], index) => ({
      label,
      value,
      color: ['#60a5fa', '#f59e0b', '#34d399', '#ef4444', '#a78bfa', '#22d3ee', '#f472b6', '#facc15'][index % 8],
    }));

  drawBarGraph(actionGraphContext, elements.actionGraph, {
    title: 'Action frequency',
    items: actionItems,
    formatter: (value) => `${value}`,
  });

  elements.graphInfo.textContent = metrics
    ? `${metrics.title}. Actions considered: ${filtered.length}.`
    : `Actions considered: ${filtered.length}. Run balance snapshot or debug winrate for metrics.`;
}

function renderMenuParityPanel() {
  if (!elements.mpOutput) {
    return;
  }

  for (const screen of MP_SCREENS) {
    const button = elements[screen.button];
    if (button) {
      button.className = state.menuParityScreen === screen.key ? '' : 'secondary';
    }
  }

  elements.mpImages.innerHTML = '';
  switch (state.menuParityScreen) {
    case 'skills':
      renderMpSkillsScreen();
      break;
    case 'eggs':
      renderMpEggsScreen();
      break;
    case 'items':
      renderMpItemsScreen();
      break;
    case 'bestiary':
      renderMpBestiaryScreen();
      break;
    case 'config':
      renderMpConfigScreen();
      break;
    case 'status':
    default:
      renderMpStatusScreen();
      break;
  }
  bindMpActionButtons();
}

function mpPartyPortraitBlock(key) {
  const preset = PRESETS[key];
  const rosterEntry = state.campaignRun.roster[key] ?? null;
  const hp = rosterEntry?.hp ?? preset.maxHp;
  return `<div class="mp-entry"><img src="${unitArtPathForFighter(preset)}" alt="${preset.name}" width="48" height="48"/> <span>${preset.name} — HP ${hp}/${preset.maxHp}</span></div>`;
}

function renderMpStatusScreen() {
  const lines = [
    'Статус партии (original-like hero screen)',
    `Уровень кампании: ${state.campaignRun.partyLevel} | EXP ${state.campaignRun.experience} | SC ${state.campaignRun.skillCoins} | MC ${state.campaignRun.magicCoins}`,
    '',
  ];
  for (const key of CAMPAIGN_PLAYABLE_UNITS) {
    const preset = buildCampaignPresetForKey(key);
    const rosterEntry = state.campaignRun.roster[key] ?? null;
    const loadout = state.campaignRun.equipmentLoadout?.[key] ?? {};
    const weapon = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.weapon)?.label ?? '—';
    const armor = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.armor)?.label ?? '—';
    const accessory = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.accessory)?.label ?? '—';
    lines.push(
      `${preset.name} [${preset.role}]${rosterEntry?.available ? '' : ' (не в активной партии)'}`,
      `  HP ${rosterEntry?.hp ?? preset.maxHp}/${preset.maxHp} | SP ${rosterEntry?.sp ?? preset.startSp}/${preset.maxSp} | MP ${rosterEntry?.mp ?? preset.startMp}/${preset.maxMp}`,
      `  STR ${preset.str} VIT ${preset.vit} AGI ${preset.agi} SPD ${preset.spd} MAG ${preset.mag} MEN ${preset.men}`,
      `  Оружие: ${weapon} | Броня: ${armor} | Аксессуар: ${accessory}`,
      `  Mana Egg: ${(() => { const eggId = state.campaignRun.eggLoadout?.[key] ?? null; const egg = eggId ? MANA_EGGS.find((entry) => entry.id === eggId) : null; return egg ? `${egg.label} (ур.${campaignEggLevel(key, egg.id)})` : '—'; })()}`,
      '',
    );
  }
  elements.mpOutput.textContent = lines.join('\n');
  elements.mpImages.innerHTML = CAMPAIGN_PLAYABLE_UNITS.map(mpPartyPortraitBlock).join('');
}

function renderMpSkillsScreen() {
  const lines = [
    'Навыки и магия (skill screen)',
    'Уровни приёмов (Lv1–5) прокачиваются за SC, уровни магии — за MC. Рост уровня усиливает урон/лечение и ускоряет charge.',
    '',
  ];
  const buttons = [];
  for (const key of CAMPAIGN_PLAYABLE_UNITS) {
    const preset = PRESETS[key];
    const groups = groupedActionDefinitions(loadoutActionIds(preset.loadout));
    lines.push(`— ${preset.name} — SC: ${state.campaignRun.skillCoins} | MC: ${state.campaignRun.magicCoins}`);
    if (groups.length === 0) {
      lines.push('  (нет закреплённых действий)');
    }
    for (const group of groups) {
      lines.push(`  ${group.label}:`);
      for (const definition of group.definitions) {
        const cost = [];
        if (definition.costSp) cost.push(`${definition.costSp} SP`);
        if (definition.costMp) cost.push(`${definition.costMp} MP`);
        const costText = cost.length ? ` [${cost.join(', ')}]` : '';
        const level = campaignMoveLevel(key, definition.id);
        const moveCosts = moveLevelCosts(definition.id);
        const magicCosts = magicLevelCosts(definition.id);
        let levelText = '';
        if (isMoveLevelable(definition.id, definition)) {
          levelText = ` ур.${level}/5`;
          if (level < 5) {
            const nextCost = moveCosts[level - 1];
            buttons.push(mpActionButton(`${preset.name}: ${definition.label} → ур.${level + 1} (${nextCost} SC)`, () => upgradeCampaignMove(key, definition.id)));
          }
        } else if (isMagicLevelable(definition.id, definition)) {
          levelText = ` ур.${level}/5`;
          if (level < 5) {
            const nextCost = magicCosts[level - 1];
            buttons.push(mpActionButton(`${preset.name}: ${definition.label} → ур.${level + 1} (${nextCost} MC)`, () => upgradeCampaignMagic(key, definition.id)));
          }
        }
        lines.push(`    - ${definition.label}${levelText}${costText} — ${definition.targeting}`);
      }
    }
    lines.push('');
  }
  elements.mpOutput.textContent = lines.join('\n');
  elements.mpImages.innerHTML = buttons.join('');
}

function renderMpEggsScreen() {
  const lines = [
    'Mana Eggs (magic egg screen)',
    'Каноничные яйца маны Grandia II: школа, уровни изучения, MC-стоимость прокачки и экипировка на героев.',
    'Яйца находятся в сундуках кампании (Durham → Mist, Aira → Gravity, Ceceile → Soul, Demon\'s Law → Star, Raul Hills → Fairy, Birthplace → Dragon).',
    '',
    '— Владение яйцами —',
    ...(state.campaignRun.ownedEggIds.length ? state.campaignRun.ownedEggIds.map((id) => `  ✓ ${MANA_EGGS.find((egg) => egg.id === id)?.label ?? id}`) : ['  (пока нет; Elena и Millenia начинают со своими яйцами)']),
    '',
    '— Экипировка на героях —',
    ...CAMPAIGN_PLAYABLE_UNITS.map((key) => {
      const eggId = state.campaignRun.eggLoadout?.[key] ?? null;
      const egg = eggId ? MANA_EGGS.find((entry) => entry.id === eggId) : null;
      return `  ${PRESETS[key]?.name ?? key}: ${egg ? egg.label : '—'}`;
    }),
    '',
  ];
  const buttons = [];
  for (const egg of MANA_EGGS) {
    lines.push(`◆ ${egg.label} — ${egg.type}`);
    lines.push(`  Элементы: ${egg.elements.join(' / ')}`);
    lines.push(`  Где получить: ${egg.location}`);
    lines.push(`  ${egg.description}`);
    for (const spell of egg.spells) {
      const mc = spell.mcCost.join(' / ');
      lines.push(`    - ${spell.label} (уровень яйца ${spell.level}, MC: ${mc})`);
    }
    const owned = state.campaignRun.ownedEggIds.includes(egg.id);
    if (owned) {
      for (const key of CAMPAIGN_PLAYABLE_UNITS) {
        const equipped = state.campaignRun.eggLoadout?.[key] === egg.id;
        buttons.push(mpActionButton(equipped ? `${PRESETS[key]?.name ?? key}: ${egg.label} (надето)` : `Надеть ${egg.label} на ${PRESETS[key]?.name ?? key}`, () => equipCampaignEgg(key, egg.id)));
      }
      for (const key of CAMPAIGN_PLAYABLE_UNITS) {
        if (state.campaignRun.eggLoadout?.[key] === egg.id) {
          const level = campaignEggLevel(key, egg.id);
          if (level < 5) {
            const cost = EGG_LEVEL_COSTS[level - 1];
            buttons.push(mpActionButton(`${PRESETS[key]?.name ?? key}: ${egg.label} → ур.${level + 1} (${cost} MC)`, () => upgradeCampaignEgg(key, egg.id)));
          }
        }
      }
    }
    lines.push('');
  }
  elements.mpOutput.textContent = lines.join('\n');
  elements.mpImages.innerHTML = buttons.join('');
}

const mpActionRegistry = new Map();
let mpActionCounter = 0;

function mpActionButton(label, onClick) {
  mpActionCounter += 1;
  const id = `mp-act-${mpActionCounter}`;
  mpActionRegistry.set(id, onClick);
  return `<button id="${id}" class="secondary" style="min-width:200px;">${label}</button>`;
}

function bindMpActionButtons() {
  for (const [id, onClick] of mpActionRegistry) {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', onClick);
      mpActionRegistry.delete(id);
    }
  }
}

function renderMpItemsScreen() {
  const lines = [
    'Предметы и снаряжение (item / bag / equipment screen)',
    '',
    `Инвентарь партии сейчас: ${campaignInventoryString()}`,
    `Золото: ${campaignGoldString()}`,
    '',
    '— Каталог расходников —',
    ...ITEM_CATALOG.map((item) => `  ${item.label}: ${item.description}`),
    '',
    '— Каталог магазинов —',
    ...SHOP_CATALOG.map((entry) => `  ${entry.label} (${entry.price} G): ${entry.description}`),
    '',
    '— Каталог экипировки —',
    ...EQUIPMENT_CATALOG.map((entry) => `  ${entry.label} [${entry.slot}] → ${PRESETS[entry.targetKey]?.name ?? 'party'}: ${entry.description}`),
    '',
    '— Текущие слоты партии —',
    ...campaignEquipmentLoadoutLines(),
  ];
  elements.mpOutput.textContent = lines.join('\n');
}

function renderMpBestiaryScreen() {
  const enemyEntries = Object.entries(PRESETS).filter(([, preset]) => preset.team === 'enemies');
  const groups = buildBestiaryGroupSnapshot(PRESETS);
  const lines = [
    'Энциклопедия врагов (bestiary encyclopedia)',
    `Всего enemy presets: ${enemyEntries.length} | групп: ${groups.length}`,
    'Сортировка по регионам оригинала; у каждого врага — роли, статы, сопротивления и drop table.',
    '',
  ];
  const imageBlocks = [];
  for (const group of groups) {
    lines.push(`### ${group.label} (${group.resolvedEnemies.length}/${group.enemyKeys.length})`);
    lines.push(`  Локации: ${group.locations.join(', ')}`);
    for (const { key, preset } of group.resolvedEnemies) {
      const drops = dropEntriesForPresetKey(key);
      const dropText = drops.length
        ? drops.map((drop) => {
          const name = drop.equipment
            ? EQUIPMENT_CATALOG.find((entry) => entry.id === drop.equipment)?.label ?? drop.equipment
            : ITEM_CATALOG.find((entry) => entry.key === drop.key)?.label ?? drop.key;
          return `${name} (${Math.round((drop.chance ?? 0) * 100)}%)`;
        }).join(', ')
        : '—';
      lines.push(
        `  • ${preset.name} — роль: ${preset.role}`,
        `    HP ${preset.maxHp} | STR ${preset.str} VIT ${preset.vit} AGI ${preset.agi} SPD ${preset.spd} MAG ${preset.mag} MEN ${preset.men}`,
        `    Сопр.: fire ${preset.resistances?.fire ?? 1} / lightning ${preset.resistances?.lightning ?? 1}`,
        `    Drops: ${dropText}`,
      );
      imageBlocks.push(`<div class="mp-entry"><img src="${unitArtPathForFighter(preset)}" alt="${preset.name}" width="48" height="48"/> <span>${preset.name} [${preset.role}]</span></div>`);
    }
    lines.push('');
  }
  elements.mpOutput.textContent = lines.join('\n');
  elements.mpImages.innerHTML = imageBlocks.join('');
}

function renderMpConfigScreen() {
  elements.mpConfigAi.value = state.settings.defaultPlayEnemyAi;
  elements.mpConfigTheme.value = state.settings.defaultBattlefieldTheme;
  elements.mpConfigHints.checked = Boolean(state.settings.showCommandHints);
  elements.mpConfigSpeed.value = String(state.settings.replaySpeedMs);
  elements.mpOutput.textContent = [
    'Настройки (options screen)',
    'Эти значения сохраняются в localStorage и применяются к игре.',
    '',
    `AI врага по умолчанию: ${state.settings.defaultPlayEnemyAi}`,
    `Поле боя по умолчанию: ${state.settings.defaultBattlefieldTheme}`,
    `Подсказки в командном меню: ${state.settings.showCommandHints ? 'вкл' : 'выкл'}`,
    `Скорость replay по умолчанию: ${state.settings.replaySpeedMs} мс`,
  ].join('\n');
}

function saveMenuParityConfig() {
  state.settings.defaultPlayEnemyAi = elements.mpConfigAi.value;
  state.settings.defaultBattlefieldTheme = elements.mpConfigTheme.value;
  state.settings.showCommandHints = Boolean(elements.mpConfigHints.checked);
  state.settings.replaySpeedMs = Number(elements.mpConfigSpeed.value) || 550;
  savePersistedSettings();
  state.playEnemyAi = state.settings.defaultPlayEnemyAi;
  state.battlefieldTheme = state.settings.defaultBattlefieldTheme;
  if (elements.replaySpeed) {
    elements.replaySpeed.value = String(state.settings.replaySpeedMs);
  }
  writeStateToForms();
  state.debugOutput = 'Настройки сохранены в localStorage.';
  render();
}

function renderStatusPanels() {
  if (isCampaignNarrativeMode()) {
    const beat = getCurrentCampaignBeat();
    const arc = getCurrentCampaignArc();
    const page = getCurrentCampaignScenePage();
    const pages = currentCampaignScenePages();
    const meta = storyBeatImplementationMeta(beat);
    const location = getCurrentCampaignLocation();
    const chapter = getCurrentCampaignChapter();
    elements.battleLabel.textContent = `Кампания: ${beat?.title ?? 'story scene'}`;
    elements.summary.textContent = [
      campaignRunActive()
        ? state.campaignRun.phase === 'travel'
          ? 'Режим путешествия по миру.'
          : `Сюжетная сцена ${state.campaignRun.sceneIndex + 1}/${Math.max(1, pages.length)}.`
        : 'Режим кампании ожидает старта.',
      beat ? `Текущий бит: ${beat.title}.` : 'Текущий бит: n/a.',
      location ? `Локация: ${location.title}.` : 'Локация: n/a.',
      page ? `Сцена: ${summarizeCampaignScene(page)}` : 'Сцена не выбрана.',
      meta.kind === 'placeholder'
        ? 'Это narrative-заглушка: после подтверждения кампания пойдёт дальше.'
        : `Следующий бой использует ${meta.encounterLabel ?? meta.scenarioKey ?? 'story encounter'}.`,
    ].join('\n');
    elements.status.textContent = [
      `Campaign run id: ${state.campaignRun.runId ?? 'n/a'}`,
      `Arc: ${arc?.title ?? 'n/a'}`,
      `Chapter route: ${chapter?.title ?? 'n/a'}`,
      `Beat: ${beat ? campaignBeatLabel(beat) : 'n/a'}`,
      `Phase: ${state.campaignRun.phase}`,
      `Scene progress: ${state.campaignRun.sceneIndex + 1}/${Math.max(1, pages.length)}`,
      `Current location: ${location?.title ?? 'n/a'}`,
      `Carryover inventory: ${campaignInventoryString()}`,
      `Gold: ${campaignGoldString()}`,
      `Completed beats in run: ${state.campaignRun.completedBeatIds.length}/${allStoryBeatRefs().length}`,
      'Active party:',
      ...campaignPartyStatusLines(beat),
      `Prototype party core: ${(beat?.partyState?.core ?? []).join(', ') || 'n/a'}`,
      `Temporary allies: ${(beat?.partyState?.temporary ?? []).join(', ') || 'none'}`,
    ].join('\n');
    elements.log.textContent = page?.text?.join('\n\n') ?? 'Сюжетная сцена не активна.';
    renderDecisionPanel();
    return;
  }

  const visible = getVisibleBattleState();
  const { players, enemies, turnCount, time, lastEventText, awaitingInput } = visible;

  elements.battleLabel.textContent = state.replay
    ? `Replay: ${state.replay.name}`
    : state.battleLabel;
  const inventoryText = state.replay
    ? null
    : `Inventory: ${campaignInventoryString(state.battle?.inventory ?? {})}`;

  elements.status.textContent = [
    `Resolved events: ${turnCount}`,
    `Battle clock: ${time.toFixed(2)}s`,
    awaitingInput ? `Manual command pending: ${awaitingInput.fighterName}` : 'Manual command pending: no',
    inventoryText,
    '',
    'Players:',
    ...players.map(describeFighter),
    '',
    'Enemies:',
    ...enemies.map(describeFighter),
  ].join('\n');

  const finished = isBattleOver(players, enemies);
  const appliedBeat = state.appliedStoryBeatId
    ? getStoryArcs().flatMap((arc) => arc.plotBeats ?? []).find((entry) => entry.id === state.appliedStoryBeatId)
    : null;

  elements.summary.textContent = [
    state.replay
      ? `Replay step ${state.replay.index + 1}/${Math.max(1, state.replay.data.snapshots?.length ?? 1)}.`
      : finished
        ? `Battle finished. Winner: ${battleWinner(players, enemies)}.`
        : awaitingInput
          ? `Battle paused at COM for ${awaitingInput.fighterName}.`
          : 'Battle in progress.',
    lastEventText ? `Last event: ${lastEventText}` : 'Last event: none yet.',
    state.replay
      ? `Loaded replay winner: ${state.replay.data.winner ?? 'unknown'}.`
      : `Template: ${ENCOUNTER_TEMPLATES[state.encounterTemplate]?.label ?? state.encounterTemplate}, theme: ${state.battlefieldTheme}, advantage: ${state.openingAdvantage}.`,
    appliedBeat ? `Story beat: ${appliedBeat.title} [${appliedBeat.id}]` : null,
    state.replay
      ? ''
      : state.activeTab === 'play'
        ? `Human battle vs ${state.playEnemyAi === 'veteran' ? 'Veteran AI' : 'Novice AI'} monster side.`
        : state.activeTab === 'campaign'
          ? campaignRunActive() && state.campaignRun.phase === 'battle'
            ? `Story campaign battle for ${state.campaignRun.currentBeatId ?? state.currentStoryBeatId ?? 'no beat selected'}.`
            : `Campaign sandbox for ${state.currentStoryBeatId ?? 'no beat selected'}.`
          : `Debug matchup: ${state.debugPlayerAi} AI vs ${state.debugEnemyAi} AI.`,
  ].filter(Boolean).join('\n');

  elements.log.textContent = state.replay
    ? (state.replay.data.events ?? []).slice(0, Math.max(1, state.replay.index)).slice(-16).join('\n')
    : (state.battle?.log ?? []).slice(-16).join('\n');
  renderDecisionPanel();
}

function renderDebugPanel() {
  elements.debugOutput.textContent = state.debugOutput;
  const enabled = Object.entries(state.enabledUnits)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(', ') || 'none';
  elements.veteranStatus.textContent = [
    `Veteran source: ${state.veteranSource}`,
    `Encounter template: ${ENCOUNTER_TEMPLATES[state.encounterTemplate]?.label ?? state.encounterTemplate}`,
    `Battlefield theme: ${state.battlefieldTheme}`,
    `Opening advantage: ${state.openingAdvantage}`,
    `Battle seed: ${state.battleSeed}`,
    `Enabled optional units: ${enabled}`,
    `Balance vector: ${JSON.stringify(state.balanceVector)}`,
  ].join('\n');
}

function renderToolbar() {
  const narrativeMode = isCampaignNarrativeMode();
  const battlePhase = campaignRunActive() && state.campaignRun.phase === 'battle';
  const travelPhase = campaignRunActive() && state.campaignRun.phase === 'travel';
  const overworldPhase = campaignRunActive() && state.campaignRun.phase === 'overworld';
  elements.nextTurn.textContent = travelPhase ? 'Сюжет ждёт в точке мира' : overworldPhase ? 'Прибыть в следующий регион' : narrativeMode ? 'Следующая сцена' : 'Следующее событие';
  elements.autoBattle.textContent = travelPhase ? 'Переходы — в панели кампании' : overworldPhase ? 'Маршрут уже построен' : narrativeMode ? 'Продолжить сцену' : 'Играть до паузы / конца боя';
  elements.nextTurn.disabled = travelPhase;
  elements.autoBattle.disabled = travelPhase || overworldPhase;
  elements.resetBattle.textContent = battlePhase ? 'Повторить текущий бой' : 'Сбросить бой';
  elements.exportLog.disabled = narrativeMode || (!state.replay && !state.battle);
}

function render() {
  finalizeCampaignBattleOutcome();
  renderTabs();
  renderToolbar();
  renderCanvas();
  renderStatusPanels();
  renderCommandPanel();
  renderCampaignPanel();
  renderDebugPanel();
  renderReplayPanel();
  renderDecisionStatsPanel();
  renderGraphsPanel();
  renderComparePanel();
  renderMenuParityPanel();
}

function stepBattle() {
  if (state.activeTab === 'compare') {
    stepCompare(1);
    return;
  }

  if (state.replay) {
    replayStep(1);
    return;
  }

  if (isCampaignNarrativeMode()) {
    advanceCampaignScene();
    return;
  }

  if (!state.battle) {
    render();
    return;
  }

  if (isBattleOver(state.battle.players, state.battle.enemies)) {
    finalizeCampaignBattleOutcome();
    render();
    return;
  }

  if (getAwaitingInput(state.battle)) {
    render();
    return;
  }

  const event = advanceBattle(state.battle);
  triggerEventFx(event);
  finalizeCampaignBattleOutcome();
  render();
}

function autoBattle() {
  if (state.activeTab === 'compare') {
    toggleCompareAutoplay();
    return;
  }

  if (state.replay) {
    toggleReplayAutoplay();
    return;
  }

  if (isCampaignNarrativeMode()) {
    advanceCampaignScene();
    return;
  }

  if (!state.battle) {
    render();
    return;
  }

  while (!isBattleOver(state.battle.players, state.battle.enemies) && state.battle.turnCount < 250) {
    const event = advanceBattle(state.battle);
    triggerEventFx(event);
    if (event?.type === 'awaiting-input' || getAwaitingInput(state.battle)) {
      break;
    }
  }

  finalizeCampaignBattleOutcome();
  render();
}

function exportCurrentBattleLog() {
  if (state.replay) {
    downloadJson('battle-log.replay.json', state.replay.data);
    return;
  }

  if (!state.battle) {
    state.debugOutput = 'Нет активного боя для экспорта.';
    render();
    return;
  }

  const payload = exportBattleLog(state.battle);
  const activeBeat = state.appliedStoryBeatId
    ? (getStoryArcs().flatMap((arc) => arc.plotBeats ?? []).find((entry) => entry.id === state.appliedStoryBeatId) ?? null)
    : null;
  payload.metadata = {
    ...(payload.metadata ?? {}),
    scenarioId: state.selectedScenario,
    scenarioRunId: state.selectedScenarioRun,
    storyArcId: state.appliedStoryArcId,
    storyBeatId: state.appliedStoryBeatId,
    storyBeatTitle: activeBeat?.title ?? null,
    encounterTemplate: state.encounterTemplate,
    battlefieldTheme: state.battlefieldTheme,
    openingAdvantage: state.openingAdvantage,
    battleSeed: state.battleSeed,
    enabledUnits: { ...state.enabledUnits },
    inventoryOverrides: { ...state.inventoryOverrides },
    campaignRunId: state.campaignRun.runId ?? null,
    campaignPhase: state.campaignRun.phase ?? null,
    campaignBeatIndex: campaignRunActive() ? state.campaignRun.currentBeatIndex : null,
    campaignCompletedBeats: campaignRunActive() ? [...state.campaignRun.completedBeatIds] : [],
    campaignLocationId: campaignRunActive() ? state.campaignRun.currentLocationId : null,
    campaignGold: campaignRunActive() ? state.campaignRun.gold : null,
    campaignExperience: campaignRunActive() ? state.campaignRun.experience : null,
    campaignSkillCoins: campaignRunActive() ? state.campaignRun.skillCoins : null,
    campaignMagicCoins: campaignRunActive() ? state.campaignRun.magicCoins : null,
    campaignLevel: campaignRunActive() ? state.campaignRun.partyLevel : null,
    campaignGrowthUnlocks: campaignRunActive() ? [...(state.campaignRun.growthUnlockIds ?? [])] : [],
    campaignQuestFlags: campaignRunActive() ? { ...(state.campaignRun.questFlags ?? {}) } : {},
    battleContext: campaignRunActive() ? { ...(state.campaignRun.battleContext ?? {}) } : null,
  };
  downloadJson('battle-log.json', payload);
}

function readFormsToState() {
  state.playEnemyAi = elements.playEnemyAi.value;
  state.debugPlayerAi = elements.debugPlayerAi.value;
  state.debugEnemyAi = elements.debugEnemyAi.value;
  state.trainingStyle = elements.debugTrainStyle.value;
  state.selectedScenario = elements.scenarioSelect.value;
  state.selectedScenarioRun = elements.scenarioRunSelect.value;
  state.encounterTemplate = elements.encounterTemplate.value;
  state.battlefieldTheme = elements.battlefieldTheme.value;
  state.openingAdvantage = elements.openingAdvantage.value;
  state.battleSeed = Number(elements.battleSeed.value) || 1337;
  state.inventoryOverrides.medicinalHerb = Math.max(0, Number(elements.inventoryHerb.value) || 0);
  state.inventoryOverrides.antidote = Math.max(0, Number(elements.inventoryAntidote.value) || 0);
  state.enabledUnits.roan = Boolean(elements.includeRoan?.checked);
  state.enabledUnits.mareg = Boolean(elements.includeMareg?.checked);
  state.enabledUnits.tio = Boolean(elements.includeTio.checked);
  state.enabledUnits.millenia = Boolean(elements.includeMillenia.checked);
  state.enabledUnits.mottledSpider = Boolean(elements.includeMottledSpider.checked);
  state.enabledUnits.guardian = Boolean(elements.includeGuardian.checked);
  state.decisionFilter.action = elements.decisionFilterAction.value;
  state.decisionFilter.controller = elements.decisionFilterController.value;
  state.decisionFilter.danger = elements.decisionFilterDanger.value;

  for (const key of UNIT_KEYS) {
    for (const field of STAT_FIELDS) {
      const input = document.querySelector(`#stat-${key}-${field}`);
      state.unitFormState[key][field] = Number(input.value);
    }
  }
}

function writeBalanceVectorToInputs() {
  document.querySelectorAll('[data-balance-field]').forEach((input) => {
    const key = input.dataset.balanceField;
    input.value = String(state.balanceVector[key]);
  });
}

function readBalanceVectorFromInputs() {
  const next = cloneVector(state.balanceVector);
  document.querySelectorAll('[data-balance-field]').forEach((input) => {
    const key = input.dataset.balanceField;
    const value = Number(input.value);
    if (Number.isFinite(value)) {
      next[key] = value;
    }
  });
  state.balanceVector = next;
}

function writeStateToForms() {
  elements.playEnemyAi.value = state.playEnemyAi;
  elements.debugPlayerAi.value = state.debugPlayerAi;
  elements.debugEnemyAi.value = state.debugEnemyAi;
  elements.debugTrainStyle.value = state.trainingStyle;
  elements.scenarioSelect.value = state.selectedScenario;
  elements.scenarioRunSelect.value = state.selectedScenarioRun;
  elements.encounterTemplate.value = state.encounterTemplate;
  elements.battlefieldTheme.value = state.battlefieldTheme;
  elements.openingAdvantage.value = state.openingAdvantage;
  elements.battleSeed.value = String(state.battleSeed);
  elements.inventoryHerb.value = String(state.inventoryOverrides.medicinalHerb);
  elements.inventoryAntidote.value = String(state.inventoryOverrides.antidote);
  if (elements.includeRoan) elements.includeRoan.checked = state.enabledUnits.roan;
  if (elements.includeMareg) elements.includeMareg.checked = state.enabledUnits.mareg;
  elements.includeTio.checked = state.enabledUnits.tio;
  elements.includeMillenia.checked = state.enabledUnits.millenia;
  elements.includeMottledSpider.checked = state.enabledUnits.mottledSpider;
  elements.includeGuardian.checked = state.enabledUnits.guardian;
  elements.decisionFilterAction.value = state.decisionFilter.action;
  elements.decisionFilterController.value = state.decisionFilter.controller;
  elements.decisionFilterDanger.value = state.decisionFilter.danger;

  for (const key of UNIT_KEYS) {
    for (const field of STAT_FIELDS) {
      const input = document.querySelector(`#stat-${key}-${field}`);
      input.value = state.unitFormState[key][field];
    }
  }

  writeBalanceVectorToInputs();

  const scenario = SCENARIO_PRESETS[state.selectedScenario];
  const template = ENCOUNTER_TEMPLATES[state.encounterTemplate];
  elements.scenarioInfo.textContent = scenario
    ? `${scenario.description} Template: ${template?.label ?? state.encounterTemplate}. Текущий battle seed: ${state.battleSeed}. Theme: ${state.battlefieldTheme}. Advantage: ${state.openingAdvantage}. Inventory: ${campaignInventoryString(state.inventoryOverrides)}.`
    : 'Custom scenario.';
}

function applyScenarioPreset(name) {
  const scenario = SCENARIO_PRESETS[name];
  if (!scenario) {
    return;
  }

  state.selectedScenario = name;
  state.encounterTemplate = scenario.encounterTemplate ?? state.encounterTemplate;
  state.battlefieldTheme = scenario.battlefieldTheme ?? state.battlefieldTheme;
  state.openingAdvantage = scenario.openingAdvantage ?? state.openingAdvantage;
  state.battleSeed = scenario.battleSeed ?? state.battleSeed;
  state.enabledUnits = {
    roan: false,
    mareg: false,
    tio: false,
    millenia: false,
    mottledSpider: false,
    guardian: false,
    ...(scenario.enabledUnits ?? {}),
  };
  state.inventoryOverrides = baseInventoryForCurrentEncounter();
  applyUnitOverrides(scenario.unitOverrides);
  state.playEnemyAi = scenario.playEnemyAi;
  state.debugPlayerAi = scenario.debugPlayerAi;
  state.debugEnemyAi = scenario.debugEnemyAi;
  state.trainingStyle = scenario.trainingStyle;
  elements.debugTrainingSeed.value = scenario.debugTrainingSeed;
  elements.debugEvalCount.value = scenario.debugEvalCount;
  writeStateToForms();
}

function applyScenarioRunPreset(runId) {
  const run = SCENARIO_RUN_LIBRARY.find((entry) => entry.id === runId);
  if (!run) {
    return;
  }

  state.selectedScenarioRun = runId;
  applyScenarioPreset(run.scenario);
  state.battleSeed = run.battleSeed;
  writeStateToForms();
  state.debugOutput = `Scenario run applied: ${run.label}. ${run.note}`;
}

function campaignBeatLabel(beat) {
  return `${beat.title} [${beat.id}]`;
}

function campaignInventoryString(inventory = state.campaignRun.inventory) {
  const entries = inventoryEntries(inventory);
  if (entries.length === 0) {
    return 'пусто';
  }
  return entries.map(([key, value]) => `${inventoryLabel(key)} ${value}`).join(', ');
}

function campaignGoldString(gold = state.campaignRun.gold) {
  return `${Number(gold ?? 0)} G`;
}

function campaignGrowthString() {
  return `LV ${state.campaignRun.partyLevel} · EXP ${state.campaignRun.experience} · SC ${state.campaignRun.skillCoins} · MC ${state.campaignRun.magicCoins}`;
}

function xpThresholdForLevel(level) {
  return 40 + Math.max(0, level - 1) * 55;
}

function objectiveFlagsForBeat(beatId) {
  return BEAT_OBJECTIVE_FLAGS[beatId] ?? [];
}

function hasQuestFlag(flagId) {
  return Boolean(state.campaignRun.questFlags?.[flagId]);
}

function questFlagLabel(flagId) {
  return QUEST_FLAG_LABELS[flagId] ?? flagId;
}

function missingObjectiveFlagsForCurrentBeat() {
  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return [];
  }
  return objectiveFlagsForBeat(beat.id).filter((flagId) => !hasQuestFlag(flagId));
}

function campaignVisibleExitsForBeat(locationId, beatId) {
  return getVisibleExitsForBeat(locationId, beatId)
    .filter((location) => {
      const requiredFlags = EXIT_REQUIREMENTS[locationId]?.[location.id] ?? [];
      return requiredFlags.every((flagId) => hasQuestFlag(flagId));
    });
}

function activeQuestChainForBeat(beatId) {
  return QUEST_CHAINS[beatId] ?? null;
}

function nextQuestChainStepForBeat(beatId) {
  const chain = activeQuestChainForBeat(beatId);
  if (!chain?.steps?.length) {
    return null;
  }
  return chain.steps.find((step) => !hasQuestFlag(step.flagId)) ?? null;
}

function locationSceneId(beatId, locationId, sceneId) {
  return `${beatId}::${locationId}::${sceneId}`;
}

function activeLocationScene() {
  if (!state.campaignRun.activeLocationSceneId) {
    return null;
  }
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!beat || !location) {
    return null;
  }
  return locationScenesForBeatAndLocation(beat.id, location.id)
    .find((entry) => locationSceneId(beat.id, location.id, entry.id) === state.campaignRun.activeLocationSceneId) ?? null;
}

function seenLocationScene(scene) {
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!scene || !beat || !location) {
    return false;
  }
  return state.campaignRun.seenLocationSceneIds.includes(locationSceneId(beat.id, location.id, scene.id));
}

function nextLocationSceneForCurrentContext() {
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!beat || !location) {
    return null;
  }
  return locationScenesForBeatAndLocation(beat.id, location.id)
    .filter((scene) => !seenLocationScene(scene))
    .filter((scene) => (scene.requiresFlags ?? []).every((flagId) => hasQuestFlag(flagId)))
    .find(Boolean) ?? null;
}

function openCurrentLocationScene(scene) {
  if (!scene) {
    return false;
  }
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!beat || !location) {
    return false;
  }
  state.campaignRun.activeLocationSceneId = locationSceneId(beat.id, location.id, scene.id);
  state.campaignRun.phase = 'location-scene';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastResultSummary = `Location scene: ${scene.title}`;
  pushCampaignJournalEntry(`Открыта локальная сцена: ${scene.title}.`);
  saveCampaignStateToLocalStorage();
  return true;
}

function resolveLocationSceneCompletion() {
  const scene = activeLocationScene();
  if (!scene) {
    return;
  }
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (scene.grantsFlags?.length) {
    applyQuestFlags(scene.grantsFlags);
  }
  const id = locationSceneId(beat?.id, location?.id, scene.id);
  if (!state.campaignRun.seenLocationSceneIds.includes(id)) {
    state.campaignRun.seenLocationSceneIds.push(id);
  }
  state.campaignRun.activeLocationSceneId = null;
  state.campaignRun.phase = 'travel';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.travelMessage = `${scene.title}: ${scene.summary}`;
  const followUpScene = nextLocationSceneForCurrentContext();
  if (followUpScene) {
    openCurrentLocationScene(followUpScene);
    return;
  }
  saveCampaignStateToLocalStorage();
}

function availableNpcDialoguesForCurrentLocation() {
  const locationId = state.campaignRun.currentLocationId;
  const beatId = state.campaignRun.currentBeatId ?? null;
  return npcDialoguesForLocation(locationId, beatId)
    .filter((entry) => !state.campaignRun.seenNpcDialogueIds?.includes(entry.id));
}

function activeNpcDialogue() {
  if (!state.campaignRun.activeNpcDialogueId) {
    return null;
  }
  return NPC_DIALOGUES.find((entry) => entry.id === state.campaignRun.activeNpcDialogueId) ?? null;
}

function openNpcDialogue(dialogueId) {
  const dialogue = NPC_DIALOGUES.find((entry) => entry.id === dialogueId) ?? null;
  if (!dialogue) {
    return false;
  }
  state.campaignRun.activeNpcDialogueId = dialogue.id;
  state.campaignRun.phase = 'npc-dialogue';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastResultSummary = `NPC dialogue: ${dialogue.label}`;
  pushCampaignJournalEntry(`NPC-разговор: ${dialogue.label}.`);
  saveCampaignStateToLocalStorage();
  return true;
}

function resolveNpcDialogueCompletion() {
  const dialogue = activeNpcDialogue();
  if (!dialogue) {
    return;
  }
  if (!state.campaignRun.seenNpcDialogueIds.includes(dialogue.id)) {
    state.campaignRun.seenNpcDialogueIds.push(dialogue.id);
  }
  if (dialogue.setFlags?.length) {
    applyQuestFlags(dialogue.setFlags);
  }
  if (dialogue.rewards) {
    grantCampaignRewards(dialogue.rewards, { sourceLabel: `NPC: ${dialogue.label}` });
  }
  state.campaignRun.activeNpcDialogueId = null;
  state.campaignRun.phase = 'travel';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.travelMessage = `${dialogue.label}: разговор завершён.`;
  saveCampaignStateToLocalStorage();
}

function activeSetpieceForBeat(beatId) {
  return setpieceConfigForBeat(beatId);
}

function isSetpieceUnlockedForBeat(beatId) {
  const setpiece = activeSetpieceForBeat(beatId);
  if (!setpiece) {
    return false;
  }
  return hasQuestFlag(setpiece.unlockFlag);
}

function shouldShowSetpieceForCurrentBeat() {
  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return false;
  }
  return Boolean(activeSetpieceForBeat(beat.id)) && !isSetpieceUnlockedForBeat(beat.id);
}

function campaignRewardDescription(reward) {
  const parts = [];
  if ((reward?.gold ?? 0) > 0) {
    parts.push(`Gold +${reward.gold}`);
  }
  if ((reward?.experience ?? 0) > 0) {
    parts.push(`EXP +${reward.experience}`);
  }
  if ((reward?.skillCoins ?? 0) > 0) {
    parts.push(`SC +${reward.skillCoins}`);
  }
  if ((reward?.magicCoins ?? 0) > 0) {
    parts.push(`MC +${reward.magicCoins}`);
  }
  for (const [key, value] of inventoryEntries(reward)) {
    parts.push(`${inventoryLabel(key)} +${value}`);
  }
  return parts.join(', ') || 'без награды';
}

function mergeInventory(baseInventory, deltaInventory) {
  const next = createBaseInventory(baseInventory);
  for (const item of ITEM_CATALOG) {
    next[item.key] = Math.max(0, Number(next[item.key] ?? 0) + Number(deltaInventory?.[item.key] ?? 0));
  }
  return next;
}

function buildFormPresetForKey(key) {
  const preset = clonePreset(key);
  const values = state.unitFormState[key] ?? null;
  if (values) {
    for (const field of STAT_FIELDS) {
      if (field in values) {
        preset[field] = Number(values[field]);
      }
    }
  }
  preset.position = { ...(UNIT_POSITIONS[key] ?? preset.position ?? { x: 680, y: 180 }) };
  return preset;
}

function beatStoryPartyKeys(beat) {
  if (!beat) {
    return [];
  }
  const names = [...(beat.partyState?.core ?? []), ...(beat.partyState?.temporary ?? [])];
  const keys = names.map((name) => STORY_PARTY_UNIT_MAP[name]).filter(Boolean);
  return [...new Set(keys)];
}

function activeCampaignPartyKeysForBeat(beat) {
  if (!beat) {
    return ['ryudo', 'elena'];
  }
  const override = STORY_BATTLE_PARTY_OVERRIDES[beat.id];
  if (override?.length) {
    return override.filter((key) => CAMPAIGN_PLAYABLE_UNITS.includes(key));
  }
  return beatStoryPartyKeys(beat).slice(0, 4);
}

function syncCampaignRosterAvailabilityForBeat(beat) {
  const activeSet = new Set(beatStoryPartyKeys(beat));
  for (const key of CAMPAIGN_PLAYABLE_UNITS) {
    if (!state.campaignRun.roster[key]) {
      state.campaignRun.roster[key] = { key, hp: PRESETS[key].maxHp, sp: PRESETS[key].startSp ?? 0, mp: PRESETS[key].startMp ?? 0, available: false };
    }
    state.campaignRun.roster[key].available = activeSet.has(key);
  }
}

function equippedItemIdsForCharacter(key) {
  const loadout = state.campaignRun.equipmentLoadout?.[key] ?? {};
  return ['weapon', 'armor', 'accessory']
    .map((slot) => loadout[slot])
    .filter(Boolean);
}

function campaignEquipmentBonusesForKey(key) {
  return equippedItemIdsForCharacter(key).reduce((result, upgradeId) => {
    const upgrade = EQUIPMENT_CATALOG.find((entry) => entry.id === upgradeId);
    if (!upgrade || upgrade.targetKey !== key) {
      return result;
    }
    for (const [field, amount] of Object.entries(upgrade.bonuses ?? {})) {
      result[field] = Number(result[field] ?? 0) + Number(amount ?? 0);
    }
    return result;
  }, {});
}

function growthBonusesForKey(key) {
  const result = {
    maxHp: Math.max(0, (state.campaignRun.partyLevel - 1) * 6),
    maxMp: Math.max(0, (state.campaignRun.partyLevel - 1) * 2),
    str: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 3),
    vit: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 4),
    agi: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 5),
    spd: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 5),
    mag: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 4),
    men: Math.floor(Math.max(0, state.campaignRun.partyLevel - 1) / 4),
  };

  for (const nodeId of state.campaignRun.growthUnlockIds ?? []) {
    const node = GROWTH_NODES.find((entry) => entry.id === nodeId);
    if (!node) continue;
    if (node.targetKey && node.targetKey !== key) continue;
    for (const [field, amount] of Object.entries(node.bonuses ?? {})) {
      result[field] = Number(result[field] ?? 0) + Number(amount ?? 0);
    }
  }

  return result;
}


function campaignMoveLevel(key, actionId) {
  return Number(state.campaignRun.actionLevels?.[key]?.[actionId] ?? 1);
}

function campaignEggLevel(key, eggId) {
  return Number(state.campaignRun.eggLevels?.[key]?.[eggId] ?? 1);
}

function campaignEggSpells(key, eggId) {
  const egg = MANA_EGGS.find((entry) => entry.id === eggId);
  const level = campaignEggLevel(key, eggId);
  if (!egg) {
    return [];
  }
  return egg.spells
    .filter((spell) => spell.level <= level)
    .map((spell) => spell.id);
}

function campaignActionLevelsForKey(key) {
  const stored = { ...(state.campaignRun.actionLevels?.[key] ?? {}) };
  const eggId = state.campaignRun.eggLoadout?.[key] ?? null;
  if (eggId) {
    const egg = MANA_EGGS.find((entry) => entry.id === eggId);
    const level = campaignEggLevel(key, eggId);
    if (egg) {
      for (const spell of egg.spells) {
        if (spell.level <= level) {
          stored[spell.id] = Math.max(Number(stored[spell.id] ?? 1), level);
        }
      }
    }
  }
  return stored;
}

function applyEggToLoadout(loadout, key, eggId) {
  if (!eggId || !loadout) {
    return loadout;
  }
  const spells = campaignEggSpells(key, eggId);
  const next = { ...loadout };
  const push = (arrayKey, id) => {
    next[arrayKey] = [...new Set([...(next[arrayKey] ?? []), id])];
  };
  for (const spellId of spells) {
    const def = ACTION_LIBRARY[spellId];
    if (!def) {
      continue;
    }
    const isAlly = def.targeting === 'single-ally' || def.targeting === 'all-allies';
    const isHeal = isAlly && (def.revive || def.powerBase || def.healBase || (def.cureStatuses ?? []).length > 0);
    const hasStatus = (def.statusEffects ?? []).length > 0;
    const hasDebuff = (def.statShifts ?? []).some((shift) => shift.amount < 0);
    if (isHeal) {
      push('healMagics', spellId);
    } else if (isAlly) {
      push('supportMagics', spellId);
    } else if (hasStatus) {
      push('statusMoves', spellId);
    } else if (hasDebuff) {
      push('debuffMagics', spellId);
    } else {
      push('offensiveMagics', spellId);
    }
  }
  return next;
}

function upgradeCampaignMove(key, actionId) {
  const costs = moveLevelCosts(actionId);
  const level = campaignMoveLevel(key, actionId);
  if (!costs || level >= 5) {
    return;
  }
  const cost = costs[level - 1];
  if (state.campaignRun.skillCoins < cost) {
    state.campaignRun.travelMessage = `Не хватает SC для ${ACTION_LIBRARY[actionId]?.label ?? actionId}: нужно ${cost}.`;
    saveCampaignStateToLocalStorage();
    render();
    return;
  }
  state.campaignRun.skillCoins -= cost;
  state.campaignRun.actionLevels[key] = { ...(state.campaignRun.actionLevels[key] ?? {}), [actionId]: level + 1 };
  pushCampaignJournalEntry(`${PRESETS[key]?.name ?? key}: ${ACTION_LIBRARY[actionId]?.label ?? actionId} до ур. ${level + 1} (${cost} SC).`);
  state.campaignRun.travelMessage = `${PRESETS[key]?.name ?? key}: ${ACTION_LIBRARY[actionId]?.label ?? actionId} → ур. ${level + 1}.`;
  saveCampaignStateToLocalStorage();
  render();
}

function upgradeCampaignMagic(key, actionId) {
  const costs = magicLevelCosts(actionId);
  const level = campaignMoveLevel(key, actionId);
  if (!costs || level >= 5) {
    return;
  }
  const cost = costs[level - 1];
  if (state.campaignRun.magicCoins < cost) {
    state.campaignRun.travelMessage = `Не хватает MC для ${ACTION_LIBRARY[actionId]?.label ?? actionId}: нужно ${cost}.`;
    saveCampaignStateToLocalStorage();
    render();
    return;
  }
  state.campaignRun.magicCoins -= cost;
  state.campaignRun.actionLevels[key] = { ...(state.campaignRun.actionLevels[key] ?? {}), [actionId]: level + 1 };
  pushCampaignJournalEntry(`${PRESETS[key]?.name ?? key}: заклинание ${ACTION_LIBRARY[actionId]?.label ?? actionId} до ур. ${level + 1} (${cost} MC).`);
  state.campaignRun.travelMessage = `${PRESETS[key]?.name ?? key}: ${ACTION_LIBRARY[actionId]?.label ?? actionId} → ур. ${level + 1}.`;
  saveCampaignStateToLocalStorage();
  render();
}

function upgradeCampaignEgg(key, eggId) {
  const level = campaignEggLevel(key, eggId);
  if (level >= 5) {
    return;
  }
  const cost = EGG_LEVEL_COSTS[level - 1] ?? 80;
  if (state.campaignRun.magicCoins < cost) {
    state.campaignRun.travelMessage = `Не хватает MC для улучшения яйца: нужно ${cost}.`;
    saveCampaignStateToLocalStorage();
    render();
    return;
  }
  state.campaignRun.magicCoins -= cost;
  state.campaignRun.eggLevels[key] = { ...(state.campaignRun.eggLevels[key] ?? {}), [eggId]: level + 1 };
  const egg = MANA_EGGS.find((entry) => entry.id === eggId);
  pushCampaignJournalEntry(`${PRESETS[key]?.name ?? key}: ${egg?.label ?? eggId} до ур. ${level + 1} (${cost} MC).`);
  state.campaignRun.travelMessage = `${PRESETS[key]?.name ?? key}: ${egg?.label ?? eggId} → ур. ${level + 1}.`;
  saveCampaignStateToLocalStorage();
  render();
}

function equipCampaignEgg(key, eggId) {
  if (!state.campaignRun.ownedEggIds.includes(eggId)) {
    return;
  }
  state.campaignRun.eggLoadout[key] = eggId;
  const egg = MANA_EGGS.find((entry) => entry.id === eggId);
  pushCampaignJournalEntry(`${PRESETS[key]?.name ?? key} надевает ${egg?.label ?? eggId}.`);
  state.campaignRun.travelMessage = `${PRESETS[key]?.name ?? key}: надето яйцо ${egg?.label ?? eggId}.`;
  saveCampaignStateToLocalStorage();
  render();
}

function buildCampaignPresetForKey(key) {
  const preset = buildFormPresetForKey(key);
  const bonuses = {
    ...campaignEquipmentBonusesForKey(key),
  };
  const growthBonuses = growthBonusesForKey(key);
  for (const [field, amount] of Object.entries(growthBonuses)) {
    bonuses[field] = Number(bonuses[field] ?? 0) + Number(amount ?? 0);
  }
  const partyAccessoryIds = (state.campaignRun.purchasedUpgradeIds ?? []).filter((upgradeId) => {
    const entry = EQUIPMENT_CATALOG.find((item) => item.id === upgradeId);
    return entry && !entry.targetKey && entry.slot && entry.slot !== 'consumable-pack';
  });
  for (const upgradeId of partyAccessoryIds) {
    const entry = EQUIPMENT_CATALOG.find((item) => item.id === upgradeId);
    for (const [field, amount] of Object.entries(entry.bonuses ?? {})) {
      bonuses[field] = Number(bonuses[field] ?? 0) + Number(amount ?? 0);
    }
  }
  const eggId = state.campaignRun.eggLoadout?.[key] ?? null;
  if (eggId) {
    preset.loadout = applyEggToLoadout(preset.loadout, key, eggId);
  }
  preset.actionLevels = campaignActionLevelsForKey(key);
  const resistBonusMap = {
    resistSleep: 'sleep',
    resistPoison: 'poison',
    resistConfusion: 'confusion',
    resistParalysis: 'paralysis',
    resistMoveBlock: 'moveBlock',
    resistMagicBlock: 'magicBlock',
  };
  for (const [field, amount] of Object.entries(bonuses)) {
    const resistKey = resistBonusMap[field];
    if (resistKey) {
      const current = Number(preset.statusResistances?.[resistKey] ?? 1);
      preset.statusResistances = { ...(preset.statusResistances ?? {}), [resistKey]: Math.max(0.05, Math.min(1, current * (1 - Number(amount)))) };
      continue;
    }
    if (field in preset) {
      preset[field] = Number(preset[field] ?? 0) + Number(amount ?? 0);
    }
  }
  return preset;
}

function buildCampaignPlayersForBeat(beat, overrideKeys = null) {
  const partyKeys = Array.isArray(overrideKeys) && overrideKeys.length > 0
    ? overrideKeys
    : activeCampaignPartyKeysForBeat(beat);
  return partyKeys.map((key, index) => {
    const preset = buildCampaignPresetForKey(key);
    const rosterEntry = state.campaignRun.roster[key] ?? createDefaultCampaignRoster()[key];
    preset.startHp = Math.max(0, Math.min(Number(rosterEntry?.hp ?? preset.maxHp), Number(preset.maxHp ?? preset.maxHp)));
    preset.startSp = Math.max(0, Math.min(Number(rosterEntry?.sp ?? preset.startSp ?? 0), Number(preset.maxSp ?? 0)));
    preset.startMp = Math.max(0, Math.min(Number(rosterEntry?.mp ?? preset.startMp ?? 0), Number(preset.maxMp ?? 0)));
    preset.position = { x: 260, y: 90 + index * 80 };
    return preset;
  });
}

function buildCampaignEnemyPreset(presetKey, { position = null, name = null } = {}) {
  const preset = clonePreset(presetKey);
  if (position) {
    preset.position = { ...position };
  } else if (UNIT_POSITIONS[presetKey]) {
    preset.position = { ...UNIT_POSITIONS[presetKey] };
  }
  if (name) {
    preset.name = name;
  }
  return preset;
}

function campaignPartyStatusLines(beat = getCurrentCampaignBeat()) {
  return activeCampaignPartyKeysForBeat(beat).map((key) => {
    const rosterEntry = state.campaignRun.roster[key] ?? createDefaultCampaignRoster()[key];
    const preset = buildCampaignPresetForKey(key);
    const hp = Math.max(0, Math.min(Number(rosterEntry?.hp ?? preset.maxHp), Number(preset.maxHp)));
    const sp = Math.max(0, Math.min(Number(rosterEntry?.sp ?? preset.startSp ?? 0), Number(preset.maxSp)));
    const mp = Math.max(0, Math.min(Number(rosterEntry?.mp ?? preset.startMp ?? 0), Number(preset.maxMp)));
    return `${preset.name}: HP ${hp}/${preset.maxHp}, SP ${sp}/${preset.maxSp}${preset.maxMp > 0 ? `, MP ${mp}/${preset.maxMp}` : ''}`;
  });
}

function updateCampaignRosterFromBattlePlayers(players = []) {
  for (const fighter of players) {
    const key = fighter.sourceKey ?? fighter.id;
    if (!CAMPAIGN_PLAYABLE_UNITS.includes(key)) {
      continue;
    }
    state.campaignRun.roster[key] = {
      ...(state.campaignRun.roster[key] ?? {}),
      key,
      hp: Number(fighter.hp ?? PRESETS[key].maxHp),
      sp: Number(fighter.sp ?? PRESETS[key].startSp ?? 0),
      mp: Number(fighter.mp ?? PRESETS[key].startMp ?? 0),
      available: true,
    };
  }
}

function fullyRestoreCampaignRoster(onlyAvailable = true) {
  for (const key of CAMPAIGN_PLAYABLE_UNITS) {
    const preset = buildCampaignPresetForKey(key);
    const entry = state.campaignRun.roster[key] ?? { key, available: false };
    if (onlyAvailable && !entry.available) {
      continue;
    }
    state.campaignRun.roster[key] = {
      ...entry,
      key,
      hp: Number(preset.maxHp),
      sp: Number(preset.startSp ?? 0),
      mp: Number(preset.startMp ?? 0),
    };
  }
}

function campaignEquipmentForLocation(locationId) {
  const stockIds = EQUIPMENT_STOCK_BY_LOCATION[locationId] ?? [];
  return stockIds
    .map((equipmentId) => EQUIPMENT_CATALOG.find((entry) => entry.id === equipmentId) ?? null)
    .filter(Boolean);
}

function equipCampaignItem(key, equipmentId) {
  const equipment = EQUIPMENT_CATALOG.find((entry) => entry.id === equipmentId) ?? null;
  if (!equipment || !key || !equipment.slot || equipment.slot === 'consumable-pack' || equipment.targetKey !== key) {
    return false;
  }
  if (!state.campaignRun.purchasedUpgradeIds.includes(equipment.id)) {
    return false;
  }
  state.campaignRun.equipmentLoadout[key] = {
    ...(state.campaignRun.equipmentLoadout[key] ?? { weapon: null, armor: null, accessory: null }),
    [equipment.slot]: equipment.id,
  };
  return true;
}

function unequipCampaignItem(key, slot) {
  if (!state.campaignRun.equipmentLoadout[key]) {
    return false;
  }
  state.campaignRun.equipmentLoadout[key][slot] = null;
  return true;
}

function applyCampaignEquipmentUpgradeToState(upgrade) {
  if (!upgrade) {
    return;
  }
  if (upgrade.slot === 'consumable-pack' && ITEM_CATALOG.some((item) => Number(upgrade.bonuses?.[item.key] ?? 0) > 0)) {
    state.campaignRun.inventory = mergeInventory(state.campaignRun.inventory, upgrade.bonuses);
    return;
  }

  if (upgrade.targetKey) {
    const key = upgrade.targetKey;
    const rosterEntry = state.campaignRun.roster[key] ?? createDefaultCampaignRoster()[key];
    const basePreset = buildFormPresetForKey(key);
    if (rosterEntry) {
      state.campaignRun.roster[key] = {
        ...rosterEntry,
        hp: Math.max(Number(rosterEntry.hp ?? 0), Number(basePreset.maxHp) + Number(upgrade.bonuses?.maxHp ?? 0)),
        mp: Math.max(Number(rosterEntry.mp ?? 0), Number(basePreset.startMp ?? 0) + Number(upgrade.bonuses?.maxMp ?? 0)),
      };
    }
    equipCampaignItem(key, upgrade.id);
  }
}

function buyCampaignEquipmentUpgrade(upgradeId) {
  const upgrade = EQUIPMENT_CATALOG.find((entry) => entry.id === upgradeId) ?? null;
  const location = getCurrentCampaignLocation();
  if (!upgrade || !location) {
    return;
  }
  if (state.campaignRun.purchasedUpgradeIds.includes(upgrade.id)) {
    state.campaignRun.travelMessage = `${upgrade.label} уже куплен ранее и считается постоянным улучшением этого забега.`;
    render();
    return;
  }
  if (state.campaignRun.gold < upgrade.price) {
    state.campaignRun.travelMessage = `Недостаточно золота для ${upgrade.label}. Нужно ${upgrade.price} G.`;
    render();
    return;
  }
  state.campaignRun.gold -= upgrade.price;
  state.campaignRun.purchasedUpgradeIds.push(upgrade.id);
  applyCampaignEquipmentUpgradeToState(upgrade);
  fullyRestoreCampaignRoster(false);
  state.campaignRun.checkpointEquipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.equipmentLoadout);
  writeStateToForms();
  state.campaignRun.travelMessage = upgrade.slot === 'consumable-pack'
    ? `Куплен набор: ${upgrade.label}. ${upgrade.description}`
    : `Куплено снаряжение: ${upgrade.label}. Предмет помещён в слот ${upgrade.slot} персонажа ${PRESETS[upgrade.targetKey]?.name ?? upgrade.targetKey}.`;
  pushCampaignJournalEntry(`Покупка экипировки: ${upgrade.label} в ${location.title}. Остаток золота: ${campaignGoldString()}.`);
  saveCampaignStateToLocalStorage();
  render();
}

function campaignOwnedEquipmentLines() {
  return state.campaignRun.purchasedUpgradeIds
    .map((id) => {
      const item = EQUIPMENT_CATALOG.find((entry) => entry.id === id);
      return item ? `${item.label}${item.slot && item.slot !== 'consumable-pack' ? ` [${item.slot}]` : ''}` : id;
    })
    .slice(-12);
}

function campaignEquipmentLoadoutLines() {
  return CAMPAIGN_PLAYABLE_UNITS.map((key) => {
    const preset = PRESETS[key];
    const loadout = state.campaignRun.equipmentLoadout?.[key] ?? {};
    const weapon = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.weapon)?.label ?? '—';
    const armor = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.armor)?.label ?? '—';
    const accessory = EQUIPMENT_CATALOG.find((entry) => entry.id === loadout.accessory)?.label ?? '—';
    return `${preset.name}: weapon=${weapon} | armor=${armor} | accessory=${accessory}`;
  });
}

function renderCampaignEquipmentPanel() {
  if (!elements.campaignEquipmentSummary || !elements.campaignEquipmentActions) {
    return;
  }

  if (!campaignRunActive()) {
    elements.campaignEquipmentSummary.textContent = 'После старта кампании тут появятся слоты weapon/armor/accessory и список купленного снаряжения.';
    elements.campaignEquipmentActions.innerHTML = '';
    return;
  }

  const availableItems = state.campaignRun.purchasedUpgradeIds
    .map((id) => EQUIPMENT_CATALOG.find((entry) => entry.id === id))
    .filter(Boolean)
    .filter((entry) => entry.slot && entry.slot !== 'consumable-pack' && entry.targetKey);
  const partyAccessories = state.campaignRun.purchasedUpgradeIds
    .map((id) => EQUIPMENT_CATALOG.find((entry) => entry.id === id))
    .filter(Boolean)
    .filter((entry) => entry.slot && entry.slot !== 'consumable-pack' && !entry.targetKey);

  elements.campaignEquipmentSummary.textContent = [
    `Золото: ${campaignGoldString()}`,
    `Куплено предметов: ${availableItems.length}`,
    'Текущие слоты:',
    ...campaignEquipmentLoadoutLines(),
    '',
    'Партийные аксессуары (действуют на всех):',
    ...(partyAccessories.length ? partyAccessories.map((entry) => `- ${entry.label}: ${entry.description}`) : ['- none']),
    '',
    'Купленный инвентарь:',
    ...(campaignOwnedEquipmentLines().length ? campaignOwnedEquipmentLines() : ['none']),
  ].join('\n');

  elements.campaignEquipmentActions.innerHTML = '';

  const addButton = (text, onClick) => {
    const button = document.createElement('button');
    button.className = 'secondary';
    button.textContent = text;
    button.addEventListener('click', onClick);
    elements.campaignEquipmentActions.appendChild(button);
  };

  for (const item of availableItems) {
    const targetName = PRESETS[item.targetKey]?.name ?? item.targetKey;
    const equipped = state.campaignRun.equipmentLoadout?.[item.targetKey]?.[item.slot] === item.id;
    addButton(
      equipped ? `${targetName}: ${item.label} (${item.slot}, экипировано)` : `Экипировать ${item.label} → ${targetName} (${item.slot})`,
      () => {
        equipCampaignItem(item.targetKey, item.id);
        pushCampaignJournalEntry(`Экипировка изменена: ${targetName} получает ${item.label}.`);
        saveCampaignStateToLocalStorage();
        render();
      },
    );
  }

  for (const key of CAMPAIGN_PLAYABLE_UNITS) {
    const loadout = state.campaignRun.equipmentLoadout?.[key] ?? {};
    for (const slot of ['weapon', 'armor', 'accessory']) {
      if (!loadout[slot]) continue;
      addButton(`Снять ${slot} с ${PRESETS[key]?.name ?? key}`, () => {
        unequipCampaignItem(key, slot);
        pushCampaignJournalEntry(`Экипировка изменена: ${PRESETS[key]?.name ?? key} снимает ${slot}.`);
        saveCampaignStateToLocalStorage();
        render();
      });
    }
  }
}

function canUnlockGrowthNode(node) {
  if (!node || (state.campaignRun.growthUnlockIds ?? []).includes(node.id)) {
    return false;
  }
  const rules = GROWTH_NODE_RULES[node.id] ?? {};
  const hasRequiredLevel = state.campaignRun.partyLevel >= Number(rules.requiresLevel ?? 1);
  const hasRequiredNodes = (rules.requiresNodes ?? []).every((nodeId) => (state.campaignRun.growthUnlockIds ?? []).includes(nodeId));
  return hasRequiredLevel
    && hasRequiredNodes
    && state.campaignRun.skillCoins >= Number(node.costSkill ?? 0)
    && state.campaignRun.magicCoins >= Number(node.costMagic ?? 0);
}

function unlockGrowthNode(nodeId) {
  const node = GROWTH_NODES.find((entry) => entry.id === nodeId) ?? null;
  if (!node || !canUnlockGrowthNode(node)) {
    return;
  }
  state.campaignRun.skillCoins -= Number(node.costSkill ?? 0);
  state.campaignRun.magicCoins -= Number(node.costMagic ?? 0);
  state.campaignRun.growthUnlockIds.push(node.id);
  fullyRestoreCampaignRoster(false);
  pushCampaignJournalEntry(`Рост партии: открыт ${node.label}.`);
  state.campaignRun.travelMessage = `Открыт growth node: ${node.label}. ${node.description}`;
  saveCampaignStateToLocalStorage();
  render();
}

function applyQuestFlags(flagIds = []) {
  let changed = false;
  for (const flagId of flagIds) {
    if (!flagId || hasQuestFlag(flagId)) continue;
    state.campaignRun.questFlags[flagId] = true;
    changed = true;
  }
  return changed;
}

function pushCampaignJournalEntry(text) {
  if (!text) {
    return;
  }
  const stamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  state.campaignRun.journal.push(`[${stamp}] ${text}`);
  if (state.campaignRun.journal.length > 80) {
    state.campaignRun.journal.splice(0, state.campaignRun.journal.length - 80);
  }
}

function rememberCampaignLocation(locationId) {
  if (!locationId) {
    return;
  }
  if (!state.campaignRun.visitedLocationIds.includes(locationId)) {
    state.campaignRun.visitedLocationIds.push(locationId);
  }
  state.campaignRun.locationHistory.push(locationId);
  if (state.campaignRun.locationHistory.length > 40) {
    state.campaignRun.locationHistory.splice(0, state.campaignRun.locationHistory.length - 40);
  }
}

function setCampaignCurrentLocation(locationId, { note = null, silent = false } = {}) {
  const location = getWorldLocation(locationId);
  if (!location) {
    return false;
  }
  state.campaignRun.currentLocationId = location.id;
  resetCampaignAvatarForLocation(location.id);
  rememberCampaignLocation(location.id);
  state.campaignRun.travelMessage = note ?? `Партия переместилась в ${location.title}.`;
  if (!silent) {
    pushCampaignJournalEntry(`Локация: ${location.title}.`);
  }
  return true;
}

function campaignTravelObjectiveReady() {
  const binding = getCurrentCampaignWorldBinding();
  const beat = getCurrentCampaignBeat();
  if (!binding || !beat) {
    return false;
  }
  const currentLocationId = state.campaignRun.currentLocationId;
  const inRightLocation = currentLocationId === (binding.objectiveLocationId ?? null)
    || currentLocationId === (binding.battleLocationId ?? null);
  if (!inRightLocation) {
    return false;
  }
  return missingObjectiveFlagsForCurrentBeat().length === 0;
}

function ensureCampaignTravelLocation() {
  const beat = getCurrentCampaignBeat();
  const binding = getCurrentCampaignWorldBinding();
  if (!beat || !binding) {
    return;
  }

  const desiredLocationId = state.campaignRun.currentLocationId && isLocationOpenForBeat(state.campaignRun.currentLocationId, beat.id)
    ? state.campaignRun.currentLocationId
    : binding.startLocationId;
  if (desiredLocationId) {
    setCampaignCurrentLocation(desiredLocationId, { silent: true, note: `Текущая точка маршрута: ${getWorldLocation(desiredLocationId)?.title ?? desiredLocationId}.` });
  }
}

function enterCampaignTravelPhase() {
  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return;
  }
  state.campaignRun.phase = 'travel';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.pendingTravelFromLocationId = null;
  state.campaignRun.pendingTravelToLocationId = null;
  ensureCampaignTravelLocation();
  const binding = getCurrentCampaignWorldBinding();
  pushCampaignJournalEntry(`Маршрут открыт: ${binding?.travelBrief ?? beat.title}.`);
  const locationScene = nextLocationSceneForCurrentContext();
  if (locationScene) {
    openCurrentLocationScene(locationScene);
    return;
  }
  saveCampaignStateToLocalStorage();
}

function currentCampaignTravelPage() {
  const beat = getCurrentCampaignBeat();
  const binding = getCurrentCampaignWorldBinding();
  const chapter = getCurrentCampaignChapter();
  const location = getCurrentCampaignLocation();
  const meta = storyBeatImplementationMeta(beat);
  const routeTitles = (binding?.route ?? []).map((locationId) => getWorldLocation(locationId)?.title ?? locationId);
  const objectiveLocation = getWorldLocation(binding?.objectiveLocationId ?? null);
  const treasures = availableTreasuresForCurrentLocation();
  const encounters = availableTravelEncountersForCurrentLocation();
  const npcDialogues = availableNpcDialoguesForCurrentLocation();
  const missingFlags = missingObjectiveFlagsForCurrentBeat();
  const nextChainStep = nextQuestChainStepForBeat(beat?.id ?? null);
  const pendingLocationScene = nextLocationSceneForCurrentContext();

  const objectiveReady = campaignTravelObjectiveReady();
  const needsSetpiece = objectiveReady && !pendingLocationScene && shouldShowSetpieceForCurrentBeat();

  return {
    kind: 'travel',
    title: location?.title ?? 'Маршрут не задан',
    subtitle: chapter?.title ?? 'Story route',
    text: [
      binding?.travelBrief ?? beat?.summary ?? 'Текущий сюжетный переход.',
      resolvedLocationDescription(location, beat?.id) ?? 'Для этого участка пути ещё не задано описание локации.',
      objectiveLocation
        ? `Текущая сюжетная цель находится в точке: ${objectiveLocation.title}.`
        : 'Сюжетная цель текущей главы ещё не привязана к конкретной точке мира.',
      routeTitles.length > 0
        ? `Рекомендуемый маршрут: ${routeTitles.join(' → ')}.`
        : 'Рекомендуемый маршрут пока не определён.',
      nextChainStep ? `Ближайший конкретный шаг: ${nextChainStep.label} @ ${getWorldLocation(nextChainStep.locationId)?.title ?? nextChainStep.locationId}.` : 'Текущая цепочка уже почти закрыта.',
      treasures.length > 0 ? `В этой локации ещё осталось сундуков: ${treasures.length}.` : 'Сундуки этой локации уже вскрыты.',
      encounters.length > 0 ? `Здесь ещё бродят монстры: ${encounters.map((entry) => entry.label).join(', ')}.` : 'Бродячие encounter-ы этой локации уже очищены.',
      npcDialogues.length > 0 ? `Есть невыслушанные NPC-разговоры: ${npcDialogues.map((entry) => entry.label).join(', ')}.` : 'Все доступные NPC-разговоры этой локации уже состоялись.',
      missingFlags.length > 0 ? `Чтобы продвинуть сюжет, ещё нужны флаги: ${missingFlags.map(questFlagLabel).join(', ')}.` : 'Все ключевые флаги текущего шага уже собраны.',
      pendingLocationScene
        ? `Прежде чем двигаться к бою или setpiece, здесь нужно отыграть локальную сцену: ${pendingLocationScene.title}. Это поддерживает оригинальный room-by-room pacing Grandia II.`
        : needsSetpiece
          ? 'В этой точке должен сработать bespoke setpiece перед самим боем. Сначала открой сцену.'
          : objectiveReady
            ? (meta.kind === 'battle'
              ? 'Ты в нужной точке мира. Можно запускать сюжетный бой.'
              : 'Ты в нужной точке мира. Можно засчитать narrative checkpoint.')
            : 'Сначала доберись до нужной точки мира через доступные переходы и подлокации.',
    ],
    action: pendingLocationScene
      ? 'travel'
      : needsSetpiece
        ? 'launch-setpiece'
        : objectiveReady
          ? (meta.kind === 'battle' ? 'launch-battle' : 'complete-placeholder')
          : 'travel',
  };
}

function currentCampaignOverworldPage() {
  const fromLocation = getWorldLocation(state.campaignRun.pendingTravelFromLocationId ?? null);
  const toLocation = getWorldLocation(state.campaignRun.pendingTravelToLocationId ?? null);
  const chapter = getCurrentCampaignChapter();
  return {
    kind: 'overworld',
    title: `${fromLocation?.region ?? 'Текущий регион'} → ${toLocation?.region ?? 'Следующий регион'}`,
    subtitle: chapter?.title ?? 'Overworld travel',
    text: [
      `Партия покидает ${fromLocation?.title ?? 'текущую точку'} и выходит на маршрут между крупными регионами мира.`,
      toLocation ? `Следующая остановка: ${toLocation.title}.` : 'Следующая точка маршрута ещё не задана.',
      'В духе Grandia II старый участок пути постепенно остаётся позади: не вся карта мира открыта одновременно, а только релевантные зоны текущего этапа истории.',
    ],
    action: 'arrive-location',
  };
}

function buildTravelEncounterResultPages(outcome = 'victory') {
  const context = state.campaignRun.battleContext ?? {};
  const encounter = (WORLD_TRAVEL_ENCOUNTERS[context.locationId] ?? []).find((entry) => entry.id === context.encounterId) ?? null;
  const location = getWorldLocation(context.locationId ?? state.campaignRun.currentLocationId ?? null);
  if (outcome === 'victory') {
    return [{
      kind: 'result',
      title: `Победа на маршруте: ${encounter?.label ?? 'travel encounter'}`,
      subtitle: location?.title ?? 'Travel battle',
      text: [
        encounter?.description ?? 'Промежуточная стычка завершилась победой.',
        `Награда: ${campaignRewardDescription(state.campaignRun.pendingReward ?? {})}.`,
        `Текущий запас: ${campaignInventoryString()} | Золото: ${campaignGoldString()}.`,
        'Путь по локации открыт снова. Можно продолжать исследование.',
      ],
      action: 'return-travel',
    }];
  }
  return [{
    kind: 'result',
    title: `Поражение в стычке: ${encounter?.label ?? 'travel encounter'}`,
    subtitle: location?.title ?? 'Travel battle',
    text: [
      encounter?.description ?? 'Промежуточная стычка закончилась поражением.',
      'Партия откатилась к checkpoint-состоянию этой области.',
      `Восстановлено: ${campaignInventoryString()} | Золото: ${campaignGoldString()}.`,
      'Можно восстановиться, сменить экипировку и попробовать ещё раз.',
    ],
    action: 'return-travel',
  }];
}

function campaignRunActive() {
  return Boolean(state.campaignRun.active);
}

function isCampaignNarrativeMode() {
  return campaignRunActive() && state.activeTab === 'campaign' && state.campaignRun.phase !== 'battle';
}

function campaignResultPhase() {
  return campaignRunActive() && ['victory', 'defeat', 'placeholder-result', 'finished'].includes(state.campaignRun.phase);
}

function currentCampaignScenePages() {
  const refs = allStoryBeatRefs();
  const beat = getCurrentCampaignBeat();
  const arc = getCurrentCampaignArc();
  const nextRef = getNextStoryBeatRefByIndex(state.campaignRun.currentBeatIndex);
  const nextBeat = nextRef ? getStoryBeatById(nextRef.beatId) : null;
  const nextArc = nextRef ? getStoryArcs().find((entry) => entry.id === nextRef.arcId) ?? null : null;
  const meta = storyBeatImplementationMeta(beat);
  const worldBinding = getCurrentCampaignWorldBinding();

  switch (state.campaignRun.phase) {
    case 'opening':
      return buildCampaignIntroPages({ totalBeats: refs.length });
    case 'intro':
      return buildBeatIntroPages({
        arc,
        beat,
        meta,
        beatIndex: state.campaignRun.currentBeatIndex,
        totalBeats: refs.length,
        worldBinding,
      });
    case 'location-scene': {
      const scene = activeLocationScene();
      return scene?.pages ?? [];
    }
    case 'npc-dialogue': {
      const dialogue = activeNpcDialogue();
      return dialogue?.pages ?? [];
    }
    case 'travel':
      return [currentCampaignTravelPage()];
    case 'overworld':
      return [currentCampaignOverworldPage()];
    case 'setpiece': {
      const setpiece = activeSetpieceForBeat(beat?.id ?? null);
      return setpiece?.pages ?? [];
    }
    case 'travel-victory':
      return buildTravelEncounterResultPages('victory');
    case 'travel-defeat':
      return buildTravelEncounterResultPages('defeat');
    case 'victory':
      return buildBeatVictoryPages({
        arc,
        beat,
        meta,
        beatIndex: state.campaignRun.currentBeatIndex,
        totalBeats: refs.length,
        reward: state.campaignRun.pendingReward ?? { gold: 0, ...createBaseInventory() },
        nextBeat: nextBeat ? { ...nextBeat, arcTitle: nextArc?.title ?? null } : null,
        inventoryAfterReward: state.campaignRun.inventory,
        goldAfterReward: state.campaignRun.gold,
      });
    case 'defeat':
      return buildBeatDefeatPages({ beat });
    case 'placeholder-result':
      return buildPlaceholderResolutionPages({
        beat,
        nextBeat,
        reward: state.campaignRun.pendingReward ?? { gold: 0, ...createBaseInventory() },
        goldAfterReward: state.campaignRun.gold,
      });
    case 'finished':
      return buildCampaignEndingPages({
        completed: state.campaignRun.completedBeatIds.length,
        totalBeats: refs.length,
        journalCount: state.campaignRun.journal.length,
      });
    default:
      return [];
  }
}

function getCurrentCampaignScenePage() {
  const pages = currentCampaignScenePages();
  if (pages.length === 0) {
    return null;
  }
  return pages[Math.max(0, Math.min(state.campaignRun.sceneIndex, pages.length - 1))] ?? null;
}

function syncCampaignSelectorsToState() {
  const arc = getCurrentStoryArc();
  const beat = getCurrentStoryBeat();
  if (!elements.campaignArcSelect || !elements.campaignBeatSelect) {
    return;
  }
  if (arc) {
    elements.campaignArcSelect.value = arc.id;
  }
  if (beat) {
    elements.campaignBeatSelect.value = beat.id;
  }
}

function setCampaignArc(arcId) {
  const arc = getStoryArcs().find((entry) => entry.id === arcId) ?? getStoryArcs()[0] ?? null;
  if (!arc) {
    return;
  }
  state.currentStoryArcId = arc.id;
  state.currentStoryBeatId = arc.plotBeats?.[0]?.id ?? null;
  refreshStorySelectors();
  render();
}

function setCampaignBeat(beatId) {
  const arc = getCurrentStoryArc();
  const beat = arc?.plotBeats?.find((entry) => entry.id === beatId) ?? null;
  if (!beat) {
    return;
  }
  state.currentStoryBeatId = beat.id;
  render();
}

function stepCampaignBeat(delta) {
  const refs = allStoryBeatRefs();
  if (refs.length === 0) {
    return;
  }
  const currentIndex = Math.max(0, refs.findIndex((ref) => ref.arcId === state.currentStoryArcId && ref.beatId === state.currentStoryBeatId));
  const next = refs[Math.max(0, Math.min(currentIndex + delta, refs.length - 1))];
  setCurrentStoryBeat(next.arcId, next.beatId);
  refreshStorySelectors();
  render();
}

function setCampaignRunBeatByIndex(index) {
  const refs = allStoryBeatRefs();
  const ref = refs[Math.max(0, Math.min(index, refs.length - 1))] ?? null;
  if (!ref) {
    return null;
  }

  state.campaignRun.currentBeatIndex = refs.findIndex((entry) => entry.arcId === ref.arcId && entry.beatId === ref.beatId);
  state.campaignRun.currentBeatId = ref.beatId;
  setCurrentStoryBeat(ref.arcId, ref.beatId);
  refreshStorySelectors();
  return ref;
}

function startNewCampaignRun() {
  const refs = allStoryBeatRefs();
  if (refs.length === 0) {
    return;
  }

  readFormsToState();
  state.campaignRun = createEmptyCampaignRun();
  state.campaignRun.active = true;
  state.campaignRun.runId = `campaign-${Date.now()}`;
  state.campaignRun.startedAt = new Date().toISOString();
  state.campaignRun.inventory = createBaseInventory({
    ...DEFAULT_CAMPAIGN_INVENTORY,
    ...state.inventoryOverrides,
    medicinalHerb: Math.max(1, Number(state.inventoryOverrides.medicinalHerb ?? DEFAULT_CAMPAIGN_INVENTORY.medicinalHerb ?? 3)),
  });
  state.campaignRun.roster = Object.fromEntries(CAMPAIGN_PLAYABLE_UNITS.map((key) => {
    const preset = buildFormPresetForKey(key);
    return [key, {
      key,
      hp: Number(preset.maxHp),
      sp: Number(preset.startSp ?? 0),
      mp: Number(preset.startMp ?? 0),
      available: key === 'ryudo' || key === 'elena',
    }];
  }));
  state.campaignRun.gold = 180;
  state.campaignRun.equipmentLoadout = createDefaultEquipmentLoadout();
  state.campaignRun.checkpointInventory = { ...state.campaignRun.inventory };
  state.campaignRun.checkpointGold = state.campaignRun.gold;
  state.campaignRun.checkpointEquipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.equipmentLoadout);
  state.campaignRun.visitedLocationIds = [];
  state.campaignRun.locationHistory = [];
  state.campaignRun.selectedDifficulty = state.playEnemyAi;
  state.campaignRun.phase = 'opening';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.finished = false;
  state.appliedStoryArcId = null;
  state.appliedStoryBeatId = null;
  setCampaignRunBeatByIndex(0);
  syncCampaignRosterAvailabilityForBeat(getCurrentCampaignBeat());
  fullyRestoreCampaignRoster(false);
  state.campaignRun.checkpointRoster = cloneCampaignRoster(state.campaignRun.roster);
  state.campaignRun.checkpointEquipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.equipmentLoadout);
  pushCampaignJournalEntry('Начата новая сюжетная кампания.');
  state.debugOutput = 'Story campaign: new run started.';
  state.activeTab = 'campaign';
  saveCampaignStateToLocalStorage();
  render();
}

function abandonCampaignRun() {
  if (!campaignRunActive()) {
    return;
  }
  state.campaignRun = createEmptyCampaignRun();
  state.debugOutput = 'Current campaign run abandoned. Overall campaign history was kept.';
  saveCampaignStateToLocalStorage();
  render();
}

function openCampaignBeatIntro(index) {
  const ref = setCampaignRunBeatByIndex(index);
  if (!ref) {
    return;
  }
  state.campaignRun.phase = 'intro';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.finished = false;
  syncCampaignRosterAvailabilityForBeat(getCurrentCampaignBeat());
  state.campaignRun.lastBattleWinner = null;
  state.campaignRun.lastResultSummary = null;
  state.campaignRun.pendingReward = { gold: 0, ...createBaseInventory() };
  state.campaignRun.autoSceneAdvanceReady = false;
  state.campaignRun.travelMessage = null;
  saveCampaignStateToLocalStorage();
}

function advanceCampaignToNextBeatOrEnding() {
  const nextRef = getNextStoryBeatRefByIndex(state.campaignRun.currentBeatIndex);
  if (!nextRef) {
    state.campaignRun.phase = 'finished';
    state.campaignRun.sceneIndex = 0;
    state.campaignRun.finished = true;
    pushCampaignJournalEntry('Кампания завершена. Финальная развязка открыта.');
    saveCampaignStateToLocalStorage();
    return;
  }

  openCampaignBeatIntro(state.campaignRun.currentBeatIndex + 1);
}

function completeCurrentPlaceholderBeat() {
  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return;
  }

  const meta = storyBeatImplementationMeta(beat);
  const reward = campaignBeatReward(beat, meta);
  const binding = getCurrentCampaignWorldBinding();

  if (!state.campaignRun.completedBeatIds.includes(beat.id)) {
    state.campaignRun.completedBeatIds.push(beat.id);
  }
  if (!state.campaignProgress.completedBeatIds.includes(beat.id)) {
    state.campaignProgress.completedBeatIds.push(beat.id);
  }
  state.campaignRun.pendingReward = reward;
  grantCampaignRewards(reward, { sourceLabel: `Checkpoint: ${beat.title}` });
  state.inventoryOverrides = { ...state.campaignRun.inventory };
  if (binding?.endLocationId) {
    setCampaignCurrentLocation(binding.endLocationId, { note: `Партия приходит в ${getWorldLocation(binding.endLocationId)?.title ?? binding.endLocationId}.`, silent: true });
  }
  state.campaignProgress.lastStartedBeatId = beat.id;
  state.campaignRun.phase = 'placeholder-result';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastResultSummary = `Checkpoint for ${beat.title}`;
  pushCampaignJournalEntry(`Бит ${beat.title} пройден как narrative checkpoint-заглушка. Награда: ${campaignRewardDescription(reward)}.`);
  writeStateToForms();
  saveCampaignStateToLocalStorage();
  render();
}

function advanceCampaignScene() {
  if (!campaignRunActive()) {
    return;
  }

  const pages = currentCampaignScenePages();
  if (pages.length === 0) {
    return;
  }

  const currentPage = getCurrentCampaignScenePage();
  if (['launch-battle', 'complete-placeholder', 'retry-battle', 'travel'].includes(currentPage?.action)) {
    return;
  }

  if (state.campaignRun.sceneIndex < pages.length - 1) {
    state.campaignRun.sceneIndex += 1;
    saveCampaignStateToLocalStorage();
    render();
    return;
  }

  if (state.campaignRun.phase === 'opening') {
    openCampaignBeatIntro(state.campaignRun.currentBeatIndex);
  } else if (state.campaignRun.phase === 'intro') {
    enterCampaignTravelPhase();
  } else if (state.campaignRun.phase === 'location-scene') {
    resolveLocationSceneCompletion();
  } else if (state.campaignRun.phase === 'npc-dialogue') {
    resolveNpcDialogueCompletion();
  } else if (state.campaignRun.phase === 'overworld') {
    completeCampaignOverworldTravel();
  } else if (state.campaignRun.phase === 'victory' || state.campaignRun.phase === 'placeholder-result') {
    advanceCampaignToNextBeatOrEnding();
  }

  render();
}

function createCampaignBattle(beat) {
  const meta = storyBeatImplementationMeta(beat);
  const battleOverride = setpieceBattleOverrideForBeat(beat?.id ?? null);
  applyStoryBeat(beat, { startBattle: false });
  state.inventoryOverrides = { ...state.campaignRun.inventory };
  writeStateToForms();

  let encounter;
  let openingAdvantage;
  let battlefieldTheme;
  let introLog;
  let encounterSource;
  let customScriptId = null;

  if (battleOverride) {
    encounter = {
      players: buildCampaignPlayersForBeat(beat, battleOverride.players ?? null),
      enemies: (battleOverride.enemies ?? []).map((entry) => buildCampaignEnemyPreset(entry.presetKey, entry)),
    };
    openingAdvantage = battleOverride.openingAdvantage ?? state.openingAdvantage;
    battlefieldTheme = battleOverride.battlefieldTheme ?? state.battlefieldTheme;
    introLog = battleOverride.introLog ?? `Setpiece battle — ${beat.title}`;
    encounterSource = battleOverride.encounterSource ?? meta.sourceType;
    customScriptId = battleOverride.customScriptId ?? null;
    state.battleLabel = `${battleOverride.battleLabel ?? beat.title} / попытка ${(state.campaignRun.battleAttempts[beat.id] ?? 0) + 1} / seed ${state.battleSeed}`;
  } else {
    encounter = buildEncounterFromForm();
    encounter.players = buildCampaignPlayersForBeat(beat);
    const template = ENCOUNTER_TEMPLATES[state.encounterTemplate];
    state.battleLabel = `Кампания: ${beat.title} / ${template?.label ?? state.encounterTemplate} / попытка ${(state.campaignRun.battleAttempts[beat.id] ?? 0) + 1} / seed ${state.battleSeed}`;
    openingAdvantage = state.openingAdvantage;
    battlefieldTheme = state.battlefieldTheme;
    introLog = `Story campaign — ${beat.title}: ${beat.summary}`;
    encounterSource = meta.sourceType;
  }

  return createDefaultBattle({
    ...encounter,
    inventory: { ...state.campaignRun.inventory },
    openingAdvantage,
    battlefieldTheme,
    introLog,
    rng: createSeededRng(state.battleSeed),
    balance: currentBalanceProfile(),
    controllers: {
      players: manualPlayerController,
      enemies: controllerFromKind(state.playEnemyAi),
    },
    metadata: {
      campaign: true,
      storyBeatId: beat.id,
      encounterSource,
      customScriptId,
    },
  });
}

function travelEncounterEnemyPosition(index) {
  const positions = [
    { x: 720, y: 120 },
    { x: 810, y: 200 },
    { x: 740, y: 290 },
    { x: 850, y: 120 },
  ];
  return positions[index] ?? { x: 760 + (index * 30), y: 180 + ((index % 2) * 70) };
}

function createCampaignTravelEncounterBattle(encounterConfig) {
  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  const players = buildCampaignPlayersForBeat(beat);
  const enemies = (encounterConfig.enemyKeys ?? []).map((key, index) => ({
    ...buildFormPresetForKey(key),
    position: travelEncounterEnemyPosition(index),
  }));
  const openingAdvantage = encounterConfig.openingAdvantage ?? 'neutral';
  const battlefieldTheme = encounterConfig.theme ?? state.battlefieldTheme;
  state.battleLabel = `Полевой encounter: ${encounterConfig.label} / ${location?.title ?? 'unknown'} / seed ${state.battleSeed}`;
  return createDefaultBattle({
    players,
    enemies,
    inventory: { ...state.campaignRun.inventory },
    openingAdvantage,
    battlefieldTheme,
    introLog: `Travel encounter — ${encounterConfig.label}: ${encounterConfig.description}`,
    rng: createSeededRng(state.battleSeed + (state.campaignRun.locationHistory.length * 17) + 7),
    balance: currentBalanceProfile(),
    controllers: {
      players: manualPlayerController,
      enemies: controllerFromKind(state.playEnemyAi),
    },
    metadata: {
      campaign: true,
      storyBeatId: beat?.id ?? null,
      encounterSource: 'travel',
      campaignLocationId: location?.id ?? null,
    },
  });
}

function startCampaignBattleForCurrentBeat({ preserveCheckpoint = false } = {}) {
  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return;
  }

  const meta = storyBeatImplementationMeta(beat);
  if (meta.kind !== 'battle') {
    state.debugOutput = `Story beat ${beat.id} still has no battle mapping. Using placeholder flow instead.`;
    completeCurrentPlaceholderBeat();
    return;
  }

  if (state.campaignRun.phase === 'travel' && !campaignTravelObjectiveReady()) {
    state.debugOutput = 'Сначала доберись до нужной точки мира, затем запускай сюжетный бой.';
    render();
    return;
  }

  closeReplay();
  if (!preserveCheckpoint) {
    state.campaignRun.checkpointInventory = { ...state.campaignRun.inventory };
    state.campaignRun.checkpointGold = Number(state.campaignRun.gold ?? 0);
    state.campaignRun.checkpointRoster = cloneCampaignRoster(state.campaignRun.roster);
    state.campaignRun.checkpointEquipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.equipmentLoadout);
  }
  state.campaignRun.battleAttempts[beat.id] = (state.campaignRun.battleAttempts[beat.id] ?? 0) + 1;
  state.campaignRun.battleContext = { type: 'story', beatId: beat.id };
  state.campaignRun.phase = 'battle';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastBattleWinner = null;
  state.campaignRun.autoSceneAdvanceReady = false;
  state.campaignProgress.lastStartedBeatId = beat.id;
  pushCampaignJournalEntry(`Старт боя: ${beat.title} (попытка ${state.campaignRun.battleAttempts[beat.id]}).`);
  state.battle = createCampaignBattle(beat);
  state.activeTab = 'campaign';
  saveCampaignStateToLocalStorage();
  render();
}

function openCampaignSetpiecePhase() {
  const beat = getCurrentCampaignBeat();
  const setpiece = activeSetpieceForBeat(beat?.id ?? null);
  if (!beat || !setpiece) {
    return;
  }
  state.campaignRun.phase = 'setpiece';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastResultSummary = `Setpiece: ${setpiece.title}`;
  state.campaignRun.travelMessage = `Bespoke scene opened: ${setpiece.title}.`;
  pushCampaignJournalEntry(`Открыт bespoke setpiece: ${setpiece.title}.`);
  saveCampaignStateToLocalStorage();
  render();
}

function launchCampaignBattleFromCurrentScene() {
  if (!campaignRunActive()) {
    return;
  }
  const page = getCurrentCampaignScenePage();
  if (page?.action === 'launch-setpiece') {
    openCampaignSetpiecePhase();
    return;
  }
  if (state.campaignRun.phase === 'setpiece') {
    const setpiece = activeSetpieceForBeat(state.campaignRun.currentBeatId ?? null);
    if (setpiece?.unlockFlag) {
      applyQuestFlags([setpiece.unlockFlag]);
      state.campaignRun.travelMessage = `Bespoke scene завершена: ${setpiece.title}. Теперь можно запускать бой.`;
      pushCampaignJournalEntry(`Setpiece-флаг получен: ${questFlagLabel(setpiece.unlockFlag)}.`);
    }
    state.campaignRun.phase = 'travel';
    state.campaignRun.sceneIndex = 0;
    saveCampaignStateToLocalStorage();
  }
  startCampaignBattleForCurrentBeat();
}

function startCampaignTravelEncounter(encounterId) {
  if (!campaignRunActive() || state.campaignRun.phase !== 'travel') {
    return;
  }
  const location = getCurrentCampaignLocation();
  const encounterConfig = availableTravelEncountersForCurrentLocation().find((entry) => entry.id === encounterId) ?? null;
  if (!location || !encounterConfig) {
    return;
  }
  closeReplay();
  state.campaignRun.checkpointInventory = { ...state.campaignRun.inventory };
  state.campaignRun.checkpointGold = Number(state.campaignRun.gold ?? 0);
  state.campaignRun.checkpointRoster = cloneCampaignRoster(state.campaignRun.roster);
  state.campaignRun.checkpointEquipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.equipmentLoadout);
  state.campaignRun.battleContext = { type: 'travel', encounterId: encounterConfig.id, locationId: location.id };
  state.campaignRun.phase = 'battle';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.lastBattleWinner = null;
  state.campaignRun.lastResultSummary = `Стычка: ${encounterConfig.label}`;
  pushCampaignJournalEntry(`Началась полевая стычка: ${encounterConfig.label} (${location.title}).`);
  state.battle = createCampaignTravelEncounterBattle(encounterConfig);
  state.activeTab = 'campaign';
  saveCampaignStateToLocalStorage();
  render();
}

function retryCurrentCampaignBattle() {
  if (!campaignRunActive()) {
    return;
  }
  state.campaignRun.inventory = { ...state.campaignRun.checkpointInventory };
  state.campaignRun.gold = Number(state.campaignRun.checkpointGold ?? state.campaignRun.gold ?? 0);
  state.campaignRun.roster = cloneCampaignRoster(state.campaignRun.checkpointRoster);
  state.campaignRun.equipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.checkpointEquipmentLoadout);
  startCampaignBattleForCurrentBeat({ preserveCheckpoint: true });
}

function finalizeCampaignBattleOutcome() {
  if (!campaignRunActive() || state.campaignRun.phase !== 'battle' || !state.battle) {
    return false;
  }

  if (!isBattleOver(state.battle.players, state.battle.enemies)) {
    return false;
  }

  const beat = getCurrentCampaignBeat();
  if (!beat) {
    return false;
  }
  const meta = storyBeatImplementationMeta(beat);
  const winner = battleWinner(state.battle.players, state.battle.enemies);
  const battleContext = state.campaignRun.battleContext ?? { type: 'story', beatId: beat.id };
  state.campaignRun.lastBattleWinner = winner;
  state.activeTab = 'campaign';

  if (battleContext.type === 'travel') {
    const encounterConfig = (WORLD_TRAVEL_ENCOUNTERS[battleContext.locationId] ?? []).find((entry) => entry.id === battleContext.encounterId) ?? null;
    if (winner === 'players') {
      updateCampaignRosterFromBattlePlayers(state.battle.players);
      state.campaignRun.pendingReward = encounterConfig?.rewards ?? { gold: 0, ...createBaseInventory() };
      state.campaignRun.inventory = { ...state.battle.inventory };
      grantCampaignRewards(state.campaignRun.pendingReward, { sourceLabel: `Полевая победа: ${encounterConfig?.label ?? 'encounter'}` });
      state.inventoryOverrides = { ...state.campaignRun.inventory };
      if (!state.campaignRun.clearedTravelEncounterIds.includes(battleContext.encounterId)) {
        state.campaignRun.clearedTravelEncounterIds.push(battleContext.encounterId);
      }
      state.campaignRun.phase = 'travel-victory';
      state.campaignRun.sceneIndex = 0;
      state.campaignRun.lastResultSummary = `Победа в стычке ${encounterConfig?.label ?? ''}`;
      pushCampaignJournalEntry(`Полевая победа: ${encounterConfig?.label ?? 'encounter'}. Возвращение к исследованию локации.`);
    } else {
      state.campaignRun.pendingReward = { gold: 0, ...createBaseInventory() };
      state.campaignRun.inventory = { ...state.campaignRun.checkpointInventory };
      state.campaignRun.gold = Number(state.campaignRun.checkpointGold ?? state.campaignRun.gold ?? 0);
      state.campaignRun.roster = cloneCampaignRoster(state.campaignRun.checkpointRoster);
      state.campaignRun.equipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.checkpointEquipmentLoadout);
      state.inventoryOverrides = { ...state.campaignRun.inventory };
      state.campaignRun.phase = 'travel-defeat';
      state.campaignRun.sceneIndex = 0;
      state.campaignRun.lastResultSummary = `Поражение в стычке ${encounterConfig?.label ?? ''}`;
      pushCampaignJournalEntry(`Полевая неудача: ${encounterConfig?.label ?? 'encounter'}. Партия откатилась к checkpoint-у локации.`);
    }
    state.campaignRun.battleContext = null;
    writeStateToForms();
    saveCampaignStateToLocalStorage();
    return true;
  }

  if (winner === 'players') {
    if (!state.campaignRun.completedBeatIds.includes(beat.id)) {
      state.campaignRun.completedBeatIds.push(beat.id);
    }
    if (!state.campaignProgress.completedBeatIds.includes(beat.id)) {
      state.campaignProgress.completedBeatIds.push(beat.id);
    }
    state.campaignProgress.lastStartedBeatId = beat.id;
    const reward = campaignBeatReward(beat, meta);
    const binding = getCurrentCampaignWorldBinding();
    updateCampaignRosterFromBattlePlayers(state.battle.players);
    state.campaignRun.pendingReward = reward;
    state.campaignRun.inventory = { ...state.battle.inventory };
    grantCampaignRewards(reward, { sourceLabel: `Сюжетная победа: ${beat.title}` });
    state.inventoryOverrides = { ...state.campaignRun.inventory };
    if (binding?.endLocationId) {
      setCampaignCurrentLocation(binding.endLocationId, { note: `После события партия возвращается в ${getWorldLocation(binding.endLocationId)?.title ?? binding.endLocationId}.`, silent: true });
    }
    state.campaignRun.phase = 'victory';
    state.campaignRun.sceneIndex = 0;
    state.campaignRun.lastResultSummary = `Победа в ${beat.title}`;
    state.campaignRun.autoSceneAdvanceReady = true;
    pushCampaignJournalEntry(`Победа: ${beat.title}. Награда: ${campaignRewardDescription(reward)}. Текущий запас: ${campaignInventoryString()}. Золото: ${campaignGoldString()}.`);
  } else {
    state.campaignRun.pendingReward = { gold: 0, ...createBaseInventory() };
    state.campaignRun.inventory = { ...state.campaignRun.checkpointInventory };
    state.campaignRun.gold = Number(state.campaignRun.checkpointGold ?? state.campaignRun.gold ?? 0);
    state.campaignRun.roster = cloneCampaignRoster(state.campaignRun.checkpointRoster);
    state.campaignRun.equipmentLoadout = cloneCampaignEquipmentLoadout(state.campaignRun.checkpointEquipmentLoadout);
    state.inventoryOverrides = { ...state.campaignRun.inventory };
    state.campaignRun.phase = 'defeat';
    state.campaignRun.sceneIndex = 0;
    state.campaignRun.lastResultSummary = `Поражение в ${beat.title}`;
    state.campaignRun.autoSceneAdvanceReady = true;
    pushCampaignJournalEntry(`Поражение: ${beat.title}. Запас восстановлен к checkpoint-у (${campaignInventoryString(state.campaignRun.inventory)}).`);
  }

  state.campaignRun.battleContext = null;
  writeStateToForms();
  saveCampaignStateToLocalStorage();
  return true;
}

function continueAfterCampaignBattle() {
  if (!campaignRunActive()) {
    return;
  }

  if (state.campaignRun.phase === 'travel-victory' || state.campaignRun.phase === 'travel-defeat') {
    state.campaignRun.phase = 'travel';
    state.campaignRun.sceneIndex = 0;
    saveCampaignStateToLocalStorage();
    render();
    return;
  }

  if (state.campaignRun.phase === 'victory' || state.campaignRun.phase === 'placeholder-result') {
    advanceCampaignToNextBeatOrEnding();
    render();
    return;
  }

  if (state.campaignRun.phase === 'finished') {
    startNewCampaignRun();
  }
}

function campaignLocationTypeLabel(location) {
  const labels = {
    town: 'город',
    field: 'дорога',
    dungeon: 'данж',
    interior: 'интерьер',
    special: 'сюжетная точка',
  };
  return labels[location?.type] ?? 'локация';
}

function entryAllowedForCurrentBeat(entry) {
  const beatId = state.campaignRun.currentBeatId ?? null;
  if (!entry) {
    return false;
  }
  if (Array.isArray(entry.allowedBeatIds) && entry.allowedBeatIds.length > 0 && !entry.allowedBeatIds.includes(beatId)) {
    return false;
  }
  if (Array.isArray(entry.blockedBeatIds) && entry.blockedBeatIds.includes(beatId)) {
    return false;
  }
  return true;
}

function availableWorldEventsForCurrentLocation() {
  const locationId = state.campaignRun.currentLocationId;
  const events = [
    ...(WORLD_LOCATION_EVENTS[locationId] ?? []),
    ...(ADDITIONAL_WORLD_EVENTS_BY_LOCATION[locationId] ?? []),
  ];
  return events.filter((entry) => !state.campaignRun.seenWorldEventIds.includes(entry.id))
    .filter((entry) => entryAllowedForCurrentBeat(entry))
    .filter((entry) => (entry.requiresFlags ?? []).every((flagId) => hasQuestFlag(flagId)));
}

function availableTreasuresForCurrentLocation() {
  const locationId = state.campaignRun.currentLocationId;
  const treasures = WORLD_LOCATION_TREASURES[locationId] ?? [];
  return treasures.filter((entry) => !state.campaignRun.openedTreasureIds?.includes(entry.id))
    .filter((entry) => entryAllowedForCurrentBeat(entry))
    .filter((entry) => (entry.requiresFlags ?? []).every((flagId) => hasQuestFlag(flagId)));
}

function availableTravelEncountersForCurrentLocation() {
  const locationId = state.campaignRun.currentLocationId;
  const encounters = WORLD_TRAVEL_ENCOUNTERS[locationId] ?? [];
  return encounters.filter((entry) => !state.campaignRun.clearedTravelEncounterIds?.includes(entry.id))
    .filter((entry) => entryAllowedForCurrentBeat(entry))
    .filter((entry) => (entry.requiresFlags ?? []).every((flagId) => hasQuestFlag(flagId)));
}

function grantCampaignRewards(rewards = {}, { sourceLabel = 'Награда' } = {}) {
  const normalized = {
    gold: Number(rewards.gold ?? 0),
    experience: Number(rewards.experience ?? 0),
    skillCoins: Number(rewards.skillCoins ?? 0),
    magicCoins: Number(rewards.magicCoins ?? 0),
    ...createBaseInventory(rewards),
    equipmentIds: Array.isArray(rewards.equipmentIds) ? rewards.equipmentIds : [],
    setFlags: Array.isArray(rewards.setFlags) ? rewards.setFlags : [],
    eggIds: Array.isArray(rewards.eggIds) ? rewards.eggIds : [],
  };

  state.campaignRun.gold += normalized.gold;
  state.campaignRun.experience += normalized.experience;
  state.campaignRun.skillCoins += normalized.skillCoins;
  state.campaignRun.magicCoins += normalized.magicCoins;
  state.campaignRun.inventory = mergeInventory(state.campaignRun.inventory, normalized);

  const unlockedLevels = [];
  while (state.campaignRun.experience >= xpThresholdForLevel(state.campaignRun.partyLevel)) {
    state.campaignRun.experience -= xpThresholdForLevel(state.campaignRun.partyLevel);
    state.campaignRun.partyLevel += 1;
    unlockedLevels.push(state.campaignRun.partyLevel);
  }
  if (unlockedLevels.length > 0) {
    fullyRestoreCampaignRoster(false);
  }

  const newFlagsApplied = applyQuestFlags(normalized.setFlags);

  for (const equipmentId of normalized.equipmentIds) {
    if (!state.campaignRun.purchasedUpgradeIds.includes(equipmentId)) {
      state.campaignRun.purchasedUpgradeIds.push(equipmentId);
      const item = EQUIPMENT_CATALOG.find((entry) => entry.id === equipmentId);
      if (item) {
        applyCampaignEquipmentUpgradeToState(item);
      }
    }
  }
  for (const eggId of normalized.eggIds) {
    if (!state.campaignRun.ownedEggIds.includes(eggId)) {
      state.campaignRun.ownedEggIds.push(eggId);
    }
  }
  writeStateToForms();

  const hasReward = normalized.gold
    || normalized.experience
    || normalized.skillCoins
    || normalized.magicCoins
    || inventoryEntries(normalized).length > 0
    || normalized.equipmentIds.length
    || normalized.setFlags.length
    || normalized.eggIds.length;
  if (hasReward) {
    const extra = [];
    if (normalized.equipmentIds.length) {
      extra.push(`экипировка ${normalized.equipmentIds.map((id) => EQUIPMENT_CATALOG.find((entry) => entry.id === id)?.label ?? id).join(', ')}`);
    }
    if (normalized.eggIds.length) {
      extra.push(`Mana Eggs: ${normalized.eggIds.map((id) => MANA_EGGS.find((egg) => egg.id === id)?.label ?? id).join(', ')}`);
    }
    if (normalized.setFlags.length) {
      extra.push(`flags ${normalized.setFlags.map(questFlagLabel).join(', ')}`);
    }
    if (unlockedLevels.length) {
      extra.push(`level up до ${state.campaignRun.partyLevel}`);
    }
    pushCampaignJournalEntry(`${sourceLabel}: ${campaignRewardDescription(normalized)}${extra.length ? `, ${extra.join(', ')}` : ''}.`);
  }
  if (newFlagsApplied && normalized.setFlags.length) {
    state.campaignRun.travelMessage = `${sourceLabel}: обновлены quest flags — ${normalized.setFlags.map(questFlagLabel).join(', ')}.`;
  }
  return normalized;
}

function openCampaignTreasure(treasureId) {
  const location = getCurrentCampaignLocation();
  const treasure = availableTreasuresForCurrentLocation().find((entry) => entry.id === treasureId) ?? null;
  if (!location || !treasure) {
    return;
  }
  state.campaignRun.openedTreasureIds.push(treasure.id);
  const reward = grantCampaignRewards(treasure.rewards, { sourceLabel: `Сундук ${treasure.label}` });
  state.campaignRun.travelMessage = `${treasure.label}: ${treasure.description}. Получено ${campaignRewardDescription(reward)}${reward.equipmentIds.length ? ` и ${reward.equipmentIds.map((id) => EQUIPMENT_CATALOG.find((entry) => entry.id === id)?.label ?? id).join(', ')}` : ''}.`;
  saveCampaignStateToLocalStorage();
  render();
}

function triggerWorldEvent(eventId) {
  const location = getCurrentCampaignLocation();
  const event = availableWorldEventsForCurrentLocation().find((entry) => entry.id === eventId) ?? null;
  if (!location || !event) {
    return;
  }
  for (const [itemKey, amount] of Object.entries(event.consumeItems ?? {})) {
    if ((state.campaignRun.inventory[itemKey] ?? 0) < amount) {
      state.campaignRun.travelMessage = `Нужен предмет: ${inventoryLabel(itemKey)} (${amount} шт.).`;
      saveCampaignStateToLocalStorage();
      render();
      return;
    }
  }
  for (const [itemKey, amount] of Object.entries(event.consumeItems ?? {})) {
    state.campaignRun.inventory[itemKey] = Math.max(0, (state.campaignRun.inventory[itemKey] ?? 0) - amount);
  }
  state.campaignRun.seenWorldEventIds.push(event.id);
  let rewards = event.rewards ?? { experience: 8, skillCoins: 2, magicCoins: 2, setFlags: event.setFlags ?? [] };
  if (event.minigameArmWrestle) {
    const rounds = 3;
    const wins = Array.from({ length: rounds }, () => Math.random() < 0.55).filter(Boolean).length;
    pushCampaignJournalEntry(`Армрестлинг с Хемблом: ${wins}/${rounds} раундов.`);
    if (wins >= 2) {
      rewards = { ...rewards, equipmentIds: [...(rewards.equipmentIds ?? []), 'ryudo-silver-freeze'] };
      state.campaignRun.travelMessage = `Хембл: «Ну ты и силён!» — ${wins}/3 раундов. Приз — ${EQUIPMENT_CATALOG.find((entry) => entry.id === 'ryudo-silver-freeze')?.label ?? 'Silver Freeze'}!`;
    } else {
      state.campaignRun.travelMessage = `Хембл: «Рука дрогнула!» — ${wins}/3 раундов. Попробуй ещё раз.`;
    }
  }
  const reward = grantCampaignRewards(rewards, { sourceLabel: `World event: ${event.label}` });
  if (event.setFlags?.length) {
    applyQuestFlags(event.setFlags);
  }
  state.campaignRun.travelMessage = `${event.label}: ${event.text}${campaignRewardDescription(reward) !== 'без награды' ? ` Получено ${campaignRewardDescription(reward)}.` : ''}`;
  pushCampaignJournalEntry(`Событие в ${location.title}: ${event.label}.`);
  const followUpScene = nextLocationSceneForCurrentContext();
  if (followUpScene) {
    openCurrentLocationScene(followUpScene);
    render();
    return;
  }
  saveCampaignStateToLocalStorage();
  render();
}

function renderCampaignEventsPanel() {
  if (!elements.campaignEventsSummary) {
    return;
  }

  if (!campaignRunActive()) {
    elements.campaignEventsSummary.textContent = 'После старта кампании тут появятся доступные NPC/world events текущей локации и история уже просмотренных сцен.';
    return;
  }

  const location = getCurrentCampaignLocation();
  const available = availableWorldEventsForCurrentLocation();
  const treasures = availableTreasuresForCurrentLocation();
  const encounters = availableTravelEncountersForCurrentLocation();
  const npcDialogues = availableNpcDialoguesForCurrentLocation();
  const seen = state.campaignRun.seenWorldEventIds.slice(-12);
  const opened = (state.campaignRun.openedTreasureIds ?? []).slice(-12);
  const cleared = (state.campaignRun.clearedTravelEncounterIds ?? []).slice(-12);
  const seenDialogues = (state.campaignRun.seenNpcDialogueIds ?? []).slice(-12);
  elements.campaignEventsSummary.textContent = [
    `Локация: ${location?.title ?? 'n/a'}`,
    `Осталось world events здесь: ${available.length}`,
    `Неоткрытых сундуков: ${treasures.length}`,
    `Неочищенных wandering encounters: ${encounters.length}`,
    `Невыслушанных NPC-диалогов: ${npcDialogues.length}`,
    '',
    'Доступно сейчас:',
    ...(available.length ? available.map((entry) => `- EVENT: ${entry.label}`) : ['- EVENT: none']),
    ...(treasures.length ? treasures.map((entry) => `- TREASURE: ${entry.label}`) : ['- TREASURE: none']),
    ...(encounters.length ? encounters.map((entry) => `- ENCOUNTER: ${entry.label}`) : ['- ENCOUNTER: none']),
    ...(npcDialogues.length ? npcDialogues.map((entry) => `- DIALOGUE: ${entry.label}`) : ['- DIALOGUE: none']),
    '',
    'Уже просмотрено в забеге:',
    ...(seen.length ? seen.map((entry) => `- ${entry}`) : ['- none']),
    '',
    'Открытые сундуки:',
    ...(opened.length ? opened.map((entry) => `- ${entry}`) : ['- none']),
    '',
    'Очищенные encounter-ы:',
    ...(cleared.length ? cleared.map((entry) => `- ${entry}`) : ['- none']),
    '',
    'Прослушанные NPC-диалоги:',
    ...(seenDialogues.length ? seenDialogues.map((entry) => `- ${entry}`) : ['- none']),
  ].join('\n');
}

function renderCampaignGrowthPanel() {
  if (!elements.campaignGrowthSummary || !elements.campaignGrowthActions) {
    return;
  }

  if (!campaignRunActive()) {
    elements.campaignGrowthSummary.textContent = 'После старта кампании здесь появятся уровень партии, EXP, SC/MC и дерево роста через skill books / mana eggs.';
    elements.campaignGrowthActions.innerHTML = '';
    return;
  }

  const unlocked = GROWTH_NODES.filter((node) => (state.campaignRun.growthUnlockIds ?? []).includes(node.id));
  const available = GROWTH_NODES.filter((node) => !(state.campaignRun.growthUnlockIds ?? []).includes(node.id));
  const eggLines = CAMPAIGN_PLAYABLE_UNITS
    .filter((key) => state.campaignRun.eggLoadout?.[key])
    .map((key) => {
      const eggId = state.campaignRun.eggLoadout[key];
      const egg = MANA_EGGS.find((entry) => entry.id === eggId);
      return `- ${PRESETS[key]?.name ?? key}: ${egg?.label ?? eggId} (ур.${campaignEggLevel(key, eggId)})`;
    });

  elements.campaignGrowthSummary.textContent = [
    `Рост: ${campaignGrowthString()}`,
    `Следующий уровень через ${xpThresholdForLevel(state.campaignRun.partyLevel) - state.campaignRun.experience} EXP.`,
    '',
    'Mana Eggs на героях:',
    ...(eggLines.length ? eggLines : ['- нет']),
    `Найдено яиц: ${state.campaignRun.ownedEggIds.length}/${MANA_EGGS.length} (экипировка и прокачка — во вкладке «Меню» → Mana Eggs)`,
    '',
    'Открытые growth nodes:',
    ...(unlocked.length ? unlocked.map((node) => `- ${node.label} [${node.category}]`) : ['- none']),
    '',
    'Доступные для покупки:',
    ...(available.length ? available.map((node) => {
      const rules = GROWTH_NODE_RULES[node.id] ?? {};
      const reqLevel = rules.requiresLevel ? `LV ${rules.requiresLevel}` : 'LV 1';
      const reqNodes = (rules.requiresNodes ?? []).map((nodeId) => GROWTH_NODES.find((entry) => entry.id === nodeId)?.label ?? nodeId).join(', ');
      return `- ${node.label} | SC ${node.costSkill} / MC ${node.costMagic} | req ${reqLevel}${reqNodes ? ` | ${reqNodes}` : ''}`;
    }) : ['- none']),
  ].join('\n');

  elements.campaignGrowthActions.innerHTML = '';
  available.forEach((node) => {
    const button = document.createElement('button');
    const rules = GROWTH_NODE_RULES[node.id] ?? {};
    const lockReason = !canUnlockGrowthNode(node)
      ? `требуется ${rules.requiresLevel ? `LV ${rules.requiresLevel}` : 'ресурс/цепочка'}${(rules.requiresNodes ?? []).length ? ` + ${rules.requiresNodes.map((nodeId) => GROWTH_NODES.find((entry) => entry.id === nodeId)?.label ?? nodeId).join(', ')}` : ''}`
      : `${node.costSkill} SC / ${node.costMagic} MC`;
    button.className = canUnlockGrowthNode(node) ? '' : 'secondary';
    button.disabled = !canUnlockGrowthNode(node);
    button.textContent = `Открыть ${node.label} — ${lockReason}`;
    button.addEventListener('click', () => unlockGrowthNode(node.id));
    elements.campaignGrowthActions.appendChild(button);
  });
}

function renderCampaignQuestPanel() {
  if (!elements.campaignQuestSummary) {
    return;
  }

  if (!campaignRunActive()) {
    elements.campaignQuestSummary.textContent = 'После старта кампании здесь появятся quest flags, обязательные сюжетные маркеры и прогресс по текущей главе.';
    return;
  }

  const beat = getCurrentCampaignBeat();
  const chain = activeQuestChainForBeat(beat?.id ?? '');
  const dungeonChain = activeDungeonStageChain();
  const requiredFlags = objectiveFlagsForBeat(beat?.id ?? '');
  const nextLocationScene = nextLocationSceneForCurrentContext();
  const unlockedFlags = Object.entries(state.campaignRun.questFlags ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([flagId]) => flagId);
  const missingFlags = missingObjectiveFlagsForCurrentBeat();
  elements.campaignQuestSummary.textContent = [
    `Текущий бит: ${beat ? campaignBeatLabel(beat) : 'n/a'}`,
    `Собрано quest flags: ${unlockedFlags.length}`,
    `Активная цепочка: ${chain?.title ?? 'none'}`,
    `Данжевый прогресс: ${dungeonChain?.title ?? 'none'}`,
    '',
    'Шаги сюжетной цепочки:',
    ...(chain?.steps?.length ? chain.steps.map((step) => `- ${hasQuestFlag(step.flagId) ? '✓' : '·'} ${step.label} @ ${getWorldLocation(step.locationId)?.title ?? step.locationId}`) : ['- none']),
    '',
    'Стадии текущего данжа/маршрута:',
    ...(dungeonChain?.steps?.length ? dungeonChain.steps.map((step) => `- ${hasQuestFlag(step.flagId) ? '✓' : '·'} ${step.label}`) : ['- none']),
    '',
    'Ближайшая room-scene:',
    ...(nextLocationScene ? [`- ${nextLocationScene.title} @ ${getCurrentCampaignLocation()?.title ?? 'n/a'}`] : ['- none']),
    '',
    'Обязательные флаги для текущего шага:',
    ...(requiredFlags.length ? requiredFlags.map((flagId) => `- ${hasQuestFlag(flagId) ? '✓' : '·'} ${questFlagLabel(flagId)}`) : ['- none']),
    '',
    'Не хватает до сюжетной цели:',
    ...(missingFlags.length ? missingFlags.map((flagId) => `- ${questFlagLabel(flagId)}`) : ['- ничего, можно завершать objective point']),
    '',
    'Все флаги забега:',
    ...(unlockedFlags.length ? unlockedFlags.map((flagId) => `- ${questFlagLabel(flagId)}`) : ['- none']),
  ].join('\n');
}

function renderCampaignAuditPanel() {
  if (!elements.campaignAuditSummary || !elements.campaignAuditBreakdown) {
    return;
  }

  const audit = buildStoryAuditSnapshot();
  elements.campaignAuditSummary.textContent = [
    'Аудит реализации сюжета относительно оригинальной Grandia II',
    audit.methodology.note,
    '',
    `Общая оценка реализации: ${audit.overallPercent}%`,
    `Средняя плотность реализации по 19 сюжетным битам: ${audit.beatCoveragePercent}%`,
    `Сильных битов (>= 80%): ${audit.doneBeats}`,
    `Промежуточных битов (40-79.9%): ${audit.partialBeats}`,
    `Слабых битов (< 40%): ${audit.lowBeats}`,
    '',
    'Категории:',
    ...audit.categories.map((category) => `- ${category.label}: ${category.percent}% (done ${category.doneCount}, partial ${category.partialCount}, todo ${category.todoCount})`),
    '',
    'Арки:',
    ...audit.arcBreakdown.map((arc) => `- ${arc.label}: ${arc.percent}%`),
  ].join('\n');

  const sub100Beats = audit.beats.filter((beat) => beat.percent < 100);
  const sub100Categories = audit.categories.filter((category) => category.percent < 100);
  const concreteGoals = sub100Categories.length > 0
    ? [
        `1) Дожать категории ниже 100%: ${sub100Categories.map((category) => `${category.label} ${category.percent}%`).join(', ')}.`,
        `2) Довести биты ниже 100%: ${sub100Beats.map((beat) => `${beat.label} ${beat.percent}%`).join(', ') || 'нет'}.`,
        '3) Продолжать заменять слабые room-to-room переходы на auto-trigger local scenes и repeat-state интерьеры.',
        '4) Сохранять оригинальный pacing: inn → room → dialogue → route unlock → setpiece/battle.',
        '5) После полного story parity фокус смещается на полировку текста, визуальные штрихи и ещё более bespoke late-game подачу.',
      ]
    : [
        '1) Все ключевые story-категории уже доведены до 100% по текущему аудиту.',
        `2) Неидеальные биты для следующей художественной полировки: ${sub100Beats.map((beat) => `${beat.label} ${beat.percent}%`).join(', ') || 'нет'}.`,
        '3) Продолжать насыщать мир необязательными quiet/NPC beats без ломки основного оригинального маршрута.',
        '4) Дальше усиливать late-game rooms, визуальный масштаб setpiece-сцен и текстовую режиссуру.',
        '5) Удерживать эту parity-планку при любых следующих правках campaign/world/battle layers.',
      ];

  const remainingSystemTails = audit.categories
    .filter((category) => category.percent < 100)
    .flatMap((category) => category.items.filter((item) => item.status !== 'done').map((item) => `- ${category.label} / ${item.label}: ${item.remaining}`));

  elements.campaignAuditBreakdown.textContent = [
    'Beat-by-beat breakdown:',
    ...audit.beats.map((beat) => `- ${beat.label}: ${beat.percent}% | сделано: ${beat.done} | осталось: ${beat.remaining}`),
    '',
    'Arc breakdown:',
    ...audit.arcBreakdown.map((arc) => `- ${arc.label}: ${arc.percent}% | beats: ${arc.beats.map((beat) => `${beat.label} ${beat.percent}%`).join('; ')}`),
    '',
    'Ближайшие конкретные цели:',
    ...concreteGoals.map((goal) => `- ${goal}`),
    '',
    'Самые большие хвосты по системе:',
    ...(remainingSystemTails.length > 0
      ? remainingSystemTails
      : ['- Критических системных хвостов больше нет; дальнейший рост — художественный polish.']),
  ].join('\n');
}

function renderCampaignBestiaryPanel() {
  if (!elements.campaignBestiarySummary) {
    return;
  }

  const enemyEntries = Object.entries(PRESETS).filter(([, preset]) => preset.team === 'enemies');
  const groups = buildBestiaryGroupSnapshot(PRESETS);
  elements.campaignBestiarySummary.textContent = [
    `Enemy presets in engine: ${enemyEntries.length}`,
    `Bestiary groups: ${groups.length}`,
    '',
    ...groups.flatMap((group) => [
      `${group.label}: ${group.resolvedEnemies.length}/${group.enemyKeys.length}`,
      `  Локации: ${group.locations.join(', ')}`,
      `  Враги: ${group.resolvedEnemies.map((entry) => entry.preset.name).join(', ')}`,
      group.missingKeys.length ? `  Missing: ${group.missingKeys.join(', ')}` : '  Missing: none',
      '',
    ]),
  ].join('\n');
}

function renderCampaignSkillbookPanel() {
  if (!elements.campaignSkillbookSummary) {
    return;
  }

  const partyKeys = CAMPAIGN_PLAYABLE_UNITS;
  const lines = [
    'Текущий party handbook / menu parity layer',
    `Боевых actions в движке: ${Object.keys(ACTION_LIBRARY).length}`,
    '',
  ];

  for (const key of partyKeys) {
    const preset = PRESETS[key];
    const groups = groupedActionDefinitions(loadoutActionIds(preset.loadout));
    lines.push(`${preset.name}:`);
    if (groups.length === 0) {
      lines.push('- no mapped actions');
      lines.push('');
      continue;
    }
    for (const group of groups) {
      lines.push(`- ${group.label}: ${group.definitions.map((definition) => definition.label).join(', ')}`);
    }
    lines.push('');
  }

  elements.campaignSkillbookSummary.textContent = lines.join('\n');
}

function renderCampaignItemPanel() {
  if (!elements.campaignItemSummary) {
    return;
  }

  const location = getCurrentCampaignLocation();
  const shopEntries = location ? getShopEntriesForLocation(location.id) : [];
  const lines = [
    `Inventory item catalog: ${ITEM_CATALOG.length}`,
    `Shop stock in current location: ${shopEntries.length}`,
    `Current bag: ${campaignInventoryString()}`,
    '',
    'Known consumables:',
    ...ITEM_CATALOG.map((item) => `- ${item.label}: ${item.description}`),
    '',
    `Shop entries @ ${location?.title ?? 'n/a'}:`,
    ...(shopEntries.length ? shopEntries.map((entry) => `- ${entry.label} (${entry.price} G)`) : ['- none']),
  ];

  elements.campaignItemSummary.textContent = lines.join('\n');
}

function renderCampaignScriptPanel() {
  if (!elements.campaignScriptSummary || !elements.campaignDialogueDetail) {
    return;
  }

  const snapshot = buildCampaignScriptAuditSnapshot();
  const currentBeatId = getCurrentCampaignBeat()?.id ?? null;
  const currentBeatAudit = snapshot.beats.find((entry) => entry.beatId === currentBeatId) ?? null;

  elements.campaignScriptSummary.textContent = [
    `Beat script pages: ${snapshot.totalPages}`,
    `Dialogue pages: ${snapshot.totalDialoguePages}`,
    `Narration pages: ${snapshot.totalNarrationPages}`,
    `Result pages: ${snapshot.totalResultPages}`,
    '',
    'By beat:',
    ...snapshot.beats.map((entry) => `- ${entry.beatId}: total ${entry.totalPages}, dlg ${entry.dialogueCount}, nar ${entry.narrationCount}, res ${entry.resultCount}`),
  ].join('\n');

  if (!currentBeatAudit) {
    elements.campaignDialogueDetail.textContent = 'Текущий бит не выбран.';
    return;
  }

  elements.campaignDialogueDetail.textContent = [
    `Beat: ${currentBeatAudit.beatId}`,
    `Opening pages: ${currentBeatAudit.openingCount}`,
    `Victory pages: ${currentBeatAudit.victoryCount}`,
    `Defeat pages: ${currentBeatAudit.defeatCount}`,
    `Dialogue pages: ${currentBeatAudit.dialogueCount}`,
    `Narration pages: ${currentBeatAudit.narrationCount}`,
    `Result pages: ${currentBeatAudit.resultCount}`,
    `Total pages: ${currentBeatAudit.totalPages}`,
  ].join('\n');
}

function renderCampaignOriginalFlowPanel() {
  if (!elements.campaignOriginalFlowSummary || !elements.campaignFidelityGoals) {
    return;
  }

  const beat = getCurrentCampaignBeat();
  const flow = getOriginalFlowForBeat(beat?.id ?? null);
  if (!flow) {
    elements.campaignOriginalFlowSummary.textContent = 'Для этого бита ещё не заполнен original flow blueprint.';
    elements.campaignFidelityGoals.textContent = 'Нет конкретных fidelity-задач.';
    return;
  }

  const chain = activeQuestChainForBeat(beat?.id ?? '');
  const stageChain = activeDungeonStageChain();
  elements.campaignOriginalFlowSummary.textContent = [
    `${flow.chapter} / ${flow.title}`,
    '',
    'Оригинальный маршрут:',
    ...flow.originalRoute.map((entry, index) => `${index + 1}. ${entry}`),
    '',
    'Ключевые town sublocations:',
    ...(flow.townSubLocations.length ? flow.townSubLocations.map((entry) => `- ${entry}`) : ['- none']),
    '',
    'Ключевые dungeon sub-stages:',
    ...(flow.dungeonSubStages.length ? flow.dungeonSubStages.map((entry) => `- ${entry}`) : ['- none']),
    '',
    `Текущая campaign chain: ${chain?.title ?? 'none'}`,
    `Текущая dungeon chain: ${stageChain?.title ?? 'none'}`,
  ].join('\n');

  elements.campaignFidelityGoals.textContent = [
    'Прицельные задачи на приближение к оригиналу:',
    ...flow.fidelityGoals.map((entry) => `- ${entry}`),
    '',
    'Ближайший конкретный шаг сейчас:',
    nextQuestChainStepForBeat(beat?.id ?? null)
      ? `- ${nextQuestChainStepForBeat(beat?.id ?? null).label} @ ${getWorldLocation(nextQuestChainStepForBeat(beat?.id ?? null).locationId)?.title ?? nextQuestChainStepForBeat(beat?.id ?? null).locationId}`
      : '- chain почти закрыта',
  ].join('\n');
}

function inspectCurrentCampaignLocation() {
  const location = getCurrentCampaignLocation();
  if (!location) {
    return;
  }
  state.campaignRun.travelMessage = `${location.title}: ${resolvedLocationDescription(location)}`;
  pushCampaignJournalEntry(`Осмотр локации: ${location.title}.`);
  saveCampaignStateToLocalStorage();
  render();
}

function restAtCurrentCampaignLocation() {
  const location = getCurrentCampaignLocation();
  if (!location) {
    return;
  }
  fullyRestoreCampaignRoster(true);
  state.campaignRun.travelMessage = `Партия переводит дух в точке ${location.title}. HP/MP/SP активного состава полностью восстановлены.`;
  state.campaignRun.lastResultSummary = `Отдых / запись: ${location.title}`;
  pushCampaignJournalEntry(`Отдых и запись: ${location.title}. Состав восстановлен.`);
  saveCampaignStateToLocalStorage();
  render();
}

function buyCampaignShopEntry(entryId) {
  const location = getCurrentCampaignLocation();
  const entry = getShopEntriesForLocation(location?.id ?? null).find((candidate) => candidate.id === entryId) ?? null;
  if (!entry || !location) {
    return;
  }
  if (state.campaignRun.gold < entry.price) {
    state.campaignRun.travelMessage = `Недостаточно золота для покупки ${entry.label}. Нужно ${entry.price} G.`;
    render();
    return;
  }

  state.campaignRun.gold -= entry.price;
  if (entry.bundle) {
    state.campaignRun.inventory = mergeInventory(state.campaignRun.inventory, entry.bundle);
  } else if (entry.key) {
    state.campaignRun.inventory[entry.key] = Number(state.campaignRun.inventory[entry.key] ?? 0) + Number(entry.amount ?? 1);
  }
  state.inventoryOverrides = { ...state.campaignRun.inventory };
  state.campaignRun.travelMessage = `Покупка в ${location.title}: ${entry.label} за ${entry.price} G.`;
  pushCampaignJournalEntry(`Покупка: ${entry.label} (${entry.price} G) в ${location.title}. Остаток: ${campaignGoldString()}.`);
  writeStateToForms();
  saveCampaignStateToLocalStorage();
  render();
}

function queueCampaignOverworldTravel(fromLocationId, toLocationId) {
  const fromLocation = getWorldLocation(fromLocationId);
  const toLocation = getWorldLocation(toLocationId);
  if (!fromLocation || !toLocation) {
    return false;
  }
  state.campaignRun.pendingTravelFromLocationId = fromLocation.id;
  state.campaignRun.pendingTravelToLocationId = toLocation.id;
  state.campaignRun.phase = 'overworld';
  state.campaignRun.sceneIndex = 0;
  state.campaignRun.travelMessage = `Маршрут между регионами: ${fromLocation.title} → ${toLocation.title}.`;
  pushCampaignJournalEntry(`Overworld: ${fromLocation.title} → ${toLocation.title}.`);
  saveCampaignStateToLocalStorage();
  return true;
}

function completeCampaignOverworldTravel() {
  const toLocation = getWorldLocation(state.campaignRun.pendingTravelToLocationId ?? null);
  if (!toLocation) {
    state.campaignRun.phase = 'travel';
    return;
  }
  setCampaignCurrentLocation(toLocation.id, { note: `Партия прибывает в ${toLocation.title} после перехода между регионами.` });
  state.campaignRun.pendingTravelFromLocationId = null;
  state.campaignRun.pendingTravelToLocationId = null;
  state.campaignRun.phase = 'travel';
  const locationScene = nextLocationSceneForCurrentContext();
  if (locationScene) {
    openCurrentLocationScene(locationScene);
    return;
  }
  if (campaignTravelObjectiveReady()) {
    pushCampaignJournalEntry(`Сюжетная цель достигнута: ${toLocation.title}.`);
    state.campaignRun.travelMessage = `Точка сюжета достигнута: ${toLocation.title}. Можно запускать локальную сцену или событие текущего бита.`;
  }
  saveCampaignStateToLocalStorage();
}

function travelToCampaignLocation(locationId) {
  const beat = getCurrentCampaignBeat();
  const currentLocation = getCurrentCampaignLocation();
  if (!beat || !currentLocation) {
    return;
  }

  const nextLocation = getWorldLocation(locationId);
  const allowed = campaignVisibleExitsForBeat(currentLocation.id, beat.id).some((location) => location.id === locationId);
  if (!nextLocation || !allowed) {
    state.debugOutput = `Переход в ${locationId} сейчас недоступен.`;
    render();
    return;
  }

  if (currentLocation.region !== nextLocation.region && currentLocation.type !== 'interior' && nextLocation.type !== 'interior') {
    queueCampaignOverworldTravel(currentLocation.id, nextLocation.id);
    render();
    return;
  }

  setCampaignCurrentLocation(locationId, { note: `Партия переместилась в ${nextLocation.title}.` });
  const locationScene = nextLocationSceneForCurrentContext();
  if (locationScene) {
    openCurrentLocationScene(locationScene);
    render();
    return;
  }
  if (campaignTravelObjectiveReady()) {
    pushCampaignJournalEntry(`Сюжетная цель достигнута: ${nextLocation.title}.`);
    state.campaignRun.travelMessage = `Точка сюжета достигнута: ${nextLocation.title}. Можно запускать локальную сцену или событие текущего бита.`;
  }
  saveCampaignStateToLocalStorage();
  render();
}

function renderCampaignTravelControls() {
  if (!elements.campaignLocationActions || !elements.campaignExitButtons || !elements.campaignLocationTags) {
    return;
  }

  elements.campaignLocationActions.innerHTML = '';
  elements.campaignExitButtons.innerHTML = '';
  elements.campaignLocationTags.innerHTML = '';

  if (!campaignRunActive() || state.campaignRun.phase !== 'travel') {
    return;
  }

  const beat = getCurrentCampaignBeat();
  const location = getCurrentCampaignLocation();
  if (!beat || !location) {
    return;
  }

  for (const facility of resolvedFacilitiesForLocation(location, beat.id)) {
    const tag = document.createElement('span');
    tag.textContent = facility;
    elements.campaignLocationTags.appendChild(tag);
  }
  for (const stateTag of resolvedLocationTags(location, beat.id)) {
    const tag = document.createElement('span');
    tag.textContent = stateTag;
    elements.campaignLocationTags.appendChild(tag);
  }

  const makeActionButton = (label, onClick, description = null) => {
    const button = document.createElement('button');
    button.className = 'secondary';
    button.textContent = description ? `${label} — ${description}` : label;
    button.addEventListener('click', onClick);
    elements.campaignLocationActions.appendChild(button);
  };

  makeActionButton('Осмотреться', inspectCurrentCampaignLocation, campaignLocationTypeLabel(location));

  const facilities = resolvedFacilitiesForLocation(location, beat.id);
  if (facilities.some((facility) => ['inn', 'save-point', 'camp'].includes(facility))) {
    makeActionButton('Отдохнуть / сохранить', restAtCurrentCampaignLocation, 'безопасная точка');
  }

  if (facilities.includes('shop')) {
    for (const entry of getShopEntriesForLocation(location.id)) {
      makeActionButton(`Купить ${entry.label}`, () => buyCampaignShopEntry(entry.id), `${entry.price} G`);
    }
    for (const upgrade of campaignEquipmentForLocation(location.id)) {
      const owned = state.campaignRun.purchasedUpgradeIds.includes(upgrade.id);
      makeActionButton(
        owned ? `${upgrade.label} (куплено)` : `Купить ${upgrade.label}`,
        () => buyCampaignEquipmentUpgrade(upgrade.id),
        owned ? 'предмет в инвентаре/слоте' : `${upgrade.price} G`,
      );
    }
  }

  for (const treasure of availableTreasuresForCurrentLocation()) {
    makeActionButton(`Открыть ${treasure.label}`, () => openCampaignTreasure(treasure.id), 'сундук / лут');
  }

  for (const encounter of availableTravelEncountersForCurrentLocation()) {
    makeActionButton(`Стычка: ${encounter.label}`, () => startCampaignTravelEncounter(encounter.id), 'бродячие монстры');
  }

  if (nextLocationSceneForCurrentContext()) {
    makeActionButton(`Открыть сцену: ${nextLocationSceneForCurrentContext().title}`, () => openCurrentLocationScene(nextLocationSceneForCurrentContext()), 'локальная сцена');
  }

  for (const event of availableWorldEventsForCurrentLocation()) {
    makeActionButton(event.label, () => triggerWorldEvent(event.id), 'сюжет / NPC');
  }

  for (const dialogue of availableNpcDialoguesForCurrentLocation()) {
    makeActionButton(`Поговорить: ${dialogue.label}`, () => openNpcDialogue(dialogue.id), 'NPC-диалог');
  }

  const exits = campaignVisibleExitsForBeat(location.id, beat.id);
  exits.forEach((exitLocation) => {
    const button = document.createElement('button');
    button.textContent = `Идти в ${exitLocation.title}`;
    button.addEventListener('click', () => travelToCampaignLocation(exitLocation.id));
    elements.campaignExitButtons.appendChild(button);
  });
}

function startCurrentStoryBeatBattle() {
  const beat = getCurrentStoryBeat();
  if (!beat) {
    return;
  }

  const meta = storyBeatImplementationMeta(beat);
  if (meta.kind !== 'battle') {
    state.debugOutput = `Story beat ${beat.id} is not implemented as a battle yet. Placeholder note shown in campaign panel.`;
    render();
    return;
  }

  state.campaignProgress.lastStartedBeatId = beat.id;
  saveCampaignStateToLocalStorage();
  applyStoryBeat(beat, { startBattle: true });
  state.activeTab = 'campaign';
  render();
}

function continueCampaignFlow() {
  const beat = getCurrentStoryBeat();
  if (!beat) {
    return;
  }

  const meta = storyBeatImplementationMeta(beat);
  if (isBeatCompleted(beat.id)) {
    stepCampaignBeat(1);
    return;
  }

  if (meta.kind === 'battle') {
    startCurrentStoryBeatBattle();
    return;
  }

  state.campaignProgress.lastStartedBeatId = beat.id;
  saveCampaignStateToLocalStorage();
  state.debugOutput = `Placeholder scene: ${beat.title}. Next scripted battle for this beat is not implemented yet.`;
  render();
}

function renderCampaignSceneBody(page) {
  if (!elements.campaignSceneBody) {
    return;
  }

  elements.campaignSceneBody.innerHTML = '';
  const paragraphs = Array.isArray(page?.text) ? page.text : page?.text ? [page.text] : [];

  if (!page) {
    const empty = document.createElement('p');
    empty.className = 'scene-paragraph';
    empty.textContent = 'Запусти новую кампанию или загрузи сохранение, чтобы открыть сюжетную сцену.';
    elements.campaignSceneBody.appendChild(empty);
    return;
  }

  paragraphs.forEach((entry) => {
    const block = document.createElement('div');
    block.className = `scene-paragraph ${page.kind === 'dialogue' ? 'scene-dialogue' : ''} ${page.kind === 'result' ? 'scene-result' : ''} ${page.kind === 'placeholder' ? 'scene-note' : ''}`.trim();
    if (page.speaker) {
      const speaker = document.createElement('span');
      speaker.className = 'scene-speaker';
      speaker.textContent = page.speaker;
      block.appendChild(speaker);
    }
    const text = document.createElement('p');
    text.textContent = entry;
    block.appendChild(text);
    elements.campaignSceneBody.appendChild(block);
  });
}

function renderCampaignPanel() {
  const arc = getCurrentStoryArc();
  const beat = getCurrentStoryBeat();
  if (!elements.campaignInfo) {
    return;
  }

  if (!state.storyData) {
    elements.campaignInfo.textContent = state.storyLoadError
      ? `Story data load failed: ${state.storyLoadError}`
      : 'Loading story data…';
    return;
  }

  refreshStorySelectors();
  syncCampaignSelectorsToState();

  if (!arc || !beat) {
    elements.campaignInfo.textContent = 'No story beats found.';
    return;
  }

  const missing = storyBeatMissingUnits(beat);
  const refs = allStoryBeatRefs();
  const completed = state.campaignProgress.completedBeatIds.length;
  const beatStatus = isBeatCompleted(beat.id)
    ? 'completed'
    : state.campaignProgress.lastStartedBeatId === beat.id
      ? 'in progress'
      : 'not started';
  const meta = storyBeatImplementationMeta(beat);
  const selectedBeatIndex = refs.findIndex((ref) => ref.arcId === state.currentStoryArcId && ref.beatId === state.currentStoryBeatId);
  const nextRef = selectedBeatIndex >= 0 && selectedBeatIndex < refs.length - 1 ? refs[selectedBeatIndex + 1] : null;
  const nextBeat = nextRef ? getStoryArcs().find((candidateArc) => candidateArc.id === nextRef.arcId)?.plotBeats?.find((candidateBeat) => candidateBeat.id === nextRef.beatId) : null;

  if (elements.campaignContinueFlow) {
    elements.campaignContinueFlow.textContent = isBeatCompleted(beat.id)
      ? 'Continue to next beat'
      : meta.kind === 'battle'
        ? 'Continue flow → battle'
        : 'Continue flow → placeholder';
  }

  const runBeat = getCurrentCampaignBeat();
  const runArc = getCurrentCampaignArc();
  const runPage = getCurrentCampaignScenePage();
  const runPages = currentCampaignScenePages();
  const runMeta = storyBeatImplementationMeta(runBeat);
  const effectiveRunPage = runPage ?? (campaignRunActive() && state.campaignRun.phase === 'battle'
    ? {
      title: 'Сюжетный бой идёт',
      subtitle: runBeat ? `${runArc?.title ?? 'Арка'} — ${runBeat.title}` : 'Story battle',
      text: [
        runBeat?.summary ?? 'Активен сюжетный бой кампании.',
        `Цель: победить encounter «${runMeta?.encounterLabel ?? runMeta?.scenarioKey ?? 'story battle'}» и автоматически открыть следующую сцену.`,
      ],
      action: null,
    }
    : null);
  const effectiveSceneCount = state.campaignRun.phase === 'battle' ? 1 : runPages.length;

  elements.campaignSceneKicker.textContent = campaignRunActive()
    ? `Campaign phase: ${state.campaignRun.phase}`
    : 'Campaign scene';
  elements.campaignSceneTitle.textContent = campaignRunActive()
    ? (effectiveRunPage?.title ?? runBeat?.title ?? 'Story campaign')
    : 'Кампания не запущена';
  elements.campaignSceneSubtitle.textContent = campaignRunActive()
    ? (effectiveRunPage?.subtitle ?? (runBeat && runArc ? `${runArc.title} — ${runBeat.title}` : 'Сюжетная сцена'))
    : 'Нажми «Новая кампания», чтобы пройти story beats последовательно.';
  renderCampaignSceneBody(effectiveRunPage);

  elements.campaignSceneMeta.textContent = campaignRunActive()
    ? [
      `Run id: ${state.campaignRun.runId}`,
      `Beat progress: ${state.campaignRun.completedBeatIds.length}/${refs.length}`,
      `Current beat: ${runBeat ? campaignBeatLabel(runBeat) : 'n/a'}`,
      `Current arc: ${runArc?.title ?? 'n/a'}`,
      `Scene: ${effectiveSceneCount > 0 ? `${Math.min(state.campaignRun.sceneIndex + 1, effectiveSceneCount)}/${effectiveSceneCount}` : 'n/a'}`,
      `Inventory carryover: ${campaignInventoryString()}`,
      `Gold: ${campaignGoldString()}`,
      `Growth: ${campaignGrowthString()}`,
      `Current location: ${getCurrentCampaignLocation()?.title ?? 'n/a'}`,
      `Equipment unlocked: ${campaignOwnedEquipmentLines().join(', ') || 'none'}`,
      `Quest flags: ${Object.keys(state.campaignRun.questFlags ?? {}).filter((key) => state.campaignRun.questFlags[key]).length}`,
      'Party state:',
      ...campaignPartyStatusLines(runBeat),
      `Last result: ${state.campaignRun.lastResultSummary ?? 'none yet'}`,
      `Implementation: ${runMeta.status}`,
      activeSetpieceForBeat(runBeat?.id ?? null) ? `Setpiece: ${isSetpieceUnlockedForBeat(runBeat?.id ?? null) ? 'unlocked/seen' : 'pending before battle'}` : 'Setpiece: none',
      runMeta.runId ? `Scenario run id: ${runMeta.runId}` : `Scenario key: ${runMeta.scenarioKey ?? 'none'}`,
      `Available prototype party: ${runBeat ? [...(runBeat.partyState?.core ?? []), ...(runBeat.partyState?.temporary ?? [])].map((name) => STORY_PARTY_UNIT_MAP[name]).filter(Boolean).join(', ') || 'ryudo, elena' : 'n/a'}`,
      `Next step hint: ${effectiveRunPage?.action ?? 'continue'}`,
    ].join('\n')
    : [
      'Story campaign run is idle.',
      `Overall completion history: ${state.campaignProgress.completedBeatIds.length}/${refs.length} beats.`,
      'Новая кампания запускает линейный сюжетный режим с катсценами, боями и журналом прохождения.',
    ].join('\n');

  elements.campaignJournal.textContent = campaignRunActive()
    ? (state.campaignRun.journal.length > 0 ? state.campaignRun.journal.slice(-18).join('\n') : 'Журнал пока пуст.')
    : 'После старта сюда будут записываться победы, поражения, checkpoint-ы и переходы между арками.';

  const runBinding = getCurrentCampaignWorldBinding();
  const runChapter = getCurrentCampaignChapter();
  const runLocation = getCurrentCampaignLocation();
  const runLocationState = runLocation ? activeLocationStateProfile(runLocation.id, runBeat?.id) : null;
  const runDungeonChain = runLocation ? activeDungeonStageChain(runLocation.id) : null;
  const runNextChainStep = runBeat ? nextQuestChainStepForBeat(runBeat.id) : null;
  const pendingOverworldDestination = getWorldLocation(state.campaignRun.pendingTravelToLocationId ?? null);
  const openMajorLocations = runBeat ? listMajorLocationsForBeat(runBeat.id) : [];
  const visibleExits = runBeat && runLocation ? campaignVisibleExitsForBeat(runLocation.id, runBeat.id) : [];

  if (elements.campaignWorldSummary) {
    elements.campaignWorldSummary.textContent = campaignRunActive()
      ? [
        `Глава маршрута: ${runChapter?.title ?? 'n/a'}`,
        `Сюжетный бит: ${runBeat ? campaignBeatLabel(runBeat) : 'n/a'}`,
        `Текущая локация: ${runLocation?.title ?? 'n/a'} (${campaignLocationTypeLabel(runLocation)})`,
        `Состояние локации: ${runLocationState?.label ?? 'стандартное'}`,
        `Регион: ${runLocation?.region ?? 'n/a'}`,
        pendingOverworldDestination ? `Следующая точка overworld: ${pendingOverworldDestination.title}` : null,
        `Цель маршрута: ${getWorldLocation(runBinding?.objectiveLocationId ?? null)?.title ?? 'n/a'}`,
        `Точка боевого запуска: ${getWorldLocation(runBinding?.battleLocationId ?? null)?.title ?? 'n/a'}`,
        `Выходы отсюда: ${visibleExits.map((location) => location.title).join(', ') || 'нет'}`,
        `Shop stock: ${runLocation ? [
          ...getShopEntriesForLocation(runLocation.id).map((entry) => entry.label),
          ...campaignEquipmentForLocation(runLocation.id).map((entry) => entry.label),
        ].join(', ') || 'none' : 'n/a'}`,
        `NPC events left: ${availableWorldEventsForCurrentLocation().length}`,
        `Setpiece status: ${activeSetpieceForBeat(runBeat?.id ?? null) ? (isSetpieceUnlockedForBeat(runBeat?.id ?? null) ? 'seen/unlocked' : 'pending') : 'none'}`,
        `Growth: ${campaignGrowthString()}`,
        `Quest-ready: ${missingObjectiveFlagsForCurrentBeat().length === 0 ? 'yes' : `нет, не хватает ${missingObjectiveFlagsForCurrentBeat().map(questFlagLabel).join(', ')}`}`,
        runNextChainStep ? `Следующий конкретный шаг: ${runNextChainStep.label} @ ${getWorldLocation(runNextChainStep.locationId)?.title ?? runNextChainStep.locationId}` : null,
        nextLocationSceneForCurrentContext() ? `Следующая auto-scene: ${nextLocationSceneForCurrentContext().title}` : null,
        runDungeonChain ? `Dungeon chain: ${runDungeonChain.title}` : null,
        `Инвентарь: ${campaignInventoryString()} | Золото: ${campaignGoldString()}`,
        `Экипировка: ${campaignOwnedEquipmentLines().join(', ') || 'none'}`,
        'Партия:',
        ...campaignPartyStatusLines(runBeat),
        state.campaignRun.travelMessage ? `Последняя заметка: ${state.campaignRun.travelMessage}` : null,
      ].filter(Boolean).join('\n')
      : 'После старта здесь появятся текущая точка мира, цель маршрута, доступные переходы и сервисы локации.';
  }

  if (elements.campaignRouteMap) {
    elements.campaignRouteMap.textContent = campaignRunActive()
      ? [
        `Открытые major-локации главы (${openMajorLocations.length}):`,
        ...openMajorLocations.map((location) => {
          const currentMark = location.id === runLocation?.id ? '◎' : state.campaignRun.visitedLocationIds.includes(location.id) ? '•' : '·';
          const objectiveMark = location.id === runBinding?.objectiveLocationId ? '★' : ' ';
          const stateLabel = activeLocationStateProfile(location.id, runBeat?.id)?.label;
          return `${currentMark}${objectiveMark} ${location.title} [${location.region}]${stateLabel ? ` — ${stateLabel}` : ''}`;
        }),
        '',
        'Обозначения: ◎ текущая точка, ★ сюжетная цель, • уже посещалось.',
        `Старые маршруты, не входящие в ${runChapter?.title ?? 'текущую главу'}, считаются сюжетно закрытыми.`,
        runBinding?.route?.length
          ? `Рекомендуемый путь: ${runBinding.route.map((locationId) => getWorldLocation(locationId)?.title ?? locationId).join(' → ')}`
          : 'Рекомендуемый путь не задан.',
      ].join('\n')
      : 'Карта главы появится после запуска кампании.';
  }

  renderCampaignTravelControls();
  renderCampaignEquipmentPanel();
  renderCampaignEventsPanel();
  renderCampaignGrowthPanel();
  renderCampaignQuestPanel();
  renderCampaignAuditPanel();
  renderCampaignBestiaryPanel();
  renderCampaignSkillbookPanel();
  renderCampaignItemPanel();
  renderCampaignScriptPanel();
  renderCampaignOriginalFlowPanel();

  const currentAction = effectiveRunPage?.action ?? null;
  elements.campaignNextScene.hidden = !campaignRunActive() || !(state.campaignRun.phase === 'opening' || state.campaignRun.phase === 'intro' || state.campaignRun.phase === 'location-scene' || state.campaignRun.phase === 'npc-dialogue' || state.campaignRun.phase === 'overworld' || state.campaignRun.phase === 'setpiece' || state.campaignRun.phase === 'victory' || state.campaignRun.phase === 'placeholder-result' || state.campaignRun.phase === 'finished');
  elements.campaignNextScene.disabled = !campaignRunActive() || currentAction === 'launch-battle' || currentAction === 'launch-setpiece' || currentAction === 'complete-placeholder' || currentAction === 'retry-battle' || currentAction === 'restart-campaign' || currentAction === 'travel';
  elements.campaignLaunchBattle.hidden = !(campaignRunActive() && (currentAction === 'launch-battle' || currentAction === 'launch-setpiece'));
  elements.campaignContinueAfterBattle.hidden = !(campaignRunActive() && ['complete-placeholder', 'next-beat', 'finish-campaign', 'restart-campaign', 'return-travel'].includes(currentAction));
  elements.campaignLaunchBattle.textContent = currentAction === 'launch-setpiece' ? 'Открыть bespoke scene' : 'Начать сюжетный бой';
  elements.campaignContinueAfterBattle.textContent = currentAction === 'complete-placeholder'
    ? 'Засчитать checkpoint'
    : currentAction === 'restart-campaign'
      ? 'Новая игра после титров'
      : currentAction === 'return-travel'
        ? 'Вернуться к исследованию'
        : 'Продолжить после боя';
  elements.campaignRetryBeat.hidden = !(campaignRunActive() && state.campaignRun.phase === 'defeat');
  elements.campaignResumeRun.hidden = campaignRunActive();
  elements.campaignAbandonRun.hidden = !campaignRunActive();
  elements.campaignStartRun.textContent = campaignRunActive() ? 'Начать заново' : 'Новая кампания';

  elements.campaignInfo.textContent = [
    `Arc: ${arc.title}`,
    `Beat: ${campaignBeatLabel(beat)}`,
    `Campaign progress: ${completed}/${refs.length} beats completed`,
    `Beat status: ${beatStatus}`,
    `Implementation: ${meta.status}`,
    state.appliedStoryBeatId === beat.id ? 'Applied to current sandbox setup.' : 'Selector only.',
    `Focus: ${arc.storyFocus}`,
    `Summary: ${beat.summary}`,
    `Locations: ${(beat.locations ?? []).join(', ')}`,
    `Recommended template: ${beat.recommendedTemplate}`,
    `Recommended theme: ${beat.recommendedTheme}`,
    `Opening advantage: ${beat.openingAdvantage}`,
    `Prototype fit: ${beat.currentPrototypeFit}`,
    `Mapped scenario: ${meta.runId ?? meta.scenarioKey ?? 'none'}`,
    `Bosses: ${(beat.bosses ?? []).join(', ') || 'none'}`,
    `Party core: ${(beat.partyState?.core ?? []).join(', ')}`,
    `Temporary: ${(beat.partyState?.temporary ?? []).join(', ') || 'none'}`,
    `Unavailable in current prototype: ${missing.join(', ') || 'none'}`,
    nextBeat ? `Next beat in chain: ${nextBeat.title} [${nextBeat.id}]` : 'Next beat in chain: end of campaign',
    meta.kind === 'placeholder' ? 'Placeholder: use this beat as a narrative checkpoint until its bespoke scene is built.' : 'Playable beat: battle can be launched now.',
  ].join('\n');
}

function applyBalanceVectorEditor() {
  readBalanceVectorFromInputs();
  state.debugOutput = 'Balance vector applied from editor.';
  state.battle = createBattleForCurrentContext();
  render();
}

function resetBalanceVectorDefaults() {
  state.balanceVector = cloneVector(DEFAULT_BALANCE_VECTOR);
  writeBalanceVectorToInputs();
  state.debugOutput = 'Balance vector reset to default constants.';
  state.battle = createBattleForCurrentContext();
  render();
}

function resetPlayBattleFromForms() {
  readFormsToState();
  resetToPlayBattle();
  render();
}

function resetBattleFromCurrentTab() {
  if (campaignRunActive() && state.activeTab === 'campaign' && state.campaignRun.phase === 'battle') {
    retryCurrentCampaignBattle();
    return;
  }

  closeReplay();
  if (state.activeTab === 'debug') {
    readFormsToState();
    state.battle = createDebugBattle();
  } else {
    readFormsToState();
    resetToPlayBattle();
  }
  render();
}

function launchDebugBattle() {
  closeReplay();
  readFormsToState();
  state.battle = createDebugBattle();
  setActiveTab('debug');
}

function runBalanceSnapshot() {
  readFormsToState();
  const encounter = buildEncounterFromForm();
  const balance = currentBalanceProfile();
  const novice = evaluatePlayerController({
    playerController: createNoviceController(),
    enemyController: controllerFromKind(state.playEnemyAi),
    balance,
    count: 120,
    seed: state.battleSeed,
    ...encounter,
  });

  const veteran = evaluatePlayerController({
    playerController: createWeightedPlayerController(state.veteranWeights),
    enemyController: controllerFromKind(state.playEnemyAi),
    balance,
    count: 120,
    seed: state.battleSeed,
    ...encounter,
  });

  state.lastMetrics = {
    title: 'Balance snapshot',
    series: [
      { label: 'Novice', winRate: novice.playerWinRate, averageTurns: novice.averageTurns, color: '#60a5fa' },
      { label: 'Veteran', winRate: veteran.playerWinRate, averageTurns: veteran.averageTurns, color: '#f59e0b' },
    ],
  };

  elements.summary.textContent = [
    'Balance snapshot on 120 simulations:',
    `Novice bot -> ${(novice.playerWinRate * 100).toFixed(1)}% wins, avg ${novice.averageTurns.toFixed(1)} events.`,
    `Veteran bot -> ${(veteran.playerWinRate * 100).toFixed(1)}% wins, avg ${veteran.averageTurns.toFixed(1)} events.`,
    `Skill gap -> ${((veteran.playerWinRate - novice.playerWinRate) * 100).toFixed(1)} percentage points.`,
  ].join('\n');
}

function runDebugWinrate() {
  readFormsToState();
  const encounter = buildEncounterFromForm();
  const balance = currentBalanceProfile();
  const evaluationCount = Number(elements.debugEvalCount.value);
  const playerController = controllerFromKind(state.debugPlayerAi);
  const enemyController = controllerFromKind(state.debugEnemyAi);

  const metrics = evaluatePlayerController({
    playerController,
    enemyController,
    balance,
    count: evaluationCount,
    seed: state.battleSeed,
    ...encounter,
  });

  state.lastMetrics = {
    title: `Winrate check: ${state.debugPlayerAi} vs ${state.debugEnemyAi}`,
    series: [
      { label: 'Players', winRate: metrics.playerWinRate, averageTurns: metrics.averageTurns, color: '#34d399' },
      { label: 'Enemies', winRate: metrics.enemyWins / Math.max(1, metrics.count), averageTurns: metrics.averageTurns, color: '#ef4444' },
    ],
  };

  state.debugOutput = [
    `Winrate check (${state.debugPlayerAi} vs ${state.debugEnemyAi}) on ${evaluationCount} simulations:`,
    `players win rate ${(metrics.playerWinRate * 100).toFixed(1)}%`,
    `enemy wins ${metrics.enemyWins}`,
    `draws ${metrics.draws}`,
    `avg events ${metrics.averageTurns.toFixed(1)}`,
  ].join('\n');
  render();
}

function trainVeteranFromDebug() {
  readFormsToState();
  const encounter = buildEncounterFromForm();
  const balance = currentBalanceProfile();
  const baseWeights = applyTrainingStyle(state.veteranWeights, state.trainingStyle);
  const result = trainVeteranBot({
    balance,
    enemyController: controllerFromKind(state.debugEnemyAi),
    players: encounter.players,
    enemies: encounter.enemies,
    generations: Number(elements.debugGenerations.value),
    populationSize: Number(elements.debugPopulation.value),
    simulationsPerCandidate: Number(elements.debugTrainingSims.value),
    seed: Number(elements.debugTrainingSeed.value),
    initialWeights: baseWeights,
  });

  state.veteranWeights = cloneWeights(result.weights);
  state.veteranSource = `browser-trained (${state.trainingStyle})`;
  state.lastMetrics = {
    title: `Training result (${state.trainingStyle})`,
    series: [
      { label: 'Veteran train seeds', winRate: result.metrics.playerWinRate, averageTurns: result.metrics.averageTurns, color: '#f59e0b' },
    ],
  };
  state.debugOutput = [
    'Veteran retrained in browser.',
    `fitness ${result.fitness.toFixed(2)}`,
    `win rate ${(result.metrics.playerWinRate * 100).toFixed(1)}% on training seeds`,
    `avg events ${result.metrics.averageTurns.toFixed(1)}`,
    `style ${state.trainingStyle}`,
  ].join('\n');
  render();
}

async function loadArtifactIntoBrowser() {
  try {
    const response = await fetch('./artifacts/ga_weights.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const artifact = await response.json();
    applyArtifactPayload(artifact, 'artifact/ga_weights.json');
    render();
  } catch (error) {
    state.debugOutput = `Artifact load failed: ${error.message}`;
    render();
  }
}

function applyUnitOverrides(unitOverrides) {
  if (!unitOverrides || typeof unitOverrides !== 'object') {
    return;
  }

  for (const key of UNIT_KEYS) {
    const source = unitOverrides[key];
    if (!source || typeof source !== 'object') {
      continue;
    }

    for (const field of STAT_FIELDS) {
      if (typeof source[field] === 'number' && Number.isFinite(source[field])) {
        state.unitFormState[key][field] = source[field];
      }
    }
  }
}

function applyArtifactPayload(payload, sourceLabel) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('artifact payload is not an object');
  }

  const nextWeights = payload.veteranWeights ?? payload.trainedVeteranWeights;
  const nextBalance = payload.balanceVector ?? payload.tunedVector;

  if (nextWeights) {
    state.veteranWeights = cloneWeights(nextWeights);
  }

  if (nextBalance) {
    state.balanceVector = cloneVector(nextBalance);
  }

  applyUnitOverrides(payload.unitOverrides);
  if (payload.inventoryOverrides) {
    state.inventoryOverrides = createBaseInventory({
      ...state.inventoryOverrides,
      ...payload.inventoryOverrides,
    });
  }
  writeStateToForms();

  closeReplay();
  state.veteranSource = sourceLabel;
  state.debugOutput = [
    `Artifact loaded from ${sourceLabel}.`,
    nextWeights ? 'Veteran weights: updated.' : 'Veteran weights: unchanged.',
    nextBalance ? 'Balance vector: updated.' : 'Balance vector: unchanged.',
    payload.unitOverrides ? 'Unit overrides: applied to editor form.' : 'Unit overrides: none.',
  ].join('\n');

  state.battle = createBattleForCurrentContext();
}

function saveCurrentBrowserTuning() {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: 'browser-debug-menu',
    veteranWeights: state.veteranWeights,
    balanceVector: state.balanceVector,
    unitOverrides: state.unitFormState,
    inventoryOverrides: state.inventoryOverrides,
  };
  downloadJson('ga_weights.browser.json', payload);
}

function stopReplayAutoplay() {
  if (state.replayAutoplayTimer) {
    clearInterval(state.replayAutoplayTimer);
    state.replayAutoplayTimer = null;
  }
}

function isReplayAutoplaying() {
  return Boolean(state.replayAutoplayTimer);
}

function closeReplay() {
  stopReplayAutoplay();
  state.eventFx = null;
  state.eventFxQueue = [];
  state.replay = null;
}

function openReplay(payload, name = 'battle-log.json') {
  stopReplayAutoplay();
  const snapshots = Array.isArray(payload.snapshots) ? payload.snapshots : [];
  state.replay = {
    name,
    data: payload,
    index: snapshots.length > 0 ? 0 : 0,
  };
}

async function importReplayFromFile(file) {
  if (!file) {
    return;
  }

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    openReplay(payload, file.name);
    state.debugOutput = `Replay loaded from ${file.name}.`;
    setActiveTab('debug');
  } catch (error) {
    state.debugOutput = `Replay import failed: ${error.message}`;
    render();
  } finally {
    elements.replayLoadInput.value = '';
  }
}

async function importCompareReplay(side, file) {
  if (!file) {
    return;
  }

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    loadCompareReplay(side, payload, file.name);
    state.debugOutput = `${side} compare replay loaded from ${file.name}.`;
    setActiveTab('compare');
  } catch (error) {
    state.debugOutput = `Compare import failed (${side}): ${error.message}`;
    render();
  }
}

function replayStep(delta) {
  if (!state.replay) {
    return;
  }

  const snapshots = state.replay.data.snapshots ?? [];
  if (snapshots.length === 0) {
    return;
  }

  state.replay.index = Math.max(0, Math.min(state.replay.index + delta, snapshots.length - 1));
  if (state.replay.index >= snapshots.length - 1) {
    stopReplayAutoplay();
  }
  render();
}

function setReplayIndex(nextIndex) {
  if (!state.replay) {
    return;
  }

  const snapshots = state.replay.data.snapshots ?? [];
  if (snapshots.length === 0) {
    return;
  }

  state.replay.index = Math.max(0, Math.min(Number(nextIndex) || 0, snapshots.length - 1));
  if (state.replay.index >= snapshots.length - 1) {
    stopReplayAutoplay();
  }
  render();
}

function toggleReplayAutoplay() {
  if (!state.replay) {
    return;
  }

  const snapshots = state.replay.data.snapshots ?? [];
  if (snapshots.length <= 1) {
    return;
  }

  if (isReplayAutoplaying()) {
    stopReplayAutoplay();
    render();
    return;
  }

  if (state.replay.index >= snapshots.length - 1) {
    state.replay.index = 0;
  }

  const delay = Math.max(60, Number(elements.replaySpeed.value) || 550);
  state.replayAutoplayTimer = setInterval(() => {
    if (!state.replay) {
      stopReplayAutoplay();
      return;
    }

    const currentSnapshots = state.replay.data.snapshots ?? [];
    if (state.replay.index >= currentSnapshots.length - 1) {
      stopReplayAutoplay();
      render();
      return;
    }

    state.replay.index += 1;
    if (state.replay.index >= currentSnapshots.length - 1) {
      stopReplayAutoplay();
    }
    render();
  }, delay);
  render();
}

function renderReplayPanel() {
  if (!state.replay) {
    elements.replayStatus.textContent = 'Replay не загружен.';
    elements.replayInfo.textContent = 'Загрузи battle-log.json из кнопки «Экспорт лога JSON», чтобы пролистывать бой по шагам.';
    elements.replayPlay.textContent = '▶ Replay';
    elements.replaySlider.max = '0';
    elements.replaySlider.value = '0';
    elements.replaySlider.disabled = true;
    return;
  }

  const snapshots = state.replay.data.snapshots ?? [];
  const current = getReplaySnapshot();
  const currentDecision = getReplayDecision();
  elements.replaySlider.disabled = snapshots.length === 0;
  elements.replaySlider.max = String(Math.max(0, snapshots.length - 1));
  elements.replaySlider.value = String(state.replay.index);
  elements.replayPlay.textContent = isReplayAutoplaying() ? '⏸ Pause replay' : '▶ Replay';
  elements.replayStatus.textContent = `Replay: ${state.replay.name} — шаг ${state.replay.index + 1}/${Math.max(1, snapshots.length)}.`;
  const metadata = state.replay.data.metadata ?? {};
  const inventory = metadata.inventory
    ? `Inventory: ${campaignInventoryString(metadata.inventory)}`
    : 'Inventory: n/a';

  elements.replayInfo.textContent = [
    `Winner: ${state.replay.data.winner ?? 'unknown'}`,
    `Export version: ${state.replay.data.version ?? 1}`,
    `Story arc: ${metadata.storyArcId ?? 'n/a'}`,
    `Story beat: ${metadata.storyBeatTitle ?? metadata.storyBeatId ?? 'n/a'}`,
    `Template: ${metadata.encounterTemplate ?? 'n/a'}`,
    `Theme: ${metadata.battlefieldTheme ?? 'n/a'}`,
    `Opening: ${metadata.openingAdvantage ?? 'n/a'}`,
    `Seed: ${metadata.battleSeed ?? 'n/a'}`,
    inventory,
    `Events stored: ${(state.replay.data.events ?? []).length}`,
    `Decisions stored: ${(state.replay.data.decisions ?? []).length}`,
    current ? `Current snapshot label: ${current.label}` : 'Current snapshot label: none',
    currentDecision
      ? `Current decision: ${currentDecision.fighterName} -> ${currentDecision.selected?.label ?? 'none'}`
      : 'Current decision: none (initial snapshot)',
    currentDecision?.selected?.analysis?.targetName
      ? `Current target: ${currentDecision.selected.analysis.targetName}`
      : 'Current target: n/a',
    `Autoplay: ${isReplayAutoplaying() ? 'on' : 'off'} @ ${elements.replaySpeed.options[elements.replaySpeed.selectedIndex]?.text ?? '1x'}`,
  ].join('\n');
}

function stopCompareAutoplay() {
  if (state.compare.autoplayTimer) {
    clearInterval(state.compare.autoplayTimer);
    state.compare.autoplayTimer = null;
  }
}

function isCompareAutoplaying() {
  return Boolean(state.compare.autoplayTimer);
}

function getCompareMaxSteps() {
  const left = state.compare.left?.data?.snapshots?.length ?? 0;
  const right = state.compare.right?.data?.snapshots?.length ?? 0;
  return Math.max(left, right, 0);
}

function getCompareSnapshot(side, index = state.compare.index) {
  const replay = state.compare[side];
  const snapshots = replay?.data?.snapshots ?? [];
  if (snapshots.length === 0) {
    return null;
  }
  return snapshots[Math.max(0, Math.min(index, snapshots.length - 1))] ?? null;
}

function getCompareDecision(side, index = state.compare.index) {
  const replay = state.compare[side];
  const decisions = replay?.data?.decisions ?? [];
  if (decisions.length === 0 || index <= 0) {
    return null;
  }
  return decisions[Math.max(0, Math.min(index - 1, decisions.length - 1))] ?? null;
}

function loadCompareReplay(side, payload, name = 'replay.json') {
  state.compare[side] = { name, data: payload };
  state.compare.index = 0;
}

function clearCompare() {
  stopCompareAutoplay();
  state.compare.left = null;
  state.compare.right = null;
  state.compare.index = 0;
}

function setCompareIndex(value) {
  const max = getCompareMaxSteps();
  if (max <= 0) {
    state.compare.index = 0;
    render();
    return;
  }
  state.compare.index = Math.max(0, Math.min(Number(value) || 0, max - 1));
  if (state.compare.index >= max - 1) {
    stopCompareAutoplay();
  }
  render();
}

function stepCompare(delta) {
  if (getCompareMaxSteps() === 0) {
    return;
  }
  setCompareIndex(state.compare.index + delta);
}

function toggleCompareAutoplay() {
  const max = getCompareMaxSteps();
  if (max <= 1) {
    return;
  }

  if (isCompareAutoplaying()) {
    stopCompareAutoplay();
    render();
    return;
  }

  if (state.compare.index >= max - 1) {
    state.compare.index = 0;
  }

  const delay = Math.max(60, Number(elements.compareSpeed.value) || 550);
  state.compare.autoplayTimer = setInterval(() => {
    const currentMax = getCompareMaxSteps();
    if (currentMax <= 1 || state.compare.index >= currentMax - 1) {
      stopCompareAutoplay();
      render();
      return;
    }
    state.compare.index += 1;
    if (state.compare.index >= currentMax - 1) {
      stopCompareAutoplay();
    }
    render();
  }, delay);
  render();
}

function themePaletteForReplay(replay) {
  const explicitTheme = replay?.data?.metadata?.battlefieldTheme;
  if (explicitTheme) {
    return themePalette(explicitTheme);
  }
  const scenarioId = replay?.data?.metadata?.scenarioId;
  const scenario = scenarioId ? SCENARIO_PRESETS[scenarioId] : null;
  return themePalette(scenario?.battlefieldTheme ?? 'cavern');
}

function drawArenaOn(ctx, canvas, palette, theme = 'cavern') {
  const activePalette = palette ?? themePalette('cavern');
  const backdrop = getLoadedImageAsset(battlefieldArtPath(theme));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!drawImageCover(ctx, backdrop, 0, 0, canvas.width, canvas.height, 1)) {
    ctx.fillStyle = activePalette.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = backdrop ? 'rgba(15, 23, 42, 0.48)' : activePalette.field;
  ctx.fillRect(20, 20, FIELD_WIDTH, FIELD_HEIGHT);
  ctx.fillStyle = backdrop ? 'rgba(255,255,255,0.05)' : activePalette.overlay;
  for (let stripe = 0; stripe < 6; stripe += 1) {
    ctx.fillRect(20, 20 + stripe * 60, FIELD_WIDTH, 24);
  }
  ctx.strokeStyle = activePalette.line;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, FIELD_WIDTH, FIELD_HEIGHT);
  ctx.strokeStyle = activePalette.accent;
  ctx.beginPath();
  ctx.moveTo(20 + FIELD_WIDTH / 2, 20);
  ctx.lineTo(20 + FIELD_WIDTH / 2, 20 + FIELD_HEIGHT);
  ctx.stroke();
}

function gaugeXOn(canvas, ip) {
  const left = 70;
  const width = canvas.width - 140;
  return left + (ip / IP_MAX) * width;
}

function drawReplayScene(ctx, canvas, snapshot, decision, replay = null) {
  drawArenaOn(ctx, canvas, themePaletteForReplay(replay), replay?.data?.metadata?.battlefieldTheme ?? 'cavern');
  if (!snapshot) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Replay not loaded', canvas.width / 2, canvas.height / 2);
    return;
  }

  for (const fighter of [...snapshot.players, ...snapshot.enemies]) {
    const x = 20 + fighter.position.x;
    const y = 20 + fighter.position.y;
    const hpRatio = fighter.maxHp > 0 ? fighter.hp / fighter.maxHp : 0;
    const sprite = getLoadedImageAsset(unitArtPathForFighter(fighter));

    if (fighter.pendingAction?.targetPoint) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(20 + fighter.pendingAction.targetPoint.x, 20 + fighter.pendingAction.targetPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (sprite) {
      drawImageCover(ctx, sprite, x - (fighter.radius ?? 18) * 1.65, y - (fighter.radius ?? 18) * 1.9, (fighter.radius ?? 18) * 3.3, (fighter.radius ?? 18) * 3.3, fighter.isAlive ? 1 : 0.4);
    } else {
      ctx.fillStyle = fighter.color;
      ctx.beginPath();
      ctx.arc(x, y, fighter.radius ?? 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = fighter.team === 'players' ? '#bfdbfe' : '#fecaca';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, (fighter.radius ?? 18) + (sprite ? 4 : 0), 0, Math.PI * 2);
    ctx.stroke();

    drawStatusIconsNearUnit(ctx, fighter, x, y);

    if (fighter.guard?.type === 'endure') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, (fighter.radius ?? 18) + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (fighter.guard?.type === 'evade') {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, (fighter.radius ?? 18) + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#e5e7eb';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(fighter.name, x, y - (fighter.radius ?? 18) - 16);
    ctx.fillStyle = '#374151';
    ctx.fillRect(x - 28, y + (fighter.radius ?? 18) + 8, 56, 6);
    ctx.fillStyle = hpRatio > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(x - 28, y + (fighter.radius ?? 18) + 8, 56 * hpRatio, 6);
  }

  const topY = 440;
  const rowGap = 42;
  const left = gaugeXOn(canvas, 0);
  const right = gaugeXOn(canvas, IP_MAX);
  const comX = gaugeXOn(canvas, COM_START);
  const actX = gaugeXOn(canvas, ACT_POINT);

  ctx.fillStyle = '#0b1220';
  ctx.fillRect(40, topY - 20, canvas.width - 80, 100);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, topY - 20, canvas.width - 80, 100);
  for (let row = 0; row < 2; row += 1) {
    const y = topY + row * rowGap;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(comX, topY - 8);
  ctx.lineTo(comX, topY + rowGap + 8);
  ctx.stroke();
  ctx.strokeStyle = '#fb7185';
  ctx.beginPath();
  ctx.moveTo(actX, topY - 8);
  ctx.lineTo(actX, topY + rowGap + 8);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('COM', comX, topY - 12);
  ctx.fillStyle = '#fb7185';
  ctx.fillText('ACT', actX, topY - 12);

  const rows = [snapshot.enemies, snapshot.players];
  rows.forEach((fighters, rowIndex) => {
    const y = topY + rowIndex * rowGap;
    fighters.forEach((fighter) => {
      ctx.fillStyle = fighter.color;
      ctx.beginPath();
      ctx.arc(gaugeXOn(canvas, fighter.ip), y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = fighter.isAlive ? '#e5e7eb' : '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  });

  if (decision?.selected) {
    const fighters = [...snapshot.players, ...snapshot.enemies];
    const actor = fighters.find((fighter) => fighter.id === decision.fighterId);
    const target = decision.selected.targetId
      ? fighters.find((fighter) => fighter.id === decision.selected.targetId)
      : null;
    if (actor) {
      const ax = 20 + actor.position.x;
      const ay = 20 + actor.position.y;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ax, ay, (actor.radius ?? 18) + 12, 0, Math.PI * 2);
      ctx.stroke();
      if (target) {
        const tx = 20 + target.position.x;
        const ty = 20 + target.position.y;
        ctx.strokeStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(tx, ty, (target.radius ?? 18) + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function formatReplayInfoBlock(replay, snapshot, decision) {
  if (!replay) {
    return 'Replay not loaded.';
  }

  const metadata = replay.data.metadata ?? {};
  const inventory = metadata.inventory
    ? `Inventory: ${campaignInventoryString(metadata.inventory)}`
    : 'Inventory: n/a';

  return [
    `Name: ${replay.name}`,
    `Winner: ${replay.data.winner ?? 'unknown'}`,
    `Version: ${replay.data.version ?? 'unknown'}`,
    `Story arc: ${metadata.storyArcId ?? 'n/a'}`,
    `Story beat: ${metadata.storyBeatTitle ?? metadata.storyBeatId ?? 'n/a'}`,
    `Template: ${metadata.encounterTemplate ?? 'n/a'}`,
    `Theme: ${metadata.battlefieldTheme ?? 'n/a'}`,
    `Opening: ${metadata.openingAdvantage ?? 'n/a'}`,
    `Seed: ${metadata.battleSeed ?? 'n/a'}`,
    inventory,
    `Snapshots: ${(replay.data.snapshots ?? []).length}`,
    snapshot ? `Step label: ${snapshot.label}` : 'Step label: none',
    decision ? `Decision: ${decision.fighterName} -> ${decision.selected?.label ?? 'none'}` : 'Decision: none',
    decision?.selected?.analysis?.targetName ? `Target: ${decision.selected.analysis.targetName}` : 'Target: n/a',
  ].join('\n');
}

function compareFighterHpSummary(leftSnapshot, rightSnapshot) {
  const rows = [];
  const leftByName = new Map([...(leftSnapshot?.players ?? []), ...(leftSnapshot?.enemies ?? [])].map((fighter) => [fighter.name, fighter]));
  const rightByName = new Map([...(rightSnapshot?.players ?? []), ...(rightSnapshot?.enemies ?? [])].map((fighter) => [fighter.name, fighter]));
  const names = [...new Set([...leftByName.keys(), ...rightByName.keys()])];

  for (const name of names) {
    const left = leftByName.get(name);
    const right = rightByName.get(name);
    const leftHp = left ? `${left.hp}/${left.maxHp}` : 'n/a';
    const rightHp = right ? `${right.hp}/${right.maxHp}` : 'n/a';
    const leftRole = left?.role ?? 'n/a';
    const rightRole = right?.role ?? 'n/a';
    rows.push(`- ${name}: left ${leftHp} [${leftRole}] | right ${rightHp} [${rightRole}]`);
  }

  return rows.join('\n');
}

function buildCompareDiffPayload() {
  const left = state.compare.left;
  const right = state.compare.right;
  const max = getCompareMaxSteps();

  const steps = [];
  for (let index = 0; index < max; index += 1) {
    const leftSnapshot = getCompareSnapshot('left', index);
    const rightSnapshot = getCompareSnapshot('right', index);
    const leftDecision = getCompareDecision('left', index);
    const rightDecision = getCompareDecision('right', index);
    const leftAction = leftDecision?.selected?.label ?? 'none';
    const rightAction = rightDecision?.selected?.label ?? 'none';
    const leftTarget = leftDecision?.selected?.analysis?.targetName ?? leftDecision?.selected?.targetId ?? 'n/a';
    const rightTarget = rightDecision?.selected?.analysis?.targetName ?? rightDecision?.selected?.targetId ?? 'n/a';

    steps.push({
      index,
      leftEvent: left?.data?.events?.[Math.max(0, index - 1)] ?? 'none',
      rightEvent: right?.data?.events?.[Math.max(0, index - 1)] ?? 'none',
      leftAction,
      rightAction,
      leftTarget,
      rightTarget,
      sameAction: leftAction === rightAction,
      sameTarget: leftTarget === rightTarget,
      leftSnapshotLabel: leftSnapshot?.label ?? null,
      rightSnapshotLabel: rightSnapshot?.label ?? null,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    left: left ? { name: left.name, winner: left.data.winner } : null,
    right: right ? { name: right.name, winner: right.data.winner } : null,
    currentIndex: state.compare.index,
    steps,
  };
}

function buildCompareDiffText() {
  const payload = buildCompareDiffPayload();
  const header = [
    `Compare diff export`,
    `Left: ${payload.left?.name ?? 'n/a'} winner=${payload.left?.winner ?? 'unknown'}`,
    `Right: ${payload.right?.name ?? 'n/a'} winner=${payload.right?.winner ?? 'unknown'}`,
    `Current index: ${payload.currentIndex}`,
    '',
  ];

  const rows = payload.steps.map((step) => [
    `Step ${step.index + 1}`,
    `  events: ${step.leftEvent} || ${step.rightEvent}`,
    `  actions: ${step.leftAction} || ${step.rightAction}`,
    `  targets: ${step.leftTarget} || ${step.rightTarget}`,
    `  sameAction=${step.sameAction} sameTarget=${step.sameTarget}`,
  ].join('\n'));

  return [...header, ...rows].join('\n');
}

function renderCompareDiffPanel(leftSnapshot, rightSnapshot, leftDecision, rightDecision) {
  if (!state.compare.left || !state.compare.right) {
    elements.compareDiff.textContent = 'Загрузи оба replay, чтобы увидеть step-by-step diff.';
    return;
  }

  const leftEvent = state.compare.left.data.events?.[Math.max(0, state.compare.index - 1)] ?? 'none';
  const rightEvent = state.compare.right.data.events?.[Math.max(0, state.compare.index - 1)] ?? 'none';
  const leftAction = leftDecision?.selected?.label ?? 'none';
  const rightAction = rightDecision?.selected?.label ?? 'none';
  const leftTarget = leftDecision?.selected?.analysis?.targetName ?? leftDecision?.selected?.targetId ?? 'n/a';
  const rightTarget = rightDecision?.selected?.analysis?.targetName ?? rightDecision?.selected?.targetId ?? 'n/a';

  const diffLines = [
    `Step ${state.compare.index + 1}`,
    `Left event: ${leftEvent}`,
    `Right event: ${rightEvent}`,
    `Action diff: ${leftAction} vs ${rightAction}`,
    `Target diff: ${leftTarget} vs ${rightTarget}`,
    `Winner diff: ${state.compare.left.data.winner ?? 'unknown'} vs ${state.compare.right.data.winner ?? 'unknown'}`,
    '',
    'HP summary at current step:',
    compareFighterHpSummary(leftSnapshot, rightSnapshot),
  ];

  if (leftDecision && rightDecision) {
    const sameAction = leftAction === rightAction;
    const sameTarget = leftTarget === rightTarget;
    diffLines.push('', `Decision divergence: action ${sameAction ? 'same' : 'different'}, target ${sameTarget ? 'same' : 'different'}.`);
  }

  elements.compareDiff.textContent = diffLines.join('\n');
}

function renderComparePanel() {
  const max = getCompareMaxSteps();
  elements.compareSlider.max = String(Math.max(0, max - 1));
  elements.compareSlider.value = String(Math.min(state.compare.index, Math.max(0, max - 1)));
  elements.compareSlider.disabled = max <= 0;
  elements.comparePlay.textContent = isCompareAutoplaying() ? '⏸ Pause compare' : '▶ Compare autoplay';

  const leftSnapshot = getCompareSnapshot('left');
  const rightSnapshot = getCompareSnapshot('right');
  const leftDecision = getCompareDecision('left');
  const rightDecision = getCompareDecision('right');

  drawReplayScene(compareContextLeft, elements.compareCanvasLeft, leftSnapshot, leftDecision, state.compare.left);
  drawReplayScene(compareContextRight, elements.compareCanvasRight, rightSnapshot, rightDecision, state.compare.right);

  elements.compareLeftInfo.textContent = formatReplayInfoBlock(state.compare.left, leftSnapshot, leftDecision);
  elements.compareRightInfo.textContent = formatReplayInfoBlock(state.compare.right, rightSnapshot, rightDecision);

  elements.compareStatus.textContent = max > 0
    ? `Compare step ${Math.min(state.compare.index + 1, max)}/${Math.max(1, max)}. Autoplay ${isCompareAutoplaying() ? 'on' : 'off'}.`
    : 'Загрузи два replay, чтобы сравнивать их по шагам.';

  renderCompareDiffPanel(leftSnapshot, rightSnapshot, leftDecision, rightDecision);

  const leftFiltered = filterDecisions((state.compare.left?.data?.decisions ?? []).slice(0, Math.max(0, state.compare.index)));
  const rightFiltered = filterDecisions((state.compare.right?.data?.decisions ?? []).slice(0, Math.max(0, state.compare.index)));
  const leftStats = formatDecisionStats(leftFiltered, 'Left replay stats');
  const rightStats = formatDecisionStats(rightFiltered, 'Right replay stats');
  elements.compareDecisionStats.textContent = `${leftStats}\n\n==============================\n\n${rightStats}`;
}

async function importArtifactFromLocalFile(file) {
  if (!file) {
    return;
  }

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    applyArtifactPayload(payload, `local file: ${file.name}`);
    render();
  } catch (error) {
    state.debugOutput = `Local artifact import failed: ${error.message}`;
    render();
  } finally {
    elements.debugImportArtifactInput.value = '';
  }
}

function bindEvents() {
  elements.menuOpenPlay.addEventListener('click', () => {
    resetToPlayBattle();
    openWorkspace('play');
  });
  elements.menuOpenCampaign.addEventListener('click', () => openWorkspace('campaign'));
  elements.menuOpenDebug.addEventListener('click', () => openWorkspace('debug'));
  elements.menuOpenCompare.addEventListener('click', () => openWorkspace('compare'));
  elements.backToMenu.addEventListener('click', openMainMenu);
  elements.tabPlay.addEventListener('click', () => setActiveTab('play'));
  elements.tabCampaign.addEventListener('click', () => setActiveTab('campaign'));
  elements.tabDebug.addEventListener('click', () => setActiveTab('debug'));
  elements.tabCompare.addEventListener('click', () => setActiveTab('compare'));
  elements.tabParity.addEventListener('click', () => setActiveTab('parity'));
  elements.menuOpenParity.addEventListener('click', () => openWorkspace('parity'));
  elements.mpStatus.addEventListener('click', () => {
    state.menuParityScreen = 'status';
    render();
  });
  elements.mpSkills.addEventListener('click', () => {
    state.menuParityScreen = 'skills';
    render();
  });
  elements.mpEggs.addEventListener('click', () => {
    state.menuParityScreen = 'eggs';
    render();
  });
  elements.mpItems.addEventListener('click', () => {
    state.menuParityScreen = 'items';
    render();
  });
  elements.mpBestiary.addEventListener('click', () => {
    state.menuParityScreen = 'bestiary';
    render();
  });
  elements.mpConfig.addEventListener('click', () => {
    state.menuParityScreen = 'config';
    render();
  });
  elements.mpConfigSave.addEventListener('click', saveMenuParityConfig);
  elements.canvas.addEventListener('click', handleCanvasClick);
  elements.canvas.addEventListener('mousemove', handleCanvasPointerMove);
  elements.canvas.addEventListener('mouseleave', () => {
    elements.canvas.style.cursor = 'default';
  });
  window.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName ?? '';
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
      return;
    }
    const key = String(event.key ?? '').toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      state.navigationKeys[key] = true;
      ensureAnimationLoop();
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => {
    const key = String(event.key ?? '').toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      state.navigationKeys[key] = false;
      event.preventDefault();
    }
  });
  elements.nextTurn.addEventListener('click', stepBattle);
  elements.autoBattle.addEventListener('click', autoBattle);
  elements.exportLog.addEventListener('click', exportCurrentBattleLog);
  elements.resetBattle.addEventListener('click', resetBattleFromCurrentTab);
  elements.playStart.addEventListener('click', resetPlayBattleFromForms);
  elements.simulate.addEventListener('click', runBalanceSnapshot);
  elements.scenarioApply.addEventListener('click', () => {
    state.appliedStoryArcId = null;
    state.appliedStoryBeatId = null;
    applyScenarioPreset(elements.scenarioSelect.value);
    state.debugOutput = `Scenario applied: ${SCENARIO_PRESETS[elements.scenarioSelect.value]?.label ?? elements.scenarioSelect.value}`;
    state.battle = createBattleForCurrentContext();
    render();
  });
  elements.scenarioRunApply.addEventListener('click', () => {
    state.appliedStoryArcId = null;
    state.appliedStoryBeatId = null;
    applyScenarioRunPreset(elements.scenarioRunSelect.value);
    state.battle = createBattleForCurrentContext();
    render();
  });
  elements.campaignStartRun?.addEventListener('click', startNewCampaignRun);
  elements.campaignResumeRun?.addEventListener('click', () => {
    const loaded = loadCampaignStateFromLocalStorage();
    state.debugOutput = loaded ? 'Campaign state loaded from localStorage.' : 'No saved campaign state found.';
    state.activeTab = 'campaign';
    refreshStorySelectors();
    render();
  });
  elements.campaignNextScene?.addEventListener('click', advanceCampaignScene);
  elements.campaignLaunchBattle?.addEventListener('click', launchCampaignBattleFromCurrentScene);
  elements.campaignContinueAfterBattle?.addEventListener('click', () => {
    const page = getCurrentCampaignScenePage();
    if (page?.action === 'complete-placeholder') {
      completeCurrentPlaceholderBeat();
      return;
    }
    continueAfterCampaignBattle();
  });
  elements.campaignRetryBeat?.addEventListener('click', retryCurrentCampaignBattle);
  elements.campaignAbandonRun?.addEventListener('click', abandonCampaignRun);
  elements.campaignArcSelect?.addEventListener('change', (event) => setCampaignArc(event.target.value));
  elements.campaignBeatSelect?.addEventListener('change', (event) => setCampaignBeat(event.target.value));
  elements.campaignPrevBeat?.addEventListener('click', () => stepCampaignBeat(-1));
  elements.campaignNextBeat?.addEventListener('click', () => stepCampaignBeat(1));
  elements.campaignStartBeat?.addEventListener('click', startCurrentStoryBeatBattle);
  elements.campaignContinueFlow?.addEventListener('click', continueCampaignFlow);
  elements.campaignApplyOnly?.addEventListener('click', () => {
    const beat = getCurrentStoryBeat();
    if (!beat) return;
    applyStoryBeat(beat, { startBattle: false });
    saveCampaignStateToLocalStorage();
    render();
  });
  elements.campaignCompleteNext?.addEventListener('click', () => {
    markCurrentBeatCompleteAndAdvance();
    refreshStorySelectors();
    render();
  });
  elements.campaignSaveState?.addEventListener('click', () => {
    const payload = saveCampaignStateToLocalStorage();
    state.debugOutput = `Campaign state saved. Current beat: ${payload.currentStoryBeatId ?? 'n/a'}.`;
    render();
  });
  elements.campaignLoadState?.addEventListener('click', () => {
    const loaded = loadCampaignStateFromLocalStorage();
    state.debugOutput = loaded ? 'Campaign state loaded from localStorage.' : 'No saved campaign state found.';
    refreshStorySelectors();
    render();
  });
  elements.campaignResetState?.addEventListener('click', () => {
    resetCampaignState();
    state.debugOutput = 'Campaign state reset.';
    render();
  });
  elements.battleSeed.addEventListener('change', () => {
    readFormsToState();
    state.debugOutput = `Battle seed set to ${state.battleSeed}.`;
    state.battle = createBattleForCurrentContext();
    render();
  });
  elements.balanceApply.addEventListener('click', applyBalanceVectorEditor);
  elements.balanceResetDefaults.addEventListener('click', resetBalanceVectorDefaults);
  [elements.decisionFilterAction, elements.decisionFilterController, elements.decisionFilterDanger].forEach((element) => {
    element.addEventListener('change', () => {
      readFormsToState();
      render();
    });
  });
  elements.debugStartBattle.addEventListener('click', launchDebugBattle);
  elements.debugWinrate.addEventListener('click', runDebugWinrate);
  elements.debugTrain.addEventListener('click', trainVeteranFromDebug);
  elements.debugLoadArtifact.addEventListener('click', loadArtifactIntoBrowser);
  elements.debugImportArtifact.addEventListener('click', () => elements.debugImportArtifactInput.click());
  elements.debugImportArtifactInput.addEventListener('change', (event) => {
    const [file] = event.target.files ?? [];
    importArtifactFromLocalFile(file);
  });
  elements.debugSaveCurrent.addEventListener('click', saveCurrentBrowserTuning);
  elements.replayLoad.addEventListener('click', () => elements.replayLoadInput.click());
  elements.replayLoadInput.addEventListener('change', (event) => {
    const [file] = event.target.files ?? [];
    importReplayFromFile(file);
  });
  elements.replayPrev.addEventListener('click', () => replayStep(-1));
  elements.replayNext.addEventListener('click', () => replayStep(1));
  elements.replayPlay.addEventListener('click', toggleReplayAutoplay);
  elements.replaySpeed.addEventListener('change', () => {
    if (isReplayAutoplaying()) {
      stopReplayAutoplay();
      toggleReplayAutoplay();
    } else {
      render();
    }
  });
  elements.replaySlider.addEventListener('input', (event) => {
    stopReplayAutoplay();
    setReplayIndex(event.target.value);
  });
  elements.replayClose.addEventListener('click', () => {
    closeReplay();
    render();
  });
  elements.compareLoadLeft.addEventListener('click', () => elements.compareLoadLeftInput.click());
  elements.compareLoadRight.addEventListener('click', () => elements.compareLoadRightInput.click());
  elements.compareLoadLeftInput.addEventListener('change', async (event) => {
    const [file] = event.target.files ?? [];
    await importCompareReplay('left', file);
    elements.compareLoadLeftInput.value = '';
  });
  elements.compareLoadRightInput.addEventListener('change', async (event) => {
    const [file] = event.target.files ?? [];
    await importCompareReplay('right', file);
    elements.compareLoadRightInput.value = '';
  });
  elements.comparePrev.addEventListener('click', () => stepCompare(-1));
  elements.compareNext.addEventListener('click', () => stepCompare(1));
  elements.comparePlay.addEventListener('click', toggleCompareAutoplay);
  elements.compareSpeed.addEventListener('change', () => {
    if (isCompareAutoplaying()) {
      stopCompareAutoplay();
      toggleCompareAutoplay();
    } else {
      render();
    }
  });
  elements.compareSlider.addEventListener('input', (event) => {
    stopCompareAutoplay();
    setCompareIndex(event.target.value);
  });
  elements.compareExportJson.addEventListener('click', () => {
    downloadJson('compare-diff.json', buildCompareDiffPayload());
  });
  elements.compareExportTxt.addEventListener('click', () => {
    const blob = new Blob([buildCompareDiffText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compare-diff.txt';
    link.click();
    URL.revokeObjectURL(url);
  });
  elements.compareClear.addEventListener('click', () => {
    clearCompare();
    render();
  });
}

async function init() {
  preloadArtAssets();
  populateDecisionActionFilterOptions();
  state.playEnemyAi = state.settings.defaultPlayEnemyAi ?? state.playEnemyAi;
  state.battlefieldTheme = state.settings.defaultBattlefieldTheme ?? state.battlefieldTheme;
  if (elements.replaySpeed) {
    elements.replaySpeed.value = String(state.settings.replaySpeedMs ?? 550);
  }
  writeStateToForms();
  bindEvents();
  resetToPlayBattle();
  render();
  await Promise.all([
    loadArtifactIntoBrowser(),
    loadStoryData(),
  ]);
  loadCampaignStateFromLocalStorage();
  refreshStorySelectors();
  render();
  console.log('Vertical Slice A initialized with play/debug/campaign menu, story beats, campaign progress, manual control, AI debug tools, and battle log export.');
}

init();
