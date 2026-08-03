import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_ARTIFACT_PATH = path.resolve('artifacts/ga_weights.json');

export async function loadBalanceArtifact(filePath = DEFAULT_ARTIFACT_PATH) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function saveBalanceArtifact(payload, filePath = DEFAULT_ARTIFACT_PATH) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

export function buildArtifactPayload({
  source = 'manual-snapshot',
  veteranWeights,
  balanceVector,
  noviceMetrics,
  veteranMetrics,
  trainedVeteranWeights = veteranWeights,
  tunedVector = balanceVector,
  notes = 'Saved GA/veteran weights and tuned balance vector for reuse in CLI tools.',
} = {}) {
  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    source,
    notes,
    veteranWeights,
    trainedVeteranWeights,
    balanceVector,
    tunedVector,
    noviceMetrics,
    veteranMetrics,
  };
}

export { DEFAULT_ARTIFACT_PATH };
