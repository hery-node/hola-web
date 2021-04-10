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
      <!-- <h-search-form entity="user" :fields="search_fields" :cols="6" clear-label="reset" search-label="query" v-model="form" @search="do_search"></h-search-form> -->
      <!-- <h-edit-form entity="user" v-model="form" hide-cancel :cols="6" :fields="search_fields" :success-hint="success_hint" submit-label="Save" @saved="saved"></h-edit-form> -->
      <!-- <h-table searchable entity="user" :headers="headers" :sort-key="sort_key" :sort-desc="sort_desc" :search-fields="search_fields" :search-cols="6" clear-label="reset" search-label="query"></h-table> -->
      <h-crud searchable mode="cu" dialog-width="900px" entity="user" header-align="end" item-label-key="name" :headers="headers" :edit-fields="search_fields" :search-fields="search_fields" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="4" :cols="6"></h-crud>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({
    form: {},
    success_hint: "you have successfully registered as a new user",
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

  methods: {
    cancel_search() {
      console.log("cancel_search");
      console.log(this.form);
    },

    do_search() {
      console.log("do_search");
      console.log(this.form);
    },

    saved() {
      console.log("after saving");
      console.log(this.form);
    },
  },
};
</script>
