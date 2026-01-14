<template>
  <div id="nav">
    <v-bottom-navigation color="primary" grow>
      <v-btn v-for="menu in menus" :key="menu.title" :to="menu.route">
        <span>{{ menu.title }}</span>
        <v-icon>{{ menu.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
/**
 * MobileMenu - Bottom navigation for mobile devices
 */

/** Menu item structure */
interface MenuItem {
  title: string;
  icon?: string;
  route?: string;
}

// Props
defineProps<{
  menus: MenuItem[];
}>();
</script>

<style scoped>
#nav {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 1000;
}
</style>
