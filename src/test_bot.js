import {
  DEFAULT_BALANCE_VECTOR,
  DEFAULT_VETERAN_WEIGHTS,
  createNoviceController,
  createWeightedPlayerController,
  evaluatePlayerController,
  vectorToBalanceProfile,
} from './entities/balance.js';

const balance = vectorToBalanceProfile(DEFAULT_BALANCE_VECTOR);

const novice = evaluatePlayerController({
  playerController: createNoviceController(),
  balance,
  count: 120,
  seed: 7,
});

const veteran = evaluatePlayerController({
  playerController: createWeightedPlayerController(DEFAULT_VETERAN_WEIGHTS),
  balance,
  count: 120,
  seed: 7,
});

console.log('Quick balance test:');
console.log({
  novice,
  veteran,
  gap: veteran.playerWinRate - novice.playerWinRate,
  tunedBalanceVector: DEFAULT_BALANCE_VECTOR,
});
