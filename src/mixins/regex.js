/**
 * Regex mixin for pattern-based search
 * Provides regex search functionality for filtering
 */
export default {
  props: {
    regexSearch: { type: Boolean, default: false },
  },

  methods: {
    /**
     * Test if value matches regex pattern
     * @param {*} value - Value to test
     * @param {string} search - Regex pattern
     * @returns {boolean} True if matches
     */
    regex_search(value, search) {
      if (value !== null && value !== undefined && search !== null && search !== undefined) {
        const regex = new RegExp(search, "gi");
        return regex.test(value.toString());
      }
      return false;
    },
  },
};
