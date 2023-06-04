<template>
  <v-container fill-height fluid grid-list-lg>
    <v-layout wrap>
      <v-flex md4 sm12 lg3><h-chart class="ma-3 mt-10" :data="data"> </h-chart></v-flex>
      <v-flex md4 sm12 lg3><h-line-chart class="ma-3 mt-10" :data="data"> </h-line-chart></v-flex>
      <v-flex md4 sm12 lg3><h-bar-chart class="ma-3 mt-10" :data="data"> </h-bar-chart></v-flex>
      <v-flex md4 sm12 lg3><h-combo-chart class="ma-3 mt-10" :data="data"> </h-combo-chart></v-flex>
      <v-flex md4 sm12 lg3><h-pie-chart class="ma-3 mt-10" :data="data"> </h-pie-chart></v-flex>
      <v-flex md4 sm12 lg3><h-pie-chart rose class="ma-3 mt-10" :data="data"> </h-pie-chart></v-flex>
      <v-flex md4 sm12 lg3><h-chart class="ma-3 mt-10" :data="data" type="scatter"> </h-chart></v-flex>
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
      data: [
        [0, 23],
        [1, 24],
        [3, 25],
        [4, 26],
      ],
    };
  },
};
</script>
