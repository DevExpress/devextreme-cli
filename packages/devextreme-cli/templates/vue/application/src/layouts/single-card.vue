<template>
  <dx-scroll-view height="100%" width="100%" class="with-footer single-card">
     <div class="dx-card"><slot /></div>
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

  .dx-card {
    width: 330px;
    margin: auto auto;
    padding: 40px;

    .screen-x-small & {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      margin: 0;
      border: 0;
      flex-grow: 1;
    }
  }
}

</style>
