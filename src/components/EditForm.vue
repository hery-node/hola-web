<template>
  <div>
    <template v-if="dialog">
      <v-dialog v-model="dialog_show_inner" :max-width="dialogWidth">
        <div style="overflow-x: hidden">
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
        </div>
      </v-dialog>
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
import Meta from "../mixins/meta";
import Alert from "../mixins/alert";
import { read_entity, save_entity, is_success_response, has_invalid_params, is_duplicated } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Meta],

  props: {
    createTitle: { type: String },
    updateTitle: { type: String },
    cloneTitle: { type: String },
    //colspan for the field
    cols: { type: Number, default: 0 },
    //has value then it is edit mode otherwise create mode
    entityId: { type: String, default: undefined },
    //is this edit form is clone or update
    clone: { type: Boolean, default: false },
    //pass hidden values to the form
    hiddenValues: { type: Object },
    //hide cancel button
    hideCancel: { type: Boolean, default: false },
    //label for cancel and submit button
    createCancelLabel: { type: String },
    createSubmitLabel: { type: String },
    updateCancelLabel: { type: String },
    updateSubmitLabel: { type: String },
    //reset value after posting
    resetPost: { type: Boolean, default: true },
    //hide hint or not
    hideHint: { type: Boolean, default: false },
    //success hint to shown
    successHint: { type: String },
    //fail hint to shown
    failHint: { type: String },

    //control whether the form in dialog or not
    dialog: { type: Boolean, default: false },
    //control by outside to show or hidden
    dialogShown: { type: Boolean, default: false },
    //dialog setting
    dialogWidth: { type: String, default: "800px" },
    progressBarColor: { type: String, default: "indigo" },
  },

  data() {
    return {
      //control dialog shown or hidden inner
      dialog_show_inner: false,
      loading: false,
      form: {},
      edit_fields: [],
    };
  },

  async created() {
    if (this.edit_fields.length > 0) {
      return;
    }

    const edit_fields = this.clone ? await this.get_clone_fields() : await this.get_edit_fields();
    edit_fields.forEach((field) => {
      field.cols || (field.cols = this.cols);
    });
    this.edit_fields = edit_fields;
  },

  watch: {
    dialogShown: {
      handler() {
        if (this.dialogShown) {
          this.init_form();
        } else {
          this.dialog_show_inner = false;
        }
      },
      deep: true,
    },
  },

  computed: {
    update_mode() {
      return this.entityId != null;
    },

    form_title() {
      if (this.update_mode) {
        if (this.clone) {
          if (this.cloneTitle && this.cloneTitle.length > 0) {
            return this.cloneTitle;
          }
        } else {
          if (this.updateTitle && this.updateTitle.length > 0) {
            return this.updateTitle;
          }
        }
      } else {
        if (this.createTitle && this.createTitle.length > 0) {
          return this.createTitle;
        }
      }

      const title = this.clone ? this.$t("form.clone_title", { entity: this.entity_label }) : this.$t("form.update_title", { entity: this.entity_label });
      return this.update_mode ? title : this.$t("form.create_title", { entity: this.entity_label });
    },

    cancel_label() {
      if (this.update_mode) {
        if (this.updateCancelLabel && this.updateCancelLabel.length > 0) {
          return this.updateCancelLabel;
        }
      } else {
        if (this.createCancelLabel && this.createCancelLabel.length > 0) {
          return this.createCancelLabel;
        }
      }

      return this.$t("form.cancel_label");
    },

    submit_label() {
      if (this.update_mode) {
        if (this.updateSubmitLabel && this.updateSubmitLabel.length > 0) {
          return this.updateSubmitLabel;
        }
      } else {
        if (this.createSubmitLabel && this.createSubmitLabel.length > 0) {
          return this.createSubmitLabel;
        }
      }

      return this.$t("form.submit_label");
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

    async init_form() {
      //change readonly property every time (update or create mode switch)
      if (this.clone != true) {
        this.edit_fields.forEach((field) => {
          field.update == false && (field.disabled = this.update_mode);
        });
      }

      if (this.update_mode) {
        const attr_names = this.edit_fields.map((h) => h.name).join(",");
        this.form = await read_entity(this.entity, this.entityId, attr_names);
      }

      if (this.dialog) {
        //show dialog after init
        this.dialog_show_inner = true;
      }
    },

    async submit_form(form_data) {
      if (!this.is_validate()) {
        return;
      }

      this.loading = true;
      const form = this.hiddenValues ? { ...form_data, ...this.hiddenValues } : form_data;
      const { code, err } = await save_entity(this.entity, form, this.update_mode, this.clone);
      this.loading = false;
      if (is_success_response(code)) {
        this.resetPost && this.reset_form();

        const update_info = this.clone ? this.$t("form.clone_success_hint", { entity: this.entity_label }) : this.$t("form.update_success_hint", { entity: this.entity_label });
        const success_info = this.successHint ? this.successHint : this.update_mode ? update_info : this.$t("form.create_success_hint", { entity: this.entity_label });
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
        const update_info = this.clone ? this.$t("form.clone_fail_hint", { entity: this.entity_label }) : this.$t("form.update_fail_hint", { entity: this.entity_label });
        const error_info = this.failHint ? this.failHint : this.update_mode ? update_info : this.$t("form.create_fail_hint", { entity: this.entity_label });
        this.show_error(error_info);
      }
    },
  },
};
</script>
