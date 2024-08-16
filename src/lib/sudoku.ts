
export const blondePuzzle = [
  0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 3, 0, 0, 4, 0, 0, 0, 0, 1, 8, 0,
  0, 0, 0, 5, 0, 6, 0, 0, 7, 0, 8, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 8, 5, 0, 0, 0, 0, 0, 9,
  0, 0, 0, 4, 0, 5, 0, 0, 4, 7, 0, 0, 0, 6, 0, 0, 0
];

export function puzzleFromGrid(board: number[], mask: number[]): number[] {
  return board.map((value, index) => mask[index] === 1 ? value : 0);
}

export function maskFromIncompleteGrid(board: number[]): number[] {
  return board.map(value => value === 0 ? 0 : 1);
}

function createDomain(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

function createDomainMatrix(): number[][] {
  const matrix = [];
  for (let i = 0; i < 81; i++) {
    matrix.push(createDomain());
  }
  return matrix;
}

export function domainFromBoard(board: number[]): number[][] {
  const domainMatrix = createDomainMatrix();
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) {
      reduceRowDomain(domainMatrix, i, board[i]);
      reduceColumnDomain(domainMatrix, i, board[i]);
      reduceSquareDomain(domainMatrix, i, board[i]);
      domainMatrix[i] = [board[i]];
    }
  }
  return domainMatrix;
}

export function domainSolvable(domainMatrix: number[][]): boolean {
  for (let i = 0; i < 81; i++) {
    if (domainMatrix[i].length === 0) {
      return false;
    }
  }
  return true;
}

export function boardSolvable(board: number[]): boolean {
  return domainSolvable(domainFromBoard(board));
}

function reduceRowDomain(domainMatrix: number[][], index: number, value: number) {
  const row = Math.floor(index / 9);
  for (let i = 0; i < 9; i++) {
    const domain = domainMatrix[row * 9 + i];
    if (domain.includes(value)) {
      domainMatrix[row * 9 + i] = domain.filter(v => v !== value);
    }
  }
}

function reduceColumnDomain(domainMatrix: number[][], index: number, value: number) {
  const column = index % 9;
  for (let i = 0; i < 9; i++) {
    const domain = domainMatrix[i * 9 + column];
    if (domain.includes(value)) {
      domainMatrix[i * 9 + column] = domain.filter(v => v !== value);
    }
  }
}

const squares = [
  [0, 1, 2, 9, 10, 11, 18, 19, 20], [3, 4, 5, 12, 13, 14, 21, 22, 23], [6, 7, 8, 15, 16, 17, 24, 25, 26],
  [27, 28, 29, 36, 37, 38, 45, 46, 47], [30, 31, 32, 39, 40, 41, 48, 49, 50], [33, 34, 35, 42, 43, 44, 51, 52, 53],
  [54, 55, 56, 63, 64, 65, 72, 73, 74], [57, 58, 59, 66, 67, 68, 75, 76, 77], [60, 61, 62, 69, 70, 71, 78, 79, 80],
];
function reduceSquareDomain(domainMatrix: number[][], index: number, value: number) {
  const square = squares[Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3)];
  for (let i = 0; i < 9; i++) {
    const domain = domainMatrix[square[i]];
    if (domain.includes(value)) {
      domainMatrix[square[i]] = domain.filter(v => v !== value);
    }
  }
}

export function solveStep(board: number[], stack: number[][]): { solved: boolean, board: number[] | undefined } {
  if (!board) throw new Error("board is undefined");
  const domainMatrix = domainFromBoard(board);
  const smallestDomain = domainMatrix.reduce((acc, domain, index) => {
    if (domain.length === 0) return acc;
    if (board[index] !== 0) return acc;
    if (acc === -1) return domain.length;
    return Math.min(acc, domain.length);
  }, -1);

  if (smallestDomain === -1) {
    return { solved: true, board };
  }

  if (domainSolvable(domainMatrix) === false) {
    return { solved: false, board: stack.pop() }; // backtrack
  }

  const smallestDomainIndexes = domainMatrix.reduce((acc, domain, index) => {
    if (board[index] !== 0) return acc;
    if (domain.length === smallestDomain) acc.push(index);
    return acc;
  }, [] as number[]);
  const randomIndex = smallestDomainIndexes[Math.floor(Math.random() * smallestDomainIndexes.length)];

  if (smallestDomain === 1) {
    board[randomIndex] = domainMatrix[randomIndex][0];
    return { solved: false, board }; // follow the path
  }

  const domain = domainMatrix[randomIndex];
  for (const element of domain) {
    const newBoard = board.slice();
    newBoard[randomIndex] = element;
    stack.push(newBoard);
  }
  return { solved: false, board: stack.pop() }; // branch
}

export function solve(puzzle: number[]): { steps: number, branches: number, backtracks: number, stack: number} {
  let solved = false;

  let result = runBatch(puzzle.slice(), 0, 0, 0, 0, [], solved);
  while (!result.solved) {
    result = runBatch(result.board, 0, result.steps, result.branches, result.backtracks, result.stack, solved);
  }

  return { steps: result.steps, branches: result.branches, backtracks: result.backtracks, stack: result.stack.length };
    
}

function runBatch(currentBoard: number[], callstack: number, steps:number, branches:number, backtracks:number, stack:number[][],  solved:boolean) {
  if (solved) return { steps, branches, backtracks, stack, solved: true, board: currentBoard };

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

  if (callstack < 2000) {
    callstack++;
    return runBatch(state.board!, callstack, steps, branches, backtracks, stack, solved);
  } else {
    return { steps, branches, backtracks, stack, solved: false, board: state.board! };
  }
};


export function boardUnique(board: number[], timeout:number): {unique:boolean, timeout:boolean} {
  if (board.length !== 81) {
    throw new Error("board length is not 81");
  }

  let currentBoard = board.slice();
  let stack: number[][] = [];
  let solved = false;
  let unique = true;
  let solvedCount = 0;
  let steps = 0;
  let branches = 0;
  let backtracks = 0;

  while (currentBoard && !solved && unique && steps < timeout) {
    const origStackLength = stack.length;
    const state = solveStep(currentBoard, stack);

    solved = state.solved;
    if (solved) {
      solvedCount++;
      unique = solvedCount <= 1;
    } else {
      steps++;
      if (stack.length < origStackLength) {
        backtracks++;
      }
      if (stack.length > origStackLength) {
        branches++;
      }
    }
    currentBoard = state.board!;

    if (solved && stack.length > 0) {
      solved = false;
      currentBoard = stack.pop()!;
    }
  }

  if (steps >= timeout) {
    console.log("timeout reached");
    return {unique: false, timeout: true};
  }

  return {unique: solvedCount === 1, timeout: false};
}
