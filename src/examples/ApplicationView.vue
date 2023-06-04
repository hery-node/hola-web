<template>
  <h-crud header-uppcase :entity="entity" :mode="mode" :expand-fields="expand_fields" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"> </h-crud>
</template>

<script>
export default {
  data() {
    return {
      entity: "application",
      mode: "bcdeioru",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
      expand_fields: ["comment"],
    };
  },
};
</script>
