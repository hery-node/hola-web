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
 * ChartBarView Component
 *
 * Renders bar charts using ECharts with automatic series generation.
 * Uses the useChart composable for common chart functionality.
 *
 * Features:
 * - Auto-generates series based on data columns
 * - Fixed bar width and spacing (30px max, 60% gap)
 * - Top-positioned labels with configurable font size
 * - Supports custom chart type override
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
const { loading, theme, chartType, chartOption, chartHeight, smallFontSize, setChartOption } = useChart({
  data: toRef(props, "data"),
  height: props.height,
  maxValue: props.maxValue,
  chartStyle: props.chartStyle,
  type: props.type,
  title: props.title,
  unit: props.unit,
  getOption: () => {
    chartType.value = props.type ?? "bar";
    const series = [...Array(props.data[0]?.length - 1 || 0)].map(() => ({
      type: chartType.value,
      barMaxWidth: "30px",
      barGap: "60%",
      barCategoryGap: "50%",
      label: {
        show: true,
        formatter: () => "",
        position: "top",
        fontSize: smallFontSize,
      },
    }));
    return { series };
  },
});

// Watch for data changes
watch(() => props.data, setChartOption);
</script>
