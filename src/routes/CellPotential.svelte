<script lang="ts">
	export let domain: number[] = Array.from({ length: 9 }, (_, i) => i + 1);
</script>

<table>
	{#each { length: 3 } as _, y}
		<tr>
			{#each { length: 3 } as _, x}
				<td class:hide={!domain.includes(3 * y + x + 1)}>
					{3 * y + x + 1}
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	table {
		width: 100%;
		height: 100%;
		border-collapse: collapse;
		font-size: xx-small;
		color: var(--primary-5);
		overflow: hidden;
		font-family: Arial, Helvetica, sans-serif;
    border: none;
    margin: 0;
    padding: 0;
	}
	.hide {
		visibility: hidden;
	}
</style>
