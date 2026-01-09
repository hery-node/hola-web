<template>
  <v-card>
    <v-card-title>
      <v-autocomplete v-model="search_query" :items="search_results" :loading="searching" :search-input.sync="search_input" :label="$t('search_entities')" prepend-inner-icon="mdi-magnify" clearable hide-no-data hide-details return-object item-text="title" solo flat @change="handleResultSelect">
        <template #item="{ item }">
          <v-list-item-avatar>
            <v-icon>{{ get_entity_icon(item.entity_type) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle> {{ item.entity_type }} • {{ item.matches }} {{ $t("matches") }} </v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-card-title>

    <v-card-text v-if="has_results">
      <v-tabs v-model="active_tab">
        <v-tab v-for="entity_type in result_entity_types" :key="entity_type"> {{ entity_type }} ({{ get_results_count(entity_type) }}) </v-tab>
      </v-tabs>

      <v-tabs-items v-model="active_tab">
        <v-tab-item v-for="entity_type in result_entity_types" :key="entity_type">
          <v-list>
            <v-list-item v-for="(result, index) in get_results_for_entity(entity_type)" :key="index" @click="viewResult(result)">
              <v-list-item-content>
                <v-list-item-title>{{ result.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="result.snippet" v-html="result.snippet"></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click.stop="$emit('edit', result)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
/**
 * EntitySearchView Component
 *
 * Unified search across multiple entity types.
 * Provides full-text and field-specific search with faceted results.
 *
 * Props:
 * @prop {Array} entityTypes - Entity types to search (optional, searches all)
 * @prop {Function} searchFunction - Custom search function
 *
 * Events:
 * @event select - Emitted when result selected { entity, entity_type }
 * @event edit - Emitted when edit clicked { entity, entity_type }
 */
export default {
  name: "EntitySearchView",

  props: {
    entityTypes: { type: Array, default: () => [] },
    searchFunction: { type: Function, default: null },
  },

  data() {
    return {
      search_query: null,
      search_input: "",
      searching: false,
      search_results: [],
      grouped_results: {},
      active_tab: 0,
    };
  },

  computed: {
    has_results() {
      return Object.keys(this.grouped_results).length > 0;
    },

    result_entity_types() {
      return Object.keys(this.grouped_results);
    },
  },

  watch: {
    search_input(val) {
      if (val && val.length >= 2) {
        this.debounced_search(val);
      }
    },
  },

  methods: {
    async performSearch(query) {
      this.searching = true;
      try {
        let results;
        if (this.searchFunction) {
          results = await this.searchFunction(query);
        } else {
          results = await this.$axios.post("/search", {
            query,
            entities: this.entityTypes,
          });
          results = results.data;
        }

        this.grouped_results = this.group_by_entity(results);
        this.search_results = results.map((r) => ({
          ...r,
          value: r._id,
        }));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        this.searching = false;
      }
    },

    debounced_search: (function () {
      let timeout;
      return function (query) {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.performSearch(query), 300);
      };
    })(),

    group_by_entity(results) {
      const grouped = {};
      results.forEach((result) => {
        const type = result.entity_type;
        grouped[type] ||= [];
        grouped[type].push(result);
      });
      return grouped;
    },

    get_results_count(entity_type) {
      return this.grouped_results[entity_type]?.length || 0;
    },

    get_results_for_entity(entity_type) {
      return this.grouped_results[entity_type] || [];
    },

    get_entity_icon(entity_type) {
      const icons = {
        user: "mdi-account",
        task: "mdi-checkbox-marked",
        project: "mdi-folder",
      };
      return icons[entity_type] || "mdi-file-document";
    },

    handleResultSelect(result) {
      if (result) {
        this.$emit("select", result);
      }
    },

    viewResult(result) {
      this.$emit("select", result);
    },
  },
};
</script>
