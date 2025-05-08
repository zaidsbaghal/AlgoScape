<template>
  <div class="main">
    <client-only>
      <div>
        <div class="logo-container">
          <Logo />
        </div>
        <div class="algorithm-container">
          <div class="select-container">
            <select
              v-model="AlgoCategory"
              class="algo-select"
              name="algorithms"
              id="algorithms"
            >
              <option value="sorting" selected>Sort</option>
              <option value="pathfinding">Pathfind</option>
            </select>
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
});

watch(AlgoCategory, (newCategory) => {
  localStorage.setItem("selectedAlgoCategory", newCategory);
});
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
    height: 5.5rem;
    display: flex;
    justify-content: center;

    .algo-select {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      text-align: center;
      width: 350px;
      padding-left: 20px;
      padding-right: 20px;
      height: 100px;
      font-size: 45px;
      font-weight: bold;
      cursor: pointer;
      background-color: $white-smoke;
      border: none;
      color: $gunmetal;
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
      .algo-select {
        height: auto;
        padding: 18px 25px;
        font-size: 34px;
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

    div[v-show="AlgoCategory === 'sorting'"],
    div[v-show="AlgoCategory === 'pathfinding'"] {
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
      .algo-select {
      }
      .down-arrow {
      }
    }
  }
}
</style>
