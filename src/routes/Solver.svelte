<script lang="ts">
	import { puzzlestore, statsstore } from '$lib/datastore';
	import { blankStats, statsFromObservation, updateStats, type Stats } from '$lib/stats';
	import { maskFromIncompleteGrid, puzzleFromGrid, solveStep, blondePuzzle } from '$lib/sudoku';
	import Board from './Board.svelte';

	const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
	const df = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
	const fallbackPuzzle = [
		0, 1, 5, 0, 0, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 4, 0, 5, 0, 0, 0, 0, 0, 9, 2, 0, 0, 7, 2, 0, 0, 0,
		0, 9, 3, 1, 0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 6, 3, 0, 0, 0, 0, 0, 4, 4, 0, 0, 5, 0, 0, 0, 0, 2, 0,
		3, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0
	];

	if ($puzzlestore.length === 0) {
		$puzzlestore = [fallbackPuzzle, blondePuzzle];
	}

	let puzzle: number[];
	let puzzleMask: number[];
	let stepTime: number = 25;
	let steps: number;
	let backtracks: number;
	let branches: number;
	let currentBoard: number[];
	let solved: boolean;
	let stack: number[][];
	let stopSignal: boolean;
	let stats: Stats;

	const random = () => {
		puzzle =
			$puzzlestore.length > 0
				? $puzzlestore[Math.floor(Math.random() * $puzzlestore.length)].slice()
				: fallbackPuzzle.slice();
		puzzleMask = maskFromIncompleteGrid(puzzle);
		currentBoard = puzzleFromGrid(puzzle, puzzleMask);

		solved = false;
		stack = [];
		steps = 0;
		backtracks = 0;
		branches = 0;
		stopSignal = true;
		stats = $statsstore[puzzle.join('')] || blankStats();
		if (!stats.minSteps) {
			stats = blankStats();
		}
	};

	const reset = () => {
		currentBoard = puzzleFromGrid(puzzle, puzzleMask);

		solved = false;
		stack = [];
		steps = 0;
		backtracks = 0;
		branches = 0;
		stopSignal = true;
		stats = $statsstore[puzzle.join('')] || blankStats();
	};

	random();

	let batch = 0;
	const solve = () => {
		if (stopSignal) {
			stopSignal = false;
			return;
		}
		if (solved) return;

		step();

		if (stepTime > 0) {
			setTimeout(solve, stepTime);
		} else if (batch < 5000) {
			batch++;
			solve();
		} else {
			batch = 0;
			setTimeout(solve, stepTime);
		}
	};

	const step = () => {
		if (solved) return;

		const origStackLength = stack.length;
		const state = solveStep(currentBoard, stack);

		solved = state.solved;
		if (!solved) {
			steps++;
			if (stack.length < origStackLength) {
				backtracks++;
			}
			if (stack.length > origStackLength) {
				branches++;
			}
		}

		currentBoard = state.board!;
		stack = stack;

		if (solved) {
			const obs = { steps, backtracks, branches, stack: stack.length };
			const key = puzzle.join('');
			if (!$statsstore[key]) {
				$statsstore[key] = statsFromObservation(obs);
			}

			$statsstore = { ...$statsstore, [key]: updateStats($statsstore[key], obs) };
			stats = $statsstore[key];
		}
	};
</script>

<table>
	<tr>
		<td valign="top">
			<h2>Solver</h2>
			<p>
				"Wave function collapse" is a heuristic we can use to find empty spots to fill. The best
				empty spot is the one with the fewest possible values. Selecting this space will split the
				search space the most evenly. Back tracking will then search the potential space faster.
				Inherently it will not select new values that are invalid.
			</p>
			<div>
				<button on:click={() => (stopSignal = false)} on:click={solve} disabled={solved}>
					Solve
				</button>
				<button on:click={() => (stopSignal = true)} disabled={solved}>Stop</button>
				<button on:click={reset}>Reset</button>
				<button on:click={random}>Random</button>
				<button on:click={step} disabled={solved}>Step</button>
			</div>

			<table>
				<tr>
					<td>
						<label for="seed">Seed</label>
					</td>
					<td style="text-align:left" colspan="8">
						<input id="seed" type="number" disabled title="Not implemented yet!" />
					</td>
				</tr>
				<tr>
					<td>
						<label for="step-time">Time per step (ms)</label>
					</td>
					<td style="text-align:left" colspan="8">
						<input id="step-time" type="number" bind:value={stepTime} />
					</td>
				</tr>
				<tr>
					<td>Solved:</td>
					<td style="text-align:left" colspan="8">{solved ? 'Yes' : 'No'}</td>
				</tr>
				<tr>
					<td>Steps:</td>
					<th>{steps}</th>
					<td>({nf.format(stats.minSteps)}</td>
					<td>≤</td>
					<th>{nf.format(stats.steps)}</th>
					<td>⁺∕₋</td>
					<td>{nf.format(stats.stepsSigma)}</td>
					<td>≤</td>
					<td>{nf.format(stats.maxSteps)})</td>
				</tr>
				<tr>
					<td>Backtracked:</td>
					<th>{backtracks}</th>
					<td>({df.format(stats.minBacktracks)}</td>
					<td>≤</td>
					<th>{df.format(stats.backtracks)}</th>
					<td>⁺∕₋</td>
					<td>{df.format(stats.backtracksSigma)}</td>
					<td>≤</td>
					<td>{df.format(stats.maxBacktracks)})</td>
				</tr>
				<tr>
					<td>Branched:</td>
					<th>{branches}</th>
					<td>({df.format(stats.minBranches)}</td>
					<td>≤</td>
					<th>{df.format(stats.branches)}</th>
					<td>⁺∕₋</td>
					<td>{df.format(stats.branchesSigma)}</td>
					<td>≤</td>
					<td>{df.format(stats.maxBranches)})</td>
				</tr>
				<tr>
					<td>Stack size:</td>
					<th>{stack.length}</th>
					<td>({df.format(stats.minStack)}</td>
					<td>≤</td>
					<th>{df.format(stats.stack)}</th>
					<td>⁺∕₋</td>
					<td>{df.format(stats.stackSigma)}</td>
					<td>≤</td>
					<td>{df.format(stats.maxStack)})</td>
				</tr>
			</table>
		</td>
		<td style="width:338px">
			<Board bind:board={currentBoard} {puzzleMask} />
		</td>
	</tr>
</table>

<style>
	div {
		margin: 1rem 0;
	}
	button {
		padding: 0.25rem 0.5rem;
		border: 1px solid black;
		color: white;
		background-color: #04aa6d;
		cursor: pointer;
	}
	button:hover {
		background-color: #026b45;
	}
	button:disabled {
		color: black;
		background-color: lightgray;
	}
	input {
		width: 50px;
	}
	table table td, table table th {
		text-align: center;
	}
	table table > tr > td {
		text-align: right;
	}
</style>
