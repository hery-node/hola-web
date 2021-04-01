import Vue from 'vue';
import HelloWorld from './HelloWorld.vue';

const components = {
    HelloWorld
};

Object.keys(components).forEach(name => {
    Vue.component(name, components[name]);
});

export default components;