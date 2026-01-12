<template>
  <v-card>
    <v-card-title>
      {{ $t("compare") }} {{ entity_label }}
      <v-spacer></v-spacer>
      <v-chip small>{{ compared_entities.length }} {{ $t("entities") }}</v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Entity Selection -->
      <v-select v-model="compared_entities" :items="items" :item-text="get_item_text" :item-value="get_item_value" :label="$t('select_entities_to_compare')" multiple chips deletable-chips :hint="$t('select_2_or_more_entities')" persistent-hint class="mb-4"></v-select>

      <!-- Comparison Table -->
      <v-card v-if="compared_entities.length >= 2" outlined>
        <v-data-table :headers="comparison_headers" :items="comparison_rows" hide-default-footer disable-pagination dense>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.field="{ item }">
            <strong>{{ item.field_label }}</strong>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-for="(entity, index) in compared_entities" #[`item.entity_${index}`]="{ item }">
            <v-chip v-if="item.differences[index]" :key="`diff-${index}`" small :color="get_diff_color(item, index)">
              {{ format_value(item.values[index], item.field_type) }}
            </v-chip>
            <span v-else :key="`same-${index}`">
              {{ format_value(item.values[index], item.field_type) }}
            </span>
          </template>
        </v-data-table>
      </v-card>

      <div v-else class="text-center pa-4 grey--text">
        {{ $t("select_at_least_2_entities") }}
      </div>
    </v-card-text>

    <v-card-actions v-if="compared_entities.length >= 2">
      <v-switch v-model="show_differences_only" :label="$t('show_differences_only')" dense hide-details class="mt-0"></v-switch>
      <v-spacer></v-spacer>
      <v-btn text @click="exportComparison">
        <v-icon left>mdi-export</v-icon>
        {{ $t("export") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
/**
 * EntityCompareView Component
 *
 * Side-by-side comparison of multiple entities.
 * Uses metadata to compare all fields and highlight differences.
 *
 * Features:
 * - Multi-entity comparison (2 or more)
 * - Highlight differences based on field types
 * - Visual diff for arrays and objects
 * - Export comparison results
 * - Show differences only mode
 * - Smart value formatting per field type
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {Array} selectedEntities - Pre-selected entity IDs (optional)
 * @prop {Array} fieldsToCompare - Specific fields to compare (optional, uses all)
 * @prop {boolean} showDifferencesOnly - Initial state for differences filter (default: false)
 *
 * Events:
 * @event export - Emitted when export clicked { comparison_data }
 */
import meta from "../mixins/meta";

export default {
  name: "EntityCompareView",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
    selectedEntities: { type: Array, default: () => [] },
    fieldsToCompare: { type: Array, default: null },
    showDifferencesOnly: { type: Boolean, default: false },
  },

  data() {
    return {
      compared_entities: [],
      show_differences_only: false,
    };
  },

  computed: {
    /**
     * Get comparison table headers
     * @returns {Array} Table headers
     */
    comparison_headers() {
      const headers = [{ text: this.$t("field"), value: "field", sortable: false, width: "200px" }];

      this.compared_entities.forEach((entity, index) => {
        headers.push({
          text: this.get_entity_title(entity) || `${this.$t("entity")} ${index + 1}`,
          value: `entity_${index}`,
          sortable: false,
        });
      });

      return headers;
    },

    /**
     * Get comparison rows with field values and differences
     * @returns {Array} Comparison rows
     */
    comparison_rows() {
      if (!this.meta?.fields || this.compared_entities.length < 2) return [];

      const fields = this.fieldsToCompare ? this.meta.fields.filter((f) => this.fieldsToCompare.includes(f.name)) : this.meta.fields.filter((f) => !["_id", "password", "token"].includes(f.name));

      const rows = fields.map((field) => {
        const values = this.compared_entities.map((entity) => entity[field.name]);
        const differences = this.detect_differences(values, field.type);
        const has_difference = differences.some((d) => d);

        return {
          field_name: field.name,
          field_label: field.label || field.name,
          field_type: field.type,
          values,
          differences,
          has_difference,
        };
      });

      return this.show_differences_only ? rows.filter((row) => row.has_difference) : rows;
    },
  },

  watch: {
    /**
     * Initialize selected entities when prop changes
     */
    selectedEntities: {
      immediate: true,
      handler(new_value) {
        if (new_value?.length > 0) {
          this.compared_entities = this.items.filter((item) => new_value.includes(this.get_item_value(item)));
        }
      },
    },

    /**
     * Initialize show_differences_only
     */
    showDifferencesOnly: {
      immediate: true,
      handler(new_value) {
        this.show_differences_only = new_value;
      },
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    /**
     * Get item text for select display
     * @param {Object} item - Entity object
     * @returns {string} Display text
     */
    get_item_text(item) {
      return this.get_entity_title(item);
    },

    /**
     * Get item value (ID) for select
     * @param {Object} item - Entity object
     * @returns {string} Entity ID
     */
    get_item_value(item) {
      return item._id?.toString() || item.id?.toString() || "";
    },

    /**
     * Get entity title from first string field or ID
     * @param {Object} entity - Entity object
     * @returns {string} Entity title
     */
    get_entity_title(entity) {
      if (!entity) return "";

      if (this.meta?.fields) {
        const string_field = this.meta.fields.find((f) => f.type === "string" && entity[f.name]);
        if (string_field) {
          return String(entity[string_field.name]);
        }
      }

      return entity._id?.toString() || "Untitled";
    },

    /**
     * Detect differences between values
     * @param {Array} values - Array of values to compare
     * @param {string} field_type - Field type
     * @returns {Array} Boolean array indicating differences
     */
    detect_differences(values, field_type) {
      if (values.length < 2) return values.map(() => false);

      const differences = [];

      for (let i = 0; i < values.length; i++) {
        let is_different = false;

        for (let j = 0; j < values.length; j++) {
          if (i !== j && !this.values_equal(values[i], values[j], field_type)) {
            is_different = true;
            break;
          }
        }

        differences.push(is_different);
      }

      return differences;
    },

    /**
     * Check if two values are equal (with type-specific comparison)
     * @param {*} value1 - First value
     * @param {*} value2 - Second value
     * @param {string} field_type - Field type
     * @returns {boolean} Values equal
     */
    values_equal(value1, value2, field_type) {
      if (value1 === value2) return true;
      if (value1 === null || value1 === undefined) return value2 === null || value2 === undefined;
      if (value2 === null || value2 === undefined) return false;

      if (field_type === "array") {
        if (!Array.isArray(value1) || !Array.isArray(value2)) return false;
        if (value1.length !== value2.length) return false;
        return value1.every((v, i) => this.values_equal(v, value2[i], "string"));
      }

      if (field_type === "obj" || field_type === "object") {
        return JSON.stringify(value1) === JSON.stringify(value2);
      }

      if (field_type === "date" || field_type === "datetime") {
        return new Date(value1).getTime() === new Date(value2).getTime();
      }

      return String(value1) === String(value2);
    },

    /**
     * Get color for difference chip
     * @param {Object} row - Comparison row
     * @param {number} index - Entity index
     * @returns {string} Color value
     */
    get_diff_color(row, index) {
      return row.differences[index] ? "warning" : "success";
    },

    /**
     * Format value for display based on field type
     * @param {*} value - Field value
     * @param {string} field_type - Field type
     * @returns {string} Formatted value
     */
    format_value(value, field_type) {
      if (value === null || value === undefined) return "-";

      if (field_type === "date" || field_type === "datetime") {
        return new Date(value).toLocaleString();
      }

      if (field_type === "boolean") {
        return value ? "✓" : "✗";
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "-";
      }

      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }

      const str = String(value);
      return str.length > 50 ? str.substring(0, 50) + "..." : str;
    },

    /**
     * Export comparison data
     */
    exportComparison() {
      const export_data = {
        entity: this.entity,
        entities: this.compared_entities.map((e) => ({
          id: this.get_item_value(e),
          title: this.get_entity_title(e),
        })),
        fields: this.comparison_rows.map((row) => ({
          field: row.field_name,
          label: row.field_label,
          values: row.values,
          has_difference: row.has_difference,
        })),
        timestamp: new Date().toISOString(),
      };

      this.$emit("export", export_data);
    },
  },
};
</script>

<style scoped>
.v-data-table >>> tbody tr:nth-child(odd) {
  background-color: #fafafa;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: auto;
}
</style>
