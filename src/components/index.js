import Vue from "vue";
import Vuex from "vuex";
import VueI18n from "vue-i18n";
import VueRouter from "vue-router";

// Vuetify's related
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';
import "vuetify/dist/vuetify.min.css";
import 'chartist/dist/chartist.min.css'

import { register_echarts } from "../plugins/eschart";
import { register_type, get_type, no_value, is_int } from "../core/type";
import { init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, query_entity, read_property, list_entity, delete_entity, get_ref_labels, get_entity_meta } from "../core/axios";

import ArrayEntity from "./ArrayEntity.vue";
import ArrayTable from "./ArrayTable.vue";
import BasicForm from "./BasicForm.vue";
import BasicWindow from "./BasicWindow.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import CompareTable from "./CompareTable.vue";
import CompareEntity from "./CompareEntity.vue";
import SearchForm from "./SearchForm.vue";
import EditForm from "./EditForm.vue";
import DataTable from "./DataTable.vue";
import CrudTable from "./CrudTable.vue";
import PropertyTable from "./PropertyTable.vue";
import NavBar from "./NavBar.vue";

//mobile
import OffsetView from "./OffsetView.vue";
import CardView from "./CardView.vue";
import MobileMenu from "./MobileMenu.vue";

//chart related views
import ChartSimpleView from "./ChartSimpleView.vue";
import ChartLineView from "./ChartLineView.vue";
import ChartBarView from "./ChartBarView.vue";
import ChartPieView from "./ChartPieView.vue";
import ChartComboView from "./ChartComboView.vue";
import ChartDashboardView from "./ChartDashboardView.vue";
import DashboardTableView from "./DashboardTable.vue";

function load_locale_messages(locales) {
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages
}

function setup_plugins() {
  Vue.use(require('vue-chartist'));
  Vue.use(Vuex);
  Vue.use(VueI18n);
  Vue.use(VueRouter);
  Vue.use(Vuetify);
  register_echarts();
}

function setup_components() {
  Vue.component("h-array", ArrayTable);
  Vue.component("h-array-entity", ArrayEntity);
  Vue.component("h-confirm", ConfirmDialog);
  Vue.component("h-form", BasicForm);
  Vue.component("h-window", BasicWindow);
  Vue.component("h-compare", CompareTable);
  Vue.component("h-compare-entity", CompareEntity);
  Vue.component("h-search-form", SearchForm);
  Vue.component("h-edit-form", EditForm);
  Vue.component("h-table", DataTable);
  Vue.component("h-crud", CrudTable);
  Vue.component("h-property", PropertyTable);
  Vue.component("h-nav-bar", NavBar);
  Vue.component('h-offset', OffsetView);
  Vue.component('h-card', CardView);
  Vue.component('h-mobile-menu', MobileMenu);
  Vue.component('h-chart', ChartSimpleView);
  Vue.component('h-line-chart', ChartLineView);
  Vue.component('h-bar-chart', ChartBarView);
  Vue.component('h-pie-chart', ChartPieView);
  Vue.component('h-combo-chart', ChartComboView);
  Vue.component('h-dash-chart', ChartDashboardView);
  Vue.component('h-dash-table', DashboardTableView);
}

function make_dialog_movable() {
  // make vuetify dialogs movable
  const d = {};
  document.addEventListener("mousedown", (e) => {
    const closestDialog = e.target.closest(".v-dialog.v-dialog--active");
    if (e.button === 0 && closestDialog != null && e.target.classList.contains("v-toolbar__content")) {
      // element which can be used to move element
      d.el = closestDialog; // element which should be moved
      d.mouseStartX = e.clientX;
      d.mouseStartY = e.clientY;
      d.elStartX = d.el.getBoundingClientRect().left;
      d.elStartY = d.el.getBoundingClientRect().top;
      d.el.style.position = "fixed";
      d.el.style.margin = 0;
      d.oldTransition = d.el.style.transition;
      d.el.style.transition = "none";
    }
  });
  document.addEventListener("mousemove", (e) => {
    if (d.el === undefined) return;
    d.el.style.left = Math.min(Math.max(d.elStartX + e.clientX - d.mouseStartX, 0), window.innerWidth - d.el.getBoundingClientRect().width) + "px";
    d.el.style.top = Math.min(Math.max(d.elStartY + e.clientY - d.mouseStartY, 0), window.innerHeight - d.el.getBoundingClientRect().height) + "px";
  });
  document.addEventListener("mouseup", () => {
    if (d.el === undefined) return;
    d.el.style.transition = d.oldTransition;
    d.el = undefined;
  });
  setInterval(() => {
    // prevent out of bounds
    const dialog = document.querySelector(".v-dialog.v-dialog--active");
    if (dialog === null) return;
    dialog.style.left = Math.min(parseInt(dialog.style.left), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
    dialog.style.top = Math.min(parseInt(dialog.style.top), window.innerHeight - dialog.getBoundingClientRect().height) + "px";
  }, 100);
}

function init_vue_app(App, routes, vuetify_config, i18n_config, locales) {
  setup_plugins();

  const vuetify = new Vuetify({
    theme: {
      themes: {
        light: {
          primary: colors.cyan.darken2,
          progress: colors.red.darken2,
          tag: colors.red.darken1,
          secondary: colors.cyan.darken1,
          tertiary: '#495057',
          accent: '#82B1FF',
          error: colors.red.darken1,
          info: '#00d3ee',
          success: colors.cyan.darken1,
          create: colors.cyan.darken1,
          edit: colors.cyan.darken1,
          clone: colors.cyan.darken1,
          delete: colors.red.darken1,
          refresh: colors.green.darken1,
          warning: '#ffa21a',
          chart: colors.cyan.darken1,
          chart_title: colors.red.darken4,
          app_bar: colors.cyan.darken2,
          system_bar: '#FFFFFF',
          table_header: colors.cyan.lighten4,
          toolbar_icon: '#FFFFFF',
          chip: colors.cyan.darken1,
          bgcolor: colors.grey.lighten4,
          card: colors.cyan.darken1,
          back: colors.red.darken4,
          title_button: '#FFFFFF'
        }
      },
    }, ...vuetify_config
  });

  const i18n = new VueI18n({ locale: process.env.VUE_APP_I18N_LOCALE || 'en', fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en', messages: load_locale_messages(locales), ...i18n_config });
  const router = new VueRouter({ mode: "history", base: process.env.BASE_URL, routes });
  const store = new Vuex.Store({ state: {}, mutations: {}, actions: {}, modules: {} });
  setup_components();
  make_dialog_movable();

  return new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: (h) => h(App),
  }).$mount("#app");
}

export { init_vue_app, init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, read_property, list_entity, query_entity, delete_entity, get_ref_labels, get_entity_meta, register_type, get_type, no_value, is_int };
