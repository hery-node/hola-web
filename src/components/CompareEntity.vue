<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-row>
        <v-col cols="8">
          <v-text-field v-model="search" append-icon="mdi-magnify" class="mr-5" :label="search_hint" single-line hide-details clearable></v-text-field>
        </v-col>
        <v-col cols="2" v-if="show_threshold">
          <v-text-field v-model="threshold" :prefix="threshold_label" suffix="%" class="mr-5" single-line hide-details></v-text-field>
        </v-col>
        <v-col cols="2" v-if="show_only_show_diff">
          <v-checkbox v-model="only_show_diff" hide-details :label="show_diff_label"></v-checkbox>
        </v-col>
      </v-row>
      <v-menu left bottom v-if="show_choose_fields">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="field in property_fields" :key="field.name">
            <v-checkbox v-model="show_fields[field.name]" hide-details :label="field.label" @click.native.prevent.stop="filter_fields"></v-checkbox>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <template v-if="regexSearch">
      <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" :custom-filter="regex_search" disable-pagination hide-default-footer> </v-data-table>
    </template>
    <template v-else>
      <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" disable-pagination hide-default-footer> </v-data-table>
    </template>
  </v-card>
</template>

<script>
import Meta from "../mixins/meta";
import Regex from "../mixins/regex";
import Simple from "../mixins/simple";
import { read_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta, Regex, Simple],

  props: {
    //one is used to show, more than one is used to compare
    ids: { type: Array, required: true },
    labelKey: { type: String, required: true },

    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
    showDiffLabel: { type: String },
    recommend: { type: Object },
    topFields: { type: Array, default: () => [] },
    filterFields: { type: Array, default: () => [] },
    maxLineWords: { type: Number, default: 50 },
    showDiff: { type: Boolean, default: false },
    diffThreshold: { type: Number, default: 0 },
    thresholdLabel: { type: String },
  },

  data() {
    return {
      only_show_diff: false,
      search: "",
      threshold: 0,
      all_items: [],
      items: [],
      property_fields: [],
      table_headers: [],
      show_fields: {},
    };
  },

  async created() {
    const property_fields = await this.get_property_fields();
    const attr_names = property_fields.map((h) => h.name).join(",");

    const objs = [];
    for (let i = 0; i < this.ids.length; i++) {
      const entityId = this.ids[i];
      const obj = await read_entity(this.entity, entityId, attr_names + "," + this.labelKey);
      objs.push(obj);
    }

    const headers = [];
    headers.push({ text: this.uppcase_header(this.$t("table.attribute")), value: "attr", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });

    if (objs.length > 1) {
      for (let i = 0; i < objs.length; i++) {
        headers.push({ text: this.uppcase_header(objs[i][this.labelKey]), value: "value" + i, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }
    } else {
      headers.push({ text: this.uppcase_header(this.$t("table.value")), value: "value", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      if (this.recommend) {
        headers.push({ text: this.uppcase_header(this.$t("table.recommend")), value: "recommend", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }
    }

    if (this.showDiff && (objs.length >= 2 || this.recommend)) {
      headers.push({
        text: this.uppcase_header(this.$t("compare.diff")),
        value: "diff1",
        width: this.headerWidth,
        align: this.headerAlign,
        class: this.headerClass,
        sort: function (a, b) {
          const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
          const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
          return a1 - b1;
        },
      });
      headers.push({
        text: this.uppcase_header(this.$t("compare.diff")),
        value: "diff2",
        width: this.headerWidth,
        align: this.headerAlign,
        class: this.headerClass,
        sort: function (a, b) {
          const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
          const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
          return a1 - b1;
        },
      });
    }

    const items = [];
    for (let i = 0; i < property_fields.length; i++) {
      const field = property_fields[i];
      this.show_fields[field.name] = true;
      if (field.type == "obj") {
        if (objs.length > 1) {
          const property_objs = objs.map((o) => o[field.name]);
          const merged_attributes = this.merge_attributes(property_objs);
          for (let i = 0; i < merged_attributes.length; i++) {
            const attribute = merged_attributes[i];
            const obj = {};
            obj["attr"] = attribute;
            obj["owner"] = field.name;
            for (let j = 0; j < objs.length; j++) {
              obj["value" + j] = property_objs[j] && property_objs[j][attribute] ? this.convert_long_to_newline(property_objs[j][attribute]) : "";
            }
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        } else {
          const object = objs[0][field.name];
          const merged_attributes = this.recommend ? this.merge_attributes([object, this.recommend]) : this.merge_attributes([object]);
          for (let i = 0; i < merged_attributes.length; i++) {
            const attribute = merged_attributes[i];
            const obj = {};
            obj["attr"] = attribute;
            obj["owner"] = field.name;
            obj["value"] = object[attribute] ? this.convert_long_to_newline(object[attribute] + "") : "";
            if (this.recommend) {
              obj["recommend"] = this.recommend[attribute] ? this.recommend[attribute] + "" : "";
            }
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        }
      } else {
        const obj = {};
        obj["attr"] = field.label;
        obj["owner"] = field.name;

        if (objs.length > 1) {
          for (let i = 0; i < objs.length; i++) {
            obj["value" + i] = this.get_field_value(field, objs[i]);
          }
        } else {
          obj["value"] = this.get_field_value(field, objs[0]);
          if (this.recommend) {
            obj["recommend"] = this.recommend[field.name] ? this.recommend[field.name] + "" : "";
          }
        }
        if (this.filterFields.length == 0) {
          items.push(obj);
        } else if (this.filterFields.includes(field.label)) {
          items.push(obj);
        }
      }
    }

    //calculate the diff values
    if (this.showDiff && objs.length >= 2) {
      this.set_diff_values(items, this.objs.length);
    }

    if (this.simpleValue) {
      this.convert_to_simple_value(items, this.objs.length);
    }

    const ordered_items = [];
    if (this.filterFields && this.filterFields.length > 0 && items.length > 0) {
      for (let i = 0; i < this.filterFields.length; i++) {
        const attr = this.filterFields[i];
        ordered_items.push(items.filter((o) => o.attr == attr)[0]);
      }
    }

    this.property_fields = property_fields;
    this.table_headers = headers;
    this.all_items = this.filterFields && this.filterFields.length > 0 ? ordered_items : items;
    this.threshold = this.diffThreshold;
    this.filter_fields();
  },

  watch: {
    only_show_diff: {
      handler() {
        this.filter_fields();
      },
      deep: true,
    },
    threshold: {
      handler() {
        this.filter_fields();
      },
      deep: true,
    },
  },

  computed: {
    search_hint() {
      return this.searchHint ? this.searchHint : this.$t("compare.search");
    },

    show_only_show_diff() {
      return this.recommend || this.ids.length > 1;
    },

    show_threshold() {
      return this.diffThreshold > 0 && this.ids.length > 1;
    },

    show_diff_label() {
      return this.showDiffLabel ? this.showDiffLabel : this.$t("compare.show_diff");
    },

    threshold_label() {
      return this.thresholdLabel;
    },

    show_choose_fields() {
      return this.fields.length > 1;
    },
  },

  methods: {
    set_diff_values(items, columes) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const values = [];
        for (let j = 0; j < columes; j++) {
          values.push(parseFloat(item["value" + j]));
        }

        const max = Math.max(...values);
        const min = Math.min(...values);
        if (!isNaN(max) && !isNaN(min) && max != min) {
          item["diff1"] = min != 0 ? ((max * 100) / min).toFixed(2) + "%" : "";
          item["diff2"] = max != 0 ? ((min * 100) / max).toFixed(2) + "%" : "";
        } else {
          item["diff1"] = "";
          item["diff2"] = "";
        }
      }
    },

    convert_long_to_newline(value) {
      if (!value) {
        return "";
      }

      if (typeof value === "string" || value instanceof String) {
        if (value.length < this.maxLineWords) {
          return value;
        } else {
          return value.replaceAll(",", "\n");
        }
      } else {
        return value;
      }
    },

    uppcase_header(header_title) {
      return this.headerUppcase ? header_title.toUpperCase() : header_title;
    },

    merge_attributes(objs) {
      const attributes = [];
      objs.forEach((obj) => {
        for (const property in obj) {
          if (!attributes.includes(property)) {
            attributes.push(property);
          }
        }
      });
      return attributes;
    },

    is_diff_value(item) {
      if (this.ids.length > 1) {
        if (this.threshold > 0) {
          if (item["diff1"]) {
            return Math.abs(parseFloat(item["diff1"])) > this.threshold;
          }
          return false;
        } else {
          let value = item["value0"];
          for (let i = 0; i < this.ids.length; i++) {
            if (item["value" + i] != value) {
              return true;
            }
          }
          return false;
        }
      } else if (this.recommend) {
        const value = item["value"];
        const r_value = item["recommend"];
        if (r_value && r_value.trim().length > 0 && r_value.trim() != value) {
          return true;
        }
      }
      return false;
    },

    get_item_class(item) {
      const attr = item["attr"];
      if (this.topFields.includes(attr)) {
        return "top_item";
      } else {
        return this.is_diff_value(item) ? "diff_item" : "compare_item";
      }
    },

    get_field_value(field, obj) {
      const value = field.format ? field.format(obj[field.name], this) : obj[field.name];
      if (value) {
        const prefix = field.prefix && !value.toString().includes(field.prefix) ? field.prefix : "";
        const suffix = field.suffix && !value.toString().includes(field.suffix) ? field.suffix : "";
        return `${prefix} ${value} ${suffix}`;
      } else {
        return "";
      }
    },

    filter_fields() {
      const show_fields_names = this.fields.filter((f) => this.show_fields[f.name] == true).map((f) => f.name);
      const items = this.only_show_diff ? this.all_items.filter((item) => this.is_diff_value(item)) : this.all_items;
      this.items = items.filter((item) => show_fields_names.includes(item.owner));
    },
  },
};
</script>

<style>
.diff_item {
  color: #37474f;
  background-color: #f3e5f5;
}

.diff_item:hover {
  color: #37474f !important;
  background-color: #f3e5f5 !important;
}
.top_item {
  color: #37474f;
  background-color: #ffcdd2;
}

.top_item:hover {
  color: #37474f !important;
  background-color: #ffcdd2 !important;
}
</style>
