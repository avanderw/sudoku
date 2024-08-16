import type { Stats } from "./stats";

export function score(stats:Stats): number {
  if (!stats) {
    return 0;
  }

  if (!stats.minSteps) {
    return 0;
  }

  // Assumptions:
  // - Steps increases difficulty
  // - Branching increases difficulty
  // - Backtracking increases difficulty
  // - High stack means less space explored, means easier
  
  const sudokuLength = Math.max(stats.minSteps, stats.steps - stats.stepsSigma);
  return sudokuLength;
}