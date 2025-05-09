<template>
  <ClientOnly>
    <div class="path-container fade-in">
      <div class="graph-action" ref="graphActionRef">
        <div class="col" v-for="(col, index) in grid" :key="index">
          <GridNode
            v-for="node in col"
            :key="node.id"
            :id="node.id"
            :nodeIdentifier="node.ref"
            :row="node.row"
            :col="node.col"
            :isWall="node.isWall"
            :isStart="node.isStart"
            :isEnd="node.isEnd"
            :visited="node.visited"
            :parent="node.parent"
            :ddist="node.ddist"
            v-on:mousedown="mouseDown(node)"
            v-on:mouseup="mouseUp(node)"
            v-on:mouseenter="mouseEnter(node)"
            v-on:mouseout="mouseOut(node)"
          ></GridNode>
        </div>
      </div>
      <div class="function-buttons">
        <button
          class="toolbar-button reset-grid-button"
          :disabled="buttonDisable"
          v-on:click="resetGrid"
        >
          <span class="button-content-wrapper">
            <Icon name="ion:grid-outline" style="vertical-align: middle" />
            Reset Grid
          </span>
        </button>
        <button
          class="toolbar-button reset-vis-button"
          :disabled="buttonDisable"
          v-on:click="resetVis"
        >
          <span class="button-content-wrapper">
            <Icon name="ion:refresh-outline" style="vertical-align: middle" />
            Reset Path
          </span>
        </button>
        <button
          class="toolbar-button generate-maze-button reset-vis-button"
          :disabled="buttonDisable"
          v-on:click="generateRandomMaze"
        >
          <span class="button-content-wrapper">
            <Icon
              name="ion:extension-puzzle-outline"
              style="vertical-align: middle"
            />
            Generate Maze
          </span>
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="depthFirstButton"
        >
          DFS
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="breadthFirstButton"
        >
          BFS
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="dijkstraButton"
        >
          Dijkstra
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="aStarButton"
        >
          A*
        </button>
      </div>
    </div>
  </ClientOnly>
</template>
<script setup>
import { onMounted, ref, nextTick, defineProps, watch } from "vue";
import GridNode from "~/components/GridNode.vue";

// Define props
const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const NODE_SIZE = 26; // 25px (GridNode size) + 0.5px border * 2

// Define Desktop and Mobile constants (Mobile ones are fallbacks if dynamic sizing fails)
const DESKTOP_ROWS = 30;
const DESKTOP_COLS = 70;
const DESKTOP_START_X = 30;
const DESKTOP_START_Y = 15;
const DESKTOP_END_X = 40;
const DESKTOP_END_Y = 15;

const MOBILE_FALLBACK_ROWS = 20;
const MOBILE_FALLBACK_COLS = 10;
const MOBILE_FALLBACK_START_X = 2;
const MOBILE_FALLBACK_START_Y = 9;
const MOBILE_FALLBACK_END_X = 7;
const MOBILE_FALLBACK_END_Y = 9;

const rowNum = ref(DESKTOP_ROWS);
const colNum = ref(DESKTOP_COLS);
const grid = ref([[]]);

const startX = ref(DESKTOP_START_X);
const startY = ref(DESKTOP_START_Y);
const endX = ref(DESKTOP_END_X);
const endY = ref(DESKTOP_END_Y);

const graphActionRef = ref(null);
const isMounted = ref(false);

const animations = ref([]);
// const defaultGraph = ref([]); // Not explicitly used, can be removed if not needed later
const found = ref(false);
const animSpeed = ref(10);
const buttonDisable = ref(false);
const mousePressed = ref(false); // For wall drawing

// Desktop drag states
const moveStart = ref(false);
const moveEnd = ref(false);

// Mobile tap-to-move states
const isMovingStartMobile = ref(false);
const isMovingEndMobile = ref(false);

const prevNodeClass = ref(null); // Stores class of node before mouseEnter (for desktop dragging)
const viz = ref(false);

const clearWallsAndVisualization = () => {
  viz.value = false;
  clearSelectedForMoveMobile(); // Reset mobile move states
  for (let c = 0; c < colNum.value; c++) {
    for (let r = 0; r < rowNum.value; r++) {
      if (grid.value[c] && grid.value[c][r]) {
        let node = grid.value[c][r];
        let element = document.getElementById(node.id);
        if (!element) continue;

        // Reset non-essential data
        node.visited = false;
        node.closed = false;
        node.parent = null;
        node.f = Number.POSITIVE_INFINITY;
        node.g = Number.POSITIVE_INFINITY;
        node.h = Number.POSITIVE_INFINITY;

        // Reset wall state
        node.isWall = false;

        // Reset visual class and ddist based on current start/end positions
        if (node.col === startX.value && node.row === startY.value) {
          node.isStart = true; // Ensure it's marked as start
          node.ddist = 0;
          element.className = "start";
        } else if (node.col === endX.value && node.row === endY.value) {
          node.isEnd = true; // Ensure it's marked as end
          node.ddist = Number.POSITIVE_INFINITY;
          element.className = "end";
        } else {
          // Ensure it's not marked as start/end if coords don't match
          node.isStart = false;
          node.isEnd = false;
          node.ddist = Number.POSITIVE_INFINITY;
          element.className = "box"; // Reset to box if not start/end
        }
      }
    }
  }
  enableButtons(); // Ensure buttons are enabled after clearing
};

const updateGridDimensionsAndInitialize = async () => {
  if (
    grid.value &&
    grid.value.length > 0 &&
    grid.value[0].length > 0 &&
    graphActionRef.value
  ) {
    const existingCols = graphActionRef.value.querySelectorAll(".col");
    existingCols.forEach((colElement) => {
      const nodes = colElement.querySelectorAll(
        ".box, .start, .end, .wall, .visited, .path, .fringe"
      );
      nodes.forEach((nodeElement) => {
        if (
          nodeElement.classList.contains("start") ||
          nodeElement.classList.contains("end")
        ) {
          nodeElement.className = "box";
        }
      });
    });
  }

  if (!props.isMobile) {
    rowNum.value = DESKTOP_ROWS;
    colNum.value = DESKTOP_COLS;
    startX.value = DESKTOP_START_X;
    startY.value = DESKTOP_START_Y;
    endX.value = DESKTOP_END_X;
    endY.value = DESKTOP_END_Y;
  } else {
    await nextTick(); // Ensure DOM updates from any prior operations like node clearing
    const graphEl = graphActionRef.value;

    if (graphEl) {
      const pathContainerEl = graphEl.parentElement;
      let availableHeight = 0;
      const availableWidth = graphEl.clientWidth; // clientWidth is usually more stable

      if (pathContainerEl) {
        const pathContainerHeight = pathContainerEl.clientHeight;
        const buttonsContainer =
          pathContainerEl.querySelector(".function-buttons");
        let buttonsFullHeight = 0;
        if (buttonsContainer) {
          const buttonsStyle = window.getComputedStyle(buttonsContainer);
          buttonsFullHeight =
            buttonsContainer.offsetHeight +
            parseFloat(buttonsStyle.marginTop) +
            parseFloat(buttonsStyle.marginBottom);
        }

        const graphElStyle = window.getComputedStyle(graphEl);
        const graphElVerticalMargins =
          parseFloat(graphElStyle.marginTop) +
          parseFloat(graphElStyle.marginBottom);

        availableHeight =
          pathContainerHeight - buttonsFullHeight - graphElVerticalMargins;
      } else {
        // Fallback if pathContainerEl somehow isn't found, try direct measurement (less reliable here)
        availableHeight = graphEl.clientHeight;
      }

      if (availableHeight > 0 && availableWidth > 0) {
        const newRowNum = Math.max(1, Math.floor(availableHeight / NODE_SIZE));
        const newColNum = Math.max(1, Math.floor(availableWidth / NODE_SIZE));

        rowNum.value = newRowNum;
        colNum.value = newColNum;

        // Recalculate start/end based on new dimensions
        startX.value = Math.max(
          0,
          Math.min(Math.floor(newColNum / 4), newColNum - 1)
        );
        startY.value = Math.max(
          0,
          Math.min(Math.floor(newRowNum / 2), newRowNum - 1)
        );
        endX.value = Math.max(
          0,
          Math.min(Math.floor((newColNum * 3) / 4), newColNum - 1)
        );
        endY.value = Math.max(
          0,
          Math.min(Math.floor(newRowNum / 2), newRowNum - 1)
        );

        if (newColNum <= 1 || newRowNum <= 1) {
          startX.value = 0;
          startY.value = 0;
          endX.value = Math.max(0, newColNum - 1);
          endY.value = Math.max(0, newRowNum - 1);
        }

        if (startX.value === endX.value && startY.value === endY.value) {
          if (newColNum > 1) {
            endX.value = Math.min(startX.value + 1, newColNum - 1);
          } else if (newRowNum > 1) {
            endY.value = Math.min(startY.value + 1, newRowNum - 1);
          }
        }
      } else {
        // Fallback to default mobile dimensions if calculated height/width is invalid
        rowNum.value = MOBILE_FALLBACK_ROWS;
        colNum.value = MOBILE_FALLBACK_COLS;
        startX.value = MOBILE_FALLBACK_START_X;
        startY.value = MOBILE_FALLBACK_START_Y;
        endX.value = MOBILE_FALLBACK_END_X;
        endY.value = MOBILE_FALLBACK_END_Y;
      }
    } else {
      // Fallback if graphEl is not available when expected
      rowNum.value = MOBILE_FALLBACK_ROWS;
      colNum.value = MOBILE_FALLBACK_COLS;
      startX.value = MOBILE_FALLBACK_START_X;
      startY.value = MOBILE_FALLBACK_START_Y;
      endX.value = MOBILE_FALLBACK_END_X;
      endY.value = MOBILE_FALLBACK_END_Y;
    }
  }

  if (colNum.value <= 0 || rowNum.value <= 0) {
    return;
  }

  initGrid();
  await nextTick();
  setStart();
  setEnd();
};

const tryInitializeGrid = async (attempt = 1) => {
  const maxAttempts = 5;
  const retryDelay = 200; // ms

  if (props.isActive && isMounted.value) {
    await nextTick();
    setTimeout(async () => {
      if (props.isActive && isMounted.value) {
        if (graphActionRef.value && graphActionRef.value.clientWidth > 0) {
          await updateGridDimensionsAndInitialize();
        } else {
          if (attempt < maxAttempts) {
            setTimeout(() => tryInitializeGrid(attempt + 1), retryDelay);
          } else {
            await updateGridDimensionsAndInitialize();
          }
        }
      }
    }, 300); // Initial delay before first check
  }
};

onMounted(async () => {
  isMounted.value = true;
  await tryInitializeGrid(); // Call with default attempt = 1
});

watch(
  () => props.isActive,
  async (newIsActive, oldIsActive) => {
    if (newIsActive) {
      await tryInitializeGrid(); // Call with default attempt = 1
    }
  },
  { immediate: false }
);

const initGrid = () => {
  let newGrid = [];
  for (let c = 0; c < colNum.value; c++) {
    const currentCol = [];
    for (let r = 0; r < rowNum.value; r++) {
      currentCol.push(createNode(r, c));
    }
    newGrid.push(currentCol);
  }
  grid.value = newGrid;
};

const disableButtons = () => {
  buttonDisable.value = true;
};
const enableButtons = () => {
  buttonDisable.value = false;
};

const clearSelectedForMoveMobile = () => {
  const oldStartNodeEl = document.getElementById(
    `Node-${startX.value}-${startY.value}`
  );
  if (oldStartNodeEl) oldStartNodeEl.classList.remove("selected-for-move");
  const oldEndNodeEl = document.getElementById(
    `Node-${endX.value}-${endY.value}`
  );
  if (oldEndNodeEl) oldEndNodeEl.classList.remove("selected-for-move");
  isMovingStartMobile.value = false;
  isMovingEndMobile.value = false;
};

const mouseEnter = (node) => {
  if (props.isMobile || viz.value) return;

  prevNodeClass.value = document.getElementById(node.id)?.className || "box";
  if (
    moveStart.value &&
    grid.value[node.col] &&
    grid.value[node.col][node.row]
  ) {
    document.getElementById(node.id).className = "start";
  } else if (
    moveEnd.value &&
    grid.value[node.col] &&
    grid.value[node.col][node.row]
  ) {
    document.getElementById(node.id).className = "end";
  } else if (mousePressed.value) {
    makeWall(node);
  }
};

const mouseOut = (node) => {
  if (props.isMobile || viz.value) return;

  const element = document.getElementById(node.id);
  if (!element) return;

  if (moveStart.value) {
    if (node.col === startX.value && node.row === startY.value) {
      element.className = "start dragging-origin";
    } else {
      element.className =
        prevNodeClass.value === "start" ? "box" : prevNodeClass.value;
    }
  } else if (moveEnd.value) {
    if (node.col === endX.value && node.row === endY.value) {
      element.className = "end dragging-origin";
    } else {
      element.className =
        prevNodeClass.value === "end" ? "box" : prevNodeClass.value;
    }
  }
};

const mouseDown = (node) => {
  if (viz.value) return;

  if (props.isMobile) {
    const currentElement = document.getElementById(node.id);
    if (!currentElement) return;

    if (isMovingStartMobile.value) {
      // Allow placing on walls, but not on the end node.
      if (node.isEnd) return;

      // Clear old start
      grid.value[startX.value][startY.value].isStart = false;
      const oldStartEl = document.getElementById(
        `Node-${startX.value}-${startY.value}`
      );
      if (oldStartEl) oldStartEl.className = "box";

      // Set new start
      startX.value = node.col;
      startY.value = node.row;
      grid.value[startX.value][startY.value].isStart = true;
      grid.value[startX.value][startY.value].isWall = false; // Ensure it's not a wall
      grid.value[startX.value][startY.value].ddist = 0;
      currentElement.className = "start";
      clearSelectedForMoveMobile();
    } else if (isMovingEndMobile.value) {
      // Allow placing on walls, but not on the start node.
      if (node.isStart) return;

      // Clear old end
      grid.value[endX.value][endY.value].isEnd = false;
      const oldEndEl = document.getElementById(
        `Node-${endX.value}-${endY.value}`
      );
      if (oldEndEl) oldEndEl.className = "box";

      // Set new end
      endX.value = node.col;
      endY.value = node.row;
      grid.value[endX.value][endY.value].isEnd = true;
      grid.value[endX.value][endY.value].isWall = false; // Ensure it's not a wall
      currentElement.className = "end";
      clearSelectedForMoveMobile();
    } else {
      // Not moving a node, select or draw wall
      if (node.isStart) {
        isMovingStartMobile.value = true;
        isMovingEndMobile.value = false;
        currentElement.classList.add("selected-for-move");
      } else if (node.isEnd) {
        isMovingEndMobile.value = true;
        isMovingStartMobile.value = false;
        currentElement.classList.add("selected-for-move");
      } else {
        mousePressed.value = true;
        makeWall(node);
      }
    }
  } else {
    // Desktop drag logic
    let element = document.getElementById(node.id);
    if (!element) return;
    if (element.className === "start") {
      moveStart.value = true;
      element.classList.add("dragging-origin"); // Add opacity class
    } else if (element.className === "end") {
      moveEnd.value = true;
      element.classList.add("dragging-origin"); // Add opacity class
    } else {
      mousePressed.value = true;
      makeWall(node);
    }
  }
};

const mouseUp = (node) => {
  if (props.isMobile) {
    mousePressed.value = false;
  } else {
    if (moveStart.value) {
      const oldStartX = startX.value;
      const oldStartY = startY.value;
      // Check if old start exists in grid data and visually reset it
      if (grid.value[oldStartX] && grid.value[oldStartX][oldStartY]) {
        grid.value[oldStartX][oldStartY].isStart = false;
        const oldStartElement = document.getElementById(
          `Node-${oldStartX}-${oldStartY}`
        );
        if (oldStartElement) {
          oldStartElement.className = "box"; // Reset visual class
          oldStartElement.classList.remove("dragging-origin"); // Remove opacity class
        }
      }
      // Update coordinates to new node
      startX.value = node.col;
      startY.value = node.row;
      // Update new start node data & visual
      grid.value[startX.value][startY.value].isStart = true;
      grid.value[startX.value][startY.value].ddist = 0;
      document.getElementById(node.id).className = "start";
      moveStart.value = false;
    } else if (moveEnd.value) {
      const oldEndX = endX.value;
      const oldEndY = endY.value;
      // Check if old end exists in grid data and visually reset it
      if (grid.value[oldEndX] && grid.value[oldEndX][oldEndY]) {
        grid.value[oldEndX][oldEndY].isEnd = false;
        const oldEndElement = document.getElementById(
          `Node-${oldEndX}-${oldEndY}`
        );
        if (oldEndElement) {
          oldEndElement.className = "box"; // Reset visual class
          oldEndElement.classList.remove("dragging-origin"); // Remove opacity class
        }
      }
      // Update coordinates to new node
      endX.value = node.col;
      endY.value = node.row;
      // Update new end node data & visual
      grid.value[endX.value][endY.value].isEnd = true;
      document.getElementById(node.id).className = "end";
      moveEnd.value = false;
    }
    mousePressed.value = false;
  }
};

const makeWall = (node) => {
  let element = document.getElementById(node.id);
  if (!element || node.isStart || node.isEnd || viz.value) {
    return;
  }
  // Check underlying data first, then update class
  if (grid.value[node.col][node.row].isWall) {
    element.className = "box";
    grid.value[node.col][node.row].isWall = false;
  } else {
    element.className = "wall";
    grid.value[node.col][node.row].isWall = true;
  }
};

const setStart = () => {
  if (grid.value[startX.value] && grid.value[startX.value][startY.value]) {
    let node = grid.value[startX.value][startY.value];
    node.isStart = true;
    node.ddist = 0;
    const element = document.getElementById(node.id);
    if (element) element.className = "start";
  }
};

const setEnd = () => {
  if (grid.value[endX.value] && grid.value[endX.value][endY.value]) {
    let node = grid.value[endX.value][endY.value];
    node.isEnd = true;
    const element = document.getElementById(node.id);
    if (element) element.className = "end";
  }
};

const createNode = (row, col) => {
  // Always create a generic node.
  // isStart, isEnd, and ddist for start node are handled by setStart()/setEnd()
  return {
    col,
    row,
    isStart: false,
    isEnd: false,
    isWall: false,
    visited: false,
    ref: `Node-${col}-${row}`,
    id: `Node-${col}-${row}`,
    parent: null,
    ddist: Number.POSITIVE_INFINITY,
    g: Number.POSITIVE_INFINITY,
    h: Number.POSITIVE_INFINITY,
    f: Number.POSITIVE_INFINITY,
    closed: false,
  };
};

const resetGrid = async () => {
  viz.value = false;
  buttonDisable.value = true; // Disable buttons during reset
  clearSelectedForMoveMobile();
  await updateGridDimensionsAndInitialize(); // This recalculates dimensions, calls initGrid, setStart, setEnd

  // After updateGridDimensionsAndInitialize, the grid data (isWall, etc.) is fresh
  // but we need to ensure all visual styles reflect this, beyond just start/end.
  for (let c = 0; c < colNum.value; c++) {
    for (let r = 0; r < rowNum.value; r++) {
      if (grid.value[c] && grid.value[c][r]) {
        let node = grid.value[c][r];
        const element = document.getElementById(node.id);
        if (element) {
          if (node.isStart) {
            element.className = "start";
          } else if (node.isEnd) {
            element.className = "end";
          } else if (node.isWall) {
            // Should be false after initGrid called by update...
            element.className = "wall"; // This case should ideally not happen if initGrid is correct
          } else {
            element.className = "box";
          }
        }
      }
    }
  }
  enableButtons();
};

const resetVis = () => {
  viz.value = false;
  clearSelectedForMoveMobile();
  for (let c = 0; c < colNum.value; c++) {
    for (let r = 0; r < rowNum.value; r++) {
      if (grid.value[c] && grid.value[c][r]) {
        let node = grid.value[c][r];
        let element = document.getElementById(node.id);
        if (!element) continue;

        node.visited = false;
        node.closed = false;
        node.parent = null; // Important for re-running algos
        // ddist, f, g, h are reset here for non-start/end nodes
        if (!node.isStart) node.ddist = Number.POSITIVE_INFINITY;
        else node.ddist = 0;
        node.f = Number.POSITIVE_INFINITY;
        node.g = Number.POSITIVE_INFINITY;
        node.h = Number.POSITIVE_INFINITY;

        if (node.isStart) {
          element.className = "start";
        } else if (node.isEnd) {
          element.className = "end";
        } else if (!node.isWall) {
          element.className = "box";
        }
        // Walls remain walls visually and in data
      }
    }
  }
  enableButtons();
};

const runAlgorithm = (algoFunction, ...args) => {
  if (viz.value || buttonDisable.value) return;
  clearSelectedForMoveMobile();
  resetVis(); // Clear previous visualization before starting a new one
  disableButtons();
  viz.value = true;

  const pathAnimations = [];
  try {
    algoFunction(
      grid.value,
      startX.value,
      startY.value,
      endX.value,
      endY.value,
      pathAnimations,
      rowNum.value,
      colNum.value,
      ...args
    );
  } catch (err) {
    enableButtons();
    viz.value = false;
    return;
  }

  let animationTimeout = 0;
  for (let i = 0; i < pathAnimations.length; i++) {
    animationTimeout = (i + 1) * animSpeed.value;
    const animationStep = pathAnimations[i];
    if (!animationStep) continue;

    const command = animationStep[0];
    const x = animationStep[1];
    const y = animationStep[2];
    let current;
    try {
      current = grid.value[x][y];
    } catch (err) {
      continue;
    }

    if (current.isStart || current.isEnd) continue; // Don't animate start/end nodes themselves

    setTimeout(() => {
      const el = document.getElementById(current.id);
      if (el) {
        if (command === "curr" || command === "visit") {
          el.className = "visited";
        } else if (command === "path") {
          el.className = "path";
        } else if (command === "fringe") {
          el.className = "fringe";
        }
      }
    }, i * animSpeed.value);
  }

  setTimeout(() => {
    enableButtons();
    viz.value = false;
    // Optionally check if path was found (e.g., grid.value[endX.value][endY.value].parent)
  }, animationTimeout + animSpeed.value);
};

const depthFirstButton = () => {
  // DFS might not use endX, endY but pass them for consistency if runAlgorithm expects them
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) =>
    dfs(sX, sY, grid, anims, rN, cN)
  );
};

const breadthFirstButton = () => {
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) =>
    bfs(sX, sY, grid, anims, rN, cN)
  );
};

const dijkstraButton = () => {
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) => {
    const pq = []; // Create the priority queue instance/array here
    dijkstra(grid, sX, sY, anims, pq, rN, cN);
  });
};

const aStarButton = () => {
  runAlgorithm(aStar); // aStar uses all standard parameters
};

const generateRandomMaze = async () => {
  if (viz.value || buttonDisable.value) return; // Prevent generation during visualization or if disabled

  disableButtons(); // Disable buttons during generation
  clearWallsAndVisualization(); // Clear walls/viz but keep start/end positions
  await nextTick(); // Allow DOM to update after clearing

  // Now, randomly add walls
  const wallProbability = 0.3; // Adjust probability as needed
  for (let c = 0; c < colNum.value; c++) {
    for (let r = 0; r < rowNum.value; r++) {
      if (grid.value[c] && grid.value[c][r]) {
        let node = grid.value[c][r];
        // Only add walls if it's not the *current* start or end node
        if (
          !(node.col === startX.value && node.row === startY.value) &&
          !(node.col === endX.value && node.row === endY.value)
        ) {
          if (Math.random() < wallProbability) {
            node.isWall = true;
            const element = document.getElementById(node.id);
            if (element) element.className = "wall";
          }
        }
      }
    }
  }
  enableButtons(); // Re-enable buttons after maze generation
};

// Make sure your imported algorithm functions (dfs, bfs, dijkstra, aStar)
// are adapted to:
// 1. Accept parameters like: (grid, startX, startY, endX, endY, animationsArray, numRows, numCols, ...anyOtherSpecificParams)
//    - Not all algos use endX/endY (like DFS, BFS for just traversal), adjust wrappers if needed.
// 2. Push [command, col, row] tuples into the animationsArray they receive.
//    - e.g., animationsArray.push(["curr", currentX, currentY]);
//    - e.g., animationsArray.push(["path", pathNodeX, pathNodeY]);
// 3. NOT try to directly manipulate DOM or use global/component animation arrays.
// 4. Correctly update node properties like .parent, .ddist, .g, .h, .f, .closed as needed for their logic.
</script>
<style lang="scss" scoped>
@use "sass:color";
@use "~/assets/main.scss" as *; // Ensure this path is correct

.button-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center; // Also center horizontally within the span
  gap: 5px;
  flex: 1;
  min-height: 0;
  overflow-y: hidden;
  box-sizing: border-box;
}

.path-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-height: 0;
  overflow-y: hidden;
  box-sizing: border-box;

  .function-buttons {
    padding: 1rem;
    padding-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .graph-action {
    border: 1px solid $gunmetal;
    width: fit-content;
    display: flex;
    justify-content: center;
    transform: rotateX(180deg);
    box-sizing: border-box;
  }

  @media screen and (min-width: 769px) {
    // Or your preferred desktop breakpoint
    .graph-action {
      order: 2; // Content comes after buttons on desktop
    }
    .function-buttons {
      order: 1; // Buttons come first on desktop
    }
  }
}

.col {
  display: flex;
  flex-direction: column;
}

.toolbar-button {
  margin: 10px;
  background-color: $gunmetal;
  border: none;
  color: $white-smoke;
  padding: 8px 14px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;

  &:disabled {
    background-color: color.adjust($gunmetal, $lightness: 20%);
    cursor: not-allowed;
  }
}

.toolbar-button:hover:not(:disabled) {
  background-color: color.adjust($chestnut, $lightness: -10%) !important;
}

.reset-grid-button,
.reset-vis-button {
  background-color: $chestnut !important;
}

.reset-grid-button:hover:not(:disabled),
.reset-vis-button:hover:not(:disabled) {
  background-color: color.adjust($chestnut, $lightness: -10%) !important;
}

@media screen and (max-width: 768px) {
  .path-container {
    justify-content: flex-start;
    align-items: stretch;

    .function-buttons {
      padding-bottom: 0.5rem;
      padding-top: 0.5rem;
      .toolbar-button {
        margin: 5px;
      }
    }

    .graph-action {
      flex: 1;
      min-height: 0;
      margin: 10px;
      overflow: hidden;
      width: auto;
      border: 0px;
    }
  }
}

:deep(.selected-for-move) {
  outline: 2px solid $mantis !important;
  outline-offset: -2px;
}

.dragging-origin {
  opacity: 0.5;
  transition: opacity 0.2s ease; /* Optional: smooth transition */
}
</style>