<template>
  <div class="relationship-picker">
    <v-autocomplete v-if="!show_dialog" v-model="selected_value" :items="autocomplete_items" :loading="loading" :search-input.sync="search" :label="field_label" :multiple="is_multiple" :chips="is_multiple" :deletable-chips="is_multiple" :disabled="disabled" :error-messages="error_messages" :hint="hint_text" persistent-hint item-text="label" item-value="value" clearable @change="handleChange">
      <template #selection="{ item }">
        <v-chip v-if="is_multiple" small close @click:close="removeItem(item)">
          {{ item.label }}
        </v-chip>
        <span v-else>{{ item.label }}</span>
      </template>

      <template #append-outer>
        <v-btn icon @click="show_dialog = true">
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
        <v-btn v-if="allow_create" icon @click="quick_create_dialog = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
    </v-autocomplete>

    <!-- Advanced Selection Dialog -->
    <v-dialog v-model="show_dialog" max-width="800">
      <v-card>
        <v-card-title>
          {{ $t("select") }} {{ referenced_entity_label }}
          <v-spacer></v-spacer>
          <v-btn icon @click="show_dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="dialog_search" :label="$t('search')" prepend-icon="mdi-magnify" clearable dense class="mb-2"></v-text-field>

          <v-data-table v-model="dialog_selected" :headers="table_headers" :items="filtered_items" :loading="loading" :show-select="is_multiple" :single-select="!is_multiple" item-key="value" :items-per-page="10" @click:row="handleRowClick">
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.label="{ item }">
              <strong>{{ item.label }}</strong>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="show_dialog = false">
            {{ $t("cancel") }}
          </v-btn>
          <v-btn color="primary" @click="confirmSelection">
            {{ $t("confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Quick Create Dialog -->
    <v-dialog v-model="quick_create_dialog" max-width="500">
      <v-card>
        <v-card-title> {{ $t("create") }} {{ referenced_entity_label }} </v-card-title>
        <v-card-text>
          <slot name="quick-create" :entity="referenced_entity">
            <div class="grey--text">{{ $t("quick_create_not_configured") }}</div>
          </slot>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="quick_create_dialog = false">
            {{ $t("cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/**
 * RelationshipPicker Component
 *
 * Advanced picker for entity reference fields.
 * Provides autocomplete, advanced search, and quick-create capabilities.
 *
 * Features:
 * - Autocomplete for quick selection
 * - Advanced dialog with data table, search, and pagination
 * - Multi-select for array references
 * - Quick-create for referenced entities
 * - Metadata-driven field display
 *
 * Props:
 * @prop {string} fieldName - Field name from entity metadata (required)
 * @prop {Object} fieldConfig - Field configuration from metadata
 * @prop {string|string[]} value - Current field value (entity IDs)
 * @prop {string} referencedEntity - Referenced entity name (from metadata)
 * @prop {Array} items - Available entities for selection
 * @prop {boolean} disabled - Disable input (default: false)
 * @prop {boolean} allowCreate - Show quick-create button (default: false)
 * @prop {Function} loadItemsFunction - Custom function to load items
 *
 * Events:
 * @event input - Emitted when selection changes { value }
 * @event create - Emitted when quick-create requested
 */
import { get_ref_labels } from "../core/axios";

export default {
  name: "RelationshipPicker",

  props: {
    fieldName: { type: String, required: true },
    fieldConfig: { type: Object, default: () => ({}) },
    value: { type: [String, Array], default: null },
    referencedEntity: { type: String, required: true },
    items: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: false },
    loadItemsFunction: { type: Function, default: null },
  },

  data() {
    return {
      search: "",
      dialog_search: "",
      loading: false,
      show_dialog: false,
      quick_create_dialog: false,
      selected_value: null,
      dialog_selected: [],
      autocomplete_items: [],
      error_messages: [],
    };
  },

  computed: {
    /**
     * Get field label from config or field name
     * @returns {string} Field label
     */
    field_label() {
      return this.fieldConfig?.label || this.fieldName;
    },

    /**
     * Check if field allows multiple references
     * @returns {boolean} Is multiple
     */
    is_multiple() {
      return this.fieldConfig?.multiple === true || Array.isArray(this.value);
    },

    /**
     * Get referenced entity label
     * @returns {string} Entity label
     */
    referenced_entity_label() {
      return this.referencedEntity || this.$t("entity");
    },

    /**
     * Get hint text
     * @returns {string} Hint text
     */
    hint_text() {
      return this.$t("type_to_search_or_click_to_open");
    },

    /**
     * Get table headers for dialog
     * @returns {Array} Table headers
     */
    table_headers() {
      return [
        { text: this.$t("name"), value: "label", sortable: true },
        { text: this.$t("id"), value: "value", sortable: true },
      ];
    },

    /**
     * Filter items for dialog table
     * @returns {Array} Filtered items
     */
    filtered_items() {
      if (!this.dialog_search) {
        return this.autocomplete_items;
      }

      const search_lower = this.dialog_search.toLowerCase();
      return this.autocomplete_items.filter((item) => item.label.toLowerCase().includes(search_lower) || item.value.toString().toLowerCase().includes(search_lower));
    },

    /**
     * Get referenced entity name
     * @returns {string} Entity name
     */
    referenced_entity() {
      return this.referencedEntity;
    },
  },

  watch: {
    /**
     * Load items when component mounts or entity changes
     */
    referencedEntity: {
      immediate: true,
      handler() {
        this.load_items();
      },
    },

    /**
     * Update selected value when prop changes
     */
    value: {
      immediate: true,
      handler(new_value) {
        this.selected_value = new_value;
        this.sync_dialog_selection();
      },
    },

    /**
     * Load items when search changes (debounced)
     */
    search(new_search) {
      if (new_search && new_search.length >= 2) {
        this.debounced_load_items(new_search);
      }
    },

    /**
     * Use provided items if available
     */
    items: {
      immediate: true,
      deep: true,
      handler(new_items) {
        if (new_items?.length > 0) {
          this.autocomplete_items = this.format_items(new_items);
        }
      },
    },
  },

  methods: {
    /**
     * Load available entities from server
     * @param {string} search_text - Search query
     */
    async load_items(search_text = "") {
      if (!this.referencedEntity) return;

      this.loading = true;

      try {
        let items;

        if (this.loadItemsFunction) {
          items = await this.loadItemsFunction(search_text);
        } else if (this.items?.length > 0) {
          items = this.items;
        } else {
          // Load from server using get_ref_labels
          const response = await get_ref_labels(this.referencedEntity, {
            search: search_text,
            limit: 100,
          });
          items = response?.data || [];
        }

        this.autocomplete_items = this.format_items(items);
      } catch (error) {
        console.error("Error loading items:", error);
        this.error_messages = [this.$t("failed_to_load_items")];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Debounced load items (300ms delay)
     */
    debounced_load_items: (function () {
      let timeout;
      return function (search_text) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.load_items(search_text);
        }, 300);
      };
    })(),

    /**
     * Format items for autocomplete
     * @param {Array} items - Raw items
     * @returns {Array} Formatted items
     */
    format_items(items) {
      return items.map((item) => ({
        label: item.label || item.name || item._id?.toString() || "Untitled",
        value: item._id?.toString() || item.value || item.id,
        raw: item,
      }));
    },

    /**
     * Handle autocomplete change
     */
    handleChange() {
      this.$emit("input", this.selected_value);
    },

    /**
     * Handle row click in dialog table
     * @param {Object} item - Selected item
     */
    handleRowClick(item) {
      if (!this.is_multiple) {
        this.dialog_selected = [item];
        this.confirmSelection();
      }
    },

    /**
     * Confirm dialog selection
     */
    confirmSelection() {
      if (this.is_multiple) {
        this.selected_value = this.dialog_selected.map((item) => item.value);
      } else {
        this.selected_value = this.dialog_selected[0]?.value || null;
      }

      this.$emit("input", this.selected_value);
      this.show_dialog = false;
    },

    /**
     * Sync dialog selection with current value
     */
    sync_dialog_selection() {
      if (!this.selected_value) {
        this.dialog_selected = [];
        return;
      }

      const values = Array.isArray(this.selected_value) ? this.selected_value : [this.selected_value];

      this.dialog_selected = this.autocomplete_items.filter((item) => values.includes(item.value));
    },

    /**
     * Remove item from multi-select
     * @param {Object} item - Item to remove
     */
    removeItem(item) {
      if (!Array.isArray(this.selected_value)) return;

      const index = this.selected_value.indexOf(item.value);
      if (index >= 0) {
        const new_value = [...this.selected_value];
        new_value.splice(index, 1);
        this.selected_value = new_value;
        this.$emit("input", this.selected_value);
      }
    },
  },
};
</script>

<style scoped>
.relationship-picker {
  width: 100%;
}
</style>
