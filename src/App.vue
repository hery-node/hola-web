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
      <v-card flat>
        <v-card-title class="text-h6"><p v-text="titles['knobs_os']"></p></v-card-title>
        <v-card-text>
          <h-array dense :entity="entity" header-uppcase :id="id" field-name="knobs_os"></h-array>
        </v-card-text>
      </v-card>
      <v-card flat>
        <v-card-title class="text-h6"><p v-text="titles['knobs_app']"></p></v-card-title>
        <v-card-text>
          <h-array dense :entity="entity" header-uppcase :id="id" field-name="knobs_app"></h-array>
        </v-card-text>
      </v-card>
      <v-card flat>
        <v-card-title class="text-h6"><p v-text="titles['knobs_benchmark']"></p></v-card-title>
        <v-card-text>
          <h-array dense :entity="entity" header-uppcase :id="id" field-name="knobs_benchmark"></h-array>
        </v-card-text>
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
      entity: "benchmarking",
      id: "635c7e6aecf2f40bf70feca9",
      titles: { knobs_os: "", knobs_app: "", knobs_benchmark: "" },
    };
  },

  methods: {
    row_clicked(evt, item) {
      console.log(item);
    },
  },
};
</script>
