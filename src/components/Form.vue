<template>
  <v-card v-bind="$attrs" flat>
    <v-form ref="form" @submit.prevent="submit_form">
      <v-card-title v-if="!hideTitle">
        <span class="title">{{ form_title }}</span>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col v-for="(field, index) in fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
            <template v-if="field.input_type === 'combobox'">
              <v-combobox v-model="form[field.name]" :autofocus="index == 0" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :multiple="field.multiple" chips deletable-chips dense outlined></v-combobox>
            </template>
            <template v-else-if="field.input_type === 'password'">
              <v-text-field v-model="form[field.name]" :autofocus="index == 0" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ? field.rules : []" dense outlined clearable :type="show_password ? 'text' : 'password'" :append-icon="show_password ? 'visibility' : 'visibility_off'" @click:append="show_password = !show_password" />
            </template>
            <template v-else-if="field.input_type === 'date'">
              <v-menu v-model="show_date_picker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field :label="field.label" v-model="form[field.name]" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" readonly dense outlined clearable v-on="on"></v-text-field>
                </template>
                <v-date-picker :first-day-of-week="0" v-model="form[field.name]" no-title scrollable @input="show_date_picker = false"></v-date-picker>
              </v-menu>
            </template>
            <template v-else-if="field.input_type === 'editor'">
              <tiptap-vuetify v-model="form[field.name]" :extensions="extensions"></tiptap-vuetify>
            </template>
            <template v-else-if="field.items">
              <v-autocomplete :items="field.items" :autofocus="index == 0" v-model="form[field.name]" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ? field.rules : []" :multiple="field.multiple" chips dense outlined clearable></v-autocomplete>
            </template>
            <template v-else-if="field.input_type === 'switch'">
              <v-switch align="center" justify="center" v-model="form[field.name]" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ? field.rules : []" dense outlined></v-switch>
            </template>
            <template v-else-if="field.input_type === 'textarea'">
              <v-textarea v-model="form[field.name]" :autofocus="index == 0" :type="field.input_type ? field.input_type : 'text'" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ? field.rules : []" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-textarea>
            </template>
            <template v-else>
              <v-text-field v-model="form[field.name]" :autofocus="index == 0" :type="field.input_type ? field.input_type : 'text'" :label="field.label" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ? field.rules : []" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-text-field>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
      <slot></slot>
    </v-form>
  </v-card>
</template>

<script>
import { TiptapVuetify, Heading, Image, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from "tiptap-vuetify";

export default {
  inheritAttrs: false,

  model: {
    prop: "form",
  },

  props: {
    //required attrs
    fields: { type: Array, required: true },
    //this is used as v-model property
    form: { type: Object, required: true },
    //end required
    //form title
    title: { type: String },
    hideTitle: { type: Boolean, default: false },
  },

  components: { TiptapVuetify },

  data() {
    return {
      show_date_picker: false,
      show_password: false,
      extensions: [History, Blockquote, Link, Image, Underline, Strike, Italic, ListItem, BulletList, OrderedList, [Heading, { options: { levels: [1, 2, 3] } }], Bold, Code, HorizontalRule, Paragraph, HardBreak],
    };
  },

  computed: {
    form_title() {
      if (this.hideTitle) {
        return "";
      }

      if (this.title) {
        return this.title;
      } else {
        return "";
      }
    },
  },

  methods: {
    reset_form() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    reset_validation() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    is_validate() {
      return this.$refs.form ? this.$refs.form.validate() : false;
    },

    submit_form() {
      this.$emit("submit");
    },
  },
};
</script>
