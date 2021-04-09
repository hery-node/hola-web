<template>
  <h-table v-bind="$attrs" v-on="$listeners" ref="table" :entity="entity" :fields="tableFields" :search-fields="searchFields" :sort-desc="sortDesc" :sort-key="sortKey" :show-select="is_deletable" :has-action-header="has_action_header" :item-actions="item_actions">
    <template slot="toolbar" v-if="!$vuetify.breakpoint.xsOnly">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-show="is_creatable" icon @click="show_create_dialog" v-on="on"><v-icon color="create">mdi-plus-circle</v-icon></v-btn>
        </template>
        <span>{{ create_title }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-show="is_deletable" icon @click="batch_delete" v-on="on"><v-icon color="delete">mdi-delete-circle</v-icon></v-btn>
        </template>
        <span>{{ batch_delete_title }}</span>
      </v-tooltip>
      <slot name="toolbar" />

      <v-dialog v-if="oper.edit" v-model="dialog" :max-width="dialog_width">
        <div style="overflow-x: hidden;">
          <h-form v-bind="$attrs" v-model="form" hide-hint :entity="entity" :fields="formFields" :edit-mode="edit_mode" @cancelled="close_dialog" @saved="entity_saved"> </h-form>
        </div>
      </v-dialog>
    </template>
  </h-table>
</template>

<script>
import { read_entity, save_entity, delete_entities, is_success_reponse, is_been_referred } from "../core/axios";

export default {
  inheritAttrs: false,

  props: {
    //required attributes for data table and form
    entity: { type: String, required: true },
    sortDesc: { type: Array, required: true },
    sortKey: { type: Array, required: true },
    //show delete name in batch delete dialog
    itemLabelKey: { type: String, required: true },
    //end
    //c stands for create, r: read, u:update,d:delete, i:import ,e:export
    mode: { type: String, default: "crudie" },
    //add more actions to item actions
    actions: { type: Array, default: () => [] },
    //dialog setting
    dialogWidth: { type: String, default: "800px" },
    searchFields: { type: Array, default: () => [] },
    formFields: { type: Array, default: () => [] },
    tableFields: { type: Array, default: () => [] },
  },

  data() {
    return {
      edit_mode: false,
      form: {},
      dialog: false,
    };
  },

  computed: {
    is_creatable() {
      return this.mode.includes("c");
    },

    is_updatable() {
      return this.mode.includes("u");
    },

    is_deletable() {
      return this.mode.includes("d");
    },

    has_action_header() {
      return this.is_updatable || this.is_deletable;
    },

    entity_label() {
      return this.$t(this.entity + "._label");
    },

    no_selected() {
      return this.$t("table.no_selected");
    },

    create_title() {
      return this.$t("table.create_title", { entity: this.entity_label });
    },

    edit_title() {
      return this.$t("table.update_title", { entity: this.entity_label });
    },

    delete_title() {
      return this.$t("table.delete_title", { entity: this.entity_label });
    },

    batch_delete_title() {
      return this.$t("table.batch_delete_title", { entity: this.entity_label });
    },

    //actions for item operation
    item_actions() {
      const array = [];
      if (this.is_updatable) {
        array.push({ color: "edit", icon: "mdi-square-edit-outline", tooltip: this.edit_title, handle: this.edit_entity });
      }
      if (this.is_deletable) {
        array.push({ color: "delete", icon: "mdi-delete-circle", tooltip: this.delete_title, handle: this.delete_entity });
      }
      array.push(...this.actions);
      if (array.length > 0) {
        return array;
      } else {
        return undefined;
      }
    },
  },

  methods: {
    async edit_entity(item) {
      this.edit_mode = true;
      const entity_obj = await read_entity(this.entity, item);
      this.form = entity_obj;
      this.dialog = true;
    },

    delete_entity(item) {
      this.delete_entities([item]);
    },

    async batch_delete() {
      const table = this.$refs.table;
      if (table.selected.length == 0) {
        table.show_error(this.no_selected);
        return;
      }

      await this.delete_entities(table.selected);
      table.selected = [];
    },

    confirm_delete(items) {
      const labels = items.map((item) => item[this.label_key]).join(",");
      const title = items.length > 1 ? this.batch_delete_title : this.delete_title;
      const options = { icon: "mdi-delete-circle", title: title, buttonTrueText: this.$t("table.confirm_yes"), buttonFalseText: this.$t("table.confirm_no") };
      const msg = this.$t("table.delete_confirm", { entity: labels });
      return this.$confirm(msg, options);
    },

    async delete_entities(items) {
      const ids = items.map((item) => item["_id"]);
      const res = await this.confirm_delete(items, ids);

      if (res) {
        const { code, err } = await delete_entities(this.entity, ids);
        if (is_success_reponse(code)) {
          this.refresh();
        } else if (is_been_referred(code)) {
          const labels = items
            .filter((item) => err.includes(item._id + ""))
            .map((item) => item[this.label_key])
            .join(",");
          const msg = this.$t("table.has_ref", { entity: labels });
          this.$refs.table.show_error(msg);
        }
      }
    },

    refresh() {
      this.$refs.table.refresh();
    },

    show_create_dialog() {
      this.dialog = true;
      this.edit_mode = false;
      this.form = {};
    },

    close_dialog() {
      this.dialog = false;
    },

    entity_saved() {
      this.dialog = false;
      this.refresh();
    },
  },
};
</script>
