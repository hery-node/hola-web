<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <div class="d-flex align-center">
        <v-img alt="Vuetify Logo" class="shrink mr-2" contain src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png" transition="scale-transition" width="40" />

        <v-img alt="Vuetify Name" class="shrink mt-1 hidden-sm-and-down" contain min-width="100" src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png" width="100" />
      </div>

      <v-spacer></v-spacer>

      <v-btn href="https://github.com/vuetifyjs/vuetify/releases/latest" target="_blank" text>
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <br />
      <br />
      <br />
      <br />
      <h-crud ref="table" :headers="headers" :hidden-fields="hidden_fields" :item-class="get_item_class" :expand-field="expand_field" :filter="workload" @click:row="row_clicked" :title="table_title" :searchable="searchable" :mode="mode" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :toolbars="toolbars" :batch-toolbars="batch_toolbars" :actions="actions"></h-crud>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {
      searchable: false,
      mode: "urd",
      entity: "monitor",
      item_label_key: "time",
      sort_key: ["time"],
      sort_desc: [true],
      expand_field: "result_txt",
      hidden_fields: ["result"],
      headers: [{ name: "tag" }, { name: "time" }, { name: "host" }],
      toolbars: [{ color: "white", icon: "mdi-run", tooltip: this.$t("workload.run"), click: this.run_workload }],
      batch_toolbars: [
        { color: "white", icon: "mdi-select-compare", tooltip: this.$t("monitor.compare"), click: this.compare },
        { color: "white", icon: "stacked_bar_chart", tooltip: this.$t("monitor.top_down_compare"), click: this.top_down_compare },
      ],
      actions: [
        { color: "edit", icon: "mdi-download", tooltip: this.$t("workload.download_emon"), handle: this.download_emon },
        { color: "edit", icon: "visibility", tooltip: this.$t("workload.view_raw_result"), handle: this.view_raw_result },
      ],
    };
  },

  computed: {
    table_title() {
      return this.$t("monitor.table_title", { workload: this.workload_name });
    },

    workload_name() {
      return "Sysbench";
    },

    workload() {
      return { workload: this.workload_name };
    },
  },

  methods: {
    get_item_class(item) {
      return item["tag"] == "clx16_Sysbench_1620111025267" ? "red" : "";
    },

    row_clicked(item) {
      this.$router.push({ path: "/monitor_detail/" + item["_id"] });
    },

    download_emon() {},

    async run_workload() {},

    compare() {},

    top_down_compare() {},
  },
};
</script>
