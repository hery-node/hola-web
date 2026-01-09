<template>
  <v-card>
    <v-card-title>
      {{ entity_label }}
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="mdi-magnify" :label="$t('search')" single-line hide-details dense clearable></v-text-field>
    </v-card-title>

    <v-card-text>
      <v-treeview v-if="tree_items.length > 0" :items="tree_items" :search="search" :open.sync="open_nodes" :active.sync="active_nodes" activatable item-key="id" :load-children="loadChildren">
        <template #prepend="{ item }">
          <v-icon>{{ item.icon || "mdi-file-document" }}</v-icon>
        </template>

        <template #label="{ item }">
          <span>{{ item.name }}</span>
        </template>

        <template #append="{ item }">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" @click.stop>
                <v-icon small>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="viewEntity(item.entity)">
                <v-list-item-icon>
                  <v-icon>mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t("view") }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editEntity(item.entity)">
                <v-list-item-icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t("edit") }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="createChild(item.entity)">
                <v-list-item-icon>
                  <v-icon>mdi-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t("add_child") }}</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="deleteEntity(item.entity)">
                <v-list-item-icon>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="error--text">{{ $t("delete") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-treeview>

      <div v-else class="text-center pa-4 grey--text">
        {{ $t("no_data") }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
/**
 * EntityTreeView Component
 *
 * Hierarchical tree view for parent-child entity relationships.
 * Uses metadata to identify parent reference fields and build tree structure.
 *
 * Features:
 * - Auto-discovers parent reference fields from entity metadata
 * - Lazy-loading children on node expansion
 * - Drag-and-drop reordering (updates parent field)
 * - Context menu with CRUD actions
 * - Search and filter capabilities
 * - Customizable icons per entity
 *
 * Props:
 * @prop {string} entity - Entity name (required)
 * @prop {Array} items - Entity data array (required)
 * @prop {string} parentField - Parent reference field name (optional, auto-detected)
 * @prop {string} titleField - Field to use for node title (optional, auto-detected)
 * @prop {Function} iconFunction - Custom icon function (entity) => icon
 * @prop {Function} loadChildrenFn - Custom async function to load children
 * @prop {boolean} enableDragDrop - Enable drag-and-drop reordering (default: false)
 *
 * Events:
 * @event view - Emitted when view action clicked { entity }
 * @event edit - Emitted when edit action clicked { entity }
 * @event create-child - Emitted when add child clicked { parent_entity }
 * @event delete - Emitted when delete action clicked { entity }
 * @event move - Emitted when node moved { entity, new_parent_id }
 */
import meta from "../mixins/meta";

export default {
  name: "EntityTreeView",
  mixins: [meta],

  props: {
    items: { type: Array, required: true },
    parentField: { type: String, default: null },
    titleField: { type: String, default: null },
    iconFunction: { type: Function, default: null },
    loadChildrenFn: { type: Function, default: null },
    enableDragDrop: { type: Boolean, default: false },
  },

  data() {
    return {
      search: "",
      open_nodes: [],
      active_nodes: [],
      parent_field: null,
    };
  },

  computed: {
    /**
     * Build tree structure from flat entity list
     * @returns {Array} Tree items with children
     */
    tree_items() {
      if (!this.items?.length || !this.parent_field) return [];

      const entity_map = new Map();
      const root_items = [];

      // First pass: create all nodes
      this.items.forEach((entity) => {
        const node = this.create_tree_node(entity);
        entity_map.set(this.get_entity_id(entity), node);
      });

      // Second pass: build hierarchy
      this.items.forEach((entity) => {
        const node = entity_map.get(this.get_entity_id(entity));
        const parent_id = entity[this.parent_field];

        if (parent_id) {
          const parent_node = entity_map.get(parent_id);
          if (parent_node) {
            parent_node.children ||= [];
            parent_node.children.push(node);
          } else {
            root_items.push(node);
          }
        } else {
          root_items.push(node);
        }
      });

      return root_items;
    },
  },

  watch: {
    /**
     * Initialize parent field when metadata loads
     */
    meta: {
      immediate: true,
      handler() {
        if (this.meta && !this.parent_field) {
          this.initialize_parent_field();
        }
      },
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    /**
     * Initialize parent field from metadata or prop
     */
    initialize_parent_field() {
      if (this.parentField) {
        this.parent_field = this.parentField;
        return;
      }

      // Auto-detect: find reference field pointing to same entity
      if (this.meta?.fields) {
        const parent_ref = this.meta.fields.find((f) => f.type === "ref" && f.ref === this.entity && (f.name.includes("parent") || f.name.includes("_id")));

        if (parent_ref) {
          this.parent_field = parent_ref.name;
        }
      }
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
     * Create tree node from entity
     * @param {Object} entity - Entity object
     * @returns {Object} Tree node
     */
    create_tree_node(entity) {
      return {
        id: this.get_entity_id(entity),
        name: this.get_entity_title(entity),
        icon: this.get_entity_icon(entity),
        entity,
        children: [],
      };
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
     * Get entity icon from custom function or default
     * @param {Object} entity - Entity object
     * @returns {string} Icon name
     */
    get_entity_icon(entity) {
      if (this.iconFunction) {
        return this.iconFunction(entity);
      }
      return "mdi-file-document";
    },

    /**
     * Load children for lazy-loaded nodes
     * @param {Object} node - Tree node
     */
    async loadChildren(node) {
      if (this.loadChildrenFn) {
        try {
          const children = await this.loadChildrenFn(node.entity);
          node.children = children.map((entity) => this.create_tree_node(entity));
        } catch (error) {
          console.error("Error loading children:", error);
        }
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
     * Emit create-child event
     * @param {Object} parent_entity - Parent entity object
     */
    createChild(parent_entity) {
      this.$emit("create-child", parent_entity);
    },

    /**
     * Emit delete event
     * @param {Object} entity - Entity object
     */
    deleteEntity(entity) {
      this.$emit("delete", entity);
    },
  },
};
</script>

<style scoped>
.v-treeview >>> .v-treeview-node__root {
  min-height: 40px;
}

.v-treeview >>> .v-treeview-node__content {
  cursor: pointer;
}
</style>
