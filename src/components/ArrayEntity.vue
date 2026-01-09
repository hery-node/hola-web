<template>
  <h-array v-bind="$attrs" :objs="items"></h-array>
</template>

<script>
/**
 * Array entity component
 * Displays array field from entity
 */
import Meta from "../mixins/meta";
import { read_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta],

  props: {
    id: { type: String, required: true },
    fieldName: { type: String, required: true },
  },

  data() {
    return {
      items: [],
    };
  },

  async created() {
    const obj = await read_entity(this.entity, this.id, this.fieldName);
    if (obj?.[this.fieldName]) {
      this.items = obj[this.fieldName];
    }
  },
};
</script>
