import Vue from 'vue';
import {
    init_axios,
    axios_download, axios_upload,
    is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params,
    save_entity, read_entity, read_entity_properties, list_entity, delete_entity, get_ref_labels, get_entity_meta
} from '../core/axios';
import { register_type, get_type, no_value, is_int } from '../core/type';

import Form from './Form.vue';
import SearchForm from './SearchForm.vue';
import EditForm from './EditForm.vue';
import Table from './Table.vue';
import Crud from './Crud.vue';
import Property from './Property.vue';
import Navbar from './Navbar.vue';

function setup_components() {
    Vue.component('h-form', Form);
    Vue.component('h-search-form', SearchForm);
    Vue.component('h-edit-form', EditForm);
    Vue.component('h-table', Table);
    Vue.component('h-crud', Crud);
    Vue.component('h-property', Property);
    Vue.component('h-nav-bar', Navbar);
}

export {
    setup_components, init_axios,
    axios_download, axios_upload,
    is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params,
    save_entity, read_entity, read_entity_properties, list_entity, delete_entity, get_ref_labels, get_entity_meta, register_type, get_type, no_value, is_int
};
