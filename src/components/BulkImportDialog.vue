<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs">
        <v-btn color="primary" v-bind="attrs" v-on="on">
          <v-icon left>mdi-file-import</v-icon>
          {{ $t("import") }}
        </v-btn>
      </slot>
    </template>

    <v-card>
      <v-card-title>{{ $t("import") }} {{ entity_label }}</v-card-title>

      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1">{{ $t("upload_file") }}</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">{{ $t("map_fields") }}</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">{{ $t("preview_import") }}</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Step 1: Upload -->
          <v-stepper-content step="1">
            <v-file-input v-model="file" accept=".csv,.xlsx,.xls" :label="$t('select_file')" prepend-icon="mdi-file-excel" @change="parseFile"></v-file-input>
            <v-btn text @click="downloadTemplate">
              <v-icon left>mdi-download</v-icon>
              {{ $t("download_template") }}
            </v-btn>
          </v-stepper-content>

          <!-- Step 2: Map Fields -->
          <v-stepper-content step="2">
            <div v-for="column in file_columns" :key="column" class="mb-2">
              <v-select v-model="field_mapping[column]" :items="entity_fields" :label="`${$t('map')} '${column}'`" clearable></v-select>
            </div>
            <v-btn color="primary" @click="step = 3">{{ $t("next") }}</v-btn>
          </v-stepper-content>

          <!-- Step 3: Preview -->
          <v-stepper-content step="3">
            <v-data-table :headers="preview_headers" :items="preview_items.slice(0, 10)" dense></v-data-table>
            <div class="mt-2">
              <strong>{{ preview_items.length }}</strong> {{ $t("rows_to_import") }}
            </div>
            <v-btn color="primary" :loading="importing" @click="performImport">
              {{ $t("import") }}
            </v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false">{{ $t("close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * BulkImportDialog Component
 *
 * CSV/Excel import with automatic field mapping.
 */
import meta from "../mixins/meta";
import * as XLSX from "xlsx";

export default {
  name: "BulkImportDialog",
  mixins: [meta],

  data() {
    return {
      dialog: false,
      step: 1,
      file: null,
      file_columns: [],
      field_mapping: {},
      preview_items: [],
      importing: false,
    };
  },

  computed: {
    entity_fields() {
      return this.meta?.fields?.map((f) => ({ text: f.label || f.name, value: f.name })) || [];
    },

    preview_headers() {
      return Object.entries(this.field_mapping)
        .filter(([, field]) => field)
        .map(([column, field]) => ({ text: field, value: column }));
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    parseFile() {
      if (!this.file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        this.file_columns = Object.keys(json[0] || {});
        this.preview_items = json;
        this.auto_map_fields();
        this.step = 2;
      };
      reader.readAsArrayBuffer(this.file);
    },

    auto_map_fields() {
      this.file_columns.forEach((column) => {
        const match = this.meta?.fields?.find((f) => f.name.toLowerCase() === column.toLowerCase() || f.label?.toLowerCase() === column.toLowerCase());
        if (match) {
          this.field_mapping[column] = match.name;
        }
      });
    },

    async performImport() {
      this.importing = true;
      const mapped_items = this.preview_items.map((row) => {
        const entity = {};
        Object.entries(this.field_mapping).forEach(([column, field]) => {
          if (field && row[column] !== undefined) {
            entity[field] = row[column];
          }
        });
        return entity;
      });

      try {
        await this.$axios.post(`/${this.entity}/bulk`, mapped_items);
        this.$emit("imported", mapped_items.length);
        this.dialog = false;
      } catch (error) {
        console.error("Import error:", error);
      } finally {
        this.importing = false;
      }
    },

    downloadTemplate() {
      const headers = this.meta?.fields?.map((f) => f.name) || [];
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.entity);
      XLSX.writeFile(wb, `${this.entity}_template.xlsx`);
    },
  },
};
</script>
