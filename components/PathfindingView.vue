<template>
  <ClientOnly>
    <div class="path-container fade-in">
      <div
        class="graph-action"
        ref="graphActionRef"
        :class="{ visible: isGridRendered }"
      >
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
import {
  onMounted,
  ref,
  nextTick,
  defineProps,
  watch,
  defineEmits,
  defineExpose,
} from "vue";
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

const emit = defineEmits(["grid-loaded", "grid-size-determined"]);

const NODE_SIZE = 26; // Re-introduced for dynamic fitting

// Define Desktop and Mobile constants (Mobile ones are fallbacks if dynamic sizing fails)
const DESKTOP_ROWS = 80;
const DESKTOP_COLS = 80;
const DESKTOP_START_X = 30;
const DESKTOP_START_Y = 20;
const DESKTOP_END_X = 40;
const DESKTOP_END_Y = 20;

const TABLET_ROWS = 25;
const TABLET_COLS = 35;
const TABLET_START_X = 5;
const TABLET_START_Y = 12;
const TABLET_END_X = 25;
const TABLET_END_Y = 12;

const MOBILE_ROWS = 20;
const MOBILE_COLS = 14;
const MOBILE_START_X = 2;
const MOBILE_START_Y = 9;
const MOBILE_END_X = 11;
const MOBILE_END_Y = 9;

// Fallback (if window.innerWidth is somehow 0 or not available initially)
const FALLBACK_ROWS = 20;
const FALLBACK_COLS = 10;
const FALLBACK_START_X = 2;
const FALLBACK_START_Y = 9;
const FALLBACK_END_X = 7;
const FALLBACK_END_Y = 9;

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

const gridInitializing = ref(true);
const isGridRendered = ref(false);

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
  // Clear existing visual nodes first
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
  await nextTick(); // Wait for DOM to reflect cleared nodes

  const graphEl = graphActionRef.value;
  if (!graphEl) {
    rowNum.value = FALLBACK_ROWS;
    colNum.value = FALLBACK_COLS;
    startX.value = FALLBACK_START_X;
    startY.value = FALLBACK_START_Y;
    endX.value = FALLBACK_END_X;
    endY.value = FALLBACK_END_Y;
    initGrid();
    await nextTick();
    setStart();
    setEnd();
    isGridRendered.value = true;
    return; // Exit if graphEl is not ready
  }

  let availableDrawingWidth;
  let availableDrawingHeight;
  let targetDesiredCols, targetDesiredRows;

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const geStyle = window.getComputedStyle(graphEl);

  let sizeCategory = "large"; // Default to large
  if (screenWidth <= 480) {
    sizeCategory = "small";
  } else if (screenWidth <= 768) {
    sizeCategory = "medium";
  }
  emit("grid-size-determined", sizeCategory);

  if (screenWidth > 768) {
    // Desktop
    targetDesiredCols = DESKTOP_COLS;
    targetDesiredRows = DESKTOP_ROWS;
    const pathContainerEl = graphEl.parentElement;
    if (pathContainerEl) {
      const pcStyle = window.getComputedStyle(pathContainerEl);
      const pcPaddingX =
        parseFloat(pcStyle.paddingLeft) + parseFloat(pcStyle.paddingRight);
      const pcPaddingY =
        parseFloat(pcStyle.paddingTop) + parseFloat(pcStyle.paddingBottom);

      availableDrawingWidth = pathContainerEl.clientWidth - pcPaddingX;

      let buttonsHeight = 0;
      const buttonsContainer =
        pathContainerEl.querySelector(".function-buttons");
      if (buttonsContainer) {
        const btnStyle = window.getComputedStyle(buttonsContainer);
        buttonsHeight =
          buttonsContainer.offsetHeight +
          parseFloat(btnStyle.marginTop) +
          parseFloat(btnStyle.marginBottom);
      }
      availableDrawingHeight =
        pathContainerEl.clientHeight - pcPaddingY - buttonsHeight;

      availableDrawingWidth -=
        parseFloat(geStyle.borderLeftWidth) +
        parseFloat(geStyle.borderRightWidth);
      availableDrawingHeight -=
        parseFloat(geStyle.borderTopWidth) +
        parseFloat(geStyle.borderBottomWidth);
    } else {
      availableDrawingWidth = screenWidth * 0.8; // Fallback available space
      availableDrawingHeight = window.innerHeight * 0.6;
    }
  } else {
    // Tablet & Mobile
    if (screenWidth > 480) {
      // Tablet
      targetDesiredCols = TABLET_COLS;
      targetDesiredRows = TABLET_ROWS;
    } else {
      // Mobile (screenWidth > 0)
      targetDesiredCols = MOBILE_COLS;
      targetDesiredRows = MOBILE_ROWS;
    }
    const pathContainerEl = graphEl.parentElement;
    if (pathContainerEl) {
      const buttonsContainer =
        pathContainerEl.querySelector(".function-buttons");
      let buttonsFullHeight = 0;
      if (buttonsContainer) {
        const btnStyle = window.getComputedStyle(buttonsContainer);
        buttonsFullHeight =
          buttonsContainer.offsetHeight +
          parseFloat(btnStyle.marginTop) +
          parseFloat(btnStyle.marginBottom);
      }
      const geMarginsY =
        parseFloat(geStyle.marginTop) + parseFloat(geStyle.marginBottom);
      availableDrawingHeight =
        pathContainerEl.clientHeight - buttonsFullHeight - geMarginsY;
      availableDrawingWidth = graphEl.clientWidth; // Mobile graphEl width is usually fine
      // Mobile graphEl has no border defined in its style, so not subtracting it here.
    } else {
      availableDrawingWidth = screenWidth * 0.9; // Fallback available space
      availableDrawingHeight = window.innerHeight * 0.7;
    }
  }
  // Fallback if targetDesiredCols/Rows were not set (e.g. screenWidth was 0)
  if (!targetDesiredCols || targetDesiredCols <= 0) {
    targetDesiredCols = FALLBACK_COLS;
  }
  if (!targetDesiredRows || targetDesiredRows <= 0) {
    targetDesiredRows = FALLBACK_ROWS;
  }

  // Ensure availableDrawing values are positive
  availableDrawingWidth = Math.max(0, availableDrawingWidth || 0);
  availableDrawingHeight = Math.max(0, availableDrawingHeight || 0);

  let maxFitColsCalc = Math.floor(availableDrawingWidth / NODE_SIZE);
  let maxFitRowsCalc = Math.floor(availableDrawingHeight / NODE_SIZE);

  // Conservative adjustment: reduce by 1 to give some breathing room,
  // but don't reduce if it's already at a very small count (e.g., 1).
  const conservativeMaxFitCols =
    maxFitColsCalc > 1 ? maxFitColsCalc - 1 : maxFitColsCalc;
  const conservativeMaxFitRows =
    maxFitRowsCalc > 1 ? maxFitRowsCalc - 1 : maxFitRowsCalc;

  // Ensure they are at least 1 after conservative adjustment
  const finalMaxFitCols = Math.max(1, conservativeMaxFitCols);
  const finalMaxFitRows = Math.max(1, conservativeMaxFitRows);

  let finalCols = Math.min(targetDesiredCols, finalMaxFitCols);
  let finalRows = Math.min(targetDesiredRows, finalMaxFitRows);

  // Ensure final values are not less than fallbacks (and also at least 1)
  finalCols = Math.max(finalCols, FALLBACK_COLS, 1);
  finalRows = Math.max(finalRows, FALLBACK_ROWS, 1);

  colNum.value = finalCols;
  rowNum.value = finalRows;

  // Recalculate Start/End points
  startX.value = Math.max(
    0,
    Math.min(Math.floor(finalCols / 4), finalCols > 0 ? finalCols - 1 : 0)
  );
  startY.value = Math.max(
    0,
    Math.min(Math.floor(finalRows / 2), finalRows > 0 ? finalRows - 1 : 0)
  );
  endX.value = Math.max(
    0,
    Math.min(Math.floor((finalCols * 3) / 4), finalCols > 0 ? finalCols - 1 : 0)
  );
  endY.value = Math.max(
    0,
    Math.min(Math.floor(finalRows / 2), finalRows > 0 ? finalRows - 1 : 0)
  );

  if (finalCols <= 1 || finalRows <= 1) {
    startX.value = 0;
    startY.value = 0;
    endX.value = Math.max(0, finalCols > 0 ? finalCols - 1 : 0);
    endY.value = Math.max(0, finalRows > 0 ? finalRows - 1 : 0);
  }
  if (startX.value === endX.value && startY.value === endY.value) {
    if (finalCols > 1) endX.value = Math.min(startX.value + 1, finalCols - 1);
    else if (finalRows > 1)
      endY.value = Math.min(startY.value + 1, finalRows - 1);
  }
  // Final bounds check for start/end points (redundant if above is correct, but safe)
  startX.value = Math.max(
    0,
    Math.min(startX.value, finalCols > 0 ? finalCols - 1 : 0)
  );
  startY.value = Math.max(
    0,
    Math.min(startY.value, finalRows > 0 ? finalRows - 1 : 0)
  );
  endX.value = Math.max(
    0,
    Math.min(endX.value, finalCols > 0 ? finalCols - 1 : 0)
  );
  endY.value = Math.max(
    0,
    Math.min(endY.value, finalRows > 0 ? finalRows - 1 : 0)
  );

  initGrid();
  await nextTick();
  setStart();
  setEnd();
  isGridRendered.value = true;
};

const tryInitializeGrid = async (attempt = 1) => {
  const maxAttempts = 10;
  const retryDelay = 150;

  if (props.isActive && isMounted.value) {
    await nextTick();
    await waitForStableLayout(attempt, maxAttempts, retryDelay);
  }
};

const waitForStableLayout = async (attempt, maxAttempts, delay) => {
  const graphEl = graphActionRef.value;

  if (!graphEl || !graphEl.parentElement) {
    if (attempt < maxAttempts) {
      setTimeout(
        () => waitForStableLayout(attempt + 1, maxAttempts, delay),
        delay
      );
    } else {
      await updateGridDimensionsAndInitialize();
    }
    return;
  }

  const pathContainerEl = graphEl.parentElement;
  const graphElWidth = graphEl.clientWidth;
  const pathContainerHeight = pathContainerEl.clientHeight;
  const pathContainerWidth = pathContainerEl.clientWidth;

  // Key condition: pathContainerEl MUST have a height. graphEl width is also important.
  if (pathContainerHeight > 0 && graphElWidth > 0 && pathContainerWidth > 0) {
    await updateGridDimensionsAndInitialize();
  } else if (attempt < maxAttempts) {
    setTimeout(
      () => waitForStableLayout(attempt + 1, maxAttempts, delay),
      delay
    );
  } else {
    await updateGridDimensionsAndInitialize();
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
      if (node.isEnd) {
        return;
      }

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
      if (node.isStart) {
        return;
      }

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
    // Desktop drag logic
    if (moveStart.value) {
      const oldStartX = startX.value;
      const oldStartY = startY.value;
      const targetCol = node.col;
      const targetRow = node.row;

      const originalMovingElement = document.getElementById(
        `Node-${oldStartX}-${oldStartY}`
      );

      // Prevent dropping start onto the current end node
      if (targetCol === endX.value && targetRow === endY.value) {
        if (originalMovingElement) {
          originalMovingElement.className = "start"; // Restore class
          originalMovingElement.classList.remove("dragging-origin");
        }
        moveStart.value = false;
        mousePressed.value = false;
        return; // Exit early
      }

      // Clear old start properties if it's a different node
      if (!(oldStartX === targetCol && oldStartY === targetRow)) {
        if (grid.value[oldStartX] && grid.value[oldStartX][oldStartY]) {
          grid.value[oldStartX][oldStartY].isStart = false;
          const oldStartElement = document.getElementById(
            `Node-${oldStartX}-${oldStartY}`
          );
          if (oldStartElement) oldStartElement.className = "box";
        }
      }

      if (originalMovingElement) {
        originalMovingElement.classList.remove("dragging-origin");
      }

      // Update to new start
      startX.value = targetCol;
      startY.value = targetRow;
      if (grid.value[startX.value] && grid.value[startX.value][startY.value]) {
        grid.value[startX.value][startY.value].isStart = true;
        grid.value[startX.value][startY.value].isWall = false; // Ensure it's not a wall
        grid.value[startX.value][startY.value].ddist = 0;
        const newStartElement = document.getElementById(node.id);
        if (newStartElement) newStartElement.className = "start";
      }
      moveStart.value = false;
    } else if (moveEnd.value) {
      const oldEndX = endX.value;
      const oldEndY = endY.value;
      const targetCol = node.col;
      const targetRow = node.row;

      const originalMovingElement = document.getElementById(
        `Node-${oldEndX}-${oldEndY}`
      );

      // Prevent dropping end onto the current start node
      if (targetCol === startX.value && targetRow === startY.value) {
        if (originalMovingElement) {
          originalMovingElement.className = "end"; // Restore class
          originalMovingElement.classList.remove("dragging-origin");
        }
        moveEnd.value = false;
        mousePressed.value = false;
        return; // Exit early
      }

      // Clear old end properties if it's a different node
      if (!(oldEndX === targetCol && oldEndY === targetRow)) {
        if (grid.value[oldEndX] && grid.value[oldEndX][oldEndY]) {
          grid.value[oldEndX][oldEndY].isEnd = false;
          const oldEndElement = document.getElementById(
            `Node-${oldEndX}-${oldEndY}`
          );
          if (oldEndElement) oldEndElement.className = "box";
        }
      }

      if (originalMovingElement) {
        originalMovingElement.classList.remove("dragging-origin");
      }

      // Update to new end
      endX.value = targetCol;
      endY.value = targetRow;
      if (grid.value[endX.value] && grid.value[endX.value][endY.value]) {
        grid.value[endX.value][endY.value].isEnd = true;
        grid.value[endX.value][endY.value].isWall = false; // Ensure it's not a wall
        const newEndElement = document.getElementById(node.id);
        if (newEndElement) newEndElement.className = "end";
      }
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
  gridInitializing.value = true; // Show loading indicator
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
          let oldClassName = element.className;
          if (node.isStart) {
            element.className = "start";
          } else if (node.isEnd) {
            element.className = "end";
          } else if (node.isWall) {
            element.className = "wall";
          } else {
            element.className = "box";
          }
        }
      }
    }
  }
  enableButtons();
  gridInitializing.value = false; // Hide loading indicator AFTER all reset operations
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
        } else if (node.isWall) {
          element.className = "wall";
        } else {
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

const triggerGridRecalculation = async () => {
  // Assuming isActive and isMounted are still appropriate
  // Resetting attempt to 1 for a fresh try
  if (props.isActive && isMounted.value) {
    await tryInitializeGrid(1);
  } else {
  }
};

// Expose methods to parent
defineExpose({
  resetGrid,
  triggerGridRecalculation, // Exposed the new method
});
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
    opacity: 0; /* Initially hidden */
    transition: opacity 0.5s ease-in-out; /* Transition for fade-in */
  }

  .graph-action.visible {
    opacity: 1; /* Visible state */
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