import Vue from 'vue';
import { init_axios } from '../plugins/axios'

import HelloWorld from './HelloWorld.vue';

function setup_components() {
    Vue.component('h-hello', HelloWorld);

}

export { setup_components, init_axios }