export default {
  props: {
    regexSearch: { type: Boolean, default: false },
  },

  methods: {
    regex_search(value, search) {
      if (value != null && search != null) {
        const regex = new RegExp(search, "gi");
        return regex.test(value.toString());
      } else {
        return false;
      }
    },
  },
};
