import * as echarts from 'echarts/core';
import {
    LineChart,
    ScatterChart,
    BarChart,
    PieChart
} from 'echarts/charts';

import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DatasetComponent
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';
echarts.use(
    [
        TitleComponent,
        TooltipComponent,
        GridComponent,
        LineChart,
        ScatterChart,
        BarChart,
        PieChart,
        LegendComponent,
        DatasetComponent,
        CanvasRenderer
    ]
);

import Vue from 'vue';
import ECharts from 'vue-echarts';
import theme from "./theme.json";

import { registerTheme } from "echarts/core";
registerTheme("custom", theme);

const register_echarts = () => {
    Vue.component('v-chart', ECharts);
};

export { register_echarts }
