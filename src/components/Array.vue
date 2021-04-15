<template>
  <v-card v-bind="$attrs">
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="$t('table.search')" single-line hide-details></v-text-field>
    </v-card-title>
    <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :search="search" disable-pagination hide-default-footer fixed-header>
      <template v-slot:no-data>
        <span>{{ $t("table.no_data") }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import Alert from "../mixins/alert";
import Meta from "../mixins/meta";
import { read_entity_properties } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  props: {
    //required attr
    id: { type: String, required: true },
    fieldName: { type: String, required: true },

    headerWidth: { type: String, default: "120px" },
    //Available options are start, center, end, baseline and stretch.
    headerAlign: { type: String, default: "center" },
    headerClass: { type: String, default: "cyan darken-3 subtitle-1 white--text" },
    check: { type: Function },
  },

  data() {
    return {
      search: "",
      items: [],
      table_headers: [],
    };
  },

  async created() {
    const obj = await read_entity_properties(this.entity, this.id, this.fieldName);

    const headers = [];
    const array = obj[this.fieldName];

    if (array && array.length > 0) {
      const meta_obj = array[0];
      for (const property in meta_obj) {
        headers.push({ text: property, value: property, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }
      this.table_headers = headers;
      this.items = array;
    }

    if (this.check) {
      const err = this.check(array);
      if (err && err.trim().length > 0) {
        this.show_error(err, 0);
      }
    }
  },
};
</script>
