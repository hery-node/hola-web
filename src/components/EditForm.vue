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
import { read_entity, save_entity, is_success_response, has_invalid_params, is_duplicated } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  props: {
    title: { type: String },
    //colspan for the field
    cols: { type: Number, default: 0 },
    //has value then it is edit mode otherwise create mode
    entityId: { type: String, default: null },
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
  },

  data() {
    return {
      form: {},
      edit_fields: [],
    };
  },

  async created() {
    const edit_fields = await this.get_edit_fields();
    edit_fields.forEach((field) => {
      field.cols || (field.cols = this.cols);
    });

    this.edit_fields = edit_fields;
    this.read_entity();
  },

  watch: {
    entityId: {
      handler() {
        this.read_entity();
      },
      deep: true,
    },
  },

  computed: {
    update_mode() {
      return this.entityId != null;
    },

    form_title() {
      if (this.title && this.title.length > 0) {
        return this.title;
      }

      return this.update_mode ? this.$t("form.update_title", { entity: this.entity_label }) : this.$t("form.create_title", { entity: this.entity_label });
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

    async read_entity() {
      if (this.update_mode) {
        const attr_names = this.edit_fields.map((h) => h.name).join(",");
        this.form = await read_entity(this.entity, this.entityId, attr_names);
      } else {
        this.reset_form();
      }
    },

    async submit_form() {
      if (!this.is_validate()) {
        return;
      }

      const { code, err } = await save_entity(this.entity, this.form, this.update_mode);
      if (is_success_response(code)) {
        this.resetPost && this.reset_form();

        const success_info = this.successHint ? this.successHint : this.update_mode ? this.$t("form.update_success_hint", { entity: this.entity_label }) : this.$t("form.create_success_hint", { entity: this.entity_label });
        this.hideHint || this.show_success(success_info);
        this.$emit("success");
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
        const error_info = this.failHint ? this.failHint : this.update_mode ? this.$t("form.update_fail_hint", { entity: this.entity_label }) : this.$t("form.create_fail_hint", { entity: this.entity_label });
        this.show_error(error_info);
      }
    },
  },
};
</script>
