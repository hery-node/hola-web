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
      if (this.data[0].length < 2) {
        return;
      }

      const rotate = this.data.length < 6 ? 0 : 10;
      this.chart_type = this.type ? this.type : "bar";

      const label_setting = {
        label: {
          show: true,
          formatter: (e) => {
            const data = e.data;
            const value = data[data.length - 2];
            return value && value.toFixed ? value.toFixed(2) : "0";
          },
          position: "right",
          fontSize: this.mid_font_size,
        },
      };

      const line_label_setting = {
        label: {
          show: true,
          formatter: (e) => {
            const data = e.data;
            const value = data[data.length - 1];
            return value && value.toFixed ? value.toFixed(2) : "0";
          },
          position: "top",
          color: "#FF1744",
          padding: [0, 0, 15, 0],
          fontSize: this.large_font_size,
        },
      };

      const series = [...Array(this.data[0].length - 2)].map(() => ({
        type: this.chart_type,
        barMaxWidth: "50px",
        ...label_setting,
      }));
      series.push({ type: "line", ...line_label_setting, yAxisIndex: 1 });

      const xAxis = {
        type: "category",
        axisLabel: {
          show: true,
          interval: 0,
          rotate: rotate,
        },
      };

      const legend = { top: "3%" };
      const yAxis = [{ type: "value" }, { type: "value" }];
      return { series: series, xAxis: xAxis, yAxis: yAxis, legend: legend };
    },
  },
};
</script>
