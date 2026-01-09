<template>
  <v-dialog v-model="dialog" max-width="600">
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs">
        <v-btn text v-bind="attrs" v-on="on">
          <v-icon left>mdi-export</v-icon>
          {{ $t("export") }}
        </v-btn>
      </slot>
    </template>

    <v-card>
      <v-card-title>{{ $t("export") }} {{ entity_label }}</v-card-title>

      <v-card-text>
        <v-select v-model="selected_fields" :items="available_fields" :label="$t('select_fields')" multiple chips deletable-chips></v-select>

        <v-select v-model="export_format" :items="format_options" :label="$t('format')"></v-select>

        <div class="text-caption grey--text">{{ items_count }} {{ $t("entities_to_export") }}</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false">{{ $t("cancel") }}</v-btn>
        <v-btn color="primary" :loading="exporting" @click="performExport">
          {{ $t("export") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * BulkExportDialog Component
 *
 * Flexible export with field selection.
 */
import meta from "../mixins/meta";
import * as XLSX from "xlsx";

export default {
  name: "BulkExportDialog",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
  },

  data() {
    return {
      dialog: false,
      selected_fields: [],
      export_format: "xlsx",
      format_options: [
        { text: "Excel (.xlsx)", value: "xlsx" },
        { text: "CSV", value: "csv" },
        { text: "JSON", value: "json" },
      ],
      exporting: false,
    };
  },

  computed: {
    available_fields() {
      return this.meta?.fields?.map((f) => ({ text: f.label || f.name, value: f.name })) || [];
    },

    items_count() {
      return this.items?.length || 0;
    },
  },

  async mounted() {
    await this.load_meta();
    this.selected_fields = this.available_fields.map((f) => f.value);
  },

  methods: {
    performExport() {
      this.exporting = true;
      const data = this.items.map((item) => {
        const row = {};
        this.selected_fields.forEach((field) => {
          row[field] = item[field];
        });
        return row;
      });

      if (this.export_format === "json") {
        this.downloadJSON(data);
      } else if (this.export_format === "csv") {
        this.downloadCSV(data);
      } else {
        this.downloadExcel(data);
      }

      this.exporting = false;
      this.dialog = false;
    },

    downloadExcel(data) {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.entity);
      XLSX.writeFile(wb, `${this.entity}_export.xlsx`);
    },

    downloadCSV(data) {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv" });
      this.downloadBlob(blob, `${this.entity}_export.csv`);
    },

    downloadJSON(data) {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      this.downloadBlob(blob, `${this.entity}_export.json`);
    },

    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>
