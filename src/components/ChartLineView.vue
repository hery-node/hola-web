<template>
  <div :style="chart_height" class="ma-5">
    <v-chart :option="chart_option" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>
<script>
/**
 * ChartLineView Component
 *
 * Renders line or scatter charts using ECharts with automatic series generation.
 * Extends the Chart mixin for common chart functionality.
 *
 * Features:
 * - Auto-generates series based on data columns
 * - Supports line and scatter chart types
 * - Scatter points with configurable symbol size
 * - Flexible chart type override via props
 */
import Chart from "../mixins/chart";

export default {
  inheritAttrs: false,
  mixins: [Chart],

  methods: {
    /**
     * Generate ECharts option for line or scatter chart
     * @returns {Object} Chart series configuration
     */
    get_option() {
      this.chart_type = this.type ?? "line";
      const legend_length = this.data[0].length;
      const series = this.chart_type === "scatter" ? [...Array(legend_length - 1)].map(() => ({ type: this.chart_type, symbolSize: 5 })) : [...Array(legend_length - 1)].map(() => ({ type: this.chart_type }));
      return { series };
    },
  },
};
</script>
