import {
  DEFAULT_BALANCE_VECTOR,
  DEFAULT_VETERAN_WEIGHTS,
  buildBalanceReport,
  createNoviceController,
  createWeightedPlayerController,
  evaluatePlayerController,
  vectorToBalanceProfile,
} from './src/entities/balance.js';
import {
  DEFAULT_ARTIFACT_PATH,
  buildArtifactPayload,
  loadBalanceArtifact,
  saveBalanceArtifact,
} from './balance_artifact.js';

function args() {
  return new Set(process.argv.slice(2));
}

async function resolveActiveTuning() {
  const rawArtifact = await loadBalanceArtifact();
  const artifact = rawArtifact?.version === 2 ? rawArtifact : null;

  return {
    artifact,
    balanceVector: artifact?.balanceVector ?? DEFAULT_BALANCE_VECTOR,
    veteranWeights: artifact?.veteranWeights ?? DEFAULT_VETERAN_WEIGHTS,
  };
}

async function printSnapshot() {
  const { artifact, balanceVector, veteranWeights } = await resolveActiveTuning();
  const balance = vectorToBalanceProfile(balanceVector);
  const noviceController = createNoviceController();
  const veteranController = createWeightedPlayerController(veteranWeights);

  const novice = evaluatePlayerController({
    playerController: noviceController,
    balance,
    count: 300,
    seed: 1,
  });

  const veteran = evaluatePlayerController({
    playerController: veteranController,
    balance,
    count: 300,
    seed: 1,
  });

  console.log('BALANCE SNAPSHOT');
  console.log('Artifact path:', DEFAULT_ARTIFACT_PATH);
  console.log('Artifact loaded:', Boolean(artifact));
  console.log('Active balance vector:', balanceVector);
  console.log('Novice bot metrics:', novice);
  console.log('Veteran bot metrics:', veteran);
  console.log('Skill gap:', {
    winRateDelta: Number((veteran.playerWinRate - novice.playerWinRate).toFixed(3)),
    noviceWinPercent: Number((novice.playerWinRate * 100).toFixed(1)),
    veteranWinPercent: Number((veteran.playerWinRate * 100).toFixed(1)),
  });
}

async function printFullReport() {
  const report = buildBalanceReport({
    trainingGenerations: 6,
    trainingPopulation: 10,
    trainingSimulations: 30,
    tuningIterations: 12,
    tuningEvaluationCount: 30,
    finalEvaluationCount: 200,
  });

  console.log('FULL BALANCE REPORT');
  console.log('Baseline vector:', DEFAULT_BALANCE_VECTOR);
  console.log('Trained veteran weights:', report.finalVeteran.weights);
  console.log('Tuned vector candidate:', report.tunedBalance.vector);
  console.log('Final novice metrics:', report.noviceMetrics);
  console.log('Final veteran metrics:', report.veteranMetrics);
}

async function saveArtifactFromDefaults() {
  const balanceVector = DEFAULT_BALANCE_VECTOR;
  const veteranWeights = DEFAULT_VETERAN_WEIGHTS;
  const balance = vectorToBalanceProfile(balanceVector);
  const noviceMetrics = evaluatePlayerController({
    playerController: createNoviceController(),
    balance,
    count: 300,
    seed: 1,
  });
  const veteranMetrics = evaluatePlayerController({
    playerController: createWeightedPlayerController(veteranWeights),
    balance,
    count: 300,
    seed: 1,
  });

  const payload = buildArtifactPayload({
    source: 'current-defaults',
    veteranWeights,
    balanceVector,
    noviceMetrics,
    veteranMetrics,
  });

  await saveBalanceArtifact(payload);
  console.log('Saved artifact to', DEFAULT_ARTIFACT_PATH);
}

async function saveArtifactFromFullReport() {
  const report = buildBalanceReport({
    trainingGenerations: 6,
    trainingPopulation: 10,
    trainingSimulations: 30,
    tuningIterations: 12,
    tuningEvaluationCount: 30,
    finalEvaluationCount: 200,
  });

  const payload = buildArtifactPayload({
    source: 'full-ga-report',
    veteranWeights: report.finalVeteran.weights,
    trainedVeteranWeights: report.trainedVeteran.weights,
    balanceVector: report.tunedBalance.vector,
    tunedVector: report.tunedBalance.vector,
    noviceMetrics: report.noviceMetrics,
    veteranMetrics: report.veteranMetrics,
    notes: 'Generated from full GA training+tuning pass.',
  });

  await saveBalanceArtifact(payload);
  console.log('Saved full-report artifact to', DEFAULT_ARTIFACT_PATH);
}

const cliArgs = args();

if (cliArgs.has('--save-artifact')) {
  await saveArtifactFromDefaults();
} else if (cliArgs.has('--save-artifact-full')) {
  await saveArtifactFromFullReport();
} else if (cliArgs.has('--full')) {
  await printFullReport();
} else {
  await printSnapshot();
}
