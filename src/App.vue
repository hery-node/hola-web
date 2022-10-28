<template>
  <div>
    <h-crud header-uppcase chip-clickable :mode="mode" :entity="entity" :searchable="searchable" :search-cols="search_cols" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"> </h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mode: "cruodf",
      entity: "workload",
      searchable: true,
      search_cols: 6,
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
    };
  },
};
</script>
