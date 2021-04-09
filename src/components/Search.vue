<template>
  <v-expansion-panels flat>
    <v-expansion-panel>
      <v-expansion-panel-header>
        <span class="title">{{ form_title }}</span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <h-form ref="search_form" hide-form-title hide-hint search-mode :reset-post="false" :fields="searchFields" :col="searchCols">
          <v-row align="center" justify="center" class="my-0 py-0">
            <v-col cols="6" align="center" justify="center">
              <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="clear">{{ clearLabel ? clearLabel : $t("form.clear_label") }}</v-btn>
            </v-col>
            <v-col :cols="6" align="center" justify="center">
              <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ searchLabel ? searchLabel : $t("form.search_label") }}</v-btn>
            </v-col>
          </v-row>
        </h-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    entity: { type: String, required: true },
    searchTitle: { type: String },
    searchCols: { type: Number, default: 0 },
    clearLabel: { type: String },
    searchLabel: { type: String },
    //the fields of the entity
    searchFields: { type: Array, default: () => [] },
  },

  computed: {
    form_title() {
      if (this.searchTitle) {
        return this.searchTitle;
      }

      return this.$t("form.search_title", { entity: this.$refs.search_form ? this.$refs.search_form.entity_label : "" });
    },
  },

  methods: {
    clear() {
      if (this.$refs.search_form) {
        this.$refs.search_form.reset_form();
      }
      this.$emit("clear");
    },
  },
};
</script>
