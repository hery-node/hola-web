export default {
  data() {
    return { colors: { type: Object, default: () => { } } };
  },

  methods: {
    get_color(item) {
      const attr = item["attr"];

      if (this.colors && this.colors[attr]) {
        return this.colors[attr];
      } else {
        return "";
      }
    },
  },
};
