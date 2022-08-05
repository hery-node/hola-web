<template>
  <v-card v-bind="$attrs">
    <v-alert class="mt-3" v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
    <v-toolbar :class="toolbarClass" dark v-if="showToolbar">
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="search_hint" single-line hide-details clearable></v-text-field>
    </v-toolbar>
    <v-data-table v-bind="$attrs" v-on="$listeners" :headers="table_headers" :items="items" :search="search" disable-pagination hide-default-footer fixed-header> </v-data-table>
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
    headerClass: { type: String, default: "table_header subtitle-2" },
    headerUppcase: { type: Boolean, default: false },
    showToolbar: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    searchHint: { type: String },
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
        headers.push({ text: this.headerUppcase ? property.toUpperCase() : property, value: property, width: this.headerWidth, align: this.headerAlign, class: this.headerClass });
      }
      this.table_headers = headers;
      this.items = array;
    }

    if (this.check) {
      const { success, msg } = this.check(array);
      if (success == true) {
        this.$emit("success");
        this.show_success(msg, 0);
      } else {
        this.$emit("error");
        this.show_error(msg, 0);
      }
    }
  },

  computed: {
    search_hint() {
      return this.searchHint ? this.searchHint : this.$t("table.search");
    },
  },
};
</script>
