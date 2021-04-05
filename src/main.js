import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import AsyncComputed from 'vue-async-computed'

import { init_axios, setup_components } from './components'
import i18n from './i18n'

Vue.config.productionTip = false
Vue.use(AsyncComputed);
setup_components();

init_axios({ baseURL: "http://localhost:8089" }, {
  handle_response: (code, data) => { console.log(code); console.log(data) },
})

new Vue({
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
