<template>
  <div ref="chart" :class="styles">{{ message }}</div>
</template>

<script>
/**
 * ChartSimpleView Component
 * 
 * A simple chart component using Chartist library for lightweight charts.
 * Supports Bar, Line, and Pie charts with responsive options and custom event handlers.
 * 
 * Features:
 * - Chartist-based rendering (lighter than ECharts)
 * - Responsive chart ratios (square, golden, etc.)
 * - Custom event handlers support
 * - Responsive options for different screen sizes
 * - No-data state with custom message
 * - Auto-redraw on data/options change
 */
import { LineChart, BarChart, PieChart } from "chartist";

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
    /** Chart aspect ratio class (ct-square, ct-minor-seventh, etc.) */
    ratio: { type: String, default: "ct-square" },
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
    /** Array of {event, fn} objects for chart events */
    eventHandlers: {
      type: Array,
      default() {
        return [];
      },
    },
    /** Responsive options for different breakpoints */
    responsiveOptions: {
      type: Array,
      default() {
        return [];
      },
    },
    /** No data configuration */
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
    /** @returns {Array} CSS classes for chart container */
    styles() {
      return [this.ratio, { [this.noDataOptions.class]: this.hasNoData }];
    },

    /**
     * Check if chart has no valid data to display
     * @returns {boolean} True if no data available
     */
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
    
    /** @returns {Object} No data message and class */
    noDataOptions() {
      return {
        message: this.options.messageNoData || this.noData.message,
        class: this.options.classNoData || this.noData.class,
      };
    },
  },

  methods: {
    /** Clear no-data message */
    clear() {
      this.message = "";
    },

    /** Draw chart using Chartist library */
    draw() {
      if (this.hasNoData) {
        this.chart = null;
      } else {
        if (this.type === "Bar") {
          this.chart = new BarChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        } else if (this.type === "Pie") {
          this.chart = new PieChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        } else {
          this.chart = new LineChart(this.$refs.chart, this.data, this.options, this.responsiveOptions);
        }
      }

      this.setEventHandlers();
    },

    /** Redraw chart with updated data */
    redraw() {
      this.chart ? this.chart.update(this.data, this.options) : this.draw();
    },

    /**
     * Reset event handlers when they change
     * @param {Array} eventHandlers - New event handlers
     * @param {Array} oldEventHandler - Old event handlers to remove
     */
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

    /** Attach event handlers to chart */
    setEventHandlers() {
      if (this.chart && this.eventHandlers) {
        for (let item of this.eventHandlers) {
          this.chart.on(item.event, item.fn);
        }
      }
    },

    /** Set no-data message */
    setNoData() {
      this.message = this.noDataOptions.message;
    },
  },
};
</script>
