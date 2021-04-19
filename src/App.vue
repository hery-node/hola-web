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
      <!-- <h-array :entity="entity" :id="id" field-name="memory" search-hint="Search Memory Configuration" show-toolbar toolbar-class="cyan darken-2" header-class="cyan lighten-4" :check="check" show-search header-uppcase no-results-text="no result"></h-array> -->
      <h-compare dense show-percentage :entity="entity" :ids="ids" label-key="tag" show-toolbar toolbar-class="cyan darken-2" header-class="cyan lighten-4" header-uppcase :fields="fields"></h-compare>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},
  data() {
    return {
      id: "60757b831e482deace70b3df",
      ids: ["607cef9d170cfbea2f86438f", "607cef88170cfbea2f86438c"],
      fields: [{ name: "bios" }, { name: "cpu" }, { name: "os" }],
      recommend: { "CPU family": 7, cpu_model: "Intel(R) Xeon(R) Gold 8080R CPU @ 2.70GHz" },
      mode: "crud",
      entity: "inspection",
      label_key: "ip",
      sort_key: ["ip"],
      sort_desc: [false],
      headers: [{ name: "cpu_model" }, { name: "disk_model", chip: true }, { name: "network_model" }, { name: "cpu" }],
      actions: [{ color: "edit", icon: "mdi-refresh", tooltip: this.$t("host.refresh_host"), handle: this.refresh_host }],
      toolbars: [{ color: "edit", icon: "mdi-compass-outline", tooltip: "compared", click: this.refresh_host }],
    };
  },

  methods: {
    check() {
      // return { success: true, msg: "This is balanced memory configuration." };
      return { success: false, msg: "This is unbalanced memory configuration." };
    },
  },
};
</script>
