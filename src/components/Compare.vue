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
    </v-toolbar>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" disable-pagination hide-default-footer> </v-data-table>
  </v-card>
</template>

<script>
export default {
  inheritAttrs: false,

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
    showPercentage: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
    showDiffLabel: { type: String },
    topFields: { type: Array, default: () => [] },
    filterFields: { type: Array, default: () => [] },
    maxLineWords: { type: Number, default: 50 },
    diffThreshold: { type: Number, default: 0 },
    thresholdLabel: { type: String },
    objDot: { type: String, default: "*" },
  },

  data() {
    return {
      only_show_diff: false,
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
    parse_data() {
      const objs = this.objs;
      const headers = [];
      headers.push({ text: this.uppcase_header(this.$t("table.attribute")), value: "attr", width: this.headerWidth, align: this.headerAlign, class: this.headerClass });

      if (objs.length > 1) {
        for (let i = 0; i < objs.length; i++) {
          headers.push({ text: this.uppcase_header(objs[i][this.labelKey]), value: "value" + i, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
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
          sort: function(a, b) {
            const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
            const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
            return a1 - b1;
          },
        });
      }

      const items = [];
      if (objs.length > 1) {
        const property_objs = this.conver_obj_keys(objs);
        const merged_attributes = this.merge_attributes(property_objs);
        for (let i = 0; i < merged_attributes.length; i++) {
          const attribute = merged_attributes[i];
          if (attribute != this.labelKey) {
            const obj = {};
            obj["attr"] = attribute;
            for (let j = 0; j < objs.length; j++) {
              obj["value" + j] = property_objs[j] && property_objs[j][attribute] ? this.convert_long_to_newline(property_objs[j][attribute]) : "";
            }
            if (this.filterFields.length == 0) {
              items.push(obj);
            } else if (this.filterFields.includes(attribute)) {
              items.push(obj);
            }
          }
        }
      } else {
        const object = this.conver_obj_keys([objs[0]])[0];
        const merged_attributes = this.recommend ? this.merge_attributes([object, this.recommend]) : this.merge_attributes([object]);
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
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          item["percentage"] = this.calculate_percentage(item);
        }
      }

      this.table_headers = headers;
      this.all_items = items;
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

    calculate_percentage(item) {
      let values = [];
      for (let i = 0; i < this.objs.length; i++) {
        values.push(parseFloat(item["value" + i]));
      }
      let max = Math.max(...values);
      let min = Math.min(...values);
      if (!isNaN(max) && !isNaN(min) && max != min) {
        return (((max - min) * 100) / min).toFixed(2) + "%";
      } else {
        return "";
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

    conver_obj_keys(objs) {
      const results = [];
      objs.forEach((obj) => {
        const converted = {};
        for (const property in obj) {
          const replaced_property = property.replaceAll(this.objDot, ".");
          converted[replaced_property] = obj[property];
        }
        results.push(converted);
      });
      return results;
    },

    is_diff_value(item) {
      if (this.objs.length > 1) {
        if (this.threshold > 0) {
          if (item["percentage"]) {
            return Math.abs(parseFloat(item["percentage"])) > this.threshold;
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
      }
      return false;
    },

    get_item_class(item) {
      const attr = item["attr"];
      if (this.topFields.includes(attr)) {
        return "top_item";
      } else {
        return this.is_diff_value(item) ? "diff_item" : "";
      }
    },

    filter_fields() {
      const items = this.only_show_diff ? this.all_items.filter((item) => this.is_diff_value(item)) : this.all_items;
      this.items = items;
    },
  },
};
</script>
