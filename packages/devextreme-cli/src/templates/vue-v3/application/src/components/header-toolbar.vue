<template>
  <header class="header-component">
    <dx-toolbar class="header-toolbar">
      <dx-item
        :visible="menuToggleEnabled"
        location="before"
        css-class="menu-button"
      >
        <template #default>
          <dx-button
            icon="menu"
            styling-mode="text"
            @click="toggleMenuFunc"
          />
        </template>
      </dx-item>

      <dx-item
        v-if="title"
        location="before"
        css-class="header-title dx-toolbar-label"
      >
        <div>{{ title }} </div>
      </dx-item>

      <dx-item location="after">
        <div><theme-switcher /></div>
      </dx-item>

      <dx-item
        location="after"
        locate-in-menu="auto"
        menu-item-template="menuUserItem"
      >
        <template #default>
          <user-panel :menu-items="userMenuItems" menuMode="context"/>
        </template>
      </dx-item>

      <template #menuUserItem>
        <user-panel :menu-items="userMenuItems" menuMode="list"/>
      </template>

    </dx-toolbar>
  </header>
</template>

<script>
import DxButton from "devextreme-vue/button";
import DxToolbar, { DxItem } from "devextreme-vue/toolbar";
import auth from "../auth";
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';

import UserPanel from "./user-panel.vue";
import ThemeSwitcher from './theme-switcher.vue';

export default {
  props: {
    menuToggleEnabled: Boolean,
    title: String,
    toggleMenuFunc: Function,
    logOutFunc: Function
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const email = ref("");
    auth.getUser().then((e) => email.value = e.data.email);

    const userMenuItems = [{
      text: "Profile",
      icon: "user",
      onClick: onProfileClick
    },
      {
        text: "Logout",
        icon: "runner",
        onClick: onLogoutClick
      }];

    function onLogoutClick() {
      auth.logOut();
      router.push({
        path: "/login-form",
        query: { redirect: route.path }
      });
    }

    function onProfileClick() {
      router.push({
        path: "/profile",
        query: { redirect: route.path }
      });
    }

    return {
      email,
      userMenuItems
    };
  },
  components: {
    ThemeSwitcher,
    DxButton,
    DxToolbar,
    DxItem,
    UserPanel
  }
};
</script>

<style lang="scss">
@use "../dx-styles.scss" as *;

header {
  background-color: var(--base-bg);
}

.header-component {
  flex: 0 0 auto;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
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
  .header-toolbar {
    padding: 10px 0;
  }

  .user-button > .dx-button-content {
    padding: 3px;
  }
}
</style>
