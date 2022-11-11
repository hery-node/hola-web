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
      <h-crud ref="table" :searchable="searchable" :mode="mode" :entity="entity" :actions="actions" :headers="headers" :hidden-fields="hidden_fields" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"></h-crud>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {
      dialog: false,
      space_name: "",
      to_space_id: "",
      spaces: [],
      searchable: true,
      mode: "cruodf",
      entity: "user",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
      hidden_fields: ["root"],
      headers: [{ name: "name" }],
      actions: [
        { color: "delete", icon: "mdi-content-cut", tooltip: this.$t("user.cut_relation_hint"), handle: this.cut_relation, shown: (item) => !item["root"] },
        { color: "edit", icon: "mdi-transfer-right", tooltip: this.$t("user.transfer_hint"), handle: this.show_transfer_space, shown: (item) => !item["root"] },
      ],
    };
  },

  methods: {
    expand() {
      this.width = "100%";
      this.height = window.innerHeight - 300;
      console.log(this.height);
    },
  },
};
</script>
