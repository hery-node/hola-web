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
      <!-- <h-crud :edit-fields="edit_fields" create-label="Run Inspection" create-icon="mdi-run" update-label="Tag Inspection" update-icon="mdi-tag-outline" :search-fields="fields" :headers="fields" @click:row="row_clicked" :searchable="searchable" header-uppcase :mode="mode" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols"> </h-crud> -->
      <div>
        <h-bread></h-bread>
        <v-card>
          <v-card-title class="text-center justify-center py-6">
            <h1 class="text-h6">Intel® System Health Inspector</h1>
          </v-card-title>

          <v-tabs v-model="tab" background-color="transparent" grow>
            <v-tab v-for="item in items" :key="item.name">
              <v-badge :color="item.color" :content="item.count">
                {{ item.name }}
              </v-badge>
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <v-tab-item key="BIOS" class="mt-3">
              <h-compare dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_bios')" label-key="tag" :ids="ids" :fields="bios_fields"></h-compare>
            </v-tab-item>
            <v-tab-item key="CPU" class="mt-3">
              <h-compare dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_cpu')" label-key="tag" :ids="ids" :fields="cpu_fields"></h-compare>
            </v-tab-item>
            <v-tab-item key="Memory" class="mt-3">
              <h-array dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_memory')" :id="id" field-name="memory" :check="check_memory"></h-array>
            </v-tab-item>
            <v-tab-item key="Disks" class="mt-3">
              <h-array dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_disk')" :id="id" field-name="disk"></h-array>
            </v-tab-item>
            <v-tab-item key="Network" class="mt-3">
              <h-array dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_network')" :id="id" field-name="network"></h-array>
            </v-tab-item>
            <v-tab-item key="OS" class="mt-3">
              <h-compare dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_os')" label-key="tag" :ids="ids" :fields="os_fields"></h-compare>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data() {
    return {
      entity: "inspection",
      tab: null,
      items: [
        { name: "BIOS", count: "0", color: "success" },
        { name: "CPU", count: "0", color: "success" },
        { name: "Memory", count: "0", color: "success" },
        { name: "Disks", count: "0", color: "success" },
        { name: "Network", count: "0", color: "success" },
        { name: "OS", count: "0", color: "success" },
      ],
      id: "607be8b3565493a85c2e04f3",
      ids: ["607be8b3565493a85c2e04f3"],
      bios_fields: [{ name: "bios" }],
      cpu_fields: [{ name: "cpu" }],
      os_fields: [{ name: "os" }],
    };
  },
  methods: {
    row_clicked(item) {
      this.$router.push({ path: "/host_info/" + item["_id"] });
    },
  },
};
</script>
