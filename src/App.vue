<template>
  <v-app>
    <v-app-bar app color="primary" dark>
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
      <h-crud ref="table" :entity="entity" :mode="mode" :item-label-key="item_label_key" :headers="headers" :update-label="update_label" update-icon="mdi-tag-outline" :expand-fields="expand_fields" :search-cols="search_cols" :sort-key="sort_key" :sort-desc="sort_desc" :actions="actions" :hidden-fields="hidden_fields" :batch-toolbars="batch_toolbars" chip-clickable @dblclick:row="row_clicked" :item-class="get_item_class" action-width="230px"></h-crud>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {
      server: process.env.VUE_APP_SOCKET_SERVER,
      search_cols: 6,
      entity: "monitor",
      mode: "bdrsu",
      item_label_key: "tag",
      sort_key: ["time"],
      sort_desc: [true],
      expand_fields: ["param_str", "extra", "result_txt"],
      hidden_fields: ["app_baseline", "has_emon"],
      headers: [
        { name: "time" },
        { name: "tag" },
        { name: "benchmarking" },
        {
          name: "host",
          click: (id, entity, name) => {
            const terminal = this.$refs.terminal;
            terminal.show({ _id: id, name: name });
          },
        },
        { name: "sla_result" },
        { name: "sla" },
        { name: "result" },
        { name: "improve" },
      ],
      batch_toolbars: [{ color: "white", icon: "insights", tooltip: this.$t("monitor.compare"), click: this.monitor_compare }],
      actions: [
        { color: "edit", icon: "mdi-eye", tooltip: this.$t("monitor.mark_as_baseline"), handle: this.mark_as_baseline },
        { color: "edit", icon: "mdi-microsoft-excel", tooltip: this.$t("monitor.download_emon"), handle: this.download_emon, shown: (item) => item["has_emon"] == true },
      ],
    };
  },

  computed: {
    update_label() {
      return this.$t("monitor.tag_monitor");
    },
  },

  methods: {
    get_item_class(item) {
      return item["app_baseline"] == true ? "red lighten-4" : "";
    },

    monitor_compare() {
      const table = this.$refs.table;
      const items = table.get_selected_items();
      if (items != null) {
        this.$router.push({ path: "/monitor_all_compare/" + items.map((item) => item["_id"]).join(",") });
      }
    },

    row_clicked(evt, obj) {
      const item = obj["item"];
      this.$router.push({ path: "/monitor_all_detail/" + item["_id"] });
    },
  },
};
</script>
