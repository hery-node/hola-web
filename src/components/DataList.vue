<template>
  <div>
    <span v-for="(item, index) in items" :key="index">
      <slot :item="item"></slot>
      <template v-if="item._last === true">
        <span v-intersect="infinite_scroll">...</span>
      </template>
    </span>
  </div>
</template>

<script>
import { is_success_response, list_entity } from "../core/axios";

export default {
  inheritAttrs: false,
  props: {
    //required attributes
    sortDesc: { type: Array, required: true },
    sortKey: { type: Array, required: true },
    attrs: { type: Array, required: true },
    //end
    //action to do list
    listAction: { type: String },
    //used to add filter conditions
    filter: { type: Object },
    interval: { type: Number, default: -1 },
    //this is to control the page size for infinite scroll mode
    itemPerPage: { type: Number, default: 30 },
  },

  data() {
    return {
      loading: false,
      total: 0,
      next_page: 1,
      items: [],
      options: {},
    };
  },

  async created() {
    this.load_data();
  },

  watch: {
    options: {
      handler() {
        this.reset_values();
        this.load_data();
      },
      deep: true,
    },

    filter: {
      handler() {
        this.reset_values();
        this.load_data();
      },
      deep: true,
    },
  },

  methods: {
    infinite_scroll(entries) {
      const intersection = entries[0].intersectionRatio > 0;

      if (this.items.length < this.total && intersection && !entries[0].target.page) {
        entries[0].target.page = this.next_page;
        setTimeout(() => {
          this.load_data();
        }, 500);
      }
    },

    reset_values() {
      this.next_page = 1;
    },

    refresh() {
      this.reset_values();
      this.load_data();
    },

    set_data(items) {
      this.items = items;
    },

    async load_data() {
      this.loading = true;
      const sort_by = this.sortKey.join(",");
      const desc = this.sortDesc.join(",");
      const attr_names = this.attrs.join(",");
      const params = { attr_names: attr_names, sort_by: sort_by, desc: desc };
      params.page = this.next_page;
      params.limit = this.itemPerPage;

      const query_obj = this.filter ? this.filter : {};
      const { code, total, data } = await list_entity(this.entity, query_obj, params, this.listAction);
      this.loading = false;
      if (is_success_response(code)) {
        this.total = total;
        if (data.length > 0) {
          data[data.length - 1]._last = true;
          if (this.next_page == 1) {
            this.items = data;
          } else {
            this.items.push(...data);
          }
          this.$emit("loaded", this.items);
          this.next_page++;
        }
      }
    },
  },
};
</script>
