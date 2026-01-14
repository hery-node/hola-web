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
 * ChartComboView Component
 *
 * Renders combination charts (bar + line) using ECharts.
 * Displays multiple bar series with a line series on a secondary Y-axis.
 *
 * Features:
 * - Auto-generated bar series with value labels
 * - Line series with highlighted top labels
 * - Dual Y-axis support
 * - Automatic label rotation based on data count
 * - Value formatting with 2 decimal places
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
const { loading, theme, chartType, chartOption, chartHeight, midFontSize, largeFontSize, setChartOption } = useChart({
  data: toRef(props, "data"),
  height: props.height,
  maxValue: props.maxValue,
  chartStyle: props.chartStyle,
  type: props.type,
  title: props.title,
  unit: props.unit,
  getOption: () => {
    if (!props.data[0] || props.data[0].length < 2) {
      return {};
    }

    const rotate = props.data.length < 6 ? 0 : 10;
    chartType.value = props.type ?? "bar";

    const labelSetting = {
      label: {
        show: true,
        formatter: (e: { data: number[] }) => {
          const data = e.data;
          const value = data[data.length - 2];
          return value?.toFixed ? value.toFixed(2) : "0";
        },
        position: "right",
        fontSize: midFontSize,
      },
    };

    const lineLabelSetting = {
      label: {
        show: true,
        formatter: (e: { data: number[] }) => {
          const data = e.data;
          const value = data[data.length - 1];
          return value?.toFixed ? value.toFixed(2) : "0";
        },
        position: "top",
        color: "#FF1744",
        padding: [0, 0, 15, 0],
        fontSize: largeFontSize,
      },
    };

    const series: Record<string, unknown>[] = [...Array(props.data[0].length - 2)].map(() => ({
      type: chartType.value,
      barMaxWidth: "50px",
      ...labelSetting,
    }));
    series.push({ type: "line", ...lineLabelSetting, yAxisIndex: 1 });

    const xAxis = {
      type: "category",
      axisLabel: {
        show: true,
        interval: 0,
        rotate,
      },
    };

    const legend = { top: "3%" };
    const yAxis = [{ type: "value" }, { type: "value" }];
    return { series, xAxis, yAxis, legend };
  },
});

// Watch for data changes
watch(() => props.data, setChartOption);
</script>
