
export interface Observation {
  steps: number,
  backtracks: number,
  branches: number,
  stack: number
}

export interface Stats {
			steps: number,
			backtracks: number,
			branches: number,
			stack: number,
			stepsSigma: number,
			backtracksSigma: number,
			branchesSigma: number,
			stackSigma: number,
			maxSteps: number,
			maxBacktracks: number,
			maxBranches: number,
			maxStack: number,
			minSteps: number,
			minBacktracks: number,
			minBranches: number,
			minStack: number
}

export function updateStats(sample:Stats, observation:Observation):Stats {
  const lag = 4;
  const obs = lag+1;
    return {
      steps: (lag*sample.steps + observation.steps) / obs,
      backtracks: (lag*sample.backtracks + observation.backtracks) / obs,
      branches: (lag*sample.branches + observation.branches) / obs,
      stack: (lag*sample.stack + observation.stack) / obs,
      stepsSigma: Math.sqrt((sample.steps - observation.steps) ** 2 + lag*(sample.stepsSigma ** 2)) / obs,
      backtracksSigma: Math.sqrt((sample.backtracks - observation.backtracks) ** 2 + lag*(sample.backtracksSigma ** 2)) / obs,
      branchesSigma: Math.sqrt((sample.branches - observation.branches) ** 2 + lag*(sample.branchesSigma ** 2)) / obs,
      stackSigma: Math.sqrt((sample.stack - observation.stack) ** 2 + lag*(sample.stackSigma ** 2)) / obs,
      maxSteps: Math.max(sample.maxSteps, observation.steps),
      maxBacktracks: Math.max(sample.maxBacktracks, observation.backtracks),
      maxBranches: Math.max(sample.maxBranches, observation.branches),
      maxStack: Math.max(sample.maxStack, observation.stack),
      minSteps: Math.min(sample.minSteps, observation.steps),
      minBacktracks: Math.min(sample.minBacktracks, observation.backtracks),
      minBranches: Math.min(sample.minBranches, observation.branches),
      minStack: Math.min(sample.minStack, observation.stack)
    };
}

export function statsFromObservation(observation:Observation):Stats {
    return {
      steps: observation.steps,
      backtracks: observation.backtracks,
      branches: observation.branches,
      stack: observation.stack,
      stepsSigma: observation.steps,
      backtracksSigma: observation.backtracks,
      branchesSigma: observation.branches,
      stackSigma: observation.stack,
      maxSteps: observation.steps,
      maxBacktracks: observation.backtracks,
      maxBranches: observation.branches,
      maxStack: observation.stack,
      minSteps: observation.steps,
      minBacktracks: observation.backtracks,
      minBranches: observation.branches,
      minStack: observation.stack
    };
}

export function blankStats() {
  return {
    steps: 0,
    backtracks: 0,
    branches: 0,
    stack: 0,
    stepsSigma: 0,
    backtracksSigma: 0,
    branchesSigma: 0,
    stackSigma: 0,
    maxSteps: 0,
    maxBacktracks: 0,
    maxBranches: 0,
    maxStack: 0,
    minSteps: 0,
    minBacktracks: 0,
    minBranches: 0,
    minStack: 0
  };
}
