<template>
  <v-container fill-height fluid grid-list-lg>
    <v-layout wrap>
      <v-flex md4 sm12 lg3><h-dash-table class="ma-3 mt-10" :headers="headers" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table></v-flex>
      <v-flex md4 sm12 lg3><h-dash-table class="ma-3 mt-10" :headers="headers" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table></v-flex>
      <v-flex md4 sm12 lg3><h-dash-table class="ma-3 mt-10" :headers="headers" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table></v-flex>
      <v-flex md4 sm12 lg3><h-dash-table class="ma-3 mt-10" :headers="headers" title="Application View" text="Text content" :entity="entity" :sort-key="sort_key" :sort-desc="sort_desc"> </h-dash-table></v-flex>
      <v-flex md4 sm12 lg3><h-dash-chart class="ma-3 mt-10" :data="data" :options="options" type="Line" title="Application View" sub-icon="mdi-clock-outline" sub-text="chart dashboard"> </h-dash-chart></v-flex>
      <v-flex md4 sm12 lg3><h-dash-chart class="ma-3 mt-10" color="red" :data="data" :options="options" type="Line" title="Application View" sub-icon="mdi-clock-outline" sub-text="chart dashboard"> </h-dash-chart></v-flex>
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
      headers: [{ name: "name" }, { name: "comment" }],
      options: { height: "300px", chartPadding: { top: 20, right: 0, bottom: 0, left: 0 }, axisY: { onlyInteger: true } },
      data: { labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], series: [["63", "19", "57", "64", "22", "71", "23", "68", "47", "43", "58", "18", "30", "39", "60", "32", "58", "33", "53", "72"]] },
    };
  },
};
</script>
