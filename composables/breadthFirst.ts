export const bfs = (x, y, grid, animations, rowNum, colNum) => {
  bfsHelper(x, y, grid, animations, rowNum, colNum);
  animations.push(["nfound", -1, -1]); // not found
  return animations;
};
const bfsHelper = (x, y, grid, animations, rowNum, colNum) => {
  let current = grid[x][y];
  let currStyle = document.getElementById(current.id)?.className;
  let q: any[] = [];
  current.visited = true;
  if (current.isEnd == false && current.isStart == false) {
    animations.push(["visit", x, y]);
  }
  q.push(current);
  while (q.length > 0) {
    let v = q.shift(); // pop
    if (v.isEnd == true) {
      let curr = grid[v.col][v.row].parent;
      while (curr != null) {
        if (curr.isStart) {
          break;
        }
        animations.push(["path", curr.col, curr.row]);
        curr = curr.parent;
      }
      animations.push(["end", x, y]);
      q = [];
      break;
    }
    let neighbors = getNeighbors(v, rowNum, colNum);
    for (let i = 0; i < neighbors.length; i++) {
      let ncoords = neighbors[i];
      let n = grid[ncoords[0]][ncoords[1]];
      if (document.getElementById(n.id)?.className === "wall") {
        continue; // skip walls
      }
      if (n.visited === false) {
        if (n.isEnd == true) {
          n.parent = v;
          q.push(n);
          break;
        }
        animations.push(["visit", n.col, n.row]);
        n.visited = true;
        n.parent = v;
        q.push(n);
      }
    }
  }
  return;
};
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
