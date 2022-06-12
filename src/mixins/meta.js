import { get_entity_meta, get_ref_labels } from "../core/axios";
import { get_type } from "../core/type";

export default {
  props: {
    entity: { type: String, required: true },
    //this is used for search form and edit form,the fields of the entity
    fields: { type: Array, default: () => [] },
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
      return this.$t(this.entity + "._label");
    },
  },

  methods: {
    async get_meta() {
      if (!this.meta) {
        this.meta = await get_entity_meta(this.entity);
      }
      return this.meta;
    },

    async set_field_type(field, type) {
      type.multiple && (field.multiple = type.multiple);
      type.items && (field.items = type.items(this));
      field.ref && (field.items = await get_ref_labels(field.ref));

      this.set_field_prefix_suffix(field, type);
    },

    async set_field_prefix_suffix(field, type) {
      const prefix = field.prefix ? field.prefix : type.prefix ? type.prefix : null;
      const suffix = field.suffix ? field.suffix : type.suffix ? type.suffix : null;
      field.prefix = typeof prefix === "function" ? prefix(this) : prefix ? prefix : "";
      field.suffix = typeof suffix === "function" ? suffix(this) : suffix ? suffix : "";
      field.icon = field.icon ? field.icon : type.icon ? type.icon : null;
    },

    async get_search_fields() {
      const meta = await this.get_meta();
      if (!meta) {
        return [];
      }

      const form_fields = [];
      const server_fields = meta.fields.filter((field) => field.search != false && field.sys != true && field.name != meta.user_field);
      const meta_fields = this.fields.length > 0 ? this.fields : server_fields;

      for (let i = 0; i < meta_fields.length; i++) {
        const field = this.merge_with_server(meta_fields[i], server_fields);
        field.label = this.$t(this.entity + "." + field.name);

        const type = this.get_field_type(field);
        field.input_type = type.search_input_type ? type.search_input_type : type.input_type;
        this.set_field_type(field, type);

        form_fields.push(field);
      }
      return form_fields;
    },

    async get_edit_fields() {
      const meta = await this.get_meta();
      if (!meta) {
        return [];
      }
      const server_fields = meta.fields.filter((field) => field.create != false && field.sys != true && field.name != meta.user_field);
      return this.get_form_fields(server_fields);
    },

    async get_clone_fields() {
      const meta = await this.get_meta();
      if (!meta) {
        return [];
      }
      const server_fields = meta.fields.filter((field) => field.create != false && field.clone != false && field.sys != true && field.name != meta.user_field);
      return this.get_form_fields(server_fields);
    },

    get_form_fields(server_fields) {
      const form_fields = [];
      const meta_fields = this.fields.length > 0 ? this.fields : server_fields;

      for (let i = 0; i < meta_fields.length; i++) {
        const field = this.merge_with_server(meta_fields[i], server_fields);
        const label_i18n_key = this.entity + "." + field.name;
        const hint_i18n_key = label_i18n_key + "_hint";
        field.label = this.$t(label_i18n_key);
        field.hint = this.$te(hint_i18n_key) ? this.$t(hint_i18n_key) : "";

        const type = this.get_field_type(field);
        field.input_type = type.input_type;
        this.set_field_type(field, type);

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
      const meta = await this.get_meta();
      if (!meta) {
        return [];
      }

      const form_fields = [];
      const server_fields = meta.fields.filter((field) => field.sys != true && field.name != meta.user_field);
      const meta_fields = this.fields.length > 0 ? this.fields : server_fields;

      for (let i = 0; i < meta_fields.length; i++) {
        const field = this.merge_with_server(meta_fields[i], server_fields);
        const label_i18n_key = this.entity + "." + field.name;
        field.label = this.$t(label_i18n_key);

        const type = this.get_field_type(field);
        this.set_field_prefix_suffix(field, type);
        type.format && (field.format = type.format);
        form_fields.push(field);
      }
      return form_fields;
    },

    async get_table_headers() {
      const meta = await this.get_meta();
      if (!meta) {
        return [];
      }

      const table_headers = [];
      const server_fields = meta.fields.filter((field) => field.list != false && field.sys != true && field.name != meta.user_field);
      const meta_fields = this.headers.length > 0 ? this.headers : server_fields;

      for (let i = 0; i < meta_fields.length; i++) {
        const header = this.merge_header_with_server(meta_fields[i], server_fields);
        header.text = this.$t(this.entity + "." + header.name);
        header.value = header.name;

        const type = this.get_field_type(header);
        type.format && (header.format = type.format);
        table_headers.push(header);
      }
      return table_headers;
    },

    merge_with_server(field, server_fields) {
      if (this.fields.length > 0) {
        const [server_field] = server_fields.filter((f) => f.name === field.name);
        if (!server_field) {
          throw new Error("entity:" + this.entity + ", and field name:" + field.name + " not found matched server field");
        }
        return { ...field, ...server_field };
      } else {
        return { ...field };
      }
    },

    merge_header_with_server(field, server_fields) {
      if (this.headers.length > 0) {
        const [server_field] = server_fields.filter((f) => f.name === field.name);
        if (!server_field) {
          throw new Error("entity:" + this.entity + ", and field name:" + field.name + " not found matched server field");
        }
        return { ...field, ...server_field };
      } else {
        return { ...field };
      }
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
  },
};
