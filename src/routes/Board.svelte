<script lang="ts">
	import { statsstore } from '$lib/datastore';
	import { domainFromBoard, domainSolvable, boardUnique } from '$lib/sudoku';
	import { score } from '$lib/grade';
	import CellPotential from './CellPotential.svelte';
	import { onMount } from 'svelte';

	const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
	export let board: number[] = Array.from({ length: 81 }, (_, i) =>
		Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 9) + 1
	);

	export let puzzleMask: number[] = [];

	$: domainMatrix = domainFromBoard(board);
	$: solvable = domainSolvable(domainMatrix);
	$: unique = resetUnique(board);

	$: key = board.join('');
	$: stats = $statsstore[key];

	function resetUnique(board: number[]): { unique: boolean; timeout: boolean } | undefined {
		return undefined;
	}

	$: isPrinting = false;
	onMount(() => {
		isPrinting = window.location.pathname.includes('/print');
	});
</script>

<div hidden={isPrinting}>
	<span><a href="/print?puzzle={JSON.stringify(board)}" target="_blank">Print</a></span><br />
	{#if puzzleMask.length > 0}
		<span>Clues: {puzzleMask.filter((v) => v !== 0).length}</span><br />
	{/if}
	{#if stats}
		<span>Rating:</span><span class="accent">{nf.format(score(stats))}</span><br />
	{/if}
</div>

<table class:center={isPrinting}>
	{#each { length: 9 } as _, y}
		<tr class:bottom={(y + 1) % 3 === 0}>
			{#each { length: 9 } as _, x}
				<td
					class:right={(x + 1) % 3 === 0}
					class:bold={puzzleMask[9 * y + x] && puzzleMask[9 * y + x] !== 0}
				>
					{#if board[9 * y + x] === 0}
						<CellPotential domain={domainMatrix[9 * y + x]} />
					{:else}
						{board[9 * y + x] || 0}
					{/if}
				</td>
			{/each}
		</tr>
	{/each}
</table>

<div hidden={isPrinting}>
	<span><b>Solvable:</b> {solvable ? 'Yes' : 'No'}</span><br />
	<span>
		<b>Unique:</b>
		{#if unique === undefined}
			<button on:click={() => (unique = boardUnique(board, 50000))}>Calculate</button>
		{:else}
			{unique.unique ? 'Yes' : unique.timeout ? 'Timeout' : 'No'}
		{/if}
	</span>
</div>

<style>
	table {
		border-collapse: collapse;
		border: 2px solid var(--primary-9);
	}
	td {
		border: 1px solid var(--primary-4);
		width: 36px;
		height: 36px;
		text-align: center;
		padding: 0px;
		margin: 0px;
	}
	.bottom {
		border-bottom: 2px solid var(--primary-9);
	}
	.right {
		border-right: 2px solid var(--primary-9);
	}
	.bold {
		font-weight: bold;
		color: var(--primary-9);
		background-color: var(--primary-2);
	}
	span {
		display: inline-block;
		padding: 0.125rem;
		margin: 0.125rem 0;
	}
	.center {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-25%, -25%);
		scale: 2;
	}
	a,
	button {
		padding: 0.125rem 0.25rem;
		border: 1px solid var(--primary-9);
		color: var(--primary-1);
		background-color: var(--secondary-6);
		text-decoration: none;
		cursor: pointer;
		font-size: smaller;
	}
	a:hover,
	button:hover {
		background-color: var(--secondary-7);
	}
	.accent {
		color: var(--accent-6);
		font-weight: bold;
	}
</style>
