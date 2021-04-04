<template>
  <v-card v-bind="$attrs">
    <v-form ref="form" @submit.prevent="save">
      <v-card-title v-if="!no_title">
        <span class="title">{{ form_title }}</span>
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
      <v-alert v-model="alert" :type="alert_type" dismissible><span v-html="alert_info"></span></v-alert>
      <v-card-actions>
        <v-row align="center" justify="center" class="my-0 py-0">
          <v-col cols="6" v-if="cancellable" align="center" justify="center">
            <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="cancel">{{ cancel_text ? cancel_text : $t("common.cancel") }}</v-btn>
          </v-col>
          <v-col :cols="cancellable ? 6 : 12" align="center" justify="center">
            <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ submit_text ? submit_text : $t("common.save") }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";

export default {
  inheritAttrs: false,

  props: {
    action: { type: String, required: true },
    label: { type: String },
    title: { type: String },
    cancel_text: { type: String },
    submit_text: { type: String },
    cancellable: { type: Boolean, default: true },
    resettable: { type: Boolean, default: true },
    load_fields: { type: Boolean, default: true },
    no_title: { type: Boolean, default: false },
    success: { type: String },
    fields: { type: Array, default: () => [] },
    form_obj: {
      type: Object,
      default: function() {
        return undefined;
      }
    }
  },

  components: { TiptapVuetify },

  mounted() {
    if (this.form_obj) {
      this.set_form(this.form_obj);
    }
  },

  data() {
    return {
      showPassword: false,
      menu: false,
      alert: false,
      alert_type: "warning",
      alert_info: "",
      is_edit: false,
      form: {},
      form_has_file: false,
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak]
    };
  },

  computed: {
    form_title() {
      if (this.title) {
        return this.title;
      }

      if (this.is_edit) {
        return this.$t("common.update_title", { obj: this.label });
      } else {
        return this.$t("common.add_title", { obj: this.label });
      }
    }
  },

  asyncComputed: {
    async form_fields() {
      if (this.load_fields === false) {
        return this.fields;
      }

      const msg_required = this.$t("common.required");

      const url = this.action + "/fields";
      const result = await this.$get(url);
      if (result.code === 0) {
        const server_fields = result.data;

        for (let i = 0; i < this.fields.length; i++) {
          const field = this.fields[i];
          const [server_field] = server_fields.filter(f => f.name === field.value);
          if (server_field) {
            if (server_field.required === true) {
              const rules = [];
              rules.push(value => !!value || value === false || msg_required);
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
    }
  },

  methods: {
    show_error(msg) {
      this.show_alter("error", msg, false);
    },

    show_alter(type, msg, auto_hide) {
      this.alert = true;
      this.alert_type = type;
      this.alert_info = msg;
      if (auto_hide) {
        setTimeout(() => (this.alert = false), 5000);
      }
    },

    url(str) {
      const image = this.form[str + "_preview"];
      if (image) {
        return this.$url(`${this.action}/image/${image}`);
      } else {
        return "";
      }
    },

    show_form() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
      //clear editor and image
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.type === "editor") {
          this.form[field.value] = "";
        } else if (field.type === "file") {
          this.form[field.value + "_preview"] = "";
        }
      }
      this.is_edit = false;
    },

    set_form(data) {
      this.form = data;
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        const value = this.form[field.value];
        if (field.type === "file" && value) {
          this.form[field.value + "_preview"] = value;
          delete this.form[field.value];
        }
      }
      this.is_edit = true;
    },

    cancel() {
      this.$refs.form.reset();
      this.$emit("cancelled");
    },

    save() {
      if (!this.$refs.form.validate()) {
        return;
      }

      const url = this.is_edit ? this.action + "/update" : this.action + "/add";
      this.$post(url, this.form, this.form_has_file, this.show_error).then(result => {
        if (result.code === 0) {
          if (this.resettable === true) {
            this.$refs.form.reset();
          }
          if (this.success) {
            this.show_alter("success", this.success);
          }
          this.$emit("saved");
        }
      });
    }
  }
};
</script>
