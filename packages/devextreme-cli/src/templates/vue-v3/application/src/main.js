import { createApp }  from "vue";
import router from "./router";

import App from "./App";
import appInfo from "./app-info";
import themes from "devextreme/ui/themes";

themes.initialized(() => {
    const app = createApp(App);
    app.use(router);
    app.config.globalProperties.$appInfo = appInfo;
    app.mount('#app');
});