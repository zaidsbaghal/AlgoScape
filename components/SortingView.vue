<template>
  <div class="sort-container fade-in">
    <div class="active-window">
      <div class="array-container">
        <div
          class="array-bar"
          v-for="(value, index) in array"
          :key="index"
          :style="{ height: `${value * heightFactor}` + 'px' }"
        ></div>
      </div>
    </div>
    <div class="function-buttons">
      <button
        class="toolbar-button generate-button"
        v-on:click="genArray"
        :disabled="buttonDisable"
      >
        <span class="button-content-wrapper">
          <Icon name="ion:stats-chart-sharp" style="vertical-align: middle" />
          Generate
        </span>
      </button>
      <button
        class="toolbar-button reset-button"
        v-on:click="resetArray"
        :disabled="buttonDisable"
      >
        <span class="button-content-wrapper">
          <Icon name="ion:refresh-outline" style="vertical-align: middle" />
          Reset
        </span>
      </button>
      <button
        class="toolbar-button"
        v-on:click="mergeSortButton"
        :disabled="buttonDisable"
      >
        Merge
      </button>
      <button
        class="toolbar-button"
        v-on:click="quickSortButton"
        :disabled="buttonDisable"
      >
        Quick
      </button>
      <button
        class="toolbar-button"
        v-on:click="bubbleSortButton"
        :disabled="buttonDisable"
      >
        Bubble
      </button>
      <button
        class="toolbar-button"
        v-on:click="selectionSortButton"
        :disabled="buttonDisable"
      >
        Selection
      </button>
      <button
        class="toolbar-button"
        v-on:click="insertionSortButton"
        :disabled="buttonDisable"
      >
        Insertion
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, defineProps } from "vue";
import { mergeSort } from "~/composables/MergeSort.ts";
import { quickSort } from "~/composables/QuickSort.ts";
import { bubbleSort } from "~/composables/BubbleSort.ts";
import { selectionSort } from "~/composables/SelectionSort.ts";
import { insertionSort } from "~/composables/InsertionSort.ts";

const array = ref([]);
const animations = ref([]);
const defaultArr = ref([]);
const sorted = ref(false);
const animSpeed = ref(1);
const buttonDisable = ref(false);
const nuxtApp = useNuxtApp();
const loading = ref(false);

// Define props
const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const genArray = () => {
  if (buttonDisable.value === true) {
    return;
  }
  // Check if something is running
  colorReset();
  newArray();
  const bars = document.getElementsByClassName("array-bar");
  const factor = heightFactor.value; // Assuming heightFactor is a computed property
  for (let i = 0; i < array.value.length; i++) {
    bars[i].style.height = `${array.value[i] * factor}px`; // Adjust the height value using the factor
  }
};

const resetArray = () => {
  if (buttonDisable.value === true) {
    return;
  }
  // Check if something is running
  colorReset();
  array.value = defaultArr.value.slice(0);

  // Update the heights of the bars in the DOM
  const bars = document.getElementsByClassName("array-bar");
  const factor = heightFactor.value; // Assuming heightFactor is a computed property
  for (let i = 0; i < array.value.length; i++) {
    bars[i].style.height = `${array.value[i] * factor}px`; // Adjust the height value using the factor
  }

  animations.value = [];
  sorted.value = false;
};

const disableButtons = () => {
  buttonDisable.value = true;
};

const enableButtons = () => {
  buttonDisable.value = false;
};

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const colorReset = () => {
  const bars = document.getElementsByClassName("array-bar");
  for (let i = 0; i < array.value.length; i++) {
    bars[i].style.backgroundColor = "#264653";
  }
};

const newArray = () => {
  sorted.value = false;
  array.value = [];

  const numBars = props.isMobile ? 40 : 80; // Use prop to set number of bars

  for (let i = 0; i < numBars; i++) {
    array.value[i] = randomIntFromInterval(50, 999);
  }

  animations.value = [];
  defaultArr.value = array.value.slice(0); // set default array
};

const heightFactor = computed(() => {
  if (props.isMobile) {
    return 0.35; // Keep latest mobile factor
  }
  // Desktop logic remains
  if (typeof window !== "undefined") {
    var mqDesktop = window.matchMedia(
      "(min-device-width: 1200px) and (max-device-width: 1600px)"
    );
    if (mqDesktop.matches) {
      return 0.55;
    }
  }
  return 0.65; // Default desktop factor
});

onBeforeMount(() => {
  newArray(); // Assuming newArray is defined within the component
});

onMounted(async () => {
  setTimeout(
    () =>
      nuxtApp.hook("page:finish", () => {
        loading.value = false;
      }),
    1000
  );
});

// Trigger merge sort animation
const mergeSortButton = () => {
  // If array has already been sorted then return
  if (sorted.value === true || buttonDisable.value === true) {
    return;
  }

  // Disable buttons while running
  disableButtons();

  const result = mergeSort(array.value.slice(), animations.value);
  // let sortedarray = result[0];
  let mergeAnimations = result[1];

  // Display animations
  for (let i = 0; i < mergeAnimations.length; i++) {
    // Get animation variables
    let command = mergeAnimations[i][0];
    const bars = document.getElementsByClassName("array-bar");

    // If we are comparing two elements change their color
    if (command == "curr") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        try {
          bars[idxone].style.backgroundColor = "#22333b";
        } catch (error) {}
      }, i * animSpeed.value);
    } else if (command == "comp") {
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#db9d47";
        bars[idxtwo].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "clear") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        try {
          bars[idx].style.backgroundColor = "#264653";
        } catch (err) {}
      }, i * animSpeed.value);
    } else if (command == "done") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#984334";
      }, i * animSpeed.value);
    } else if (command == "sorted") {
      let idx = mergeAnimations[i][1];
      new Promise((resolve, reject) => {
        setTimeout(function () {
          for (let j = 0; j <= idx; j++) {
            bars[j].style.backgroundColor = "#984334";
          }
          resolve();
        }, i * animSpeed.value);
      }).then(() => {
        animations.value = [];
        enableButtons();
        sorted.value = true; // Set the array to sorted
      });
    } else {
      // swap command
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      let newHeight = mergeAnimations[i][3];
      setTimeout(() => {
        bars[idxone].style.height = `${newHeight * heightFactor.value}px`;
        array.value[idxone] = newHeight; // Replacing the $set call
        bars[idxone].style.backgroundColor = "#264653";
      }, i * animSpeed.value);
    }
  }
};

const quickSortButton = () => {
  // If array has already been sorted then return
  if (sorted.value === true || buttonDisable.value === true) {
    return;
  }

  // Disable buttons while running
  disableButtons();

  const result = quickSort(
    array.value.slice(),
    0,
    array.value.length - 1,
    animations.value
  );
  let mergeAnimations = result[1];

  // Display animations
  for (let i = 0; i < mergeAnimations.length; i++) {
    // Get animation variables
    let command = mergeAnimations[i][0];
    const bars = document.getElementsByClassName("array-bar");

    // If we are comparing two elements change their color
    if (command == "curr") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        try {
          bars[idxone].style.backgroundColor = "#22333b";
        } catch (error) {}
      }, i * animSpeed.value);
    } else if (command == "comp") {
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#db9d47";
        bars[idxtwo].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "clear") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        try {
          bars[idx].style.backgroundColor = "#264653";
        } catch (error) {}
      }, i * animSpeed.value);
    } else if (command == "left") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "right") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#984334";
      }, i * animSpeed.value);
    } else if (command == "sorted") {
      let idx = mergeAnimations[i][1];
      new Promise((resolve, reject) => {
        setTimeout(function () {
          for (let j = 0; j <= idx; j++) {
            bars[j].style.backgroundColor = "#984334";
          }
          resolve();
        }, i * animSpeed.value);
      }).then(() => {
        mergeAnimations.value = [];
        enableButtons();
        sorted.value = true; // Set the array to sorted
      });
    } else {
      // swap command
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      let newHeight = mergeAnimations[i][3];
      setTimeout(() => {
        bars[idxone].style.height = `${newHeight * heightFactor.value}px`;
        array.value[idxone] = newHeight; // Replacing the $set call
        bars[idxone].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    }
  }
};

const bubbleSortButton = () => {
  if (sorted.value === true || buttonDisable.value === true) {
    return;
  }
  // Disable buttons while running
  disableButtons();

  const result = bubbleSort(array.value.slice(), animations.value);
  // let sortedarray = result[0];
  let mergeAnimations = result[1];

  // Display animations
  for (let i = 0; i < mergeAnimations.length; i++) {
    // Get animation variables
    let command = mergeAnimations[i][0];
    const bars = document.getElementsByClassName("array-bar");

    // If we are comparing two elements change their color
    if (command == "curr") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#22333b";
      }, i * animSpeed.value);
    } else if (command == "comp") {
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#db9d47";
        bars[idxtwo].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "clear") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#264653";
      }, i * animSpeed.value);
    } else if (command == "done") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#984334";
      }, i * animSpeed.value);
    } else if (command == "sorted") {
      let idx = mergeAnimations[i][1];
      new Promise((resolve, reject) => {
        setTimeout(function () {
          for (let j = 0; j <= idx; j++) {
            bars[j].style.backgroundColor = "#984334";
          }
          resolve();
        }, i * animSpeed.value);
      }).then(() => {
        mergeAnimations.value = [];
        enableButtons();
        sorted.value = true; // Set the array to sorted
      });
    } else {
      // swap command
      let idx = mergeAnimations[i][1];
      let newHeight = mergeAnimations[i][2];
      setTimeout(() => {
        bars[idx].style.height = `${newHeight * heightFactor.value}px`;
        array.value[idx] = newHeight; // Replacing the $set call
      }, i * animSpeed.value);
    }
  }
};

const selectionSortButton = () => {
  if (sorted.value === true || buttonDisable.value === true) {
    return;
  }
  // Disable buttons while running
  disableButtons();
  const result = selectionSort(array.value.slice(), animations.value);

  let mergeAnimations = result[1];
  // Display animations
  for (let i = 0; i < mergeAnimations.length; i++) {
    // Get animation variables
    let command = mergeAnimations[i][0];
    const bars = document.getElementsByClassName("array-bar");

    // If we are comparing two elements change their color
    if (command == "curr") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#22333b";
      }, i * animSpeed.value);
    } else if (command == "comp") {
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#db9d47";
        bars[idxtwo].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "clear") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#264653";
      }, i * animSpeed.value);
    } else if (command == "done") {
      let idx = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idx].style.backgroundColor = "#984334";
      }, i * animSpeed.value);
    } else if (command == "sorted") {
      let idx = mergeAnimations[i][1];
      new Promise((resolve, reject) => {
        setTimeout(function () {
          for (let j = 0; j <= idx; j++) {
            bars[j].style.backgroundColor = "#984334";
          }
          resolve();
        }, i * animSpeed.value);
      }).then(() => {
        mergeAnimations.value = [];
        enableButtons();
        sorted.value = true; // Set the array to sorted
      });
    } else {
      // swap command
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      let newHeight = mergeAnimations[i][3];
      setTimeout(() => {
        bars[idxone].style.height = `${newHeight * heightFactor.value}px`;
        array.value[idxone] = newHeight; // Replacing the $set call
        bars[idxone].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    }
  }
};

const insertionSortButton = () => {
  if (sorted.value === true || buttonDisable.value === true) {
    return;
  }
  // Disable buttons while running
  disableButtons();
  const result = insertionSort(array.value.slice(), animations.value);
  // let sortedarray = result[0];
  let mergeAnimations = result[1];

  // Display animations
  for (let i = 0; i < mergeAnimations.length; i++) {
    // Get animation variables
    let command = mergeAnimations[i][0];
    const bars = document.getElementsByClassName("array-bar");

    if (command == "curr") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#22333b"; // green
      }, i * animSpeed.value);
    } else if (command == "init") {
      let idxone = mergeAnimations[i][1];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#984334"; // red for sorted list
      }, i * animSpeed.value);
    } else if (command == "comp") {
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      setTimeout(function () {
        bars[idxone].style.backgroundColor = "#db9d47"; // comparisons are yellow
        bars[idxtwo].style.backgroundColor = "#db9d47";
      }, i * animSpeed.value);
    } else if (command == "sorted") {
      let idx = mergeAnimations[i][1];
      new Promise((resolve, reject) => {
        setTimeout(function () {
          for (let j = 0; j <= idx; j++) {
            bars[j].style.backgroundColor = "#984334";
          }
          resolve();
        }, i * animSpeed.value);
      }).then(() => {
        mergeAnimations.value = [];
        enableButtons();
        sorted.value = true; // Set the array to sorted
      });
    } else {
      // swap command
      let idxone = mergeAnimations[i][1];
      let idxtwo = mergeAnimations[i][2];
      let newHeight = mergeAnimations[i][3];
      setTimeout(() => {
        bars[idxone].style.height = `${newHeight * heightFactor.value}px`;
        array.value[idxone] = newHeight; // Replacing the $set call
        bars[idxone].style.backgroundColor = "#264653";
      }, i * animSpeed.value);
    }
  }
};
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "./assets/main.scss" as *;
.sort-container {
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto; // Keep latest desktop style
  .function-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  @media screen and (min-width: 769px) {
    // Or your preferred desktop breakpoint
    .active-window {
      order: 2; // Content comes after buttons on desktop
    }
    .function-buttons {
      order: 1; // Buttons come first on desktop
    }
  }
}

.toolbar-button {
  margin: 10px;
  background-color: $gunmetal;
  border: none;
  color: $white-smoke;
  padding: 10px 16px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

.toolbar-button:hover {
  background-color: color.adjust($chestnut);
}

.generate-button,
.reset-button {
  background-color: $chestnut !important;
}

.generate-button:hover {
  background-color: color.adjust($chestnut, $lightness: -10%) !important;
}

.reset-button:hover {
  background-color: color.adjust($chestnut, $lightness: -10%) !important;
}

.active-window {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 65vh; // Keep user's desktop height adjustment
  padding: 2rem;
}

.array-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  left: 100px;
  height: 100%;
  transform: scaleY(-1);
}

.array-bar {
  width: 15px;
  background-color: $gunmetal;
  display: inline-block;
  margin: 0 2px;
}

.array-bar-value {
  font-size: 8px;
  color: $white-smoke;
  transform: scaleY(-1);
  margin: 0;
  display: flex;
  justify-content: center;
}

@media screen and (min-device-width: 1200px) and (max-device-width: 1600px) and (-webkit-min-device-pixel-ratio: 1) {
  .sort-container {
    padding: 0;
  }

  .toolbar-button {
    margin: 10px;
  }

  .active-window {
    height: 65vh; // Keep user's desktop height adjustment
    padding: 1rem;
  }

  .array-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    left: 100px;
    height: 100%;
    transform: scaleY(-1);
  }

  .array-bar {
    width: 10px;
    background-color: $gunmetal;
    display: inline-block;
    margin: 0 1px;
  }
}

@media screen and (max-width: 768px) {
  .sort-container {
    justify-content: flex-start;
    height: 65vh !important; // Keep user's mobile height adjustment
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    -webkit-touch-callout: none; /* Prevent callout menu on long press */
    .function-buttons {
      flex-shrink: 0;
      padding: 0.5rem; 
      padding-top: 0.5rem;
      .toolbar-button {
        margin: 5px;
        font-size: 16px;
        touch-action: manipulation; /* Prevent double-tap to zoom */
      }
    }
  }
  .active-window {
    padding: 1rem;
    flex: 1;
    min-height: fit-content;
    width: 100%;
    box-sizing: border-box;
    display: flex; // Keep display:flex for mobile .active-window
    flex-direction: column; // Keep direction for mobile .active-window
  }
  .array-container {
    overflow-x: auto;
  }
  .array-bar {
    width: 8px;
    margin: 0 1px;
  }
}

.button-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center; // Also center horizontally within the span
  gap: 5px;
}
</style>