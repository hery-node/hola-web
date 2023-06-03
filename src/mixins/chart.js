export default {
  props: {
    data: { type: Array, required: true },
    height: { type: String, default: "300px" },
    maxValue: { type: Number },
    chartStyle: { type: Object, default: () => ({}) },
    type: { type: String },
    title: { type: String },
    unit: { type: String },
  },

  data() {
    return {
      loading: false,
      theme: "custom",
      chart_type: "line",
      chart_option: {},
      small_font_size: 10,
      mid_font_size: 12,
      large_font_size: 14,
    };
  },

  created() {
    this.loading = true;
    this.set_chart_option();
  },

  computed: {
    chart_height() {
      return `height: ${this.height}`;
    },
  },

  methods: {
    set_chart_option() {
      if (this.data && this.data.length > 0) {
        //invoke this first to set some option value. such as chart type and will be used in basic option
        const override_option = this.get_option ? this.get_option() : {};
        const basic_option = this.get_basic_option();
        this.chart_option = { ...basic_option, ...override_option, ...this.chartStyle };
        this.loading = false;
      }
    },

    get_basic_option() {
      const legend_length = this.data[0].length;
      const series = [...Array(legend_length - 1)].map(() => ({ type: this.chart_type }));
      const has_unit = this.unit && this.unit.trim().length > 0;
      const yAxis = has_unit ? { type: 'value', axisLabel: { show: true, formatter: '{value} ' + this.unit }, boundaryGap: ['0', '20%'] } : {};
      const has_title = this.title && this.title.trim().length > 0;
      const title = has_title ? { text: this.title, textStyle: { fontSize: this.large_font_size } } : {};
      const legend = has_title ? { show: legend_length < 20, bottom: "0%", textStyle: { fontSize: this.mid_font_size } } : {};

      yAxis.min = 0;
      if (this.maxValue) {
        yAxis.max = this.maxValue;
      } else if (has_unit && this.unit == "%") {
        yAxis.max = 100;
      }

      return {
        title: title,
        legend: legend,
        tooltip: {},
        dataset: { source: this.data },
        xAxis: { type: "category" },
        yAxis: yAxis,
        series: series
      };
    },
  },

  watch: {
    data: {
      handler() {
        this.set_chart_option();
      },
    },
  },
};