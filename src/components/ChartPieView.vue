<template>
  <div :style="chartHeight" class="ma-5">
    <v-chart :option="chartOption" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import { VChart } from "@/plugins/echarts";
import { useChart } from "@/composables/useChart";
import type { ChartData, ChartStyle } from "@/types";

/**
 * ChartPieView Component
 *
 * Renders pie charts using ECharts with optional rose diagram style.
 * Uses the useChart composable for common chart functionality.
 *
 * Features:
 * - Standard pie chart with percentage labels
 * - Optional rose diagram (polar area chart)
 * - Auto-generates series based on data columns
 * - Labels show name and percentage: "Label:(XX.XX%)"
 * - Hidden legend and X-axis for cleaner display
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
    rose?: boolean;
  }>(),
  {
    height: "300px",
    chartStyle: () => ({}),
    rose: false,
  }
);

// Use chart composable
const { loading, theme, chartType, chartOption, chartHeight, smallFontSize, setChartOption } = useChart({
  data: toRef(props, "data"),
  height: props.height,
  maxValue: props.maxValue,
  chartStyle: props.chartStyle,
  type: props.type,
  title: props.title,
  unit: props.unit,
  getOption: () => {
    chartType.value = props.type ?? "pie";
    const roseObj = props.rose ? { roseType: "area" } : {};
    const legend = { show: false };
    const xAxis = props.rose ? { show: false } : {};
    const series = [...Array(props.data[0]?.length - 1 || 0)].map(() => ({
      type: chartType.value,
      label: {
        show: true,
        fontSize: smallFontSize,
        formatter: "{b}:({d}%)",
      },
      ...roseObj,
    }));
    return { series, legend, xAxis };
  },
});

// Watch for data changes
watch(() => props.data, setChartOption);
</script>
