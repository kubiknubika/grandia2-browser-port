// Level-up tables for special moves and magic (Grandia II canon-shaped).
// Move costs follow the official SC tables (Wulfson / Tricrokra special-attack guides):
// [Lv1->Lv2, Lv2->Lv3, Lv3->Lv4, Lv4->Lv5] in Special Coins.
// Magic costs are taken from the canonical Mana Egg MC tables (RPG Shrines / fandom).

import { MANA_EGGS } from './mana_eggs.js';

export const MOVE_LEVEL_COSTS = {
  // Ryudo
  tenseiken: [250, 500, 1000, 2000],
  flyingTenseiken: [400, 800, 1600, 3200],
  purpleLightning: [350, 700, 1400, 2800],
  skyDragonSlash: [750, 1500, 3000, 6000],
  // Elena
  impactBomb: [250, 500, 1000, 2000],
  nightmareBall: [300, 600, 1200, 2400],
  dropletsOfLife: [700, 1400, 2800, 5600],
  whiteApocalypse: [600, 1200, 2400, 4800],
  // Millenia
  arrowShot: [250, 500, 1000, 2000],
  heelCrush: [250, 500, 1000, 2000],
  fallenWings: [400, 800, 1600, 3200],
  starvingTongue: [300, 600, 1200, 2400],
  spellbindingEye: [500, 1000, 2000, 4000],
  grudgingClaws: [350, 700, 1400, 2800],
  // Roan
  goldenHammer: [250, 500, 1000, 2000],
  dragonRise: [400, 800, 1600, 3200],
  trueDragonRise: [400, 800, 1600, 3200],
  snowballFight: [350, 700, 1400, 2800],
  icePrison: [350, 700, 1400, 2800],
  vitalityMarch: [200, 400, 800, 1600],
  // Mareg
  beastFangCut: [250, 500, 1000, 2000],
  beastKingSmash: [400, 800, 1600, 3200],
  beastKingBlast: [500, 1000, 2000, 4000],
  lionsRoar: [300, 600, 1200, 2400],
  // Tio
  lotusFlower: [250, 500, 1000, 2000],
  fastDanceWhirl: [400, 800, 1600, 3200],
  tornado: [500, 1000, 2000, 4000],
  whisperToStars: [300, 600, 1200, 2400],
  // enemy-style moves (usable by party via loadouts)
  webTrap: [300, 600, 1200, 2400],
  poisonSpit: [300, 600, 1200, 2400],
  spellbindDust: [300, 600, 1200, 2400],
  wingSlice: [300, 600, 1200, 2400],
  earthQuake: [400, 800, 1600, 3200],
  tornadoHorn: [350, 700, 1400, 2800],
  killerVoltage: [400, 800, 1600, 3200],
  destructionRay: [400, 800, 1600, 3200],
  fastDanceWhirl2: [400, 800, 1600, 3200],
};

// Egg level upgrade costs in Magic Coins: [Lv1->2, Lv2->3, Lv3->4, Lv4->5]
export const EGG_LEVEL_COSTS = [80, 40, 60, 100];

export function moveLevelCosts(actionId) {
  return MOVE_LEVEL_COSTS[actionId] ?? null;
}

export function magicLevelCosts(actionId) {
  for (const egg of MANA_EGGS) {
    const spell = egg.spells.find((entry) => entry.id === actionId);
    if (spell) {
      return [...spell.mcCost];
    }
  }
  return null;
}

export function isMoveLevelable(actionId, definition) {
  return Boolean(definition && definition.commandType === 'move' && moveLevelCosts(actionId));
}

export function isMagicLevelable(actionId, definition) {
  return Boolean(definition && definition.commandType === 'magic' && magicLevelCosts(actionId));
}
