<template>
  <div>
    <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
    <v-toolbar flat dense :class="toolbarClass" dark v-if="!hideToolbar">
      <span class="ml-3" v-if="!hideTitle">{{ table_title }}</span>
      <span class="ml-3">{{ total_records_title }}</span>
      <v-spacer></v-spacer>
      <v-tooltip bottom v-for="(toolbar, index) in header_toolbars" v-bind:key="index">
        <template v-slot:activator="{ on }">
          <v-btn icon @click.stop="toolbar.click()" v-on="on" class="mr-3">
            <v-icon :color="toolbar.color">{{ toolbar.icon }}</v-icon> {{ toolbar.label ? toolbar.label : "" }}
          </v-btn>
        </template>
        <span>{{ toolbar.tooltip }}</span>
      </v-tooltip>
    </v-toolbar>
    <span v-for="(item, index) in items" :key="index">
      <slot :item="item"></slot>
      <template v-if="item._last === true">
        <span v-intersect="infinite_scroll">.</span>
      </template>
    </span>
    <template v-if="items.length == 0">
      <v-row class="fill-height" justify="center" align="center">
        <v-col class="text-center">
          <h3>{{ noDataText }}</h3>
        </v-col>
      </v-row>
    </template>
    <h-confirm ref="confirm" />
    <h-edit-form ref="form" v-bind="$attrs" dialog hide-hint :entity="entity" :fields="editFields" :entity-id="edit_entity_id" @cancel="after_cancel" @success="after_close" :create-title="create_title" :update-title="update_title" :create-form-view="createView" :update-form-view="updateView"> </h-edit-form>
  </div>
</template>

<script>
import Alert from "../mixins/alert";
import Keymap from "../mixins/keymap";

import { is_success_response, list_entity, delete_entity, is_been_referred } from "../core/axios";

export default {
  inheritAttrs: false,
  mixins: [Alert, Keymap],

  props: {
    //required attributes
    entity: { type: String, required: true },
    //show delete name in batch delete dialog
    itemLabelKey: { type: String, required: true },
    sortDesc: { type: Array, required: true },
    sortKey: { type: Array, required: true },
    attrs: { type: Array, required: true },
    //end
    entityLabel: { type: String },
    createLabel: { type: String },
    updateLabel: { type: String },
    deleteLabel: { type: String },
    noDataText: { type: String, default: "" },
    mode: { type: String, default: "" },
    //action to do list
    listAction: { type: String },
    //used to add filter conditions
    filter: { type: Object },
    //this is to control the page size for infinite scroll mode
    itemPerPage: { type: Number, default: 30 },
    hideToolbar: { type: Boolean, default: false },
    hideTitle: { type: Boolean, default: false },
    toolbarClass: { type: String, default: "app_bar subtitle-2" },
    title: { type: String },
    editFields: { type: Array, default: () => [] },
    //views used for create form
    createView: { type: String, default: "*" },
    //views used for update form
    updateView: { type: String, default: "*" },
    //add more toolbars for single mode
    toolbars: { type: Array, default: () => [] },
    createIcon: { type: String, default: "mdi-plus-circle" },
    refreshIcon: { type: String, default: "mdi-refresh" },
  },

  data() {
    return {
      loading: false,
      total: 0,
      next_page: 1,
      items: [],
      options: {},
      //used to pass id value to edit form
      edit_entity_id: "",
    };
  },

  async created() {
    this.show_toolbars();
    this.load_data();
  },

  computed: {
    entity_label() {
      return this.entityLabel ? this.entityLabel : this.entity && this.entity.trim().length > 0 ? this.$t(this.entity + "._label") : "";
    },

    create_title() {
      return this.createLabel ? this.createLabel : this.$t("table.create_title", { entity: this.entity_label });
    },

    update_title() {
      return this.updateLabel ? this.updateLabel : this.$t("table.update_title", { entity: this.entity_label });
    },

    delete_title() {
      return this.deleteLabel ? this.deleteLabel : this.$t("table.delete_title", { entity: this.entity_label });
    },

    is_creatable() {
      return this.mode.includes("c");
    },

    is_refreshable() {
      return this.mode.includes("r");
    },

    table_title() {
      if (this.hideTableTitle) {
        return "";
      }
      if (this.title) {
        return this.title;
      }
      return this.$t("table.title", { entity: this.entity_label });
    },

    total_records_title() {
      return this.$t("table.total_record", { total: this.total });
    },
  },

  watch: {
    options: {
      handler() {
        this.reset_values();
        this.load_data();
      },
      deep: true,
    },

    toolbars: {
      handler() {
        this.show_toolbars();
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
    show_toolbars() {
      const header_toolbars = [];
      this.is_creatable && header_toolbars.push({ color: "toolbar_icon", icon: this.createIcon, tooltip: this.create_title, click: this.show_create_dialog });
      this.is_refreshable && header_toolbars.push({ color: "toolbar_icon", icon: this.refreshIcon, tooltip: this.refresh_title, click: this.refresh });
      header_toolbars.push(...this.toolbars);
      this.header_toolbars = header_toolbars;
    },

    show_create_dialog() {
      this.edit_entity_id = null;
    },

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

    after_cancel() {
      this.edit_entity_id = "";
    },

    after_close() {
      this.edit_entity_id = "";
      this.refresh();
    },

    press_key(event) {
      if (this.is_creatable) {
        if (event.key == "c" && event.altKey == true) {
          this.show_create_dialog();
        }
      }

      if (this.is_refreshable) {
        if (event.key == "r" && event.altKey == true) {
          this.refresh();
        }
      }
    },

    confirm_delete(items) {
      const labels = items.map((item) => item[this.itemLabelKey]).join(",");
      const title = this.delete_title;
      const msg = this.$t("table.delete_confirm", { entity: labels });
      return this.show_confirm(title, msg);
    },

    show_confirm(title, msg) {
      return this.$refs.confirm.open(title, msg);
    },

    async delete_entities(items) {
      const ids = items.map((item) => item["_id"]);
      const res = await this.confirm_delete(items);

      if (res) {
        const { code, err } = await delete_entity(this.entity, ids);
        if (is_success_response(code)) {
          this.refresh();
        } else if (is_been_referred(code)) {
          const labels = err ? err.join(",") : "";
          const msg = this.$t("table.has_ref", { entity: labels });
          this.show_error(msg);
        } else if (err) {
          this.show_error(err);
        }
      }
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
