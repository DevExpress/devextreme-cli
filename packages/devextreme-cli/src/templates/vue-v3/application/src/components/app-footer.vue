<template>
  <div class="content-block">
    <footer class="footer">
      Copyright © 2011-{{new Date().getFullYear()}} {{this.$appInfo.title}} Inc.
      <br />All trademarks or registered trademarks are property of their
      respective owners.
    </footer>
  </div>
</template>

<style lang="scss">
@import "../themes/generated/variables.base.scss";

.footer {
  display: block;
  color: rgba($base-text-color, alpha($base-text-color) * 0.7);
  border-top: 1px solid var(--dx-color-border);
  padding-top: 20px;
  padding-bottom: 24px;
  margin: 0 40px;

  .screen-x-small & {
    margin: 0 20px;
  }
}
</style>
