<script lang="ts">
  import Board from '../Board.svelte';
  import {maskFromIncompleteGrid} from '$lib/sudoku';
	import { onMount } from 'svelte';

  let puzzle:number[] = [];
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("puzzle")) {
      puzzle = JSON.parse(urlParams.get("puzzle")!);
    } else {
      console.log("No puzzle found in URL");
    }
  });
</script>

<Board board={puzzle} puzzleMask={maskFromIncompleteGrid(puzzle)} />
