import Vue from "vue";
import { save_value, get_value } from "../core/storage";
import { sum_data, append_data, merge_chart_data } from "../core/chart";
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

//chart and dashboard related views
import OffsetView from "./OffsetView.vue";
import CardView from "./CardView.vue";
import ChartView from "./ChartView.vue";
import ChartLineView from "./ChartLineView.vue";
import ChartBarView from "./ChartBarView.vue";
import ChartPieView from "./ChartPieView.vue";
import ChartComboView from "./ChartComboView.vue";
import ChartSimpleView from "./ChartSimpleView.vue";
import ChartDashboardView from "./ChartDashboardView.vue";
import DashboardTableView from "./DashboardTable.vue";

//mobile
import MobileMenu from "./MobileMenu.vue";

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
  Vue.component('h-chart', ChartView);
  Vue.component('h-line-chart', ChartLineView);
  Vue.component('h-bar-chart', ChartBarView);
  Vue.component('h-pie-chart', ChartPieView);
  Vue.component('h-combo-chart', ChartComboView);
  Vue.component('h-simple-chart', ChartSimpleView);
  Vue.component('h-dash-chart', ChartDashboardView);
  Vue.component('h-dash-table', DashboardTableView);
}

export { setup_components, save_value, get_value, sum_data, append_data, merge_chart_data, init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, read_property, list_entity, query_entity, delete_entity, get_ref_labels, get_entity_meta, register_type, get_type, no_value, is_int };
