<template>
  <dx-scroll-view height="100%" width="100%" class="with-footer single-card">
     <div class="dx-card content">
      <div class="header">
        <div class="title">{{title}}</div>
        <div class="description">{{description}}</div>
      </div>
      <slot />
    </div>
  </dx-scroll-view>
</template>

<script>
import DxScrollView from "devextreme-vue/scroll-view";

import { useRoute } from 'vue-router';
import { watch, ref } from 'vue';

export default {
  components: {
    DxScrollView
  },
  setup() {
    const route = useRoute();

    const title = ref(route.meta.title);
    const description = ref("");

    watch(() => route.path,
     () => {
        title.value = route.meta.title;
        description.value = route.meta.description;
     }
    )
    return {
      title,
      description
    }
  }
};
</script>

<style lang="scss">
.single-card {
  width: 100%;
  height: 100%;

  .dx-card {
    width: 360px;
    margin: auto auto;
    padding: 24px;
    flex-grow: 0;
    border-radius: 8px;

    .screen-x-small & {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      margin: 0;
      border: 0;
      flex-grow: 1;
    }

    .header {
      margin: 24px 0;

      .title {
        color: var(--base-text-color);
        text-align: center;
        line-height: 24px;
        font-weight: 500;
        font-size: 24px;
      }

      .description {
        color: var(--base-text-color-alpha-7);
        line-height: 16px;
        font-size: 12px;
        margin-top: 32px;
        text-align: center;
      }
    }
  }
}
</style>
