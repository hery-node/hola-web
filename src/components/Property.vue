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
import Meta from "../mixins/meta";
import { read_entity_properties } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta],

  props: {
    //required attr
    entityId: { type: String, required: true },
    //end required
    hideHeader: { type: Boolean, default: false },
  },

  data() {
    return {
      form: {},
      property_fields: [],
    };
  },

  async created() {
    this.property_fields = await this.get_property_fields();
    this.read_entity();
  },

  methods: {
    async read_entity() {
      const attr_names = this.property_fields.map((h) => h.name).join(",");
      const obj = await read_entity_properties(this.entity, this.entityId, attr_names);
      for (let j = 0; j < this.property_fields.length; j++) {
        const field = this.property_fields[j];
        const value = field.format ? field.format(obj[field.name], this) : obj[field.name];

        if (value) {
          const prefix = field.prefix && !value.toString().includes(field.prefix) ? field.prefix : "";
          const suffix = field.suffix && !value.toString().includes(field.suffix) ? field.suffix : "";
          obj[field.name] = `${prefix} ${value} ${suffix}`;
        }
      }
      this.form = obj;
    },
  },
};
</script>
