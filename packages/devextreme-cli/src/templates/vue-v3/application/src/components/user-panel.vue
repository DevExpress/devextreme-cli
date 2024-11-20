<template>
  <div class="user-panel">
    <dx-drop-down-button
      v-if="menuMode !== 'list'"
      stylingMode="text"
      :icon="'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/06.png'"
      :showArrowIcon="false"
      :items="menuItems"
      displayExpr="text"
      keyExpr="id"
      :elementAttr="{
      class: 'user-button'
    }"
      :dropDownOptions="{
      width: '150px'
    }"
    />
    <dx-list
      v-if="menuMode === 'list'"
      :items="menuItems"
      displayExpr="text"
      keyExpr="id"
      width="130"
    />
  </div>
</template>

<script>
import { DxDropDownButton, DxList } from 'devextreme-vue';

export default {
  props: {
    menuItems: Array,
    menuMode: String,
  },
  components: {
    DxDropDownButton,
    DxList,
  }
};
</script>
<style lang="scss">
.app .header-toolbar .user-panel .user-button.dx-dropdownbutton img.dx-icon {
  height: 100%;
  width: auto;

  .dx-theme-generic & {
    max-height: 32px;
  }
}

.user-panel  {
  display: flex;
  flex-direction: column;

  .user-button.dx-dropdownbutton {
    margin-left: 5px;

    img.dx-icon {
      border-radius: 50%;
      margin: 0;
      width: auto;
      aspect-ratio: 1 / 1;
      box-sizing: border-box;
      border: 1px solid var(--dx-color-border);
      object-fit: cover;
      object-position: top;
      background: rgb(255, 255, 255);
      background-clip: padding-box;
    }



    .dx-buttongroup {
      vertical-align: middle;

      .dx-button.dx-button-has-icon:not(.dx-button-has-text) {
        .dx-button-content {
          padding: 0;
        }

        &.dx-state-hover,
        &.dx-state-focused {
          background-color: transparent;

          img.dx-icon {
            border-color: var(--dx-color-primary);
          }
        }
      }
    }
  }
}
</style>
