import Vue from "vue";
import { init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, read_property, list_entity, delete_entity, get_ref_labels, get_entity_meta } from "../core/axios";
import { register_type, get_type, no_value, is_int } from "../core/type";

import ConfirmDialog from "./ConfirmDialog.vue";
import BasicForm from "./BasicForm.vue";
import ObjectTable from "./ObjectTable.vue";
import ArrayTable from "./ArrayTable.vue";
import CompareTable from "./CompareTable.vue";
import CompareEntity from "./CompareEntity.vue";
import SearchForm from "./SearchForm.vue";
import EditForm from "./EditForm.vue";
import DataTable from "./DataTable.vue";
import CrudTable from "./CrudTable.vue";
import PropertyTable from "./PropertyTable.vue";
import NavBar from "./NavBar.vue";

function setup_components() {
  Vue.component("h-confirm", ConfirmDialog);
  Vue.component("h-form", BasicForm);
  Vue.component("h-object", ObjectTable);
  Vue.component("h-array", ArrayTable);
  Vue.component("h-compare", CompareTable);
  Vue.component("h-compare-entity", CompareEntity);
  Vue.component("h-search-form", SearchForm);
  Vue.component("h-edit-form", EditForm);
  Vue.component("h-table", DataTable);
  Vue.component("h-crud", CrudTable);
  Vue.component("h-property", PropertyTable);
  Vue.component("h-nav-bar", NavBar);
}

export { setup_components, init_axios, get_url, axios_get, axios_post, axios_cached_get, axios_download, axios_upload, is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session, save_entity, read_entity, read_property, list_entity, delete_entity, get_ref_labels, get_entity_meta, register_type, get_type, no_value, is_int };
