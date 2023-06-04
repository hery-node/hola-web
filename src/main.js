import Vue from "vue";
import App from "./App.vue";
import ChartView from "./examples/ChartView.vue";
import Dashboard from "./examples/DashboardView.vue";
import ApplicationView from "./examples/ApplicationView.vue";

import { init_axios, init_vue_app } from "./components";

Vue.config.productionTip = false;
init_axios({ baseURL: "http://localhost:8089" });

const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);

const routes = [
    { path: '/chart', name: 'chart', component: ChartView },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/application', name: 'application', component: ApplicationView },
];

init_vue_app(App, routes, {}, {}, locales);
