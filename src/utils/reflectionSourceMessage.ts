import type { FutureSelfReflectionResult } from '../types/reflection';

export function getReflectionSourceMessage(result: FutureSelfReflectionResult): string {
  if (result.source === 'remote') {
    return 'Generated with Future Self AI.';
  }

  if (result.usedFallback) {
    return 'The AI was unavailable, so this was generated privately on your device.';
  }

  return 'Generated privately on this device.';
}
