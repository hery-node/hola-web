<template>
  <div class="file-upload-field">
    <v-file-input v-model="files" :label="field_label" :accept="accepted_types" :multiple="is_multiple" :loading="uploading" :disabled="disabled" :error-messages="error_messages" :hint="hint_text" persistent-hint show-size prepend-icon="mdi-paperclip" @change="handleFileChange">
      <template #selection="{ text }">
        <v-chip small label color="primary">
          {{ text }}
        </v-chip>
      </template>
    </v-file-input>

    <!-- File Previews -->
    <div v-if="preview_items.length > 0" class="mt-2">
      <v-card v-for="(item, index) in preview_items" :key="index" class="mb-2" outlined>
        <v-row no-gutters align="center">
          <v-col v-if="item.is_image" cols="auto">
            <v-img :src="item.url" max-width="100" max-height="100" class="ma-2" contain></v-img>
          </v-col>
          <v-col v-else cols="auto">
            <v-icon large class="ma-2">{{ get_file_icon(item.type) }}</v-icon>
          </v-col>
          <v-col>
            <div class="px-2">
              <div class="text-subtitle-2">{{ item.name }}</div>
              <div class="text-caption grey--text">{{ format_size(item.size) }}</div>
              <v-progress-linear v-if="item.progress !== null" :value="item.progress" height="4" class="mt-1"></v-progress-linear>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn icon @click="removeFile(index)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Uploaded Files List -->
    <div v-if="uploaded_files.length > 0" class="mt-2">
      <div class="text-caption grey--text mb-1">{{ $t("uploaded_files") }}</div>
      <v-chip v-for="(file, index) in uploaded_files" :key="index" class="mr-1 mb-1" small close @click:close="removeUploadedFile(index)">
        <v-icon small left>{{ get_file_icon(file.content_type) }}</v-icon>
        {{ file.filename }}
      </v-chip>
    </div>
  </div>
</template>

<script>
/**
 * FileUploadField Component
 *
 * Meta-aware file upload component for entity fields.
 * Integrates with GridFS backend for file storage.
 *
 * Features:
 * - Reads field metadata (max size, allowed types, multiple)
 * - Image and document preview
 * - Upload progress indicators
 * - File type and size validation
 * - GridFS integration
 * - Multiple file upload support
 *
 * Props:
 * @prop {string} fieldName - Field name from entity metadata (required)
 * @prop {Object} fieldConfig - Field configuration from metadata
 * @prop {Array|Object} value - Current field value (file IDs)
 * @prop {boolean} disabled - Disable input (default: false)
 * @prop {Function} uploadFunction - Custom upload function (file) => Promise<file_id>
 *
 * Events:
 * @event input - Emitted when files uploaded { file_ids }
 * @event error - Emitted on upload error { error }
 */
export default {
  name: "FileUploadField",

  props: {
    fieldName: { type: String, required: true },
    fieldConfig: { type: Object, default: () => ({}) },
    value: { type: [Array, Object, String], default: null },
    disabled: { type: Boolean, default: false },
    uploadFunction: { type: Function, default: null },
  },

  data() {
    return {
      files: null,
      uploading: false,
      preview_items: [],
      uploaded_files: [],
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
     * Check if field allows multiple files
     * @returns {boolean} Is multiple
     */
    is_multiple() {
      return this.fieldConfig?.multiple === true;
    },

    /**
     * Get accepted file types from metadata
     * @returns {string} Accepted types
     */
    accepted_types() {
      if (this.fieldConfig?.accept) {
        return Array.isArray(this.fieldConfig.accept) ? this.fieldConfig.accept.join(",") : this.fieldConfig.accept;
      }
      return "*";
    },

    /**
     * Get max file size from metadata
     * @returns {number} Max size in bytes
     */
    max_size() {
      return this.fieldConfig?.max_size || 10 * 1024 * 1024; // 10MB default
    },

    /**
     * Get hint text for file input
     * @returns {string} Hint text
     */
    hint_text() {
      const parts = [];

      if (this.accepted_types && this.accepted_types !== "*") {
        parts.push(`${this.$t("accepted")}: ${this.accepted_types}`);
      }

      parts.push(`${this.$t("max_size")}: ${this.format_size(this.max_size)}`);

      return parts.join(" | ");
    },
  },

  watch: {
    /**
     * Load existing files when value changes
     */
    value: {
      immediate: true,
      handler(new_value) {
        if (new_value) {
          this.load_existing_files(new_value);
        }
      },
    },
  },

  methods: {
    /**
     * Handle file input change
     * @param {File|File[]} selected_files - Selected files
     */
    async handleFileChange(selected_files) {
      if (!selected_files) return;

      this.error_messages = [];
      const files_array = Array.isArray(selected_files) ? selected_files : [selected_files];

      // Validate files
      const validation_errors = this.validate_files(files_array);
      if (validation_errors.length > 0) {
        this.error_messages = validation_errors;
        this.files = null;
        return;
      }

      // Create previews
      this.preview_items = await Promise.all(files_array.map((file) => this.create_preview(file)));

      // Upload files
      await this.upload_files(files_array);
    },

    /**
     * Validate files against metadata constraints
     * @param {File[]} files_array - Files to validate
     * @returns {string[]} Validation errors
     */
    validate_files(files_array) {
      const errors = [];

      // Check multiple constraint
      if (!this.is_multiple && files_array.length > 1) {
        errors.push(this.$t("only_single_file_allowed"));
      }

      // Check size constraint
      files_array.forEach((file) => {
        if (file.size > this.max_size) {
          errors.push(`${file.name}: ${this.$t("file_too_large")} (${this.format_size(file.size)} > ${this.format_size(this.max_size)})`);
        }
      });

      // Check type constraint
      if (this.accepted_types && this.accepted_types !== "*") {
        const accepted_array = this.accepted_types.split(",").map((t) => t.trim());
        files_array.forEach((file) => {
          const matches = accepted_array.some((accept) => {
            if (accept.startsWith(".")) {
              return file.name.toLowerCase().endsWith(accept.toLowerCase());
            }
            return file.type.match(accept.replace("*", ".*"));
          });

          if (!matches) {
            errors.push(`${file.name}: ${this.$t("invalid_file_type")}`);
          }
        });
      }

      return errors;
    },

    /**
     * Create preview object for file
     * @param {File} file - File object
     * @returns {Promise<Object>} Preview object
     */
    async create_preview(file) {
      const is_image = file.type.startsWith("image/");
      let url = null;

      if (is_image) {
        url = await this.read_file_as_data_url(file);
      }

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        is_image,
        url,
        progress: 0,
      };
    },

    /**
     * Read file as data URL for preview
     * @param {File} file - File object
     * @returns {Promise<string>} Data URL
     */
    read_file_as_data_url(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    },

    /**
     * Upload files to server
     * @param {File[]} files_array - Files to upload
     */
    async upload_files(files_array) {
      this.uploading = true;

      try {
        const upload_promises = files_array.map(async (file, index) => {
          if (this.uploadFunction) {
            const file_id = await this.uploadFunction(file, (progress) => {
              this.preview_items[index].progress = progress;
            });
            return { filename: file.name, content_type: file.type, _id: file_id };
          } else {
            // Default GridFS upload (requires axios setup)
            return await this.upload_to_gridfs(file, index);
          }
        });

        const uploaded = await Promise.all(upload_promises);
        this.uploaded_files.push(...uploaded);

        // Emit uploaded file IDs
        const file_ids = uploaded.map((f) => f._id);
        this.$emit("input", this.is_multiple ? file_ids : file_ids[0]);

        // Clear previews after successful upload
        this.preview_items = [];
        this.files = null;
      } catch (error) {
        this.error_messages = [error.message || this.$t("upload_failed")];
        this.$emit("error", error);
      } finally {
        this.uploading = false;
      }
    },

    /**
     * Upload file to GridFS
     * @param {File} file - File object
     * @param {number} index - Preview item index
     * @returns {Promise<Object>} Uploaded file info
     */
    async upload_to_gridfs(file, index) {
      const form_data = new FormData();
      form_data.append("file", file);

      const response = await this.$axios.post("/gridfs/upload", form_data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progress_event) => {
          const progress = Math.round((progress_event.loaded * 100) / progress_event.total);
          this.preview_items[index].progress = progress;
        },
      });

      return response.data;
    },

    /**
     * Load existing uploaded files
     * @param {string|string[]|Object|Object[]} file_data - File IDs or objects
     */
    async load_existing_files(file_data) {
      if (!file_data) return;

      const files_array = Array.isArray(file_data) ? file_data : [file_data];

      this.uploaded_files = files_array.map((item) => {
        if (typeof item === "string") {
          return { _id: item, filename: item, content_type: "" };
        }
        return item;
      });
    },

    /**
     * Remove file from preview
     * @param {number} index - File index
     */
    removeFile(index) {
      this.preview_items.splice(index, 1);

      if (this.preview_items.length === 0) {
        this.files = null;
      }
    },

    /**
     * Remove uploaded file
     * @param {number} index - File index
     */
    removeUploadedFile(index) {
      this.uploaded_files.splice(index, 1);

      const file_ids = this.uploaded_files.map((f) => f._id);
      this.$emit("input", this.is_multiple ? file_ids : file_ids[0] || null);
    },

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    format_size(bytes) {
      if (bytes === 0) return "0 B";

      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },

    /**
     * Get icon for file type
     * @param {string} content_type - MIME type
     * @returns {string} Icon name
     */
    get_file_icon(content_type) {
      if (!content_type) return "mdi-file";

      if (content_type.startsWith("image/")) return "mdi-file-image";
      if (content_type.startsWith("video/")) return "mdi-file-video";
      if (content_type.startsWith("audio/")) return "mdi-file-music";
      if (content_type.includes("pdf")) return "mdi-file-pdf-box";
      if (content_type.includes("word")) return "mdi-file-word";
      if (content_type.includes("excel") || content_type.includes("spreadsheet")) {
        return "mdi-file-excel";
      }
      if (content_type.includes("zip") || content_type.includes("compressed")) {
        return "mdi-folder-zip";
      }

      return "mdi-file-document";
    },
  },
};
</script>

<style scoped>
.file-upload-field {
  width: 100%;
}
</style>
