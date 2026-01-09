<template>
  <div id="nav">
    <v-bottom-navigation color="primary" absolute grow>
      <v-btn :to="menu.route" v-for="menu in menus" v-bind:key="menu.title">
        <span>{{ menu.title }}</span>
        <v-icon>{{ menu.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
/**
 * Mobile menu component
 * Provides bottom navigation for mobile devices
 */
export default {
  inheritAttrs: false,

  props: {
    menus: { type: Array, required: true },
  },
};
</script>

<style scoped lang="css">
#nav {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 1000;
}
</style>
