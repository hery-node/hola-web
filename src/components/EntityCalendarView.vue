<template>
  <v-sheet height="600">
    <v-calendar ref="calendar" v-model="focus" :events="calendar_events" :event-color="getEventColor" :type="calendar_type" @click:event="showEvent" @click:more="viewDay" @click:date="viewDay">
      <template #event="{ event }">
        <div class="pl-1">
          <strong>{{ event.name }}</strong>
        </div>
      </template>
    </v-calendar>

    <!-- Event Details Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ selected_event?.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="selected_entity">
            <div v-for="field in display_fields" :key="field.name" class="mb-2">
              <strong>{{ field.label }}:</strong> {{ format_field_value(selected_entity, field) }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="editEntity">
            {{ $t("edit") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Calendar Controls -->
    <v-sheet class="d-flex align-center pa-2">
      <v-btn icon @click="$refs.calendar.prev()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn icon @click="$refs.calendar.next()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn text @click="focus = ''">
        {{ $t("today") }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-select v-model="calendar_type" :items="type_options" dense hide-details style="max-width: 200px"></v-select>
      <v-select v-model="date_field" :items="date_field_options" :label="$t('date_field')" dense hide-details class="ml-2" style="max-width: 200px"></v-select>
    </v-sheet>
  </v-sheet>
</template>

<script>
/**
 * EntityCalendarView Component
 *
 * Calendar view for entities with date fields.
 * Integrates with meta-programming framework to automatically
 * discover and display date-based entities.
 *
 * Features:
 * - Auto-discovers date/datetime fields from entity metadata
 * - Multiple calendar types (month, week, day, 4day)
 * - Event color coding by field values
 * - Click to view/edit entity details
 * - Supports multiple date fields (start/end dates)
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {string} dateField - Primary date field name (optional, auto-detected)
 * @prop {string} endDateField - End date field for ranges (optional)
 * @prop {string} titleField - Field to use for event title (optional, auto-detected)
 * @prop {Function} colorFunction - Custom color function (entity) => color
 *
 * Events:
 * @event edit - Emitted when edit button clicked { entity }
 */
import meta from "../mixins/meta";

export default {
  name: "EntityCalendarView",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
    dateField: { type: String, default: null },
    endDateField: { type: String, default: null },
    titleField: { type: String, default: null },
    colorFunction: { type: Function, default: null },
  },

  data() {
    return {
      focus: "",
      calendar_type: "month",
      type_options: [
        { text: this.$t("month"), value: "month" },
        { text: this.$t("week"), value: "week" },
        { text: this.$t("day"), value: "day" },
        { text: "4 " + this.$t("day"), value: "4day" },
      ],
      date_field: null,
      dialog: false,
      selected_event: null,
      selected_entity: null,
    };
  },

  computed: {
    /**
     * Get all date/datetime fields from metadata
     * @returns {Array} Date field configurations
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
     * Get fields to display in event details
     * @returns {Array} Field configurations
     */
    display_fields() {
      if (!this.meta?.fields) return [];

      return this.meta.fields.filter((f) => !["_id", "password", "token"].includes(f.name));
    },

    /**
     * Transform entities into calendar events
     * @returns {Array} Calendar event objects
     */
    calendar_events() {
      if (!this.items?.length || !this.date_field) return [];

      return this.items
        .filter((item) => item[this.date_field])
        .map((item) => {
          const start = this.parse_date(item[this.date_field]);
          const end = this.endDateField && item[this.endDateField] ? this.parse_date(item[this.endDateField]) : start;

          return {
            name: this.get_entity_title(item),
            start,
            end,
            color: this.get_event_color(item),
            entity: item,
          };
        });
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
     * Parse date string to YYYY-MM-DD format
     * @param {string|Date} date_value - Date value
     * @returns {string} Formatted date
     */
    parse_date(date_value) {
      if (!date_value) return "";

      const date = new Date(date_value);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
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

      // Auto-detect: use first string field or _id
      if (this.meta?.fields) {
        const string_field = this.meta.fields.find((f) => f.type === "string" && entity[f.name]);
        if (string_field) {
          return String(entity[string_field.name]);
        }
      }

      return entity._id?.toString() || "Untitled";
    },

    /**
     * Get event color from custom function or default
     * @param {Object} entity - Entity object
     * @returns {string} Color value
     */
    get_event_color(entity) {
      if (this.colorFunction) {
        return this.colorFunction(entity);
      }
      return "primary";
    },

    /**
     * Event color getter for v-calendar
     * @param {Object} event - Calendar event
     * @returns {string} Color value
     */
    getEventColor(event) {
      return event.color || "primary";
    },

    /**
     * Show event details dialog
     * @param {Object} param - Event parameters
     */
    showEvent({ event }) {
      this.selected_event = event;
      this.selected_entity = event.entity;
      this.dialog = true;
    },

    /**
     * Switch to day view
     * @param {Object} param - Date parameters
     */
    viewDay({ date }) {
      this.focus = date;
      this.calendar_type = "day";
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

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      return String(value);
    },

    /**
     * Emit edit event
     */
    editEntity() {
      this.$emit("edit", this.selected_entity);
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
.v-calendar >>> .v-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 2px;
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
}
</style>
