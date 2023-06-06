<template>
  <div ref="chart" :class="styles">{{ message }}</div>
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
