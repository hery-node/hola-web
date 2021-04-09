<template>
  <v-card v-bind="$attrs">
    <v-form ref="form" @submit.prevent="submit_form">
      <v-card-title v-if="!hideFormTitle">
        <span class="title">{{ form_header_title }}</span>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col v-for="(field, index) in form_fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
            <template v-if="field.input_type === 'combobox'">
              <v-combobox v-model="form[field.name]" :autofocus="index == 0" :label="field.label" :multiple="field.multiple" chips deletable-chips dense outlined></v-combobox>
            </template>
            <template v-else-if="field.input_type === 'password'">
              <v-text-field v-model="form[field.name]" :autofocus="index == 0" :label="field.label" :rules="field.rules ? field.rules : []" dense outlined clearable :type="show_password ? 'text' : 'password'" :append-icon="show_password ? 'visibility' : 'visibility_off'" @click:append="show_password = !show_password" />
            </template>
            <template v-else-if="field.input_type === 'date'">
              <v-menu v-model="show_date_picker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field :label="field.label" v-model="form[field.name]" readonly dense outlined clearable v-on="on"></v-text-field>
                </template>
                <v-date-picker :first-day-of-week="0" v-model="form[field.name]" no-title scrollable @input="show_date_picker = false"></v-date-picker>
              </v-menu>
            </template>
            <template v-else-if="field.input_type === 'editor'">
              <tiptap-vuetify v-model="form[field.name]" :extensions="extensions"></tiptap-vuetify>
            </template>
            <template v-else-if="field.items">
              <v-autocomplete :items="field.items" :autofocus="index == 0" v-model="form[field.name]" :label="field.label" :rules="field.rules ? field.rules : []" :multiple="field.multiple" chips dense outlined clearable></v-autocomplete>
            </template>
            <template v-else-if="field.input_type === 'switch'">
              <v-switch align="center" justify="center" v-model="form[field.name]" :label="field.label" :rules="field.rules ? field.rules : []" dense outlined></v-switch>
            </template>
            <template v-else-if="field.input_type === 'textarea'">
              <v-textarea v-model="form[field.name]" :autofocus="index == 0" :type="field.input_type ? field.input_type : 'text'" :label="field.label" :rules="field.rules ? field.rules : []" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-textarea>
            </template>
            <template v-else>
              <v-text-field v-model="form[field.name]" :autofocus="index == 0" :type="field.input_type ? field.input_type : 'text'" :label="field.label" :rules="field.rules ? field.rules : []" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-text-field>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
      <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
      <v-card-actions>
        <v-row align="center" justify="center" class="my-0 py-0">
          <slot>
            <v-col cols="6" v-if="!hideCancel" align="center" justify="center">
              <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancelLabel ? cancelLabel : $t("form.cancel_label") }}</v-btn>
            </v-col>
            <v-col :cols="hideCancel ? 12 : 6" align="center" justify="center">
              <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submitLabel ? submitLabel : $t("form.submit_label") }}</v-btn>
            </v-col>
          </slot>
        </v-row>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";
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
    //colspan for the field
    cols: { type: Number, default: 0 },
    hideFormTitle: { type: Boolean, default: false },
    hideHint: { type: Boolean, default: false },
    hideCancel: { type: Boolean, default: false },
    //is edit or not
    editMode: { type: Boolean, default: false },
    searchMode: { type: Boolean, default: false },
    //form title
    formTitle: { type: String },
    //label for cancel and submit button
    cancelLabel: { type: String },
    submitLabel: { type: String },
    //reset value after posting
    resetPost: { type: Boolean, default: true },
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

  components: { TiptapVuetify },

  data() {
    return {
      form_fields: [],
      show_date_picker: false,
      show_password: false,
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak],
    };
  },

  async created() {
    this.form_fields = await this.get_form_fields(this.searchMode);
  },

  updated() {
    if (this.$refs.form) {
      this.$refs.form.resetValidation();
    }
  },

  computed: {
    form_header_title() {
      if (this.hideFormTitle) {
        return "";
      }

      if (this.formTitle) {
        return this.formTitle;
      }

      if (this.searchMode) {
        return this.$t("form.search_title", { entity: this.entity_label });
      } else if (this.editMode) {
        return this.$t("form.update_title", { entity: this.entity_label });
      } else {
        return this.$t("form.create_title", { entity: this.entity_label });
      }
    },
  },

  methods: {
    reset_form() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    cancel() {
      this.reset_form();
      this.$emit("cancelled");
    },

    async submit_form() {
      if (this.searchMode) {
        this.$emit("search", this.form);
        return;
      }

      if (!this.$refs.form.validate()) {
        return;
      }

      const { code, err } = await save_entity(this.entity, this.form, this.editMode);
      if (is_success_response(code)) {
        this.resetPost && this.reset_form();

        const success_info = this.successHint ? this.successHint : this.editMode ? this.$t("form.update_success_hint", { entity: this.entity_label }) : this.$t("form.create_success_hint", { entity: this.entity_label });
        this.hideHint || this.show_success(success_info);
        this.$emit("saved");
      } else if (has_invalid_params(code)) {
        const field_names = err;
        if (field_names && field_names.length == 1) {
          const [field_name] = field_names;
          const [label_field] = this.form_fields.filter((f) => f.name == field_name);
          const error_info = this.$t("form.err_invalid_value", { field: label_field.label });
          this.hideHint || this.show_error(error_info);
        }
      } else if (is_duplicated(code)) {
        const error_info = this.$t("form.err_duplicate", { entity: this.entity_label });
        this.hideHint || this.show_error(error_info);
      } else {
        const error_info = this.failHint ? this.failHint : this.editMode ? this.$t("form.update_fail_hint", { entity: this.entity_label }) : this.$t("form.create_fail_hint", { entity: this.entity_label });
        this.hideHint || this.show_error(error_info);
      }
    },
  },
};
</script>
