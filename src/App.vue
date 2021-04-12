<template>
  <v-app>
    <v-main>
      <h-nav-bar :items="menus" exit_url="/logout"></h-nav-bar>
    </v-main>
  </v-app>
</template>

<script>
export default {
  components: {},
  name: "App",
  data() {
    return {
      menus: [
        {
          title: this.$t("app.cloud_management"),
          icon: "mdi-apps",
          items: [
            { icon: "mdi-apps", title: this.$t("app.host_management"), route: "/host" },
            { icon: "mdi-tag-outline", title: this.$t("app.workload_management"), route: "/workload" },
          ],
        },
        {
          title: this.$t("app.system_management"),
          icon: "mdi-apps",
          items: [
            { icon: "mdi-account-key", title: this.$t("app.user_management"), route: "/user" },
            { icon: "mdi-alert-box", title: this.$t("app.system_log"), route: "/log" },
          ],
        },
      ],
    };
  },
};
</script>
