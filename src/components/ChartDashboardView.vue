<template>
  <h-card class="v-card--material-chart">
    <h-chart v-bind="$attrs" v-on="$listeners"></h-chart>
    <h4 class="title font-weight-light black--text" v-text="title" />
    <v-icon class="mr-2" small :color="subIconColor"> {{ subIcon }}</v-icon>
    <span class="caption grey--text font-weight-light" v-text="subText" />
  </h-card>
</template>

<script>
import Chart from "../mixins/chart";
export default {
  inheritAttrs: false,
  mixins: [Chart],

  props: {
    title: { type: String },
    subIcon: { type: String },
    subIconColor: { type: String },
    subText: { type: String },
    subTextColor: { type: String },
  },
};
</script>

<style lang="scss">
.v-card--material-chart {
  .v-card--material__header {
    .ct-label {
      color: inherit;
      opacity: 0.7;
      font-size: 0.975rem;
      font-weight: 100;
    }

    .ct-grid {
      stroke: rgba(255, 255, 255, 0.2);
    }
    .ct-series-a .ct-point,
    .ct-series-a .ct-line,
    .ct-series-a .ct-bar,
    .ct-series-a .ct-slice-donut {
      stroke: rgba(255, 255, 255, 0.8);
    }
    .ct-series-a .ct-slice-pie,
    .ct-series-a .ct-area {
      fill: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>
