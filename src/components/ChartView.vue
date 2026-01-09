<template>
  <div :style="chart_height" class="ma-5">
    <v-chart :option="chart_option" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>
<script>
/**
 * ChartView Component
 * 
 * A minimal chart component that extends the Chart mixin.
 * Provides basic chart rendering with automatic type defaulting to line.
 * 
 * Features:
 * - Extends Chart mixin for full chart capabilities
 * - Auto-resize support
 * - Default line chart type
 * - Theme support
 * - Loading state
 */
import Chart from "../mixins/chart";

export default {
  inheritAttrs: false,
  mixins: [Chart],

  methods: {
    /**
     * Generate ECharts option
     * @returns {Object} Empty options object (relies on mixin defaults)
     */
    get_option() {
      this.chart_type = this.type ?? "line";
      return {};
    },
  },
};
</script>
