<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="search_hint" single-line hide-details clearable></v-text-field>
      <template v-if="show_download_icon">
        <v-btn class="ml-2" color="title_button" plain @click="download_result"><v-icon class="mr-3">mdi-cloud-download</v-icon>{{ $t("compare.download") }} </v-btn>
      </template>
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
/**
 * Array table component
 * Displays array of objects in table format
 */
import Regex from "../mixins/regex";
import Wrap from "../mixins/wrap";
import { utils, writeFileXLSX } from "xlsx";

export default {
  inheritAttrs: false,
  mixins: [Regex, Wrap],

  props: {
    objs: { type: Array, required: true },
    hiddenProperties: { type: Array, default: () => [] },
    headerWidth: { type: String, default: "120px" },
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
    actions: { type: Array, default: () => [] },
    actionWidth: { type: String, default: "120px" },
    actionAlign: { type: String, default: "start" },
    actionClass: { type: String, default: "table_header subtitle-2" },
    downloadExcelName: { type: String, default: "" },
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
    /** Get search hint */
    search_hint() {
      return this.searchHint ?? this.$t("table.search");
    },

    /** Show download icon if excel name and data exist */
    show_download_icon() {
      return this.downloadExcelName.length > 0 && this.objs.length > 0;
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
    /** Download table as Excel */
    download_result() {
      const tables = this.$el.getElementsByTagName("table");
      if (tables.length === 1) {
        const workbook = utils.table_to_book(tables[0]);
        writeFileXLSX(workbook, this.downloadExcelName);
      }
    },

    /** Merge all properties from objects */
    merge_properties() {
      const properties = [];
      for (let i = 0; i < this.objs.length; i++) {
        const obj = this.objs[i];
        if (obj) {
          properties.push(...Object.keys(obj));
        }
      }
      return [...new Set(properties)];
    },

    /** Handle action click with optional animation */
    async click_action(action, item) {
      if (action.animate) {
        this.icon_loading[item._id + action.icon] = true;
        await action.handle(item);
        this.icon_loading[item._id + action.icon] = false;
      } else {
        action.handle(item);
      }
    },

    /** Uppercase header if enabled */
    uppcase_header(header_title) {
      return this.headerUppcase ? header_title.toUpperCase() : header_title;
    },

    /** Parse objects into table data */
    parse_data() {
      if (!this.objs?.length) {
        return;
      }

      const headers = [];
      const items = [];
      const properties = this.merge_properties().filter((o) => !this.hiddenProperties.includes(o) && o !== "_id");

      for (const property of properties) {
        headers.push({
          text: this.uppcase_header(property),
          value: property,
          width: this.headerWidth,
          align: this.headerAlign,
          class: this.headerClass,
        });
      }

      if (this.actions.length > 0) {
        const action = {
          text: this.uppcase_header(this.$t("table.action_header")),
          value: "_action",
          sortable: false,
          width: this.actionWidth,
          align: this.actionAlign,
          class: this.actionClass,
        };
        headers.push(action);
      }

      for (const obj of this.objs) {
        const item = {};
        for (const property in obj) {
          item[property] = property === "_id" ? obj[property] : this.convert_long_to_newline(obj[property]);
        }
        items.push(item);
      }

      this.table_headers = headers;
      this.items = items;
    },
  },
};
</script>
