<template>
  <div id="root">
    <div :class="cssClasses">
      <component
        :is="$route.meta.layout"
        :title="title"
        :is-x-small="screen.getScreenSizeInfo.isXSmall"
        :is-large="screen.getScreenSizeInfo.isLarge"
      >
        <router-view></router-view>
        <template #footer>
          <app-footer />
        </template>
      </component>
    </div>
  </div>
</template>

<script>
import AppFooter from "./components/app-footer.vue";
import { sizes, subscribe, unsubscribe } from "./utils/media-query";
import {
  getCurrentInstance,
  reactive,
  onMounted,
  onBeforeUnmount,
  computed
} from "vue";

function getScreenSizeInfo() {
  const screenSizes = sizes();

  return {
    isXSmall: screenSizes["screen-x-small"],
    isLarge: screenSizes["screen-large"],
    cssClasses: Object.keys(screenSizes).filter(cl => screenSizes[cl])
  };
}

export default {
  components: {
    AppFooter
  },
  setup() {
    const vm = getCurrentInstance();

    const title = vm.proxy.$appInfo.title;
    const screen = reactive({ getScreenSizeInfo: {} });
    screen.getScreenSizeInfo = getScreenSizeInfo();

    function screenSizeChanged () {
      screen.getScreenSizeInfo = getScreenSizeInfo();
    }

    onMounted(() => {
      subscribe(screenSizeChanged);
    });

    onBeforeUnmount(() => {
      unsubscribe(screenSizeChanged);
    });

    const cssClasses = computed(() => {
      return ["app"].concat(screen.getScreenSizeInfo.cssClasses);
    });

    return {
      title,
      screen,
      cssClasses
    };
  }
};
</script>

<style lang="scss">
html,
body {
  margin: 0px;
  min-height: 100%;
  height: 100%;
}

#root {
  height: 100%;
}

* {
  box-sizing: border-box;
}

.app {
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 320px;
}
</style>
