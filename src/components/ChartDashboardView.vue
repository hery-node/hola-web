<template>
  <h-card v-bind="$attrs" class="v-card--material-chart" v-on="$listeners">
    <div slot="header" ref="chart" :class="styles">{{ message }}</div>
    <h4 class="title font-weight-light black--text">{{ title }}</h4>
    <v-icon class="mr-2" small :color="subIconColor">{{ subIcon }}</v-icon>
    <span class="caption grey--text font-weight-light">{{ subText }}</span>
  </h-card>
</template>

<script>
import { LineChart, BarChart, PieChart } from "chartist";

export default {
  inheritAttrs: false,

  props: {
    type: {
      type: String,
      required: true,
      validator(val) {
        return val === "Pie" || val === "Line" || val === "Bar";
      },
    },
    title: { type: String },
    subText: { type: String },
    subIcon: { type: String },
    subIconColor: { type: String },
    ratio: { type: String, default: "ct-square" },
    data: {
      type: Object,
      default() {
        return { series: [], labels: [] };
      },
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    eventHandlers: {
      type: Array,
      default() {
        return [];
      },
    },
    responsiveOptions: {
      type: Array,
      default() {
        return [];
      },
    },

    noData: {
      type: Object,
      default() {
        return {
          message: "",
          class: "ct-nodata",
        };
      },
    },
  },

  data() {
    return {
      chart: null,
      message: "",
    };
  },

  watch: {
    ratio: "redraw",
    options: { handler: "redraw", deep: true },
    responsiveOptions: { handler: "redraw", deep: true },
    data: { handler: "redraw", deep: true },
    type: "draw",
    eventHandlers: "resetEventHandlers",
    hasNoData: {
      immediate: true,
      handler(val) {
        if (val) {
          this.setNoData();
        } else {
          this.clear();
        }
      },
    },
  },

  mounted() {
    this.draw();
  },

  computed: {
    styles() {
      return [this.ratio, { [this.noDataOptions.class]: this.hasNoData }];
    },

    hasNoData() {
      return (
        !this.data ||
        !this.data.series ||
        this.data.series.length < 1 ||
        (this.type !== "Pie" &&
          !this.options.distributeSeries &&
          this.data.series.every((series) => {
            if (Array.isArray(series)) {
              return !series.length;
            }
            return !series.data.length;
          }))
      );
    },
    noDataOptions() {
      return {
        message: this.options.messageNoData || this.noData.message,
        class: this.options.classNoData || this.noData.class,
      };
    },
  },

  methods: {
    clear() {
      this.message = "";
    },

    draw() {
      if (this.hasNoData) {
        this.chart = null;
      } else {
        if (this.type == "Bar") {
          this.chart = new BarChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        } else if (this.type == "Pie") {
          this.chart = new PieChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        } else {
          this.chart = new LineChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        }
      }

      this.setEventHandlers();
    },

    redraw() {
      this.chart ? this.chart.update(this.data, this.options) : this.draw();
    },

    resetEventHandlers(eventHandlers, oldEventHandler) {
      if (!this.chart) {
        return;
      }
      for (let item of oldEventHandler) {
        this.chart.off(item.event, item.fn);
      }
      for (let item of eventHandlers) {
        this.chart.on(item.event, item.fn);
      }
    },

    setEventHandlers() {
      if (this.chart && this.eventHandlers) {
        for (let item of this.eventHandlers) {
          this.chart.on(item.event, item.fn);
        }
      }
    },

    setNoData() {
      this.message = this.noDataOptions.message;
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
