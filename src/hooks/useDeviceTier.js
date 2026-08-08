import { useMemo } from 'react';

/**
 * useDeviceTier
 * -------------
 * Cheap heuristic to classify the device so we can gracefully simplify
 * the scene (fewer particles, no bloom, lower DPR) rather than forcing a
 * full cinematic render onto weak hardware.
 */
export function useDeviceTier() {
  return useMemo(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const isLow = cores <= 4 || mem <= 4 || isCoarsePointer;

    return {
      tier: isLow ? 'low' : 'high',
      dpr: isLow ? [1, 1.25] : [1, 2],
      particleCount: isLow ? 40 : 90, // per-room particle budget
      enableBloom: !isLow,
      prefersReducedMotion,
    };
  }, []);
}
