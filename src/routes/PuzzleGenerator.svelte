<script lang="ts">
	import { gridstore, puzzlestore } from '$lib/datastore';
	import { boardUnique } from '$lib/sudoku';
	import Board from './Board.svelte';

  const sudokuGrid = [
    2,1,5,7,8,4,3,9,6,
    8,9,7,6,2,3,4,1,5,
    3,4,6,1,5,9,2,8,7,
    7,2,8,4,6,5,9,3,1,
    9,5,4,3,1,2,7,6,8,
    1,6,3,8,9,7,5,2,4,
    4,8,9,5,3,1,6,7,2,
    5,3,1,2,7,6,8,4,9,
    6,7,2,9,4,8,1,5,3,
  ];

  let anchorGrid = ($gridstore.length > 0) ? $gridstore[Math.floor(Math.random() * $gridstore.length)].slice() : sudokuGrid.slice();
  let stepTime:number = 25; 
  let steps = 0;
  let backtracks = 0;
  let branches = 0;
  let currentBoard = anchorGrid.slice();
  let solved = false;
  let stack:number[][] = [];
  let stopSignal = false;
  let failureCount:number = 0;
  let maxFailures = 50;
  let batchSize = 10;

  const random = ()=> {
    anchorGrid = ($gridstore.length > 0) ? $gridstore[Math.floor(Math.random() * $gridstore.length)].slice() : sudokuGrid.slice();
    currentBoard = anchorGrid.slice();
    solved = false;
    stack = [];
    steps = 0;
    backtracks = 0;
    branches = 0;
    stopSignal = true;
    failureCount = 0;
  }

  const solve = () => {
    if (stopSignal || failureCount >= maxFailures) {
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
    const boardNonZeroIndexes = currentBoard.map((v:number, i:number) => v !== 0 ? i : -1).filter((i:number) => i !== -1);
    const randomIndex = boardNonZeroIndexes[Math.floor(Math.random() * boardNonZeroIndexes.length)];
    const testBoard = currentBoard.slice();
    testBoard[randomIndex] = 0;

    if (boardUnique(testBoard, 50000).unique) {
      currentBoard[randomIndex] = 0;
    } else {
      failureCount++;
    }

    if (failureCount >= maxFailures) {
      addPuzzle();
    }
  };

  function batch() {
    const origStepTime = stepTime;
    stepTime = 0;
    for (let i = 0; i < batchSize; i++) {
      random();
      stopSignal = false;
      solve();
    }
    stepTime = origStepTime;
  }

  function addPuzzle() {
		const found = $puzzlestore.find((grid: number[]) => grid.join('') === currentBoard.join(''));
		if (!found) $puzzlestore = [...$puzzlestore, currentBoard];
  }
</script>

<table>
	<tr>
		<td valign="top">
			<h2>Puzzle Generator</h2>
      <p>
        To generate a sudoku, we can start with a solved grid and remove values.
        If we cannot delete a value without making the board non-unique, we have reached the maximum difficulty.
      </p>
			<div>
				<button on:click={()=>stopSignal=false} on:click={solve} disabled={failureCount >= maxFailures}>Solve</button>
        <button on:click={()=>stopSignal=true} disabled={failureCount >= maxFailures}>Stop</button>
				<button on:click={random}>Random</button>
				<button on:click={step} disabled={failureCount >= maxFailures}>Step</button>
        <button on:click={batch}>Batch</button>
			</div>

			<table style="text-align:right;">
				<tr>
					<td>
						<label for="seed">Seed</label>
					</td>
					<td>
						<input id="seed" type="number" disabled  title="Not implemented yet!"/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="step-time">Time per step (ms)</label>
					</td>
					<td>
						<input id="step-time" type="number" bind:value={stepTime}/>
					</td>
				</tr>
				<tr>
					<td> <label for="target">Max failed attempts</label></td>
					<td><input id="target" type="number" bind:value={maxFailures} /></td>
				</tr>
				<tr>
					<td>Failure count:</td>
					<td>{failureCount}</td>
				</tr>
				<tr>
					<td> <label for="batch-size">Batch size</label></td>
					<td> <input id="batch-size" type="number" bind:value={batchSize} /></td>
				</tr>
				<tr>
					<td>Puzzles in cache</td>
					<td>{$puzzlestore.length.toLocaleString()}</td>
				</tr>
			</table>
		</td>
		<td style="width:338px">
			<Board board={currentBoard}/>
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
</style>
