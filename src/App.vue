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
      <h-form :fields="search_fields" hide-title title="hello world" v-model="form" hide_title></h-form>
      <!-- <h-table infinite searchable hide_title entity="user" :headers="headers" :sort_key="sort_key" :sort_desc="sort_desc" :search_fields="search_fields" :search_cols="6"></h-table> -->
      <!-- <h-crud searchable entity="user" header-align="end" item-label-key="name" :table-fields="headers" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="4" :cols="6"></h-crud> -->
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({
    form: {},
    sort_key: ["name"],
    sort_desc: [false],
    search_fields: [{ name: "name" }, { name: "role" }, { name: "gender" }, { name: "age" }],
    headers: [
      { name: "name" },
      { name: "email" },
      {
        name: "age",
        style: (value) => {
          if (value > 15) {
            return "red--text";
          } else {
            return "green--text";
          }
        },
      },
      {
        name: "role",
        align: "center",
        chip: true,
        style: () => {
          return "blue";
        },
      },
      { name: "gender" },
      { name: "birthday" },
      { name: "status" },
      { name: "rate" },
    ],
  }),
};
</script>
