<script lang="ts">
	import { maskFromIncompleteGrid, solve } from '$lib/sudoku';
	import { puzzlestore, statsstore } from '$lib/datastore';
	import { updateStats, blankStats, statsFromObservation } from '$lib/stats';
	import { score } from '$lib/grade';
	import Board from './Board.svelte';

  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

	function rating(puzzle: number[]): number {
		const key = puzzle.join('');
		const stats = $statsstore[key];
		return stats ? score(stats) : 0;
	}

	function stats(puzzle: number[]) {
		const s = $statsstore[puzzle.join('')] || blankStats();
		if (!s.minSteps) {
			return blankStats();
		}
		return s;
	}

  let lastGradeTime = 0;
	function gradeBoard() {
		if (process.length === 0) {
			return;
		}

		const puzzle = process.pop()!;
		process = process;

    let time = performance.now();
		for (let i = 0; i < observations; i++) {
      if (performance.now() - time > 4096) {
        break;
      }
			const stats = solve(puzzle);

			const key = puzzle.join('');
			if (!$statsstore[key]) {
				$statsstore[key] = statsFromObservation(stats);
			}

			$statsstore = { ...$statsstore, [key]: updateStats($statsstore[key], stats) };
		}
    lastGradeTime = performance.now() - time;

		if (process.length > 0) {
			setTimeout(() => {
				gradeBoard();
			}, 0);
		}

		$puzzlestore = $puzzlestore;
	}

	let process: number[][] = [];
	let observations = 50;
	let selectedBoard: number[] = [];
	$: top5 = $puzzlestore
		.slice()
		.sort((a: number[], b: number[]) => rating(b) - rating(a))
		.slice(0, 5);
	$: bottom5 = $puzzlestore
		.slice()
		.sort((a: number[], b: number[]) => rating(a) - rating(b))
		.slice(0, 5);
</script>

<table>
	<tr>
		<td valign="top">
			<h2>Difficulty Grader</h2>

			<p>
				The difficulty of the puzzle can likely be determined as a function of steps, backtracks and
				branches. The obvious metric is to use the number of steps, but the number of backtracks and
				branches may also be useful. For now the number of steps will be used, but the other metrics
				will be stored for future use.
			</p>

			<div>
				<button
					on:click={() => {
						process.push(selectedBoard);
						gradeBoard();
					}}
					disabled={selectedBoard.length === 0}>Grade puzzle</button
				>
				<button disabled={process.length > 0}
					on:click={() => {
						process = $puzzlestore.slice();
						gradeBoard();
					}}
				>
					Grade cache
				</button>
				{#if process.length}
					{process.length} remaining
					{#each { length: 3 - (process.length % 3) } as _}
						.
					{/each}
          {nf.format(lastGradeTime)}ms
				{/if}
			</div>

			<table style="text-align:right;">
				<tr>
					<td>
						<label for="obs">Observations per grade</label>
					</td>
					<td>
						<input id="obs" type="number" bind:value={observations} />
					</td>
				</tr>
			</table>

			<h3>Top 5 of {$puzzlestore.length} found puzzles</h3>
			<table>
        <tr>
          <th>Rating</th>
          <th>Puzzle</th>
        </tr>
				{#each top5 as puzzle}
					<tr>
						<td>{nf.format(rating(puzzle))}</td>
						<td><button on:click={() => (selectedBoard = puzzle)}>
							{nf.format(stats(puzzle).minSteps)} ≤ {nf.format(stats(puzzle).steps)} ⁺∕₋ {nf.format(stats(puzzle).stepsSigma)} ≤ {nf.format(stats(puzzle).maxSteps)} 
						</button>
          </td>
					</tr>
				{/each}
			</table>

			<h3>Bottom 5 of {$puzzlestore.length} found puzzles</h3>
			<table>
        <tr>
          <th>Rating</th>
          <th>Puzzle</th>
        </tr>
				{#each bottom5 as puzzle}
					<tr>
						<td>{rating(puzzle).toFixed(0)}</td>
						<td><button on:click={() => (selectedBoard = puzzle)}>
							{stats(puzzle).minSteps.toFixed(0)} ≤ {stats(puzzle).steps.toFixed(0)} ⁺∕₋ {stats(puzzle).stepsSigma.toFixed(0)} ≤ {stats(puzzle).maxSteps.toFixed(0)}
						</button>
          </td>
					</tr>
				{/each}
      </table>
		</td>
		<td style="width:338px">
			<Board board={selectedBoard} puzzleMask={maskFromIncompleteGrid(selectedBoard)} />
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
  th {
    text-align: right; 
  }
  table table td button {
    width: 14rem;
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
  table table tr > td {
    text-align: right;
  }
</style>
