<script lang="ts">
  import { gridstore, puzzlestore } from "$lib/datastore";
</script>

<h2>Cache</h2>
<p>NOTE: Currently using local storage. Switching your browser switches the cache. I am considering using an online service to maintain a cache.</p>
<table>
  <tr>
    <td>{$gridstore.length}</td>
    <td style="text-align:left">grids</td>
    <td>({new Blob([JSON.stringify($gridstore)]).size.toLocaleString()}</td>
    <td>bytes)</td>
  </tr>
  <tr>
    <td>{$puzzlestore.length}</td>
    <td style="text-align:left">puzzles</td>
    <td>({new Blob([JSON.stringify($puzzlestore)]).size.toLocaleString()}</td>
    <td>bytes)</td>
  </tr>
</table>

<style>
  td {
    text-align: right;
  }
</style>