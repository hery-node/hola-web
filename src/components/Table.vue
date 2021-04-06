<template>
  <div>
    <h-search :entity="entity" v-if="has_search" @clear="clear_search" @search="do_search" :cols="search_cols" :title="search_title" :clear_label="search_clear_label" :search_label="search_search_label" :fields="search_fields"></h-search>
    <v-divider class="mt-5"></v-divider>
    <v-data-table v-bind="$attrs" v-on="$listeners" :mobile-breakpoint="turn_off_mobile ? 10 : 600" :headers="table_headers" :items="items" :loading="loading" multi-sort v-model="selected" :options.sync="options" :server-items-length="total" item-key="_id" class="elevation-0" :hide-default-footer="!pagination">
      <template v-slot:top>
        <v-alert v-model="alert.shown" :type="alert.type" dismissible><span v-html="alert.msg"></span></v-alert>
      </template>

      <template v-if="!pagination" v-slot:[`item.${intersect}`]="{ item }">
        <v-row justify="center" align="center">
          <template v-if="item._last === true">
            <span class="ma-1" v-intersect="infinite_scroll">
              {{ item[intersect] }}
            </span>
          </template>
          <template v-else>
            {{ item[intersect] }}
          </template>
        </v-row>
      </template>

      <template v-slot:no-data>
        <span>{{ $t("table.no_data") }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { get_type } from "./type";
import { SUCCESS } from "../plugins/constant";

export default {
  inheritAttrs: false,

  props: {
    //required attributes
    entity: { type: String, required: true },
    headers: { type: Array, required: true },
    sort_desc: { type: Array, required: true },
    sort_key: { type: Array, required: true },
    //end
    //has search form or not
    has_search: { type: Boolean, default: true },
    //turn off table in mobile list mode
    turn_off_mobile: { type: Boolean, default: true },
    interval: { type: Number, default: -1 },
    header_width: { type: String, default: "120px" },
    header_align: { type: String, default: "center" },
    intersect: { type: String },

    //attributes for search form
    //colspan for the field
    search_cols: { type: Number, default: 4 },
    //form title
    search_title: { type: String },
    //label for clear and search button
    search_clear_label: { type: String },
    search_search_label: { type: String },
    //the fields of the entity
    search_fields: { type: Array, default: () => [] },
  },

  data() {
    return {
      interval_instance: undefined,
      loading: false,
      total: 0,
      next_page: 1,
      items: [],
      selected: [],
      search_form: {},
      options: {},
      alert: {
        shown: false,
        type: "warning",
        msg: "",
      },
      //used to cache field meta info
      cached_fields: [],
    };
  },

  watch: {
    options: {
      handler() {
        this.loading = true;
        this.items = [];
        this.next_page = 1;
        this.load_data();
      },
      deep: true,
    },
  },

  mounted() {
    if (this.interval > 0 && this.pagination) {
      this.interval_instance = setInterval(this.load_data, this.interval * 1000);
    }
  },

  beforeDestroy() {
    if (this.interval_instance) {
      clearInterval(this.interval_instance);
    }
  },

  computed: {
    pagination() {
      return !this.intersect;
    },

    table_headers() {
      for (let i = 0; i < this.headers.length; i++) {
        const header = this.headers[i];
        if (!header.width) {
          header.width = this.header_width;
        }
        if (!header.align) {
          header.align = this.align;
        }
        const label = this.$t(this.entity + "." + header.name);
        header.text = label;
        header.value = header.name;
      }
      return this.headers;
    },

    toolbar_class() {
      if (this.searchable) {
        return "mr-6 d-none d-md-flex d-lg-flex";
      } else {
        return "mr-6";
      }
    },
  },

  methods: {
    show_error(msg) {
      this.show_alert("error", msg, true);
    },

    show_success(msg) {
      this.show_alert("success", msg, true);
    },

    show_alert(type, msg, auto_hide) {
      this.alert.shown = true;
      this.alert.type = type;
      this.alert.msg = msg;
      if (auto_hide) {
        setTimeout(() => (this.alert.shown = false), 5000);
      }
    },

    infinite_scroll(entries) {
      const intersection = entries[0].intersectionRatio > 0;

      if (this.items.length < this.total && intersection && !entries[0].target.page) {
        entries[0].target.page = this.next_page;
        setTimeout(() => {
          this.load_data();
        }, 500);
      }
    },

    clear_search() {
      this.search_form = {};
      this.items = [];
      this.load_data();
    },

    do_search(form) {
      this.search_form = form;
      this.items = [];
      this.load_data();
    },

    load_fields() {
      if (this.cached_fields.length > 0) {
        return new Promise((resolve) => {
          resolve(this.cached_fields);
        });
      }

      return this.$get_visible_fields(this.entity).then((result) => {
        const server_fields = result.data;
        const all_fields = this.headers.length > 0 ? this.headers : server_fields;

        for (let i = 0; i < all_fields.length; i++) {
          const [server_field] = server_fields.filter((f) => f.name === all_fields[i].name);
          if (!server_field) {
            throw new Error("entity:" + this.entity + ",header index:" + i + " and header name:" + all_fields[i].name + " no matched server field");
          }

          const field = { ...all_fields[i], ...server_field };
          all_fields[i] = field;

          const type = get_type(field.type);
          if (!type) {
            throw new Error("no type found for [" + field.type + "] in header:" + field.name + " of entity:" + this.entity);
          }
          if (type.format) {
            field.format = type.format;
          }
        }
        this.cached_fields = all_fields;
        return all_fields;
      });
    },

    load_data() {
      this.load_fields().then((fields) => {
        this.loading = true;
        const { page, sortBy, sortDesc, itemsPerPage } = this.options;
        const sort_by = sortBy && sortBy.length > 0 ? sortBy.join(",") : this.sort_key.join(",");
        const desc = sortDesc && sortDesc.length > 0 ? sortDesc.join(",") : this.sort_desc.join(",");
        const attr_names = fields.map((h) => h.name).join(",");
        const params = { attr_names: attr_names, limit: itemsPerPage, sort_by: sort_by, desc: desc };

        if (this.pagination) {
          params.page = page;
        } else {
          params.page = this.next_page;
        }

        this.$read(this.entity, this.search_form, params).then((result) => {
          this.loading = false;
          if (result.code === SUCCESS) {
            const { total, data } = result;
            this.total = total;
            if (data.length > 0) {
              data[data.length - 1]._last = true;

              for (let i = 0; i < data.length; i++) {
                const obj = data[i];
                for (let j = 0; j < fields.length; j++) {
                  const field = fields[j];
                  if (field.format) {
                    obj[field.name] = field.format(this, obj[field.name]);
                  }
                }
              }
              this.items.push(...data);
              this.next_page++;
            }
          }
        });
      });
    },
  },
};
</script>
