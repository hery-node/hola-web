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
import DataList from "./DataList.vue";
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

// Meta-integrated components (Phase 2.3)
import EntityCalendarView from "./EntityCalendarView.vue";
import EntityTimelineView from "./EntityTimelineView.vue";
import EntityTreeView from "./EntityTreeView.vue";
import EntityKanbanView from "./EntityKanbanView.vue";
import FileUploadField from "./FileUploadField.vue";
import RelationshipPicker from "./RelationshipPicker.vue";
import EntityGalleryView from "./EntityGalleryView.vue";
import EntityCompareView from "./EntityCompareView.vue";
import AdvancedFilterBuilder from "./AdvancedFilterBuilder.vue";
import EntitySearchView from "./EntitySearchView.vue";
import BulkActionsToolbar from "./BulkActionsToolbar.vue";
import BulkImportDialog from "./BulkImportDialog.vue";
import BulkExportDialog from "./BulkExportDialog.vue";
import EntityWizard from "./EntityWizard.vue";
import EntityAuditLog from "./EntityAuditLog.vue";
import EntityNotifications from "./EntityNotifications.vue";

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
  Vue.component("h-list", DataList);
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

  // Meta-integrated components (Phase 2.3)
  Vue.component("h-calendar", EntityCalendarView);
  Vue.component("h-timeline", EntityTimelineView);
  Vue.component("h-tree", EntityTreeView);
  Vue.component("h-kanban", EntityKanbanView);
  Vue.component("h-file", FileUploadField);
  Vue.component("h-relationship", RelationshipPicker);
  Vue.component("h-gallery", EntityGalleryView);
  Vue.component("h-compare-view", EntityCompareView);
  Vue.component("h-filter-builder", AdvancedFilterBuilder);
  Vue.component("h-search", EntitySearchView);
  Vue.component("h-bulk-actions", BulkActionsToolbar);
  Vue.component("h-import", BulkImportDialog);
  Vue.component("h-export", BulkExportDialog);
  Vue.component("h-wizard", EntityWizard);
  Vue.component("h-audit", EntityAuditLog);
  Vue.component("h-notifications", EntityNotifications);
}

const capitalize = (str) => {
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] && words[i].trim().length > 0 && (words[i] = words[i][0].toUpperCase() + words[i].substr(1));
  }
  return words.join(" ");
}

export { capitalize, setup_components, save_value, get_value, sum_data, append_data, merge_chart_data, init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, read_property, list_entity, query_entity, delete_entity, get_ref_labels, get_entity_meta, register_type, get_type, no_value, is_int };
