export const dfs = (x, y, grid, animations, rowNum, colNum) => {
  const state = { found: false }; // Using an object to maintain state
  dfsHelper(x, y, grid, animations, state, rowNum, colNum);
  if (!state.found) {
    animations.push(["nfound"]); // not found
  }
  return animations;
};
// returns an array of all neighbor nodes to a node
const getNeighbors = (node, rowNum, colNum): number[][] => {
  let result: number[][] = [];
  let row = node.row;
  let col = node.col;

  //left
  if (row >= 0 && row < rowNum && col - 1 >= 0 && col - 1 < colNum) {
    result.push([col - 1, row]);
  }
  // top
  if (row - 1 >= 0 && row - 1 < rowNum && col >= 0 && col < colNum) {
    result.push([col, row - 1]);
  }
  // right
  if (row >= 0 && row < rowNum && col + 1 >= 0 && col + 1 < colNum) {
    result.push([col + 1, row]);
  }
  // bottom
  if (row + 1 >= 0 && row + 1 < rowNum && col >= 0 && col < colNum) {
    result.push([col, row + 1]);
  }
  return result;
};
const dfsHelper = (x, y, grid, animations, state, rowNum, colNum) => {
  if (state.found) {
    return;
  }
  let current = grid[x][y];

  // Check the type of the node from the grid structure
  if (current.isEnd) {
    animations.push(["end", x, y]);
    state.found = true;
    return;
  } else if (!current.isStart) {
    animations.push(["visit", x, y]);
    current.visited = true;
  }

  let neighbors = getNeighbors(current, rowNum, colNum);
  for (let i = 0; i < neighbors.length; i++) {
    let ncoords = neighbors[i];
    let n = grid[ncoords[0]][ncoords[1]];
    if (document.getElementById(n.id)?.className === "wall") {
      continue; // skip walls
    }
    // Check if the node is a wall using the grid structure
    if (!n.visited && !n.isWall) {
      dfsHelper(
        ncoords[0],
        ncoords[1],
        grid,
        animations,
        state,
        rowNum,
        colNum
      );
      if (state.found) {
        return;
      }
    }
  }
};
