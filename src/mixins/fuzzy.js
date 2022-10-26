export default {
  props: {
    similar: { type: Number, default: 80 },
    fuzzyLabel: { type: String },
  },

  data() {
    return {
      fuzzy_match: false,
    };
  },

  watch: {
    fuzzy_match: {
      handler() {
        this.parse_data();
      },
      deep: true,
    },
  },

  methods: {
    str_similar(x, y) {
      var z = 0;
      x = x.toUpperCase();
      y = y.toUpperCase();
      x = x.replace('_', '');
      y = y.replace('_', '');
      if (typeof x == "string") {
        x = x.split("");
        y = y.split("");
      }
      var s = x.length + y.length;
      x.sort();
      y.sort();
      var a = x.shift();
      var b = y.shift();
      while (a !== undefined && b != undefined) {
        if (a === b) {
          z++;
          a = x.shift();
          b = y.shift();
        } else if (a < b) {
          a = x.shift();
        } else if (a > b) {
          b = y.shift();
        }
      }
      return z / s * 200;
    },

    merge_attributes(objs) {
      if (this.fuzzy_match && objs.length == 2) {
        const key1 = Object.keys(objs[0]);
        const key2 = Object.keys(objs[1]);
        const left = [];
        const key1_diff = key1.filter(x => !key2.includes(x))
        const key2_diff = key2.filter(x => !key1.includes(x));
        const map = {};
        for (let i = 0; i < key2_diff.length; i++) {
          const arr = key2_diff[i];
          let match = "";
          let value = 0;
          for (let j = 0; j < key1_diff.length; j++) {
            const attr1 = key1_diff[j];
            const match_value = this.str_similar(attr1, arr);
            if (match_value > value) {
              match = attr1;
              value = match_value;
            }
          }
          if (value > this.similar) {
            map[match] = arr;
          } else {
            left.push(arr);
          }
        }
        return { merged_attributes: [...key1, ...left], map: map };

      } else {
        const attributes = [];
        for (let i = 0; i < objs.length; i++) {
          attributes.push(...(Object.keys(objs[i])));
        }
        return { merged_attributes: [...new Set(attributes)], map: {} };
      }
    },
  },

  computed: {
    show_fuzzy_match() {
      return this.objs.length == 2;
    },

    show_fuzzy_label() {
      return this.fuzzyLabel ? this.fuzzyLabel : this.$t("compare.fuzzy_label");
    },
  }
};
