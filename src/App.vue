<template>
  <v-app>
    <v-main>
      <h-nav-bar :title="title" :menus="menus"></h-nav-bar>
      <template>
        <div class="ma-5">
          <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
        </div>
      </template>
      <router-view :key="$route.fullPath" class="mt-3" @alert="show_alert"></router-view>
    </v-main>
  </v-app>
</template>

<script>
/**
 * App Component
 *
 * Root application component for hola-web framework.
 * Provides global navigation, alert system, and router view.
 *
 * Features:
 * - Navigation bar with hierarchical menus
 * - Global alert notification system (success, info, warning, error)
 * - Router view with key-based refresh
 * - Responsive layout with Vuetify v-app
 */
export default {
  components: {},
  name: "App",

  data() {
    return {
      /** Alert state: { shown: boolean, type: string, msg: string } */
      alert: { shown: false, type: "info", msg: "" },

      /** Application title */
      title: "this is a test",

      /** Navigation menu structure */
      menus: [
        {
          title: "Dashboard Views",
          menus: [
            { icon: "mdi-space-station", title: "Dashboard", route: "/dashboard" },
            { icon: "mdi-bug-outline", title: "Application", route: "/application" },
          ],
        },
        {
          title: "System management",
          menus: [
            { icon: "mdi-space-station", title: "Charts", route: "/chart" },
            { icon: "mdi-bug-outline", title: "Bug list", route: "/log2" },
          ],
        },
      ],
    };
  },

  methods: {
    /**
     * Display global alert notification
     * @param {Object} msg_obj - Alert configuration
     * @param {string} msg_obj.type - Alert type: success, info, warning, error
     * @param {string} msg_obj.msg - Alert message (supports newlines)
     * @param {number} [msg_obj.delay] - Auto-hide delay in ms (default: 10000, 0 = no auto-hide)
     */
    show_alert(msg_obj) {
      const { type, msg, delay } = msg_obj;
      const time = delay ?? 10 * 1000;
      this.alert.shown = true;
      this.alert.type = type;
      this.alert.msg = msg ? msg.replace(/\n/g, "<br />") : "";
      delay || delay === 0 || setTimeout(() => (this.alert.shown = false), time);
    },
  },
};
</script>
