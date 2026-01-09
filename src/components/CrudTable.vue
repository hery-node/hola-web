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
/**
 * CrudTable Component
 *
 * A comprehensive CRUD (Create, Read, Update, Delete) table component that wraps DataTable
 * with full entity management capabilities including batch operations, inline editing,
 * and customizable actions.
 *
 * Features:
 * - Create/Update/Clone/Delete operations
 * - Batch selection and deletion
 * - Inline item actions with tooltips
 * - Keyboard shortcuts (Alt+C create, Alt+R refresh, Alt+B batch mode)
 * - Customizable toolbars and actions
 * - Entity mode configuration (b:batch, c:create, d:delete, o:clone, p:page, r:refresh, s:search, u:update)
 * - Chip field editing with separate forms
 */
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

  /**
   * Initialize component
   * Fetches entity mode from server if not provided via props
   */
  async created() {
    if (this.mode) {
      this.entity_mode = this.mode;
    } else {
      const server_mode = await get_entity_mode(this.entity);
      if (server_mode?.trim().length > 0) {
        this.entity_mode = server_mode;
      }
    }

    this.show_toolbars();
  },

  computed: {
    /** @returns {boolean} True if batch mode is enabled in entity mode */
    is_batchable() {
      return this.entity_mode.includes("b");
    },

    /** @returns {boolean} True if create operation is enabled */
    is_creatable() {
      return this.entity_mode.includes("c");
    },

    /** @returns {boolean} True if delete operation is enabled */
    is_deletable() {
      return this.entity_mode.includes("d");
    },

    /** @returns {boolean} True if clone operation is enabled */
    is_cloneable() {
      return this.entity_mode.includes("o");
    },

    /** @returns {boolean} True if pagination is enabled */
    is_paginable() {
      return this.entity_mode.includes("p");
    },

    /** @returns {boolean} True if refresh operation is enabled */
    is_refreshable() {
      return this.entity_mode.includes("r");
    },

    /** @returns {boolean} True if search is enabled */
    is_searchable() {
      return this.entity_mode.includes("s");
    },

    /** @returns {boolean} True if update operation is enabled */
    is_updatable() {
      return this.entity_mode.includes("u");
    },

    /** @returns {string} Localized entity label */
    entity_label() {
      return this.entityLabel ?? (this.entity?.trim().length > 0 ? this.$t(`${this.entity}._label`) : "");
    },

    /** @returns {string} No selection message */
    no_selected() {
      return this.noSelectLabel ?? this.$t("table.no_selected", { entity: this.entity_label });
    },

    /** @returns {string} Create dialog title */
    create_title() {
      return this.createLabel ?? this.$t("table.create_title", { entity: this.entity_label });
    },

    /** @returns {string} Refresh action tooltip */
    refresh_title() {
      return this.refreshLabel ?? this.$t("table.refresh_title", { entity: this.entity_label });
    },

    /** @returns {string} Update dialog title */
    update_title() {
      return this.updateLabel ?? this.$t("table.update_title", { entity: this.entity_label });
    },

    /** @returns {string} Clone dialog title */
    clone_title() {
      return this.cloneLabel ?? this.$t("table.clone_title", { entity: this.entity_label });
    },

    /** @returns {string} Delete confirmation title */
    delete_title() {
      return this.deleteLabel ?? this.$t("table.delete_title", { entity: this.entity_label });
    },

    /** @returns {string} Batch delete confirmation title */
    batch_delete_title() {
      return this.batchDeleteLabel ?? this.$t("table.batch_delete_title", { entity: this.entity_label });
    },

    /**
     * Generate item action buttons (update, clone, delete)
     * @returns {Array|null} Array of action objects or null if no actions
     */
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
      return array.length > 0 ? array : null;
    },
  },

  methods: {
    /**
     * Build toolbar buttons based on current mode (single/batch) and entity capabilities
     */
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
      this.has_action_header = !!this.item_actions;
    },

    /**
     * Handle ESC key - exits batch mode if active
     */
    press_esc() {
      this.batch_mode === true && this.switch_to_single();
    },

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     * Alt+C: Create, Alt+R: Refresh, Alt+B: Toggle batch mode
     */
    press_key(event) {
      if (this.is_creatable) {
        if (event.key === "c" && event.altKey === true) {
          this.show_create_dialog();
        }
      }

      if (this.is_refreshable) {
        if (event.key === "r" && event.altKey === true) {
          this.refresh();
        }
      }

      if (event.key === "b" && event.altKey === true) {
        this.batch_mode === false && this.switch_to_batch();
      }
    },

    /** Switch table to batch selection mode */
    switch_to_batch() {
      this.batch_mode = true;
      this.show_toolbars();
    },

    /** Switch table to single item mode */
    switch_to_single() {
      this.batch_mode = false;
      this.show_toolbars();
    },

    /**
     * Delete a single entity
     * @param {Object} item - Entity item to delete
     */
    delete_entity(item) {
      this.delete_entities([item]);
    },

    /**
     * Get selected items from table
     * @returns {Array|null} Selected items or null if none selected
     */
    get_selected_items() {
      const table = this.$refs.table;
      if (table.selected.length === 0) {
        table.show_error(this.no_selected);
        return null;
      }
      return table.selected;
    },

    /**
     * Show error message in table
     * @param {string} msg - Error message
     */
    show_error(msg) {
      this.$refs.table.show_error(msg);
    },

    /**
     * Show success message in table
     * @param {string} msg - Success message
     */
    show_success(msg) {
      this.$refs.table.show_success(msg);
    },

    /**
     * Show info message in table
     * @param {string} msg - Info message
     */
    show_info(msg) {
      this.$refs.table.show_info(msg);
    },

    /**
     * Show warning message in table
     * @param {string} msg - Warning message
     */
    show_warning(msg) {
      this.$refs.table.show_warning(msg);
    },

    /** Clear all selected items */
    reset_selected() {
      this.$refs.table.selected = [];
    },

    /**
     * Delete all selected entities in batch mode
     */
    async batch_delete() {
      const selected = this.get_selected_items();
      if (selected !== null) {
        await this.delete_entities(selected);
      }
    },

    /**
     * Show delete confirmation dialog
     * @param {Array} items - Items to delete
     * @returns {Promise<boolean>} User confirmation result
     */
    confirm_delete(items) {
      const labels = items.map((item) => item[this.itemLabelKey]).join(",");
      const title = items.length > 1 ? this.batch_delete_title : this.delete_title;
      const msg = this.$t("table.delete_confirm", { entity: labels });
      return this.show_confirm(title, msg);
    },

    /**
     * Show generic confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} msg - Dialog message
     * @returns {Promise<boolean>} User confirmation result
     */
    show_confirm(title, msg) {
      return this.$refs.confirm.open(title, msg);
    },

    /**
     * Delete entities after user confirmation
     * @param {Array} items - Items to delete
     */
    async delete_entities(items) {
      const ids = items.map((item) => item._id);
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

    /** Refresh table data */
    refresh() {
      this.$refs.table.refresh();
    },

    /**
     * Set table data directly
     * @param {Array} items - Items to display
     */
    set_data(items) {
      this.$refs.table.set_data(items);
    },

    /** Open create entity dialog */
    show_create_dialog() {
      this.edit_entity_id = null;
    },

    /**
     * Open update entity dialog
     * @param {Object} item - Entity item to update
     */
    update_entity(item) {
      this.clone_mode = false;
      this.edit_entity_id = item._id;
    },

    /**
     * Open clone entity dialog
     * @param {Object} item - Entity item to clone
     */
    clone_entity(item) {
      this.clone_mode = true;
      this.edit_entity_id = item._id;
    },

    /**
     * Handle chip click to edit referenced entity
     * @param {Object} chip - Chip data with ref and id
     */
    click_chip(chip) {
      if (chip?.ref) {
        this.chip_entity = chip.ref;
        this.chip_entity_id = chip.id;
        if (this.chipFieldsMap) {
          this.chip_edit_fields = this.chipFieldsMap[chip.ref];
        }
      }
    },

    /** Handle main form cancel */
    after_cancel() {
      this.edit_entity_id = "";
    },

    /** Handle chip form cancel */
    after_cancel_chip() {
      this.chip_entity_id = "";
    },

    /** Handle main form success - refresh table */
    after_close() {
      this.edit_entity_id = "";
      this.refresh();
    },

    /** Handle chip form success - refresh table */
    after_close_chip() {
      this.chip_entity_id = "";
      this.refresh();
    },
  },
};
</script>
