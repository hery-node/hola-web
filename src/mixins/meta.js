import { get_ref_labels, get_entity_meta } from "../core/axios";
import { get_type } from "../core/type";

export default {
  props: {
    entity: { type: String, required: true },
    entityLabel: { type: String },
    //this is used for search form and edit form,the fields of the entity
    fields: { type: Array, default: () => [] },
    //merge the fields with server or not
    mergeWithServer: { type: Boolean, default: false },
    //this is used for table headers, the headers of the table
    headers: { type: Array, default: () => [] },
  },

  data() {
    return {
      meta: null,
    };
  },

  computed: {
    entity_label() {
      return this.entityLabel ? this.entityLabel : (this.entity && this.entity.trim().length > 0 ? this.$t(this.entity + "._label") : "");
    },
  },

  methods: {
    async load_meta() {
      if (this.entity && this.entity.trim().length > 0) {
        this.meta = await get_entity_meta(this.entity);
      }
    },

    async set_field_type(field, type) {
      type.multiple && (field.multiple = type.multiple);
      type.items && (field.items = type.items(this));
      field.ref && (field.items = await get_ref_labels(field.ref, this.entity, field.query ? field.query : ""));

      this.set_field_prefix_suffix(field, type);
    },

    async set_field_prefix_suffix(field, type) {
      const prefix = field.prefix ? field.prefix : type.prefix ? type.prefix : null;
      const suffix = field.suffix ? field.suffix : type.suffix ? type.suffix : null;
      field.prefix = typeof prefix === "function" ? prefix(this) : prefix ? prefix : "";
      field.suffix = typeof suffix === "function" ? suffix(this) : suffix ? suffix : "";
      field.icon = field.icon ? field.icon : type.icon ? type.icon : null;
    },

    get_meta_fields(custom_fields, server_fields) {
      if (custom_fields && custom_fields.length > 0) {
        if (this.mergeWithServer) {
          const merge_fields = [];
          for (let i = 0; i < server_fields.length; i++) {
            const field = server_fields[i];
            const [found] = custom_fields.filter(f => f.name == field.name);
            if (found) {
              merge_fields.push({ ...found, ...field });
            } else {
              merge_fields.push({ ...field });
            }
          }
          return merge_fields;
        } else {
          const merge_fields = [];
          for (let i = 0; i < custom_fields.length; i++) {
            const field = custom_fields[i];
            const [found] = server_fields.filter(f => f.name == field.name);
            if (found) {
              merge_fields.push({ ...field, ...found });
            } else {
              console.log("err field not found in server side:" + JSON.stringify(field));
            }
          }
          return merge_fields;
        }
      } else {
        //deep copy server_fields
        const merge_fields = [];
        for (let i = 0; i < server_fields.length; i++) {
          merge_fields.push({ ...server_fields[i] });
        }
        return merge_fields;
      }
    },

    async get_search_fields() {
      if (!this.meta) {
        return [];
      }

      const form_fields = [];
      const server_fields = this.meta.fields.filter((field) => field.search != false && field.sys != true && field.name != this.meta.user_field);
      const meta_fields = this.get_meta_fields(this.fields, server_fields);
      for (let i = 0; i < meta_fields.length; i++) {
        const field = meta_fields[i];
        field.label = this.$t(this.entity + "." + field.name);

        const type = this.get_field_type(field);
        field.input_type = type.search_input_type ? type.search_input_type : type.input_type;
        await this.set_field_type(field, type);

        form_fields.push(field);
      }
      return form_fields;
    },

    field_in_view(field, view) {
      if (view == "*") {
        return true;
      }

      if (field.view) {
        if (Array.isArray(field.view)) {
          return field.view.includes(view);
        } else {
          return field.view == view;
        }
      } else {
        return false;
      }
    },

    async get_edit_fields(update_mode, view) {
      if (!this.meta) {
        return [];
      }
      const edit_fields = update_mode ?
        this.meta.fields.filter((field) => field.create != false && field.update != false && field.sys != true && field.name != this.meta.user_field && this.field_in_view(field, view)) :
        this.meta.fields.filter((field) => field.create != false && field.sys != true && field.name != this.meta.user_field && this.field_in_view(field, view));
      return this.get_form_fields(edit_fields);
    },

    async get_clone_fields() {
      if (!this.meta) {
        return [];
      }
      return this.get_form_fields(this.meta.fields.filter((field) => field.create != false && field.clone != false && field.sys != true && field.name != this.meta.user_field));
    },

    get_field_label(field) {
      return this.get_field_label_by_name(field.name);
    },

    get_field_label_by_name(name) {
      return this.$t(this.entity + "." + name);
    },

    async get_form_fields(server_fields) {
      const form_fields = [];
      const meta_fields = this.get_meta_fields(this.fields, server_fields);

      for (let i = 0; i < meta_fields.length; i++) {
        const field = meta_fields[i];
        const hint_i18n_key = this.entity + "." + field.name + "_hint";
        field.label = this.get_field_label(field);
        field.hint = this.$te(hint_i18n_key) ? this.$t(hint_i18n_key) : "";

        const type = this.get_field_type(field);
        field.input_type = type.input_type;
        await this.set_field_type(field, type);

        const rules = [];
        field.rules = rules;
        field.required === true && rules.push((value) => !!value || value === false || this.$t("form.required", { field: field.label }));
        type.rule && field.rules.push(type.rule(this, field.name));
        field.rule && field.rules.push(...field.rule);

        form_fields.push(field);
      }
      return form_fields;
    },

    async get_property_fields() {
      if (!this.meta) {
        return [];
      }

      const property_fields = [];
      const server_fields = this.meta.fields.filter((field) => field.sys != true && field.name != this.meta.user_field);
      const meta_fields = this.get_meta_fields(this.fields, server_fields);

      for (let i = 0; i < meta_fields.length; i++) {
        const field = meta_fields[i];
        field.label = this.get_field_label(field);
        const type = this.get_field_type(field);
        this.set_field_prefix_suffix(field, type);
        type.format && (field.format = type.format);
        property_fields.push(field);
      }
      return property_fields;
    },

    async get_table_headers(expand_fields) {
      if (!this.meta) {
        return [];
      }

      const table_headers = [];
      const server_fields = this.meta.fields.filter((field) => field.list != false && field.sys != true && field.name != this.meta.user_field && !expand_fields.includes(field.name));
      const meta_fields = this.get_meta_fields(this.headers, server_fields);
      for (let i = 0; i < meta_fields.length; i++) {
        const header = meta_fields[i];
        header.text = this.get_field_label(header);
        header.value = header.name;

        const type = this.get_field_type(header);
        type.format && (header.format = type.format);
        table_headers.push(header);
      }
      return table_headers;
    },

    get_field_type(field) {
      const type = get_type(field.type);

      if (!type) {
        throw new Error("no type found for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
      }
      if (!type.input_type) {
        throw new Error("no input_type defined for [" + field.type + "] in field:" + field.name + " of entity:" + this.entity);
      }
      return type;
    },

    format_field_value(field, value, ctx) {
      const format_value = field.format ? field.format(value, ctx) : value;
      if (format_value) {
        const prefix = field.prefix && !format_value.toString().includes(field.prefix) ? field.prefix : "";
        const suffix = field.suffix && !format_value.toString().includes(field.suffix) ? field.suffix : "";
        return `${prefix} ${format_value} ${suffix}`.trim();
      } else {
        return "";
      }
    },
  },
};
