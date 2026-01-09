<template>
  <v-card>
    <v-card-title>{{ $t("audit_log") }}</v-card-title>

    <v-card-text>
      <v-timeline v-if="audit_entries.length > 0" dense>
        <v-timeline-item v-for="(entry, index) in audit_entries" :key="index" :color="get_action_color(entry.action)" small>
          <template #opposite>
            <span class="text-caption">{{ format_date(entry.timestamp) }}</span>
          </template>

          <v-card>
            <v-card-text class="pa-2">
              <div class="text-subtitle-2">
                <v-chip x-small :color="get_action_color(entry.action)" class="mr-2">
                  {{ entry.action }}
                </v-chip>
                {{ entry.user }}
              </div>

              <v-expansion-panels v-if="entry.changes" flat class="mt-2">
                <v-expansion-panel>
                  <v-expansion-panel-header class="pa-0 text-caption"> {{ Object.keys(entry.changes).length }} {{ $t("fields_changed") }} </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div v-for="(change, field) in entry.changes" :key="field" class="text-caption">
                      <strong>{{ field }}:</strong>
                      <span class="error--text">{{ change.old }}</span> →
                      <span class="success--text">{{ change.new }}</span>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <div v-else class="text-center grey--text">{{ $t("no_audit_history") }}</div>
    </v-card-text>
  </v-card>
</template>

<script>
/**
 * EntityAuditLog Component
 *
 * Displays create/update/delete history for entities.
 */
export default {
  name: "EntityAuditLog",

  props: {
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
  },

  data() {
    return {
      audit_entries: [],
      loading: false,
    };
  },

  async mounted() {
    await this.load_audit_log();
  },

  methods: {
    async load_audit_log() {
      this.loading = true;
      try {
        const response = await this.$axios.get(`/${this.entity}/${this.entityId}/audit`);
        this.audit_entries = response.data;
      } catch (error) {
        console.error("Failed to load audit log:", error);
      } finally {
        this.loading = false;
      }
    },

    get_action_color(action) {
      const colors = {
        create: "success",
        update: "primary",
        delete: "error",
      };
      return colors[action] || "grey";
    },

    format_date(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
};
</script>
