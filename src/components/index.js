import Vue from 'vue';
import { init_axios } from '../plugins/axios'

import Form from './Form.vue';

function setup_components() {
    Vue.component('h-form', Form);

}

export { setup_components, init_axios }