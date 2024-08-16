import { browser } from "$app/environment";
import { writable } from "svelte/store";

let grids = loadFromLocalStorage("sudoku.grids");
export const gridstore = writable(grids);
gridstore.subscribe(value => {
  if (!browser) return;
  localStorage.setItem("sudoku.grids", JSON.stringify(value));
});

let puzzles = loadFromLocalStorage("sudoku.puzzles");
export const puzzlestore = writable(puzzles);
puzzlestore.subscribe(value => {
  if (!browser) return;
  localStorage.setItem("sudoku.puzzles", JSON.stringify(value));
});

let stats:{[key:string]:any} = loadFromLocalStorage("sudoku.stats");
export const statsstore = writable(stats);
statsstore.subscribe(value => {
  if (!browser) return;
  localStorage.setItem("sudoku.stats", JSON.stringify(value));
});

function loadFromLocalStorage(key:string): any {
  if (!browser) return [];
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  } else {
    return [];
  }
}
