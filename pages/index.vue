<template>
  <div class="main">
    <client-only>
      <div>
        <div class="logo-container">
          <Logo />
        </div>
        <div class="algorithm-container">
          <div class="view-switcher">
            <button
              @click="setAlgoCategory('sorting')"
              :class="{ active: AlgoCategory === 'sorting' }"
              aria-label="Switch to Sorting View"
            >
              <Icon name="ion:cellular-outline" size="40" />
            </button>
            <button
              @click="setAlgoCategory('pathfinding')"
              :class="{ active: AlgoCategory === 'pathfinding' }"
              aria-label="Switch to Pathfinding View"
            >
              <Icon name="ion:navigate-outline" size="40" />
            </button>
            <button
              @click="setAlgoCategory('about')"
              :class="{ active: AlgoCategory === 'about' }"
              aria-label="Show About Information"
            >
              <Icon name="ion:information-circle-outline" size="40" />
            </button>
            <button
              @click="setAlgoCategory('feedback')"
              :class="{ active: AlgoCategory === 'feedback' }"
              aria-label="Provide Feedback"
            >
              <Icon name="ion:bug-outline" size="40" />
            </button>
          </div>
        </div>
        <div class="view-content-wrapper" v-show="AlgoCategory === 'sorting'">
          <SortingView :is-mobile="isMobile"></SortingView>
        </div>
        <div
          class="view-content-wrapper"
          v-show="AlgoCategory === 'pathfinding'"
        >
          <div v-if="pathfindingLoading" class="loading-container">
            <Icon name="ion:reload-outline" size="40" class="loading-icon" />
            <p>Loading pathfinding grid...</p>
          </div>
          <div v-show="!pathfindingLoading" class="pathfinding-view-host">
            <PathfindingView
              ref="pathfindingViewRef"
              :is-mobile="isMobile"
              :is-active="AlgoCategory === 'pathfinding'"
              @grid-size-determined="setPathfindingLoadingTimeout"
            ></PathfindingView>
          </div>
        </div>
        <div
          class="view-content-wrapper view-content-wrapper--about"
          v-show="AlgoCategory === 'about'"
        >
          <AboutView />
        </div>
        <div
          class="view-content-wrapper view-content-wrapper--feedback"
          v-show="AlgoCategory === 'feedback'"
        >
          <iframe
            src="https://rawi-feedback.notion.site/ebd/1e53de04ea888101a446f9323da4c80c"
            style="
              width: 100%;
              height: 100%;
              border: none;
              overflow: auto;
              -webkit-overflow-scrolling: touch;
            "
            sandbox="allow-scripts allow-same-origin allow-forms"
            allowfullscreen
            title="Feedback Form"
          ></iframe>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import Logo from "~/components/Logo.vue";
import AboutView from "~/components/AboutView.vue";

// Computed property
const isMobile = computed(() => {
  if (typeof navigator !== "undefined") {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  return false;
});

// Router instance
const router = useRouter();

// Data properties
const AlgoCategory = ref("sorting");
const loaderLoading = ref(true);
const loaderColor = ref("#264653");
const loaderSize = ref("300");
const pathfindingLoading = ref(false);
const pathfindingViewRef = ref(null);

let pathfindingTimeoutId = null;

// Persist AlgoCategory to localStorage
onMounted(() => {
  const savedCategory = localStorage.getItem("selectedAlgoCategory");

  if (savedCategory) {
    AlgoCategory.value = savedCategory;
    if (savedCategory === "pathfinding") {
      pathfindingLoading.value = true;
    }
  }

  loaderLoading.value = false; // Hide loader after mount
});

watch(AlgoCategory, (newCategory) => {
  localStorage.setItem("selectedAlgoCategory", newCategory);
  if (newCategory === "pathfinding") {
    pathfindingLoading.value = true;
    // Timeout will be set by setPathfindingLoadingTimeout based on grid size
    // Clear previous timeout if any when switching to pathfinding
    if (pathfindingTimeoutId) {
      clearTimeout(pathfindingTimeoutId);
      pathfindingTimeoutId = null;
    }
  } else {
    // If switching away from pathfinding, ensure loading is false
    pathfindingLoading.value = false;
    // Also clear any pending pathfinding loading timeout
    if (pathfindingTimeoutId) {
      clearTimeout(pathfindingTimeoutId);
      pathfindingTimeoutId = null;
    }
  }
});

const setPathfindingLoadingTimeout = async (sizeCategory) => {
  // Only proceed if we are in pathfinding category AND currently in a loading state.
  // This prevents re-triggering the timeout loop after the initial load.
  if (AlgoCategory.value !== "pathfinding" || !pathfindingLoading.value) {
    if (
      AlgoCategory.value === "pathfinding" &&
      pathfindingLoading.value === false
    ) {
    }
    return;
  }

  // If a timeout is already scheduled from a previous emit during this loading phase, clear it.
  if (pathfindingTimeoutId) {
    clearTimeout(pathfindingTimeoutId);
  }

  let duration = 2000; // Default for medium or unspecified
  if (sizeCategory === "small") {
    duration = 1000;
  } else if (sizeCategory === "large") {
    duration = 3000;
  }

  pathfindingTimeoutId = setTimeout(async () => {
    pathfindingLoading.value = false; // Mark loading as complete
    pathfindingTimeoutId = null; // Clear the ID as the timeout has executed
    await nextTick(); // Ensure DOM updates after pathfindingLoading changes
    if (pathfindingViewRef.value) {
      pathfindingViewRef.value.triggerGridRecalculation();
    } else {
    }
  }, duration);
};

// Navigation function
const setAlgoCategory = (category) => {
  if (AlgoCategory && typeof AlgoCategory.value !== "undefined") {
    AlgoCategory.value = category;
  } else {
  }
};

// Handle grid loaded event
// const onPathfindingGridLoaded = () => {
//   pathfindingLoading.value = false;
// };
</script>

<style lang="scss">
@use "./assets/main.scss" as *;
.logo-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}
.mobile-view {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mobile-text {
  align-items: center;
  justify-content: center;
  text-align: center;
  word-wrap: break-word;
  color: $gunmetal;
}

select {
  text-align-last: center;
}

.main {
  display: flex;
  flex-direction: column;
  height: 100vh;

  // This is the div directly inside <client-only>
  // Moved to global scope for consistent layout
  > div:first-child {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // Essential for flex children that might overflow
  }

  .algorithm-container {
    margin-top: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;

    .view-switcher {
      display: flex;
      gap: 30px;

      button {
        background: none;
        border: none;
        padding: 5px;
        cursor: pointer;
        color: $gunmetal;
        opacity: 0.7;
        transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
        -webkit-tap-highlight-color: transparent;

        &:focus {
          outline: none;
        }

        &:hover {
          opacity: 1;
          transform: scale(1.2);
          color: $gunmetal;
        }

        &.active {
          opacity: 1;
          transform: scale(1.2);
          color: $chestnut;
        }
      }
    }
  }
}

// Loading container styles
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: $gunmetal;

  p {
    margin-top: 1rem;
    font-size: 1.2rem;
  }

  .loading-icon {
    animation: spin 1.5s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Common styles for the view hosting divs
.view-content-wrapper {
  flex: 1; // Takes available vertical space from its parent
  display: flex; // It's a flex container for the actual view component
  flex-direction: column; // Its child (the view component) will stack
  min-height: 65vh;
  box-sizing: border-box; // Ensure padding/border are included in element's total width/height

  &--about {
    height: 100%; // Ensure it fills the parent
    justify-content: center; // Center vertically
    align-items: center; // Center horizontally
  }

  &--feedback {
    padding: 1rem; // Mobile default padding

    @media screen and (min-width: 769px) {
      padding: 2rem 4rem;
    }
  }
}

// Added style for the new host div
.pathfinding-view-host {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media screen and (max-width: 768px) {
  .main {
    height: 100vh;

    .algorithm-container {
      height: auto;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      .view-switcher {
        gap: 20px;
        button {
          padding: 3px;
          .icon {
            font-size: 35px !important;
          }
        }
      }
    }

    // Specific mobile overrides for view hosting divs if needed, e.g., for overflow
    .view-content-wrapper {
      max-height: unset;
      display: unset;
    }
  }

  // Commented out, as this is now handled in AboutView.vue
  // .copyright {
  //   position: static;
  //   flex-shrink: 0;
  //   padding: 5px 0;
  //   padding-bottom: 10px;
  //   font-size: 10px;
  //   opacity: 1;
  //   line-height: 1.2;
  //   width: 100%;
  //   text-align: center;
  //   color: $gunmetal;
  //   p {
  //     margin: 0;
  //   }
  // }

  // This rule for specific v-show divs might be redundant if combined above
  // div[v-show="AlgoCategory.value === 'sorting'"],
  // div[v-show="AlgoCategory.value === 'pathfinding'"],
  // div[v-show="AlgoCategory.value === 'about'"] {
  //   flex: 1;
  //   display: flex;
  //   flex-direction: column;
  //   min-height: 0;
  //   // overflow-y: hidden; // This was here
  // }
}

@media screen and (min-device-width: 1200px) and (max-device-width: 1600px) and (-webkit-min-device-pixel-ratio: 1) {
  .main {
    .algorithm-container {
      .view-switcher {
      }
      .down-arrow {
      }
    }
  }
}
</style>
