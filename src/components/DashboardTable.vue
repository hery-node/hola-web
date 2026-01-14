<template>
  <h-card v-bind="$attrs" :color="color" :title="title" :text="text">
    <h-table v-bind="$attrs" infinite hide-top :sort-key="sortKey" :sort-desc="sortDesc"> </h-table>
  </h-card>
</template>

<script setup lang="ts">
/**
 * DashboardTable Component
 *
 * A wrapper component that displays a DataTable inside a colored card.
 * Used for dashboard widgets to show entity lists with consistent styling.
 *
 * Features:
 * - Inherits all DataTable functionality
 * - Infinite scroll enabled by default
 * - Card wrapper with customizable color and title
 * - Hide toolbar for compact display
 */

// Props
withDefaults(
  defineProps<{
    // DataTable required props
    entity: string;
    sortKey: string[];
    sortDesc: boolean[];
    // Card props
    title?: string;
    text?: string;
    color?: string;
  }>(),
  {
    color: "secondary",
  }
);
</script>
