<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" class="mr-5" :label="search_hint" single-line hide-details clearable></v-text-field>
      <v-checkbox v-model="only_show_diff" v-if="show_only_show_diff" hide-details :label="show_diff_label"></v-checkbox>
    </v-toolbar>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" disable-pagination hide-default-footer fixed-header> </v-data-table>
  </v-card>
</template>

<script>
import Meta from "../mixins/meta";
import { read_entity_properties } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta],

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
    toolbarClass: { type: String, default: "app_bar" },
    searchHint: { type: String },
    showDiffLabel: { type: String },
    recommend: { type: Object },
  },

  data() {
    return {
      only_show_diff: false,
      search: "",
      all_items: [],
      items: [],
      table_headers: [],
    };
  },

  async created() {
    const property_fields = await this.get_property_fields();
    const attr_names = property_fields.map((h) => h.name).join(",");

    const objs = [];
    for (let i = 0; i < this.ids.length; i++) {
      const entityId = this.ids[i];
      const obj = await read_entity_properties(this.entity, entityId, attr_names + "," + this.labelKey);
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

    const items = [];
    for (let i = 0; i < property_fields.length; i++) {
      const field = property_fields[i];
      if (field.type == "obj") {
        if (objs.length > 1) {
          const property_objs = objs.map((o) => o[field.name]);
          const merged_attributes = this.merge_attributes(property_objs);
          for (let i = 0; i < merged_attributes.length; i++) {
            const attribute = merged_attributes[i];
            const obj = {};
            obj["attr"] = attribute;
            for (let j = 0; j < objs.length; j++) {
              obj["value" + j] = property_objs[j] && property_objs[j][attribute] ? property_objs[j][attribute] : "";
            }
            items.push(obj);
          }
        } else {
          const object = objs[0][field.name];
          const merged_attributes = this.recommend ? this.merge_attributes([object, this.recommend]) : this.merge_attributes([object]);
          for (let i = 0; i < merged_attributes.length; i++) {
            const attribute = merged_attributes[i];
            const obj = {};
            obj["attr"] = attribute;
            obj["value"] = object[attribute] ? object[attribute] + "" : "";
            if (this.recommend) {
              obj["recommend"] = this.recommend[attribute] ? this.recommend[attribute] + "" : "";
            }
            items.push(obj);
          }
        }
      } else {
        const obj = {};
        obj["attr"] = field.label;

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
        items.push(obj);
      }
    }

    this.table_headers = headers;
    this.all_items = items;
    this.items = items;
  },

  watch: {
    only_show_diff: {
      handler() {
        this.filter_diff_values();
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

    show_diff_label() {
      return this.showDiffLabel ? this.showDiffLabel : this.$t("compare.show_diff");
    },
  },

  methods: {
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
        let value = item["value0"];
        for (let i = 0; i < this.ids.length; i++) {
          if (item["value" + i] != value) {
            return true;
          }
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
      return this.is_diff_value(item) ? "diff_item" : "";
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

    filter_diff_values() {
      if (this.only_show_diff) {
        this.items = this.all_items.filter((item) => this.is_diff_value(item));
      } else {
        this.items = this.all_items;
      }
    },
  },
};
</script>

<style>
.diff_item {
  color: #37474f;
  background-color: #ffcdd2;
}

.diff_item:hover {
  color: #37474f !important;
  background-color: #ffcdd2 !important;
}
</style>
