import Vue from 'vue';
import VueECharts from 'vue-echarts';
// import theme from "./theme.json";
// import { registerTheme } from "echarts/core";
// registerTheme("custom", theme);

const register_echarts = () => {
    Vue.component('v-chart', VueECharts);
};

export { register_echarts }