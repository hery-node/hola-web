/**
 * Fuzzy matching mixin for comparing object attributes
 * Provides string similarity calculation and attribute merging
 */
export default {
  props: {
    similar: { type: Number, default: 80 },
    showFuzzyMatch: { type: Boolean, default: false },
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
    /**
     * Calculate string similarity (0-200)
     * @param {string} x - First string
     * @param {string} y - Second string
     * @returns {number} Similarity score (0-200)
     */
    str_similar(x, y) {
      let match_count = 0;
      let str_x = x.toUpperCase().replace('_', '');
      let str_y = y.toUpperCase().replace('_', '');

      if (typeof str_x === "string") {
        str_x = str_x.split("");
        str_y = str_y.split("");
      }

      const total_length = str_x.length + str_y.length;
      str_x.sort();
      str_y.sort();

      let char_x = str_x.shift();
      let char_y = str_y.shift();

      while (char_x !== undefined && char_y !== undefined) {
        if (char_x === char_y) {
          match_count++;
          char_x = str_x.shift();
          char_y = str_y.shift();
        } else if (char_x < char_y) {
          char_x = str_x.shift();
        } else {
          char_y = str_y.shift();
        }
      }

      return (match_count / total_length) * 200;
    },

    /**
     * Merge attributes from multiple objects with fuzzy matching
     * @param {Array<Object>} objs - Objects to merge
     * @returns {Object} { merged_attributes: Array, map: Object }
     */
    merge_attributes(objs) {
      if (this.fuzzy_match && objs.length === 2) {
        const key1 = Object.keys(objs[0]);
        const key2 = Object.keys(objs[1]);
        const left = [];
        const key1_diff = key1.filter(x => !key2.includes(x));
        const key2_diff = key2.filter(x => !key1.includes(x));
        const map = {};

        for (let i = 0; i < key2_diff.length; i++) {
          const attr2 = key2_diff[i];
          let best_match = "";
          let best_score = 0;

          for (let j = 0; j < key1_diff.length; j++) {
            const attr1 = key1_diff[j];
            const score = this.str_similar(attr1, attr2);
            if (score > best_score) {
              best_match = attr1;
              best_score = score;
            }
          }

          if (best_score > this.similar) {
            map[best_match] = attr2;
          } else {
            left.push(attr2);
          }
        }

        return { merged_attributes: [...key1, ...left], map };
      } else {
        const attributes = [];
        for (let i = 0; i < objs.length; i++) {
          if (objs[i]) {
            attributes.push(...Object.keys(objs[i]));
          }
        }
        return { merged_attributes: [...new Set(attributes)], map: {} };
      }
    },
  },

  computed: {
    /**
     * Show fuzzy match toggle if exactly 2 objects
     * @returns {boolean}
     */
    show_fuzzy_match() {
      return this.showFuzzyMatch && this.objs?.length === 2;
    },

    /**
     * Get fuzzy match label (custom or i18n)
     * @returns {string}
     */
    show_fuzzy_label() {
      return this.fuzzyLabel ?? this.$t("compare.fuzzy_label");
    },
  }
};
