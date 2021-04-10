<template>
  <h-form v-bind="$attrs" v-on="$listeners" ref="form" v-model="form" :fields="edit_fields" :title="form_title" @submit="submit_form">
    <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
    <v-card-actions>
      <slot>
        <v-row align="center" justify="center" class="my-0 py-0">
          <v-col cols="6" v-if="!hideCancel" align="center" justify="center">
            <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancelLabel ? cancelLabel : $t("form.cancel_label") }}</v-btn>
          </v-col>
          <v-col :cols="hideCancel ? 12 : 6" align="center" justify="center">
            <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submitLabel ? submitLabel : $t("form.submit_label") }}</v-btn>
          </v-col>
        </v-row>
      </slot>
    </v-card-actions>
  </h-form>
</template>

<script>
import Meta from "../mixins/meta";
import Alert from "../mixins/alert";
import { save_entity, is_success_response, has_invalid_params, is_duplicated } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  model: {
    prop: "form",
  },

  props: {
    title: { type: String },
    //colspan for the field
    cols: { type: Number, default: 0 },
    //is update or create
    updateMode: { type: Boolean, default: false },
    //hide cancel button
    hideCancel: { type: Boolean, default: false },
    //label for cancel and submit button
    cancelLabel: { type: String },
    submitLabel: { type: String },
    //reset value after posting
    resetPost: { type: Boolean, default: true },
    //hide hint or not
    hideHint: { type: Boolean, default: false },
    //success hint to shown
    successHint: { type: String },
    //fail hint to shown
    failHint: { type: String },
    //this is used as v-model property
    form: {
      type: Object,
      default: function() {
        return {};
      },
    },
  },

  data() {
    return {
      edit_fields: [],
    };
  },

  async created() {
    const edit_fields = await this.get_edit_fields();
    edit_fields.forEach((field) => {
      field.cols || (field.cols = this.cols);
    });

    this.edit_fields = edit_fields;
  },

  computed: {
    form_title() {
      if (this.title && this.title.length > 0) {
        return this.title;
      }

      return this.updateMode ? this.$t("form.update_title", { entity: this.entity_label }) : this.$t("form.create_title", { entity: this.entity_label });
    },
  },

  methods: {
    reset_form() {
      if (this.$refs.form) {
        this.$refs.form.reset_form();
      }
    },

    is_validate() {
      return this.$refs.form ? this.$refs.form.is_validate() : false;
    },

    cancel() {
      this.reset_form();
      this.$emit("cancel");
    },

    async submit_form() {
      if (!this.is_validate()) {
        return;
      }

      const { code, err } = await save_entity(this.entity, this.form, this.updateMode);
      if (is_success_response(code)) {
        this.resetPost && this.reset_form();

        const success_info = this.successHint ? this.successHint : this.updateMode ? this.$t("form.update_success_hint", { entity: this.entity_label }) : this.$t("form.create_success_hint", { entity: this.entity_label });
        this.hideHint || this.show_success(success_info);
        this.$emit("saved");
      } else if (has_invalid_params(code)) {
        const field_names = err;
        if (field_names && field_names.length == 1) {
          const [field_name] = field_names;
          const [label_field] = this.edit_fields.filter((f) => f.name == field_name);
          const error_info = this.$t("form.err_invalid_value", { field: label_field.label });
          this.show_error(error_info);
        }
      } else if (is_duplicated(code)) {
        const error_info = this.$t("form.err_duplicate", { entity: this.entity_label });
        this.show_error(error_info);
      } else {
        const error_info = this.failHint ? this.failHint : this.updateMode ? this.$t("form.update_fail_hint", { entity: this.entity_label }) : this.$t("form.create_fail_hint", { entity: this.entity_label });
        this.show_error(error_info);
      }
    },
  },
};
</script>
