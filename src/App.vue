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
      <h-crud ref="table" @dblclick:row="row_clicked" :headers="headers" header-uppcase :entity="entity" :item-label-key="item_label_key" :actions="actions" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :batch-toolbars="toolbars" action-width="200px"> </h-crud>
    </v-main>
  </v-app>
</template>

<script>
import { axios_post, is_success_response } from "./core/axios";
export default {
  name: "App",

  components: {},

  data() {
    return {
      search_cols: 4,
      entity: "host",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
      headers: [{ name: "name" }],
      actions: [
        { color: "edit", icon: "mdi-cloud-upload-outline", tooltip: this.$t("host.setup_host"), handle: this.setup_host },
        { color: "edit", icon: "mdi-refresh", animate: true, tooltip: this.$t("host.refresh_host"), handle: this.refresh_host },
        { color: "edit", icon: "mdi-console", tooltip: this.$t("host.terminal"), handle: this.show_terminal },
      ],
      toolbars: [{ color: "white", icon: "fingerprint", tooltip: this.$t("host.compare"), click: this.compare }],
    };
  },
  methods: {
    async refresh_host(item) {
      const url = "/host/batch_update";
      const { code } = await axios_post(url, { _ids: [item["_id"]] });
      if (is_success_response(code) && this.$refs.table) {
        this.$refs.table.show_success(this.$t("host.refresh_host_success"));
        this.$refs.table.refresh();
      }
    },

    setup_host() {},

    row_clicked(evt, obj) {
      const item = obj["item"];
      this.$router.push({ path: "/inspection/" + item["_id"] });
    },

    show_terminal(item) {
      const terminal = this.$refs.terminal;
      terminal.show(item);
    },

    async compare() {},
  },
};
</script>
