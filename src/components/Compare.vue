<template>
  <v-card v-bind="$attrs">
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="$t('table.search')" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :item-class="get_item_class" :search="search" disable-pagination hide-default-footer fixed-header>
      <template v-slot:no-data>
        <span>{{ $t("table.no_data") }}</span>
      </template>
    </v-data-table>
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
    recommend: { type: Object },
  },

  data() {
    return {
      search: "",
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
    headers.push({ text: this.$t("table.attribute"), value: "attr", width: this.headerWidth, align: this.headerAlign });

    if (objs.length > 1) {
      for (let i = 0; i < objs.length; i++) {
        headers.push({ text: objs[i][this.labelKey], value: "value" + i, width: this.headerWidth, align: this.headerAlign });
      }
    } else {
      headers.push({ text: this.$t("table.value"), value: "value", width: this.headerWidth, align: this.headerAlign });
      if (this.recommend) {
        headers.push({ text: this.$t("table.recommend"), value: "recommend", width: this.headerWidth, align: this.headerAlign });
      }
    }

    const items = [];
    for (let i = 0; i < property_fields.length; i++) {
      const field = property_fields[i];
      if (field.type == "obj") {
        if (objs.length > 1) {
          //can just use first object to retrieve obj meta according to the dynamic
          const object = objs[0][field.name];
          for (const property in object) {
            const obj = {};
            obj["attr"] = property;
            for (let i = 0; i < objs.length; i++) {
              obj["value" + i] = objs[i][field.name][property];
            }
            items.push(obj);
          }
        } else {
          const object = objs[0][field.name];
          for (const property in object) {
            const obj = {};
            obj["attr"] = property;
            obj["value"] = object[property];
            if (this.recommend) {
              obj["recommend"] = this.recommend[property] ? this.recommend[property] + "" : "";
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
    this.items = items;
  },

  methods: {
    get_item_class(item) {
      const diff_class = "diff_item";
      if (this.ids.length > 1) {
        let value = item["value0"];
        for (let i = 0; i < this.ids.length; i++) {
          if (item["value" + i] != value) {
            return diff_class;
          }
        }
      } else if (this.recommend) {
        const value = item["value"];
        const r_value = item["recommend"];
        if (r_value && r_value.trim().length > 0 && r_value.trim() != value) {
          return diff_class;
        }
      }
      return "";
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
