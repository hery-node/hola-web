<template>
  <v-simple-table fixed-header>
    <template v-slot:default>
      <thead v-if="!hideHeader">
        <tr>
          <th class="text-right">
            {{ $t("table.property_name") }}
          </th>
          <th class="text-left">
            {{ $t("table.property_value") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(field, index) in property_fields" v-bind:key="index">
          <td align="right" width="10%">{{ field.label }}:</td>
          <td align="left" width="90%">{{ form[field.name] }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
/**
 * Property table component
 * Displays entity properties in a table format
 */
import Meta from "../mixins/meta";
import { read_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta],

  props: {
    entityId: { type: String, required: true },
    hideHeader: { type: Boolean, default: false },
  },

  data() {
    return {
      form: {},
      property_fields: [],
    };
  },

  async created() {
    await this.load_meta();
    this.property_fields = await this.get_property_fields();
    this.load();
  },

  methods: {
    /** Load entity data and format fields */
    async load() {
      const attr_names = this.property_fields.map((h) => h.name).join(",");
      const obj = await read_entity(this.entity, this.entityId, attr_names);

      for (let j = 0; j < this.property_fields.length; j++) {
        const field = this.property_fields[j];
        const value = field.format ? field.format(obj[field.name], this) : obj[field.name];

        if (value) {
          const str_value = value.toString();
          const prefix = field.prefix && !str_value.includes(field.prefix) ? field.prefix : "";
          const suffix = field.suffix && !str_value.includes(field.suffix) ? field.suffix : "";
          obj[field.name] = `${prefix} ${value} ${suffix}`;
        }
      }
      this.form = obj;
    },
  },
};
</script>
