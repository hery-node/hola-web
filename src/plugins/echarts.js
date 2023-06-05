import Vue from 'vue';
import * as echarts from 'echarts/core';
import VueChartist from 'vue-chartist';

import {
    BarChart,
    LineChart,
    ScatterChart,
    PieChart
} from "echarts/charts";

import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent
} from "echarts/components";

import { CanvasRenderer } from "echarts/renderers";
import { LabelLayout, UniversalTransition } from "echarts/features";

import ECharts from 'vue-echarts';
import theme from "./theme.json";

function setup_echarts() {
    Vue.use(VueChartist);

    echarts.registerTheme("custom", theme);
    echarts.use([
        TitleComponent,
        TooltipComponent,
        GridComponent,
        DatasetComponent,
        TransformComponent,
        LegendComponent,
        BarChart,
        PieChart,
        LineChart,
        ScatterChart,
        LabelLayout,
        UniversalTransition,
        CanvasRenderer
    ]);
    Vue.component('v-chart', ECharts);
}

export { setup_echarts };