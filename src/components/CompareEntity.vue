<template>
  <h-compare v-bind="$attrs" :objs="items"></h-compare>
</template>

<script>
import Meta from "../mixins/meta";
import { read_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Meta],

  props: {
    //one is used to show, more than one is used to compare
    ids: { type: Array, required: true },
    labelKey: { type: String, required: true },
  },

  data() {
    return {
      items: [],
    };
  },

  async created() {
    await this.load_meta();
    const property_fields = await this.get_property_fields();
    const attr_names = property_fields.map((h) => h.name).join(",");

    const objs = [];
    for (let i = 0; i < this.ids.length; i++) {
      objs.push(await read_entity(this.entity, this.ids[i], attr_names + "," + this.labelKey));
    }
    this.items = objs;
  },
};
</script>
