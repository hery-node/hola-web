<template>
  <h-card v-bind="$attrs" :color="color" :title="title" :text="text">
    <h-table v-bind="$attrs" v-on="$listeners" infinite hide-top :sort-key="sortKey" :sort-desc="sortDesc"> </h-table>
  </h-card>
</template>

<script>
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
import DataTable from "./DataTable";

export default {
  inheritAttrs: false,

  props: {
    ...DataTable.props,
    /** Card title text */
    title: { type: String },
    /** Card subtitle text */
    text: { type: String },
    /** Card color theme */
    color: { type: String, default: "secondary" },
  },
};
</script>
