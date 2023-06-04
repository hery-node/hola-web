<template>
  <h-card v-bind="$attrs" class="v-card--material-chart" v-on="$listeners">
    <chartist slot="header" :data="data" :event-handlers="eventHandlers" :options="options" :ratio="ratio" :responsive-options="responsiveOptions" :type="type" />
    <h4 class="title font-weight-light black--text">{{ title }}</h4>
    <v-icon class="mr-2" small :color="subIconColor">{{ subIcon }}</v-icon>
    <span class="caption grey--text font-weight-light">{{ subText }}</span>
  </h-card>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    data: { type: Object, default: () => ({}) },
    eventHandlers: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({ height: "300px", chartPadding: { top: 20, right: 0, bottom: 0, left: 0 } }) },
    ratio: { type: String, default: undefined },
    responsiveOptions: { type: Array, default: () => [] },
    type: { type: String, required: true, validator: (v) => ["Bar", "Line", "Pie"].includes(v) },
    title: { type: String },
    subText: { type: String },
    subIcon: { type: String },
    subIconColor: { type: String },
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
