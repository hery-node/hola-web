<template>
  <v-expansion-panels>
    <v-expansion-panel v-bind="$attrs">
      <v-expansion-panel-header>
        <span class="title">{{ form_title }}</span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-form ref="search_form" @submit.prevent="search">
          <v-row dense>
            <v-col v-for="(field, index) in form_fields" v-bind:key="index" cols="12" sm="12" xs="12" :md="field.cols ? field.cols : 12" :lg="field.cols ? field.cols : 12">
              <template v-if="field.input_type === 'chip'">
                <v-combobox v-model="form[field.name]" :autofocus="index == 0" :label="field.label" :multiple="field.multiple" chips deletable-chips dense outlined></v-combobox>
              </template>
              <template v-else-if="field.input_type === 'date'">
                <v-menu v-model="show_date_picker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                  <template v-slot:activator="{ on }">
                    <v-text-field :label="field.label" v-model="form[field.name]" readonly dense outlined clearable v-on="on"></v-text-field>
                  </template>
                  <v-date-picker :first-day-of-week="0" v-model="form[field.name]" no-title scrollable @input="show_date_picker = false"></v-date-picker>
                </v-menu>
              </template>
              <template v-else-if="field.items">
                <v-autocomplete :items="field.items" :autofocus="index == 0" v-model="form[field.name]" :label="field.label" :multiple="field.multiple" chips dense outlined clearable></v-autocomplete>
              </template>
              <template v-else-if="field.input_type === 'switch'">
                <v-switch align="center" justify="center" v-model="form[field.name]" :label="field.label" dense outlined></v-switch>
              </template>
              <template v-else>
                <v-text-field v-model="form[field.name]" :autofocus="index == 0" :type="field.input_type ? field.input_type : 'text'" :label="field.label" :disabled="field.disabled ? true : false" dense outlined :clearable="field.disabled ? false : true"></v-text-field>
              </template>
            </v-col>
          </v-row>
          <v-row align="center" justify="center" class="my-0 py-0">
            <v-col cols="6" align="center" justify="center">
              <v-btn color="error" :block="$vuetify.breakpoint.xsOnly" @click="clear">{{ clear_label ? clear_label : $t("form.clear_label") }}</v-btn>
            </v-col>
            <v-col :cols="6" align="center" justify="center">
              <v-btn color="success" :block="$vuetify.breakpoint.xsOnly" type="submit">{{ search_label ? search_label : $t("form.search_label") }}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { get_type } from "./type";

export default {
  inheritAttrs: false,

  props: {
    entity: { type: String, required: true },
    //colspan for the field
    cols: { type: Number, default: 4 },
    //form title
    title: { type: String },
    //label for clear and search button
    clear_label: { type: String },
    search_label: { type: String },
    //the fields of the entity
    fields: { type: Array, default: () => [] },
  },

  data() {
    return {
      form: {},
      show_date_picker: false,
      //used to keep fields propterties
      all_fields: [],
    };
  },

  computed: {
    entity_label() {
      return this.$t(this.entity + "._label");
    },

    form_title() {
      if (this.title) {
        return this.title;
      }

      return this.$t("form.search_title", { entity: this.entity_label });
    },
  },

  asyncComputed: {
    async form_fields() {
      const server_fields = await this.$get_search_fields(this.entity);
      const all_fields = this.fields.length > 0 ? this.fields : server_fields;

      for (let i = 0; i < all_fields.length; i++) {
        const [server_field] = server_fields.filter((f) => f.name === all_fields[i].name);
        if (!server_field) {
          throw new Error("entity:" + this.entity + ",field index:" + i + " and field name" + all_fields[i].name + " not found matched server field");
        }

        const field = { ...all_fields[i], ...server_field };
        field.cols = field.cols ? field.cols : this.cols;
        all_fields[i] = field;

        const label = this.$t(this.entity + "." + field.name);
        field.label = label;

        const type = get_type(field.type);
        if (!type) {
          throw new Error("no type found for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
        }

        if (!type.input_type) {
          throw new Error("no input_type defined for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
        }

        field.input_type = type.input_type;
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
    clear() {
      if (this.$refs.search_form) {
        this.$refs.search_form.reset();
      }
      this.$emit("clear");
    },
    search() {
      this.$emit("search", this.form);
    },
  },
};
</script>
