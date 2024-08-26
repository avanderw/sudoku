<script lang="ts">
	import { gridstore } from '$lib/datastore';
	import { solveStep } from '$lib/sudoku';
	import Board from './Board.svelte';

	const anchorBoard = Array.from({ length: 81 }, (_, i) => 0);

	let stepTime: number = 25;
	let steps = 0;
	let backtracks = 0;
	let branches = 0;
	let currentBoard = anchorBoard.slice();
	let solved = false;
	let stack: number[][] = [];
	let stopSignal = false;
	let batchSize = 100;

	const reset = () => {
		currentBoard = anchorBoard.slice();
		solved = false;
		stack = [];
		steps = 0;
		backtracks = 0;
		branches = 0;
		stopSignal = true;
	};

	const solve = () => {
		if (stopSignal) {
			stopSignal = false;
			return;
		}
		if (solved) return;

		step();

		if (stepTime > 0) {
			setTimeout(solve, stepTime);
		} else {
			solve();
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
			addGrid();
		}
	};

	function batch() {
		const origStepTime = stepTime;
		stepTime = 0;
		for (let i = 0; i < batchSize; i++) {
			solve();
			addGrid();
			reset();
			stopSignal = false;
		}
		stepTime = origStepTime;
	}

	function addGrid() {
		const found = $gridstore.find((grid: number[]) => grid.join('') === currentBoard.join(''));
		if (!found) $gridstore = [...$gridstore, currentBoard];
	}
</script>

<table>
	<tr>
		<td valign="top">
			<h2>Grid Generator</h2>
			<p>
				Start with an empty board and use the solver until it is valid. The grid is valid if there
				are no duplicate values in any row, column, or 3x3 square. We backtrack if we reach a point
				where we cannot place a value without violating the rules.
			</p>
			<div>
				<button on:click={() => (stopSignal = false)} on:click={solve} disabled={solved}
					>Solve</button
				>
				<button on:click={() => (stopSignal = true)} disabled={solved}>Stop</button>
				<button on:click={reset}>Reset</button>
				<button on:click={step} disabled={solved}>Step</button>
				<button on:click={() => (stopSignal = false)} on:click={batch}>Batch</button>
			</div>

			<table style="text-align:right;">
				<tr>
					<td>
						<label for="seed">Seed</label>
					</td>
					<td>
						<input id="seed" type="number" disabled title="Not implemented yet!" />
					</td>
				</tr>
				<tr>
					<td>
						<label for="step-time">Time per step (ms)</label>
					</td>
					<td>
						<input id="step-time" type="number" bind:value={stepTime} />
					</td>
				</tr>
				<tr>
					<td> <label for="batch-size">Batch size</label></td>
					<td> <input id="batch-size" type="number" bind:value={batchSize} /></td>
				</tr>
				<tr>
					<td>Grids in cache</td>
					<td>{$gridstore.length.toLocaleString()}</td>
				</tr>
			</table>
		</td>
		<td style="width:338px">
			<Board board={currentBoard} />
		</td>
	</tr>
</table>

<style>
	div {
		margin: 1rem 0;
	}
	button {
		padding: 0.25rem 0.5rem;
		border: none;
		color: var(--neutral-5);
		font-weight: bold;
		font-family: inherit;
		background-color: var(--primary-4);
		text-decoration: none;
		cursor: pointer;
		font-size: smaller;
	}
	button:hover {
		background-color: var(--secondary-4);
	}
	button:disabled {
		color: var(--neutral-1);
		background-color: var(--neutral-4);
		cursor: auto;
	}
	input {
		width: 50px;
	}
</style>
