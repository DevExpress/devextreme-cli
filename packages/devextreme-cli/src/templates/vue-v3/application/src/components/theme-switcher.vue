<template>
  <dx-button
    class="theme-button"
    styling-mode="text"
    :icon="currentTheme === 'dark' ? 'sun' : 'moon'"
    @click="onClickButton"
  />
</template>

<script setup>
/* eslint-disable */
import { DxButton } from 'devextreme-vue/button';
import { themeService } from '../theme-service';

const currentTheme = themeService.currentTheme;

function onClickButton() {
  themeService.switchAppTheme();
}
/* eslint-enable */
</script>
