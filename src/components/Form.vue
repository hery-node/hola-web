<template>
  <v-card v-bind="$attrs">
    <v-form ref="form" @submit.prevent="save">
      <v-card-title v-if="!hide_title">
        <span class="title">{{ form_title }}</span>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col v-for="(field, index) in form_fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
            <template v-if="field.input_type === 'chip'">
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
          <v-col cols="6" v-if="!hide_cancel" align="center" justify="center">
            <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_label ? cancel_label : $t("form.cancel_label") }}</v-btn>
          </v-col>
          <v-col :cols="hide_cancel ? 12 : 6" align="center" justify="center">
            <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_label ? submit_label : $t("form.submit_label") }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";
import { get_type } from "./type";
import { SUCCESS, INVALID_PARAMS, DUPLICATE_KEY } from "../plugins/constant";

export default {
  inheritAttrs: false,

  props: {
    entity: { type: String, required: true },
    //colspan for the field
    cols: { type: Number, default: 0 },
    hide_title: { type: Boolean, default: false },
    hide_hint: { type: Boolean, default: false },
    hide_cancel: { type: Boolean, default: false },
    //form title
    title: { type: String },
    //label for cancel and submit button
    cancel_label: { type: String },
    submit_label: { type: String },
    //reset value after posting
    reset_post: { type: Boolean, default: true },
    //success hint to shown
    success_hint: { type: String },
    //fail hint to shown
    fail_hint: { type: String },
    //the fields of the entity
    fields: { type: Array, default: () => [] },
    //set the initial value if it is edit
    initial_value: {
      type: Object,
      default: function() {
        return undefined;
      },
    },
  },

  components: { TiptapVuetify },

  mounted() {
    if (this.initial_value) {
      this.set_form(this.initial_value);
    }
  },

  data() {
    return {
      form: {},
      edit_mode: false,
      show_date_picker: false,
      show_password: false,
      //used to keep fields propterties
      all_fields: [],
      alert: {
        shown: false,
        type: "warning",
        msg: "",
      },
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak],
    };
  },

  computed: {
    entity_label() {
      return this.$t(this.entity + "._label");
    },

    form_title() {
      if (!this.show_title) {
        return "";
      }

      if (this.title) {
        return this.title;
      }

      if (this.edit_mode) {
        return this.$t("form.update_title", { entity: this.entity_label });
      } else {
        return this.$t("form.create_title", { entity: this.entity_label });
      }
    },
  },

  asyncComputed: {
    async form_fields() {
      const server_fields = await this.$get_fields(this.entity);
      const all_fields = this.fields.length > 0 ? this.fields : server_fields;

      for (let i = 0; i < all_fields.length; i++) {
        const [server_field] = server_fields.filter((f) => f.name === all_fields[i].name);
        if (!server_field) {
          throw new Error("entity:" + this.entity + ",field index:" + i + " and field name:" + all_fields[i].name + " no matched server field");
        }

        const field = { ...all_fields[i], ...server_field };
        field.cols = field.cols ? field.cols : this.cols;
        all_fields[i] = field;

        const label = this.$t(this.entity + "." + field.name);
        field.label = label;

        const rules = [];
        field.rules = rules;
        if (server_field.required === true) {
          const msg_required = this.$t("form.required", { field: label });
          rules.push((value) => !!value || value === false || msg_required);
        }

        const type = get_type(field.type);
        if (!type) {
          throw new Error("no type found for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
        }

        if (!type.input_type) {
          throw new Error("no input_type defined for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
        }

        field.input_type = type.input_type;
        if (type.rule) {
          rules.push(type.rule(this, field.name));
        }
        if (type.multiple) {
          field.multiple = type.multiple;
        }
        if (type.items) {
          field.items = type.items(this);
        }

        if (field.ref) {
          field.items = await this.$get_ref_labels(field.ref);
        }
      }
      this.all_fields = all_fields;
      return all_fields;
    },
  },

  methods: {
    set_form(data) {
      this.form = data;
      this.edit_mode = true;
    },

    show_error(msg) {
      this.show_alert("error", msg, true);
    },

    show_success(msg) {
      this.show_alert("success", msg, true);
    },

    show_alert(type, msg, auto_hide) {
      this.alert.shown = true;
      this.alert.type = type;
      this.alert.msg = msg;
      if (auto_hide) {
        setTimeout(() => (this.alert.shown = false), 5000);
      }
    },

    reset_form() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    cancel() {
      this.reset_form();
      this.$emit("cancel");
    },

    save() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.$save(this.entity, this.form, this.edit_mode).then((result) => {
        if (result.code === SUCCESS) {
          if (this.reset_post === true) {
            this.reset_form();
          }
          const success_info = this.success_hint ? this.success_hint : this.edit_mode ? this.$t("form.update_success_hint", { entity: this.entity_label }) : this.$t("form.create_success_hint", { entity: this.entity_label });
          if (!this.hide_hint) {
            this.show_success(success_info);
          }

          this.$emit("success");
        } else if (result.code === INVALID_PARAMS) {
          const fields = result.err;
          if (fields && fields.length == 1) {
            const [field] = fields;
            const [label_field] = this.all_fields.filter((f) => f.name == field);
            const error_info = this.$t("form.err_invalid_value", { field: label_field.label });
            if (!this.hide_hint) {
              this.show_error(error_info);
            }
          }
        } else if (result.code === DUPLICATE_KEY) {
          const error_info = this.$t("form.err_duplicate", { entity: this.entity_label });
          if (!this.hide_hint) {
            this.show_error(error_info);
          }
        } else {
          const error_info = this.fail_hint ? this.fail_hint : this.edit_mode ? this.$t("form.update_fail_hint", { entity: this.entity_label }) : this.$t("form.create_fail_hint", { entity: this.entity_label });
          if (!this.hide_hint) {
            this.show_error(error_info);
          }
          this.$emit("fail");
        }
      });
    },
  },
};
</script>
