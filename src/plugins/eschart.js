import Vue from 'vue';
import "echarts";
import ECharts from 'vue-echarts';
import theme from "./theme.json";

import { registerTheme } from "echarts/core";
registerTheme("custom", theme);

const register_echarts = () => {
    Vue.component('v-chart', ECharts);
};

export { register_echarts }