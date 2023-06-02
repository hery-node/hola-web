<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="search_hint" single-line hide-details clearable></v-text-field>
    </v-toolbar>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :search="search" disable-pagination hide-default-footer fixed-header :custom-filter="regex_search">
      <template v-slot:[`item._action`]="{ item }">
        <v-tooltip v-for="(action, index) in actions" bottom v-bind:key="index">
          <template v-slot:activator="{ on }">
            <v-btn icon @click.stop="click_action(action, item)" v-on="on" v-show="!action.shown || action.shown(item)" :loading="icon_loading[item._id + action.icon]" :disabled="icon_loading[item._id + action.icon]">
              <v-icon :color="action.color">{{ action.icon }}</v-icon>
            </v-btn>
          </template>
          <template v-slot:loader>
            <span class="custom-loader">
              <v-icon light>mdi-cached</v-icon>
            </span>
          </template>
          <span>{{ action.tooltip }}</span>
        </v-tooltip>
      </template>
    </v-data-table>
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
    hiddenProperties: { type: Array, default: () => [] },
    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },

    // This setting is used for action
    //action for the item, such as delete item or edit item
    actions: { type: Array, default: () => [] },
    actionWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    actionAlign: { type: String, default: "start" },
    actionClass: { type: String, default: "table_header subtitle-2" },
  },

  data() {
    return {
      search: "",
      items: [],
      table_headers: [],
      icon_loading: {},
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

    async click_action(action, item) {
      if (action.animate) {
        this.icon_loading[item._id + action.icon] = true;
        await action.handle(item);
        this.icon_loading[item._id + action.icon] = false;
      } else {
        action.handle(item);
      }
    },

    uppcase_header(header_title) {
      return this.headerUppcase ? header_title.toUpperCase() : header_title;
    },

    parse_data() {
      if (!this.objs || this.objs.length == 0) {
        return;
      }

      const headers = [];
      const items = [];
      const properties = this.merge_properties().filter((o) => !this.hiddenProperties.includes(o) && o != "_id");
      for (const property of properties) {
        headers.push({ text: this.uppcase_header(property), value: property, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }

      if (this.actions.length > 0) {
        const action = { text: this.uppcase_header(this.$t("table.action_header")), value: "_action", sortable: false };
        action.width = this.actionWidth;
        action.align = this.actionAlign;
        action.class = this.actionClass;
        headers.push(action);
      }

      for (const obj of this.objs) {
        const item = {};
        for (const property in obj) {
          item[property] = property == "_id" ? obj[property] : this.convert_long_to_newline(obj[property]);
        }
        items.push(item);
      }

      this.table_headers = headers;
      this.items = items;
    },
  },
};
</script>
