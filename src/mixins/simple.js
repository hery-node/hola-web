/**
 * Simple value mixin for converting large numbers to K/M/B/T format
 * Provides human-readable number formatting
 */

const THOUSAND = 1000;
const MILLION = THOUSAND * 1000;
const BILLION = MILLION * 1000;
const TRILLION = BILLION * 1000;

export default {
  props: {
    simpleValue: { type: Boolean, default: false },
  },

  methods: {
    /**
     * Convert large numbers to simplified format (K/M/B/T)
     * @param {Array<Object>} items - Items with value properties
     * @param {number} columns - Number of value columns
     */
    convert_to_simple_value(items, columns) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        for (let j = 0; j < columns; j++) {
          const key = columns === 1 ? "value" : `value${j}`;
          const value = parseFloat(item[key]);

          if (!isNaN(value)) {
            let converted;
            if (value > TRILLION) {
              converted = (value / TRILLION).toFixed(2) + " T";
            } else if (value > BILLION) {
              converted = (value / BILLION).toFixed(2) + " B";
            } else if (value > MILLION) {
              converted = (value / MILLION).toFixed(2) + " M";
            } else if (value > THOUSAND) {
              converted = (value / THOUSAND).toFixed(2) + " K";
            } else {
              converted = value;
            }
            item[key] = converted;
          }
        }
      }
    },
  },
};