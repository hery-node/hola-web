export default {
  props: {
    maxLineWords: { type: Number, default: 50 },
  },

  methods: {
    split_to_multiline(str) {
      const arr = [];
      let index = 0;
      while (index < str.length) {
        arr.push(str.slice(index, (index += this.maxLineWords)));
      }
      return arr.join("\n");
    },

    has_value(value) {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value == "undefined") {
        return false;
      }
      if (typeof value === "string" && value.trim().length === 0) {
        return false;
      }
      return true;
    },

    convert_long_to_newline(value) {
      if (!this.has_value(value)) {
        return "";
      }

      if (typeof value === "string" || value instanceof String) {
        return (value.length <= this.maxLineWords || this.maxLineWords == -1) ? value : this.split_to_multiline(value);
      }

      if (typeof value === "object" && value !== null) {
        const str = JSON.stringify(value, null, 2);
        return (str.length <= this.maxLineWords || this.maxLineWords == -1) ? str : this.split_to_multiline(str);
      }

      return value;
    },
  },
};
