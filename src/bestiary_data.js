export const BESTIARY_GROUPS = [
  {
    id: 'chapter1_roads',
    label: 'Chapter I — South Silesia roads and ruins',
    locations: ['Witt Forest', 'Carbo outskirts', 'Black Forest', 'Garmia Tower', 'Inor Mountains', 'Agear', 'Durham Cave', 'Baked Plains', 'Liligue Cave'],
    enemyKeys: ['mottledSpider', 'cragSnake', 'gargoyle', 'giantMantis', 'frostFrog', 'hammerhead', 'ghoul', 'sandman', 'durhamMinotaur', 'tongueValmar'],
    notes: 'Первый набор диких тварей, руинной живности и ранних valmar-corruption форм вокруг Карбо, Агира и Лилига.',
  },
  {
    id: 'chapter2_east',
    label: 'Chapter II — East Silesia, St. Heim, Cyrum',
    locations: ['Lumir Forest', 'Mirumu', 'Mysterious Fissure', 'Aira\'s Space', 'St. Heim Mountains', 'Pilgrim Road', 'Raul Hills', 'Cyrum', 'Underground Plant'],
    enemyKeys: ['hugeCaterpillar', 'giantCrab', 'hellHound', 'landCougar', 'gigaMantis', 'twinOgre', 'starMirage', 'skullSnail', 'warpWarrior', 'veinBrain', 'guardian', 'clawsValmar', 'cathedralExecutioner'],
    notes: 'Среднеигровой bestiary: снежный лес, церковные горы, царские руины и техно-стражи Цайрума.',
  },
  {
    id: 'chapter3_hunt',
    label: 'Chapter III — Garlan, Nanan, Great Rift, Demons Law',
    locations: ['Ceceile Reef', 'Garlan Village', 'Grail Mountain', 'Ghoss Forest', 'Nanan Village', 'Great Rift', 'Valmar\'s Body', 'Demon\'s Law'],
    enemyKeys: ['fennyBird', 'manEatingTree', 'salamadile', 'scalyWarrior', 'pitViper', 'tarantula', 'melficeEcho', 'granasaberWarden', 'valmarMoth', 'immuneCell'],
    notes: 'Маршрут к Гранасаберу получает более узнаваемый набор рифовых, лесных, рифтовых и древнемеханических противников.',
  },
  {
    id: 'chapter4_endgame',
    label: 'Chapter IV — Moon, Birthplace, New Valmar',
    locations: ['Valmar\'s Moon', 'Cyrum South', 'Birthplace of the Gods', 'New Valmar'],
    enemyKeys: ['nyarmot', 'evilManeuver', 'dragonKnight', 'valmarMagna', 'killerTree', 'mindEater', 'valmarFly', 'valmarYoung', 'yeti', 'moonWombSentinel', 'innerShadowRyudo', 'valmarCoreHerald'],
    notes: 'Позднеигровой bestiary с лунными формами, древними военными сущностями и внутренностями Нового Вальмара.',
  },
  {
    id: 'major_valmar_parts',
    label: 'Major Valmar parts and apex bosses',
    locations: ['Liligue ruins', 'Cyrum plant', 'St. Heim', 'Moon', 'New Valmar core'],
    enemyKeys: ['garmiaRuinCore', 'milleniaShade', 'clawsValmar', 'heartValmar', 'zeraAvatar', 'tongueValmar', 'valmarCoreHerald'],
    notes: 'Сюжетно-критичные corruption bosses и поздние ложные формы, которые держат главные драматические развязки.',
  },
];

export function buildBestiaryGroupSnapshot(presets) {
  return BESTIARY_GROUPS.map((group) => ({
    ...group,
    resolvedEnemies: group.enemyKeys
      .map((key) => ({ key, preset: presets[key] ?? null }))
      .filter((entry) => entry.preset),
    missingKeys: group.enemyKeys.filter((key) => !presets[key]),
  }));
}
