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
      <!-- <h-property entity="user" entity-id="6071614ca73a602476c92d41"></h-property> -->
      <!-- <h-search-form entity="user" :fields="search_fields" :cols="6" clear-label="reset" search-label="query" v-model="form" @search="do_search"></h-search-form> -->
      <!-- <h-edit-form entity="user" v-model="form" hide-cancel :cols="6" :fields="search_fields" :success-hint="success_hint" submit-label="Save" @saved="saved"></h-edit-form> -->
      <!-- <h-table searchable entity="user" :headers="headers" :sort-key="sort_key" :sort-desc="sort_desc" :search-fields="search_fields" :search-cols="6" clear-label="reset" search-label="query"></h-table> -->
      <!-- <h-crud ref="table" header-uppcase @click:row="row_clicked" :search-fields="headers" search-toolbar-class="cyan darken-2 white--text" toolbar-class="cyan darken-2" header-class="cyan lighten-4" :headers="headers" :searchable="searchable" :mode="mode" :entity="entity" :item-label-key="item_label_key" :actions="actions" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols"> </h-crud> -->
      <h-crud header-uppcase :mode="mode" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"> </h-crud>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {
      searchable: true,
      search_cols: 4,
      mode: "cruod",
      entity: "user",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
    };
  },

  computed: {
    table_title() {
      return this.$t("inspection.table_title", { host: this.host_name });
    },

    create_label() {
      return this.$t("inspection.run");
    },

    update_label() {
      return this.$t("inspection.tag_inspect");
    },

    host() {
      return { host: this.host_name };
    },

    host_name() {
      return "clx16";
    },
  },
};
</script>
