<script setup lang="ts">
/**
 * Root App Component
 *
 * Main entry point for the Hola Web component showcase.
 * Demonstrates all migrated Vue 3 + TypeScript + Vuetify 3 components.
 */
import ShowcaseDemo from "./views/ShowcaseDemo.vue";
</script>

<template>
  <ShowcaseDemo />
</template>

<style>
/* Global styles */
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
}

/* Fix for v-select/v-autocomplete dropdowns being clipped by parent overflow */
.v-overlay-container {
  z-index: 10000 !important;
}

.v-menu > .v-overlay__content {
  z-index: 10001 !important;
}
</style>
