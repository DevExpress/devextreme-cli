<template>
  <div class="side-navigation-menu" @click="forwardClick">
    <slot />
    <div class="menu-container">
      <dx-tree-view
        expand-event="click"
        width="100%"
        selection-mode="single"
        key-expr="path"
        :select-nodes-recursive="true"
        :select-by-click="true"
        :items="items"
        :ref="treeViewRef"
        @initialized="handleMenuInitialized"
        @item-click="handleItemClick"
        @selection-changed="handleSelectionChange"
        @content-ready="handleSelectionChange"
      />
    </div>
  </div>
</template>

<script>
import DxTreeView from "devextreme-vue/ui/tree-view";

const treeViewRef = "treeViewRef";

export default {
  props: {
    items: Array,
    selectedItem: String,
    compactMode: Boolean
  },
  data() {
    return {
      treeViewRef
    };
  },
  methods: {
    forwardClick(...args) {
      this.$emit("click", args);
    },

    handleMenuInitialized(event) {
      event.component.option("deferRendering", false);
    },

    handleItemClick(e) {
      if (!e.itemData.path || this.compactMode) {
        return;
      }

      this.$router.push(e.itemData.path);

      const pointerEvent = e.event;
      pointerEvent.stopPropagation();
    },

    handleSelectionChange(e) {
      this.updateSelection();
      const nodeClass = "dx-treeview-node";
      const selectedClass = "dx-state-selected";
      const leafNodeClass = "dx-treeview-node-is-leaf";
      const element = e.element;

      const rootNodes = element.querySelectorAll(
        `.${nodeClass}:not(.${leafNodeClass})`
      );
      Array.from(rootNodes).forEach(node => {
        node.classList.remove(selectedClass);
      });

      let selectedNode = element.querySelector(
        `.${nodeClass}.${selectedClass}`
      );

      while (selectedNode && selectedNode.parentElement) {
        if (selectedNode.classList.contains(nodeClass)) {
          selectedNode.classList.add(selectedClass);
        }
        selectedNode = selectedNode.parentElement;
      }
    },

    updateSelection() {
      if (!this.treeView) {
        return;
      }

      this.treeView.selectItem(this.$route.path);
    }
  },
  mounted() {
    this.treeView = this.$refs[treeViewRef] && this.$refs[treeViewRef].instance;
    this.updateSelection();
    if (this.compactMode) {
      this.treeView.collapseAll();
    }
  },
  watch: {
    $route() {
      this.updateSelection();
    },
    compactMode() {
      if (this.compactMode) {
        this.treeView.collapseAll();
      }
    }
  },
  components: {
    DxTreeView
  }
};
</script>

<style lang="scss">
@import "../dx-styles.scss";
@import "../themes/generated/variables.additional.scss";

.side-navigation-menu {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  width: 250px !important;

  .menu-container {
    min-height: 100%;
    display: flex;
    flex: 1;

    .dx-treeview {
      // ## Long text positioning
      white-space: nowrap;
      // ##

      // ## Icon width customization
      .dx-treeview-item {
        padding-left: 0;
        padding-right: 0;

        .dx-icon {
          width: $side-panel-min-width !important;
          margin: 0 !important;
        }
      }
      // ##

      // ## Arrow customization
      .dx-treeview-node {
        padding: 0 0 !important;
      }

      .dx-treeview-toggle-item-visibility {
        right: 10px;
        left: auto;
      }

      .dx-rtl .dx-treeview-toggle-item-visibility {
        left: 10px;
        right: auto;
      }
      // ##

      // ## Item levels customization
      .dx-treeview-node {
        &[aria-level="1"] {
          font-weight: bold;
          border-bottom: 1px solid $base-border-color;
        }

        &[aria-level="2"] .dx-treeview-item-content {
          font-weight: normal;
          padding: 0 $side-panel-min-width;
        }
      }
      // ##
    }

    // ## Selected & Focuced items customization
    .dx-treeview {
      .dx-treeview-node-container {
        .dx-treeview-node {
          &.dx-state-selected:not(.dx-state-focused) > .dx-treeview-item {
            background: transparent;
          }

          &.dx-state-selected > .dx-treeview-item * {
            color: $base-accent;
          }

          &:not(.dx-state-focused) > .dx-treeview-item.dx-state-hover {
            background-color: lighten($base-bg, 4);
          }
        }
      }
    }

    .dx-theme-generic .dx-treeview {
      .dx-treeview-node-container
        .dx-treeview-node.dx-state-selected.dx-state-focused
        > .dx-treeview-item
        * {
        color: inherit;
      }
    }
    // ##
  }
}
</style>
