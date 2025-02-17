<template>
  <div class="box" :id="id" :ref="ref"></div>
</template>
<script setup>
const props = defineProps({
  row: {
    type: Number,
    default: 0,
  },
  col: {
    type: Number,
    default: 0,
  },
  isWall: {
    type: Boolean,
    default: false,
  },
  isStart: {
    type: Boolean,
    default: false,
  },
  isEnd: {
    type: Boolean,
    default: false,
  },
  visited: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: "",
  },
  ref: {
    type: String,
    default: "",
  },
  parent: {
    type: Object,
    default: null, 
  },
  ddist: {
    type: Number,
    default: 0, 
  },
  g: {
    type: Number,
    default: 0,
  },
  h: {
    type: Number,
    default: 0,
  },
  f: {
    type: Number,
    default: 0,
  },
  closed: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss">
@use "./assets/main.scss" as *;

.box {
  // animation: fadeIn ease 1s;
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $white-smoke;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
}

.wall {
  animation: fadeIn ease 1s;
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $gunmetal;
}
.start {
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $blue-munsell;
  cursor: pointer;
}
.end {
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $chestnut;
  cursor: pointer;
}
.visited {
  animation: fadeIn ease 1s;
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $earth-yellow;
}
.path {
  animation: fadeIn ease 1s;
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $mantis;
}
.fringe {
  animation: fadeIn ease 1s;
  width: 25px;
  height: 25px;
  border: 0.5px solid $gunmetal;
  background-color: $wheat;
}
@media screen and (min-device-width: 1200px) and (max-device-width: 1600px) and (-webkit-min-device-pixel-ratio: 1) {
  .box {
    width: 18px;
    height: 18px;
  }
  .wall {
    width: 18px;
    height: 18px;
  }
  .start {
    width: 18px;
    height: 18px;
  }
  .end {
    width: 18px;
    height: 18px;
  }
  .visited {
    width: 18px;
    height: 18px;
  }
  .path {
    width: 18px;
    height: 18px;
  }
  .fringe {
    width: 18px;
    height: 18px;
  }
}
</style>