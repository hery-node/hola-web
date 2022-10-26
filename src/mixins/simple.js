export default {
  props: {
    simpleValue: { type: Boolean, default: false },
  },

  methods: {
    convert_to_simple_value(items, columes) {
      const thousand = 1000;
      const million = thousand * 1000;
      const billion = million * 1000;
      const trilion = billion * 1000;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        for (let j = 0; j < columes; j++) {
          const value = columes == 1 ? parseFloat(item["value"]) : parseFloat(item["value" + j]);

          if (!isNaN(value)) {
            let converted = 0;
            if (value > trilion) {
              converted = (value / trilion).toFixed(2) + " T";
            } else if (value > billion) {
              converted = (value / billion).toFixed(2) + " B";
            } else if (value > million) {
              converted = (value / million).toFixed(2) + " M";
            } else if (value > thousand) {
              converted = (value / thousand).toFixed(2) + " K";
            } else {
              converted = value;
            }
            if (columes == 1) {
              item["value"] = converted;
            } else {
              item["value" + j] = converted;
            }
          }
        }
      }
    },
  },
};