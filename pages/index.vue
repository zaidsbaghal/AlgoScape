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
              :class="{ active: AlgoCategory.value === 'sorting' }"
              aria-label="Switch to Sorting View"
            >
              <Icon name="ion:swap-vertical-outline" size="40" />
            </button>
            <button
              @click="setAlgoCategory('pathfinding')"
              :class="{ active: AlgoCategory.value === 'pathfinding' }"
              aria-label="Switch to Pathfinding View"
            >
              <Icon name="ion:footsteps-outline" size="40" />
            </button>
            <button @click="navigateToAbout" aria-label="Go to About Page">
              <Icon name="ion:information-circle-outline" size="40" />
            </button>
          </div>
        </div>
        <div v-show="AlgoCategory === 'sorting'">
          <grid-loader
            :loading="loaderLoading"
            :color="loaderColor"
            :size="loaderSize"
          ></grid-loader>
          <SortingView :is-mobile="isMobile"></SortingView>
        </div>
        <div v-show="AlgoCategory === 'pathfinding'">
          <PathfindingView :is-mobile="isMobile"></PathfindingView>
        </div>
      </div>
      <div class="copyright">
        <p>
          Built by
          <a
            href="https://www.zaidsbaghal.com"
            target="_blank"
            class="highlighted-link"
          >
            Zaid Baghal
          </a>
          for
          <a
            href="https://www.rawistudios.com"
            target="_blank"
            class="highlighted-link"
          >
            Rawi.</a
          >
        </p>
        <p>
          © 2025 Rawi Studios. All rights reserved. |
          <a href="/privacy" class="highlighted-link">Privacy</a> |
          <a href="/terms" class="highlighted-link">Terms</a> |
          <a href="/changelog" class="highlighted-link">Changelog</a>
        </p>
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Logo from "~/components/Logo.vue";

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
  console.log("[DEBUG] Retrieved from localStorage:", savedCategory);
  if (savedCategory) {
    AlgoCategory.value = savedCategory;
  }
  console.log(
    "[DEBUG] AlgoCategory.value after onMounted:",
    AlgoCategory.value
  );
  console.log("[DEBUG] AlgoCategory ref object after onMounted:", AlgoCategory);
});

watch(AlgoCategory, (newCategory) => {
  localStorage.setItem("selectedAlgoCategory", newCategory);
});

// Navigation function
const navigateToAbout = () => {
  router.push("/about");
};

const setAlgoCategory = (category) => {
  console.log("[DEBUG] Attempting to set AlgoCategory to:", category);
  console.log(
    "[DEBUG] Current AlgoCategory.value before set:",
    AlgoCategory.value
  );
  // console.log("[DEBUG] AlgoCategory ref object before set:", AlgoCategory); // Keep this commented for now
  if (AlgoCategory && typeof AlgoCategory.value !== "undefined") {
    AlgoCategory.value = category;
    console.log(
      "[DEBUG] Successfully set AlgoCategory.value to:",
      AlgoCategory.value
    );
    console.log("[DEBUG] Type of AlgoCategory after set:", typeof AlgoCategory);
    console.log(
      "[DEBUG] Is AlgoCategory a ref after set (AlgoCategory.__v_isRef)?:",
      AlgoCategory && AlgoCategory.__v_isRef
    );
    console.log(
      "[DEBUG] AlgoCategory object after set (full inspect):",
      AlgoCategory
    );
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
        opacity: 0.6;
        transition: opacity 0.2s ease, transform 0.2s ease;

        &:hover {
          opacity: 1;
        }

        &.active {
          opacity: 1;
          transform: scale(1.1);
          color: $chestnut;
        }
      }
    }
  }
}

.copyright {
  position: fixed;
  bottom: 10px;
  width: 100%;
  text-align: center;
  font-size: 10px;
  color: $gunmetal;
  opacity: 0.5;
  line-height: 1.4;
  p {
    margin: 0;
  }
  .highlighted-link {
    color: $gunmetal;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

@media screen and (max-width: 768px) {
  .main {
    height: 100vh;
    overflow-y: hidden;

    > div:first-child {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow-y: hidden;
    }

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

    .copyright {
      position: static;
      flex-shrink: 0;
      padding: 5px 0;
      padding-bottom: 10px;
      font-size: 10px;
      opacity: 1;
      line-height: 1.2;
      width: 100%;
      text-align: center;
      color: $gunmetal;
      p {
        margin: 0;
      }
    }

    div[v-show="AlgoCategory.value === 'sorting'"],
    div[v-show="AlgoCategory.value === 'pathfinding'"] {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow-y: hidden;
    }
  }
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
