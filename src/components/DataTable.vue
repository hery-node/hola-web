<template>
  <div>
    <div v-if="searchable">
      <h-search-form v-bind="$attrs" :entity="entity" :fields="searchFields" :title="searchTitle" :cols="searchCols" @clear="clear_search" @search="do_search"></h-search-form>
      <v-divider class="mt-5"></v-divider>
    </div>

    <v-data-table v-bind="$attrs" v-on="$listeners" :mobile-breakpoint="mobile ? 600 : 10" :headers="table_headers" :items="items" :loading="loading" multi-sort v-model="selected" :options.sync="options" :server-items-length="total" item-key="_id" class="elevation-0" :hide-default-footer="!pagination" :show-expand="is_expanded()" :show-select="showSelect" :expanded.sync="expanded">
      <template v-slot:top>
        <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
        <v-toolbar flat dense :class="toolbarClass" dark v-if="!hideToolbar">
          <span class="ml-3" v-if="!hideTitle">{{ table_title }}</span>
          <span class="ml-3" v-if="infinite">{{ total_records_title }}</span>
          <v-spacer></v-spacer>
          <slot name="toolbar" />
        </v-toolbar>
      </template>

      <template v-if="!pagination" v-slot:[`item.${first_column}`]="{ item }">
        <v-row :justify="get_header_align(first_column)" :align="get_header_align(first_column)" class="my-3">
          <template v-if="item._last === true">
            <span :class="first_column_style" v-intersect="infinite_scroll">
              {{ item[first_column] }}
            </span>
          </template>
          <template v-else>
            <span :class="first_column_style">
              {{ item[first_column] }}
            </span>
          </template>
        </v-row>
      </template>

      <template v-for="(chip, index) in chips" v-slot:[`item.${chip}`]="{ item }">
        <v-row class="d-flex flex-nowrap" :justify="get_header_align(chip)" style="margin-top: 5px; margin-bottom: 5px" :align="get_header_align(chip)" v-bind:key="index">
          <template v-if="Array.isArray(item[chip])">
            <template v-if="chipClickable">
              <v-chip @click.stop="click_chip(item, chip, tag_index)" dark v-for="(tag, tag_index) in item[chip]" :key="tag_index" :class="get_item_style(chip, item[chip], 'chip')" style="margin: 3px"> {{ tag }} </v-chip>
            </template>
            <template v-else>
              <v-chip dark v-for="(tag, tag_index) in item[chip]" :key="tag_index" :class="get_item_style(chip, item[chip], 'chip')" style="margin: 3px"> {{ tag }} </v-chip>
            </template>
          </template>
          <template v-else-if="item[chip]">
            <template v-if="chipClickable">
              <v-chip @click.stop="click_chip(item, chip)" dark :class="get_item_style(chip, item[chip], 'chip ma-1')">{{ item[chip] }}</v-chip>
            </template>
            <template v-else>
              <v-chip dark :class="get_item_style(chip, item[chip], 'chip ma-1')">{{ item[chip] }}</v-chip>
            </template>
          </template>
        </v-row>
      </template>

      <template v-for="(array, index) in arrays" v-slot:[`item.${array}`]="{ item }">
        <span v-bind:key="index">
          <v-row :justify="get_header_align(array)" :align="get_header_align(array)" class="my-3" v-for="(tag, tag_index) in item[array]" :key="tag_index">
            <span :class="get_item_style(array, item[array], 'ma-1')">{{ tag }}</span>
          </v-row>
        </span>
      </template>

      <template v-for="(style, index) in styles" v-slot:[`item.${style}`]="{ item }">
        <v-row :justify="get_header_align(style)" :align="get_header_align(style)" v-bind:key="index">
          <span :class="get_item_style(style, item[style], '')">{{ item[style] }}</span>
        </v-row>
      </template>

      <template v-slot:[`item._action`]="{ item }">
        <v-tooltip v-for="(action, index) in itemActions" bottom v-bind:key="index">
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

      <template v-slot:expanded-item="{ headers, item }" v-if="expandFields && expandFields.length > 0">
        <td :colspan="headers.length" style="white-space: pre-wrap; word-wrap: break-word" flat>
          <div style="margin: 15px">
            {{ get_expanded(item) }}
          </div>
        </td>
      </template>

      <template v-slot:no-data>
        <span>{{ $t("table.no_data") }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Meta from "../mixins/meta";
import Alert from "../mixins/alert";
import { is_success_response, list_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  props: {
    //required attributes
    sortDesc: { type: Array, required: true },
    sortKey: { type: Array, required: true },
    //end

    //action to do list
    listAction: { type: String },

    //used to add filter conditions to table
    filter: { type: Object },

    //has search form or not
    searchable: { type: Boolean, default: false },
    searchTitle: { type: String },
    //search colspan for the field
    searchCols: { type: Number, default: 0 },
    searchFields: { type: Array, default: () => [] },
    refAsChip: { type: Boolean, default: true },

    //control the toolbar
    hideToolbar: { type: Boolean, default: false },
    hideTitle: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    title: { type: String },

    showSelect: { type: Boolean, default: false },
    //has action header to add update and delete button for item
    hasActionHeader: { type: Boolean, default: false },
    //action for the item, such as delete item or edit item
    itemActions: { type: Array, default: () => [] },
    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "start" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },

    // This setting is used for action
    actionWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    actionAlign: { type: String, default: "start" },
    actionClass: { type: String, default: "table_header subtitle-2" },

    //turn off table in mobile list mode
    mobile: { type: Boolean, default: false },
    //chip is clickable use to do refer entity edit form
    chipClickable: { type: Boolean, default: false },
    interval: { type: Number, default: -1 },

    //infinite scroll or not
    infinite: { type: Boolean, default: false },
    //this is to control the page size for infinite scroll mode
    itemPerPage: { type: Number, default: 30 },
    expandFields: { type: Array, default: () => [] },
    hiddenFields: { type: Array, default: () => [] },
  },

  data() {
    return {
      table_headers: [],
      interval_instance: undefined,
      loading: false,
      total: 0,
      next_page: 1,
      items: [],
      selected: [],
      chips: [],
      styles: [],
      arrays: [],
      expanded: [],
      search_form: {},
      options: {},
      first_column: "",
      icon_loading: {},
    };
  },

  async created() {
    await this.load_meta();
    const table_headers = await this.get_table_headers(this.expandFields);

    for (let i = 0; i < table_headers.length; i++) {
      const header = table_headers[i];
      header.text = this.uppcase_header(header.text);
      header.width || (header.width = this.headerWidth);
      header.align || (header.align = this.headerAlign);
      header.class || (header.class = this.headerClass);
      header.chip && this.chips.push(header.name);
      !header.chip && this.refAsChip && header.ref && this.chips.push(header.name);
      !header.chip && header.type == "array" && ((this.refAsChip && !header.ref) || (!this.refAsChip && header.ref)) && this.arrays.push(header.name);
      header.style && !header.chip && this.styles.push(header.name);
    }

    if (this.hasActionHeader) {
      const action = { text: this.uppcase_header(this.$t("table.action_header")), value: "_action", sortable: false };
      action.width = this.actionWidth;
      action.align = this.actionAlign;
      action.class = this.actionClass;
      table_headers.push(action);
    }

    this.first_column = table_headers[0].value;
    this.table_headers = table_headers;
    this.load_data();
  },

  watch: {
    options: {
      handler() {
        this.reset_values();
        this.load_data();
      },
      deep: true,
    },

    filter: {
      handler() {
        this.reset_values();
        this.load_data();
      },
      deep: true,
    },
  },

  mounted() {
    if (this.interval > 0 && this.pagination) {
      this.interval_instance = setInterval(this.load_data, this.interval * 1000);
    }
  },

  beforeDestroy() {
    if (this.interval_instance) {
      clearInterval(this.interval_instance);
    }
  },

  computed: {
    pagination() {
      return !this.infinite;
    },

    table_title() {
      if (this.hideTableTitle) {
        return "";
      }
      if (this.title) {
        return this.title;
      }
      return this.$t("table.title", { entity: this.entity_label });
    },

    total_records_title() {
      return this.$t("table.total_record", { total: this.total });
    },

    first_column_style() {
      return this.headerAlign == "start" ? "ml-3" : "";
    },
  },

  methods: {
    async click_chip(item, field_name, index) {
      const [field] = this.table_headers.filter((f) => f.name === field_name);
      if (field && field.ref) {
        const field_name_id = field_name + "_id";
        const id = Array.isArray(item[field_name_id]) ? item[field_name_id][index] : item[field_name_id];
        const label = Array.isArray(item[field_name]) ? item[field_name][index] : item[field_name];
        if (field.click) {
          field.click(id, field.ref, label);
        } else {
          this.$emit("chip", { id: id, ref: field.ref, label: label });
        }
      } else if (field && field.click) {
        field.click(item, field_name, index);
      }
    },

    is_expanded() {
      return this.expandFields && this.expandFields.length > 0 ? (this.showSelect == true ? false : true) : false;
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

    get_expanded(item) {
      const field_names = this.expandFields;
      const values = [];
      for (let i = 0; i < field_names.length; i++) {
        const field_name = field_names[i];
        const value = item[field_name] ? item[field_name] + "" : "";
        if (value && value.trim().length > 0) {
          if (field_names.length > 1) {
            values.push(this.get_field_label_by_name(field_name) + ":");
            values.push(value.includes("\n") ? "\n" : "\t");
          }
          values.push(value);
          if (i != field_names.length - 1) {
            values.push("\n");
            values.push("===========================================================================================================");
            values.push("\n");
          }
        }
      }
      return values.join("");
    },

    uppcase_header(header_title) {
      return this.headerUppcase ? header_title.toUpperCase() : header_title;
    },

    infinite_scroll(entries) {
      const intersection = entries[0].intersectionRatio > 0;

      if (this.items.length < this.total && intersection && !entries[0].target.page) {
        entries[0].target.page = this.next_page;
        setTimeout(() => {
          this.load_data();
        }, 500);
      }
    },

    reset_values() {
      this.next_page = 1;
    },

    clear_search() {
      this.search_form = {};
      this.reset_values();
      this.load_data();
    },

    refresh() {
      this.reset_values();
      this.load_data();
    },

    set_data(items) {
      this.items = items;
    },

    do_search(form) {
      this.search_form = form;
      this.reset_values();
      this.load_data();
    },

    get_header_align(field_name) {
      const [field] = this.table_headers.filter((f) => f.name === field_name);
      return field.align;
    },

    get_item_style(field_name, field_value, default_value) {
      const [field] = this.table_headers.filter((f) => f.name === field_name);
      if (field && field.style) {
        return field.style(field_value);
      } else {
        return default_value;
      }
    },

    async load_data() {
      if (this.table_headers.length == 0) {
        return;
      }

      this.loading = true;

      const { page, sortBy, sortDesc, itemsPerPage } = this.options;
      const sort_by = sortBy && sortBy.length > 0 ? sortBy.join(",") : this.sortKey.join(",");
      const desc = sortDesc && sortDesc.length > 0 ? sortDesc.join(",") : this.sortDesc.join(",");
      let attrs = this.table_headers.filter((h) => h.name && h.name.length > 0).map((h) => h.name);
      this.expandFields && attrs.push(...this.expandFields);
      attrs = attrs.concat([this.hiddenFields]);
      const attr_names = attrs.join(",");
      const params = { attr_names: attr_names, sort_by: sort_by, desc: desc };
      if (this.pagination) {
        params.page = page;
        params.limit = itemsPerPage;
      } else {
        params.page = this.next_page;
        params.limit = this.itemPerPage;
      }

      const query_obj = this.filter ? { ...this.search_form, ...this.filter } : this.search_form;
      const { code, total, data } = await list_entity(this.entity, query_obj, params, this.listAction);
      this.loading = false;
      if (is_success_response(code)) {
        this.total = total;
        if (data.length > 0) {
          data[data.length - 1]._last = true;

          for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            for (let j = 0; j < this.table_headers.length; j++) {
              const header = this.table_headers[j];
              if (header.format) {
                obj[header.name] = header.format(obj[header.name], this);
              }
            }
          }
          if (this.pagination) {
            this.items = data;
          } else {
            if (this.next_page == 1) {
              this.items = data;
            } else {
              this.items.push(...data);
            }
          }

          this.$emit("loaded", this.items);
          this.next_page++;
        }
      }
    },
  },
};
</script>
