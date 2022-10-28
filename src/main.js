import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

import { init_axios, setup_components } from "./components";
import i18n from "./i18n";

Vue.config.productionTip = false;
setup_components();

init_axios(
  { baseURL: "http://localhost:8089" },
  {
    handle_response: () => {
      // console.log(code);
      // console.log(data);
    },
  }
);

new Vue({
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
