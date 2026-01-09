<template>
  <div :style="chart_height" class="ma-5">
    <v-chart :option="chart_option" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>
<script>
/**
 * ChartPieView Component
 *
 * Renders pie charts using ECharts with optional rose diagram style.
 * Extends the Chart mixin for common chart functionality.
 *
 * Features:
 * - Standard pie chart with percentage labels
 * - Optional rose diagram (polar area chart)
 * - Auto-generates series based on data columns
 * - Labels show name and percentage: "Label:(XX.XX%)"
 * - Hidden legend and X-axis for cleaner display
 */
import Chart from "../mixins/chart";

export default {
  inheritAttrs: false,
  mixins: [Chart],

  props: {
    /** Enable rose diagram style (polar area chart) */
    rose: { type: Boolean, default: false },
  },

  methods: {
    /**
     * Generate ECharts option for pie chart
     * @returns {Object} Chart configuration with series, legend, xAxis
     */
    get_option() {
      this.chart_type = this.type ?? "pie";
      const rose_obj = this.rose ? { roseType: "area" } : {};
      const legend = { show: false };
      const xAxis = this.rose ? { show: false } : {};
      const series = [...Array(this.data[0].length - 1)].map(() => ({
        type: this.chart_type,
        label: {
          show: true,
          fontSize: this.small_font_size,
          formatter: "{b}:({d}%)",
        },
        ...rose_obj,
      }));
      return { series, legend, xAxis };
    },
  },
};
</script>
