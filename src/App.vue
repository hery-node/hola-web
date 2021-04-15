<template>
  <h-crud ref="table" @click:row="row_clicked" wrap-line :headers="headers" :toolbars="toolbars" :search-fields="headers" :searchable="searchable" :mode="mode" :entity="entity" :item-label-key="item_label_key" :actions="actions" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols">
    <template slot="toolbar" v-if="!$vuetify.breakpoint.xsOnly">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on"><v-icon color="create">mdi-compass-outline</v-icon></v-btn>
        </template>
        <span>Compared Benchmark</span>
      </v-tooltip>
    </template>
  </h-crud>
</template>

<script>
import { axios_post, is_success_response } from "./core/axios";

export default {
  data() {
    return {
      searchable: true,
      search_cols: 4,
      mode: "crud",
      entity: "host",
      item_label_key: "ip",
      sort_key: ["ip"],
      sort_desc: [false],
      headers: [{ name: "name" }, { name: "ip" }, { name: "cpu_model" }, { name: "disk_model", chip: true }, { name: "network_model" }, { name: "owner" }],
      actions: [{ color: "edit", icon: "mdi-refresh", tooltip: this.$t("host.refresh_host"), handle: this.refresh_host }],
      toolbars: [{ color: "edit", icon: "mdi-compass-outline", tooltip: "compared", click: this.refresh_host }],
    };
  },
  methods: {
    async refresh_host(item) {
      const url = "/host/refresh";
      const { code } = await axios_post(url, { _id: item["_id"] });
      if (is_success_response(code) && this.$refs.table) {
        this.$refs.table.refresh();
      }
    },

    row_clicked() {},
  },
};
</script>
