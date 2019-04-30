<template>
  <header class="header-component">
    <dx-toolbar class="header-toolbar">
      <dx-item
        :visible="menuToggleEnabled"
        location="before"
        css-class="menu-button"
      >
        <!-- eslint-disable vue/no-unused-vars -->
        <dx-button
          icon="menu"
          styling-mode="text"
          @click="toggleMenuFunc"
          slot-scope="_"
        />
        <!-- eslint-enable -->
      </dx-item>

      <dx-item
        v-if="title"
        location="before"
        css-class="header-title dx-toolbar-label"
      >
        <!-- eslint-disable vue/no-unused-vars -->
        <div slot-scope="_">{{ title }}</div>
        <!-- eslint-enable -->
      </dx-item>

      <dx-item
        location="after"
        locate-in-menu="auto"
        menu-item-template="menuUserItem"
      >
        <!-- eslint-disable vue/no-unused-vars -->
        <div slot-scope="_">
        <!-- eslint-enable -->
          <dx-button
            class="user-button authorization"
            :width="170"
            height="100%"
            styling-mode="text"
          >
            <user-panel :menu-items="userMenuItems" menu-mode="context" />
          </dx-button>
        </div>
      </dx-item>
      <!-- eslint-disable vue/no-unused-vars -->
      <user-panel
        :menu-items="userMenuItems"
        menu-mode="list"
        slot-scope="_"
        slot="menuUserItem"
      />
      <!-- eslint-enable -->
    </dx-toolbar>
  </header>
</template>

<script>
import DxButton from "devextreme-vue/button";
import DxToolbar, { DxItem } from "devextreme-vue/toolbar";
import auth from "../auth";

import UserPanel from "./user-panel";

export default {
  props: {
    menuToggleEnabled: Boolean,
    title: String,
    toggleMenuFunc: Function,
    logOutFunc: Function
  },
  data() {
    return {
      userMenuItems: [
        {
          text: "Profile",
          icon: "user"
        },
        {
          text: "Logout",
          icon: "runner",
          onClick: this.onLogoutClick
        }
      ]
    };
  },
  methods: {
    onLogoutClick() {
      auth.logOut();
      this.$router.push({
        path: "/login-form",
        query: { redirect: this.$route.path }
      });
    }
  },
  components: {
    DxButton,
    DxToolbar,
    DxItem,
    UserPanel
  }
};
</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";
@import "../dx-styles.scss";

.header-component {
  flex: 0 0 auto;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

  .dx-toolbar .dx-toolbar-item.menu-button > .dx-toolbar-item-content .dx-icon {
    color: $base-accent;
  }
}

.dx-toolbar.header-toolbar .dx-toolbar-items-container .dx-toolbar-after {
  padding: 0 40px;

  .screen-x-small & {
    padding: 0 20px;
  }
}

.dx-toolbar .dx-toolbar-item.dx-toolbar-button.menu-button {
  width: $side-panel-min-width;
  text-align: center;
  padding: 0;
}

.header-title .dx-item-content {
  padding: 0;
  margin: 0;
}

.dx-theme-generic {
  .dx-toolbar {
    padding: 10px 0;
  }

  .user-button > .dx-button-content {
    padding: 3px;
  }
}
</style>
