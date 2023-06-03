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

  methods: {
    get_option() {
      this.chart_type = this.type ? this.type : "line";
      const legend_length = this.data[0].length;
      const series = this.chart_type == "scatter" ? [...Array(legend_length - 1)].map(() => ({ type: this.chart_type, symbolSize: 5 })) : [...Array(legend_length - 1)].map(() => ({ type: this.chart_type }));
      return { series: series };
    },
  },
};
</script>
