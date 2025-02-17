import { enqueueStar, dequeue, isEmpty, reorder } from "./PriorityQueue";

export const aStar = (
  grid,
  startX,
  startY,
  endX,
  endY,
  animations,
  rowNum,
  colNum
) => {
  var priorityQueue = []; // Priority Queue to store nodes
  let startNode = grid[startX][startY];
  let endNode = grid[endX][endY];
  startNode.g = 0; // The cost of going from the start node to the start node is zero
  startNode.f = getDistance(startNode, endNode); // f(n) = g(n) + h(n), here h(n) is heuristic function

  enqueueStar(priorityQueue, startNode);

  // Loop until the priority queue is empty
  while (!isEmpty(priorityQueue)) {
    let currentNode = dequeue(priorityQueue); // Get node with the lowest f score
    if (currentNode.isEnd) {
      // Reconstruct the path
      currentNode = currentNode.parent;
      while (!currentNode.isStart) {
        animations.push(["path", currentNode.col, currentNode.row]);
        currentNode = currentNode.parent;
      }
      priorityQueue = [];
      return animations;
    }

    if (!currentNode.isStart) {
      animations.push(["visit", currentNode.col, currentNode.row]);
    }

    currentNode.closed = true; // Mark the current node as closed

    let neighbors = getNeighbors(currentNode, rowNum, colNum);
    for (let i = 0; i < neighbors.length; i++) {
      let [neighborRow, neighborCol] = neighbors[i];
      let neighborNode = grid[neighborRow][neighborCol];
      console.log(neighborNode);
      if (
        neighborNode.closed ||
        document.getElementById(neighborNode.id)?.className === "wall"
      ) {
        continue; // Skip if neighbor is closed or is a wall
      }
      if (!neighborNode.isEnd) {
        animations.push(["fringe", neighborNode.col, neighborNode.row]);
      }

      let tentativeGScore =
        currentNode.g + getDistance(currentNode, neighborNode); // Compute temporary g score

      var isNeighborVisited = neighborNode.visited;
      if (tentativeGScore < neighborNode.g || !isNeighborVisited) {
        neighborNode.visited = true;
        neighborNode.parent = currentNode;
        neighborNode.g = tentativeGScore;
        neighborNode.f = neighborNode.g + getDistance(neighborNode, endNode); // Update f score

        if (!isNeighborVisited) {
          enqueueStar(priorityQueue, neighborNode);
        } else {
          reorder(priorityQueue, neighborNode);
        }
      }
    }
  }

  // No path found
  priorityQueue = [];
  animations.push(["nfound", -1, -1]);
  return animations;
};

// Function to calculate the Manhattan distance between two nodes
const getDistance = (currentNode, neighborNode) => {
  let distance =
    Math.abs(neighborNode.col - currentNode.col) +
    Math.abs(neighborNode.row - currentNode.row);
  return distance;
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
