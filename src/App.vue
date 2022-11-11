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
      <h-crud header-uppcase chip-clickable merge-with-server :mode="mode" :entity="entity" :headers="headers" :searchable="searchable" :search-cols="search_cols" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"> </h-crud>
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
      mode: "bcruodf",
      entity: "workload",
      searchable: true,
      search_cols: 6,
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
      headers: [
        {
          name: "client",
          click: (id, entity, name) => {
            const terminal = this.$refs.terminal;
            terminal.show({ _id: id, name: name });
          },
        },
        {
          name: "hosts",
          click: (id, entity, name) => {
            const terminal = this.$refs.terminal;
            terminal.show({ _id: id, name: name });
          },
        },
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
