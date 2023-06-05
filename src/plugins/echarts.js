import Vue from 'vue';
import VueChartist from 'vue-chartist';
import VueECharts from 'vue-echarts';
import theme from "./theme.json";

function setup_echarts() {
    Vue.use(VueChartist);
    window.echarts && window.echarts.registerTheme("custom", theme);
    Vue.component('v-chart', VueECharts);
}

export { setup_echarts };