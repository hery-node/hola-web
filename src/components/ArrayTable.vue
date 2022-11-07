<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="search_hint" single-line hide-details clearable></v-text-field>
    </v-toolbar>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :search="search" disable-pagination hide-default-footer fixed-header :custom-filter="regex_search"> </v-data-table>
  </v-card>
</template>

<script>
import Regex from "../mixins/regex";
import Wrap from "../mixins/wrap";

export default {
  inheritAttrs: false,
  mixins: [Regex, Wrap],

  props: {
    objs: { type: Array, required: true },
    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
  },

  data() {
    return {
      search: "",
      items: [],
      table_headers: [],
    };
  },

  async created() {
    this.parse_data();
  },

  computed: {
    search_hint() {
      return this.searchHint ? this.searchHint : this.$t("table.search");
    },
  },

  watch: {
    objs: {
      handler() {
        this.parse_data();
      },
      deep: true,
    },
  },

  methods: {
    merge_properties() {
      const properties = [];
      for (let i = 0; i < this.objs.length; i++) {
        const obj = this.objs[i];
        obj && properties.push(...Object.keys(obj));
      }
      return [...new Set(properties)];
    },

    parse_data() {
      if (!this.objs || this.objs.length == 0) {
        return;
      }

      const headers = [];
      const items = [];
      const properties = this.merge_properties();
      for (const property of properties) {
        headers.push({ text: this.headerUppcase ? property.toUpperCase() : property, value: property, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }

      for (const obj of this.objs) {
        const item = {};
        for (const property in obj) {
          item[property] = this.convert_long_to_newline(obj[property]);
        }
        items.push(item);
      }

      this.table_headers = headers;
      this.items = items;
    },
  },
};
</script>
