<template>
  <v-card>
    <v-card-title>
      {{ entity_label }}
      <v-spacer></v-spacer>
      <v-select v-model="date_field" :items="date_field_options" :label="$t('date_field')" dense hide-details style="max-width: 200px"></v-select>
    </v-card-title>

    <v-card-text>
      <v-timeline v-if="timeline_items.length > 0" :dense="dense">
        <v-timeline-item v-for="(item, index) in timeline_items" :key="index" :color="getItemColor(item.entity)" :icon="getItemIcon(item.entity)" fill-dot>
          <template #opposite>
            <span class="text-caption">{{ item.date_text }}</span>
          </template>

          <v-card>
            <v-card-title class="text-h6">
              {{ item.title }}
            </v-card-title>
            <v-card-text>
              <div v-for="field in visible_fields" :key="field.name" class="mb-1">
                <strong>{{ field.label }}:</strong> {{ format_field_value(item.entity, field) }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text small @click="viewEntity(item.entity)">
                {{ $t("view") }}
              </v-btn>
              <v-btn text small color="primary" @click="editEntity(item.entity)">
                {{ $t("edit") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <div v-else class="text-center pa-4 grey--text">
        {{ $t("no_data") }}
      </div>

      <!-- Infinite scroll trigger -->
      <div v-if="has_more" v-intersect="loadMore" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
/**
 * EntityTimelineView Component
 *
 * Timeline visualization for entities with date fields.
 * Displays entities chronologically with metadata-driven rendering.
 *
 * Features:
 * - Auto-discovers date/datetime fields from entity metadata
 * - Chronological ordering (newest first by default)
 * - Grouping by entity type or field values
 * - Infinite scroll for large datasets
 * - Customizable icons and colors
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {string} dateField - Primary date field name (optional, auto-detected)
 * @prop {string} titleField - Field to use for title (optional, auto-detected)
 * @prop {Array} visibleFields - Fields to display (optional, uses metadata)
 * @prop {boolean} dense - Dense timeline layout (default: false)
 * @prop {boolean} reverse - Reverse chronological order (default: false)
 * @prop {Function} colorFunction - Custom color function (entity) => color
 * @prop {Function} iconFunction - Custom icon function (entity) => icon
 * @prop {number} pageSize - Items per page for infinite scroll (default: 20)
 *
 * Events:
 * @event view - Emitted when view button clicked { entity }
 * @event edit - Emitted when edit button clicked { entity }
 */
import meta from "../mixins/meta";

export default {
  name: "EntityTimelineView",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
    dateField: { type: String, default: null },
    titleField: { type: String, default: null },
    visibleFields: { type: Array, default: null },
    dense: { type: Boolean, default: false },
    reverse: { type: Boolean, default: false },
    colorFunction: { type: Function, default: null },
    iconFunction: { type: Function, default: null },
    pageSize: { type: Number, default: 20 },
  },

  data() {
    return {
      date_field: null,
      current_page: 1,
    };
  },

  computed: {
    /**
     * Get all date/datetime fields from metadata
     * @returns {Array} Date field options
     */
    date_field_options() {
      if (!this.meta?.fields) return [];

      return this.meta.fields
        .filter((f) => ["date", "datetime"].includes(f.type))
        .map((f) => ({
          text: f.label || f.name,
          value: f.name,
        }));
    },

    /**
     * Get fields to display in timeline items
     * @returns {Array} Field configurations
     */
    visible_fields() {
      if (this.visibleFields) {
        return this.meta?.fields?.filter((f) => this.visibleFields.includes(f.name)) || [];
      }

      if (!this.meta?.fields) return [];

      return this.meta.fields.filter((f) => !["_id", "password", "token", this.date_field].includes(f.name)).slice(0, 5);
    },

    /**
     * Transform entities into timeline items with sorting
     * @returns {Array} Timeline item objects
     */
    timeline_items() {
      if (!this.items?.length || !this.date_field) return [];

      const sorted = [...this.items]
        .filter((item) => item[this.date_field])
        .sort((a, b) => {
          const date_a = new Date(a[this.date_field]);
          const date_b = new Date(b[this.date_field]);
          return this.reverse ? date_a - date_b : date_b - date_a;
        });

      const page_items = sorted.slice(0, this.current_page * this.pageSize);

      return page_items.map((entity) => ({
        entity,
        date_text: this.format_date(entity[this.date_field]),
        title: this.get_entity_title(entity),
      }));
    },

    /**
     * Check if more items available for infinite scroll
     * @returns {boolean} Has more items
     */
    has_more() {
      return this.items?.length > this.current_page * this.pageSize;
    },
  },

  watch: {
    /**
     * Initialize date field when metadata loads
     */
    meta: {
      immediate: true,
      handler() {
        if (this.meta && !this.date_field) {
          this.initialize_date_field();
        }
      },
    },

    /**
     * Reset pagination when items change
     */
    items() {
      this.current_page = 1;
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    /**
     * Initialize primary date field from metadata or prop
     */
    initialize_date_field() {
      if (this.dateField) {
        this.date_field = this.dateField;
      } else {
        const date_fields = this.date_field_options;
        if (date_fields.length > 0) {
          this.date_field = date_fields[0].value;
        }
      }
    },

    /**
     * Format date for display
     * @param {string|Date} date_value - Date value
     * @returns {string} Formatted date
     */
    format_date(date_value) {
      if (!date_value) return "";

      const date = new Date(date_value);
      if (isNaN(date.getTime())) return "";

      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
     * Get item color from custom function or default
     * @param {Object} entity - Entity object
     * @returns {string} Color value
     */
    getItemColor(entity) {
      if (this.colorFunction) {
        return this.colorFunction(entity);
      }
      return "primary";
    },

    /**
     * Get item icon from custom function or default
     * @param {Object} entity - Entity object
     * @returns {string} Icon name
     */
    getItemIcon(entity) {
      if (this.iconFunction) {
        return this.iconFunction(entity);
      }
      return "mdi-circle";
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
        return new Date(value).toLocaleString();
      }

      if (field.type === "boolean") {
        return value ? "✓" : "✗";
      }

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      return String(value);
    },

    /**
     * Load more items for infinite scroll
     */
    loadMore() {
      if (this.has_more) {
        this.current_page++;
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
  },
};
</script>

<style scoped>
.v-timeline-item >>> .v-timeline-item__dot {
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>
