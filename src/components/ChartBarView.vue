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
      this.chart_type = this.type ? this.type : "bar";
      const series = [...Array(this.data[0].length - 1)].map(() => ({
        type: this.chart_type,
        barMaxWidth: "30px",
        barGap: "60%",
        barCategoryGap: "50%",
        label: {
          show: true,
          formatter: () => {},
          position: "top",
          fontSize: this.small_font_size,
        },
      }));
      return { series: series };
    },
  },
};
</script>
