<template>
  <h-card class="v-card--material-chart" v-bind="$attrs" v-on="$listeners">
    <h-simple-chart slot="header" :type="type" :options="options" :data="data"></h-simple-chart>
    <h4 class="title font-weight-light black--text">{{ title }}</h4>
    <v-icon class="mr-2" small :color="subIconColor">{{ subIcon }}</v-icon>
    <span class="caption grey--text font-weight-light">{{ subText }}</span>
  </h-card>
</template>

<script>
/**
 * ChartDashboardView Component
 *
 * A material design card component that displays a simple chart in the header.
 * Used for dashboard widgets to show key metrics with visual representation.
 *
 * Features:
 * - Material design card with offset chart header
 * - Supports Pie, Line, and Bar chart types
 * - Icon with customizable color
 * - Title and subtitle text
 * - Chartist integration for simple charts
 */
export default {
  inheritAttrs: false,

  props: {
    /** Chart type: Pie, Line, or Bar */
    type: {
      type: String,
      required: true,
      validator(val) {
        return val === "Pie" || val === "Line" || val === "Bar";
      },
    },
    /** Card title text */
    title: { type: String },
    /** Subtitle text below icon */
    subText: { type: String },
    /** Material Design icon name */
    subIcon: { type: String },
    /** Icon color */
    subIconColor: { type: String },
    /** Chart data with series and labels */
    data: {
      type: Object,
      default() {
        return { series: [], labels: [] };
      },
    },
    /** Chart configuration options */
    options: {
      type: Object,
      default() {
        return {};
      },
    },
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
