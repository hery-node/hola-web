<template>
  <h-card v-bind="$attrs" :color="color" :title="title" :text="text">
    <h-table v-bind="$attrs" v-on="$listeners" :mobile-breakpoint="10" hide-default-footer>
      <template slot="headerCell" slot-scope="{ header }">
        <span class="font-weight-light text-warning text--darken-3" v-text="header.text" />
      </template>
    </h-table>
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
