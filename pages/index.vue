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
        <div v-show="AlgoCategory === 'sorting'">
          <SortingView :is-mobile="isMobile"></SortingView>
        </div>
        <div v-show="AlgoCategory === 'pathfinding'">
          <PathfindingView
            :is-mobile="isMobile"
            :is-active="AlgoCategory === 'pathfinding'"
          ></PathfindingView>
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
            src="https://rawi-feedback.notion.site/1e53de04ea888101a446f9323da4c80c?pvs=105"
            style="width: 100%; height: 100%; border: none"
            title="Feedback Form"
          ></iframe>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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

// Persist AlgoCategory to localStorage
onMounted(() => {
  const savedCategory = localStorage.getItem("selectedAlgoCategory");

  if (savedCategory) {
    AlgoCategory.value = savedCategory;
  }

  loaderLoading.value = false; // Hide loader after mount
});

watch(AlgoCategory, (newCategory) => {
  localStorage.setItem("selectedAlgoCategory", newCategory);
});

// Navigation function
const setAlgoCategory = (category) => {
  if (AlgoCategory && typeof AlgoCategory.value !== "undefined") {
    AlgoCategory.value = category;
  } else {
    console.error(
      "[DEBUG] AlgoCategory is not a valid ref or has no .value property. Current state:",
      AlgoCategory
    );
  }
};
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

// Common styles for the view hosting divs
.view-content-wrapper {
  flex: 1; // Takes available vertical space from its parent
  display: flex; // It's a flex container for the actual view component
  flex-direction: column; // Its child (the view component) will stack
  min-height: 0; // Allow it to shrink if content is small, while still being flex:1
  overflow: auto; // Default overflow handling for these wrappers.
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

@media screen and (max-width: 768px) {
  .main {
    height: 100vh;

    // > div:first-child styling is now global

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
      overflow-y: hidden; // Mobile-specific override, keeps existing behavior
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
