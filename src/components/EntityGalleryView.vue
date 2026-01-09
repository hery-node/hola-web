<template>
  <v-card>
    <v-card-title>
      {{ entity_label }}
      <v-spacer></v-spacer>
      <v-select v-model="image_field" :items="image_field_options" :label="$t('image_field')" dense hide-details style="max-width: 200px"></v-select>
    </v-card-title>

    <v-card-text>
      <v-row v-if="gallery_items.length > 0">
        <v-col v-for="(item, index) in gallery_items" :key="index" :cols="grid_cols" :sm="grid_sm" :md="grid_md">
          <v-card hover @click="openLightbox(index)">
            <v-img :src="item.image_url" :aspect-ratio="aspect_ratio" class="grey lighten-2">
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>

              <v-overlay v-if="show_selection" absolute>
                <v-checkbox v-model="selected_items" :value="item.entity" @click.stop></v-checkbox>
              </v-overlay>
            </v-img>

            <v-card-text class="pa-2">
              <div class="text-subtitle-2 text-truncate">{{ item.title }}</div>
              <div v-if="caption_field" class="text-caption grey--text text-truncate">
                {{ item.caption }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div v-else class="text-center pa-4 grey--text">
        {{ $t("no_images") }}
      </div>
    </v-card-text>

    <v-card-actions v-if="show_selection && selected_items.length > 0">
      <span class="text-caption">{{ selected_items.length }} {{ $t("selected") }}</span>
      <v-spacer></v-spacer>
      <v-btn text color="error" @click="deleteSelected">
        <v-icon left>mdi-delete</v-icon>
        {{ $t("delete") }}
      </v-btn>
      <v-btn text @click="tagSelected">
        <v-icon left>mdi-tag</v-icon>
        {{ $t("tag") }}
      </v-btn>
    </v-card-actions>

    <!-- Lightbox Dialog -->
    <v-dialog v-model="lightbox_open" max-width="90vw">
      <v-card v-if="current_lightbox_item" dark>
        <v-card-text class="pa-0">
          <v-img :src="current_lightbox_item.image_url" max-height="80vh" contain></v-img>
        </v-card-text>

        <v-card-actions>
          <v-btn icon @click="previousImage">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <div class="text-center">
            <div class="text-h6">{{ current_lightbox_item.title }}</div>
            <div v-if="current_lightbox_item.caption" class="text-caption">
              {{ current_lightbox_item.caption }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon @click="nextImage">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon @click="lightbox_open = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
/**
 * EntityGalleryView Component
 *
 * Grid gallery view for entities with image fields.
 * Uses metadata to discover image fields and display entities as a photo gallery.
 *
 * Features:
 * - Auto-discovers image fields from entity metadata
 * - Responsive grid layout with customizable columns
 * - Lightbox view with keyboard navigation
 * - Batch operations (delete, tag)
 * - Selection mode for bulk actions
 * - Caption support from metadata fields
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {string} imageField - Image field name (optional, auto-detected)
 * @prop {string} titleField - Field to use for title (optional, auto-detected)
 * @prop {string} captionField - Field to use for caption (optional)
 * @prop {number} gridCols - Grid columns (xs) (default: 6)
 * @prop {number} gridSm - Grid columns (sm) (default: 4)
 * @prop {number} gridMd - Grid columns (md) (default: 3)
 * @prop {number} aspectRatio - Image aspect ratio (default: 1)
 * @prop {boolean} showSelection - Enable batch selection (default: false)
 *
 * Events:
 * @event delete - Emitted when delete action clicked { entities }
 * @event tag - Emitted when tag action clicked { entities }
 */
import meta from "../mixins/meta";

export default {
  name: "EntityGalleryView",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
    imageField: { type: String, default: null },
    titleField: { type: String, default: null },
    captionField: { type: String, default: null },
    gridCols: { type: Number, default: 6 },
    gridSm: { type: Number, default: 4 },
    gridMd: { type: Number, default: 3 },
    aspectRatio: { type: Number, default: 1 },
    showSelection: { type: Boolean, default: false },
  },

  data() {
    return {
      image_field: null,
      caption_field: null,
      lightbox_open: false,
      current_index: 0,
      selected_items: [],
    };
  },

  computed: {
    /**
     * Get image field options from metadata
     * @returns {Array} Image field options
     */
    image_field_options() {
      if (!this.meta?.fields) return [];

      return this.meta.fields
        .filter((f) => f.type === "image" || f.name.includes("image") || f.name.includes("photo") || f.name.includes("picture"))
        .map((f) => ({
          text: f.label || f.name,
          value: f.name,
        }));
    },

    /**
     * Transform entities into gallery items
     * @returns {Array} Gallery item objects
     */
    gallery_items() {
      if (!this.items?.length || !this.image_field) return [];

      return this.items
        .filter((item) => item[this.image_field])
        .map((entity) => ({
          entity,
          image_url: this.get_image_url(entity),
          title: this.get_entity_title(entity),
          caption: this.caption_field ? entity[this.caption_field] : null,
        }));
    },

    /**
     * Get current lightbox item
     * @returns {Object|null} Current item
     */
    current_lightbox_item() {
      return this.gallery_items[this.current_index] || null;
    },

    /**
     * Get grid column sizes
     * @returns {number} Grid cols
     */
    grid_cols() {
      return this.gridCols;
    },

    /**
     * Get grid column sizes for sm
     * @returns {number} Grid cols
     */
    grid_sm() {
      return this.gridSm;
    },

    /**
     * Get grid column sizes for md
     * @returns {number} Grid cols
     */
    grid_md() {
      return this.gridMd;
    },

    /**
     * Get aspect ratio
     * @returns {number} Aspect ratio
     */
    aspect_ratio() {
      return this.aspectRatio;
    },

    /**
     * Check if selection mode enabled
     * @returns {boolean} Show selection
     */
    show_selection() {
      return this.showSelection;
    },
  },

  watch: {
    /**
     * Initialize fields when metadata loads
     */
    meta: {
      immediate: true,
      handler() {
        if (this.meta && !this.image_field) {
          this.initialize_fields();
        }
      },
    },
  },

  async mounted() {
    await this.load_meta();
    this.setup_keyboard_navigation();
  },

  beforeDestroy() {
    this.cleanup_keyboard_navigation();
  },

  methods: {
    /**
     * Initialize image and caption fields from metadata or props
     */
    initialize_fields() {
      // Image field
      if (this.imageField) {
        this.image_field = this.imageField;
      } else {
        const image_fields = this.image_field_options;
        if (image_fields.length > 0) {
          this.image_field = image_fields[0].value;
        }
      }

      // Caption field
      if (this.captionField) {
        this.caption_field = this.captionField;
      }
    },

    /**
     * Get image URL from entity
     * @param {Object} entity - Entity object
     * @returns {string} Image URL
     */
    get_image_url(entity) {
      const image_value = entity[this.image_field];

      if (!image_value) return "";

      // If already a URL
      if (typeof image_value === "string" && image_value.startsWith("http")) {
        return image_value;
      }

      // If GridFS file ID
      if (typeof image_value === "string") {
        return `/gridfs/file/${image_value}`;
      }

      // If file object with _id
      if (image_value._id) {
        return `/gridfs/file/${image_value._id}`;
      }

      return "";
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
     * Open lightbox at specific index
     * @param {number} index - Image index
     */
    openLightbox(index) {
      this.current_index = index;
      this.lightbox_open = true;
    },

    /**
     * Navigate to previous image in lightbox
     */
    previousImage() {
      this.current_index = (this.current_index - 1 + this.gallery_items.length) % this.gallery_items.length;
    },

    /**
     * Navigate to next image in lightbox
     */
    nextImage() {
      this.current_index = (this.current_index + 1) % this.gallery_items.length;
    },

    /**
     * Setup keyboard navigation for lightbox
     */
    setup_keyboard_navigation() {
      this.keyboard_handler = (e) => {
        if (!this.lightbox_open) return;

        if (e.key === "ArrowLeft") {
          this.previousImage();
        } else if (e.key === "ArrowRight") {
          this.nextImage();
        } else if (e.key === "Escape") {
          this.lightbox_open = false;
        }
      };

      window.addEventListener("keydown", this.keyboard_handler);
    },

    /**
     * Cleanup keyboard navigation
     */
    cleanup_keyboard_navigation() {
      if (this.keyboard_handler) {
        window.removeEventListener("keydown", this.keyboard_handler);
      }
    },

    /**
     * Delete selected entities
     */
    deleteSelected() {
      this.$emit("delete", this.selected_items);
      this.selected_items = [];
    },

    /**
     * Tag selected entities
     */
    tagSelected() {
      this.$emit("tag", this.selected_items);
    },
  },
};
</script>

<style scoped>
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}
</style>
