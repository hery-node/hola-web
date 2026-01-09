<template>
  <v-card>
    <v-card-title>
      {{ $t("advanced_filter") }}
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template #activator="{ on, attrs }">
          <v-btn text small v-bind="attrs" v-on="on">
            <v-icon left>mdi-content-save</v-icon>
            {{ $t("presets") }}
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item v-for="(preset, index) in saved_presets" :key="index" @click="loadPreset(preset)">
            <v-list-item-title>{{ preset.name }}</v-list-item-title>
            <v-list-item-action>
              <v-btn icon x-small @click.stop="deletePreset(index)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="saved_presets.length > 0"></v-divider>
          <v-list-item @click="savePresetDialog = true">
            <v-list-item-icon>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t("save_current") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-text>
      <!-- Filter Conditions -->
      <div v-for="(condition, index) in filter_conditions" :key="index" class="mb-3">
        <v-card outlined>
          <v-card-text class="pa-2">
            <v-row dense align="center">
              <!-- Logical Operator (AND/OR) -->
              <v-col v-if="index > 0" cols="12" sm="2">
                <v-select v-model="condition.logic" :items="logic_operators" dense hide-details></v-select>
              </v-col>

              <!-- Field Selection -->
              <v-col cols="12" :sm="index > 0 ? 3 : 4">
                <v-select v-model="condition.field" :items="available_fields" :label="$t('field')" dense hide-details @change="handleFieldChange(condition)"></v-select>
              </v-col>

              <!-- Operator Selection -->
              <v-col cols="12" sm="2">
                <v-select v-model="condition.operator" :items="get_operators_for_field(condition)" :label="$t('operator')" dense hide-details></v-select>
              </v-col>

              <!-- Value Input -->
              <v-col cols="12" sm="4">
                <component :is="get_value_component(condition)" v-model="condition.value" :label="$t('value')" dense hide-details v-bind="get_value_component_props(condition)"></component>
              </v-col>

              <!-- Remove Button -->
              <v-col cols="12" sm="1">
                <v-btn icon small @click="removeCondition(index)">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- Add Condition Button -->
      <v-btn text small color="primary" @click="addCondition">
        <v-icon left small>mdi-plus</v-icon>
        {{ $t("add_condition") }}
      </v-btn>

      <!-- Filter Preview -->
      <v-card v-if="filter_conditions.length > 0" outlined class="mt-3">
        <v-card-subtitle>{{ $t("filter_preview") }}</v-card-subtitle>
        <v-card-text>
          <code class="text-caption">{{ build_query_preview() }}</code>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-actions>
      <v-btn text @click="clearAll">{{ $t("clear_all") }}</v-btn>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')">{{ $t("cancel") }}</v-btn>
      <v-btn color="primary" @click="applyFilter">{{ $t("apply") }}</v-btn>
    </v-card-actions>

    <!-- Save Preset Dialog -->
    <v-dialog v-model="savePresetDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t("save_preset") }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="preset_name" :label="$t('preset_name')" autofocus></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="savePresetDialog = false">{{ $t("cancel") }}</v-btn>
          <v-btn color="primary" @click="savePreset">{{ $t("save") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
/**
 * AdvancedFilterBuilder Component
 *
 * Visual query builder for entity filtering using metadata.
 * Generates MongoDB-style queries from user-friendly UI.
 *
 * Features:
 * - All entity fields available as filter criteria
 * - Type-specific operators (=, >, <, contains, in, etc.)
 * - Nested AND/OR conditions
 * - Save/load filter presets
 * - Query preview
 * - Smart value inputs based on field type
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Object} initialFilter - Initial filter conditions
 *
 * Events:
 * @event apply - Emitted when filter applied { query, conditions }
 * @event cancel - Emitted when canceled
 */
import meta from "../mixins/meta";

export default {
  name: "AdvancedFilterBuilder",
  mixins: [meta],

  props: {
    initialFilter: { type: Object, default: null },
  },

  data() {
    return {
      filter_conditions: [],
      logic_operators: [
        { text: "AND", value: "and" },
        { text: "OR", value: "or" },
      ],
      saved_presets: [],
      savePresetDialog: false,
      preset_name: "",
    };
  },

  computed: {
    /**
     * Get available fields from metadata
     * @returns {Array} Field options
     */
    available_fields() {
      if (!this.meta?.fields) return [];

      return this.meta.fields
        .filter((f) => !["password", "token"].includes(f.name))
        .map((f) => ({
          text: f.label || f.name,
          value: f.name,
          field: f,
        }));
    },
  },

  watch: {
    /**
     * Load initial filter when provided
     */
    initialFilter: {
      immediate: true,
      handler(new_filter) {
        if (new_filter) {
          this.load_from_query(new_filter);
        }
      },
    },
  },

  async mounted() {
    await this.load_meta();
    this.load_saved_presets();

    if (this.filter_conditions.length === 0) {
      this.addCondition();
    }
  },

  methods: {
    /**
     * Add new filter condition
     */
    addCondition() {
      this.filter_conditions.push({
        logic: "and",
        field: null,
        operator: null,
        value: null,
        field_config: null,
      });
    },

    /**
     * Remove filter condition
     * @param {number} index - Condition index
     */
    removeCondition(index) {
      this.filter_conditions.splice(index, 1);
    },

    /**
     * Handle field change - update operator options
     * @param {Object} condition - Filter condition
     */
    handleFieldChange(condition) {
      if (!condition.field) return;

      const field = this.meta.fields.find((f) => f.name === condition.field);
      condition.field_config = field;

      const operators = this.get_operators_for_field(condition);
      condition.operator = operators[0]?.value || null;
      condition.value = null;
    },

    /**
     * Get operators for field type
     * @param {Object} condition - Filter condition
     * @returns {Array} Operator options
     */
    get_operators_for_field(condition) {
      if (!condition.field_config) return [];

      const type = condition.field_config.type;

      const common = [
        { text: "=", value: "eq" },
        { text: "≠", value: "ne" },
        { text: this.$t("exists"), value: "exists" },
        { text: this.$t("not_exists"), value: "not_exists" },
      ];

      if (type === "string") {
        return [...common, { text: this.$t("contains"), value: "contains" }, { text: this.$t("starts_with"), value: "starts_with" }, { text: this.$t("ends_with"), value: "ends_with" }, { text: this.$t("regex"), value: "regex" }];
      }

      if (type === "number" || type === "date" || type === "datetime") {
        return [...common, { text: ">", value: "gt" }, { text: "≥", value: "gte" }, { text: "<", value: "lt" }, { text: "≤", value: "lte" }, { text: this.$t("between"), value: "between" }];
      }

      if (type === "array" || condition.field_config.multiple) {
        return [...common, { text: this.$t("in"), value: "in" }, { text: this.$t("not_in"), value: "nin" }, { text: this.$t("all"), value: "all" }];
      }

      return common;
    },

    /**
     * Get value input component for condition
     * @param {Object} condition - Filter condition
     * @returns {string} Component name
     */
    get_value_component(condition) {
      if (!condition.field_config || !condition.operator) {
        return "v-text-field";
      }

      if (["exists", "not_exists"].includes(condition.operator)) {
        return "v-checkbox";
      }

      const type = condition.field_config.type;

      if (type === "boolean") {
        return "v-checkbox";
      }

      if (type === "date" || type === "datetime") {
        return "v-text-field";
      }

      if (type === "number") {
        return "v-text-field";
      }

      if (condition.field_config.enum) {
        return "v-select";
      }

      if (["in", "nin", "all"].includes(condition.operator)) {
        return "v-combobox";
      }

      return "v-text-field";
    },

    /**
     * Get props for value input component
     * @param {Object} condition - Filter condition
     * @returns {Object} Component props
     */
    get_value_component_props(condition) {
      const props = {};

      if (!condition.field_config) return props;

      const component = this.get_value_component(condition);

      if (component === "v-text-field") {
        if (condition.field_config.type === "number") {
          props.type = "number";
        } else if (condition.field_config.type === "date") {
          props.type = "date";
        } else if (condition.field_config.type === "datetime") {
          props.type = "datetime-local";
        }
      }

      if (component === "v-select") {
        props.items = condition.field_config.enum || [];
      }

      if (component === "v-combobox") {
        props.multiple = true;
        props.chips = true;
        props["small-chips"] = true;
      }

      return props;
    },

    /**
     * Build MongoDB query from conditions
     * @returns {Object} MongoDB query
     */
    build_query() {
      if (this.filter_conditions.length === 0) return {};

      const query_parts = this.filter_conditions.filter((c) => c.field && c.operator).map((condition) => this.condition_to_query(condition));

      if (query_parts.length === 0) return {};
      if (query_parts.length === 1) return query_parts[0];

      // Group by logic operator
      const and_conditions = [];
      const or_conditions = [];

      query_parts.forEach((part, index) => {
        const logic = this.filter_conditions[index].logic;
        if (logic === "or") {
          or_conditions.push(part);
        } else {
          and_conditions.push(part);
        }
      });

      if (or_conditions.length > 0 && and_conditions.length > 0) {
        return {
          $and: [...and_conditions, { $or: or_conditions }],
        };
      }

      if (or_conditions.length > 0) {
        return { $or: or_conditions };
      }

      return { $and: and_conditions };
    },

    /**
     * Convert single condition to MongoDB query
     * @param {Object} condition - Filter condition
     * @returns {Object} MongoDB query part
     */
    condition_to_query(condition) {
      const { field, operator, value } = condition;

      switch (operator) {
        case "eq":
          return { [field]: value };
        case "ne":
          return { [field]: { $ne: value } };
        case "gt":
          return { [field]: { $gt: value } };
        case "gte":
          return { [field]: { $gte: value } };
        case "lt":
          return { [field]: { $lt: value } };
        case "lte":
          return { [field]: { $lte: value } };
        case "contains":
          return { [field]: { $regex: value, $options: "i" } };
        case "starts_with":
          return { [field]: { $regex: `^${value}`, $options: "i" } };
        case "ends_with":
          return { [field]: { $regex: `${value}$`, $options: "i" } };
        case "regex":
          return { [field]: { $regex: value } };
        case "in":
          return { [field]: { $in: Array.isArray(value) ? value : [value] } };
        case "nin":
          return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
        case "all":
          return { [field]: { $all: Array.isArray(value) ? value : [value] } };
        case "exists":
          return { [field]: { $exists: true } };
        case "not_exists":
          return { [field]: { $exists: false } };
        case "between":
          if (Array.isArray(value) && value.length === 2) {
            return { [field]: { $gte: value[0], $lte: value[1] } };
          }
          return { [field]: value };
        default:
          return { [field]: value };
      }
    },

    /**
     * Build human-readable query preview
     * @returns {string} Query preview
     */
    build_query_preview() {
      return JSON.stringify(this.build_query(), null, 2);
    },

    /**
     * Apply current filter
     */
    applyFilter() {
      const query = this.build_query();
      this.$emit("apply", { query, conditions: this.filter_conditions });
    },

    /**
     * Clear all conditions
     */
    clearAll() {
      this.filter_conditions = [];
      this.addCondition();
    },

    /**
     * Save current filter as preset
     */
    savePreset() {
      if (!this.preset_name?.trim()) return;

      this.saved_presets.push({
        name: this.preset_name,
        conditions: JSON.parse(JSON.stringify(this.filter_conditions)),
      });

      this.store_presets();
      this.preset_name = "";
      this.savePresetDialog = false;
    },

    /**
     * Load preset
     * @param {Object} preset - Saved preset
     */
    loadPreset(preset) {
      this.filter_conditions = JSON.parse(JSON.stringify(preset.conditions));
    },

    /**
     * Delete preset
     * @param {number} index - Preset index
     */
    deletePreset(index) {
      this.saved_presets.splice(index, 1);
      this.store_presets();
    },

    /**
     * Store presets to localStorage
     */
    store_presets() {
      const key = `filter_presets_${this.entity}`;
      localStorage.setItem(key, JSON.stringify(this.saved_presets));
    },

    /**
     * Load saved presets from localStorage
     */
    load_saved_presets() {
      const key = `filter_presets_${this.entity}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          this.saved_presets = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to load presets:", e);
        }
      }
    },

    /**
     * Load filter from MongoDB query
     * @param {Object} query - MongoDB query
     */
    load_from_query(query) {
      // Simplified query parsing - extend as needed
      this.filter_conditions = [];

      Object.keys(query).forEach((field) => {
        const value = query[field];
        let operator = "eq";
        let condition_value = value;

        if (typeof value === "object" && value !== null) {
          const ops = Object.keys(value);
          if (ops.includes("$eq")) {
            operator = "eq";
            condition_value = value.$eq;
          } else if (ops.includes("$ne")) {
            operator = "ne";
            condition_value = value.$ne;
          } else if (ops.includes("$gt")) {
            operator = "gt";
            condition_value = value.$gt;
          }
          // Add more operators as needed
        }

        this.filter_conditions.push({
          logic: "and",
          field,
          operator,
          value: condition_value,
          field_config: this.meta?.fields?.find((f) => f.name === field),
        });
      });

      if (this.filter_conditions.length === 0) {
        this.addCondition();
      }
    },
  },
};
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}
</style>
