<script>
	import Datastore from './Datastore.svelte';
	import DifficultyGrader from './DifficultyGrader.svelte';
  import GridGenerator from './GridGenerator.svelte';
	import PuzzleGenerator from './PuzzleGenerator.svelte';
	import Solver from './Solver.svelte';
</script>

<div>
	<a href="https://avanderw.co.za"><svg><use href="feather-sprite.svg#home" /></svg>Home</a>
	<a href="https://github.com/avanderw/sudoku">
		<svg><use href="feather-sprite.svg#github" /></svg>
		Source
	</a>
  <a href="https://tracking.avanderw.co.za/avanderw.co.za">
		<svg><use href="feather-sprite.svg#bar-chart-2" /></svg>
		Analytics
	</a>
</div>

<h1>Sudoku</h1>

<Solver />

<GridGenerator />

<PuzzleGenerator />

<DifficultyGrader />

<h2>FAQ</h2>

<h3>How do we test for uniqueness?</h3>
<p>
  After the solver has found a solution, we backtrack if the branch stack has remaining items and continue solving.
  We keep track of how many times we have found a solution and if we find a solution more than once, the board is not unique.
  The current implementation short-circuits on finding the second solution. The algorithm is behind a calculate button because
  it is computationally expensive to calculate each time we update the board.
</p>

<h3>How do we update sigma values?</h3>
<p>
  When we don't have a sigma, we use the first observation as the sigma.
  When we observe a new value, we calculate the variance between the observation and our expected mean.
  We treat sigma as all observed variances then take the square root of the sum of the squares of the variances.
  We observe 4 historical points with 1 new observation. Lastly, we divide by 5 to get the average difference.
  It is important to note that black swan observations whilst smoothed, can cause the sigma to be very large immediately after the observation.
</p>

<Datastore />

<style>
  h1 {
    margin-top: 0;
    padding-top: 0;
  }
	a {
		display: inline-flex;
		gap: 0.5rem;
	}
	div {
		display: flex;
		align-items: center;
		justify-content: right;
		gap: 2rem;
    font-size: smaller;
	}
  svg {
    width: 1rem;
    height: 1rem;
  }
</style>