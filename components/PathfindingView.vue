<template>
  <ClientOnly>
    <div class="path-container fade-in">
      <div class="function-buttons">
        <button
          class="toolbar-button reset-grid-button"
          :disabled="buttonDisable"
          v-on:click="resetGrid"
        >
          Reset Grid
        </button>
        <button
          class="toolbar-button reset-vis-button"
          :disabled="buttonDisable"
          v-on:click="resetVis"
        >
          Reset Visualization
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="depthFirstButton"
        >
          Depth First
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="breadthFirstButton"
        >
          Breadth First
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="dijkstraButton"
        >
          Dijkstra's
        </button>
        <button
          class="toolbar-button"
          :disabled="buttonDisable"
          v-on:click="aStarButton"
        >
          A*
        </button>
      </div>
      <div class="graph-action" ref="graphActionRef">
        <div class="col" v-for="(col, index) in grid" :key="index">
          <GridNode
            v-for="node in col"
            :key="node.id"
            :id="node.id"
            :ref="node.ref"
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
    </div>
  </ClientOnly>
</template>
<script setup>
import { onMounted, ref, nextTick, defineProps } from "vue";
import GridNode from "~/components/GridNode.vue";

// Define props
const props = defineProps({
  isMobile: {
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


const updateGridDimensionsAndInitialize = async () => {
  // Visual cleanup of any lingering start/end classes from a previous render cycle
  // This is important if this function runs multiple times during initialization (e.g. mobile with setTimeout)
  if (grid.value && grid.value.length > 0 && grid.value[0].length > 0 && graphActionRef.value) {
    // Use the *current* (potentially old) colNum/rowNum to iterate existing DOM if it exists
    // This relies on colNum and rowNum reflecting the state of the currently rendered grid
    // or using a broad sweep if they are not reliable (e.g. querySelectorAll)
     const existingCols = graphActionRef.value.querySelectorAll('.col');
     existingCols.forEach(colElement => {
       const nodes = colElement.querySelectorAll('.box, .start, .end, .wall, .visited, .path, .fringe'); // Query all possible node states
       nodes.forEach(nodeElement => {
         if (nodeElement.classList.contains('start') || nodeElement.classList.contains('end')) {
            nodeElement.className = 'box';
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
    await nextTick();
    const graphEl = graphActionRef.value;
    if (graphEl && graphEl.clientHeight > 0 && graphEl.clientWidth > 0) {
      const availableHeight = graphEl.clientHeight;
      const availableWidth = graphEl.clientWidth;

      const newRowNum = Math.max(1, Math.floor(availableHeight / NODE_SIZE));
      const newColNum = Math.max(1, Math.floor(availableWidth / NODE_SIZE));

      rowNum.value = newRowNum;
      colNum.value = newColNum;

      startX.value = Math.max(0, Math.min(Math.floor(newColNum / 4), newColNum - 1));
      startY.value = Math.max(0, Math.min(Math.floor(newRowNum / 2), newRowNum - 1));
      endX.value = Math.max(0, Math.min(Math.floor(newColNum * 3 / 4), newColNum - 1));
      endY.value = Math.max(0, Math.min(Math.floor(newRowNum / 2), newRowNum - 1));
      
      if (newColNum <= 1 || newRowNum <= 1) { // Handle very small grids
         startX.value = 0;
         startY.value = 0;
         endX.value = Math.max(0, newColNum -1);
         endY.value = Math.max(0, newRowNum-1);
      }

      if (startX.value === endX.value && startY.value === endY.value) {
        if (newColNum > 1) {
          endX.value = Math.min(startX.value + 1, newColNum - 1);
        } else if (newRowNum > 1) {
           endY.value = Math.min(startY.value + 1, newRowNum - 1);
        }
      }
    } else {
      rowNum.value = MOBILE_FALLBACK_ROWS;
      colNum.value = MOBILE_FALLBACK_COLS;
      startX.value = MOBILE_FALLBACK_START_X;
      startY.value = MOBILE_FALLBACK_START_Y;
      endX.value = MOBILE_FALLBACK_END_X;
      endY.value = MOBILE_FALLBACK_END_Y;
    }
  }
  initGrid();
  await nextTick(); // Ensure grid DOM is created before setting start/end classes
  setStart();
  setEnd();
};

onMounted(async () => {
  await updateGridDimensionsAndInitialize(); // Initial attempt

  if (props.isMobile) {
    // On mobile, sometimes the initial dimensions are not yet stable due to browser rendering flow.
    // A small delay can help ensure we get the final dimensions.
    setTimeout(async () => {
      await updateGridDimensionsAndInitialize();
    }, 100); // 100ms delay, can be adjusted
  }
});

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

const disableButtons = () => { buttonDisable.value = true; };
const enableButtons = () => { buttonDisable.value = false; };

const clearSelectedForMoveMobile = () => {
    const oldStartNodeEl = document.getElementById(`Node-${startX.value}-${startY.value}`);
    if (oldStartNodeEl) oldStartNodeEl.classList.remove('selected-for-move');
    const oldEndNodeEl = document.getElementById(`Node-${endX.value}-${endY.value}`);
    if (oldEndNodeEl) oldEndNodeEl.classList.remove('selected-for-move');
    isMovingStartMobile.value = false;
    isMovingEndMobile.value = false;
};

const mouseEnter = (node) => {
  if (props.isMobile || viz.value) return; 

  prevNodeClass.value = document.getElementById(node.id)?.className || 'box';
  if (moveStart.value && grid.value[node.col] && grid.value[node.col][node.row]) {
    document.getElementById(node.id).className = "start";
  } else if (moveEnd.value && grid.value[node.col] && grid.value[node.col][node.row]) {
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
      element.className = "start"; 
    } else {
      element.className = prevNodeClass.value === "start" ? "box" : prevNodeClass.value;
    }
  } else if (moveEnd.value) {
     if (node.col === endX.value && node.row === endY.value) {
      element.className = "end"; 
    } else {
      element.className = prevNodeClass.value === "end" ? "box" : prevNodeClass.value;
    }
  }
};

const mouseDown = (node) => {
  if (viz.value) return;

  if (props.isMobile) {
    const currentElement = document.getElementById(node.id);
    if (!currentElement) return;

    if (isMovingStartMobile.value) {
      if (node.isEnd || node.isWall) return; 
      
      grid.value[startX.value][startY.value].isStart = false;
      const oldStartEl = document.getElementById(`Node-${startX.value}-${startY.value}`);
      if(oldStartEl) oldStartEl.className = "box";
      
      startX.value = node.col;
      startY.value = node.row;
      grid.value[startX.value][startY.value].isStart = true;
      grid.value[startX.value][startY.value].ddist = 0; 
      currentElement.className = "start";
      clearSelectedForMoveMobile();
    } else if (isMovingEndMobile.value) {
      if (node.isStart || node.isWall) return; 
      
      grid.value[endX.value][endY.value].isEnd = false;
      const oldEndEl = document.getElementById(`Node-${endX.value}-${endY.value}`);
      if(oldEndEl) oldEndEl.className = "box";
      
      endX.value = node.col;
      endY.value = node.row;
      grid.value[endX.value][endY.value].isEnd = true;
      currentElement.className = "end";
      clearSelectedForMoveMobile();
    } else { 
      if (node.isStart) {
        isMovingStartMobile.value = true;
        isMovingEndMobile.value = false; 
        currentElement.classList.add('selected-for-move');
      } else if (node.isEnd) {
        isMovingEndMobile.value = true;
        isMovingStartMobile.value = false; 
        currentElement.classList.add('selected-for-move');
      } else { 
        mousePressed.value = true;
        makeWall(node);
      }
    }
  } else { // Desktop drag logic
    let element = document.getElementById(node.id);
    if (!element) return;
    if (element.className === "start") {
      moveStart.value = true;
    } else if (element.className === "end") {
      moveEnd.value = true;
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
      if(grid.value[startX.value] && grid.value[startX.value][startY.value]) { // Check if old start exists
        grid.value[startX.value][startY.value].isStart = false;
      }
      startX.value = node.col;
      startY.value = node.row;
      grid.value[startX.value][startY.value].isStart = true;
      grid.value[startX.value][startY.value].ddist = 0; 
      document.getElementById(node.id).className = "start";
      moveStart.value = false;
    } else if (moveEnd.value) {
      if(grid.value[endX.value] && grid.value[endX.value][endY.value]) { // Check if old end exists
         grid.value[endX.value][endY.value].isEnd = false;
      }
      endX.value = node.col;
      endY.value = node.row;
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
    else console.error(`Element with ID ${node.id} not found for setStart`);
  } else {
    console.error("Start node position out of bounds:", startX.value, startY.value, colNum.value, rowNum.value);
  }
};

const setEnd = () => {
 if (grid.value[endX.value] && grid.value[endX.value][endY.value]) {
    let node = grid.value[endX.value][endY.value];
    node.isEnd = true;
    const element = document.getElementById(node.id);
    if (element) element.className = "end";
    else console.error(`Element with ID ${node.id} not found for setEnd`);
  } else {
    console.error("End node position out of bounds:", endX.value, endY.value, colNum.value, rowNum.value);
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
            element.className = 'start';
          } else if (node.isEnd) {
            element.className = 'end';
          } else if (node.isWall) { // Should be false after initGrid called by update...
             element.className = 'wall'; // This case should ideally not happen if initGrid is correct
          } else {
            element.className = 'box';
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
        if (!node.isStart) node.ddist = Number.POSITIVE_INFINITY; else node.ddist = 0;
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
    algoFunction(grid.value, startX.value, startY.value, endX.value, endY.value, pathAnimations, rowNum.value, colNum.value, ...args);
  } catch (err) {
    console.error(`Error in ${algoFunction.name}:`, err);
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
    } catch (err) { continue; }

    if (current.isStart || current.isEnd) continue; // Don't animate start/end nodes themselves

    setTimeout(() => {
      const el = document.getElementById(current.id);
      if(el) {
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
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) => dfs(sX, sY, grid, anims, rN, cN));
};

const breadthFirstButton = () => {
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) => bfs(sX, sY, grid, anims, rN, cN));
};

const dijkstraButton = () => {
  runAlgorithm((grid, sX, sY, _eX, _eY, anims, rN, cN) => dijkstra(grid, sX, sY, anims, rN, cN));
};

const aStarButton = () => {
  runAlgorithm(aStar); // aStar uses all standard parameters
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

.path-container {
  display: flex;
  flex-direction: column;
  align-items: center; 
  flex: 1;
  min-height: 0; 
  overflow-y: hidden; 
  box-sizing: border-box;

  .function-buttons {
    padding-bottom: 1rem; 
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 0; 
  }

  .graph-action {
    border: 1px solid $gunmetal;
    width: fit-content; 
    display: flex; 
    transform: rotateX(180deg); 
    box-sizing: border-box;
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
  font-size: 15px; 
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;

  &:disabled {
    background-color: lighten($gunmetal, 20%);
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
      .toolbar-button {
        margin: 5px;
        padding: 6px 10px;
        font-size: 12px; 
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

</style>