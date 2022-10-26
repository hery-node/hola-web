<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-row>
        <v-col cols="4">
          <v-text-field v-model="search" append-icon="mdi-magnify" class="mr-5" :label="search_hint" single-line hide-details clearable></v-text-field>
        </v-col>
        <v-col cols="2" v-if="show_threshold">
          <v-text-field v-model="threshold" :prefix="threshold_label" suffix="%" class="mr-5" single-line hide-details></v-text-field>
        </v-col>
        <v-col cols="2" v-if="show_only_show_diff">
          <v-checkbox v-model="only_show_diff" hide-details :label="show_diff_label"></v-checkbox>
        </v-col>
        <v-col cols="2" v-if="show_reverse_order">
          <v-checkbox v-model="reverse_order" hide-details :label="reverse_order_label"></v-checkbox>
        </v-col>
        <v-col cols="2" v-if="show_fuzzy_match">
          <v-checkbox v-model="fuzzy_match" hide-details :label="show_fuzzy_label"></v-checkbox>
        </v-col>
      </v-row>
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
import Regex from "../mixins/regex";
import Simple from "../mixins/simple";
import Percentage from "../mixins/percentage";
import Fuzzy from "../mixins/fuzzy";

export default {
  inheritAttrs: false,
  mixins: [Regex, Simple, Percentage, Fuzzy],

  props: {
    //one is used to show, more than one is used to compare
    objs: { type: Array, required: true },
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
    reverseLabel: { type: String },
    topFields: { type: Array, default: () => [] },
    filterFields: { type: Array, default: () => [] },
    maxLineWords: { type: Number, default: 50 },
    diffThreshold: { type: Number, default: 0 },
    thresholdLabel: { type: String },
  },

  data() {
    return {
      only_show_diff: false,
      reverse_order: false,
      search: "",
      threshold: 0,
      all_items: [],
      items: [],
      table_headers: [],
    };
  },

  created() {
    this.parse_data();
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

    objs: {
      handler() {
        this.parse_data();
      },
      deep: true,
    },

    reverse_order: {
      handler() {
        this.parse_data();
      },
      deep: true,
    },
  },

  computed: {
    search_hint() {
      return this.searchHint ? this.searchHint : this.$t("compare.search");
    },

    show_only_show_diff() {
      return this.objs.length > 1;
    },

    show_reverse_order() {
      return this.objs.length > 1;
    },

    show_threshold() {
      return this.diffThreshold > 0 && this.objs.length > 1;
    },

    show_diff_label() {
      return this.showDiffLabel ? this.showDiffLabel : this.$t("compare.show_diff");
    },

    reverse_order_label() {
      return this.reverseLabel ? this.reverseLabel : this.$t("compare.reverse_order");
    },

    threshold_label() {
      return this.thresholdLabel;
    },
  },

  methods: {
    parse_data() {
      const objs = this.objs;
      const headers = [];
      headers.push({ text: this.uppcase_header(this.$t("table.attribute")), value: "attr", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });

      if (objs.length > 1) {
        if (this.reverse_order) {
          for (let i = objs.length - 1; i >= 0; i--) {
            headers.push({ text: this.uppcase_header(objs[i][this.labelKey]), value: "value" + i, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
          }
        } else {
          for (let i = 0; i < objs.length; i++) {
            headers.push({ text: this.uppcase_header(objs[i][this.labelKey]), value: "value" + i, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
          }
        }
      } else {
        headers.push({ text: this.uppcase_header(this.$t("table.value")), value: "value", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }

      if (this.showPercentage && objs.length >= 2) {
        headers.push({
          text: this.uppcase_header(this.$t("compare.diff")),
          value: "percentage",
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
      if (objs.length > 1) {
        const property_objs = objs;
        const { merged_attributes, map } = this.merge_attributes(property_objs);
        for (let i = 0; i < merged_attributes.length; i++) {
          const attribute = merged_attributes[i];
          if (attribute != this.labelKey) {
            const obj = {};
            obj["attr"] = attribute;
            if (this.show_fuzzy_match) {
              obj["attrs"] = [];
              for (let j = 0; j < objs.length; j++) {
                let value = "";
                if (property_objs[j]) {
                  value = property_objs[j][attribute];
                  if (!value && map[attribute]) {
                    map[attribute] && obj["attrs"].push(map[attribute]);
                    obj["attrs"].push(attribute);
                    value = property_objs[j][map[attribute]];
                  }
                }
                obj["value" + j] = value ? this.convert_long_to_newline(value) : "";
              }
            } else {
              for (let j = 0; j < objs.length; j++) {
                obj["value" + j] = property_objs[j] && property_objs[j][attribute] ? this.convert_long_to_newline(property_objs[j][attribute]) : "";
              }
            }
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        }
      } else {
        const object = objs[0];
        const { merged_attributes } = this.recommend ? this.merge_attributes([object, this.recommend]) : this.merge_attributes([object]);

        for (let i = 0; i < merged_attributes.length; i++) {
          const attribute = merged_attributes[i];
          if (attribute != this.labelKey) {
            const obj = {};
            obj["attr"] = attribute;
            obj["value"] = object[attribute] ? this.convert_long_to_newline(object[attribute] + "") : "";
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        }
      }

      //calculate the percentage
      if (this.showPercentage && objs.length >= 2) {
        this.set_percentage(items, this.objs.length);
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

      this.table_headers = headers;
      this.all_items = this.filterFields && this.filterFields.length > 0 ? ordered_items : items;
      this.threshold = this.diffThreshold;
      this.filter_fields();
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

    is_diff_value(item) {
      if (this.objs.length > 1 && this.threshold > 0 && item["percentage"]) {
        return Math.abs(parseFloat(item["percentage"])) > this.threshold;
      } else {
        return false;
      }
    },

    get_item_class(item) {
      const attr = item["attr"];
      if (this.topFields.includes(attr)) {
        return "top_item";
      } else {
        return this.is_diff_value(item) ? "diff_item" : "compare_item";
      }
    },

    filter_fields() {
      const items = this.only_show_diff ? this.all_items.filter((item) => this.is_diff_value(item)) : this.all_items;
      this.items = items;
    },
  },
};
</script>
