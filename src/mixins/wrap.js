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

    convert_long_to_newline(value) {
      if (!value && value != 0) {
        return "";
      }

      if (typeof value === "string" || value instanceof String) {
        return value.length <= this.maxLineWords ? value : this.split_to_multiline(value);
      }

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const str = JSON.stringify(value);
        return str.length <= this.maxLineWords ? str : this.split_to_multiline(str);
      }

      return value;
    },
  },
};
