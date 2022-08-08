import Vue from "vue";

import App from "./App";
import router from "./router";
import appInfo from "./app-info";

import themes from "devextreme/ui/themes";

Vue.config.productionTip = false;
Vue.prototype.$appInfo = appInfo;

themes.initialized(() => {
  new Vue({
    router,
    render: h => h(App)
  }).$mount("#app");
});