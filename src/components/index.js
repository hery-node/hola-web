import Vue from 'vue';
import { init_axios } from '../core/axios'
import { register_type } from '../core/type'

import Form from './Form.vue';
import SearchForm from './SearchForm.vue';
import EditForm from './EditForm.vue';
import Table from './Table.vue';
import Crud from './Crud.vue';
import Navbar from './Navbar.vue';

function setup_components() {
    Vue.component('h-form', Form);
    Vue.component('h-search-form', SearchForm);
    Vue.component('h-edit-form', EditForm);
    Vue.component('h-table', Table);
    Vue.component('h-crud', Crud);
    Vue.component('h-nav-bar', Navbar);
}

export { setup_components, init_axios, register_type }