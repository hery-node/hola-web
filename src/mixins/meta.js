import { get_entity_meta, get_ref_labels } from '../core/axios';
import { get_type } from '../core/type';

export default {
    props: {
        entity: { type: String, required: true },
        //the fields of the entity
        fields: { type: Array, default: () => [] },
    },

    data() {
        return {
            meta: null
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

        async get_form_fields(search_mode) {
            const meta = await this.get_meta();
            if (!meta) {
                return [];
            }

            const form_fields = [];
            const server_fields = search_mode ? meta.fields.filter(field.searchable != false) : meta.fields.filter(field => field.sys != true);
            const meta_fields = this.fields.length > 0 ? this.fields : server_fields;

            for (let i = 0; i < meta_fields.length; i++) {
                const field = this.merge_with_server(meta_fields[i], server_fields);
                field.label = this.$t(this.entity + "." + field.name);

                const type = this.get_field_type(field);
                if (search_mode) {
                    field.input_type = type.search_input_type ? type.search_input_type : type.input_type;
                } else {
                    field.input_type = type.input_type;
                }

                type.multiple && (field.multiple = type.multiple);
                type.items && (field.items = type.items(this));
                field.ref && (field.items = await get_ref_labels(field.ref));

                if (!search_mode) {
                    const rules = [];
                    field.rules = rules;
                    field.required === true && rules.push((value) => !!value || value === false || this.$t("form.required", { field: field.label }));
                    type.rule && field.rules.push(type.rule(this, field.name));
                }

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
            const server_fields = meta.fields.filter(field => field.visible != false);
            const meta_fields = this.fields.length > 0 ? this.fields : server_fields;

            for (let i = 0; i < meta_fields.length; i++) {
                const field = this.merge_with_server(meta_fields[i], server_fields);
                field.text = this.$t(this.entity + "." + field.name);
                field.value = field.name;

                const type = this.get_field_type(field);
                type.format && (field.format = type.format);
                table_headers.push(field);
            }
            return table_headers;
        },

        merge_with_server(field, server_fields) {
            if (this.fields.length > 0) {
                const [server_field] = server_fields.filter((f) => f.name === field.name);
                if (!server_field) {
                    throw new Error("entity:" + this.entity + ", and field name" + field.name + " not found matched server field");
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
    }
};
