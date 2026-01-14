<template>
  <div :style="chartHeight" class="ma-5">
    <v-chart :option="chartOption" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import VChart from "vue-echarts";
import { useChart } from "@/composables/useChart";
import type { ChartData, ChartStyle } from "@/types";

/**
 * ChartLineView Component
 *
 * Renders line or scatter charts using ECharts with automatic series generation.
 * Uses the useChart composable for common chart functionality.
 *
 * Features:
 * - Auto-generates series based on data columns
 * - Supports line and scatter chart types
 * - Scatter points with configurable symbol size
 * - Flexible chart type override via props
 */

// Props
const props = withDefaults(
  defineProps<{
    data: ChartData;
    height?: string;
    maxValue?: number;
    chartStyle?: ChartStyle;
    type?: string;
    title?: string;
    unit?: string;
  }>(),
  {
    height: "300px",
    chartStyle: () => ({}),
  }
);

// Use chart composable
const { loading, theme, chartType, chartOption, chartHeight, setChartOption } = useChart({
  data: toRef(props, "data"),
  height: props.height,
  maxValue: props.maxValue,
  chartStyle: props.chartStyle,
  type: props.type,
  title: props.title,
  unit: props.unit,
  getOption: () => {
    chartType.value = props.type ?? "line";
    const legendLength = props.data[0]?.length ?? 0;
    const series = chartType.value === "scatter" ? [...Array(legendLength - 1)].map(() => ({ type: chartType.value, symbolSize: 5 })) : [...Array(legendLength - 1)].map(() => ({ type: chartType.value }));
    return { series };
  },
});

// Watch for data changes
watch(() => props.data, setChartOption);
</script>
