<template>
  <v-toolbar dense>
    <v-toolbar-title v-if="selected_count > 0"> {{ selected_count }} {{ $t("selected") }} </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-menu v-if="selected_count > 0" offset-y>
      <template #activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">
          <v-icon left>mdi-lightning-bolt</v-icon>
          {{ $t("bulk_actions") }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item @click="update_dialog = true">
          <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
          <v-list-item-title>{{ $t("update_fields") }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="confirmDelete">
          <v-list-item-icon><v-icon color="error">mdi-delete</v-icon></v-list-item-icon>
          <v-list-item-title class="error--text">{{ $t("delete") }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="update_dialog" max-width="500">
      <v-card>
        <v-card-title>{{ $t("bulk_update") }}</v-card-title>
        <v-card-text>
          <v-select v-model="update_field" :items="updatable_fields" :label="$t('field')"></v-select>
          <v-text-field v-model="update_value" :label="$t('new_value')"></v-text-field>
          <v-progress-linear v-if="processing" :value="progress"></v-progress-linear>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="update_dialog = false">{{ $t("cancel") }}</v-btn>
          <v-btn color="primary" @click="performBulkUpdate">{{ $t("update") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-toolbar>
</template>

<script>
/**
 * BulkActionsToolbar Component
 *
 * Meta-aware toolbar for bulk entity operations.
 */
import meta from "../mixins/meta";

export default {
  name: "BulkActionsToolbar",
  mixins: [meta],

  props: {
    selectedItems: { type: Array, required: true },
  },

  data() {
    return {
      update_dialog: false,
      update_field: null,
      update_value: null,
      processing: false,
      progress: 0,
    };
  },

  computed: {
    selected_count() {
      return this.selectedItems?.length || 0;
    },

    updatable_fields() {
      if (!this.meta?.fields) return [];
      return this.meta.fields.filter((f) => !["_id"].includes(f.name)).map((f) => ({ text: f.label || f.name, value: f.name }));
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    async performBulkUpdate() {
      this.processing = true;
      for (let i = 0; i < this.selectedItems.length; i++) {
        await this.$axios.patch(`/${this.entity}/${this.selectedItems[i]._id}`, {
          [this.update_field]: this.update_value,
        });
        this.progress = ((i + 1) / this.selectedItems.length) * 100;
      }
      this.processing = false;
      this.update_dialog = false;
      this.$emit("updated");
    },

    confirmDelete() {
      if (confirm(this.$t("confirm_delete_multiple"))) {
        this.$emit("delete", this.selectedItems);
      }
    },
  },
};
</script>
