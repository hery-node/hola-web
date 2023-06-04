<template>
  <h-card v-bind="$attrs" :color="color" :title="title" :text="text">
    <h-table v-bind="$attrs" v-on="$listeners" infinite hide-top :sort-key="sortKey" :sort-desc="sortDesc"> </h-table>
  </h-card>
</template>

<script>
import DataTable from "./DataTable";

export default {
  inheritAttrs: false,

  props: {
    ...DataTable.props,
    title: { type: String },
    text: { type: String },
    color: { type: String, default: "secondary" },
  },
};
</script>
