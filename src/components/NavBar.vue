<template>
  <nav>
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app dark flat :color="barColor">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <span class="hidden-sm-and-down">{{ app_title }}</span>
      </v-toolbar-title>
      <v-spacer />
      <slot name="toolbar" />
    </v-app-bar>
    <v-navigation-drawer v-bind="$attrs" v-on="$listeners" v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list v-for="menu in menus" :key="menu.title">
        <v-list subheader dense>
          <v-subheader>{{ menu.title }}</v-subheader>
          <v-list-item v-for="child in menu.menus" :key="child.title" router :to="child.route">
            <v-list-item-icon>
              <v-icon>{{ child.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    title: { type: String },
    menus: { type: Array, required: true },
    barColor: { type: String, default: "teal" },
    drawerWidth: { type: Number, default: 300 },
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
};
</script>
