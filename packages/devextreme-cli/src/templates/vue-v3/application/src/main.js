import { createApp }  from "vue";
import router from "./router";
import themes from "devextreme/ui/themes";

import App from "./App.vue";
import appInfo from "./app-info";

themes.initialized(() => {
    const app = createApp(App);
    app.use(router);
    app.config.globalProperties.$appInfo = appInfo;
    app.mount('#app');
});
