<template>
  <div>
    <template v-if="dialog">
      <h-window ref="win" :title="form_title" :width="dialogWidth" @close="close_window">
        <div style="overflow-x: hidden">
          <h-form v-bind="$attrs" v-on="$listeners" ref="form" v-model="form" :fields="edit_fields" @submit="submit_form">
            <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
            <v-progress-linear v-if="loading" indeterminate :color="progressBarColor" class="mx-3"></v-progress-linear>
            <v-card-actions>
              <slot>
                <v-row align="center" justify="center" class="my-0 py-0">
                  <v-col cols="6" v-if="!hideCancel" align="center" justify="center">
                    <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_label }}</v-btn>
                  </v-col>
                  <v-col :cols="hideCancel ? 12 : 6" align="center" justify="center">
                    <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_label }}</v-btn>
                  </v-col>
                </v-row>
              </slot>
            </v-card-actions>
          </h-form>
        </div>
      </h-window>
    </template>
    <template v-else>
      <h-form v-bind="$attrs" v-on="$listeners" ref="form" v-model="form" :fields="edit_fields" :title="form_title" @submit="submit_form">
        <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
        <v-progress-linear v-if="loading" indeterminate :color="progressBarColor" class="mx-3"></v-progress-linear>
        <v-card-actions>
          <slot>
            <v-row align="center" justify="center" class="my-0 py-0">
              <v-col cols="6" v-if="!hideCancel" align="center" justify="center">
                <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_label }}</v-btn>
              </v-col>
              <v-col :cols="hideCancel ? 12 : 6" align="center" justify="center">
                <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_label }}</v-btn>
              </v-col>
            </v-row>
          </slot>
        </v-card-actions>
      </h-form>
    </template>
  </div>
</template>

<script>
/**
 * Edit form component
 * Provides create/update/clone form with entity metadata
 */
import Meta from "../mixins/meta";
import Alert from "../mixins/alert";
import { read_property, save_entity, is_success_response, has_invalid_params, is_duplicated } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  props: {
    createFormView: { type: String, default: "*" },
    updateFormView: { type: String, default: "*" },
    createTitle: { type: String },
    updateTitle: { type: String },
    cloneTitle: { type: String },
    cols: { type: Number, default: 0 },
    entityId: { type: String, default: undefined },
    clone: { type: Boolean, default: false },
    hiddenValues: { type: Object },
    hideCancel: { type: Boolean, default: false },
    createCancelLabel: { type: String },
    createSubmitLabel: { type: String },
    updateCancelLabel: { type: String },
    updateSubmitLabel: { type: String },
    resetPost: { type: Boolean, default: true },
    initForm: { type: Boolean, default: false },
    hideHint: { type: Boolean, default: false },
    successHint: { type: String },
    failHint: { type: String },
    showDetailError: { type: Boolean, default: false },
    dialog: { type: Boolean, default: false },
    dialogWidth: { type: String, default: "800px" },
    progressBarColor: { type: String, default: "indigo" },
  },

  data() {
    return {
      loading: false,
      form: {},
      edit_fields: [],
    };
  },

  async created() {
    if (this.initForm) {
      await this.init_form();
    }
  },

  watch: {
    entityId: {
      async handler() {
        if (this.entityId !== "") {
          await this.init_form();
        }
      },
      deep: true,
    },
  },

  computed: {
    /** Get current edit view */
    edit_view() {
      return this.update_mode ? this.updateFormView : this.createFormView;
    },

    /** Check if in update mode */
    update_mode() {
      return this.entityId != null;
    },

    /** Get form title based on mode */
    form_title() {
      if (this.update_mode) {
        if (this.clone && this.cloneTitle?.length > 0) {
          return this.cloneTitle;
        }
        if (!this.clone && this.updateTitle?.length > 0) {
          return this.updateTitle;
        }
        const key = this.clone ? "form.clone_title" : "form.update_title";
        return this.$t(key, { entity: this.entity_label });
      }

      if (this.createTitle?.length > 0) {
        return this.createTitle;
      }
      return this.$t("form.create_title", { entity: this.entity_label });
    },

    /** Get cancel button label */
    cancel_label() {
      if (this.update_mode && this.updateCancelLabel?.length > 0) {
        return this.updateCancelLabel;
      }
      if (!this.update_mode && this.createCancelLabel?.length > 0) {
        return this.createCancelLabel;
      }
      return this.$t("form.cancel_label");
    },

    /** Get submit button label */
    submit_label() {
      if (this.update_mode && this.updateSubmitLabel?.length > 0) {
        return this.updateSubmitLabel;
      }
      if (!this.update_mode && this.createSubmitLabel?.length > 0) {
        return this.createSubmitLabel;
      }
      return this.$t("form.submit_label");
    },
  },

  methods: {
    /** Reset form */
    reset_form() {
      this.$refs.form?.reset_form();
    },

    /** Validate form */
    is_validate() {
      return this.$refs.form?.is_validate() ?? false;
    },

    /** Cancel edit */
    cancel() {
      this.alert.shown = false;
      this.loading = false;
      if (this.dialog) {
        this.$refs.win?.close();
      }
      this.reset_form();
      this.$emit("cancel");
    },

    /** Close window */
    close_window() {
      this.alert.shown = false;
      this.loading = false;
      this.reset_form();
      this.$emit("cancel");
    },

    /** Initialize form with metadata and data */
    async init_form() {
      await this.load_meta();
      const edit_fields = this.clone ? await this.get_clone_fields() : await this.get_edit_fields(this.update_mode, this.edit_view);

      edit_fields.forEach((field) => {
        if (!field.cols) {
          field.cols = this.cols;
        }
      });
      this.edit_fields = edit_fields;

      // Set disabled state for non-updatable fields
      if (!this.clone) {
        this.edit_fields.forEach((field) => {
          if (field.update === false) {
            field.disabled = this.update_mode;
          }
        });
      }

      if (this.update_mode) {
        const attr_names = this.edit_fields.map((h) => h.name).join(",");
        this.form = await read_property(this.entity, this.entityId, attr_names);
      }

      if (this.dialog) {
        this.$refs.win?.show();
      }
    },

    /** Submit form */
    async submit_form(form_data) {
      this.alert.shown = false;

      if (!this.is_validate()) {
        return;
      }

      this.loading = true;
      const form = this.hiddenValues ? { ...form_data, ...this.hiddenValues } : form_data;
      form._view = this.edit_view;

      const { code, err } = await save_entity(this.entity, form, this.update_mode, this.clone);
      this.loading = false;

      if (is_success_response(code)) {
        if (this.resetPost) {
          this.reset_form();
        }

        const update_key = this.clone ? "form.clone_success_hint" : "form.update_success_hint";
        const create_key = "form.create_success_hint";
        const success_info = this.successHint ?? this.$t(this.update_mode ? update_key : create_key, { entity: this.entity_label });

        if (!this.hideHint) {
          this.show_success(success_info);
        }
        if (this.dialog) {
          this.$refs.win?.close();
        }
        this.$emit("success");
      } else if (has_invalid_params(code)) {
        const field_names = err;
        if (field_names?.length === 1) {
          const [field_name] = field_names;
          const [label_field] = this.edit_fields.filter((f) => f.name === field_name);
          const error_info = this.$t("form.err_invalid_value", { field: label_field?.label });
          this.show_error(error_info);
        }
      } else if (is_duplicated(code)) {
        const error_info = this.$t("form.err_duplicate", { entity: this.entity_label });
        this.show_error(error_info);
      } else {
        const update_key = this.clone ? "form.clone_fail_hint" : "form.update_fail_hint";
        const create_key = "form.create_fail_hint";
        const error_info = this.failHint ?? this.$t(this.update_mode ? update_key : create_key, { entity: this.entity_label });
        const error = this.showDetailError ? this.$t("form.error", { err }) : this.$t("form.check_log");
        this.show_error(error_info + error);
      }
    },
  },
};
</script>
