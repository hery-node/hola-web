<template>
  <h-table v-bind="$attrs" v-on="$listeners" ref="table" :entity="entity" :entity-label="entity_label" :headers="headers" :searchable="is_searchable" :infinite="!is_paginable" :search-fields="searchFields" :sort-desc="sortDesc" :sort-key="sortKey" :show-select="batch_mode" :has-action-header="has_action_header" :item-actions="item_actions" @chip="click_chip">
    <template slot="toolbar" v-if="!$vuetify.breakpoint.xsOnly">
      <v-tooltip bottom v-for="(toolbar, index) in header_toolbars" v-bind:key="index">
        <template v-slot:activator="{ on }">
          <v-btn icon @click.stop="toolbar.click()" v-on="on">
            <v-icon :color="toolbar.color">{{ toolbar.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ toolbar.tooltip }}</span>
      </v-tooltip>
      <h-confirm ref="confirm" />
      <h-edit-form ref="form" v-bind="$attrs" dialog :clone="clone_mode" hide-hint :entity="entity" :fields="editFields" :entity-id="edit_entity_id" @cancel="after_cancel" @success="after_close" :create-title="create_title" :update-title="update_title" :clone-title="clone_title" :create-form-view="createView" :update-form-view="updateView"> </h-edit-form>
      <h-edit-form ref="form_chip" v-bind="$attrs" dialog hide-hint :entity="chip_entity" :entity-id="chip_entity_id" :fields="chip_edit_fields" merge-with-server @cancel="after_cancel_chip" @success="after_close_chip" :update-form-view="chipView"> </h-edit-form>
    </template>
  </h-table>
</template>

<script>
import { delete_entity, is_success_response, is_been_referred, get_entity_mode } from "../core/axios";
import Keymap from "../mixins/keymap";

export default {
  inheritAttrs: false,
  mixins: [Keymap],

  props: {
    //required attributes for data table and form
    entity: { type: String, required: true },
    sortDesc: { type: Array, required: true },
    sortKey: { type: Array, required: true },
    //show delete name in batch delete dialog
    itemLabelKey: { type: String, required: true },
    //end
    //b:batch mode, c:create, d:delete, e:export, i:import, o:clone, p:page, r: refresh, s:search, u:update
    mode: { type: String },
    //views used for create form
    createView: { type: String, default: "*" },
    //views used for update form
    updateView: { type: String, default: "*" },
    chipView: { type: String, default: "*" },
    //add more actions to item actions
    actions: { type: Array, default: () => [] },
    //add more toolbars for single mode
    toolbars: { type: Array, default: () => [] },
    //add more toolbars for batch mode
    batchToolbars: { type: Array, default: () => [] },

    searchFields: { type: Array, default: () => [] },
    editFields: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    chipFieldsMap: { type: Object },

    //title related setting
    noSelectLabel: { type: String },
    entityLabel: { type: String },
    createLabel: { type: String },
    refreshLabel: { type: String },
    updateLabel: { type: String },
    cloneLabel: { type: String },
    deleteLabel: { type: String },
    batchDeleteLabel: { type: String },
    createIcon: { type: String, default: "mdi-plus-circle" },
    refreshIcon: { type: String, default: "mdi-refresh" },
    updateIcon: { type: String, default: "mdi-square-edit-outline" },
    cloneIcon: { type: String, default: "mdi-content-copy" },
    deleteIcon: { type: String, default: "mdi-delete-circle" },
    onlyBatchDelete: { type: Boolean, default: false },
    myActionFirst: { type: Boolean, default: false },
  },

  data() {
    return {
      //batch mode, this is used to control the crud table batch mode
      batch_mode: false,
      entity_mode: "",
      //used to pass id value to edit form
      edit_entity_id: "",
      chip_entity: "",
      chip_entity_id: "",
      chip_edit_fields: [],
      clone_mode: false,
      has_action_header: false,
      header_toolbars: [],
    };
  },

  async created() {
    if (this.mode) {
      this.entity_mode = this.mode;
    } else {
      const server_mode = await get_entity_mode(this.entity);
      if (server_mode && server_mode.trim().length > 0) {
        this.entity_mode = server_mode;
      }
    }

    this.show_toolbars();
  },

  computed: {
    is_batchable() {
      return this.entity_mode.includes("b");
    },

    is_creatable() {
      return this.entity_mode.includes("c");
    },

    is_deletable() {
      return this.entity_mode.includes("d");
    },

    is_cloneable() {
      return this.entity_mode.includes("o");
    },

    is_paginable() {
      return this.entity_mode.includes("p");
    },

    is_refreshable() {
      return this.entity_mode.includes("r");
    },

    is_searchable() {
      return this.entity_mode.includes("s");
    },

    is_updatable() {
      return this.entity_mode.includes("u");
    },

    entity_label() {
      return this.entityLabel ? this.entityLabel : (this.entity && this.entity.trim().length > 0 ? this.$t(this.entity + "._label") : "");
    },

    no_selected() {
      return this.noSelectLabel ? this.noSelectLabel : this.$t("table.no_selected", { entity: this.entity_label });
    },

    create_title() {
      return this.createLabel ? this.createLabel : this.$t("table.create_title", { entity: this.entity_label });
    },

    refresh_title() {
      return this.refreshLabel ? this.refreshLabel : this.$t("table.refresh_title", { entity: this.entity_label });
    },

    update_title() {
      return this.updateLabel ? this.updateLabel : this.$t("table.update_title", { entity: this.entity_label });
    },

    clone_title() {
      return this.cloneLabel ? this.cloneLabel : this.$t("table.clone_title", { entity: this.entity_label });
    },

    delete_title() {
      return this.deleteLabel ? this.deleteLabel : this.$t("table.delete_title", { entity: this.entity_label });
    },

    batch_delete_title() {
      return this.batchDeleteLabel ? this.batchDeleteLabel : this.$t("table.batch_delete_title", { entity: this.entity_label });
    },

    //actions for item operation
    item_actions() {
      const array = [];
      this.myActionFirst && array.push(...this.actions);
      if (this.is_updatable) {
        array.push({ color: "edit", icon: this.updateIcon, tooltip: this.update_title, handle: this.update_entity });
      }
      if (this.is_cloneable) {
        array.push({ color: "clone", icon: this.cloneIcon, tooltip: this.clone_title, handle: this.clone_entity });
      }
      if (this.is_deletable && !this.onlyBatchDelete) {
        array.push({ color: "delete", icon: this.deleteIcon, tooltip: this.delete_title, handle: this.delete_entity });
      }
      !this.myActionFirst && array.push(...this.actions);
      if (array.length > 0) {
        return array;
      } else {
        return null;
      }
    },
  },

  methods: {
    show_toolbars() {
      const header_toolbars = [];
      !this.batch_mode && this.is_creatable && header_toolbars.push({ color: "toolbar_icon", icon: this.createIcon, tooltip: this.create_title, click: this.show_create_dialog });
      !this.batch_mode && this.is_refreshable && header_toolbars.push({ color: "toolbar_icon", icon: this.refreshIcon, tooltip: this.refresh_title, click: this.refresh });
      this.batch_mode && this.is_deletable && header_toolbars.push({ color: "toolbar_icon", icon: this.deleteIcon, tooltip: this.batch_delete_title, click: this.batch_delete });
      !this.batch_mode && header_toolbars.push(...this.toolbars);
      this.batch_mode && header_toolbars.push(...this.batchToolbars);
      !this.batch_mode && this.is_batchable && header_toolbars.push({ color: "toolbar_icon", icon: "mdi-checkbox-multiple-marked", tooltip: this.$t("table.switch_to_batch"), click: this.switch_to_batch });
      this.batch_mode && this.is_batchable && header_toolbars.push({ color: "toolbar_icon", icon: "mdi-close-circle-multiple", tooltip: this.$t("table.switch_to_single"), click: this.switch_to_single });
      this.header_toolbars = header_toolbars;
      this.has_action_header = this.item_actions ? true : false;
    },

    press_esc() {
      this.batch_mode == true && this.switch_to_single();
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

      if (event.key == "b" && event.altKey == true) {
        this.batch_mode == false && this.switch_to_batch();
      }
    },

    switch_to_batch() {
      this.batch_mode = true;
      this.show_toolbars();
    },

    switch_to_single() {
      this.batch_mode = false;
      this.show_toolbars();
    },

    delete_entity(item) {
      this.delete_entities([item]);
    },

    get_selected_items() {
      const table = this.$refs.table;
      if (table.selected.length == 0) {
        table.show_error(this.no_selected);
        return null;
      } else {
        return table.selected;
      }
    },

    show_error(msg) {
      const table = this.$refs.table;
      table.show_error(msg);
    },

    show_success(msg) {
      const table = this.$refs.table;
      table.show_success(msg);
    },

    show_info(msg) {
      const table = this.$refs.table;
      table.show_info(msg);
    },

    show_warning(msg) {
      const table = this.$refs.table;
      table.show_warning(msg);
    },

    reset_selected() {
      const table = this.$refs.table;
      table.selected = [];
    },

    async batch_delete() {
      const selected = this.get_selected_items();
      if (selected != null) {
        await this.delete_entities(selected);
      }
    },

    confirm_delete(items) {
      const labels = items.map((item) => item[this.itemLabelKey]).join(",");
      const title = items.length > 1 ? this.batch_delete_title : this.delete_title;
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
          this.reset_selected();
        } else if (is_been_referred(code)) {
          const labels = err ? err.join(",") : "";
          const msg = this.$t("table.has_ref", { entity: labels });
          this.$refs.table.show_error(msg);
        } else if (err) {
          this.$refs.table.show_error(err);
        }
      }
    },

    refresh() {
      this.$refs.table.refresh();
    },

    set_data(items) {
      this.$refs.table.set_data(items);
    },

    show_create_dialog() {
      this.edit_entity_id = null;
    },

    update_entity(item) {
      this.clone_mode = false;
      this.edit_entity_id = item["_id"];
    },

    clone_entity(item) {
      this.clone_mode = true;
      this.edit_entity_id = item["_id"];
    },

    click_chip(chip) {
      if (chip && chip.ref) {
        this.chip_entity = chip.ref;
        this.chip_entity_id = chip.id;
        if (this.chipFieldsMap) {
          this.chip_edit_fields = this.chipFieldsMap[chip.ref];
        }
      }
    },

    after_cancel() {
      this.edit_entity_id = "";
    },

    after_cancel_chip() {
      this.chip_entity_id = "";
    },

    after_close() {
      this.edit_entity_id = "";
      this.refresh();
    },

    after_close_chip() {
      this.chip_entity_id = "";
      this.refresh();
    },
  },
};
</script>
