<template>
  <v-expansion-panels flat>
    <v-expansion-panel>
      <v-expansion-panel-header>
        <span class="title">{{ form_title }}</span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <h-form v-bind="$attrs" v-on="$listeners" ref="form" v-model="form" :fields="search_fields" hide-title @submit="submit_form">
          <v-card-actions>
            <slot>
              <v-row align="center" justify="center" class="my-0 py-0">
                <v-col cols="6" align="center" justify="center">
                  <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="clear">{{ clearLabel ? clearLabel : $t("form.clear_label") }}</v-btn>
                </v-col>
                <v-col :cols="6" align="center" justify="center">
                  <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ searchLabel ? searchLabel : $t("form.search_label") }}</v-btn>
                </v-col>
              </v-row>
            </slot>
          </v-card-actions>
        </h-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import Meta from "../mixins/meta";

export default {
  inheritAttrs: false,
  mixins: [Meta],

  model: {
    prop: "form",
  },

  props: {
    //this is used as v-model property
    form: { type: Object, required: true },
    //end required
    title: { type: String },
    //colspan for the field
    cols: { type: Number, default: 0 },
    clearLabel: { type: String },
    searchLabel: { type: String },
  },

  data() {
    return {
      search_fields: [],
    };
  },

  async created() {
    const search_fields = await this.get_search_fields();
    search_fields.forEach((field) => {
      field.cols || (field.cols = this.cols);
    });

    this.search_fields = search_fields;
  },

  computed: {
    form_title() {
      if (this.title && this.title.length > 0) {
        return this.title;
      }

      return this.$t("form.search_title", { entity: this.entity_label });
    },
  },

  methods: {
    clear() {
      if (this.$refs.form) {
        this.$refs.form.reset_form();
      }
      this.$emit("clear");
    },

    submit_form() {
      this.$emit("search");
    },
  },
};
</script>
