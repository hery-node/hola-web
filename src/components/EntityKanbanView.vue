<template>
  <v-card>
    <v-card-title>
      {{ entity_label }}
      <v-spacer></v-spacer>
      <v-select v-model="status_field" :items="status_field_options" :label="$t('status_field')" dense hide-details style="max-width: 200px"></v-select>
    </v-card-title>

    <v-card-text>
      <div v-if="columns.length > 0" class="kanban-board">
        <v-sheet v-for="column in columns" :key="column.value" class="kanban-column pa-2" outlined rounded>
          <div class="column-header mb-2">
            <v-chip :color="column.color" small> {{ column.label }} ({{ column.items.length }}) </v-chip>
            <div v-if="show_aggregations" class="text-caption grey--text mt-1">
              {{ get_column_aggregation(column) }}
            </div>
          </div>

          <draggable v-model="column.items" :group="{ name: 'kanban', pull: true, put: true }" class="kanban-cards" ghost-class="ghost-card" @change="handleDrop($event, column)">
            <v-card v-for="item in column.items" :key="get_entity_id(item)" class="kanban-card mb-2" outlined hover @click="viewEntity(item)">
              <v-card-text class="pa-2">
                <div class="text-subtitle-2 mb-1">{{ get_entity_title(item) }}</div>
                <div v-for="field in display_fields" :key="field.name" class="text-caption">
                  <strong>{{ field.label }}:</strong> {{ format_field_value(item, field) }}
                </div>
              </v-card-text>
              <v-card-actions class="pa-2 pt-0">
                <v-btn icon x-small @click.stop="editEntity(item)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-chip v-if="get_priority_color(item)" x-small :color="get_priority_color(item)">
                  {{ get_priority_label(item) }}
                </v-chip>
              </v-card-actions>
            </v-card>
          </draggable>

          <v-btn block text small color="primary" class="mt-2" @click="createInColumn(column)">
            <v-icon small left>mdi-plus</v-icon>
            {{ $t("add") }}
          </v-btn>
        </v-sheet>
      </div>

      <div v-else class="text-center pa-4 grey--text">
        {{ $t("no_status_field") }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
/**
 * EntityKanbanView Component
 *
 * Kanban board view for entities with status/stage fields.
 * Uses metadata to identify enum or status fields and organize entities into columns.
 *
 * Features:
 * - Auto-discovers enum/status fields from entity metadata
 * - Drag-and-drop entities between columns (updates status field)
 * - Card customization via metadata display fields
 * - Column aggregations (count, sum of numeric fields)
 * - Priority color coding
 * - Quick-create in specific columns
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {string} statusField - Status field name (optional, auto-detected)
 * @prop {string} titleField - Field to use for card title (optional, auto-detected)
 * @prop {Array} displayFields - Fields to display on cards (optional)
 * @prop {string} priorityField - Field for priority color coding (optional)
 * @prop {Object} priorityColors - Priority value to color mapping
 * @prop {boolean} showAggregations - Show column aggregations (default: false)
 * @prop {string} aggregationField - Numeric field for sum aggregation
 *
 * Events:
 * @event view - Emitted when card clicked { entity }
 * @event edit - Emitted when edit button clicked { entity }
 * @event create - Emitted when add button clicked { column_value }
 * @event update-status - Emitted when entity moved { entity, old_status, new_status }
 */
import meta from "../mixins/meta";
import draggable from "vuedraggable";

export default {
  name: "EntityKanbanView",
  mixins: [meta],
  components: { draggable },

  props: {
    items: { type: Array, required: true },
    statusField: { type: String, default: null },
    titleField: { type: String, default: null },
    displayFields: { type: Array, default: null },
    priorityField: { type: String, default: null },
    priorityColors: { type: Object, default: () => ({}) },
    showAggregations: { type: Boolean, default: false },
    aggregationField: { type: String, default: null },
  },

  data() {
    return {
      status_field: null,
      columns: [],
    };
  },

  computed: {
    /**
     * Get enum/status fields from metadata
     * @returns {Array} Status field options
     */
    status_field_options() {
      if (!this.meta?.fields) return [];

      return this.meta.fields
        .filter((f) => f.enum || f.type === "status" || f.name.includes("status") || f.name.includes("stage"))
        .map((f) => ({
          text: f.label || f.name,
          value: f.name,
        }));
    },

    /**
     * Get fields to display on kanban cards
     * @returns {Array} Field configurations
     */
    display_fields() {
      if (this.displayFields) {
        return this.meta?.fields?.filter((f) => this.displayFields.includes(f.name)) || [];
      }

      if (!this.meta?.fields) return [];

      return this.meta.fields.filter((f) => !["_id", "password", "token", this.status_field].includes(f.name)).slice(0, 3);
    },
  },

  watch: {
    /**
     * Initialize status field and columns when metadata loads
     */
    meta: {
      immediate: true,
      handler() {
        if (this.meta && !this.status_field) {
          this.initialize_status_field();
        }
      },
    },

    /**
     * Rebuild columns when status field or items change
     */
    status_field() {
      this.build_columns();
    },

    items: {
      deep: true,
      handler() {
        this.build_columns();
      },
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    /**
     * Initialize status field from metadata or prop
     */
    initialize_status_field() {
      if (this.statusField) {
        this.status_field = this.statusField;
      } else {
        const status_fields = this.status_field_options;
        if (status_fields.length > 0) {
          this.status_field = status_fields[0].value;
        }
      }
    },

    /**
     * Build kanban columns from status field enum values
     */
    build_columns() {
      if (!this.status_field || !this.meta?.fields) {
        this.columns = [];
        return;
      }

      const status_field_config = this.meta.fields.find((f) => f.name === this.status_field);

      if (!status_field_config?.enum) {
        this.columns = [];
        return;
      }

      const column_colors = ["blue", "orange", "green", "purple", "red"];

      this.columns = status_field_config.enum.map((value, index) => ({
        value,
        label: value,
        color: column_colors[index % column_colors.length],
        items: this.items.filter((item) => item[this.status_field] === value),
      }));
    },

    /**
     * Get entity ID (_id or id field)
     * @param {Object} entity - Entity object
     * @returns {string} Entity ID
     */
    get_entity_id(entity) {
      return entity._id?.toString() || entity.id?.toString() || "";
    },

    /**
     * Get entity title from titleField or first string field
     * @param {Object} entity - Entity object
     * @returns {string} Entity title
     */
    get_entity_title(entity) {
      if (this.titleField && entity[this.titleField]) {
        return String(entity[this.titleField]);
      }

      if (this.meta?.fields) {
        const string_field = this.meta.fields.find((f) => f.type === "string" && entity[f.name]);
        if (string_field) {
          return String(entity[string_field.name]);
        }
      }

      return entity._id?.toString() || "Untitled";
    },

    /**
     * Format field value for display
     * @param {Object} entity - Entity object
     * @param {Object} field - Field configuration
     * @returns {string} Formatted value
     */
    format_field_value(entity, field) {
      const value = entity[field.name];
      if (value === null || value === undefined) return "-";

      if (field.type === "date" || field.type === "datetime") {
        return new Date(value).toLocaleDateString();
      }

      if (Array.isArray(value)) {
        return value.slice(0, 2).join(", ") + (value.length > 2 ? "..." : "");
      }

      const str = String(value);
      return str.length > 30 ? str.substring(0, 30) + "..." : str;
    },

    /**
     * Get priority color for entity
     * @param {Object} entity - Entity object
     * @returns {string|null} Color value
     */
    get_priority_color(entity) {
      if (!this.priorityField || !entity[this.priorityField]) return null;
      return this.priorityColors[entity[this.priorityField]] || null;
    },

    /**
     * Get priority label for entity
     * @param {Object} entity - Entity object
     * @returns {string} Priority label
     */
    get_priority_label(entity) {
      return entity[this.priorityField] || "";
    },

    /**
     * Get column aggregation text
     * @param {Object} column - Column configuration
     * @returns {string} Aggregation text
     */
    get_column_aggregation(column) {
      if (!this.aggregationField) return "";

      const sum = column.items.reduce((acc, item) => {
        const value = parseFloat(item[this.aggregationField]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);

      return `${this.$t("total")}: ${sum.toFixed(2)}`;
    },

    /**
     * Handle entity drop between columns
     * @param {Object} event - Drag event
     * @param {Object} target_column - Target column
     */
    handleDrop(event, target_column) {
      if (event.added) {
        const entity = event.added.element;
        const old_status = entity[this.status_field];
        const new_status = target_column.value;

        // Update entity status
        entity[this.status_field] = new_status;

        this.$emit("update-status", { entity, old_status, new_status });
      }
    },

    /**
     * Emit view event
     * @param {Object} entity - Entity object
     */
    viewEntity(entity) {
      this.$emit("view", entity);
    },

    /**
     * Emit edit event
     * @param {Object} entity - Entity object
     */
    editEntity(entity) {
      this.$emit("edit", entity);
    },

    /**
     * Emit create event with column status
     * @param {Object} column - Column configuration
     */
    createInColumn(column) {
      this.$emit("create", column.value);
    },
  },
};
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-column {
  min-width: 300px;
  max-width: 300px;
  background-color: #f5f5f5;
}

.column-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f5f5f5;
  padding: 8px 0;
}

.kanban-cards {
  min-height: 400px;
}

.kanban-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.kanban-card:hover {
  transform: translateY(-2px);
}

.ghost-card {
  opacity: 0.5;
  background-color: #e3f2fd;
}
</style>
