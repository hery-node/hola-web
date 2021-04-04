<template>
  <v-card v-bind="$attrs">
    <v-form ref="form" @submit.prevent="save">
      <v-card-title v-if="title">
        <span class="title">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col v-for="(field, index) in form_fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
            <template v-if="field.type === 'chip'">
              <v-combobox v-model="form[field.value]" :autofocus="index == 0" :label="field.text" :multiple="field.multiple" chips deletable-chips dense outlined></v-combobox>
            </template>
            <template v-else-if="field.type === 'password'">
              <v-text-field v-model="form[field.value]" :autofocus="index == 0" :label="field.text" :rules="field.rules ? field.rules : []" dense outlined clearable :type="showPassword ? 'text' : 'password'" :append-icon="showPassword ? 'visibility' : 'visibility_off'" @click:append="showPassword = !showPassword" />
            </template>
            <template v-else-if="field.type === 'date'">
              <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field :label="field.text" v-model="form[field.value]" readonly dense outlined clearable v-on="on"></v-text-field>
                </template>
                <v-date-picker :first-day-of-week="0" locale="zh-cn" v-model="form[field.value]" no-title scrollable @input="menu = false"></v-date-picker>
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
          <v-col cols="6" v-if="cancel_label" align="center" justify="center">
            <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_label }}</v-btn>
          </v-col>
          <v-col :cols="cancel_label ? 6 : 12" align="center" justify="center">
            <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_label }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";
import { SUCCESS, CREATE, UPDATE, FIELDS } from "./constant";

export default {
  inheritAttrs: false,

  props: {
    entity: { type: String, required: true },
    //label for submit button
    submit_label: { type: String, required: true },
    //form title
    title: { type: String },
    //label for cancel button
    cancel_label: { type: String },
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
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak],
    };
  },

  asyncComputed: {
    async form_fields() {
      const url = this.entity + FIELDS;
      const result = await this.$read(url);

      if (result.code === SUCCESS) {
        const server_fields = result.data;
        server_fields.forEach((field) => {});

        for (let i = 0; i < this.fields.length; i++) {
          const field = this.fields[i];
          const [server_field] = server_fields.filter((f) => f.name === field.value);
          if (server_field) {
            if (server_field.required === true) {
              const rules = [];
              rules.push((value) => !!value || value === false || msg_required);
              field.rules = rules;
            }
            if (server_field.ref) {
              field.ref = server_field.ref;
            }

            if (field.type) {
              // type is chip, special case
              if (server_field.type === "array") {
                field.multiple = true;
              }
            } else {
              switch (server_field.type) {
                case "array":
                  field.type = "text";
                  field.multiple = true;
                  break;
                case "string":
                  field.type = "text";
                  if (field.ref) {
                    field.multiple = false;
                  }
                  break;
                case "int":
                  field.type = "number";
                  break;
                case "file":
                  field.type = "file";
                  this.form_has_file = true;
                  break;
                default:
                  field.type = server_field.type;
                  break;
              }
            }
          }

          if (field.ref) {
            const params = field.q ? { q: field.q } : {};
            const ref_result = await this.$get(`/${field.ref}/ref`, params);
            if (ref_result.code === 0) {
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
          if (this.success_hint) {
            this.show_success(this.success_hint);
          }
          this.$emit("success");
        } else {
          if (this.fail_hint) {
            this.show_error(this.fail_hint);
          }
          this.$emit("fail");
        }
      });
    },
  },
};
</script>
