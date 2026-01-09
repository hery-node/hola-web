/**
 * Wrap mixin for text wrapping and newline conversion
 * Provides utilities to split long text into multiple lines
 */
export default {
  props: {
    maxLineWords: { type: Number, default: 50 },
  },

  methods: {
    /**
     * Split string into multiple lines by max length
     * @param {string} str - String to split
     * @returns {string} Multi-line string
     */
    split_to_multiline(str) {
      const arr = [];
      let index = 0;
      while (index < str.length) {
        arr.push(str.slice(index, (index += this.maxLineWords)));
      }
      return arr.join("\n");
    },

    /**
     * Check if value has meaningful content
     * @param {*} value - Value to check
     * @returns {boolean} True if has value
     */
    has_value(value) {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === "string" && value.trim().length === 0) {
        return false;
      }
      return true;
    },

    /**
     * Convert long values to newline-separated format
     * @param {*} value - Value to convert
     * @returns {string} Wrapped string or empty
     */
    convert_long_to_newline(value) {
      if (!this.has_value(value)) {
        return "";
      }

      if (typeof value === "string" || value instanceof String) {
        return (value.length <= this.maxLineWords || this.maxLineWords === -1)
          ? value
          : this.split_to_multiline(value);
      }

      if (typeof value === "object" && value !== null) {
        const str = JSON.stringify(value, null, 2);
        return (str.length <= this.maxLineWords || this.maxLineWords === -1)
          ? str
          : this.split_to_multiline(str);
      }

      return value;
    },
  },
};
