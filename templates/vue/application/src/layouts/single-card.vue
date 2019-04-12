<template>
  <dx-scroll-view height="auto" class="dx-card single-card">
    <slot />
  </dx-scroll-view>
</template>

<script>
import DxScrollView from "devextreme-vue/scroll-view";

export default {
  components: {
    DxScrollView
  }
};
</script>

<style lang="scss">
.single-card {
  width: 100%;
  height: 100%;
  display: flex;
}

.single-card.dx-card {
  width: 330px;
  margin: auto auto;

  .screen-x-small & {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
    margin: 0;
    border: 0;
  }

  .content {
    padding: 40px;
  }
}
</style>
