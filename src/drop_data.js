// Drop tables for the bestiary encyclopedia.
// Grounded in Grandia II guides (GameFAQs walkthroughs / RPG Shrines bestiary).
// Each entry: presetKey -> [{ key: itemKey, chance: 0..1, count }]
// 'equipment' entries reference EQUIPMENT_CATALOG ids.

export const ENEMY_DROPS = {
  cragSnake: [
    { key: 'antidote', chance: 0.45, count: 1 },
    { equipment: 'ryudo-sword-of-purity', chance: 0.04, count: 1 },
  ],
  frostFrog: [
    { key: 'eyeDrops', chance: 0.5, count: 1 },
    { key: 'paralysisSalve', chance: 0.25, count: 1 },
    { key: 'toadOil', chance: 0.2, count: 1 },
  ],
  gargoyle: [
    { equipment: 'ryudo-sword-of-purity', chance: 0.12, count: 1 },
    { key: 'magicBlessing', chance: 0.3, count: 1 },
  ],
  ghoul: [
    { key: 'eyeDrops', chance: 0.4, count: 1 },
    { key: 'seedOfPsyche', chance: 0.2, count: 1 },
  ],
  hammerhead: [
    { key: 'woundSalve', chance: 0.35, count: 1 },
  ],
  hellHound: [
    { equipment: 'ryudo-ogre-slayer', chance: 0.1, count: 1 },
    { key: 'paralysisSalve', chance: 0.3, count: 1 },
    { key: 'seedOfLife', chance: 0.25, count: 1 },
  ],
  salamadile: [
    { equipment: 'millenia-salamander-tail', chance: 0.14, count: 1 },
    { key: 'firebomb', chance: 0.35, count: 1 },
  ],
  melficeEcho: [
    { equipment: 'ryudo-maken-valborg', chance: 1, count: 1 },
  ],
  dragonKnight: [
    { key: 'scarletPotion', chance: 0.5, count: 1 },
    { equipment: 'elena-dragon-wand', chance: 0.12, count: 1 },
  ],
  valmarMoth: [
    { key: 'yomisElixir', chance: 0.25, count: 1 },
    { key: 'meteorScroll', chance: 0.1, count: 1 },
  ],
  nyarmot: [
    { key: 'panacea', chance: 0.3, count: 1 },
    { equipment: 'millenia-tight-dress', chance: 0.1, count: 1 },
  ],
  immuneCell: [
    { key: 'sympathyNut', chance: 0.2, count: 1 },
    { key: 'manaCrystal', chance: 0.25, count: 1 },
  ],
  killerTree: [
    { key: 'seedOfMagic', chance: 0.3, count: 1 },
    { key: 'healingIncense', chance: 0.15, count: 1 },
  ],
  landCougar: [
    { key: 'scrollOfAlheal', chance: 0.12, count: 1 },
    { key: 'blueberry', chance: 0.35, count: 1 },
  ],
  manEatingTree: [
    { key: 'healingIncense', chance: 0.15, count: 1 },
    { key: 'seedOfLife', chance: 0.3, count: 1 },
  ],
  mottledSpider: [
    { key: 'medicinalHerb', chance: 0.5, count: 1 },
    { key: 'poffNut', chance: 0.2, count: 1 },
  ],
  troglodyte: [
    { key: 'whirlwindScroll', chance: 0.06, count: 1 },
    { key: 'medicinalHerb', chance: 0.4, count: 1 },
  ],
  sandman: [
    { key: 'seedOfPsyche', chance: 0.3, count: 1 },
    { key: 'paralysisSalve', chance: 0.2, count: 1 },
    { key: 'sandmanWhiskers', chance: 0.25, count: 1 },
  ],
  pitViper: [
    { key: 'purifyingHerb', chance: 0.5, count: 1 },
    { key: 'antidote', chance: 0.3, count: 1 },
  ],
  scalyWarrior: [
    { key: 'woundSalve', chance: 0.35, count: 1 },
    { key: 'scarletPotion', chance: 0.15, count: 1 },
  ],
  skullSnail: [
    { key: 'poffNut', chance: 0.4, count: 1 },
    { key: 'seedOfLife', chance: 0.2, count: 1 },
  ],
  twinOgre: [
    { key: 'handGrenade', chance: 0.25, count: 1 },
    { key: 'woundSalve', chance: 0.3, count: 1 },
  ],
  warpWarrior: [
    { key: 'magicBlessing', chance: 0.35, count: 1 },
    { key: 'moveBlessing', chance: 0.25, count: 1 },
  ],
  veinBrain: [
    { key: 'seedOfMagic', chance: 0.35, count: 1 },
    { key: 'manaCrystal', chance: 0.2, count: 1 },
  ],
  starMirage: [
    { key: 'eyeDrops', chance: 0.45, count: 1 },
    { key: 'seedOfRunning', chance: 0.15, count: 1 },
  ],
  tarantula: [
    { key: 'purifyingHerb', chance: 0.4, count: 1 },
    { key: 'caterpillarSoup', chance: 0.2, count: 1 },
    { key: 'spiderweb', chance: 0.3, count: 1 },
  ],
  valmarFly: [
    { equipment: 'tio-platinum-feather', chance: 0.15, count: 1 },
    { key: 'scarletPotion', chance: 0.35, count: 1 },
  ],
  valmarYoung: [
    { key: 'yomisElixir', chance: 0.4, count: 1 },
    { key: 'meteorScroll', chance: 0.15, count: 1 },
  ],
  yeti: [
    { key: 'paralysisSalve', chance: 0.3, count: 1 },
    { key: 'seedOfMagic', chance: 0.25, count: 1 },
  ],
  valmarMagna: [
    { key: 'manaCrystal', chance: 0.4, count: 1 },
    { key: 'healingIncense', chance: 0.25, count: 1 },
  ],
  mindEater: [
    { key: 'manaCrystal', chance: 0.35, count: 1 },
    { key: 'panacea', chance: 0.2, count: 1 },
  ],

  dodo: [
    { key: 'medicinalHerb', chance: 0.5, count: 1 },
    { key: 'poffNut', chance: 0.25, count: 1 },
  ],
  bigFoot: [
    { key: 'lumirFlower', chance: 0.35, count: 1 },
    { key: 'woundSalve', chance: 0.2, count: 1 },
  ],
  chameleon: [
    { key: 'purifyingHerb', chance: 0.5, count: 1 },
    { key: 'antidote', chance: 0.25, count: 1 },
  ],
  dragonoid: [
    { key: 'firebomb', chance: 0.4, count: 1 },
    { key: 'seedOfLife', chance: 0.2, count: 1 },
  ],
  flameToad: [
    { key: 'firebomb', chance: 0.45, count: 1 },
    { key: 'seedOfPsyche', chance: 0.2, count: 1 },
  ],
  clayBird: [
    { key: 'magicBlessing', chance: 0.25, count: 1 },
    { key: 'scarletPotion', chance: 0.2, count: 1 },
  ],
  crimsonClaw: [
    { key: 'handGrenade', chance: 0.3, count: 1 },
    { key: 'woundSalve', chance: 0.3, count: 1 },
  ],
  desertDiver: [
    { key: 'mogayBomb', chance: 0.3, count: 1 },
    { key: 'paralysisSalve', chance: 0.3, count: 1 },
  ],
  brainBat: [
    { key: 'eyeDrops', chance: 0.4, count: 1 },
    { key: 'manaCrystal', chance: 0.2, count: 1 },
  ],
  dinoFreezer: [
    { key: 'paralysisSalve', chance: 0.35, count: 1 },
    { key: 'scarletPotion', chance: 0.25, count: 1 },
  ],
  venomousLarva: [
    { key: 'caterpillarSoup', chance: 0.3, count: 1 },
    { key: 'purifyingHerb', chance: 0.4, count: 1 },
  ],
  devil: [
    { key: 'manaCrystal', chance: 0.3, count: 1 },
    { key: 'scarletPotion', chance: 0.3, count: 1 },
    { key: 'demonAsh', chance: 0.25, count: 1 },
  ],
  snowLeopard: [
    { key: 'paralysisSalve', chance: 0.35, count: 1 },
    { key: 'seedOfMagic', chance: 0.3, count: 1 },
  ],
  emeraldBird: [
    { key: 'healingIncense', chance: 0.2, count: 1 },
    { key: 'seedOfRunning', chance: 0.3, count: 1 },
  ],
  ancientWarrior: [
    { key: 'scarletPotion', chance: 0.35, count: 1 },
    { key: 'meteorScroll', chance: 0.1, count: 1 },
  ],
  deathDoberman: [
    { key: 'yomisElixir', chance: 0.15, count: 1 },
    { key: 'handGrenade', chance: 0.3, count: 1 },
  ],
  eyeOfValmar: [
    { key: 'manaCrystal', chance: 0.5, count: 1 },
  ],
  crimsonTails: [
    { key: 'scarletPotion', chance: 0.5, count: 1 },
  ],
  nagaQueens: [
    { key: 'yomisElixir', chance: 0.5, count: 1 },
  ],
  eggGuardian: [
    { key: 'healingIncense', chance: 0.5, count: 1 },
  ],
  finalValmar: [
    { key: 'yomisElixir', chance: 1, count: 1 },
  ],
};


export function dropEntriesForPresetKey(presetKey) {
  return ENEMY_DROPS[presetKey] ?? [];
}
