<template>
  <v-container fill-height fluid grid-list-lg>
    <v-layout wrap>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
      <h-dash-table class="ma-3 mt-10" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      entity: "application",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
    };
  },
};
</script>
