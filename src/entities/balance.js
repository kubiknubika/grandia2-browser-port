import {
  DEFAULT_BALANCE_PROFILE,
  analyzeActionChoice,
  getAvailableActions,
  simulateBattle,
} from './combat.js';

export const WEIGHT_KEYS = [
  'bias',
  'damage',
  'kill',
  'interrupt',
  'threatControl',
  'healBurst',
  'healNeed',
  'safety',
  'lineBreak',
  'distanceGain',
  'statusPressure',
  'resourceCost',
  'comboBias',
  'criticalBias',
  'cancelBias',
  'healBias',
  'endureBias',
  'evadeBias',
  'statusBias',
  'offensiveMagicBias',
];

export const DEFAULT_VETERAN_WEIGHTS = {
  bias: 2.2244121623458337,
  damage: -1.1267172089777886,
  kill: 1.6822320143459364,
  interrupt: -0.696936135739088,
  threatControl: 2.1371295796707273,
  healBurst: -1.6601499882061035,
  healNeed: -1.81598560110142,
  safety: -2.6949225348886103,
  lineBreak: -1.0087182943243533,
  distanceGain: -0.0625899251550438,
  statusPressure: 0.11398325755726557,
  resourceCost: 0.5983828464290128,
  comboBias: 2.1197992327390236,
  criticalBias: -1.722146137827076,
  cancelBias: 1.6485969530767761,
  healBias: 2.4077527734916657,
  endureBias: -1.3332339456537738,
  evadeBias: 0.9916098944842817,
  statusBias: 0.9737972807837652,
  offensiveMagicBias: 0.04837776070926336,
};

export const DEFAULT_BALANCE_VECTOR = {
  enemyHp: 1.1555,
  enemyStr: 1.238,
  enemyVit: 1.082,
  enemyAgi: 1.102,
  enemySpd: 1.058,
  healPowerBase: 34,
  healCostMp: 13,
  wingPower: 0.9428,
  wingIpDamage: 110,
  wingCostSp: 17,
  tenseikenPower: 1.1138,
  tenseikenIpDamage: 231,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nextBetween(rng, min, max) {
  return min + (max - min) * rng();
}

export function createSeededRng(seed = 1) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeeds(seed, count) {
  const rng = createSeededRng(seed);
  return Array.from({ length: count }, () => Math.floor(rng() * 0xffffffff));
}

function cloneWeights(weights) {
  return Object.fromEntries(WEIGHT_KEYS.map((key) => [key, weights[key] ?? 0]));
}

function randomWeights(rng) {
  return Object.fromEntries(WEIGHT_KEYS.map((key) => [key, nextBetween(rng, -2.4, 2.4)]));
}

function crossoverWeights(left, right, rng) {
  const child = {};
  for (const key of WEIGHT_KEYS) {
    child[key] = rng() < 0.5 ? left[key] : right[key];
    if (rng() < 0.2) {
      child[key] = (left[key] + right[key]) / 2;
    }
  }
  return child;
}

function mutateWeights(weights, rng, rate = 0.35, amount = 0.65) {
  const mutated = cloneWeights(weights);
  for (const key of WEIGHT_KEYS) {
    if (rng() < rate) {
      mutated[key] += nextBetween(rng, -amount, amount);
    }
  }
  return mutated;
}

function serializeWeights(weights) {
  return WEIGHT_KEYS.map((key) => weights[key].toFixed(3)).join('|');
}

function scoreWeightedAction(meta, weights) {
  return (
    (weights.bias ?? 0)
    + (weights.damage ?? 0) * meta.expectedDamageRatio
    + (weights.kill ?? 0) * meta.killScore
    + (weights.interrupt ?? 0) * meta.cancelWindow * (meta.isCritical + meta.isCancelMove)
    + (weights.threatControl ?? 0) * meta.targetThreat * (meta.isCritical + meta.isCancelMove)
    + (weights.healBurst ?? 0) * (meta.healAmount / 90)
    + (weights.healNeed ?? 0) * meta.healNeed * (0.5 + meta.allyEmergency) * meta.isHeal
    + (weights.safety ?? 0) * meta.safetyScore * meta.selfDanger
    + (weights.lineBreak ?? 0) * meta.lineBreakScore * meta.isEvade
    + (weights.distanceGain ?? 0) * meta.distanceGain * meta.isEvade
    + (weights.statusPressure ?? 0) * meta.statusPressure
    + (weights.resourceCost ?? 0) * meta.resourceCost
    + (weights.comboBias ?? 0) * meta.isCombo
    + (weights.criticalBias ?? 0) * meta.isCritical
    + (weights.cancelBias ?? 0) * meta.isCancelMove
    + (weights.healBias ?? 0) * meta.isHeal
    + (weights.endureBias ?? 0) * meta.isEndure
    + (weights.evadeBias ?? 0) * meta.isEvade
    + (weights.statusBias ?? 0) * meta.isStatusMove
    + (weights.offensiveMagicBias ?? 0) * meta.isOffensiveMagic
  );
}

export function createNoviceController() {
  const controller = ({ actions, analyzeAction, fighter, battle }) => {
    const analyzed = actions.map((action) => ({ action, meta: analyzeAction(action) }));
    const roll = typeof battle?.rng === 'function' ? battle.rng() : Math.random();
    const smartChance = 0.35;
    const actingSmart = roll < smartChance;

    const heal = analyzed
      .filter((entry) => entry.action.id === 'heal')
      .sort((left, right) => right.meta.healNeed - left.meta.healNeed)[0];

    if (heal && heal.meta.healNeed >= (actingSmart ? 0.78 : 0.92)) {
      return heal.action;
    }

    const cancel = analyzed
      .filter((entry) => ['critical', 'tenseiken', 'impactBomb'].includes(entry.action.id))
      .filter((entry) => entry.meta.cancelWindow >= (actingSmart ? 0.74 : 0.92))
      .sort((left, right) => right.meta.cancelWindow - left.meta.cancelWindow)[0];

    if (cancel && actingSmart) {
      return cancel.action;
    }

    const status = analyzed
      .filter((entry) => entry.action.id === 'nightmareBall' && entry.meta.statusPressure > 1)
      .sort((left, right) => right.meta.statusPressure - left.meta.statusPressure)[0];

    if (status && roll < smartChance * 0.35) {
      return status.action;
    }

    if (fighter.hp / fighter.maxHp <= (actingSmart ? 0.16 : 0.08)) {
      return analyzed.find((entry) => entry.action.id === 'endure')?.action ?? actions[0];
    }

    const combos = analyzed
      .filter((entry) => entry.action.id === 'combo')
      .sort((left, right) => right.meta.killScore - left.meta.killScore);

    if (combos[0] && (roll < 0.92 || combos.length === 1)) {
      return combos[0].action;
    }

    return actions[0];
  };

  controller.debugLabel = 'novice-ai';
  return controller;
}

export function createWeightedPlayerController(weights) {
  const normalized = cloneWeights(weights);

  const controller = ({ actions, analyzeAction }) => {
    const ranked = actions
      .map((action) => {
        const meta = analyzeAction(action);
        return {
          action,
          meta,
          score: scoreWeightedAction(meta, normalized),
        };
      })
      .sort((left, right) => right.score - left.score || right.meta.killScore - left.meta.killScore);

    return ranked[0]?.action ?? actions[0] ?? null;
  };

  controller.debugLabel = 'veteran-ai';
  return controller;
}

export function vectorToBalanceProfile(vector) {
  return {
    playerScale: { ...DEFAULT_BALANCE_PROFILE.playerScale },
    enemyScale: {
      hp: vector.enemyHp,
      str: vector.enemyStr,
      vit: vector.enemyVit,
      agi: vector.enemyAgi,
      spd: vector.enemySpd,
      mag: 1,
      men: 1,
    },
    actionOverrides: {
      heal: {
        powerBase: vector.healPowerBase,
        costMp: vector.healCostMp,
      },
      wingSlice: {
        power: vector.wingPower,
        ipDamage: vector.wingIpDamage,
        costSp: vector.wingCostSp,
      },
      tenseiken: {
        power: vector.tenseikenPower,
        ipDamage: vector.tenseikenIpDamage,
      },
    },
  };
}

function cloneVector(vector) {
  return { ...vector };
}

function mutateVector(vector, rng) {
  const next = cloneVector(vector);
  next.enemyHp = clamp(next.enemyHp + nextBetween(rng, -0.08, 0.08), 0.95, 1.55);
  next.enemyStr = clamp(next.enemyStr + nextBetween(rng, -0.08, 0.08), 0.95, 1.5);
  next.enemyVit = clamp(next.enemyVit + nextBetween(rng, -0.06, 0.06), 0.9, 1.35);
  next.enemyAgi = clamp(next.enemyAgi + nextBetween(rng, -0.05, 0.05), 0.95, 1.25);
  next.enemySpd = clamp(next.enemySpd + nextBetween(rng, -0.05, 0.05), 0.95, 1.25);
  next.healPowerBase = Math.round(clamp(next.healPowerBase + nextBetween(rng, -4, 4), 26, 42));
  next.healCostMp = Math.round(clamp(next.healCostMp + nextBetween(rng, -1.5, 1.5), 10, 16));
  next.wingPower = clamp(next.wingPower + nextBetween(rng, -0.08, 0.08), 0.7, 1.15);
  next.wingIpDamage = Math.round(clamp(next.wingIpDamage + nextBetween(rng, -14, 14), 80, 170));
  next.wingCostSp = Math.round(clamp(next.wingCostSp + nextBetween(rng, -2, 2), 12, 24));
  next.tenseikenPower = clamp(next.tenseikenPower + nextBetween(rng, -0.08, 0.08), 1.0, 1.35);
  next.tenseikenIpDamage = Math.round(clamp(next.tenseikenIpDamage + nextBetween(rng, -20, 20), 180, 320));
  return next;
}

function vectorKey(vector) {
  return JSON.stringify(vector);
}

export function evaluatePlayerController({
  playerController,
  enemyController,
  balance = DEFAULT_BALANCE_PROFILE,
  count = 200,
  seed = 12345,
  seeds,
  players,
  enemies,
} = {}) {
  const runSeeds = seeds ?? generateSeeds(seed, count);
  let playerWins = 0;
  let enemyWins = 0;
  let draws = 0;
  let totalTurns = 0;

  for (const runSeed of runSeeds) {
    const rng = createSeededRng(runSeed);
    const result = simulateBattle({
      controllers: {
        players: playerController,
        ...(enemyController ? { enemies: enemyController } : {}),
      },
      balance,
      rng,
      players,
      enemies,
      introLog: '',
    });

    totalTurns += result.turns;

    if (result.winner === 'players') {
      playerWins += 1;
    } else if (result.winner === 'enemies') {
      enemyWins += 1;
    } else {
      draws += 1;
    }
  }

  const countSafe = runSeeds.length || 1;
  return {
    count: runSeeds.length,
    playerWins,
    enemyWins,
    draws,
    playerWinRate: playerWins / countSafe,
    averageTurns: totalTurns / countSafe,
  };
}

function veteranFitness(metrics) {
  return metrics.playerWinRate * 100 - metrics.averageTurns * 0.12;
}

export function trainVeteranBot({
  balance = vectorToBalanceProfile(DEFAULT_BALANCE_VECTOR),
  generations = 10,
  populationSize = 14,
  simulationsPerCandidate = 50,
  seed = 1337,
  initialWeights = DEFAULT_VETERAN_WEIGHTS,
  enemyController,
  players,
  enemies,
} = {}) {
  const rng = createSeededRng(seed);
  const seeds = generateSeeds(seed + 101, simulationsPerCandidate);
  const cache = new Map();

  function evaluate(weights) {
    const key = serializeWeights(weights);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const controller = createWeightedPlayerController(weights);
    const metrics = evaluatePlayerController({
      playerController: controller,
      enemyController,
      balance,
      seeds,
      players,
      enemies,
    });

    const payload = {
      weights: cloneWeights(weights),
      metrics,
      fitness: veteranFitness(metrics),
    };
    cache.set(key, payload);
    return payload;
  }

  let population = [cloneWeights(initialWeights)];
  while (population.length < populationSize) {
    if (population.length < Math.ceil(populationSize / 3)) {
      population.push(mutateWeights(initialWeights, rng, 0.55, 0.8));
    } else {
      population.push(randomWeights(rng));
    }
  }

  let best = evaluate(population[0]);

  for (let generation = 0; generation < generations; generation += 1) {
    const ranked = population
      .map((weights) => evaluate(weights))
      .sort((left, right) => right.fitness - left.fitness);

    if (ranked[0].fitness > best.fitness) {
      best = ranked[0];
    }

    const survivors = ranked.slice(0, Math.max(3, Math.floor(populationSize / 3)));
    population = survivors.map((entry) => cloneWeights(entry.weights));

    while (population.length < populationSize) {
      const parentA = survivors[Math.floor(rng() * survivors.length)].weights;
      const parentB = survivors[Math.floor(rng() * survivors.length)].weights;
      const child = mutateWeights(crossoverWeights(parentA, parentB, rng), rng, 0.45, 0.65);
      population.push(child);
    }
  }

  const finalBest = population
    .map((weights) => evaluate(weights))
    .sort((left, right) => right.fitness - left.fitness)[0];

  return finalBest.fitness > best.fitness ? finalBest : best;
}

function balanceScore(noviceMetrics, veteranMetrics) {
  const novice = noviceMetrics.playerWinRate;
  const veteran = veteranMetrics.playerWinRate;
  const gap = veteran - novice;

  let score = 100;
  score -= Math.abs(novice - 0.6) * 120;
  score -= Math.abs(veteran - 0.93) * 90;
  score -= Math.abs(noviceMetrics.averageTurns - veteranMetrics.averageTurns) * 0.03;

  if (novice < 0.52) {
    score -= (0.52 - novice) * 260;
  }

  if (novice > 0.82) {
    score -= (novice - 0.82) * 220;
  }

  if (veteran < 0.88) {
    score -= (0.88 - veteran) * 260;
  }

  if (gap < 0.22) {
    score -= (0.22 - gap) * 280;
  }

  return score;
}

export function tuneBalance({
  veteranWeights = DEFAULT_VETERAN_WEIGHTS,
  initialVector = DEFAULT_BALANCE_VECTOR,
  iterations = 26,
  evaluationCount = 60,
  seed = 404,
  enemyController,
  players,
  enemies,
} = {}) {
  const rng = createSeededRng(seed);
  const seeds = generateSeeds(seed + 77, evaluationCount);
  const cache = new Map();
  const noviceController = createNoviceController();
  const veteranController = createWeightedPlayerController(veteranWeights);

  function evaluateVector(vector) {
    const key = vectorKey(vector);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const balance = vectorToBalanceProfile(vector);
    const noviceMetrics = evaluatePlayerController({
      playerController: noviceController,
      enemyController,
      balance,
      seeds,
      players,
      enemies,
    });
    const veteranMetrics = evaluatePlayerController({
      playerController: veteranController,
      enemyController,
      balance,
      seeds,
      players,
      enemies,
    });

    const payload = {
      vector: cloneVector(vector),
      balance,
      noviceMetrics,
      veteranMetrics,
      score: balanceScore(noviceMetrics, veteranMetrics),
    };

    cache.set(key, payload);
    return payload;
  }

  let best = evaluateVector(initialVector);
  let pool = [best];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const candidates = [best.vector];
    while (candidates.length < 8) {
      const source = pool[Math.floor(rng() * pool.length)]?.vector ?? best.vector;
      candidates.push(mutateVector(source, rng));
    }

    const ranked = candidates
      .map((vector) => evaluateVector(vector))
      .sort((left, right) => right.score - left.score);

    if (ranked[0].score > best.score) {
      best = ranked[0];
    }

    pool = [...pool, ...ranked].sort((left, right) => right.score - left.score).slice(0, 4);
  }

  return best;
}

export function buildBalanceReport({
  trainSeed = 1337,
  tuneSeed = 404,
  trainingGenerations = 10,
  trainingPopulation = 14,
  trainingSimulations = 50,
  tuningIterations = 26,
  tuningEvaluationCount = 60,
  finalEvaluationCount = 300,
} = {}) {
  const noviceController = createNoviceController();
  const baselineBalance = vectorToBalanceProfile(DEFAULT_BALANCE_VECTOR);

  const trainedVeteran = trainVeteranBot({
    balance: baselineBalance,
    generations: trainingGenerations,
    populationSize: trainingPopulation,
    simulationsPerCandidate: trainingSimulations,
    seed: trainSeed,
  });

  const tunedBalance = tuneBalance({
    veteranWeights: trainedVeteran.weights,
    initialVector: DEFAULT_BALANCE_VECTOR,
    iterations: tuningIterations,
    evaluationCount: tuningEvaluationCount,
    seed: tuneSeed,
  });

  const finalVeteran = trainVeteranBot({
    balance: tunedBalance.balance,
    generations: Math.max(4, Math.floor(trainingGenerations / 2)),
    populationSize: trainingPopulation,
    simulationsPerCandidate: trainingSimulations,
    seed: trainSeed + 1,
    initialWeights: trainedVeteran.weights,
  });

  const finalSeeds = generateSeeds(9001, finalEvaluationCount);
  const noviceMetrics = evaluatePlayerController({
    playerController: noviceController,
    balance: tunedBalance.balance,
    seeds: finalSeeds,
  });
  const veteranMetrics = evaluatePlayerController({
    playerController: createWeightedPlayerController(finalVeteran.weights),
    balance: tunedBalance.balance,
    seeds: finalSeeds,
  });

  return {
    baselineBalance,
    tunedBalance,
    trainedVeteran,
    finalVeteran,
    noviceMetrics,
    veteranMetrics,
  };
}
