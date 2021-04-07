<template>
  <m-table ref="table" :entity="entity" :headers="headers" :sort_desc="sort_desc" :sort_key="sort_key" :item_actions="item_actions" v-bind="$attrs" v-on="$listeners">
    <template slot="toolbar" v-if="!$vuetify.breakpoint.xsOnly">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-if="addable" icon @click="show_form" v-on="on"><v-icon color="edit">mdi-plus-circle</v-icon></v-btn>
        </template>
        <span>{{ add_title }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-if="deleteable" icon @click="remove_selected" v-on="on"><v-icon color="delete">mdi-delete-circle</v-icon></v-btn>
        </template>
        <span>{{ remove_title }}</span>
      </v-tooltip>
      <slot name="toolbar" />

      <v-dialog v-if="addable || updatable" v-model="dialog" :max-width="add_width">
        <m-form ref="form" :entity="entity" v-bind="$attrs" @cancelled="close" @saved="form_saved"> </m-form>
      </v-dialog>
    </template>
  </m-table>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    //required attributes for data table and form
    entity: { type: String, required: true },
    headers: { type: Array, required: true },
    sort_desc: { type: Array, required: true },
    sort_key: { type: Array, required: true },
    //end
    //add more actions to item actions
    actions: { type: Array, default: () => [] },
  },

  data() {
    return {
      form: {},
      dialog: false,
      import_dialog: false,
      file: null,
      file_rules: [(v) => !!v || this.$t("common.required")],
    };
  },

  computed: {
    entity_label() {
      return this.$t(this.entity + "._label");
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
      if (this.updatable) {
        array.push({ color: "edit", icon: "mdi-square-edit-outline", tooltip: this.edit_title, handle: this.edit });
      }
      if (this.deleteable) {
        array.push({ color: "delete", icon: "mdi-delete-circle", tooltip: this.delete_title, handle: this.remove });
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
    remove_items(items, callback) {
      const keys = items.map((item) => item[this.item_key]).join(",");
      const ids = items.map((item) => item["_id"]).join(",");
      const title = this.delete_title;
      const msg = this.$t("common.delete_confirm", { obj: keys });
      const url = this.action + "/delete";
      const query = { ids: ids };

      this.$confirm(msg, { icon: "mdi-delete-circle", title: title, buttonTrueText: this.$t("common.yes"), buttonFalseText: this.$t("common.no") }).then((res) => {
        if (res) {
          this.$post(url, query, this.$refs.table.show_error).then((result) => {
            if (result.code === 0) {
              if (result.has_ref === true) {
                const obj = result.ref_array.map((ref) => this.$t(`${ref}.label`)).join(",");
                const msg = this.$t("common.delete_ref", { obj: obj });
                this.$refs.table.show_alter("error", msg, false);
              }

              this.refresh();
              if (callback) {
                callback();
              }
            }
          });
        }
      });
    },

    edit(item) {
      this.dialog = true;
      const that = this;
      this.$get(this.action + "/load", { id: item._id }, this.$refs.table.show_error).then((result) => {
        if (result.code === 0) {
          this.form = result.data;
          setTimeout(function() {
            const form = that.$refs.add_form;
            if (form) {
              form.set_form(result.data);
            }
          }, 500);
        }
      });
    },

    remove(item) {
      this.remove_items([item]);
    },

    remove_selected() {
      if (this.$refs.table.selected.length == 0) {
        this.$refs.table.show_alter("warning", this.no_select, true);
        return;
      }

      const that = this;
      this.remove_items(this.$refs.table.selected, function() {
        that.$refs.table.selected = [];
      });
    },

    refresh() {
      this.$refs.table.load_data();
    },

    show_form() {
      this.dialog = true;
      const that = this;
      setTimeout(function() {
        const form = that.$refs.add_form;
        if (form) {
          form.show_form();
        }
      }, 500);
    },

    close() {
      this.dialog = false;
    },

    form_saved() {
      this.close();
      this.refresh();
    },

    show_import() {
      this.import_dialog = true;
    },

    close_import() {
      this.import_dialog = false;
      this.file = null;
      this.$refs.import_form.reset();
    },

    export_to_excel() {
      const { sortBy, sortDesc } = this.$refs.table.options;
      const sort_by = sortBy && sortBy.length > 0 ? sortBy.join(",") : this.item_key;
      const desc = sortDesc && sortDesc.length > 0 ? sortDesc.join(",") : "false";

      const ids = this.$refs.table.selected.length > 0 ? this.$refs.table.selected.map((item) => item["_id"]).join(",") : "";
      const url = this.action + "/export";
      this.$download(url, this.label + ".xlsx", { ids: ids, sort_by: sort_by, desc: desc, search: this.$refs.table.search }, this.$refs.table.show_error);
    },

    import_excel() {
      if (!this.$refs.import_form.validate()) {
        return;
      }

      const url = this.action + "/import";
      this.$upload(url, this.file, this.$refs.table.show_error).then((result) => {
        if (result.code === 0) {
          this.file = null;
          this.$refs.import_form.reset();
          this.import_dialog = false;
          const errors = result.errors;
          if (errors.length == 0) {
            const msg = this.$t("common.upload_success", { success: result.success, obj: this.label });
            this.$refs.table.show_alter("info", msg, false);
          } else {
            const error_msg = [];
            errors.forEach((error) => {
              if (error.code === IMPORT_EMPTY_KEY) {
                error_msg.push(this.$t("common.wrong_line_empty_key", error));
              } else if (error.code === IMPORT_WRONG_FIELDS) {
                error_msg.push(this.$t("common.wrong_line_wrong_key", error));
              } else if (error.code === IMPORT_DUPLICATE_KEY) {
                error_msg.push(this.$t("common.wrong_line_duplicate_key", error));
              } else if (error.code === IMPORT_NO_FOUND_REF) {
                error_msg.push(this.$t("common.wrong_line_no_ref", error));
              }
            });
            const msg = this.$t("common.upload_wrong", { success: result.success, obj: this.label, error: "<br>" + error_msg.join("<br>") });
            this.$refs.table.show_alter("error", msg, false);
          }
          this.refresh();
        }
      });
    },
  },
};
</script>
