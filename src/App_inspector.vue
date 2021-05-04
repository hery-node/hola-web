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
            <h-compare dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_cpu')" label-key="tag" :ids="ids" :fields="cpu_fields" :recommend="cpu_recommend"></h-compare>
          </v-tab-item>

          <v-tab-item key="Disks" class="mt-3">
            <h-array dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_disk')" :id="id" field-name="disk"></h-array>
          </v-tab-item>
          <v-tab-item key="Network" class="mt-3">
            <h-array dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_network')" :id="id" field-name="network"></h-array>
          </v-tab-item>
          <v-tab-item key="OS" class="mt-3">
            <h-compare dense :entity="entity" show-toolbar header-uppcase :search-hint="$t('inspection.search_os')" label-key="tag" :ids="ids" :fields="os_fields" :recommend="os_recommend"></h-compare>
          </v-tab-item>
          <v-tab-item key="MySQL" class="mt-3">
            <h-compare dense :entity="entity" show-toolbar header-uppcase label-key="tag" :ids="ids" :fields="workload_fields"></h-compare>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
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
        { name: "Disks", count: "0", color: "success" },
        { name: "Network", count: "0", color: "success" },
        { name: "OS", count: "0", color: "success" },
        { name: "MySQL", count: "0", color: "success" },
      ],
      id: "607e856d2f829f996c69e1db",
      ids: ["607e856d2f829f996c69e1db"],
      bios_fields: [{ name: "bios" }],
      cpu_fields: [{ name: "cpu" }],
      os_fields: [{ name: "os" }],
      workload_fields: [{ name: "workload_info" }],
      cpu_recommend: {},
      os_recommend: {},
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
