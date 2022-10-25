export default {
  props: {
    showPercentage: { type: Boolean, default: false },
  },

  methods: {
    set_percentage(items, columes) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const values = [];
        for (let j = 0; j < columes; j++) {
          values.push(parseFloat(item["value" + j]));
        }

        const max = Math.max(...values);
        const min = Math.min(...values);
        if (!isNaN(max) && !isNaN(min) && max != min) {
          item["percentage"] = (((max - min) * 100) / min).toFixed(2) + "%";
        } else {
          item["percentage"] = "";
        }
      }
    },
  },
};