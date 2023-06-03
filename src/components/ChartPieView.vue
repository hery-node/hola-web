<template>
  <div :style="chart_height" class="ma-5">
    <v-chart :option="chart_option" autoresize v-bind="$attrs" :theme="theme" :loading="loading" :update-options="{ notMerge: true }"></v-chart>
  </div>
</template>
<script>
import Chart from "../mixins/chart";

export default {
  inheritAttrs: false,
  mixins: [Chart],

  props: {
    rose: { type: Boolean, default: false },
  },

  methods: {
    get_option() {
      this.chart_type = this.type ? this.type : "pie";
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
      return { series: series, legend: legend, xAxis: xAxis };
    },
  },
};
</script>
