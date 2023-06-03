import Vue from "vue";
import App from "./App.vue";
import { init_axios, init_vue_app } from "./components";

Vue.config.productionTip = false;
init_axios({ baseURL: "http://localhost:8089" });

const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
init_vue_app(App, [], {}, {}, locales);
