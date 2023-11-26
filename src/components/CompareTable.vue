<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="search_hint" single-line hide-details clearable></v-text-field>
      <div v-if="show_threshold">
        <v-text-field v-model="threshold" prefix="max*100/min > " suffix="%" class="ml-5" single-line hide-details></v-text-field>
      </div>
      <template v-if="show_only_show_diff">
        <v-checkbox class="ml-5" v-model="only_show_diff" hide-details :label="show_diff_label"></v-checkbox>
      </template>
      <template v-if="show_fuzzy_match">
        <v-checkbox class="ml-5" v-model="fuzzy_match" hide-details :label="show_fuzzy_label"></v-checkbox>
      </template>
      <template v-if="show_download_icon">
        <v-btn class="ml-2" color="title_button" plain @click="download_result"> <v-icon class="mr-3">mdi-cloud-download</v-icon>{{ $t("compare.download") }} </v-btn>
      </template>
    </v-toolbar>
    <template v-if="regexSearch">
      <v-data-table ref="table" v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" :custom-filter="regex_search" disable-pagination hide-default-footer> </v-data-table>
    </template>
    <template v-else>
      <v-data-table ref="table" v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" disable-pagination hide-default-footer> </v-data-table>
    </template>
  </v-card>
</template>

<script>
import Regex from "../mixins/regex";
import Simple from "../mixins/simple";
import Fuzzy from "../mixins/fuzzy";
import Wrap from "../mixins/wrap";
import Color from "../mixins/color";
import { utils, writeFileXLSX } from "xlsx";

export default {
  inheritAttrs: false,
  mixins: [Regex, Simple, Fuzzy, Wrap, Color],

  props: {
    //one is used to show, more than one is used to compare
    objs: { type: Array, required: true },
    labelKey: { type: String, required: true },

    attrWidth: { type: String, default: "120px" },
    valueWidth: { type: String, default: "80%" },
    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
    showDiffLabel: { type: String },
    topFields: { type: Array, default: () => [] },
    filterFields: { type: Array, default: () => [] },
    showRatio: { type: Boolean, default: false },
    showDiff: { type: Boolean, default: false },
    downloadExcelName: { type: String, default: "" },
    diffThreshold: { type: Number, default: 0 },
  },

  data() {
    return {
      only_show_diff: false,
      simple_value: this.simpleValue,
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
  },

  computed: {
    search_hint() {
      return this.searchHint ? this.searchHint : this.$t("compare.search");
    },

    show_only_show_diff() {
      return this.objs.length > 1;
    },

    show_download_icon() {
      return this.downloadExcelName.length > 0 && this.objs.length > 0;
    },

    show_threshold() {
      return this.diffThreshold > 0 && this.objs.length > 1;
    },

    show_diff_label() {
      return this.showDiffLabel ? this.showDiffLabel : this.$t("compare.show_diff");
    },

    threshold_label() {
      return this.thresholdLabel;
    },
  },

  methods: {
    download_result() {
      const tables = this.$el.getElementsByTagName("table");
      if (tables.length == 1) {
        if (this.simple_value) {
          //use raw data to download, so convert data to raw format
          this.simple_value = false;
          this.parse_data();
          setTimeout(() => {
            const workbook = utils.table_to_book(tables[0]);
            writeFileXLSX(workbook, this.downloadExcelName);
            this.simple_value = true;
            this.parse_data();
          }, 2000);
        } else {
          //raw format, download directly
          const workbook = utils.table_to_book(tables[0]);
          writeFileXLSX(workbook, this.downloadExcelName);
        }
      }
    },

    set_ratio_values(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const left = parseFloat(item["value0"]);
        const right = parseFloat(item["value1"]);
        if (!isNaN(left) && !isNaN(right) && left != right) {
          item["ratio"] = left != 0 ? ((right * 100) / left).toFixed(2) + "%" : "";
        } else {
          item["ratio"] = "";
        }
      }
    },

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

    parse_data() {
      const objs = JSON.parse(JSON.stringify(this.objs));

      const headers = [];
      headers.push({ text: this.uppcase_header(this.$t("table.attribute")), value: "attr", width: this.attrWidth, align: this.headerAlign, class: this.headerClass });

      if (objs.length > 1) {
        for (let i = 0; i < objs.length; i++) {
          headers.push({ text: this.uppcase_header(objs[i][this.labelKey]), value: "value" + i, width: this.valueWidth, align: this.headerAlign, class: this.headerClass });
        }
      } else if (objs.length == 1) {
        headers.push({ text: this.uppcase_header(objs[0][this.labelKey]), value: "value", width: this.valueWidth, align: this.headerAlign, class: this.headerClass });
      }

      if (this.showRatio && objs.length == 2) {
        headers.push({
          text: this.uppcase_header(this.$t("compare.ratio")),
          value: "ratio",
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

      if (this.showDiff && objs.length >= 2) {
        headers.push({
          text: this.uppcase_header(this.$t("compare.diff1")),
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
          text: this.uppcase_header(this.$t("compare.diff2")),
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
                obj["value" + j] = this.has_value(value) ? this.convert_long_to_newline(value) : "";
              }
            } else {
              for (let j = 0; j < objs.length; j++) {
                obj["value" + j] = property_objs[j] && this.has_value(property_objs[j][attribute]) ? this.convert_long_to_newline(property_objs[j][attribute]) : "";
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
            obj["value"] = this.has_value(object[attribute]) ? this.convert_long_to_newline(object[attribute]) : "";
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        }
      }

      if (this.showRatio && objs.length == 2) {
        this.set_ratio_values(items, objs.length);
      }

      //calculate the diff values
      if (this.showDiff && objs.length >= 2) {
        this.set_diff_values(items, objs.length);
      }

      if (this.simple_value) {
        this.convert_to_simple_value(items, objs.length);
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

    uppcase_header(header_title) {
      return this.headerUppcase ? header_title.toUpperCase() : header_title;
    },

    is_diff_value(item) {
      if (this.objs.length > 1 && this.threshold > 0) {
        return this.has_value(item["diff1"]) ? Math.abs(parseFloat(item["diff1"])) > this.threshold : false;
      } else if (this.objs.length > 1) {
        let value = item["value0"];
        for (let i = 0; i < this.objs.length; i++) {
          if (item["value" + i] != value) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    },

    get_item_class(item) {
      const color = this.get_color(item);
      if (color && color.length > 0) {
        return color;
      }

      if (this.topFields.includes(attr)) {
        return "top_item";
      }

      return this.is_diff_value(item) ? "diff_item" : "compare_item";
    },

    filter_fields() {
      const items = this.only_show_diff ? this.all_items.filter((item) => this.is_diff_value(item)) : this.all_items;
      this.items = items;
    },
  },
};
</script>
<style scoped>
.diff_item {
  color: #37474f;
  background-color: #f3e5f5;
}

.diff_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}

.top_item {
  color: #37474f;
  background-color: #ffcdd2;
}

.top_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}

.compare_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}
</style>
