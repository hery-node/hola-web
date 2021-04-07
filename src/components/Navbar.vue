<template>
  <nav>
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app dark flat class="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <span class="hidden-sm-and-down">{{ app_title }}</span>
      </v-toolbar-title>
      <v-spacer />
      <slot name="toolbar" />
      <v-btn icon>
        <v-icon @click="exit_to_app">exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list v-for="item in items" :key="item.title">
        <v-list subheader dense>
          <v-subheader>{{ item.title }}</v-subheader>
          <v-list-item v-for="child in item.items" :key="child.title" router :to="child.route">
            <v-list-item-icon>
              <v-icon v-text="child.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="child.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import { SUCCESS } from "../plugins/constant";

export default {
  inheritAttrs: false,

  props: {
    items: { type: Array, required: true },
    exit_url: { type: String, required: true },
    title: { type: String },
    index: { type: String, default: "index" },
  },

  data() {
    return {
      drawer: true,
    };
  },

  computed: {
    app_title() {
      if (this.title) {
        return this.title;
      } else {
        return this.$t("app.title");
      }
    },
  },

  methods: {
    exit_to_app() {
      this.$axios_post(this.exit_url).then((result) => {
        if (result.code === SUCCESS) {
          this.$router.push({ name: this.index });
        }
      });
    },
  },
};
</script>
