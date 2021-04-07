<template>
  <h-table ref="table" :entity="entity" :headers="headers" :sort_desc="sort_desc" :sort_key="sort_key" :has_action_header="has_action_header" :item_actions="item_actions" v-bind="$attrs" v-on="$listeners">
    <template slot="toolbar" v-if="!$vuetify.breakpoint.xsOnly">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-show="oper.create" icon @click="show_create_dialog" v-on="on"><v-icon color="create">mdi-plus-circle</v-icon></v-btn>
        </template>
        <span>{{ create_title }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-show="oper.delete" icon @click="batch_delete" v-on="on"><v-icon color="delete">mdi-delete-circle</v-icon></v-btn>
        </template>
        <span>{{ batch_delete_title }}</span>
      </v-tooltip>
      <slot name="toolbar" />

      <v-dialog v-show="oper.edit" v-model="dialog" :max-width="dialog_width">
        <h-form v-model="form" :entity="entity" :edit_mode="edit_mode" v-bind="$attrs" @cancelled="close_dialog" @saved="entity_saved"> </h-form>
      </v-dialog>
    </template>
  </h-table>
</template>

<script>
import { SUCCESS } from "../plugins/constant";

export default {
  inheritAttrs: false,

  props: {
    //required attributes for data table and form
    entity: { type: String, required: true },
    headers: { type: Array, required: true },
    sort_desc: { type: Array, required: true },
    sort_key: { type: Array, required: true },
    //show delete name in batch delete dialog
    label_key: { type: String, required: true },
    //end
    //add more actions to item actions
    actions: { type: Array, default: () => [] },
    //dialog setting
    dialog_width: { type: String, default: "800px" },
  },

  data() {
    return {
      edit_mode: false,
      form: {},
      dialog: false,
      oper: {
        create: true,
        update: true,
        delete: true,
        import: true,
        export: true,
        edit: true,
      },
    };
  },

  computed: {
    has_action_header() {
      return this.oper.edit || this.oper.delete;
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
      if (this.oper.update) {
        array.push({ color: "edit", icon: "mdi-square-edit-outline", tooltip: this.edit_title, handle: this.edit_entity });
      }
      if (this.oper.delete) {
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
    edit_entity(item) {
      this.edit_mode = true;
      this.$read(this.entity, item).then((entity) => {
        this.form = entity;
        this.dialog = true;
      });
    },

    delete_entity(item) {
      this.delete_entities([item]);
    },

    batch_delete() {
      const table = this.$refs.table;
      if (table.selected.length == 0) {
        table.show_error(this.no_selected);
        return;
      }

      this.delete_entities(table.selected).then(() => {
        table.selected = [];
      });
    },

    confirm_delete(items) {
      const labels = items.map((item) => item[this.label_key]).join(",");
      const title = items.length > 1 ? this.batch_delete_title : this.delete_title;
      const options = { icon: "mdi-delete-circle", title: title, buttonTrueText: this.$t("table.confirm_yes"), buttonFalseText: this.$t("table.confirm_no") };
      const msg = this.$t("table.delete_confirm", { entity: labels });
      return this.$confirm(msg, options);
    },

    delete_entities(items) {
      console.log("items %j", items);
      const ids = items.map((item) => item["_id"]);
      return this.confirm_delete(items, ids).then((res) => {
        if (res) {
          this.$delete(this.entity, ids).then((result) => {
            const { code } = result;
            if (code == SUCCESS) {
              this.refresh();
            }
          });
        }
        return res;
      });
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
