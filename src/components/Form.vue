<template>
  <v-card v-bind="$attrs">
    <v-form ref="form" @submit.prevent="save">
      <v-card-title v-if="show_title">
        <span class="title">{{ form_title }}</span>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col v-for="(field, index) in form_fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
            <template v-if="field.input_type === 'chip'">
              <v-combobox v-model="form[field.value]" :autofocus="index == 0" :label="field.label" :multiple="field.multiple" chips deletable-chips dense outlined></v-combobox>
            </template>
            <template v-else-if="field.type === 'password'">
              <v-text-field v-model="form[field.value]" :autofocus="index == 0" :label="field.text" :rules="field.rules ? field.rules : []" dense outlined clearable :type="show_password ? 'text' : 'password'" :append-icon="show_password ? 'visibility' : 'visibility_off'" @click:append="show_password = !show_password" />
            </template>
            <template v-else-if="field.type === 'date'">
              <v-menu v-model="show_date_picker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field :label="field.text" v-model="form[field.value]" readonly dense outlined clearable v-on="on"></v-text-field>
                </template>
                <v-date-picker :first-day-of-week="0" locale="zh-cn" v-model="form[field.value]" no-title scrollable @input="show_date_picker = false"></v-date-picker>
              </v-menu>
            </template>
            <template v-else-if="field.type === 'editor'">
              <tiptap-vuetify v-model="form[field.value]" :extensions="extensions"></tiptap-vuetify>
            </template>
            <template v-else-if="field.type === 'file'">
              <v-row justify="space-around">
                <v-col cols="8">
                  <v-file-input v-model="form[field.value]" :autofocus="index == 0" :label="field.text" show-size></v-file-input>
                </v-col>
                <v-col cols="4">
                  <v-img :src="url(field.value)" max-height="125" />
                </v-col>
              </v-row>
            </template>
            <template v-else-if="field.ref">
              <v-autocomplete :items="field.items" :autofocus="index == 0" v-model="form[field.value]" :label="field.text" :rules="field.rules ? field.rules : []" :multiple="field.multiple" chips dense outlined clearable></v-autocomplete>
            </template>
            <template v-else-if="field.items">
              <v-autocomplete :items="field.items" :autofocus="index == 0" v-model="form[field.value]" :label="field.text" :rules="field.rules ? field.rules : []" :multiple="field.multiple" chips dense outlined clearable></v-autocomplete>
            </template>
            <template v-else-if="field.type === 'boolean'">
              <v-switch align="center" justify="center" v-model="form[field.value]" :label="field.text" :rules="field.rules ? field.rules : []" dense outlined></v-switch>
            </template>
            <template v-else>
              <v-text-field v-model="form[field.value]" :autofocus="index == 0" :type="field.type ? field.type : 'text'" :label="field.text" :rules="field.rules ? field.rules : []" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-text-field>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
      <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
      <v-card-actions>
        <v-row align="center" justify="center" class="my-0 py-0">
          <v-col cols="6" v-if="show_cancel_button" align="center" justify="center">
            <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_label ? cancel_label : $t("form.cancel_label") }}</v-btn>
          </v-col>
          <v-col :cols="show_cancel_button ? 6 : 12" align="center" justify="center">
            <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_label ? submit_label : $t("form.submit_label") }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";
import { SUCCESS, CREATE, UPDATE, FIELDS, REF } from "./constant";
import { get_form_type_mapping } from "./type";

export default {
  inheritAttrs: false,

  props: {
    entity: { type: String, required: true },
    //label for entity
    entity_label: { type: String, required: true },
    cols: { type: Number, default: 0 },
    show_title: { type: Boolean, default: true },
    show_cancel_button: { type: Boolean, default: true },
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
      is_edit: false,
      alert: {
        shown: false,
        type: "warning",
        msg: "",
      },
      show_date_picker: false,
      show_password: false,
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak],
    };
  },

  asyncComputed: {
    async form_fields() {
      const url = this.entity + FIELDS;
      const result = await this.$read(url);

      if (result.code === SUCCESS) {
        const server_fields = result.data;
        const all_fields = this.fields.length > 0 ? this.fields : server_fields;
        const mapping = get_form_type_mapping();

        for (let i = 0; i < all_fields.length; i++) {
          const field = all_fields[i];
          if (!field.name) {
            throw new Error("field name is required. entity:" + this.entity + ",field index:" + i);
          }

          const label = field.label ? field.label : this.$t(this.entity + "." + field.name);
          const [server_field] = server_fields.filter((f) => f.name === field.name);
          const rules = field.rules ? field.rules : [];

          if (server_field) {
            field.multiple = field.multiple ? field.multiple : server_field.type === "array";

            if (server_field.required === true) {
              const msg_required = this.$t("form.required", { field: label });
              rules.push((value) => !!value || value === false || msg_required);
            }
          }

          if (!field.input_type) {
            const type = mapping[field.type];
            if (!type) {
              throw new Error("no type mapping for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
            }
            field.input_type = type;
          }

          field.rules = rules;
          field.cols = field.cols ? field.cols : this.cols;

          if (field.ref) {
            const ref_result = await this.$get(field.ref + REF, {});
            if (ref_result.code === SUCCESS) {
              field.items = ref_result.data;
            } else {
              field.items = [];
            }
          }
        }
      }
      return this.fields;
    },
  },

  methods: {
    form_title() {
      if (!this.show_title) {
        return "";
      }

      if (this.title) {
        return this.title;
      }

      if (this.is_edit) {
        return this.$t("form.update_title", { entity: this.entity_label });
      } else {
        return this.$t("form.create_title", { entity: this.entity_label });
      }
    },

    set_form(data) {
      this.form = data;
      this.is_edit = true;
    },

    show_error(msg) {
      this.show_alert("error", msg, false);
    },

    show_success(msg) {
      this.show_alert("success", msg, false);
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

      const url = this.is_edit ? this.entity + UPDATE : this.entity + CREATE;
      this.$post(url, this.form).then((result) => {
        if (result.code === SUCCESS) {
          if (this.reset_post === true) {
            this.reset_form();
          }
          const success_info = this.success_hint ? this.success_hint : this.is_edit ? this.$t("form.update_success_hint", { entity: this.entity_label }) : this.$t("form.create_success_hint", { entity: this.entity_label });
          this.show_success(success_info);
          this.$emit("success");
        } else {
          const error_info = this.fail_hint ? this.fail_hint : this.is_edit ? this.$t("form.update_fail_hint", { entity: this.entity_label }) : this.$t("form.create_fail_hint", { entity: this.entity_label });
          this.show_error(error_info);
          this.$emit("fail");
        }
      });
    },
  },
};
</script>
