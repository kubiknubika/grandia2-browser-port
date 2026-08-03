export const FIELD_WIDTH = 960;
export const FIELD_HEIGHT = 360;
export const IP_MAX = 1000;
export const COM_START = 700;
export const ACT_POINT = 1000;
export const WAIT_SPEED_SCALE = 7;
export const MAX_EVENT_SIM_SECONDS = 30;
export const MANUAL_ACTION_PENDING = '__manual_action_pending__';

const PLAYER_EVADE_POINTS = [
  { x: 110, y: 80 },
  { x: 110, y: 280 },
  { x: 250, y: 180 },
];

const ENEMY_EVADE_POINTS = [
  { x: 850, y: 80 },
  { x: 850, y: 280 },
  { x: 710, y: 180 },
];

export const DEFAULT_BALANCE_PROFILE = {
  playerScale: { hp: 1, str: 1, vit: 1, agi: 1, spd: 1, mag: 1, men: 1 },
  enemyScale: { hp: 1.1555, str: 1.238, vit: 1.082, agi: 1.102, spd: 1.058, mag: 1, men: 1 },
  actionOverrides: {
    heal: { powerBase: 34, costMp: 13 },
    wingSlice: { power: 0.9428, ipDamage: 110, costSp: 17 },
    tenseiken: { power: 1.1138, ipDamage: 231 },
  },
};

export const ACTION_LIBRARY = {
  combo: {
    id: 'combo',
    label: 'Combo',
    kind: 'physical',
    commandType: 'basic',
    targeting: 'single',
    chargeMultiplier: 4,
    melee: true,
    range: 26,
    moveSeconds: 1.15,
    hitCount: 2,
    power: 0.58,
    ipDamage: 35,
    spGainOnHit: 4,
  },
  critical: {
    id: 'critical',
    label: 'Critical',
    kind: 'physical',
    commandType: 'basic',
    targeting: 'single',
    chargeMultiplier: 1.8,
    melee: true,
    range: 28,
    moveSeconds: 1.2,
    hitCount: 1,
    power: 0.95,
    ipDamage: 180,
    cancel: true,
    cancelPushback: 260,
    spGainOnHit: 5,
  },
  endure: {
    id: 'endure',
    label: 'Endure',
    kind: 'defense',
    commandType: 'defense',
    targeting: 'self',
    instant: true,
  },
  evade: {
    id: 'evade',
    label: 'Evade',
    kind: 'defense',
    commandType: 'defense',
    targeting: 'point',
    instant: true,
  },
  tenseiken: {
    id: 'tenseiken',
    label: 'Tenseiken Slash',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.55,
    melee: true,
    range: 32,
    moveSeconds: 1.3,
    hitCount: 1,
    power: 1.15,
    ipDamage: 220,
    cancel: true,
    cancelPushback: 300,
    costSp: 24,
    spGainOnHit: 0,
    animationSeconds: 0.7,
  },
  impactBomb: {
    id: 'impactBomb',
    label: 'Impact Bomb',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.5,
    melee: false,
    hitCount: 1,
    power: 1.02,
    ipDamage: 210,
    cancel: true,
    cancelPushback: 280,
    costSp: 25,
    spGainOnHit: 0,
    animationSeconds: 0.65,
  },
  nightmareBall: {
    id: 'nightmareBall',
    label: 'Nightmare Ball',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.55,
    melee: false,
    hitCount: 1,
    power: 0.44,
    ipDamage: 45,
    costSp: 18,
    spGainOnHit: 0,
    statusEffects: [{ name: 'sleep', turns: 1, chance: 0.85 }],
    animationSeconds: 0.8,
  },
  heal: {
    id: 'heal',
    label: 'Heal',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.4,
    powerBase: 42,
    costMp: 12,
    animationSeconds: 0.75,
  },
  medicinalHerb: {
    id: 'medicinalHerb',
    label: 'Medicinal Herb',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    healBase: 78,
    inventoryKey: 'medicinalHerb',
  },
  antidote: {
    id: 'antidote',
    label: 'Antidote',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'antidote',
    cureStatuses: ['poison'],
  },
  woundSalve: {
    id: 'woundSalve',
    label: 'Wound Salve',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'woundSalve',
    healBase: 180,
  },
  healingHerb: {
    id: 'healingHerb',
    label: 'Healing Herb',
    kind: 'item',
    commandType: 'item',
    targeting: 'all-allies',
    instant: true,
    inventoryKey: 'healingHerb',
    healBase: 90,
  },
  eyeDrops: {
    id: 'eyeDrops',
    label: 'Eye Drops',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'eyeDrops',
    cureStatuses: ['sleep'],
  },
  moveBlessing: {
    id: 'moveBlessing',
    label: 'Move Blessing',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'moveBlessing',
    cureStatuses: ['moveBlock'],
  },
  magicBlessing: {
    id: 'magicBlessing',
    label: 'Magic Blessing',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'magicBlessing',
    cureStatuses: ['magicBlock'],
  },
  panacea: {
    id: 'panacea',
    label: 'Panacea',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'panacea',
    cureStatuses: ['poison', 'sleep', 'moveBlock', 'magicBlock'],
  },
  yomisElixir: {
    id: 'yomisElixir',
    label: "Yomi's Elixir",
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'yomisElixir',
    revive: true,
    reviveRatio: 0.35,
  },
  blueberry: {
    id: 'blueberry',
    label: 'Blueberry',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'blueberry',
    restoreSp: 30,
  },
  lumirFlower: {
    id: 'lumirFlower',
    label: 'Lumir Flower',
    kind: 'item',
    commandType: 'item',
    targeting: 'single-ally',
    instant: true,
    inventoryKey: 'lumirFlower',
    restoreMp: 18,
  },
  healingIncense: {
    id: 'healingIncense',
    label: 'Healing Incense',
    kind: 'item',
    commandType: 'item',
    targeting: 'all-allies',
    instant: true,
    inventoryKey: 'healingIncense',
    healBase: 150,
  },
  wow: {
    id: 'wow',
    label: 'WOW!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.28,
    costMp: 5,
    statShifts: [{ stat: 'atk', amount: 1, turns: 3, target: 'ally' }],
    animationSeconds: 0.68,
  },
  diggin: {
    id: 'diggin',
    label: 'Diggin\'',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-allies',
    chargeMultiplier: 1.24,
    costMp: 8,
    statShifts: [{ stat: 'def', amount: 1, turns: 3, target: 'ally' }],
    animationSeconds: 0.78,
  },
  speedy: {
    id: 'speedy',
    label: 'Speedy',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.22,
    costMp: 7,
    statShifts: [{ stat: 'act', amount: 1, turns: 3, target: 'ally' }],
    animationSeconds: 0.68,
  },
  stram: {
    id: 'stram',
    label: 'Stram',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.25,
    costMp: 6,
    statShifts: [{ stat: 'def', amount: -1, turns: 3, target: 'enemy' }],
    ipDamage: 18,
    animationSeconds: 0.74,
  },
  cold: {
    id: 'cold',
    label: 'Cold',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.26,
    costMp: 7,
    statShifts: [{ stat: 'act', amount: -1, turns: 3, target: 'enemy' }],
    ipDamage: 22,
    animationSeconds: 0.74,
  },
  burn: {
    id: 'burn',
    label: 'Burn!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.35,
    spellPower: 0.92,
    spellBase: 18,
    ipDamage: 70,
    costMp: 10,
    element: 'fire',
    animationSeconds: 0.7,
  },
  zap: {
    id: 'zap',
    label: 'Zap!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.3,
    spellPower: 1.04,
    spellBase: 22,
    ipDamage: 82,
    costMp: 15,
    element: 'lightning',
    animationSeconds: 0.72,
  },
  wingSlice: {
    id: 'wingSlice',
    label: 'Wing Slice',
    kind: 'physical',
    commandType: 'move',
    targeting: 'line',
    chargeMultiplier: 1.45,
    costSp: 18,
    lineLength: 260,
    lineWidth: 54,
    power: 0.82,
    ipDamage: 90,
    spGainOnHit: 0,
    animationSeconds: 0.72,
  },
  fallenWings: {
    id: 'fallenWings',
    label: 'Fallen Wings',
    kind: 'physical',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.28,
    costSp: 42,
    power: 0.72,
    ipDamage: 72,
    spGainOnHit: 0,
    animationSeconds: 0.95,
  },
  earthQuake: {
    id: 'earthQuake',
    label: 'Earth Quake',
    kind: 'physical',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.2,
    costSp: 30,
    power: 0.82,
    ipDamage: 104,
    spGainOnHit: 0,
    animationSeconds: 1.0,
  },
  tornadoHorn: {
    id: 'tornadoHorn',
    label: 'Tornado Horn',
    kind: 'physical',
    commandType: 'move',
    targeting: 'line',
    chargeMultiplier: 1.32,
    costSp: 24,
    lineLength: 320,
    lineWidth: 74,
    power: 1.02,
    ipDamage: 128,
    spGainOnHit: 0,
    statusEffects: [{ name: 'moveBlock', turns: 2, chance: 0.55 }],
    animationSeconds: 0.9,
  },
  lotusFlower: {
    id: 'lotusFlower',
    label: 'Lotus Flower',
    kind: 'physical',
    commandType: 'move',
    targeting: 'line',
    chargeMultiplier: 1.48,
    costSp: 28,
    lineLength: 250,
    lineWidth: 52,
    power: 0.78,
    ipDamage: 165,
    cancel: true,
    cancelPushback: 210,
    spGainOnHit: 0,
    animationSeconds: 0.7,
  },
  webTrap: {
    id: 'webTrap',
    label: 'Web Trap',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.5,
    melee: false,
    hitCount: 1,
    power: 0.34,
    ipDamage: 28,
    costSp: 14,
    spGainOnHit: 0,
    statusEffects: [{ name: 'moveBlock', turns: 2, chance: 0.9 }],
    animationSeconds: 0.7,
  },
  beastFangCut: {
    id: 'beastFangCut',
    label: 'Beast Fang Cut',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.4,
    melee: true,
    range: 36,
    moveSeconds: 1.35,
    hitCount: 1,
    power: 1.34,
    ipDamage: 188,
    cancel: true,
    cancelPushback: 240,
    costSp: 26,
    spGainOnHit: 0,
    animationSeconds: 0.88,
  },
  poisonSpit: {
    id: 'poisonSpit',
    label: 'Poison Spit',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.42,
    melee: false,
    hitCount: 1,
    power: 0.36,
    ipDamage: 24,
    costSp: 15,
    spGainOnHit: 0,
    statusEffects: [{ name: 'poison', turns: 3, chance: 0.88 }],
    animationSeconds: 0.72,
  },
  killerVoltage: {
    id: 'killerVoltage',
    label: 'Killer Voltage',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.22,
    costSp: 34,
    spellPower: 0.76,
    spellBase: 14,
    ipDamage: 68,
    statusEffects: [
      { name: 'moveBlock', turns: 1, chance: 0.42 },
      { name: 'magicBlock', turns: 1, chance: 0.38 }
    ],
    animationSeconds: 0.95,
  },
  destructionRay: {
    id: 'destructionRay',
    label: 'Destruction Ray',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.16,
    costSp: 38,
    spellPower: 0.92,
    spellBase: 20,
    ipDamage: 88,
    statusEffects: [{ name: 'magicBlock', turns: 1, chance: 0.45 }],
    animationSeconds: 1.02,
  },
  spellbindDust: {
    id: 'spellbindDust',
    label: 'Spellbind Dust',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.42,
    melee: false,
    hitCount: 1,
    power: 0.2,
    ipDamage: 16,
    costSp: 16,
    spGainOnHit: 0,
    statusEffects: [{ name: 'magicBlock', turns: 2, chance: 0.82 }],
    animationSeconds: 0.72,
  },
  flyingTenseiken: {
    id: 'flyingTenseiken',
    label: 'Flying Tenseiken',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.5,
    melee: false,
    hitCount: 1,
    power: 1.52,
    ipDamage: 250,
    cancel: true,
    cancelPushback: 320,
    costSp: 40,
    animationSeconds: 0.78,
  },
  purpleLightning: {
    id: 'purpleLightning',
    label: 'Purple Lightning',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.46,
    melee: true,
    range: 34,
    moveSeconds: 1.28,
    hitCount: 1,
    power: 1.38,
    ipDamage: 205,
    costSp: 32,
    animationSeconds: 0.84,
  },
  skyDragonSlash: {
    id: 'skyDragonSlash',
    label: 'Sky Dragon Slash',
    kind: 'physical',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.18,
    costSp: 99,
    power: 1.08,
    ipDamage: 110,
    animationSeconds: 1.12,
  },
  dropletsOfLife: {
    id: 'dropletsOfLife',
    label: 'Droplets of Life',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-allies',
    chargeMultiplier: 1.22,
    powerBase: 88,
    cureStatuses: ['poison', 'sleep', 'moveBlock', 'magicBlock'],
    costSp: 90,
    animationSeconds: 1.0,
  },
  whiteApocalypse: {
    id: 'whiteApocalypse',
    label: 'White Apocalypse',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.12,
    spellPower: 1.16,
    spellBase: 34,
    ipDamage: 92,
    costSp: 80,
    animationSeconds: 1.08,
  },
  goldenHammer: {
    id: 'goldenHammer',
    label: 'Golden Hammer',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.42,
    melee: true,
    range: 30,
    moveSeconds: 1.2,
    power: 1.08,
    ipDamage: 170,
    costSp: 22,
    cancel: true,
    cancelPushback: 220,
    animationSeconds: 0.72,
  },
  dragonRise: {
    id: 'dragonRise',
    label: 'Dragon Rise',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.46,
    melee: true,
    range: 32,
    moveSeconds: 1.25,
    power: 1.36,
    ipDamage: 210,
    costSp: 38,
    animationSeconds: 0.82,
  },
  snowballFight: {
    id: 'snowballFight',
    label: 'Snowball Fight',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.2,
    spellPower: 0.9,
    spellBase: 18,
    ipDamage: 66,
    costSp: 40,
    statusEffects: [{ name: 'sleep', turns: 1, chance: 0.22 }],
    animationSeconds: 0.94,
  },
  vitalityMarch: {
    id: 'vitalityMarch',
    label: 'Vitality March',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-allies',
    chargeMultiplier: 1.18,
    powerBase: 36,
    statShifts: [
      { stat: 'def', amount: 1, turns: 3, target: 'ally' },
      { stat: 'atk', amount: 1, turns: 2, target: 'ally' },
    ],
    costSp: 20,
    animationSeconds: 0.86,
  },
  trueDragonRise: {
    id: 'trueDragonRise',
    label: 'True Dragon Rise',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.44,
    melee: true,
    range: 32,
    moveSeconds: 1.25,
    power: 1.46,
    ipDamage: 230,
    costSp: 42,
    animationSeconds: 0.86,
  },
  icePrison: {
    id: 'icePrison',
    label: 'Ice Prison',
    kind: 'magic',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.28,
    spellPower: 0.82,
    spellBase: 14,
    ipDamage: 58,
    costSp: 30,
    statusEffects: [{ name: 'moveBlock', turns: 2, chance: 0.8 }],
    animationSeconds: 0.8,
  },
  beastKingSmash: {
    id: 'beastKingSmash',
    label: 'Beast King Smash',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.42,
    melee: true,
    range: 34,
    moveSeconds: 1.28,
    power: 1.56,
    ipDamage: 220,
    costSp: 44,
    animationSeconds: 0.92,
  },
  beastKingBlast: {
    id: 'beastKingBlast',
    label: 'Beast King Blast',
    kind: 'physical',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.18,
    costSp: 52,
    power: 1.02,
    ipDamage: 90,
    animationSeconds: 1.04,
  },
  lionsRoar: {
    id: 'lionsRoar',
    label: "Lion's Roar",
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-allies',
    chargeMultiplier: 1.16,
    statShifts: [
      { stat: 'atk', amount: 1, turns: 3, target: 'ally' },
      { stat: 'def', amount: 1, turns: 3, target: 'ally' },
    ],
    costSp: 18,
    animationSeconds: 0.78,
  },
  fastDanceWhirl: {
    id: 'fastDanceWhirl',
    label: 'Fast Dance-Whirl',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.45,
    melee: true,
    range: 30,
    moveSeconds: 1.18,
    power: 1.42,
    ipDamage: 215,
    costSp: 38,
    animationSeconds: 0.76,
  },
  tornado: {
    id: 'tornado',
    label: 'Tornado',
    kind: 'physical',
    commandType: 'move',
    targeting: 'all-enemies',
    chargeMultiplier: 1.2,
    costSp: 48,
    power: 0.92,
    ipDamage: 82,
    statusEffects: [{ name: 'moveBlock', turns: 1, chance: 0.35 }],
    animationSeconds: 1.0,
  },
  whisperToStars: {
    id: 'whisperToStars',
    label: 'Whisper to Stars',
    kind: 'magic',
    commandType: 'move',
    targeting: 'all-allies',
    chargeMultiplier: 1.2,
    powerBase: 54,
    cureStatuses: ['poison', 'sleep', 'moveBlock', 'magicBlock'],
    statShifts: [{ stat: 'act', amount: 1, turns: 2, target: 'ally' }],
    costSp: 36,
    animationSeconds: 0.96,
  },
  arrowShot: {
    id: 'arrowShot',
    label: 'Arrow Shot',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.38,
    melee: false,
    power: 1.06,
    ipDamage: 130,
    costSp: 25,
    animationSeconds: 0.72,
  },
  heelCrush: {
    id: 'heelCrush',
    label: 'Heel Crush',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.34,
    melee: true,
    range: 28,
    moveSeconds: 1.14,
    power: 0.98,
    ipDamage: 140,
    costSp: 20,
    statusEffects: [{ name: 'moveBlock', turns: 1, chance: 0.65 }],
    animationSeconds: 0.68,
  },
  starvingTongue: {
    id: 'starvingTongue',
    label: 'Starving Tongue',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.42,
    melee: true,
    range: 32,
    moveSeconds: 1.22,
    power: 1.48,
    ipDamage: 180,
    costSp: 55,
    animationSeconds: 0.9,
  },
  spellbindingEye: {
    id: 'spellbindingEye',
    label: 'Spellbinding Eye',
    kind: 'magic',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.3,
    spellPower: 0.46,
    spellBase: 8,
    ipDamage: 26,
    costSp: 60,
    statusEffects: [
      { name: 'moveBlock', turns: 2, chance: 0.8 },
      { name: 'magicBlock', turns: 2, chance: 0.8 },
    ],
    animationSeconds: 0.84,
  },
  grudgingClaws: {
    id: 'grudgingClaws',
    label: 'Grudging Claws',
    kind: 'physical',
    commandType: 'move',
    targeting: 'single',
    chargeMultiplier: 1.45,
    melee: true,
    range: 34,
    moveSeconds: 1.25,
    power: 1.44,
    ipDamage: 210,
    costSp: 42,
    animationSeconds: 0.86,
  },
  healer: {
    id: 'healer',
    label: 'Healer',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.3,
    powerBase: 72,
    costMp: 12,
    animationSeconds: 0.82,
  },
  healerPlus: {
    id: 'healerPlus',
    label: 'Healer+',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.28,
    powerBase: 118,
    costMp: 24,
    animationSeconds: 0.9,
  },
  alhealer: {
    id: 'alhealer',
    label: 'Alhealer',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-allies',
    chargeMultiplier: 1.22,
    powerBase: 52,
    costMp: 18,
    animationSeconds: 0.96,
  },
  tremor: {
    id: 'tremor',
    label: 'Tremor',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.32,
    spellPower: 0.96,
    spellBase: 20,
    ipDamage: 72,
    costMp: 15,
    animationSeconds: 0.78,
  },
  quake: {
    id: 'quake',
    label: 'Quake',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.16,
    spellPower: 1.18,
    spellBase: 34,
    ipDamage: 96,
    costMp: 40,
    animationSeconds: 1.08,
  },
  crackle: {
    id: 'crackle',
    label: 'Crackle',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.3,
    spellPower: 0.96,
    spellBase: 18,
    ipDamage: 74,
    costMp: 16,
    animationSeconds: 0.78,
  },
  crackling: {
    id: 'crackling',
    label: 'Crackling',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.16,
    spellPower: 1.08,
    spellBase: 24,
    ipDamage: 90,
    costMp: 52,
    animationSeconds: 1.02,
  },
  snooze: {
    id: 'snooze',
    label: 'Snooze',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.18,
    costMp: 5,
    statusEffects: [{ name: 'sleep', turns: 1, chance: 0.88 }],
    animationSeconds: 0.7,
  },
  shhh: {
    id: 'shhh',
    label: 'Shhh!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.16,
    costMp: 10,
    spellPower: 0.28,
    spellBase: 2,
    ipDamage: 20,
    statusEffects: [{ name: 'magicBlock', turns: 1, chance: 0.7 }],
    animationSeconds: 0.86,
  },
  fiora: {
    id: 'fiora',
    label: 'Fiora',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.18,
    powerBase: 24,
    statShifts: [{ stat: 'def', amount: 1, turns: 2, target: 'ally' }],
    costMp: 12,
    animationSeconds: 0.74,
  },
  gravity: {
    id: 'gravity',
    label: 'Gravity',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.2,
    costMp: 8,
    statShifts: [
      { stat: 'mov', amount: -1, turns: 2, target: 'enemy' },
      { stat: 'act', amount: -1, turns: 2, target: 'enemy' },
    ],
    animationSeconds: 0.72,
  },
  cure: {
    id: 'cure',
    label: 'Cure',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.12,
    cureStatuses: ['poison'],
    costMp: 4,
    animationSeconds: 0.62,
  },
  refresh: {
    id: 'refresh',
    label: 'Refresh',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.14,
    cureStatuses: ['poison', 'sleep', 'moveBlock', 'magicBlock'],
    costMp: 12,
    animationSeconds: 0.72,
  },
  runner: {
    id: 'runner',
    label: 'Runner',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-allies',
    chargeMultiplier: 1.1,
    statShifts: [{ stat: 'mov', amount: 1, turns: 3, target: 'ally' }],
    costMp: 3,
    animationSeconds: 0.6,
  },
  burnflame: {
    id: 'burnflame',
    label: 'Burnflame',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.34,
    spellPower: 1.08,
    spellBase: 28,
    ipDamage: 84,
    costMp: 16,
    element: 'fire',
    animationSeconds: 0.82,
  },
  burnstrike: {
    id: 'burnstrike',
    label: 'Burnstrike',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.34,
    spellPower: 1.16,
    spellBase: 34,
    ipDamage: 92,
    costMp: 20,
    element: 'fire',
    animationSeconds: 0.88,
  },
  hellburner: {
    id: 'hellburner',
    label: 'Hellburner',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.14,
    spellPower: 1.2,
    spellBase: 38,
    ipDamage: 102,
    costMp: 42,
    element: 'fire',
    animationSeconds: 1.12,
  },
  howl: {
    id: 'howl',
    label: 'Howl',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.26,
    spellPower: 0.82,
    spellBase: 14,
    ipDamage: 56,
    costMp: 9,
    animationSeconds: 0.72,
  },
  howlslash: {
    id: 'howlslash',
    label: 'Howlslash',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.28,
    spellPower: 0.96,
    spellBase: 18,
    ipDamage: 64,
    costMp: 14,
    animationSeconds: 0.76,
  },
  howlnado: {
    id: 'howlnado',
    label: 'Howlnado',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.14,
    spellPower: 1.12,
    spellBase: 26,
    ipDamage: 88,
    costMp: 45,
    animationSeconds: 1.04,
  },
  zapAll: {
    id: 'zapAll',
    label: 'Zap All',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'all-enemies',
    chargeMultiplier: 1.16,
    spellPower: 1.08,
    spellBase: 26,
    ipDamage: 90,
    costMp: 36,
    element: 'lightning',
    animationSeconds: 1.0,
  },
  dragonZap: {
    id: 'dragonZap',
    label: 'Dragon Zap!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.3,
    spellPower: 1.32,
    spellBase: 36,
    ipDamage: 108,
    costMp: 58,
    element: 'lightning',
    animationSeconds: 0.98,
  },
  freeze: {
    id: 'freeze',
    label: 'Freeze!',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.18,
    spellPower: 0.4,
    spellBase: 6,
    ipDamage: 22,
    costMp: 5,
    statusEffects: [{ name: 'moveBlock', turns: 2, chance: 0.72 }],
    animationSeconds: 0.66,
  },
  defLoss: {
    id: 'defLoss',
    label: 'Def Loss',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single',
    chargeMultiplier: 1.14,
    costMp: 5,
    statShifts: [{ stat: 'def', amount: -1, turns: 3, target: 'enemy' }],
    animationSeconds: 0.64,
  },
  resurrect: {
    id: 'resurrect',
    label: 'Resurrect',
    kind: 'magic',
    commandType: 'magic',
    targeting: 'single-ally',
    chargeMultiplier: 1.18,
    revive: true,
    reviveRatio: 0.35,
    costMp: 40,
    animationSeconds: 1.0,
  },
};

export class IPGaugeTimeline {
  constructor() {
    this.elapsedSeconds = 0;
    this.comStart = COM_START;
    this.actPoint = ACT_POINT;
  }

  advance(fighters, deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;

    for (const fighter of fighters) {
      if (!fighter.isAlive) {
        continue;
      }

      const act = getBattleStat(fighter, 'ACT');
      const multiplier = fighter.pendingAction
        ? fighter.pendingAction.definition.chargeMultiplier
        : 1;

      fighter.ip = Math.min(IP_MAX, fighter.ip + act * WAIT_SPEED_SCALE * multiplier * deltaSeconds);
    }
  }
}

function clonePoint(point) {
  return { x: point.x, y: point.y };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function normalize(dx, dy) {
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function moveTowards(from, to, distanceLimit) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const total = Math.hypot(dx, dy);

  if (total <= distanceLimit) {
    return clonePoint(to);
  }

  const vector = normalize(dx, dy);
  return {
    x: from.x + vector.x * distanceLimit,
    y: from.y + vector.y * distanceLimit,
  };
}

function distancePointToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const segmentLengthSquared = dx * dx + dy * dy;

  if (segmentLengthSquared === 0) {
    return distance(point, start);
  }

  const projection = clamp(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / segmentLengthSquared,
    0,
    1,
  );

  const projected = {
    x: start.x + dx * projection,
    y: start.y + dy * projection,
  };

  return distance(point, projected);
}

function scaleNumber(value, scale = 1) {
  return Math.max(1, Math.round(value * scale));
}

function mergeScale(base = {}, extra = {}) {
  return {
    hp: (base.hp ?? 1) * (extra.hp ?? 1),
    str: (base.str ?? 1) * (extra.str ?? 1),
    vit: (base.vit ?? 1) * (extra.vit ?? 1),
    agi: (base.agi ?? 1) * (extra.agi ?? 1),
    spd: (base.spd ?? 1) * (extra.spd ?? 1),
    mag: (base.mag ?? 1) * (extra.mag ?? 1),
    men: (base.men ?? 1) * (extra.men ?? 1),
  };
}

function randomVariance(rng = Math.random) {
  return 0.94 + rng() * 0.12;
}

function hpRatio(fighter) {
  return fighter.hp / fighter.maxHp;
}

function getScaleForTeam(balance, team) {
  const teamScale = team === 'players' ? balance.playerScale : balance.enemyScale;
  return mergeScale({}, teamScale);
}

function getActionDefinition(battle, actionId) {
  const base = ACTION_LIBRARY[actionId];
  if (!base) {
    throw new Error(`Unknown action definition: ${actionId}`);
  }

  return {
    ...base,
    ...(battle.balance?.actionOverrides?.[actionId] ?? {}),
  };
}

export function getBattleStat(fighter, stat) {
  const stage = (fighter.buffs?.[stat.toLowerCase()] ?? 0) - (fighter.debuffs?.[stat.toLowerCase()] ?? 0);
  switch (stat) {
    case 'ATK':
      return fighter.str + stage * 3;
    case 'DEF':
      return fighter.vit + stage * 3;
    case 'ACT':
      return fighter.agi + stage * 4;
    case 'MOV':
      return 180 + fighter.spd * 8 + stage * 20;
    default:
      throw new Error(`Unknown battle stat: ${stat}`);
  }
}

function estimatePhysicalDamage(attacker, defender, power) {
  const attackValue = getBattleStat(attacker, 'ATK');
  const defenseValue = getBattleStat(defender, 'DEF');
  const base = attackValue * power - defenseValue * 0.45;
  return Math.max(1, Math.round(base));
}

function calcPhysicalDamage(attacker, defender, power, rng = Math.random) {
  const attackValue = getBattleStat(attacker, 'ATK');
  const defenseValue = getBattleStat(defender, 'DEF');
  const base = attackValue * power - defenseValue * 0.45;
  return Math.max(1, Math.round(base * randomVariance(rng)));
}

function elementalMultiplier(target, element) {
  if (!element) {
    return 1;
  }

  return target.resistances?.[element] ?? 1;
}

function calcMagicDamage(attacker, defender, spellPower, spellBase = 0, rng = Math.random, element = null) {
  const base = attacker.mag * spellPower - defender.men * 0.35 + spellBase;
  return Math.max(1, Math.round(base * elementalMultiplier(defender, element) * randomVariance(rng)));
}

function calcHealAmount(caster, spellBase) {
  return Math.max(1, Math.round(caster.mag * 0.55 + caster.men * 0.3 + spellBase));
}

function gainSp(fighter, amount) {
  fighter.sp = clamp(fighter.sp + amount, 0, fighter.maxSp);
}

function spendSp(fighter, amount) {
  fighter.sp = clamp(fighter.sp - amount, 0, fighter.maxSp);
}

function spendMp(fighter, amount) {
  fighter.mp = clamp(fighter.mp - amount, 0, fighter.maxMp);
}

function isMoveBlocked(fighter) {
  return (fighter.statuses?.moveBlock ?? 0) > 0;
}

function isMagicBlocked(fighter) {
  return (fighter.statuses?.magicBlock ?? 0) > 0;
}

function uniqueActionIds(ids = []) {
  return [...new Set(ids.filter(Boolean))];
}

function loadoutActionIds(loadout, singularKey, pluralKey) {
  if (!loadout) {
    return [];
  }
  return uniqueActionIds([
    ...(Array.isArray(loadout[pluralKey]) ? loadout[pluralKey] : []),
    loadout[singularKey],
  ]);
}

function statusMoveIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'statusMove', 'statusMoves');
}

function singleMoveIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'singleMove', 'singleMoves');
}

function cancelMoveIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'cancelMove', 'cancelMoves');
}

function lineMoveIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'lineMove', 'lineMoves');
}

function aoeMoveIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'aoeMove', 'aoeMoves');
}

function healMagicIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'healMagic', 'healMagics');
}

function offensiveMagicIds(fighter) {
  return loadoutActionIds(fighter.loadout, 'offensiveMagic', 'offensiveMagics');
}

function canPayActionCost(fighter, definition) {
  return (fighter.sp ?? 0) >= (definition.costSp ?? 0)
    && (fighter.mp ?? 0) >= (definition.costMp ?? 0);
}

function activeStatusLabels(fighter) {
  const statusFlags = Object.entries(fighter.statuses ?? {})
    .filter(([, turns]) => turns > 0)
    .map(([name, turns]) => `${name}:${turns}`);

  const buffFlags = [];
  for (const stat of ['atk', 'def', 'act', 'mov']) {
    const buff = fighter.buffs?.[stat] ?? 0;
    const debuff = fighter.debuffs?.[stat] ?? 0;
    if (buff > 0) {
      buffFlags.push(`${stat}+${buff}`);
    }
    if (debuff > 0) {
      buffFlags.push(`${stat}-${debuff}`);
    }
  }

  return [...statusFlags, ...buffFlags];
}

function applyStatus(target, effect, rng = Math.random) {
  if (!effect) {
    return false;
  }

  const resistance = target.statusResistances?.[effect.name] ?? 1;
  const chance = effect.chance != null ? Math.max(0, Math.min(1, effect.chance * resistance)) : 1;
  if (rng() > chance) {
    return false;
  }

  target.statuses[effect.name] = Math.max(target.statuses[effect.name] ?? 0, effect.turns ?? 1);
  return true;
}

function applyStatShift(target, shift) {
  if (!shift?.stat || !shift.amount) {
    return false;
  }

  const targetMap = shift.amount > 0 ? target.buffs : target.debuffs;
  const timerMap = shift.amount > 0 ? target.buffTimers : target.debuffTimers;
  const value = Math.abs(shift.amount);
  targetMap[shift.stat] = Math.max(targetMap[shift.stat] ?? 0, value);
  timerMap[shift.stat] = Math.max(timerMap[shift.stat] ?? 0, shift.turns ?? 2);
  return true;
}

function processTimedModifiers(fighter) {
  const expired = [];
  for (const stat of ['atk', 'def', 'act', 'mov']) {
    if ((fighter.buffTimers?.[stat] ?? 0) > 0) {
      fighter.buffTimers[stat] = Math.max(0, fighter.buffTimers[stat] - 1);
      if (fighter.buffTimers[stat] === 0) {
        fighter.buffs[stat] = 0;
        expired.push(`${stat}Up`);
      }
    }
    if ((fighter.debuffTimers?.[stat] ?? 0) > 0) {
      fighter.debuffTimers[stat] = Math.max(0, fighter.debuffTimers[stat] - 1);
      if (fighter.debuffTimers[stat] === 0) {
        fighter.debuffs[stat] = 0;
        expired.push(`${stat}Down`);
      }
    }
  }
  return expired;
}

function processTurnStartStatuses(battle, fighter) {
  const notes = [];

  if ((fighter.statuses.poison ?? 0) > 0) {
    const poisonDamage = Math.max(1, Math.round(fighter.maxHp * 0.06));
    fighter.hp = Math.max(0, fighter.hp - poisonDamage);
    fighter.statuses.poison = Math.max(0, fighter.statuses.poison - 1);
    notes.push(`${fighter.name} suffers poison for ${poisonDamage}`);
    if (fighter.hp <= 0) {
      markDown(fighter);
      return {
        stopTurn: true,
        text: `${notes.join('. ')} and falls.`,
      };
    }
  }

  fighter.bossReactionCooldown = Math.max(0, (fighter.bossReactionCooldown ?? 0) - 1);

  const expired = [];
  for (const key of ['moveBlock', 'magicBlock']) {
    if ((fighter.statuses[key] ?? 0) > 0) {
      fighter.statuses[key] = Math.max(0, fighter.statuses[key] - 1);
      if (fighter.statuses[key] === 0) {
        expired.push(key);
      }
    }
  }

  if ((fighter.statuses.sleep ?? 0) > 0) {
    fighter.statuses.sleep = Math.max(0, fighter.statuses.sleep - 1);
    finishTurn(fighter);
    const parts = [...notes, `${fighter.name} is asleep and loses the turn`];
    return {
      stopTurn: true,
      text: parts.join('. '),
    };
  }

  const expiredBuffs = processTimedModifiers(fighter);

  if (expired.length > 0) {
    notes.push(`${fighter.name} shakes off ${expired.join(', ')}`);
  }
  if (expiredBuffs.length > 0) {
    notes.push(`${fighter.name} loses ${expiredBuffs.join(', ')}`);
  }

  if (notes.length > 0) {
    return {
      stopTurn: false,
      text: `${notes.join('. ')}.`,
    };
  }

  return null;
}

function clearPendingAction(fighter) {
  fighter.pendingAction = null;
  fighter.preTurnResolved = false;
  fighter.state = fighter.isAlive ? 'waiting' : 'down';
}

function finishTurn(fighter) {
  fighter.pendingAction = null;
  fighter.preTurnResolved = false;
  fighter.state = fighter.isAlive ? 'waiting' : 'down';
  fighter.ip = 0;

  const retreatDistance = Math.min(getBattleStat(fighter, 'MOV') * 0.35, distance(fighter.position, fighter.home));
  fighter.position = moveTowards(fighter.position, fighter.home, retreatDistance);
}

function markDown(fighter) {
  fighter.hp = 0;
  fighter.ip = 0;
  fighter.state = 'down';
  fighter.pendingAction = null;
  fighter.preTurnResolved = false;
  fighter.guard = null;
}

function battleTeam(battle, fighter) {
  return fighter.team === 'players' ? battle.players : battle.enemies;
}

function opposingTeam(battle, fighter) {
  return fighter.team === 'players' ? battle.enemies : battle.players;
}

function allCombatants(battle) {
  return [...battle.players, ...battle.enemies];
}

export function listLiving(fighters) {
  return fighters.filter((fighter) => fighter.isAlive);
}

export function isBattleOver(players, enemies) {
  return listLiving(players).length === 0 || listLiving(enemies).length === 0;
}

function livingOpponents(battle, fighter) {
  return listLiving(opposingTeam(battle, fighter));
}

function livingAllies(battle, fighter) {
  return listLiving(battleTeam(battle, fighter));
}

function chooseLowestHpTarget(fighters) {
  return listLiving(fighters).sort((left, right) => left.hp - right.hp || left.ip - right.ip)[0] ?? null;
}

function chooseThreateningTarget(fighters) {
  return listLiving(fighters)
    .filter((fighter) => fighter.pendingAction && fighter.ip >= COM_START)
    .sort((left, right) => right.ip - left.ip || right.agi - left.agi)[0] ?? null;
}

function chooseNearestTarget(origin, fighters) {
  return listLiving(fighters)
    .sort((left, right) => distance(origin, left.position) - distance(origin, right.position))[0] ?? null;
}

export function chooseEvadePointsForFighter(fighter) {
  return (fighter.team === 'players' ? PLAYER_EVADE_POINTS : ENEMY_EVADE_POINTS).map(clonePoint);
}

function chooseEvadePointHeuristic(battle, fighter) {
  const anchors = chooseEvadePointsForFighter(fighter);
  const opponents = livingOpponents(battle, fighter);
  const allies = livingAllies(battle, fighter).filter((ally) => ally.id !== fighter.id);

  const scored = anchors.map((anchor) => {
    const nearestEnemyDistance = opponents.length === 0
      ? 0
      : Math.min(...opponents.map((opponent) => distance(anchor, opponent.position)));

    const separationScore = allies.length === 0
      ? 0
      : Math.min(...allies.map((ally) => Math.abs(anchor.y - ally.position.y)));

    return {
      anchor,
      score: nearestEnemyDistance + separationScore * 0.75,
    };
  });

  return clonePoint(scored.sort((left, right) => right.score - left.score)[0].anchor);
}

function lineHitsFromPoint(origin, endPoint, width, targets) {
  return listLiving(targets).filter((target) => distancePointToSegment(target.position, origin, endPoint) <= width / 2 + target.radius);
}

function chooseBestLineAttackForTargets(attackerPosition, targets, definition) {
  if (targets.length === 0) {
    return null;
  }

  const candidatePoints = targets.map((target) => ({
    point: target.position,
    primaryTarget: target,
  }));

  for (let index = 0; index < targets.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < targets.length; nextIndex += 1) {
      candidatePoints.push({
        point: {
          x: (targets[index].position.x + targets[nextIndex].position.x) / 2,
          y: (targets[index].position.y + targets[nextIndex].position.y) / 2,
        },
        primaryTarget: targets[index],
      });
    }
  }

  const options = candidatePoints.map(({ point, primaryTarget }) => {
    const direction = normalize(point.x - attackerPosition.x, point.y - attackerPosition.y);
    const endPoint = {
      x: attackerPosition.x + direction.x * definition.lineLength,
      y: attackerPosition.y + direction.y * definition.lineLength,
    };

    const hits = lineHitsFromPoint(attackerPosition, endPoint, definition.lineWidth, targets);
    return {
      primaryTarget,
      endPoint,
      hits,
    };
  });

  return options.sort((left, right) => right.hits.length - left.hits.length)[0] ?? null;
}

function chooseBestLineAttack(battle, fighter, actionId) {
  const definition = getActionDefinition(battle, actionId);
  const opponents = livingOpponents(battle, fighter);
  return chooseBestLineAttackForTargets(fighter.position, opponents, definition);
}

function maxProjectedLineHits(battle, defendingTeam, overrides = []) {
  const targets = defendingTeam.map((fighter) => {
    const override = overrides.find((item) => item.id === fighter.id);
    return override ? { ...fighter, position: clonePoint(override.position) } : fighter;
  });

  const attackers = listLiving(defendingTeam === battle.players ? battle.enemies : battle.players)
    .filter((fighter) => fighter.loadout.lineMove && fighter.sp >= getActionDefinition(battle, fighter.loadout.lineMove).costSp);

  if (attackers.length === 0) {
    return 0;
  }

  let best = 0;
  for (const attacker of attackers) {
    const definition = getActionDefinition(battle, attacker.loadout.lineMove);
    const line = chooseBestLineAttackForTargets(attacker.position, targets, definition);
    best = Math.max(best, line?.hits.length ?? 0);
  }

  return best;
}

function createCombatant(config, balance) {
  const scale = mergeScale(getScaleForTeam(balance, config.team), config.scale ?? {});
  const maxHp = scaleNumber(config.maxHp, scale.hp);
  const startHp = clamp(config.startHp ?? maxHp, 0, maxHp);
  const startSp = clamp(config.startSp ?? 0, 0, config.maxSp);
  const startMp = clamp(config.startMp ?? 0, 0, config.maxMp);

  return {
    ...config,
    sourceKey: config.sourceKey ?? config.id,
    maxHp,
    hp: startHp,
    maxSp: config.maxSp,
    maxMp: config.maxMp,
    sp: startSp,
    mp: startMp,
    str: scaleNumber(config.str, scale.str),
    vit: scaleNumber(config.vit, scale.vit),
    agi: scaleNumber(config.agi, scale.agi),
    spd: scaleNumber(config.spd, scale.spd),
    mag: scaleNumber(config.mag, scale.mag),
    men: scaleNumber(config.men, scale.men),
    role: config.role ?? 'combatant',
    resistances: { ...(config.resistances ?? {}) },
    statusResistances: { ...(config.statusResistances ?? {}) },
    ip: 0,
    state: 'waiting',
    pendingAction: null,
    guard: null,
    buffs: { atk: 0, def: 0, act: 0, mov: 0 },
    debuffs: { atk: 0, def: 0, act: 0, mov: 0 },
    buffTimers: { atk: 0, def: 0, act: 0, mov: 0 },
    debuffTimers: { atk: 0, def: 0, act: 0, mov: 0 },
    statuses: { sleep: 0, moveBlock: 0, magicBlock: 0, poison: 0 },
    inventory: config.inventory ? { ...config.inventory } : undefined,
    preTurnResolved: false,
    bossPhaseIndex: 0,
    bossPatternIndex: 0,
    bossReactionCooldown: 0,
    position: clonePoint(config.position),
    home: clonePoint(config.position),
    radius: config.radius ?? 18,
    get isAlive() {
      return this.hp > 0;
    },
  };
}

export const PRESETS = {
  ryudo: {
    id: 'ryudo',
    name: 'Ryudo',
    team: 'players',
    role: 'vanguard',
    maxHp: 340,
    maxSp: 100,
    maxMp: 24,
    startSp: 34,
    startMp: 18,
    str: 40,
    vit: 26,
    agi: 26,
    spd: 22,
    mag: 18,
    men: 18,
    color: '#60a5fa',
    loadout: {
      cancelMove: 'tenseiken',
      cancelMoves: ['flyingTenseiken'],
      singleMoves: ['purpleLightning'],
      aoeMoves: ['skyDragonSlash'],
      supportMagics: ['runner'],
    },
  },
  elena: {
    id: 'elena',
    name: 'Elena',
    team: 'players',
    role: 'support',
    maxHp: 300,
    maxSp: 100,
    maxMp: 52,
    startSp: 18,
    startMp: 42,
    str: 28,
    vit: 22,
    agi: 23,
    spd: 20,
    mag: 34,
    men: 31,
    color: '#c084fc',
    resistances: { fire: 0.9, lightning: 1 },
    statusResistances: { sleep: 1, moveBlock: 1, magicBlock: 1, poison: 1 },
    loadout: {
      cancelMove: 'impactBomb',
      healMagic: 'heal',
      healMagics: ['healer', 'healerPlus', 'alhealer', 'cure', 'refresh', 'dropletsOfLife', 'resurrect'],
      offensiveMagic: 'burn',
      offensiveMagics: ['burnflame', 'burnstrike', 'whiteApocalypse', 'quake'],
      supportMagics: ['wow', 'speedy', 'diggin', 'runner', 'fiora'],
      debuffMagics: ['stram', 'cold', 'gravity', 'defLoss'],
      statusMoves: ['nightmareBall', 'snooze'],
    },
  },
  tio: {
    id: 'tio',
    name: 'Tio',
    team: 'players',
    role: 'speed-caster',
    maxHp: 280,
    maxSp: 100,
    maxMp: 44,
    startSp: 24,
    startMp: 28,
    str: 26,
    vit: 20,
    agi: 30,
    spd: 28,
    mag: 30,
    men: 24,
    color: '#67e8f9',
    resistances: { fire: 1, lightning: 0.85 },
    statusResistances: { sleep: 0.9, moveBlock: 1, magicBlock: 0.9, poison: 1 },
    loadout: {
      lineMove: 'lotusFlower',
      lineMoves: ['lotusFlower'],
      singleMoves: ['fastDanceWhirl'],
      aoeMoves: ['tornado'],
      offensiveMagic: 'zap',
      offensiveMagics: ['crackle', 'crackling', 'zapAll', 'dragonZap'],
      supportMagics: ['speedy', 'whisperToStars', 'runner'],
      debuffMagics: ['gravity', 'defLoss'],
      statusMoves: ['spellbindDust', 'freeze'],
    },
  },
  millenia: {
    id: 'millenia',
    name: 'Millenia',
    team: 'players',
    role: 'aoe-caster',
    maxHp: 290,
    maxSp: 100,
    maxMp: 48,
    startSp: 34,
    startMp: 24,
    str: 29,
    vit: 18,
    agi: 27,
    spd: 26,
    mag: 32,
    men: 20,
    color: '#f472b6',
    resistances: { fire: 0.8, lightning: 1.05 },
    statusResistances: { sleep: 0.95, moveBlock: 1, magicBlock: 1, poison: 1 },
    loadout: {
      cancelMove: 'impactBomb',
      singleMoves: ['arrowShot', 'heelCrush', 'starvingTongue', 'grudgingClaws'],
      aoeMove: 'fallenWings',
      offensiveMagic: 'burn',
      offensiveMagics: ['burnflame', 'zap', 'zapAll', 'hellburner'],
      debuffMagics: ['stram', 'cold', 'gravity'],
      statusMoves: ['nightmareBall', 'spellbindingEye'],
    },
  },
  roan: {
    id: 'roan',
    name: 'Roan',
    team: 'players',
    role: 'royal-strategist',
    maxHp: 275,
    maxSp: 100,
    maxMp: 46,
    startSp: 22,
    startMp: 30,
    str: 24,
    vit: 20,
    agi: 25,
    spd: 24,
    mag: 28,
    men: 26,
    color: '#facc15',
    resistances: { fire: 1, lightning: 0.95 },
    statusResistances: { sleep: 1, moveBlock: 0.95, magicBlock: 0.95, poison: 1 },
    loadout: {
      healMagic: 'heal',
      healMagics: ['healer', 'cure', 'refresh'],
      singleMoves: ['goldenHammer', 'dragonRise', 'trueDragonRise'],
      aoeMoves: ['snowballFight'],
      offensiveMagic: 'cold',
      offensiveMagics: ['icePrison', 'crackle'],
      supportMagics: ['wow', 'speedy', 'vitalityMarch', 'runner'],
      debuffMagics: ['stram', 'defLoss'],
      statusMoves: ['nightmareBall', 'freeze'],
    },
  },
  mareg: {
    id: 'mareg',
    name: 'Mareg',
    team: 'players',
    role: 'honor-bruiser',
    maxHp: 390,
    maxSp: 120,
    maxMp: 0,
    startSp: 40,
    startMp: 0,
    str: 44,
    vit: 29,
    agi: 20,
    spd: 21,
    mag: 8,
    men: 20,
    color: '#fb923c',
    resistances: { fire: 0.95, lightning: 1.05 },
    statusResistances: { sleep: 0.85, moveBlock: 0.95, magicBlock: 1, poison: 0.8 },
    loadout: {
      cancelMove: 'beastFangCut',
      singleMoves: ['beastKingSmash'],
      lineMove: 'tornadoHorn',
      aoeMove: 'earthQuake',
      aoeMoves: ['beastKingBlast'],
      supportMagics: ['lionsRoar', 'vitalityMarch'],
    },
  },
  milleniaShade: {
    id: 'millenia-shade',
    name: 'Millenia Shade',
    team: 'enemies',
    role: 'fallen-sorceress',
    maxHp: 520,
    maxSp: 160,
    maxMp: 72,
    startSp: 42,
    startMp: 44,
    str: 30,
    vit: 20,
    agi: 30,
    spd: 28,
    mag: 36,
    men: 24,
    color: '#ec4899',
    radius: 22,
    resistances: { fire: 0.85, lightning: 1 },
    statusResistances: { sleep: 0.4, moveBlock: 0.8, magicBlock: 0.75, poison: 0.5 },
    loadout: {
      cancelMove: 'impactBomb',
      aoeMove: 'fallenWings',
      offensiveMagic: 'burn',
      statusMoves: ['nightmareBall'],
      debuffMagics: ['stram'],
    },
    bossPatterns: [
      ['burn', 'impactBomb', 'critical'],
      ['fallenWings', 'nightmareBall', 'impactBomb'],
    ],
    bossPhases: [
      {
        threshold: 0.55,
        message: 'Millenia laughs as the whole village night twists around her!',
        buffs: { act: 1, atk: 1 },
      },
    ],
  },
  granasaberWarden: {
    id: 'granasaber-warden',
    name: 'Ancient Granasaber Warden',
    team: 'enemies',
    role: 'ancient-warden',
    maxHp: 690,
    maxSp: 180,
    maxMp: 0,
    startSp: 56,
    startMp: 0,
    str: 34,
    vit: 30,
    agi: 22,
    spd: 20,
    mag: 28,
    men: 24,
    color: '#93c5fd',
    radius: 24,
    resistances: { fire: 1.05, lightning: 0.8 },
    statusResistances: { sleep: 0.25, moveBlock: 0.65, magicBlock: 0.55, poison: 0.2 },
    loadout: { aoeMove: 'destructionRay', statusMoves: ['spellbindDust'] },
    bossPatterns: [
      ['critical', 'destructionRay', 'critical'],
      ['killerVoltage', 'destructionRay', 'combo'],
    ],
    bossPhases: [
      {
        threshold: 0.5,
        message: 'Ancient wards rotate into a new battle pattern around the Granasaber core!',
        grants: { aoeMove: 'killerVoltage' },
        buffs: { atk: 1, act: 1 },
      },
    ],
  },
  innerShadowRyudo: {
    id: 'inner-shadow-ryudo',
    name: 'Shadow Ryudo',
    team: 'enemies',
    role: 'shadow-duelist',
    maxHp: 620,
    maxSp: 170,
    maxMp: 0,
    startSp: 52,
    startMp: 0,
    str: 42,
    vit: 28,
    agi: 28,
    spd: 24,
    mag: 18,
    men: 20,
    color: '#64748b',
    radius: 22,
    resistances: { fire: 1, lightning: 1 },
    statusResistances: { sleep: 0.35, moveBlock: 0.8, magicBlock: 1, poison: 0.6 },
    loadout: { cancelMove: 'tenseiken' },
    bossPatterns: [
      ['critical', 'tenseiken', 'combo'],
      ['tenseiken', 'critical', 'critical'],
    ],
    bossReaction: {
      cooldown: 1,
      triggerCancel: true,
      buffs: [{ stat: 'atk', amount: 1, turns: 2 }],
      message: 'The shadow twists Ryudo’s own fighting instinct back against him!',
    },
  },
  valmarCoreHerald: {
    id: 'valmar-core-herald',
    name: 'Valmar Core Herald',
    team: 'enemies',
    role: 'apex-core',
    maxHp: 980,
    maxSp: 220,
    maxMp: 0,
    startSp: 72,
    startMp: 0,
    str: 38,
    vit: 34,
    agi: 26,
    spd: 22,
    mag: 36,
    men: 28,
    color: '#f8fafc',
    radius: 30,
    resistances: { fire: 0.9, lightning: 0.9 },
    statusResistances: { sleep: 0.1, moveBlock: 0.45, magicBlock: 0.35, poison: 0.05 },
    loadout: { aoeMove: 'destructionRay', statusMoves: ['spellbindDust'] },
    bossReaction: {
      cooldown: 1,
      triggerCancel: true,
      triggerStatuses: ['sleep', 'magicBlock'],
      cleanse: ['sleep', 'magicBlock', 'moveBlock'],
      buffs: [{ stat: 'act', amount: 1, turns: 2 }],
      message: 'The core rejects hesitation and hardens its will to erase the party!',
    },
    bossPatterns: [
      ['destructionRay', 'critical', 'spellbindDust'],
      ['killerVoltage', 'destructionRay', 'critical'],
      ['destructionRay', 'destructionRay', 'critical'],
    ],
    bossPhases: [
      {
        threshold: 0.66,
        message: 'The core unfolds another ring of living armor and floods the arena with false divinity!',
        grants: { aoeMove: 'killerVoltage' },
        buffs: { atk: 1, act: 1 },
      },
      {
        threshold: 0.33,
        message: 'The final shell breaks and the raw will of Valmar surges into the chamber!',
        buffs: { atk: 2, act: 1 },
      },
    ],
  },
  garmiaRuinCore: {
    id: 'garmia-ruin-core',
    name: 'Ruptured Seal Core',
    team: 'enemies',
    role: 'seal-rupture',
    maxHp: 610,
    maxSp: 170,
    maxMp: 0,
    startSp: 46,
    startMp: 0,
    str: 32,
    vit: 26,
    agi: 24,
    spd: 22,
    mag: 28,
    men: 20,
    color: '#a78bfa',
    radius: 24,
    resistances: { fire: 1, lightning: 0.9 },
    statusResistances: { sleep: 0.35, moveBlock: 0.7, magicBlock: 0.65, poison: 0.4 },
    loadout: { aoeMove: 'killerVoltage', statusMoves: ['spellbindDust'] },
    bossPatterns: [
      ['critical', 'killerVoltage', 'combo'],
      ['destructionRay', 'combo', 'killerVoltage'],
    ],
    bossPhases: [
      {
        threshold: 0.5,
        message: 'The shattered seal convulses and vents cursed force in every direction!',
        grants: { aoeMove: 'destructionRay' },
        buffs: { atk: 1, act: 1 },
      },
    ],
  },
  moonWombSentinel: {
    id: 'moon-womb-sentinel',
    name: 'Moon Womb Sentinel',
    team: 'enemies',
    role: 'moon-sentinel',
    maxHp: 760,
    maxSp: 190,
    maxMp: 0,
    startSp: 58,
    startMp: 0,
    str: 36,
    vit: 30,
    agi: 25,
    spd: 22,
    mag: 30,
    men: 22,
    color: '#f472b6',
    radius: 25,
    resistances: { fire: 0.95, lightning: 0.9 },
    statusResistances: { sleep: 0.25, moveBlock: 0.65, magicBlock: 0.55, poison: 0.25 },
    loadout: { aoeMove: 'destructionRay', statusMoves: ['spellbindDust'] },
    bossPatterns: [
      ['critical', 'destructionRay', 'combo'],
      ['killerVoltage', 'critical', 'destructionRay'],
    ],
    bossPhases: [
      {
        threshold: 0.55,
        message: 'The Moon Womb Sentinel releases a deeper pulse from the living shell beneath it!',
        grants: { aoeMove: 'killerVoltage' },
        buffs: { atk: 1, act: 1 },
      },
    ],
  },
  melficeEcho: {
    id: 'melfice-echo',
    name: 'Melfice',
    team: 'enemies',
    role: 'blade-echo',
    maxHp: 760,
    maxSp: 200,
    maxMp: 0,
    startSp: 60,
    startMp: 0,
    str: 44,
    vit: 30,
    agi: 27,
    spd: 24,
    mag: 14,
    men: 20,
    color: '#facc15',
    radius: 24,
    resistances: { fire: 0.95, lightning: 1 },
    statusResistances: { sleep: 0.2, moveBlock: 0.7, magicBlock: 1, poison: 0.35 },
    loadout: { cancelMove: 'tenseiken' },
    bossPatterns: [
      ['critical', 'tenseiken', 'combo'],
      ['tenseiken', 'critical', 'critical'],
    ],
    bossReaction: {
      cooldown: 1,
      triggerCancel: true,
      buffs: [{ stat: 'atk', amount: 1, turns: 2 }, { stat: 'act', amount: 1, turns: 2 }],
      message: 'Melfice snarls and answers the interruption with brutal sword intent!',
    },
    bossPhases: [
      {
        threshold: 0.55,
        message: 'Melfice shifts his stance and begins cutting straight through the party guard!',
        buffs: { atk: 1, act: 1 },
      },
    ],
  },
  cathedralExecutioner: {
    id: 'cathedral-executioner',
    name: 'Cathedral Executioner',
    team: 'enemies',
    role: 'fanatic-bruiser',
    maxHp: 560,
    maxSp: 160,
    maxMp: 0,
    startSp: 44,
    startMp: 0,
    str: 38,
    vit: 28,
    agi: 20,
    spd: 19,
    mag: 8,
    men: 16,
    color: '#f87171',
    radius: 22,
    resistances: { fire: 1, lightning: 1 },
    statusResistances: { sleep: 0.55, moveBlock: 0.8, magicBlock: 1, poison: 0.5 },
    loadout: { cancelMove: 'beastFangCut', lineMove: 'tornadoHorn' },
    bossPatterns: [
      ['beastFangCut', 'critical', 'combo'],
      ['tornadoHorn', 'combo', 'critical'],
    ],
  },
  troglodyte: {
    id: 'troglodyte',
    name: 'Troglodyte',
    team: 'enemies',
    role: 'bruiser',
    maxHp: 320,
    maxSp: 100,
    maxMp: 0,
    startSp: 24,
    startMp: 0,
    str: 36,
    vit: 24,
    agi: 21,
    spd: 24,
    mag: 6,
    men: 12,
    color: '#f97316',
    resistances: { fire: 0.95, lightning: 1.05 },
    statusResistances: { sleep: 0.85, moveBlock: 1, magicBlock: 1, poison: 0.8 },
    loadout: {},
  },
  wingEye: {
    id: 'wing-eye',
    name: 'Wing Eye',
    team: 'enemies',
    role: 'controller',
    maxHp: 240,
    maxSp: 100,
    maxMp: 0,
    startSp: 28,
    startMp: 0,
    str: 30,
    vit: 18,
    agi: 24,
    spd: 28,
    mag: 10,
    men: 12,
    color: '#ef4444',
    resistances: { fire: 1.1, lightning: 0.95 },
    statusResistances: { sleep: 0.75, moveBlock: 0.9, magicBlock: 1, poison: 0.85 },
    loadout: { lineMove: 'wingSlice', statusMoves: ['webTrap'] },
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    team: 'enemies',
    role: 'elite-caster',
    maxHp: 620,
    maxSp: 160,
    maxMp: 0,
    startSp: 48,
    startMp: 0,
    str: 32,
    vit: 28,
    agi: 22,
    spd: 18,
    mag: 26,
    men: 20,
    color: '#93c5fd',
    radius: 24,
    resistances: { fire: 1.15, lightning: 0.7 },
    statusResistances: { sleep: 0.25, moveBlock: 0.55, magicBlock: 0.55, poison: 0.2 },
    loadout: { aoeMove: 'killerVoltage' },
    bossReaction: {
      cooldown: 2,
      triggerCancel: true,
      triggerStatuses: ['sleep', 'moveBlock', 'magicBlock'],
      cleanse: ['sleep', 'moveBlock', 'magicBlock'],
      buffs: [{ stat: 'act', amount: 1, turns: 2 }],
      message: 'Guardian purges control effects in a violent electric surge!',
    },
    bossPatterns: [
      ['combo', 'critical', 'killerVoltage'],
      ['critical', 'killerVoltage', 'combo'],
      ['destructionRay', 'critical', 'killerVoltage'],
    ],
    bossPhases: [
      {
        threshold: 0.65,
        message: 'Guardian overcharges its core and crackles with static!',
        buffs: { atk: 1, act: 1 },
        summons: [{ presetKey: 'wingEye', position: { x: 780, y: 120 }, name: 'Wing Eye Beta' }],
      },
      {
        threshold: 0.35,
        message: 'Guardian opens its shell and unleashes Destruction Ray!',
        grants: { aoeMove: 'destructionRay' },
        buffs: { atk: 1, act: 1 },
        summons: [{ presetKey: 'mottledSpider', position: { x: 780, y: 280 }, name: 'Spider Drone' }],
      },
    ],
  },
  tongueValmar: {
    id: 'tongue-valmar',
    name: 'Tongue of Valmar',
    team: 'enemies',
    role: 'corrupted devourer',
    maxHp: 560,
    maxSp: 160,
    maxMp: 0,
    startSp: 42,
    startMp: 0,
    str: 40,
    vit: 24,
    agi: 21,
    spd: 19,
    mag: 12,
    men: 18,
    color: '#c026d3',
    radius: 25,
    resistances: { fire: 1.05, lightning: 0.95 },
    statusResistances: { sleep: 0.45, moveBlock: 0.75, magicBlock: 0.8, poison: 0.2 },
    loadout: { cancelMove: 'beastFangCut', aoeMove: 'earthQuake', statusMoves: ['poisonSpit'] },
    bossPatterns: [
      ['combo', 'poisonSpit', 'beastFangCut'],
      ['earthQuake', 'combo', 'beastFangCut'],
    ],
    bossPhases: [
      {
        threshold: 0.5,
        message: 'Tongue of Valmar writhes and sprays corruption across the chamber!',
        buffs: { atk: 1, act: 1 },
        summons: [{ presetKey: 'mottledSpider', position: { x: 790, y: 250 }, name: 'Corrupted Spore' }],
      }
    ],
  },
  clawsValmar: {
    id: 'claws-valmar',
    name: 'Claws of Valmar',
    team: 'enemies',
    role: 'assault core',
    maxHp: 520,
    maxSp: 150,
    maxMp: 0,
    startSp: 44,
    startMp: 0,
    str: 38,
    vit: 22,
    agi: 29,
    spd: 30,
    mag: 10,
    men: 16,
    color: '#7c3aed',
    radius: 22,
    resistances: { fire: 1, lightning: 1 },
    statusResistances: { sleep: 0.55, moveBlock: 0.7, magicBlock: 0.6, poison: 0.35 },
    loadout: { cancelMove: 'beastFangCut', statusMoves: ['webTrap', 'spellbindDust'] },
    bossPatterns: [
      ['webTrap', 'combo', 'beastFangCut'],
      ['spellbindDust', 'critical', 'beastFangCut'],
    ],
    bossPhases: [
      {
        threshold: 0.45,
        message: 'Claws of Valmar split their focus and strike with machine precision!',
        buffs: { act: 1, mov: 1 },
      }
    ],
  },
  heartValmar: {
    id: 'heart-valmar',
    name: 'Heart of Valmar',
    team: 'enemies',
    role: 'dark-heart',
    maxHp: 760,
    maxSp: 180,
    maxMp: 0,
    startSp: 60,
    startMp: 0,
    str: 34,
    vit: 30,
    agi: 24,
    spd: 20,
    mag: 30,
    men: 22,
    color: '#be123c',
    radius: 26,
    resistances: { fire: 1.05, lightning: 0.85 },
    statusResistances: { sleep: 0.2, moveBlock: 0.6, magicBlock: 0.5, poison: 0.1 },
    loadout: { aoeMove: 'destructionRay', statusMoves: ['spellbindDust'] },
    bossPatterns: [
      ['destructionRay', 'critical', 'spellbindDust'],
      ['killerVoltage', 'destructionRay', 'critical'],
    ],
    bossPhases: [
      {
        threshold: 0.6,
        message: 'Heart of Valmar surges with sacrificial power!',
        grants: { aoeMove: 'killerVoltage' },
        buffs: { atk: 1, act: 1 },
      },
      {
        threshold: 0.3,
        message: 'Heart of Valmar beats wildly and spills darkness into the arena!',
        summons: [{ presetKey: 'wingEye', position: { x: 790, y: 120 }, name: 'Dark Eye' }],
      }
    ],
  },
  zeraAvatar: {
    id: 'zera-avatar',
    name: 'Zera Ascendant',
    team: 'enemies',
    role: 'false-savior',
    maxHp: 880,
    maxSp: 190,
    maxMp: 0,
    startSp: 64,
    startMp: 0,
    str: 36,
    vit: 30,
    agi: 27,
    spd: 22,
    mag: 32,
    men: 24,
    color: '#f8fafc',
    radius: 28,
    resistances: { fire: 0.95, lightning: 0.9 },
    statusResistances: { sleep: 0.15, moveBlock: 0.5, magicBlock: 0.4, poison: 0.1 },
    loadout: { aoeMove: 'destructionRay', statusMoves: ['spellbindDust'] },
    bossReaction: {
      cooldown: 1,
      triggerCancel: true,
      triggerStatuses: ['sleep', 'magicBlock'],
      cleanse: ['sleep', 'magicBlock', 'moveBlock'],
      buffs: [{ stat: 'act', amount: 1, turns: 2 }],
      message: 'Zera rejects mortal interference and restores his composure!',
    },
    bossPatterns: [
      ['critical', 'destructionRay', 'spellbindDust'],
      ['killerVoltage', 'critical', 'destructionRay'],
      ['destructionRay', 'destructionRay', 'critical'],
    ],
    bossPhases: [
      {
        threshold: 0.66,
        message: 'Zera reveals a brighter, crueler form and calls forth sacred guardians!',
        grants: { aoeMove: 'killerVoltage' },
        summons: [{ presetKey: 'guardian', position: { x: 790, y: 300 }, name: 'False Guardian' }],
      },
      {
        threshold: 0.33,
        message: 'Zera tears away the last mask of holiness and floods the chamber with despair!',
        buffs: { atk: 2, act: 1 },
      }
    ],
  },
  durhamMinotaur: {
    id: 'durham-minotaur',
    name: 'Durham Minotaur',
    team: 'enemies',
    role: 'mini-boss bruiser',
    maxHp: 820,
    maxSp: 160,
    maxMp: 0,
    startSp: 52,
    startMp: 0,
    str: 46,
    vit: 30,
    agi: 20,
    spd: 22,
    mag: 6,
    men: 16,
    color: '#fb923c',
    radius: 26,
    resistances: { fire: 1.15, lightning: 1.05 },
    statusResistances: { sleep: 0.35, moveBlock: 0.7, magicBlock: 0.8, poison: 0.3 },
    loadout: { cancelMove: 'beastFangCut', lineMove: 'tornadoHorn' },
    bossReaction: {
      cooldown: 2,
      triggerCancel: true,
      triggerDebuffs: ['def', 'act'],
      buffs: [
        { stat: 'atk', amount: 1, turns: 2 },
        { stat: 'mov', amount: 1, turns: 2 },
      ],
      message: 'Durham Minotaur goes berserk from the interruption!',
    },
    bossPatterns: [
      ['combo', 'beastFangCut', 'combo', 'tornadoHorn'],
      ['beastFangCut', 'combo', 'tornadoHorn', 'combo'],
      ['earthQuake', 'beastFangCut', 'tornadoHorn', 'combo'],
    ],
    bossPhases: [
      {
        threshold: 0.7,
        message: 'Durham Minotaur roars and tramples forward with greater fury!',
        buffs: { atk: 1, mov: 1 },
        summons: [{ presetKey: 'mottledSpider', position: { x: 800, y: 260 }, name: 'Minotaur Broodling' }],
      },
      {
        threshold: 0.4,
        message: 'Durham Minotaur enters a rage and shakes the whole battlefield!',
        grants: { aoeMove: 'earthQuake' },
        buffs: { atk: 2, act: 1 },
      },
    ],
  },
  cragSnake: {
    id: 'crag-snake',
    name: 'Crag Snake',
    team: 'enemies',
    role: 'poison-striker',
    maxHp: 280,
    maxSp: 90,
    maxMp: 0,
    startSp: 22,
    startMp: 0,
    str: 30,
    vit: 18,
    agi: 24,
    spd: 24,
    mag: 6,
    men: 10,
    color: '#22c55e',
    resistances: { fire: 1.05, lightning: 0.95 },
    statusResistances: { sleep: 0.85, moveBlock: 1, magicBlock: 1, poison: 0.15 },
    loadout: { statusMoves: ['poisonSpit'], singleMoves: ['beastFangCut'] },
  },
  frostFrog: {
    id: 'frost-frog',
    name: 'Frost Frog',
    team: 'enemies',
    role: 'ice-harasser',
    maxHp: 360,
    maxSp: 90,
    maxMp: 18,
    startSp: 18,
    startMp: 10,
    str: 24,
    vit: 18,
    agi: 21,
    spd: 22,
    mag: 16,
    men: 14,
    color: '#93c5fd',
    resistances: { fire: 1.25, lightning: 0.95 },
    statusResistances: { sleep: 0.9, moveBlock: 1, magicBlock: 1, poison: 0.8 },
    loadout: { statusMoves: ['freeze'], offensiveMagics: ['cold', 'crackle'] },
  },
  gargoyle: {
    id: 'gargoyle',
    name: 'Gargoyle',
    team: 'enemies',
    role: 'stone-flier',
    maxHp: 380,
    maxSp: 100,
    maxMp: 0,
    startSp: 26,
    startMp: 0,
    str: 32,
    vit: 22,
    agi: 20,
    spd: 18,
    mag: 8,
    men: 14,
    color: '#94a3b8',
    resistances: { fire: 0.95, lightning: 1.1 },
    statusResistances: { sleep: 0.7, moveBlock: 0.85, magicBlock: 0.95, poison: 0.6 },
    loadout: { lineMove: 'wingSlice', singleMoves: ['critical'] },
  },
  giantMantis: {
    id: 'giant-mantis',
    name: 'Giant Mantis',
    team: 'enemies',
    role: 'fast-slash',
    maxHp: 420,
    maxSp: 100,
    maxMp: 0,
    startSp: 28,
    startMp: 0,
    str: 34,
    vit: 20,
    agi: 27,
    spd: 28,
    mag: 6,
    men: 12,
    color: '#65a30d',
    resistances: { fire: 1.1, lightning: 0.95 },
    statusResistances: { sleep: 0.8, moveBlock: 0.9, magicBlock: 1, poison: 0.8 },
    loadout: { cancelMove: 'beastFangCut', singleMoves: ['critical'] },
  },
  ghoul: {
    id: 'ghoul',
    name: 'Ghoul',
    team: 'enemies',
    role: 'sleep-caster',
    maxHp: 420,
    maxSp: 90,
    maxMp: 26,
    startSp: 16,
    startMp: 16,
    str: 22,
    vit: 18,
    agi: 18,
    spd: 18,
    mag: 18,
    men: 16,
    color: '#a855f7',
    resistances: { fire: 1.15, lightning: 1 },
    statusResistances: { sleep: 0.55, moveBlock: 1, magicBlock: 0.9, poison: 0.2 },
    loadout: { statusMoves: ['nightmareBall', 'snooze'], debuffMagics: ['cold', 'defLoss'] },
  },
  hammerhead: {
    id: 'hammerhead',
    name: 'Hammerhead',
    team: 'enemies',
    role: 'smash-liner',
    maxHp: 520,
    maxSp: 110,
    maxMp: 0,
    startSp: 34,
    startMp: 0,
    str: 36,
    vit: 24,
    agi: 20,
    spd: 20,
    mag: 6,
    men: 12,
    color: '#f59e0b',
    resistances: { fire: 0.95, lightning: 1.05 },
    statusResistances: { sleep: 0.75, moveBlock: 0.8, magicBlock: 1, poison: 0.8 },
    loadout: { lineMove: 'tornadoHorn', singleMoves: ['beastFangCut'] },
  },
  hugeCaterpillar: {
    id: 'huge-caterpillar',
    name: 'Huge Caterpillar',
    team: 'enemies',
    role: 'sticky-tank',
    maxHp: 630,
    maxSp: 100,
    maxMp: 0,
    startSp: 26,
    startMp: 0,
    str: 28,
    vit: 26,
    agi: 16,
    spd: 16,
    mag: 8,
    men: 14,
    color: '#84cc16',
    resistances: { fire: 1.2, lightning: 1 },
    statusResistances: { sleep: 0.85, moveBlock: 0.75, magicBlock: 1, poison: 0.35 },
    loadout: { statusMoves: ['webTrap', 'poisonSpit'] },
  },
  hellHound: {
    id: 'hell-hound',
    name: 'Hell Hound',
    team: 'enemies',
    role: 'fire-rusher',
    maxHp: 580,
    maxSp: 100,
    maxMp: 20,
    startSp: 22,
    startMp: 10,
    str: 34,
    vit: 22,
    agi: 24,
    spd: 24,
    mag: 16,
    men: 12,
    color: '#ef4444',
    resistances: { fire: 0.7, lightning: 1.05 },
    statusResistances: { sleep: 0.8, moveBlock: 0.9, magicBlock: 0.9, poison: 0.7 },
    loadout: { offensiveMagic: 'burn', singleMoves: ['critical'] },
  },
  giantCrab: {
    id: 'giant-crab',
    name: 'Giant Crab',
    team: 'enemies',
    role: 'shell-tank',
    maxHp: 560,
    maxSp: 100,
    maxMp: 0,
    startSp: 22,
    startMp: 0,
    str: 30,
    vit: 28,
    agi: 16,
    spd: 16,
    mag: 6,
    men: 14,
    color: '#f97316',
    resistances: { fire: 0.95, lightning: 1.1 },
    statusResistances: { sleep: 0.8, moveBlock: 0.75, magicBlock: 1, poison: 0.9 },
    loadout: { singleMoves: ['critical'], supportMagics: ['diggin'] },
  },
  landCougar: {
    id: 'land-cougar',
    name: 'Land Cougar',
    team: 'enemies',
    role: 'field-hunter',
    maxHp: 540,
    maxSp: 100,
    maxMp: 0,
    startSp: 24,
    startMp: 0,
    str: 36,
    vit: 22,
    agi: 28,
    spd: 28,
    mag: 6,
    men: 12,
    color: '#fb923c',
    resistances: { fire: 1, lightning: 0.95 },
    statusResistances: { sleep: 0.8, moveBlock: 0.9, magicBlock: 1, poison: 0.8 },
    loadout: { singleMoves: ['critical', 'beastFangCut'] },
  },
  fennyBird: {
    id: 'fenny-bird',
    name: 'Fenny Bird',
    team: 'enemies',
    role: 'storm-flier',
    maxHp: 620,
    maxSp: 110,
    maxMp: 0,
    startSp: 26,
    startMp: 0,
    str: 32,
    vit: 20,
    agi: 28,
    spd: 30,
    mag: 8,
    men: 14,
    color: '#facc15',
    resistances: { fire: 1.05, lightning: 0.8 },
    statusResistances: { sleep: 0.75, moveBlock: 0.9, magicBlock: 1, poison: 0.75 },
    loadout: { lineMove: 'wingSlice', statusMoves: ['webTrap'] },
  },
  manEatingTree: {
    id: 'man-eating-tree',
    name: 'Man-Eating Tree',
    team: 'enemies',
    role: 'root-controller',
    maxHp: 780,
    maxSp: 110,
    maxMp: 18,
    startSp: 24,
    startMp: 8,
    str: 32,
    vit: 30,
    agi: 14,
    spd: 14,
    mag: 14,
    men: 20,
    color: '#16a34a',
    resistances: { fire: 1.3, lightning: 0.95 },
    statusResistances: { sleep: 0.85, moveBlock: 0.7, magicBlock: 0.9, poison: 0.2 },
    loadout: { statusMoves: ['webTrap'], debuffMagics: ['gravity'], supportMagics: ['diggin'] },
  },
  gigaMantis: {
    id: 'giga-mantis',
    name: 'Giga Mantis',
    team: 'enemies',
    role: 'elite-slash',
    maxHp: 820,
    maxSp: 120,
    maxMp: 0,
    startSp: 36,
    startMp: 0,
    str: 40,
    vit: 24,
    agi: 30,
    spd: 30,
    mag: 8,
    men: 14,
    color: '#4d7c0f',
    radius: 22,
    resistances: { fire: 1.1, lightning: 0.95 },
    statusResistances: { sleep: 0.7, moveBlock: 0.85, magicBlock: 1, poison: 0.7 },
    loadout: { cancelMove: 'beastFangCut', singleMoves: ['critical', 'beastKingSmash'] },
  },
  salamadile: {
    id: 'salamadile',
    name: 'Salamadile',
    team: 'enemies',
    role: 'flame-lizard',
    maxHp: 760,
    maxSp: 110,
    maxMp: 26,
    startSp: 26,
    startMp: 14,
    str: 36,
    vit: 24,
    agi: 22,
    spd: 22,
    mag: 20,
    men: 16,
    color: '#f97316',
    resistances: { fire: 0.6, lightning: 1.05 },
    statusResistances: { sleep: 0.75, moveBlock: 0.9, magicBlock: 0.8, poison: 0.7 },
    loadout: { offensiveMagics: ['burnflame', 'burnstrike'], singleMoves: ['critical'] },
  },
  nyarmot: {
    id: 'nyarmot',
    name: 'Nyarmot',
    team: 'enemies',
    role: 'moon-stalker',
    maxHp: 900,
    maxSp: 120,
    maxMp: 18,
    startSp: 28,
    startMp: 8,
    str: 38,
    vit: 26,
    agi: 24,
    spd: 24,
    mag: 14,
    men: 16,
    color: '#ec4899',
    resistances: { fire: 0.95, lightning: 0.9 },
    statusResistances: { sleep: 0.65, moveBlock: 0.85, magicBlock: 0.85, poison: 0.8 },
    loadout: { singleMoves: ['critical'], debuffMagics: ['cold', 'gravity'] },
  },
  dragonKnight: {
    id: 'dragon-knight',
    name: 'Dragon Knight',
    team: 'enemies',
    role: 'late-elite',
    maxHp: 1200,
    maxSp: 140,
    maxMp: 20,
    startSp: 44,
    startMp: 10,
    str: 44,
    vit: 32,
    agi: 24,
    spd: 22,
    mag: 18,
    men: 18,
    color: '#60a5fa',
    radius: 24,
    resistances: { fire: 0.95, lightning: 0.95 },
    statusResistances: { sleep: 0.55, moveBlock: 0.8, magicBlock: 0.8, poison: 0.75 },
    loadout: { singleMoves: ['dragonRise', 'trueDragonRise'], supportMagics: ['wow'] },
  },
  evilManeuver: {
    id: 'evil-maneuver',
    name: 'Evil Maneuver',
    team: 'enemies',
    role: 'late-schemer',
    maxHp: 1180,
    maxSp: 130,
    maxMp: 40,
    startSp: 26,
    startMp: 22,
    str: 30,
    vit: 24,
    agi: 26,
    spd: 28,
    mag: 24,
    men: 20,
    color: '#7c3aed',
    resistances: { fire: 1, lightning: 0.9 },
    statusResistances: { sleep: 0.6, moveBlock: 0.85, magicBlock: 0.75, poison: 0.7 },
    loadout: { offensiveMagics: ['cold', 'zap'], healMagics: ['alhealer'], statusMoves: ['spellbindDust'] },
  },
  immuneCell: {
    id: 'immune-cell',
    name: 'Immune Cell',
    team: 'enemies',
    role: 'bio-guardian',
    maxHp: 1540,
    maxSp: 140,
    maxMp: 26,
    startSp: 32,
    startMp: 12,
    str: 38,
    vit: 34,
    agi: 20,
    spd: 20,
    mag: 18,
    men: 24,
    color: '#10b981',
    radius: 24,
    resistances: { fire: 1.05, lightning: 0.95 },
    statusResistances: { sleep: 0.5, moveBlock: 0.7, magicBlock: 0.8, poison: 0.15 },
    loadout: { healMagics: ['healer'], statusMoves: ['poisonSpit'], supportMagics: ['diggin'] },
  },
  killerTree: {
    id: 'killer-tree',
    name: 'Killer Tree',
    team: 'enemies',
    role: 'late-rooted-tank',
    maxHp: 1700,
    maxSp: 150,
    maxMp: 16,
    startSp: 24,
    startMp: 8,
    str: 40,
    vit: 36,
    agi: 16,
    spd: 16,
    mag: 16,
    men: 22,
    color: '#15803d',
    radius: 26,
    resistances: { fire: 1.35, lightning: 0.9 },
    statusResistances: { sleep: 0.75, moveBlock: 0.65, magicBlock: 0.85, poison: 0.1 },
    loadout: { statusMoves: ['webTrap', 'poisonSpit'], debuffMagics: ['gravity'], aoeMoves: ['earthQuake'] },
  },
  mindEater: {
    id: 'mind-eater',
    name: 'Mind Eater',
    team: 'enemies',
    role: 'late-mind-caster',
    maxHp: 1650,
    maxSp: 150,
    maxMp: 48,
    startSp: 22,
    startMp: 28,
    str: 28,
    vit: 24,
    agi: 22,
    spd: 24,
    mag: 28,
    men: 24,
    color: '#a855f7',
    radius: 24,
    resistances: { fire: 1, lightning: 0.95 },
    statusResistances: { sleep: 0.55, moveBlock: 0.85, magicBlock: 0.75, poison: 0.6 },
    loadout: { statusMoves: ['nightmareBall', 'spellbindDust'], offensiveMagics: ['zapAll'], debuffMagics: ['cold'] },
  },
  valmarMoth: {
    id: 'valmar-moth',
    name: 'Valmar Moth',
    team: 'enemies',
    role: 'organic-flier',
    maxHp: 1100,
    maxSp: 120,
    maxMp: 0,
    startSp: 24,
    startMp: 0,
    str: 34,
    vit: 24,
    agi: 28,
    spd: 28,
    mag: 10,
    men: 16,
    color: '#f472b6',
    radius: 22,
    resistances: { fire: 0.95, lightning: 0.85 },
    statusResistances: { sleep: 0.7, moveBlock: 0.85, magicBlock: 0.9, poison: 0.3 },
    loadout: { lineMove: 'wingSlice', statusMoves: ['webTrap'] },
  },
  valmarMagna: {
    id: 'valmar-magna',
    name: 'Valmar Magna',
    team: 'enemies',
    role: 'late-valmar-core',
    maxHp: 1900,
    maxSp: 170,
    maxMp: 30,
    startSp: 48,
    startMp: 14,
    str: 42,
    vit: 34,
    agi: 24,
    spd: 22,
    mag: 24,
    men: 24,
    color: '#d946ef',
    radius: 28,
    resistances: { fire: 0.95, lightning: 0.9 },
    statusResistances: { sleep: 0.4, moveBlock: 0.75, magicBlock: 0.7, poison: 0.2 },
    loadout: { aoeMove: 'destructionRay', offensiveMagics: ['quake'], statusMoves: ['spellbindDust'], debuffMagics: ['gravity'] },
    bossPatterns: [
      ['destructionRay', 'critical', 'gravity'],
      ['quake', 'destructionRay', 'spellbindDust'],
    ],
  },
  mottledSpider: {
    id: 'mottled-spider',
    name: 'Mottled Spider',
    team: 'enemies',
    role: 'status harasser',
    maxHp: 230,
    maxSp: 100,
    maxMp: 0,
    startSp: 26,
    startMp: 0,
    str: 28,
    vit: 17,
    agi: 25,
    spd: 29,
    mag: 8,
    men: 10,
    color: '#84cc16',
    resistances: { fire: 1.2, lightning: 1 },
    statusResistances: { sleep: 0.8, moveBlock: 1, magicBlock: 0.9, poison: 0.1 },
    loadout: { statusMoves: ['poisonSpit', 'spellbindDust'] },
  },
};

function defaultPlayersEncounter() {
  return [
    { ...PRESETS.ryudo, position: { x: 280, y: 120 } },
    { ...PRESETS.elena, position: { x: 280, y: 235 } },
  ];
}

function defaultEnemiesEncounter() {
  return [
    { ...PRESETS.troglodyte, position: { x: 680, y: 120 } },
    { ...PRESETS.wingEye, position: { x: 670, y: 235 } },
  ];
}

function serializeCombatant(fighter) {
  return {
    id: fighter.id,
    sourceKey: fighter.sourceKey ?? fighter.id,
    name: fighter.name,
    team: fighter.team,
    color: fighter.color,
    role: fighter.role,
    radius: fighter.radius,
    hp: fighter.hp,
    maxHp: fighter.maxHp,
    sp: fighter.sp,
    maxSp: fighter.maxSp,
    mp: fighter.mp,
    maxMp: fighter.maxMp,
    ip: fighter.ip,
    state: fighter.state,
    position: clonePoint(fighter.position),
    home: clonePoint(fighter.home),
    guard: fighter.guard ? { ...fighter.guard } : null,
    pendingAction: fighter.pendingAction
      ? {
          id: fighter.pendingAction.id,
          label: fighter.pendingAction.definition.label,
          definition: { ...fighter.pendingAction.definition },
          targetId: fighter.pendingAction.targetId ?? null,
          targetPoint: fighter.pendingAction.targetPoint ? clonePoint(fighter.pendingAction.targetPoint) : null,
        }
      : null,
    statuses: { ...fighter.statuses },
    bossPhaseIndex: fighter.bossPhaseIndex ?? 0,
    bossPatternIndex: fighter.bossPatternIndex ?? 0,
    bossReactionCooldown: fighter.bossReactionCooldown ?? 0,
    loadout: fighter.loadout ? { ...fighter.loadout } : undefined,
    isAlive: fighter.isAlive,
  };
}

function makeBattleSnapshot(battle, label = 'snapshot') {
  return {
    label,
    time: Number(battle.timeline.elapsedSeconds.toFixed(3)),
    turnCount: battle.turnCount,
    openingAdvantage: battle.openingAdvantage,
    battlefieldTheme: battle.battlefieldTheme,
    metadata: battle.metadata ? { ...battle.metadata } : null,
    customFlags: battle.customState?.flags ? { ...battle.customState.flags } : {},
    awaitingInput: battle.awaitingInput
      ? {
          fighterId: battle.awaitingInput.fighterId,
          fighterName: battle.awaitingInput.fighterName,
        }
      : null,
    players: battle.players.map(serializeCombatant),
    enemies: battle.enemies.map(serializeCombatant),
    lastEventText: battle.lastEvent?.text ?? null,
  };
}

function applyOpeningAdvantage(battle, openingAdvantage = 'neutral') {
  const playerStart = openingAdvantage === 'players' ? 260 : openingAdvantage === 'enemies' ? 20 : 0;
  const enemyStart = openingAdvantage === 'enemies' ? 260 : openingAdvantage === 'players' ? 20 : 0;

  battle.players.forEach((fighter, index) => {
    fighter.ip = Math.min(IP_MAX - 1, playerStart + index * 35);
  });
  battle.enemies.forEach((fighter, index) => {
    fighter.ip = Math.min(IP_MAX - 1, enemyStart + index * 35);
  });
}

export function createBattle({
  players = defaultPlayersEncounter(),
  enemies = defaultEnemiesEncounter(),
  controllers = {},
  rng = Math.random,
  balance = DEFAULT_BALANCE_PROFILE,
  inventory = { medicinalHerb: 3, antidote: 2 },
  openingAdvantage = 'neutral',
  battlefieldTheme = 'cavern',
  introLog = 'Vertical Slice A: 2 heroes vs 2 enemies, IP Gauge, Combo/Critical/Endure/Evade, Tenseiken Slash, Heal, positioning and line-of-hit.',
  metadata = {},
} = {}) {
  const battle = {
    players: players.map((config) => createCombatant(config, balance)),
    enemies: enemies.map((config) => createCombatant(config, balance)),
    timeline: new IPGaugeTimeline(),
    log: introLog ? [introLog] : [],
    turnCount: 0,
    lastEvent: null,
    controllers,
    rng,
    balance,
    inventory: { ...inventory },
    openingAdvantage,
    battlefieldTheme,
    spawnCounter: 0,
    supplementalEvents: [],
    awaitingInput: null,
    manualSelections: {},
    decisionLog: [],
    snapshots: [],
    metadata: { ...(metadata ?? {}) },
    customState: { flags: {} },
  };

  applyOpeningAdvantage(battle, openingAdvantage);
  battle.snapshots.push(makeBattleSnapshot(battle, 'initial'));
  return battle;
}

export function createDefaultBattle(options = {}) {
  return createBattle(options);
}

function buildAction(battle, actor, actionId, target = null, point = null) {
  const definition = getActionDefinition(battle, actionId);
  return {
    id: actionId,
    definition,
    actorId: actor.id,
    targetId: target?.id ?? null,
    targetPoint: point ? clonePoint(point) : target ? clonePoint(target.position) : null,
    chosenAt: actor.ip,
  };
}

function sameActionSignature(left, right) {
  return (
    left?.id === right?.id
    && (left?.targetId ?? null) === (right?.targetId ?? null)
    && JSON.stringify(left?.targetPoint ?? null) === JSON.stringify(right?.targetPoint ?? null)
  );
}

function resetGuardAtCommandStart(fighter) {
  fighter.guard = null;
}

export function getAvailableActions(battle, fighter) {
  if (!fighter?.isAlive) {
    return [];
  }

  const actions = [];
  const opponents = livingOpponents(battle, fighter);
  const allies = livingAllies(battle, fighter);
  const fullTeam = battleTeam(battle, fighter);
  const moveBlocked = isMoveBlocked(fighter);
  const magicBlocked = isMagicBlocked(fighter);

  if (!moveBlocked) {
    for (const moveId of aoeMoveIds(fighter)) {
      const definition = getActionDefinition(battle, moveId);
      if (opponents.length > 0 && canPayActionCost(fighter, definition)) {
        actions.push(buildAction(battle, fighter, moveId));
      }
    }
  }

  for (const opponent of opponents) {
    actions.push(buildAction(battle, fighter, 'combo', opponent));
    actions.push(buildAction(battle, fighter, 'critical', opponent));
  }

  if (!moveBlocked) {
    for (const moveId of cancelMoveIds(fighter)) {
      const definition = getActionDefinition(battle, moveId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      for (const opponent of opponents) {
        actions.push(buildAction(battle, fighter, moveId, opponent));
      }
    }

    for (const moveId of singleMoveIds(fighter)) {
      const definition = getActionDefinition(battle, moveId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      for (const opponent of opponents) {
        actions.push(buildAction(battle, fighter, moveId, opponent));
      }
    }

    for (const moveId of statusMoveIds(fighter)) {
      const definition = getActionDefinition(battle, moveId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      for (const opponent of opponents) {
        actions.push(buildAction(battle, fighter, moveId, opponent));
      }
    }

    for (const moveId of lineMoveIds(fighter)) {
      const definition = getActionDefinition(battle, moveId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      const bestLine = chooseBestLineAttack(battle, fighter, moveId);
      if (bestLine) {
        actions.push(buildAction(
          battle,
          fighter,
          moveId,
          bestLine.primaryTarget,
          bestLine.endPoint,
        ));
      }
    }
  }

  if (!magicBlocked) {
    for (const spellId of healMagicIds(fighter)) {
      const definition = getActionDefinition(battle, spellId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      if (definition.targeting === 'all-allies') {
        const valid = fullTeam.some((unit) => (unit.isAlive && unit.hp < unit.maxHp)
          || (unit.isAlive && (definition.cureStatuses ?? []).some((status) => (unit.statuses?.[status] ?? 0) > 0))
          || (!unit.isAlive && definition.revive));
        if (valid) {
          actions.push(buildAction(battle, fighter, spellId));
        }
        continue;
      }
      for (const ally of fullTeam) {
        const valid = (!ally.isAlive && definition.revive)
          || (ally.isAlive && ally.hp < ally.maxHp && (definition.powerBase || definition.healBase))
          || (ally.isAlive && (definition.cureStatuses ?? []).some((status) => (ally.statuses?.[status] ?? 0) > 0));
        if (valid) {
          actions.push(buildAction(battle, fighter, spellId, ally));
        }
      }
    }

    if (Array.isArray(fighter.loadout.supportMagics)) {
      for (const spellId of fighter.loadout.supportMagics) {
        const definition = getActionDefinition(battle, spellId);
        if (!canPayActionCost(fighter, definition)) {
          continue;
        }
        if (definition.targeting === 'all-allies') {
          actions.push(buildAction(battle, fighter, spellId));
        } else {
          for (const ally of allies) {
            actions.push(buildAction(battle, fighter, spellId, ally));
          }
        }
      }
    }

    if (Array.isArray(fighter.loadout.debuffMagics)) {
      for (const spellId of fighter.loadout.debuffMagics) {
        const definition = getActionDefinition(battle, spellId);
        if (!canPayActionCost(fighter, definition)) {
          continue;
        }
        if (definition.targeting === 'all-enemies') {
          actions.push(buildAction(battle, fighter, spellId));
        } else {
          for (const opponent of opponents) {
            actions.push(buildAction(battle, fighter, spellId, opponent));
          }
        }
      }
    }

    for (const spellId of offensiveMagicIds(fighter)) {
      const definition = getActionDefinition(battle, spellId);
      if (!canPayActionCost(fighter, definition)) {
        continue;
      }
      if (definition.targeting === 'all-enemies') {
        actions.push(buildAction(battle, fighter, spellId));
      } else {
        for (const opponent of opponents) {
          actions.push(buildAction(battle, fighter, spellId, opponent));
        }
      }
    }
  }

  if (fighter.team === 'players') {
    const itemActions = Object.values(ACTION_LIBRARY).filter((definition) => definition.commandType === 'item');
    for (const definition of itemActions) {
      const count = battle.inventory?.[definition.inventoryKey] ?? 0;
      if (count <= 0) {
        continue;
      }
      if (definition.targeting === 'all-allies') {
        actions.push(buildAction(battle, fighter, definition.id));
        continue;
      }
      for (const ally of battleTeam(battle, fighter)) {
        const valid = (!ally.isAlive && definition.revive)
          || (ally.isAlive && ((definition.healBase ?? 0) > 0 || (definition.restoreSp ?? 0) > 0 || (definition.restoreMp ?? 0) > 0))
          || (ally.isAlive && (definition.cureStatuses ?? []).some((status) => (ally.statuses?.[status] ?? 0) > 0));
        if (valid) {
          actions.push(buildAction(battle, fighter, definition.id, ally));
        }
      }
    }
  }

  actions.push(buildAction(battle, fighter, 'endure'));
  for (const point of chooseEvadePointsForFighter(fighter)) {
    actions.push(buildAction(battle, fighter, 'evade', null, point));
  }

  return actions;
}

export function createManualPlayerController() {
  const controller = ({ battle, fighter, actions }) => {
    const queued = battle.manualSelections?.[fighter.id];
    if (queued) {
      delete battle.manualSelections[fighter.id];
      recordDecision(battle, fighter, 'manual', actions, queued);
      return queued;
    }

    battle.awaitingInput = {
      fighterId: fighter.id,
      fighterName: fighter.name,
      actions,
      options: summarizeDecisionOptions(battle, fighter, actions),
      controllerLabel: 'manual',
    };
    return MANUAL_ACTION_PENDING;
  };

  controller.awaitsInput = true;
  controller.debugLabel = 'manual';
  return controller;
}

export function getAwaitingInput(battle) {
  return battle.awaitingInput;
}

export function queueManualAction(battle, fighterId, action) {
  const awaiting = battle.awaitingInput;
  if (!awaiting || awaiting.fighterId !== fighterId) {
    return false;
  }

  const fighter = allCombatants(battle).find((unit) => unit.id === fighterId);
  if (!fighter || !fighter.isAlive) {
    return false;
  }

  const validated = getAvailableActions(battle, fighter).find((candidate) => sameActionSignature(candidate, action));
  if (!validated) {
    return false;
  }

  battle.manualSelections[fighterId] = validated;
  battle.awaitingInput = null;
  return true;
}

function resolveThreatTarget(battle, actor, action) {
  if (!action.targetId) {
    return null;
  }

  if (action.definition.targeting === 'single-ally') {
    const team = action.definition.revive ? battleTeam(battle, actor) : livingAllies(battle, actor);
    return team.find((fighter) => fighter.id === action.targetId) ?? null;
  }

  return livingOpponents(battle, actor).find((fighter) => fighter.id === action.targetId) ?? null;
}

export function analyzeActionChoice(battle, fighter, action) {
  const target = resolveThreatTarget(battle, fighter, action);
  const opponents = livingOpponents(battle, fighter);
  const allies = livingAllies(battle, fighter);
  const selfDanger = 1 - hpRatio(fighter);
  const lowestAlly = allies.slice().sort((left, right) => hpRatio(left) - hpRatio(right))[0] ?? fighter;
  const threateningTarget = chooseThreateningTarget(opponents);
  const cancelWindow = target && target.pendingAction && target.ip >= COM_START ? (target.ip - COM_START) / (ACT_POINT - COM_START) : 0;
  const targetThreat = target ? target.ip / IP_MAX : 0;
  const targetLowHp = target ? 1 - hpRatio(target) : 0;
  const estimatedDamagePerHit = target && action.definition.power
    ? estimatePhysicalDamage(fighter, target, action.definition.power)
    : 0;

  let targetCount = 0;
  let totalEstimatedDamage = 0;
  let totalTargetMaxHp = 0;
  let healAmount = 0;
  let healNeed = 0;
  let shiftPressure = 0;
  let lineExposureBefore = 0;
  let lineExposureAfter = 0;
  let distanceGain = 0;
  let itemCureScore = 0;
  let statusPressure = 0;
  let statusNames = [];

  if (action.definition.targeting === 'all-allies') {
    targetCount = allies.length;
    healNeed = allies.reduce((sum, ally) => sum + (1 - hpRatio(ally)), 0) / Math.max(1, allies.length);
    shiftPressure = allies.reduce((sum, ally) => {
      return sum + (action.definition.statShifts ?? []).reduce((score, shift) => {
        if (shift.amount > 0) {
          return score + ((ally.buffs?.[shift.stat] ?? 0) === 0 ? 0.9 : 0.2);
        }
        return score;
      }, 0);
    }, 0) / Math.max(1, allies.length);
  } else if (action.definition.targeting === 'all-enemies') {
    const targetList = opponents;
    targetCount = targetList.length;
    if (action.definition.kind === 'magic') {
      totalEstimatedDamage = targetList.reduce((sum, opponent) => sum + Math.max(1, Math.round(fighter.mag * (action.definition.spellPower ?? 0.9) - opponent.men * 0.35 + (action.definition.spellBase ?? 0))), 0);
    } else {
      totalEstimatedDamage = targetList.reduce((sum, opponent) => sum + estimatePhysicalDamage(fighter, opponent, action.definition.power ?? 0.6), 0);
    }
    totalTargetMaxHp = targetList.reduce((sum, opponent) => sum + opponent.maxHp, 0);
    statusNames = (action.definition.statusEffects ?? []).map((effect) => effect.name);
    statusPressure = targetList.reduce((sum, opponent) => {
      return sum + statusNames.reduce((score, name) => {
        if ((opponent.statuses?.[name] ?? 0) > 0) {
          return score;
        }
        if (name === 'sleep') return score + 1.2;
        if (name === 'moveBlock' || name === 'magicBlock') return score + 1.0;
        if (name === 'poison') return score + 0.7;
        return score + 0.6;
      }, 0);
    }, 0) / Math.max(1, targetList.length);
  } else if (action.id === 'combo' && target) {
    targetCount = Math.min(action.definition.hitCount, opponents.length);
    totalEstimatedDamage = estimatedDamagePerHit * action.definition.hitCount;
    totalTargetMaxHp = target.maxHp;
  } else if ((action.id === 'critical' || action.id === 'tenseiken') && target) {
    targetCount = 1;
    totalEstimatedDamage = estimatedDamagePerHit;
    totalTargetMaxHp = target.maxHp;
  } else if (action.definition.commandType === 'magic' && action.definition.targeting === 'single-ally' && target && (action.definition.powerBase || action.definition.healBase || action.definition.revive || (action.definition.cureStatuses ?? []).length > 0)) {
    healAmount = Math.min(target.maxHp - target.hp, action.definition.healBase ?? calcHealAmount(fighter, action.definition.powerBase ?? 0));
    healNeed = target.maxHp > 0 ? (target.maxHp - target.hp) / target.maxHp : 0;
    targetCount = 1;
    statusNames = action.definition.cureStatuses ?? [];
    itemCureScore = statusNames.reduce((score, name) => score + ((target.statuses?.[name] ?? 0) > 0 ? 1 : 0), 0) + (action.definition.revive && !target.isAlive ? 2 : 0);
  } else if (action.definition.commandType === 'item' && target) {
    targetCount = 1;
    healAmount = Math.min(target.maxHp - target.hp, action.definition.healBase ?? 0);
    healNeed = target.maxHp > 0 ? (target.maxHp - target.hp) / target.maxHp : 0;
    statusNames = action.definition.cureStatuses ?? [];
    itemCureScore = statusNames.reduce((score, name) => score + ((target.statuses?.[name] ?? 0) > 0 ? 1 : 0), 0);
    if (action.definition.revive && !target.isAlive) {
      itemCureScore += 2;
    }
  } else if ((action.id === 'wow' || action.id === 'speedy') && target) {
    targetCount = 1;
    shiftPressure = (action.definition.statShifts ?? []).reduce((sum, shift) => {
      if (shift.amount > 0) {
        return sum + (((target.buffs?.[shift.stat] ?? 0) === 0 ? 1 : 0.25) + (1 - hpRatio(target)) * 0.15);
      }
      return sum;
    }, 0);
  } else if ((action.id === 'stram' || action.id === 'cold') && target) {
    targetCount = 1;
    shiftPressure = (action.definition.statShifts ?? []).reduce((sum, shift) => {
      if (shift.amount < 0) {
        return sum + ((targetThreat * 1.2) + ((target.debuffs?.[shift.stat] ?? 0) === 0 ? 0.8 : 0.2));
      }
      return sum;
    }, 0);
  } else if ((action.id === 'burn' || action.id === 'zap') && target) {
    targetCount = 1;
    totalEstimatedDamage = Math.max(1, Math.round(fighter.mag * (action.definition.spellPower ?? 0.9) - target.men * 0.35 + (action.definition.spellBase ?? 0)));
    totalTargetMaxHp = target.maxHp;
  } else if ((action.id === 'nightmareBall' || action.id === 'webTrap' || action.id === 'poisonSpit' || action.id === 'spellbindDust') && target) {
    targetCount = 1;
    totalEstimatedDamage = estimatedDamagePerHit;
    totalTargetMaxHp = target.maxHp;
    statusNames = (action.definition.statusEffects ?? []).map((effect) => effect.name);
    statusPressure = statusNames.reduce((score, name) => {
      if ((target.statuses?.[name] ?? 0) > 0) {
        return score;
      }
      if (name === 'sleep') {
        return score + 1.2;
      }
      if (name === 'moveBlock' || name === 'magicBlock') {
        return score + 1.0;
      }
      return score + 0.6;
    }, 0);
  } else if (action.id === 'wingSlice') {
    const hits = lineHitsFromPoint(fighter.position, action.targetPoint, action.definition.lineWidth, opponents);
    targetCount = hits.length;
    totalEstimatedDamage = hits.reduce((sum, opponent) => sum + estimatePhysicalDamage(fighter, opponent, action.definition.power), 0);
    totalTargetMaxHp = hits.reduce((sum, opponent) => sum + opponent.maxHp, 0);
  } else if (action.id === 'evade') {
    const nearestOpponentDistanceBefore = opponents.length === 0
      ? 0
      : Math.min(...opponents.map((opponent) => distance(fighter.position, opponent.position)));
    const nearestOpponentDistanceAfter = opponents.length === 0
      ? 0
      : Math.min(...opponents.map((opponent) => distance(action.targetPoint, opponent.position)));
    distanceGain = Math.max(0, nearestOpponentDistanceAfter - nearestOpponentDistanceBefore) / 220;

    lineExposureBefore = maxProjectedLineHits(battle, battleTeam(battle, fighter));
    lineExposureAfter = maxProjectedLineHits(battle, battleTeam(battle, fighter), [{ id: fighter.id, position: action.targetPoint }]);
  }

  const expectedDamageRatio = totalTargetMaxHp > 0 ? totalEstimatedDamage / totalTargetMaxHp : 0;
  const killScore = target && totalEstimatedDamage > 0 ? clamp(totalEstimatedDamage / Math.max(1, target.hp), 0, 2) : 0;
  const lineBreakScore = action.id === 'evade'
    ? clamp((lineExposureBefore - lineExposureAfter) / 2, 0, 1)
    : 0;
  const safetyScore = action.id === 'endure'
    ? selfDanger
    : action.id === 'evade'
      ? clamp(distanceGain + lineBreakScore, 0, 1.5)
      : 0;

  return {
    actionId: action.id,
    label: action.definition.label,
    targetName: target?.name ?? null,
    targetCount,
    totalEstimatedDamage,
    expectedDamageRatio,
    killScore,
    cancelWindow,
    targetThreat,
    targetLowHp,
    selfDanger,
    healAmount,
    healNeed,
    shiftPressure,
    itemCureScore,
    allyEmergency: 1 - hpRatio(lowestAlly),
    lineBreakScore,
    safetyScore,
    distanceGain,
    statusPressure,
    statusNames,
    threateningTargetMatches: target && threateningTarget ? Number(target.id === threateningTarget.id) : 0,
    resourceCost: (action.definition.costSp ?? 0) / Math.max(1, fighter.maxSp)
      + (action.definition.costMp ?? 0) / Math.max(1, fighter.maxMp || 1),
    isCombo: Number(action.id === 'combo'),
    isCritical: Number(action.id === 'critical'),
    isCancelMove: Number(action.id === 'tenseiken' || action.id === 'impactBomb' || action.id === 'lotusFlower'),
    isHeal: Number((action.definition.targeting === 'single-ally' || action.definition.targeting === 'all-allies') && (action.definition.powerBase || action.definition.healBase || action.definition.revive)),
    isEndure: Number(action.id === 'endure'),
    isEvade: Number(action.id === 'evade'),
    isLineMove: Number(action.definition.targeting === 'line'),
    isStatusMove: Number((action.definition.statusEffects ?? []).length > 0 || (action.definition.cureStatuses ?? []).length > 0),
    isOffensiveMagic: Number(action.definition.kind === 'magic' && (action.definition.targeting === 'single' || action.definition.targeting === 'all-enemies') && !!(action.definition.spellPower || action.definition.spellBase)),
    isSupportMagic: Number(action.definition.targeting === 'single-ally' || action.definition.targeting === 'all-allies'),
    isDebuffMagic: Number((action.definition.statShifts ?? []).some((shift) => shift.amount < 0)),
    isItem: Number(action.definition.commandType === 'item'),
  };
}

function describeController(controller, fallback = 'ai') {
  if (!controller) {
    return fallback;
  }

  if (controller.awaitsInput) {
    return 'manual';
  }

  return controller.debugLabel ?? fallback;
}

function summarizeDecisionOptions(battle, fighter, actions) {
  return actions.map((action) => ({
    id: action.id,
    label: action.definition.label,
    targetId: action.targetId ?? null,
    targetPoint: action.targetPoint ? clonePoint(action.targetPoint) : null,
    analysis: analyzeActionChoice(battle, fighter, action),
  }));
}

function recordDecision(battle, fighter, controllerLabel, actions, selectedAction) {
  battle.decisionLog.push({
    step: battle.turnCount,
    time: Number(battle.timeline.elapsedSeconds.toFixed(3)),
    fighterId: fighter.id,
    fighterName: fighter.name,
    team: fighter.team,
    controller: controllerLabel,
    selected: selectedAction
      ? {
          id: selectedAction.id,
          label: selectedAction.definition.label,
          targetId: selectedAction.targetId ?? null,
          targetPoint: selectedAction.targetPoint ? clonePoint(selectedAction.targetPoint) : null,
          analysis: analyzeActionChoice(battle, fighter, selectedAction),
        }
      : null,
    options: summarizeDecisionOptions(battle, fighter, actions),
  });
}

function pushResolvedSnapshot(battle, label = 'event') {
  battle.snapshots.push(makeBattleSnapshot(battle, label));
}

function queueSupplementalEvent(battle, event) {
  if (!event) {
    return;
  }
  battle.supplementalEvents.push(event);
}

function flushSupplementalEvents(battle) {
  const events = [...battle.supplementalEvents];
  battle.supplementalEvents.length = 0;
  return events;
}

function spawnPresetCombatant(battle, presetKey, overrides = {}) {
  const preset = PRESETS[presetKey];
  if (!preset) {
    return null;
  }

  battle.spawnCounter += 1;
  const spawned = createCombatant({
    ...JSON.parse(JSON.stringify(preset)),
    ...overrides,
    id: `${preset.id}-spawn-${battle.spawnCounter}`,
    sourceKey: presetKey,
    name: overrides.name ?? `${preset.name} ${battle.spawnCounter}`,
    position: overrides.position ?? clonePoint(preset.position ?? { x: 700, y: 200 }),
  }, battle.balance);

  if (spawned.team === 'players') {
    battle.players.push(spawned);
  } else {
    battle.enemies.push(spawned);
  }

  return spawned;
}

function maybeQueueBossReaction(battle, target, trigger) {
  const reaction = target.bossReaction;
  if (!reaction || !target.isAlive || (target.bossReactionCooldown ?? 0) > 0) {
    return null;
  }

  const statusMatch = (trigger.statusesApplied ?? []).some((status) => (reaction.triggerStatuses ?? []).includes(status));
  const debuffMatch = (trigger.debuffsApplied ?? []).some((stat) => (reaction.triggerDebuffs ?? []).includes(stat));
  const cancelMatch = Boolean(trigger.cancelled && reaction.triggerCancel);

  if (!statusMatch && !debuffMatch && !cancelMatch) {
    return null;
  }

  target.bossReactionCooldown = reaction.cooldown ?? 2;
  for (const status of reaction.cleanse ?? []) {
    target.statuses[status] = 0;
  }
  for (const shift of reaction.buffs ?? []) {
    applyStatShift(target, shift);
  }

  const event = {
    type: 'boss-reaction',
    actorId: target.id,
    targetIds: [target.id],
    impacts: [{ targetId: target.id, label: 'REACTION' }],
    text: reaction.message,
  };
  queueSupplementalEvent(battle, event);
  return event;
}

function processBattlefieldGimmick(battle) {
  const living = allCombatants(battle).filter((fighter) => fighter.isAlive);
  if (living.length === 0) {
    return null;
  }

  if (battle.battlefieldTheme === 'forest' && battle.turnCount > 0 && battle.turnCount % 8 === 0) {
    const players = battle.players.filter((fighter) => fighter.isAlive);
    const impacts = players.map((fighter) => {
      const heal = Math.min(fighter.maxHp - fighter.hp, Math.max(6, Math.round(fighter.maxHp * 0.05)));
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
      return { targetId: fighter.id, heal, label: 'BREEZE' };
    }).filter((impact) => impact.heal > 0);
    if (impacts.length > 0) {
      return {
        type: 'battlefield',
        actorId: null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'A restorative breeze sweeps through the forest and refreshes the party.',
      };
    }
  }

  if (battle.battlefieldTheme === 'cavern' && battle.turnCount > 0 && battle.turnCount % 8 === 0) {
    const sorted = living
      .slice()
      .sort((left, right) => right.ip - left.ip || right.hp - left.hp)
      .slice(0, Math.min(2, living.length));
    const impacts = sorted.map((fighter) => {
      const damage = Math.max(1, Math.round(fighter.maxHp * 0.08));
      fighter.hp = Math.max(0, fighter.hp - damage);
      applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
      if (fighter.hp <= 0) {
        markDown(fighter);
      }
      return { targetId: fighter.id, damage, statuses: ['actDown'], label: 'ROCKFALL' };
    });
    return {
      type: 'battlefield',
      actorId: null,
      targetIds: impacts.map((impact) => impact.targetId),
      impacts,
      text: 'Stalactites crash from the cavern ceiling and slow the most exposed fighters!',
    };
  }

  if (battle.battlefieldTheme === 'volcano' && battle.turnCount > 0 && battle.turnCount % 7 === 0) {
    const impacts = living.map((fighter) => {
      const damage = Math.max(1, Math.round(12 * (fighter.resistances?.fire ?? 1)));
      fighter.hp = Math.max(0, fighter.hp - damage);
      if (fighter.hp <= 0) {
        markDown(fighter);
      }
      return { targetId: fighter.id, damage, label: 'LAVA' };
    });
    return {
      type: 'battlefield',
      actorId: null,
      targetIds: impacts.map((impact) => impact.targetId),
      impacts,
      text: 'Lava erupts from the battlefield and scorches everyone standing nearby!',
    };
  }

  if (battle.battlefieldTheme === 'ruins' && battle.turnCount > 0 && battle.turnCount % 9 === 0) {
    const enemies = battle.enemies.filter((fighter) => fighter.isAlive);
    const impacts = [];
    for (const fighter of enemies) {
      if (applyStatShift(fighter, { stat: 'def', amount: 1, turns: 2 })) {
        impacts.push({ targetId: fighter.id, label: 'DEF+1' });
      }
    }
    if (impacts.length > 0) {
      return {
        type: 'battlefield',
        actorId: null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Ancient wards flare in the ruins and reinforce the enemy defense.',
      };
    }
  }

  return null;
}

function markScriptFlag(battle, flag) {
  if (!flag) {
    return false;
  }
  if (battle.customState.flags[flag]) {
    return false;
  }
  battle.customState.flags[flag] = true;
  return true;
}

function scriptDamage(target, amount, { label = 'SCRIPT', statuses = [] } = {}) {
  const damage = Math.max(1, Math.round(amount));
  target.hp = Math.max(0, target.hp - damage);
  if (target.hp <= 0) {
    markDown(target);
  }
  return { targetId: target.id, damage, statuses, label };
}

function scriptHeal(target, amount, { label = 'RESTORE' } = {}) {
  const heal = Math.max(1, Math.round(amount));
  target.hp = Math.min(target.maxHp, target.hp + heal);
  return { targetId: target.id, heal, label };
}

function scriptApplyStatus(target, effect, battle) {
  const applied = applyStatus(target, effect, battle.rng);
  return applied ? effect.name : null;
}

function processCustomBattleScript(battle) {
  const scriptId = battle.metadata?.customScriptId;
  if (!scriptId) {
    return [];
  }

  const events = [];
  const players = battle.players.filter((fighter) => fighter.isAlive);
  const enemies = battle.enemies.filter((fighter) => fighter.isAlive);
  const leadEnemy = enemies[0] ?? null;
  const leadPlayer = players[0] ?? null;

  if (scriptId === 'carbo-first-road') {
    const elena = players.find((fighter) => fighter.sourceKey === 'elena') ?? null;
    const ryudo = players.find((fighter) => fighter.sourceKey === 'ryudo') ?? leadPlayer;
    if (battle.turnCount >= 1 && elena && markScriptFlag(battle, 'carbo-road-rush')) {
      const impact = scriptDamage(elena, elena.maxHp * 0.12, { label: 'AMBUSH' });
      events.push({
        type: 'critical',
        actorId: leadEnemy?.id ?? null,
        targetIds: [elena.id],
        impacts: [impact],
        text: 'The first ambush on the road out of Carbo goes straight for Elena and tests the escort instantly!',
      });
    }
    if (ryudo && battle.turnCount >= 2 && markScriptFlag(battle, 'carbo-geohound-step')) {
      applyStatShift(ryudo, { stat: 'atk', amount: 1, turns: 2 });
      events.push({
        type: 'boss-reaction',
        actorId: ryudo.id,
        targetIds: [ryudo.id],
        impacts: [{ targetId: ryudo.id, label: 'ATK+1' }],
        text: 'Ryudo plants his feet between Elena and the road and turns the contract into a real fight.',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.55 && markScriptFlag(battle, 'carbo-roadwatch')) {
      const spawned = spawnPresetCombatant(battle, 'wingEye', {
        position: { x: 826, y: 118 },
        name: 'Roadwatch Eye',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [spawned.id],
          impacts: [{ targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'A second watcher slips out over the trees as the escort route grows hostile for real!',
        });
      }
    }
  }

  if (scriptId === 'garmia-collapse') {
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'garmia-floor-collapse')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return scriptDamage(fighter, fighter.maxHp * 0.07, { label: 'DEBRIS', statuses: ['actDown'] });
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The top floor of Garmia Tower ruptures and cursed debris slams into the party!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.6 && markScriptFlag(battle, 'garmia-corruption-wing')) {
      const spawned = spawnPresetCombatant(battle, 'wingEye', {
        position: { x: 820, y: 120 },
        name: 'Corrupted Wing',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [leadEnemy.id, spawned.id],
          impacts: [{ targetId: leadEnemy.id, label: 'RUPTURE' }, { targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'The shattered seal spits out a winged shard of Valmar corruption!',
        });
      }
    }
    if (battle.turnCount >= 5 && markScriptFlag(battle, 'garmia-night-wave')) {
      const impacts = players.map((fighter) => {
        const status = scriptApplyStatus(fighter, { name: 'magicBlock', turns: 1, chance: 1 }, battle);
        return scriptDamage(fighter, fighter.maxHp * 0.06, { label: 'SEAL BREAK', statuses: status ? [status] : [] });
      });
      events.push({
        type: 'boss-reaction',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The broken seal lashes outward and scrambles the party\'s magic timing!',
      });
    }
  }

  if (scriptId === 'millenia-night') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'millenia-night-laugh')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['actDown'], label: 'MOCKED' };
      });
      events.push({
        type: 'boss-reaction',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Millenia\'s laughter shatters the party\'s rhythm before the real pain begins.',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.5 && markScriptFlag(battle, 'millenia-dive')) {
      const weakest = players.slice().sort((a, b) => a.hp - b.hp)[0] ?? null;
      if (weakest) {
        const impact = scriptDamage(weakest, weakest.maxHp * 0.18, { label: 'DIVE' });
        events.push({
          type: 'critical',
          actorId: leadEnemy.id,
          targetIds: [weakest.id],
          impacts: [impact],
          text: `Millenia dives straight at ${weakest.name} with a mocking scream!`,
        });
      }
    }
  }

  if (scriptId === 'stheim-sanction') {
    const elena = players.find((fighter) => fighter.sourceKey === 'elena') ?? null;
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'stheim-sanction-awe')) {
      const impacts = players.map((fighter) => {
        const status = scriptApplyStatus(fighter, { name: 'magicBlock', turns: 1, chance: 1 }, battle);
        return { targetId: fighter.id, statuses: status ? [status] : [], label: 'SANCTION' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The holy city answers doubt with a suffocating wave of ritual pressure and broken casting rhythm!',
      });
    }
    if (elena && battle.turnCount >= 2 && markScriptFlag(battle, 'stheim-elena-will')) {
      applyStatShift(elena, { stat: 'def', amount: 1, turns: 2 });
      applyStatShift(elena, { stat: 'act', amount: 1, turns: 2 });
      events.push({
        type: 'boss-reaction',
        actorId: elena.id,
        targetIds: [elena.id],
        impacts: [{ targetId: elena.id, label: 'DEF+1' }, { targetId: elena.id, label: 'ACT+1' }],
        text: 'Elena refuses to let the church\'s pressure define her faith, and the party finds its footing again.',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.62 && markScriptFlag(battle, 'stheim-quiet-command')) {
      for (const enemy of enemies) {
        applyStatShift(enemy, { stat: 'def', amount: 1, turns: 2 });
      }
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: enemies.map((fighter) => fighter.id),
        impacts: enemies.map((fighter) => ({ targetId: fighter.id, label: 'DEF+1' })),
        text: 'A single quiet command from the cathedral line hardens every guard posture at once.',
      });
    }
  }

  if (scriptId === 'durham-rescue') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'durham-rockfall')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'mov', amount: -1, turns: 2 });
        return scriptDamage(fighter, fighter.maxHp * 0.05, { label: 'ROCKFALL', statuses: ['movDown'] });
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The Durham brute smashes the cave walls and turns the rescue into a collapsing scramble!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.7 && markScriptFlag(battle, 'durham-roan-nerve')) {
      const target = players.slice().sort((a, b) => a.hp - b.hp)[0] ?? leadPlayer;
      if (target) {
        const healAmount = Math.round(target.maxHp * 0.12);
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        applyStatShift(target, { stat: 'act', amount: 1, turns: 2 });
        events.push({
          type: 'boss-reaction',
          actorId: target.id,
          targetIds: [target.id],
          impacts: [{ targetId: target.id, heal: healAmount, label: 'ROAN SHOUT' }, { targetId: target.id, label: 'ACT+1' }],
          text: 'Roan shouts from deeper in the cave, and the party steadies itself for one more push!',
        });
      }
    }
    if (battle.turnCount >= 4 && markScriptFlag(battle, 'durham-horn-rush')) {
      const target = players.slice().sort((a, b) => b.maxHp - a.maxHp)[0] ?? leadPlayer;
      if (target) {
        const status = scriptApplyStatus(target, { name: 'moveBlock', turns: 1, chance: 1 }, battle);
        const impact = scriptDamage(target, target.maxHp * 0.16, { label: 'HORN RUSH', statuses: status ? [status] : [] });
        events.push({
          type: 'critical',
          actorId: leadEnemy?.id ?? null,
          targetIds: [target.id],
          impacts: [impact],
          text: `${leadEnemy?.name ?? 'The minotaur'} lunges through the rubble and nearly pins ${target.name} in place!`,
        });
      }
    }
  }

  if (scriptId === 'garlan-night-pressure') {
    const ryudo = players.find((fighter) => fighter.sourceKey === 'ryudo') ?? leadPlayer;
    if (ryudo && battle.turnCount >= 1 && markScriptFlag(battle, 'garlan-memory-weight')) {
      applyStatShift(ryudo, { stat: 'act', amount: -1, turns: 2 });
      events.push({
        type: 'status',
        actorId: leadEnemy?.id ?? null,
        targetIds: [ryudo.id],
        impacts: [{ targetId: ryudo.id, statuses: ['actDown'], label: 'MEMORY WEIGHT' }],
        text: 'Garlan\'s night presses straight onto Ryudo and drags old hesitation back into his hands.',
      });
    }
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'garlan-shadow-pack')) {
      const impacts = players.map((fighter) => scriptDamage(fighter, fighter.maxHp * 0.06, { label: 'NIGHT PACK' }));
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The whole village edge feels haunted as shadows close from several angles at once.',
      });
    }
    if (ryudo && ryudo.hp / Math.max(1, ryudo.maxHp) <= 0.55 && markScriptFlag(battle, 'garlan-ryudo-grit')) {
      applyStatShift(ryudo, { stat: 'atk', amount: 1, turns: 3 });
      applyStatShift(ryudo, { stat: 'def', amount: 1, turns: 2 });
      events.push({
        type: 'boss-reaction',
        actorId: ryudo.id,
        targetIds: [ryudo.id],
        impacts: [{ targetId: ryudo.id, label: 'ATK+1' }, { targetId: ryudo.id, label: 'DEF+1' }],
        text: 'Ryudo stops resisting the weight of the village and turns it into sheer stubborn force.',
      });
    }
  }

  if (scriptId === 'great-rift-storm') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'great-rift-crosswind')) {
      const targets = players.slice().sort((a, b) => b.ip - a.ip).slice(0, Math.min(2, players.length));
      const impacts = targets.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['actDown'], label: 'CROSSWIND' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The cyclone route hammers the front of the formation and tears the party\'s timing apart!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.72 && markScriptFlag(battle, 'great-rift-spawn-eye')) {
      const spawned = spawnPresetCombatant(battle, 'wingEye', {
        position: { x: 824, y: 120 },
        name: 'Cyclone Eye',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [leadEnemy.id, spawned.id],
          impacts: [{ targetId: leadEnemy.id, label: 'STORM FRONT' }, { targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'The Great Rift opens another violent pocket in the storm and spits a fresh aerial predator into the path!',
        });
      }
    }
    if (battle.turnCount >= 3 && markScriptFlag(battle, 'great-rift-lightning')) {
      const impacts = players.map((fighter) => scriptDamage(fighter, fighter.maxHp * 0.07, { label: 'RIFT SURGE' }));
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Lightning and abyssal pressure slam through the whole crossing at once!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.5 && markScriptFlag(battle, 'great-rift-route-break')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'mov', amount: 1, turns: 2 });
        applyStatShift(fighter, { stat: 'act', amount: 1, turns: 2 });
        return { targetId: fighter.id, label: 'PATH OPEN' };
      });
      events.push({
        type: 'boss-reaction',
        actorId: leadPlayer?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'A break in the storm finally appears, and the party surges through the gap toward Demon\'s Law!',
      });
    }
  }

  if (scriptId === 'moon-siege') {
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'moon-pressure-wave')) {
      const impacts = players.map((fighter) => scriptDamage(fighter, fighter.maxHp * 0.08, { label: 'MOON PRESSURE' }));
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Valmar\'s Moon vents crushing biological pressure across the whole battlefield!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.65 && markScriptFlag(battle, 'moon-spawn-hatchling')) {
      const spawned = spawnPresetCombatant(battle, 'wingEye', {
        position: { x: 820, y: 260 },
        name: 'Moon Hatchling',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [leadEnemy.id, spawned.id],
          impacts: [{ targetId: leadEnemy.id, label: 'SIEGE' }, { targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'The living moon spits out another hatchling to keep the siege going!',
        });
      }
    }
    const mareg = players.find((fighter) => fighter.sourceKey === 'mareg');
    if (mareg && battle.turnCount >= 5 && markScriptFlag(battle, 'moon-mareg-stand')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'atk', amount: 1, turns: 2 });
        return { targetId: fighter.id, label: 'ATK+1' };
      });
      events.push({
        type: 'boss-reaction',
        actorId: mareg.id,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Mareg roars through the moonlight and drives the whole party onward!',
      });
    }
  }

  if (scriptId === 'granasaber-reveal') {
    if (leadEnemy && battle.turnCount >= 2 && markScriptFlag(battle, 'granasaber-ward-rotation')) {
      applyStatShift(leadEnemy, { stat: 'def', amount: 1, turns: 2 });
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: [leadEnemy.id],
        impacts: [{ targetId: leadEnemy.id, label: 'DEF+1' }],
        text: 'Ancient wards rotate around the Granasaber shell and harden its defense!',
      });
    }
    if (battle.turnCount >= 4 && markScriptFlag(battle, 'granasaber-control-surge')) {
      const targets = players.slice().sort((a, b) => b.ip - a.ip).slice(0, Math.min(2, players.length));
      const impacts = targets.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['actDown'], label: 'CONTROL' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The revealed machine floods the field with suppressive control pulses!',
      });
    }
  }

  if (scriptId === 'melfice-duel') {
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'melfice-pressure')) {
      const target = players.slice().sort((a, b) => a.hp - b.hp)[0] ?? null;
      if (target) {
        const impact = scriptDamage(target, target.maxHp * 0.16, { label: 'BROTHER CUT' });
        events.push({
          type: 'critical',
          actorId: leadEnemy?.id ?? null,
          targetIds: [target.id],
          impacts: [impact],
          text: `Melfice tears into ${target.name} with the same merciless pressure Ryudo remembers from the past!`,
        });
      }
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.55 && markScriptFlag(battle, 'melfice-blade-rush')) {
      applyStatShift(leadEnemy, { stat: 'atk', amount: 1, turns: 3 });
      applyStatShift(leadEnemy, { stat: 'act', amount: 1, turns: 3 });
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: [leadEnemy.id],
        impacts: [{ targetId: leadEnemy.id, label: 'BLADE RUSH' }],
        text: 'Melfice abandons restraint and drives the duel into a faster, harsher tempo!',
      });
    }
  }

  if (scriptId === 'cathedral-massacre') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'cathedral-panic')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['actDown'], label: 'PANIC' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The massacre surges around the party and even the battlefield itself feels unstable!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.6 && markScriptFlag(battle, 'cathedral-heart-throb')) {
      const impacts = enemies.map((fighter) => {
        applyStatShift(fighter, { stat: 'atk', amount: 1, turns: 2 });
        return { targetId: fighter.id, label: 'HEARTBEAT' };
      });
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: enemies.map((fighter) => fighter.id),
        impacts,
        text: 'The Heart of Valmar beats harder and the whole cathedral answers with murderous fervor!',
      });
    }
  }

  if (scriptId === 'zera-reveal') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'zera-contempt')) {
      const impacts = players.map((fighter) => {
        const status = scriptApplyStatus(fighter, { name: 'magicBlock', turns: 1, chance: 1 }, battle);
        return { targetId: fighter.id, statuses: status ? [status] : [], label: 'DISMISSAL' };
      });
      events.push({
        type: 'boss-reaction',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Zera dismisses the party with divine contempt and crushes their magical rhythm.',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.65 && markScriptFlag(battle, 'zera-false-guardian')) {
      const spawned = spawnPresetCombatant(battle, 'cathedralExecutioner', {
        position: { x: 822, y: 256 },
        name: 'False Guardian',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [leadEnemy.id, spawned.id],
          impacts: [{ targetId: leadEnemy.id, label: 'REVEAL' }, { targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'Zera tears away more of the mask and calls up another false servant to hold the line!',
        });
      }
    }
  }

  if (scriptId === 'cyrum-last-stand') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'cyrum-front-shock')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'def', amount: -1, turns: 2 });
        return { targetId: fighter.id, label: 'LINE BREAK', statuses: ['defDown'] };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The southern line buckles under the first impact and the whole defense threatens to fold inward!',
      });
    }
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'cyrum-reinforcements')) {
      const spawned = spawnPresetCombatant(battle, 'troglodyte', {
        position: { x: 822, y: 126 },
        name: 'Late Wave Striker',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy?.id ?? null,
          targetIds: [spawned.id],
          impacts: [{ targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'Another wave crashes into the southern front before the defenders can breathe!',
        });
      }
    }
    const roan = players.find((fighter) => fighter.sourceKey === 'roan');
    if (roan && battle.turnCount >= 4 && markScriptFlag(battle, 'cyrum-roan-command')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'atk', amount: 1, turns: 2 });
        applyStatShift(fighter, { stat: 'def', amount: 1, turns: 2 });
        return { targetId: fighter.id, label: 'RALLY' };
      });
      events.push({
        type: 'boss-reaction',
        actorId: roan.id,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'Roan finally takes command of the line and the defense tightens instead of breaking!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.45 && markScriptFlag(battle, 'cyrum-desperate-push')) {
      const impacts = enemies.map((fighter) => {
        applyStatShift(fighter, { stat: 'atk', amount: 1, turns: 2 });
        return { targetId: fighter.id, label: 'LAST PUSH' };
      });
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: enemies.map((fighter) => fighter.id),
        impacts,
        text: 'The attackers sense the line slipping and throw everything into one last violent surge!',
      });
    }
  }

  if (scriptId === 'birthplace-archive') {
    if (battle.turnCount >= 1 && markScriptFlag(battle, 'birthplace-blue-pulse')) {
      const targets = players.slice().sort((a, b) => (b.mp ?? 0) - (a.mp ?? 0)).slice(0, Math.min(2, players.length));
      const impacts = targets.map((fighter) => {
        const status = scriptApplyStatus(fighter, { name: 'magicBlock', turns: 1, chance: 1 }, battle);
        return { targetId: fighter.id, statuses: status ? [status] : [], label: 'BLUE PULSE' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'A cold blue archive pulse strips clean spell rhythm from the air around the party.',
      });
    }
    if (battle.turnCount >= 3 && markScriptFlag(battle, 'birthplace-yellow-lock')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'mov', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['movDown'], label: 'YELLOW LOCK' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The yellow mechanism remaps the room and the floor itself tries to trap the party in place.',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.6 && markScriptFlag(battle, 'birthplace-red-awaken')) {
      applyStatShift(leadEnemy, { stat: 'atk', amount: 1, turns: 3 });
      applyStatShift(leadEnemy, { stat: 'act', amount: 1, turns: 3 });
      events.push({
        type: 'boss-phase',
        actorId: leadEnemy.id,
        targetIds: [leadEnemy.id],
        impacts: [{ targetId: leadEnemy.id, label: 'RED WAKE' }],
        text: 'A red archive wake rolls through the chamber and the ancient system turns openly hostile!',
      });
    }
    if (battle.turnCount >= 5 && markScriptFlag(battle, 'birthplace-judgement')) {
      const impacts = players.map((fighter) => scriptDamage(fighter, fighter.maxHp * 0.08, { label: 'ARCHIVE JUDGEMENT' }));
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The ancient archive answers the final color key with a full-chamber judgement pulse!',
      });
    }
  }

  if (scriptId === 'inner-trial') {
    if (leadEnemy && battle.turnCount >= 2 && markScriptFlag(battle, 'inner-doubt')) {
      if (leadPlayer) {
        applyStatShift(leadPlayer, { stat: 'act', amount: -1, turns: 2 });
        events.push({
          type: 'status',
          actorId: leadEnemy.id,
          targetIds: [leadPlayer.id],
          impacts: [{ targetId: leadPlayer.id, statuses: ['actDown'], label: 'DOUBT' }],
          text: 'The shadow twists Ryudo\'s own hesitation into a slowing weight.',
        });
      }
    }
    if (battle.turnCount >= 4 && markScriptFlag(battle, 'inner-memory-fracture')) {
      if (leadPlayer) {
        const status = scriptApplyStatus(leadPlayer, { name: 'sleep', turns: 1, chance: 1 }, battle);
        events.push({
          type: 'boss-reaction',
          actorId: leadEnemy?.id ?? null,
          targetIds: [leadPlayer.id],
          impacts: [{ targetId: leadPlayer.id, statuses: status ? [status] : [], label: 'FLASHBACK' }],
          text: 'A brutal flash of memory tries to drag Ryudo back into the past for one fatal instant!',
        });
      }
    }
    if (leadPlayer && leadPlayer.hp / Math.max(1, leadPlayer.maxHp) <= 0.5 && markScriptFlag(battle, 'inner-acceptance')) {
      applyStatShift(leadPlayer, { stat: 'atk', amount: 1, turns: 3 });
      applyStatShift(leadPlayer, { stat: 'act', amount: 1, turns: 3 });
      events.push({
        type: 'boss-reaction',
        actorId: leadPlayer.id,
        targetIds: [leadPlayer.id],
        impacts: [{ targetId: leadPlayer.id, label: 'ATK+1' }, { targetId: leadPlayer.id, label: 'ACT+1' }],
        text: 'Ryudo steadies his heart, and the trial itself answers his resolve!',
      });
    }
  }

  if (scriptId === 'room-of-chaos') {
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'chaos-false-voice')) {
      const impacts = players.map((fighter) => {
        applyStatShift(fighter, { stat: 'act', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['actDown'], label: 'CONFUSION' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The Room of Chaos drowns the party in false voices and strips away their timing!',
      });
    }
    if (battle.turnCount >= 3 && markScriptFlag(battle, 'chaos-shadow-spawn')) {
      const spawned = spawnPresetCombatant(battle, 'innerShadowRyudo', {
        position: { x: 820, y: 120 },
        name: 'False Ryudo',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy?.id ?? null,
          targetIds: [spawned.id],
          impacts: [{ targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'The room answers with a false image of Ryudo and tries to turn identity itself into a weapon!',
        });
      }
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.6 && markScriptFlag(battle, 'chaos-mask-break')) {
      const weakest = players.slice().sort((a, b) => a.hp - b.hp)[0] ?? null;
      if (weakest) {
        const status = scriptApplyStatus(weakest, { name: 'sleep', turns: 1, chance: 1 }, battle);
        events.push({
          type: 'boss-reaction',
          actorId: leadEnemy.id,
          targetIds: [weakest.id],
          impacts: [{ targetId: weakest.id, statuses: status ? [status] : [], label: 'FALSE FACE' }],
          text: 'A false face of familiarity flashes before the party and almost stills their will entirely!',
        });
      }
    }
    if (battle.turnCount >= 5 && markScriptFlag(battle, 'chaos-last-echo')) {
      const targets = players.slice().sort((a, b) => b.ip - a.ip).slice(0, Math.min(2, players.length));
      const impacts = targets.map((fighter) => {
        applyStatShift(fighter, { stat: 'mov', amount: -1, turns: 2 });
        return { targetId: fighter.id, statuses: ['movDown'], label: 'ECHO LOCK' };
      });
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The last echo of the room warps distance itself and makes escape from the lie feel impossible!',
      });
    }
  }

  if (scriptId === 'new-valmar-core') {
    if (battle.turnCount >= 2 && markScriptFlag(battle, 'core-collapse-wave')) {
      const impacts = players.map((fighter) => scriptDamage(fighter, fighter.maxHp * 0.08, { label: 'CORE PULSE' }));
      events.push({
        type: 'battlefield',
        actorId: leadEnemy?.id ?? null,
        targetIds: impacts.map((impact) => impact.targetId),
        impacts,
        text: 'The core hammers the chamber with a crushing wave of living force!',
      });
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.7 && markScriptFlag(battle, 'core-false-mask')) {
      const spawned = spawnPresetCombatant(battle, 'milleniaShade', {
        position: { x: 820, y: 120 },
        name: 'False Millenia',
      });
      if (spawned) {
        events.push({
          type: 'boss-phase',
          actorId: leadEnemy.id,
          targetIds: [leadEnemy.id, spawned.id],
          impacts: [{ targetId: leadEnemy.id, label: 'MASK' }, { targetId: spawned.id, label: `SUMMON ${spawned.name}` }],
          text: 'The core spits out a false image of Millenia to break the party\'s focus!',
        });
      }
    }
    if (leadEnemy && leadEnemy.hp / Math.max(1, leadEnemy.maxHp) <= 0.35 && markScriptFlag(battle, 'core-final-will')) {
      for (const enemy of enemies) {
        enemy.statuses.sleep = 0;
        enemy.statuses.magicBlock = 0;
        enemy.statuses.moveBlock = 0;
        applyStatShift(enemy, { stat: 'atk', amount: 1, turns: 3 });
        applyStatShift(enemy, { stat: 'act', amount: 1, turns: 3 });
      }
      events.push({
        type: 'boss-reaction',
        actorId: leadEnemy.id,
        targetIds: enemies.map((enemy) => enemy.id),
        impacts: enemies.map((enemy) => ({ targetId: enemy.id, label: 'FINAL WILL' })),
        text: 'The last shell tears open and the raw will of Valmar surges through every surviving horror!',
      });
    }
  }

  return events;
}

function processBossPhaseTransitions(battle) {
  const transitions = [];

  for (const fighter of allCombatants(battle)) {
    const phases = fighter.bossPhases ?? [];
    if (!fighter.isAlive || phases.length === 0) {
      continue;
    }

    while (fighter.bossPhaseIndex < phases.length) {
      const nextPhase = phases[fighter.bossPhaseIndex];
      const ratio = fighter.maxHp > 0 ? fighter.hp / fighter.maxHp : 0;
      if (ratio > nextPhase.threshold) {
        break;
      }

      fighter.bossPhaseIndex += 1;
      fighter.bossPatternIndex = 0;
      if (nextPhase.buffs) {
        for (const [key, value] of Object.entries(nextPhase.buffs)) {
          fighter.buffs[key] = (fighter.buffs[key] ?? 0) + value;
        }
      }
      if (nextPhase.grants) {
        fighter.loadout = { ...(fighter.loadout ?? {}), ...nextPhase.grants };
      }

      const spawned = [];
      for (const summon of nextPhase.summons ?? []) {
        const result = spawnPresetCombatant(battle, summon.presetKey, {
          position: summon.position,
          team: summon.team ?? 'enemies',
          name: summon.name,
        });
        if (result) {
          spawned.push(result);
        }
      }

      const phaseEvent = {
        type: 'boss-phase',
        actorId: fighter.id,
        targetIds: [fighter.id, ...spawned.map((unit) => unit.id)],
        impacts: [
          { targetId: fighter.id, label: `PHASE ${fighter.bossPhaseIndex + 1}` },
          ...spawned.map((unit) => ({ targetId: unit.id, label: `SUMMON ${unit.name}` })),
        ],
        text: nextPhase.message,
      };
      transitions.push(phaseEvent);
    }
  }

  return transitions;
}

export function exportBattleLog(battle) {
  return {
    version: 4,
    generatedAt: new Date().toISOString(),
    metadata: {
      playerCount: battle.players.length,
      enemyCount: battle.enemies.length,
      inventory: { ...(battle.inventory ?? {}) },
      openingAdvantage: battle.openingAdvantage,
      customFlags: battle.customState?.flags ? { ...battle.customState.flags } : {},
      ...(battle.metadata ?? {}),
    },
    turnCount: battle.turnCount,
    winner: battleWinner(battle.players, battle.enemies),
    summary: {
      players: battle.players.map((fighter) => ({
        id: fighter.id,
        name: fighter.name,
        hp: fighter.hp,
        maxHp: fighter.maxHp,
        sp: fighter.sp,
        mp: fighter.mp,
        position: clonePoint(fighter.position),
      })),
      enemies: battle.enemies.map((fighter) => ({
        id: fighter.id,
        name: fighter.name,
        hp: fighter.hp,
        maxHp: fighter.maxHp,
        sp: fighter.sp,
        mp: fighter.mp,
        position: clonePoint(fighter.position),
      })),
    },
    events: [...battle.log],
    decisions: battle.decisionLog.map((entry) => ({ ...entry })),
    snapshots: battle.snapshots.map((snapshot) => JSON.parse(JSON.stringify(snapshot))),
  };
}

function chooseScriptedBossAction(battle, fighter, actions) {
  const patterns = fighter.bossPatterns ?? [];
  if (patterns.length === 0) {
    return null;
  }

  const phaseIndex = Math.min(fighter.bossPhaseIndex ?? 0, patterns.length - 1);
  const pattern = patterns[phaseIndex] ?? patterns[patterns.length - 1];
  if (!pattern || pattern.length === 0) {
    return null;
  }

  const startIndex = fighter.bossPatternIndex ?? 0;
  for (let offset = 0; offset < pattern.length; offset += 1) {
    const commandId = pattern[(startIndex + offset) % pattern.length];
    const match = actions.find((action) => action.id === commandId);
    if (match) {
      fighter.bossPatternIndex = (startIndex + offset + 1) % pattern.length;
      return match;
    }
  }

  return null;
}

function choosePlayerActionHeuristic(battle, fighter) {
  const actions = getAvailableActions(battle, fighter);
  const allies = livingAllies(battle, fighter);
  const opponents = livingOpponents(battle, fighter);
  const threateningTarget = chooseThreateningTarget(opponents);
  const lowAlly = allies.slice().sort((left, right) => hpRatio(left) - hpRatio(right))[0] ?? null;
  const bestTarget = chooseLowestHpTarget(opponents);
  const statusIds = statusMoveIds(fighter);

  if (fighter.loadout.aoeMove) {
    const bestAoe = actions
      .filter((action) => action.id === fighter.loadout.aoeMove)
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.targetCount - left.meta.targetCount || right.meta.expectedDamageRatio - left.meta.expectedDamageRatio)[0];
    if (bestAoe && (bestAoe.meta.targetCount >= 2 || bestAoe.meta.expectedDamageRatio >= 0.22)) {
      return bestAoe.action;
    }
  }

  if (lowAlly) {
    if (hpRatio(lowAlly) <= 0.46) {
      const heal = actions.find((action) => action.id === 'heal' && action.targetId === lowAlly.id);
      if (heal) {
        return heal;
      }
    }

    if (hpRatio(lowAlly) <= 0.3) {
      const herb = actions.find((action) => action.id === 'medicinalHerb' && action.targetId === lowAlly.id);
      if (herb) {
        return herb;
      }
    }

    if ((lowAlly.statuses?.poison ?? 0) > 0) {
      const antidote = actions.find((action) => action.id === 'antidote' && action.targetId === lowAlly.id);
      if (antidote) {
        return antidote;
      }
    }
  }

  if (fighter.loadout.cancelMove && threateningTarget) {
    const cancel = actions.find((action) => action.id === fighter.loadout.cancelMove && action.targetId === threateningTarget.id);
    if (cancel) {
      return cancel;
    }
  }

  if (statusIds.length > 0) {
    const bestStatus = actions
      .filter((action) => statusIds.includes(action.id))
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.statusPressure - left.meta.statusPressure || right.meta.targetThreat - left.meta.targetThreat)[0];
    if (bestStatus && bestStatus.meta.statusPressure >= 1 && (opponents.length > 1 || bestStatus.meta.targetThreat >= 0.5)) {
      return bestStatus.action;
    }
  }

  if (Array.isArray(fighter.loadout.supportMagics)) {
    const support = actions
      .filter((action) => fighter.loadout.supportMagics.includes(action.id))
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.shiftPressure - left.meta.shiftPressure)[0];
    if (support && support.meta.shiftPressure >= 0.95) {
      return support.action;
    }
  }

  if (Array.isArray(fighter.loadout.debuffMagics)) {
    const debuff = actions
      .filter((action) => fighter.loadout.debuffMagics.includes(action.id))
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.shiftPressure - left.meta.shiftPressure)[0];
    if (debuff && debuff.meta.shiftPressure >= 1.1) {
      return debuff.action;
    }
  }

  if (fighter.loadout.offensiveMagic) {
    const bestSpell = actions
      .filter((action) => action.id === fighter.loadout.offensiveMagic)
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.killScore - left.meta.killScore || right.meta.expectedDamageRatio - left.meta.expectedDamageRatio)[0];
    if (bestSpell && (bestSpell.meta.killScore >= 0.8 || bestSpell.meta.expectedDamageRatio >= 0.16)) {
      return bestSpell.action;
    }
  }

  if (fighter.loadout.lineMove) {
    const line = actions
      .filter((action) => action.id === fighter.loadout.lineMove)
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.targetCount - left.meta.targetCount || right.meta.expectedDamageRatio - left.meta.expectedDamageRatio)[0];
    if (line && line.meta.targetCount >= 2) {
      return line.action;
    }
  }

  if (threateningTarget && threateningTarget.ip >= 820) {
    const critical = actions.find((action) => action.id === 'critical' && action.targetId === threateningTarget.id);
    if (critical) {
      return critical;
    }
  }

  if (hpRatio(fighter) <= 0.26) {
    const evadeAction = actions
      .filter((action) => action.id === 'evade')
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.safetyScore - left.meta.safetyScore)[0];

    if (evadeAction && evadeAction.meta.safetyScore >= 0.55) {
      return evadeAction.action;
    }

    return actions.find((action) => action.id === 'endure') ?? actions[0];
  }

  return actions.find((action) => action.id === 'combo' && action.targetId === bestTarget?.id) ?? actions[0];
}

function chooseEnemyActionHeuristic(battle, fighter) {
  const actions = getAvailableActions(battle, fighter);
  const scripted = chooseScriptedBossAction(battle, fighter, actions);
  if (scripted) {
    return scripted;
  }

  const opponents = livingOpponents(battle, fighter);
  const threateningTarget = chooseThreateningTarget(opponents);
  const bestTarget = chooseLowestHpTarget(opponents);
  const statusIds = statusMoveIds(fighter);

  const lineMove = fighter.loadout.lineMove
    ? actions
      .filter((action) => action.id === fighter.loadout.lineMove)
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.targetCount - left.meta.targetCount || right.meta.expectedDamageRatio - left.meta.expectedDamageRatio)[0]
    : null;

  if (lineMove && lineMove.meta.targetCount >= 2) {
    return lineMove.action;
  }

  if (fighter.loadout.aoeMove) {
    const aoeMove = actions
      .filter((action) => action.id === fighter.loadout.aoeMove)
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.targetCount - left.meta.targetCount || right.meta.expectedDamageRatio - left.meta.expectedDamageRatio)[0];
    if (aoeMove && (aoeMove.meta.targetCount >= 2 || aoeMove.meta.expectedDamageRatio >= 0.18)) {
      return aoeMove.action;
    }
  }

  if (fighter.loadout.cancelMove && threateningTarget) {
    const cancel = actions.find((action) => action.id === fighter.loadout.cancelMove && action.targetId === threateningTarget.id);
    if (cancel) {
      return cancel;
    }
  }

  if (statusIds.length > 0) {
    const bestStatus = actions
      .filter((action) => statusIds.includes(action.id))
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.statusPressure - left.meta.statusPressure || right.meta.targetThreat - left.meta.targetThreat)[0];

    if (bestStatus && bestStatus.meta.statusPressure >= 1 && (bestStatus.meta.targetThreat >= 0.45 || bestTarget?.id === bestStatus.action.targetId)) {
      return bestStatus.action;
    }
  }

  if (threateningTarget && threateningTarget.ip >= 810) {
    const critical = actions.find((action) => action.id === 'critical' && action.targetId === threateningTarget.id);
    if (critical) {
      return critical;
    }
  }

  if (hpRatio(fighter) <= 0.24) {
    const evadeAction = actions
      .filter((action) => action.id === 'evade')
      .map((action) => ({ action, meta: analyzeActionChoice(battle, fighter, action) }))
      .sort((left, right) => right.meta.safetyScore - left.meta.safetyScore)[0];

    if (evadeAction && evadeAction.meta.safetyScore >= 0.45) {
      return evadeAction.action;
    }

    return actions.find((action) => action.id === 'endure') ?? actions[0];
  }

  return actions.find((action) => action.id === 'combo' && action.targetId === bestTarget?.id) ?? actions[0];
}

function resolveTeamController(battle, fighter) {
  const controllers = battle.controllers ?? {};

  if (controllers.byFighter?.[fighter.id]) {
    return controllers.byFighter[fighter.id];
  }

  if (fighter.team === 'players' && controllers.players) {
    return controllers.players;
  }

  if (fighter.team === 'enemies' && controllers.enemies) {
    return controllers.enemies;
  }

  return fighter.team === 'players' ? choosePlayerActionHeuristic : chooseEnemyActionHeuristic;
}

function chooseActionForFighter(battle, fighter) {
  const actions = getAvailableActions(battle, fighter);
  if (actions.length === 0) {
    return null;
  }

  const controller = resolveTeamController(battle, fighter);
  const controllerLabel = describeController(controller, fighter.team === 'players' ? 'player-ai' : 'enemy-ai');

  if (controller === choosePlayerActionHeuristic || controller === chooseEnemyActionHeuristic) {
    const selected = controller(battle, fighter);
    recordDecision(battle, fighter, controllerLabel, actions, selected);
    return selected;
  }

  const selected = controller({
    battle,
    fighter,
    actions,
    analyzeAction: (action) => analyzeActionChoice(battle, fighter, action),
  });

  if (selected === MANUAL_ACTION_PENDING) {
    return MANUAL_ACTION_PENDING;
  }

  if (!selected) {
    const fallback = controller.awaitsInput ? MANUAL_ACTION_PENDING : actions[0];
    if (fallback !== MANUAL_ACTION_PENDING) {
      recordDecision(battle, fighter, controllerLabel, actions, fallback);
    }
    return fallback;
  }

  const validated = actions.find((action) => sameActionSignature(action, selected));
  const finalAction = validated ?? (controller.awaitsInput ? MANUAL_ACTION_PENDING : selected);

  if (finalAction !== MANUAL_ACTION_PENDING && !controller.awaitsInput) {
    recordDecision(battle, fighter, controllerLabel, actions, finalAction);
  }

  return finalAction;
}

function retargetSingleOpponent(battle, actor, targetId) {
  const opponents = livingOpponents(battle, actor);
  const current = opponents.find((fighter) => fighter.id === targetId);
  if (current) {
    return current;
  }
  return chooseNearestTarget(actor.position, opponents);
}

function retargetSingleAlly(battle, actor, targetId, options = {}) {
  const team = options.includeDowned ? battleTeam(battle, actor) : livingAllies(battle, actor);
  const current = team.find((fighter) => fighter.id === targetId);
  if (current) {
    return current;
  }
  if (options.includeDowned && options.preferDowned) {
    const downed = team.find((fighter) => !fighter.isAlive) ?? null;
    if (downed) {
      return downed;
    }
  }
  return team.filter((fighter) => fighter.isAlive).slice().sort((left, right) => hpRatio(left) - hpRatio(right))[0] ?? null;
}

function performMovementForMelee(attacker, target, definition) {
  const stopDistance = attacker.radius + target.radius + definition.range;
  const gap = Math.max(0, distance(attacker.position, target.position) - stopDistance);
  const moveBudget = getBattleStat(attacker, 'MOV') * definition.moveSeconds;

  if (gap > moveBudget) {
    attacker.position = moveTowards(attacker.position, target.position, moveBudget);
    return false;
  }

  const dx = attacker.position.x - target.position.x;
  const dy = attacker.position.y - target.position.y;
  const direction = normalize(dx, dy);

  attacker.position = {
    x: target.position.x + direction.x * stopDistance,
    y: target.position.y + direction.y * stopDistance,
  };

  return true;
}

function applyHitEffects(battle, attacker, target, definition, baseDamage) {
  const wasCharging = Boolean(target.pendingAction) && target.ip >= COM_START;
  const isCounter = wasCharging && target.ip >= 930;
  const rawDamage = isCounter ? Math.round(baseDamage * 1.25) : baseDamage;
  const damageMultiplier = target.guard?.type === 'endure' ? 0.35 : 1;
  const damage = Math.max(1, Math.round(rawDamage * damageMultiplier));
  const ipDamage = Math.max(
    0,
    Math.round(definition.ipDamage * (target.guard?.type === 'endure' ? 0.4 : 1)),
  );

  target.hp = Math.max(0, target.hp - damage);
  target.ip = Math.max(0, target.ip - ipDamage);

  if (damage > 0 && (target.statuses.sleep ?? 0) > 0) {
    target.statuses.sleep = 0;
  }

  gainSp(target, target.guard?.type === 'endure' ? 5 : 3);
  gainSp(attacker, definition.spGainOnHit ?? 0);

  let statusApplied = [];
  for (const effect of definition.statusEffects ?? []) {
    if (applyStatus(target, effect, battle.rng)) {
      statusApplied.push(effect.name);
    }
  }

  let cancelled = false;
  if (definition.cancel && wasCharging) {
    target.ip = Math.max(0, target.ip - definition.cancelPushback);
    clearPendingAction(target);
    cancelled = true;
  }

  if (target.hp <= 0) {
    markDown(target);
  }

  maybeQueueBossReaction(battle, target, {
    cancelled,
    statusesApplied: statusApplied,
  });

  return {
    damage,
    ipDamage,
    cancelled,
    statusApplied,
    isCounter,
    defeated: !target.isAlive,
    targetId: target.id,
    targetName: target.name,
  };
}

function resolveCombo(battle, actor, action) {
  const definition = action.definition;
  let target = retargetSingleOpponent(battle, actor, action.targetId);

  if (!target) {
    finishTurn(actor);
    return {
      type: 'combo',
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no target for Combo.`,
    };
  }

  const connected = performMovementForMelee(actor, target, definition);
  if (!connected) {
    finishTurn(actor);
    return {
      type: 'combo',
      actorId: actor.id,
      targetIds: [target.id],
      text: `${actor.name} rushed in with Combo but ${target.name} stayed out of reach.`,
    };
  }

  const hitResults = [];
  for (let hitIndex = 0; hitIndex < definition.hitCount; hitIndex += 1) {
    if (!target || !target.isAlive) {
      target = chooseNearestTarget(actor.position, livingOpponents(battle, actor));
      if (!target) {
        break;
      }
    }

    const result = applyHitEffects(
      battle,
      actor,
      target,
      definition,
      calcPhysicalDamage(actor, target, definition.power, battle.rng),
    );
    hitResults.push(result);

    if (!target.isAlive) {
      target = chooseNearestTarget(actor.position, livingOpponents(battle, actor));
    }
  }

  finishTurn(actor);

  const totalDamage = hitResults.reduce((sum, result) => sum + result.damage, 0);
  const detail = hitResults.map((result) => {
    const tags = [];
    if (result.isCounter) {
      tags.push('counter');
    }
    if (result.defeated) {
      tags.push('KO');
    }
    return `${result.targetName} ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}`;
  }).join(', ');

  return {
    type: 'combo',
    actorId: actor.id,
    targetIds: [...new Set(hitResults.map((result) => result.targetId).filter(Boolean))],
    impacts: hitResults.map((result) => ({ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [] })),
    text: `${actor.name} uses Combo for ${totalDamage}${detail ? ` -> ${detail}` : ''}.`,
  };
}

function resolveCriticalLikeAction(battle, actor, action) {
  const definition = action.definition;
  const target = retargetSingleOpponent(battle, actor, action.targetId);

  if (!target) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no target for ${definition.label}.`,
    };
  }

  const connected = definition.melee ? performMovementForMelee(actor, target, definition) : true;
  if (!connected) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [target.id],
      text: `${actor.name} prepared ${definition.label}, but ${target.name} stayed out of reach.`,
    };
  }

  if (definition.costSp) {
    spendSp(actor, definition.costSp);
  }

  const result = applyHitEffects(
    battle,
    actor,
    target,
    definition,
    calcPhysicalDamage(actor, target, definition.power, battle.rng),
  );
  finishTurn(actor);

  const tags = [];
  if (result.cancelled) {
    tags.push('cancel');
  }
  if (result.statusApplied?.length) {
    tags.push(...result.statusApplied);
  }
  if (result.isCounter) {
    tags.push('counter');
  }
  if (result.defeated) {
    tags.push('KO');
  }

  return {
    type: action.id,
    actorId: actor.id,
    targetIds: [result.targetId],
    impacts: [{ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [], cancelled: result.cancelled }],
    text: `${actor.name} uses ${definition.label} on ${target.name} for ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}.`,
  };
}

function resolveLineAttack(battle, actor, action) {
  const definition = action.definition;
  const point = action.targetPoint ?? clonePoint(actor.position);
  const hits = lineHitsFromPoint(actor.position, point, definition.lineWidth, livingOpponents(battle, actor));

  spendSp(actor, definition.costSp);

  if (hits.length === 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} uses ${definition.label}, but the line misses everyone.`,
    };
  }

  const results = hits.map((target) => applyHitEffects(
    battle,
    actor,
    target,
    definition,
    calcPhysicalDamage(actor, target, definition.power, battle.rng),
  ));

  finishTurn(actor);

  const detail = results.map((result) => {
    const tags = [];
    if (result.cancelled) {
      tags.push('cancel');
    }
    if (result.statusApplied?.length) {
      tags.push(...result.statusApplied);
    }
    if (result.defeated) {
      tags.push('KO');
    }
    return `${result.targetName} ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}`;
  }).join(', ');

  return {
    type: action.id,
    actorId: actor.id,
    targetIds: results.map((result) => result.targetId).filter(Boolean),
    impacts: results.map((result) => ({ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [], cancelled: result.cancelled })),
    text: `${actor.name} slices a line through the field with ${definition.label}: ${detail}.`,
  };
}

function resolveAllEnemiesAction(battle, actor, action) {
  const targets = livingOpponents(battle, actor);
  if (targets.length === 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no targets for ${action.definition.label}.`,
    };
  }

  const definition = action.definition;
  if (definition.costSp) {
    spendSp(actor, definition.costSp);
  }
  if (definition.costMp) {
    spendMp(actor, definition.costMp);
  }

  const results = targets.map((target) => {
    const damage = definition.kind === 'magic'
      ? calcMagicDamage(actor, target, definition.spellPower ?? 0.9, definition.spellBase ?? 0, battle.rng, definition.element ?? null)
      : calcPhysicalDamage(actor, target, definition.power ?? 0.6, battle.rng);
    return applyHitEffects(battle, actor, target, definition, damage);
  });

  finishTurn(actor);

  const detail = results.map((result) => {
    const tags = [];
    if (result.cancelled) tags.push('cancel');
    if (result.statusApplied?.length) tags.push(...result.statusApplied);
    if (result.defeated) tags.push('KO');
    return `${result.targetName} ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}`;
  }).join(', ');

  return {
    type: action.id,
    actorId: actor.id,
    targetIds: results.map((result) => result.targetId).filter(Boolean),
    impacts: results.map((result) => ({ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [], cancelled: result.cancelled })),
    text: `${actor.name} uses ${definition.label} on all enemies: ${detail}.`,
  };
}

function resolveStatShiftAction(battle, actor, action) {
  const definition = action.definition;
  const targets = [];

  if (definition.targeting === 'all-allies') {
    targets.push(...livingAllies(battle, actor));
  } else if (definition.targeting === 'all-enemies') {
    targets.push(...livingOpponents(battle, actor));
  } else if (definition.targeting === 'single-ally') {
    const ally = retargetSingleAlly(battle, actor, action.targetId);
    if (ally) {
      targets.push(ally);
    }
  } else {
    const enemy = retargetSingleOpponent(battle, actor, action.targetId);
    if (enemy) {
      targets.push(enemy);
    }
  }

  if (targets.length === 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no valid targets for ${definition.label}.`,
    };
  }

  if (definition.costMp) {
    spendMp(actor, definition.costMp);
  }
  if (definition.costSp) {
    spendSp(actor, definition.costSp);
  }

  const impacts = [];
  for (const target of targets) {
    const applied = [];
    const debuffsApplied = [];
    for (const shift of definition.statShifts ?? []) {
      if (applyStatShift(target, shift)) {
        applied.push(`${shift.stat}${shift.amount > 0 ? '+' : '-'}${Math.abs(shift.amount)}`);
        if (shift.amount < 0) {
          debuffsApplied.push(shift.stat);
        }
      }
    }
    maybeQueueBossReaction(battle, target, { debuffsApplied });
    impacts.push({ targetId: target.id, label: applied.join(' ') || definition.label });
  }

  finishTurn(actor);

  const targetNames = targets.map((target) => target.name).join(', ');
  const tags = impacts.map((impact) => impact.label).filter(Boolean).join(' / ');
  return {
    type: action.id,
    actorId: actor.id,
    targetIds: targets.map((target) => target.id),
    impacts,
    text: `${actor.name} uses ${definition.label} on ${targetNames}${tags ? ` (${tags})` : ''}.`,
  };
}

function resolveMagicAttack(battle, actor, action) {
  const target = retargetSingleOpponent(battle, actor, action.targetId);

  if (!target) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no target for ${action.definition.label}.`,
    };
  }

  if (action.definition.costMp) {
    spendMp(actor, action.definition.costMp);
  }
  if (action.definition.costSp) {
    spendSp(actor, action.definition.costSp);
  }
  const definition = action.definition;
  const damage = calcMagicDamage(actor, target, definition.spellPower ?? 0.9, definition.spellBase ?? 0, battle.rng, definition.element ?? null);
  const result = applyHitEffects(battle, actor, target, definition, damage);
  finishTurn(actor);

  const tags = [];
  if (result.statusApplied?.length) {
    tags.push(...result.statusApplied);
  }
  if (result.defeated) {
    tags.push('KO');
  }

  return {
    type: action.id,
    actorId: actor.id,
    targetIds: [result.targetId],
    impacts: [{ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [], cancelled: result.cancelled }],
    text: `${actor.name} casts ${definition.label} on ${target.name} for ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}.`,
  };
}

function resolveStatusMove(battle, actor, action) {
  const target = retargetSingleOpponent(battle, actor, action.targetId);

  if (!target) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} had no target for ${action.definition.label}.`,
    };
  }

  if (action.definition.costSp) {
    spendSp(actor, action.definition.costSp);
  }
  if (action.definition.costMp) {
    spendMp(actor, action.definition.costMp);
  }

  const baseDamage = action.definition.power
    ? (action.definition.kind === 'magic'
      ? calcMagicDamage(actor, target, action.definition.spellPower ?? 0.4, action.definition.spellBase ?? 0, battle.rng, action.definition.element ?? null)
      : calcPhysicalDamage(actor, target, action.definition.power, battle.rng))
    : 1;
  const result = applyHitEffects(battle, actor, target, action.definition, baseDamage);
  finishTurn(actor);

  const tags = [];
  if (result.statusApplied?.length) {
    tags.push(...result.statusApplied);
  }
  if (result.defeated) {
    tags.push('KO');
  }

  return {
    type: action.id,
    actorId: actor.id,
    targetIds: [result.targetId],
    impacts: [{ targetId: result.targetId, damage: result.damage, statuses: result.statusApplied ?? [] }],
    text: `${actor.name} uses ${action.definition.label} on ${target.name} for ${result.damage}${tags.length > 0 ? ` (${tags.join(', ')})` : ''}.`,
  };
}

function resolveHeal(battle, actor, action) {
  const definition = action.definition;
  const targets = definition.targeting === 'all-allies'
    ? battleTeam(battle, actor).filter((fighter) => fighter.isAlive || definition.revive)
    : [retargetSingleAlly(battle, actor, action.targetId, { includeDowned: Boolean(definition.revive), preferDowned: Boolean(definition.revive) })].filter(Boolean);

  if (targets.length === 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} tried to use ${definition.label}, but no valid ally target was available.`,
    };
  }

  if (definition.costMp) {
    spendMp(actor, definition.costMp);
  }
  if (definition.costSp) {
    spendSp(actor, definition.costSp);
  }

  const impacts = [];
  for (const target of targets) {
    let healed = 0;
    let revived = false;
    if (!target.isAlive && definition.revive) {
      const hp = Math.max(1, Math.round(target.maxHp * (definition.reviveRatio ?? 0.35)));
      target.hp = Math.min(target.maxHp, hp);
      target.state = 'waiting';
      revived = true;
    }
    if (target.isAlive && (definition.powerBase || definition.healBase)) {
      const amount = definition.healBase ?? calcHealAmount(actor, definition.powerBase ?? 0);
      healed = Math.min(target.maxHp - target.hp, amount);
      target.hp = Math.min(target.maxHp, target.hp + amount);
    }
    const cured = [];
    for (const status of definition.cureStatuses ?? []) {
      if ((target.statuses?.[status] ?? 0) > 0) {
        target.statuses[status] = 0;
        cured.push(status);
      }
    }
    const shifts = [];
    for (const shift of definition.statShifts ?? []) {
      if (applyStatShift(target, shift)) {
        shifts.push(`${shift.stat}${shift.amount > 0 ? '+' : '-'}${Math.abs(shift.amount)}`);
      }
    }
    if (revived || healed > 0 || cured.length > 0 || shifts.length > 0) {
      impacts.push({ targetId: target.id, heal: healed, revived, statuses: cured, shifts });
    }
  }

  finishTurn(actor);
  const impactText = impacts.map((impact) => {
    const target = battleTeam(battle, actor).find((fighter) => fighter.id === impact.targetId);
    const pieces = [];
    if (impact.revived) pieces.push('revive');
    if ((impact.heal ?? 0) > 0) pieces.push(`heal ${impact.heal}`);
    if ((impact.statuses ?? []).length > 0) pieces.push(`cleanse ${impact.statuses.join('/')}`);
    if ((impact.shifts ?? []).length > 0) pieces.push(impact.shifts.join('/'));
    return `${target?.name ?? impact.targetId}${pieces.length ? ` (${pieces.join(', ')})` : ''}`;
  }).join(', ');
  return {
    type: action.id,
    actorId: actor.id,
    targetIds: impacts.map((impact) => impact.targetId),
    impacts,
    text: `${actor.name} uses ${definition.label}${impactText ? `: ${impactText}` : ''}.`,
  };
}

function resolveItemAction(battle, actor, action) {
  const definition = action.definition;
  const targets = definition.targeting === 'all-allies'
    ? battleTeam(battle, actor).filter((fighter) => fighter.isAlive)
    : [retargetSingleAlly(battle, actor, action.targetId, { includeDowned: Boolean(definition.revive), preferDowned: Boolean(definition.revive) })].filter(Boolean);

  if (targets.length === 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: [],
      text: `${actor.name} tried to use ${definition.label}, but no valid ally target was available.`,
    };
  }

  const inventoryKey = definition.inventoryKey;
  if (!inventoryKey || (battle.inventory?.[inventoryKey] ?? 0) <= 0) {
    finishTurn(actor);
    return {
      type: action.id,
      actorId: actor.id,
      targetIds: targets.map((target) => target.id),
      text: `${actor.name} tried to use ${definition.label}, but the item was unavailable.`,
    };
  }

  battle.inventory[inventoryKey] -= 1;
  const impacts = [];
  for (const target of targets) {
    let healed = 0;
    let revived = false;
    let restoredSp = 0;
    let restoredMp = 0;
    if (!target.isAlive && definition.revive) {
      const hp = Math.max(1, Math.round(target.maxHp * (definition.reviveRatio ?? 0.35)));
      target.hp = Math.min(target.maxHp, hp);
      target.state = 'waiting';
      revived = true;
    }
    if (target.isAlive && (definition.healBase ?? 0) > 0) {
      healed = Math.min(target.maxHp - target.hp, definition.healBase);
      target.hp = Math.min(target.maxHp, target.hp + definition.healBase);
    }
    if (target.isAlive && (definition.restoreSp ?? 0) > 0) {
      restoredSp = Math.min(target.maxSp - target.sp, definition.restoreSp);
      target.sp = Math.min(target.maxSp, target.sp + definition.restoreSp);
    }
    if (target.isAlive && (definition.restoreMp ?? 0) > 0) {
      restoredMp = Math.min(target.maxMp - target.mp, definition.restoreMp);
      target.mp = Math.min(target.maxMp, target.mp + definition.restoreMp);
    }
    const cured = [];
    for (const status of definition.cureStatuses ?? []) {
      if ((target.statuses?.[status] ?? 0) > 0) {
        target.statuses[status] = 0;
        cured.push(status);
      }
    }
    impacts.push({ targetId: target.id, heal: healed, revived, restoreSp: restoredSp, restoreMp: restoredMp, statuses: cured });
  }

  finishTurn(actor);
  const impactText = impacts.map((impact) => {
    const target = battleTeam(battle, actor).find((fighter) => fighter.id === impact.targetId);
    const parts = [];
    if (impact.revived) parts.push('revive');
    if ((impact.heal ?? 0) > 0) parts.push(`heal ${impact.heal}`);
    if ((impact.restoreSp ?? 0) > 0) parts.push(`SP +${impact.restoreSp}`);
    if ((impact.restoreMp ?? 0) > 0) parts.push(`MP +${impact.restoreMp}`);
    if ((impact.statuses ?? []).length > 0) parts.push(`cleanse ${impact.statuses.join('/')}`);
    return `${target?.name ?? impact.targetId}${parts.length ? ` (${parts.join(', ')})` : ''}`;
  }).join(', ');
  return {
    type: action.id,
    actorId: actor.id,
    targetIds: impacts.map((impact) => impact.targetId),
    impacts,
    text: `${actor.name} uses ${definition.label}${impactText ? `: ${impactText}` : ''}.`,
  };
}

function resolveEndure(actor) {
  actor.guard = { type: 'endure' };
  finishTurn(actor);
  return {
    type: 'endure',
    actorId: actor.id,
    targetIds: [actor.id],
    impacts: [{ targetId: actor.id, label: 'ENDURE' }],
    text: `${actor.name} uses Endure and braces for impact.`,
  };
}

function resolveEvade(actor, action) {
  actor.position = clonePoint(action.targetPoint ?? actor.position);
  actor.guard = { type: 'evade' };
  finishTurn(actor);
  return {
    type: 'evade',
    actorId: actor.id,
    targetIds: [actor.id],
    impacts: [{ targetId: actor.id, label: 'EVADE' }],
    text: `${actor.name} uses Evade and repositions to (${Math.round(actor.position.x)}, ${Math.round(actor.position.y)}).`,
  };
}

function resolveAction(battle, actor, action) {
  const definition = action.definition;

  if (action.id === 'combo') {
    return resolveCombo(battle, actor, action);
  }
  if (action.id === 'endure') {
    return resolveEndure(actor);
  }
  if (action.id === 'evade') {
    return resolveEvade(actor, action);
  }
  if (definition.commandType === 'item') {
    return resolveItemAction(battle, actor, action);
  }
  if (definition.targeting === 'line') {
    return resolveLineAttack(battle, actor, action);
  }
  if (definition.targeting === 'all-enemies') {
    return resolveAllEnemiesAction(battle, actor, action);
  }
  if (definition.targeting === 'all-allies') {
    if ((definition.statShifts ?? []).length > 0 && !(definition.powerBase || definition.healBase || definition.revive || (definition.cureStatuses ?? []).length > 0)) {
      return resolveStatShiftAction(battle, actor, action);
    }
    return resolveHeal(battle, actor, action);
  }
  if (definition.targeting === 'single-ally') {
    if ((definition.statShifts ?? []).length > 0 && !(definition.powerBase || definition.healBase || definition.revive || (definition.cureStatuses ?? []).length > 0)) {
      return resolveStatShiftAction(battle, actor, action);
    }
    return resolveHeal(battle, actor, action);
  }
  if ((definition.statShifts ?? []).length > 0) {
    return resolveStatShiftAction(battle, actor, action);
  }
  if ((definition.statusEffects ?? []).length > 0 && (!definition.power || definition.kind === 'magic')) {
    return resolveStatusMove(battle, actor, action);
  }
  if (definition.kind === 'magic') {
    return resolveMagicAttack(battle, actor, action);
  }
  return resolveCriticalLikeAction(battle, actor, action);
}

function assignActionAtCom(battle, fighter) {
  resetGuardAtCommandStart(fighter);

  if (!fighter.preTurnResolved) {
    fighter.preTurnResolved = true;
    const upkeep = processTurnStartStatuses(battle, fighter);
    if (upkeep) {
      return {
        type: 'status',
        actorId: fighter.id,
        targetIds: [fighter.id],
        text: upkeep.text,
      };
    }
  }

  const action = chooseActionForFighter(battle, fighter);
  if (!action) {
    return null;
  }

  if (action === MANUAL_ACTION_PENDING) {
    fighter.state = 'com';
    fighter.ip = Math.max(fighter.ip, COM_START);
    return {
      type: 'awaiting-input',
      fighterId: fighter.id,
      actorId: fighter.id,
      targetIds: [],
      text: `${fighter.name} is waiting for a manual command.`,
    };
  }

  battle.awaitingInput = null;
  fighter.pendingAction = action;
  fighter.state = action.definition.instant ? 'acting' : 'charging';
  fighter.ip = Math.max(fighter.ip, COM_START);

  if (action.definition.instant) {
    return resolveAction(battle, fighter, action);
  }

  return null;
}

function processResolvedActors(battle) {
  const readyActors = allCombatants(battle)
    .filter((fighter) => fighter.isAlive && fighter.pendingAction && fighter.ip >= ACT_POINT)
    .sort((left, right) => right.ip - left.ip || getBattleStat(right, 'ACT') - getBattleStat(left, 'ACT'));

  if (readyActors.length === 0) {
    return null;
  }

  const actor = readyActors[0];
  return resolveAction(battle, actor, actor.pendingAction);
}

function processCommandEntries(battle) {
  const entrants = allCombatants(battle)
    .filter((fighter) => fighter.isAlive && !fighter.pendingAction && fighter.ip >= COM_START)
    .sort((left, right) => right.ip - left.ip || getBattleStat(right, 'ACT') - getBattleStat(left, 'ACT'));

  for (const fighter of entrants) {
    const event = assignActionAtCom(battle, fighter);
    if (event) {
      return event;
    }
  }

  return null;
}

export function advanceBattle(battle) {
  if (isBattleOver(battle.players, battle.enemies)) {
    return null;
  }

  if (battle.awaitingInput) {
    return {
      type: 'awaiting-input',
      fighterId: battle.awaitingInput.fighterId,
      text: `${battle.awaitingInput.fighterName} is waiting for a manual command.`,
    };
  }

  let simulatedSeconds = 0;
  while (simulatedSeconds < MAX_EVENT_SIM_SECONDS) {
    const resolvedEvent = processResolvedActors(battle);
    if (resolvedEvent) {
      if (resolvedEvent.type === 'awaiting-input') {
        battle.lastEvent = resolvedEvent;
        return resolvedEvent;
      }

      battle.turnCount += 1;
      battle.lastEvent = resolvedEvent;
      battle.log.push(resolvedEvent.text);
      const phaseEvents = processBossPhaseTransitions(battle);
      for (const phaseEvent of phaseEvents) {
        battle.log.push(phaseEvent.text);
      }
      const battlefieldEvent = processBattlefieldGimmick(battle);
      if (battlefieldEvent) {
        queueSupplementalEvent(battle, battlefieldEvent);
      }
      for (const customEvent of processCustomBattleScript(battle)) {
        queueSupplementalEvent(battle, customEvent);
      }
      const extraEvents = [...phaseEvents, ...flushSupplementalEvents(battle)];
      for (const extraEvent of extraEvents) {
        if (!phaseEvents.includes(extraEvent)) {
          battle.log.push(extraEvent.text);
        }
      }
      if (extraEvents.length > 0) {
        resolvedEvent.supplementalEvents = extraEvents;
      }
      pushResolvedSnapshot(battle, resolvedEvent.type);
      return resolvedEvent;
    }

    const commandEvent = processCommandEntries(battle);
    if (commandEvent) {
      if (commandEvent.type === 'awaiting-input') {
        battle.lastEvent = commandEvent;
        return commandEvent;
      }

      battle.turnCount += 1;
      battle.lastEvent = commandEvent;
      battle.log.push(commandEvent.text);
      const phaseEvents = processBossPhaseTransitions(battle);
      for (const phaseEvent of phaseEvents) {
        battle.log.push(phaseEvent.text);
      }
      const battlefieldEvent = processBattlefieldGimmick(battle);
      if (battlefieldEvent) {
        queueSupplementalEvent(battle, battlefieldEvent);
      }
      for (const customEvent of processCustomBattleScript(battle)) {
        queueSupplementalEvent(battle, customEvent);
      }
      const extraEvents = [...phaseEvents, ...flushSupplementalEvents(battle)];
      for (const extraEvent of extraEvents) {
        if (!phaseEvents.includes(extraEvent)) {
          battle.log.push(extraEvent.text);
        }
      }
      if (extraEvents.length > 0) {
        commandEvent.supplementalEvents = extraEvents;
      }
      pushResolvedSnapshot(battle, commandEvent.type);
      return commandEvent;
    }

    if (battle.awaitingInput) {
      return {
        type: 'awaiting-input',
        fighterId: battle.awaitingInput.fighterId,
        text: `${battle.awaitingInput.fighterName} is waiting for a manual command.`,
      };
    }

    battle.timeline.advance(allCombatants(battle), 0.05);
    simulatedSeconds += 0.05;
  }

  throw new Error('Battle simulation stalled before any event resolved.');
}

export function battleWinner(players, enemies) {
  if (listLiving(players).length > 0 && listLiving(enemies).length === 0) {
    return 'players';
  }

  if (listLiving(enemies).length > 0 && listLiving(players).length === 0) {
    return 'enemies';
  }

  return 'draw';
}

export function simulateBattle({
  maxEvents = 200,
  controllers = {},
  rng = Math.random,
  balance = DEFAULT_BALANCE_PROFILE,
  players,
  enemies,
  introLog,
} = {}) {
  const battle = createBattle({
    players,
    enemies,
    controllers,
    rng,
    balance,
    introLog,
  });

  while (!isBattleOver(battle.players, battle.enemies) && battle.turnCount < maxEvents) {
    advanceBattle(battle);
  }

  return {
    winner: battleWinner(battle.players, battle.enemies),
    turns: battle.turnCount,
    battle,
  };
}

export function runSimulations(count = 100, options = {}) {
  let playerWins = 0;
  let enemyWins = 0;
  let draws = 0;
  let totalTurns = 0;

  for (let index = 0; index < count; index += 1) {
    const result = simulateBattle(options);
    totalTurns += result.turns;

    if (result.winner === 'players') {
      playerWins += 1;
    } else if (result.winner === 'enemies') {
      enemyWins += 1;
    } else {
      draws += 1;
    }
  }

  return {
    count,
    playerWins,
    enemyWins,
    draws,
    playerWinRate: count === 0 ? 0 : playerWins / count,
    averageTurns: count === 0 ? 0 : totalTurns / count,
  };
}

export function describeFighter(fighter) {
  const flags = [];

  if (fighter.pendingAction) {
    flags.push(`charging ${fighter.pendingAction.definition.label}`);
  }
  if (fighter.guard?.type === 'endure') {
    flags.push('Endure');
  }
  if (fighter.guard?.type === 'evade') {
    flags.push('Evade');
  }
  flags.push(...activeStatusLabels(fighter));
  if (!fighter.isAlive) {
    flags.push('KO');
  }

  return `${fighter.name}: HP ${fighter.hp}/${fighter.maxHp}, SP ${fighter.sp}/${fighter.maxSp}, MP ${fighter.mp}/${fighter.maxMp}, IP ${Math.round(fighter.ip)}/${IP_MAX}, pos (${Math.round(fighter.position.x)}, ${Math.round(fighter.position.y)})${flags.length > 0 ? ` [${flags.join(', ')}]` : ''}`;
}
