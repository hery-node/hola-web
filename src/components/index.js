import Vue from 'vue';
import axios from '../core/axios'
import type from '../core/type'

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

export { setup_components, axios, type };
