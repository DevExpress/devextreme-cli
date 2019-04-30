<template>
  <dx-validation-group>
    <div class="login-header">
      <div class="title">{{ title }}</div>
      <div>Sign In to your account</div>
    </div>

    <div class="dx-field">
      <dx-text-box placeholder="Login" width="100%" :value.sync="login">
        <dx-validator>
          <dx-required-rule message="Login is required" />
        </dx-validator>
      </dx-text-box>
    </div>

    <div class="dx-field">
      <dx-text-box
        placeholder="Password"
        width="100%"
        mode="password"
        :value.sync="password"
      >
        <dx-validator>
          <dx-required-rule message="Password is required" />
        </dx-validator>
      </dx-text-box>
    </div>

    <div class="dx-field">
      <dx-check-box :value.sync="rememberUser" text="Remember me" />
    </div>

    <div class="dx-field">
      <dx-button
        type="default"
        text="Login"
        width="100%"
        @click="onLoginClick"
      />
    </div>

    <div class="dx-field">
      <router-link to="/recovery"><a>Forgot password ?</a></router-link>
    </div>

    <div class="dx-field">
      <dx-button type="normal" text="Create an account" width="100%" />
    </div>
  </dx-validation-group>
</template>

<script>
import DxButton from "devextreme-vue/button";
import DxCheckBox from "devextreme-vue/check-box";
import DxTextBox from "devextreme-vue/text-box";
import DxValidationGroup from "devextreme-vue/validation-group";
import DxValidator, { DxRequiredRule } from "devextreme-vue/validator";

import auth from "../auth";

export default {
  data() {
    return {
      title: this.$appInfo.title,
      login: "",
      password: "",
      rememberUser: false
    };
  },
  methods: {
    onLoginClick(e) {
      if (!e.validationGroup.validate().isValid) {
        return;
      }

      auth.logIn();
      this.$router.push(this.$route.query.redirect || "/home");

      e.validationGroup.reset();
    }
  },
  components: {
    DxButton,
    DxCheckBox,
    DxTextBox,
    DxValidator,
    DxRequiredRule,
    DxValidationGroup
  }
};
</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .title {
    color: $base-accent;
    font-weight: bold;
    font-size: 30px;
    margin: 0;
  }
}
</style>
