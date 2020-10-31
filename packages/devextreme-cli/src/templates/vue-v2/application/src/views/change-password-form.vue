<template>
  <form @submit.prevent="onSubmit">
    <dx-form :form-data="formData" :disabled="loading">
      <dx-item
        data-field="password"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'Password', mode: 'password' }"
      >
        <dx-required-rule message="Password is required" />
        <dx-label :visible="false" />
      </dx-item>
      <dx-item
        data-field="confirmedPassword"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'Confirm Password', mode: 'password' }"
      >
        <dx-required-rule message="Password is required" />
        <dx-custom-rule
          message="Passwords do not match"
          :validation-callback="confirmPassword"
        />
        <dx-label :visible="false" />
      </dx-item>
      <dx-button-item>
        <dx-button-options
          width="100%"
          type="default"
          template="changePassword"
          :use-submit-behavior="true"
        >
        </dx-button-options>
      </dx-button-item>

      <template #changePassword>
        <div>
          <span class="dx-button-text">
              <dx-loadIndicator v-if="loading" width="24px" height="24px" :visible="true" />
              <span v-if="!loading">Continue</span>
          </span>
        </div>
      </template>
    </dx-form>
  </form>
</template>

<script>
import DxForm, {
  DxItem,
  DxLabel,
  DxButtonItem,
  DxButtonOptions,
  DxCustomRule,
  DxRequiredRule
} from 'devextreme-vue/form';
import DxLoadIndicator from 'devextreme-vue/load-indicator';
import notify from 'devextreme/ui/notify';

import auth from "../auth";

export default {
components: {
    DxForm,
    DxItem,
    DxLabel,
    DxButtonItem,
    DxButtonOptions,
    DxRequiredRule,
    DxCustomRule,
    DxLoadIndicator
  },
  created() {
    this.recoveryCode = this.$route.params.recoveryCode;
  },
  data() {
    return {
        formData: {},
        loading: false,
        recoveryCode: ""
    }
  },
  /* eslint-disable  no-debugger */
  methods: {
    onSubmit: async function() {
    const { password } = this.formData;
    this.loading = true;

    const result = await auth.changePassword(password, this.recoveryCode);
    this.loading = false;

      if (result.isOk) {
        this.$router.push("/login-form");
      } else {
        notify(result.message, 'error', 2000);
      }
    },
    confirmPassword(e) {
      return e.value === this.formData.password;
    }
  }
}
</script>

<style>

</style>
