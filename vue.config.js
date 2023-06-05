const { defineConfig } = require('@vue/cli-service');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const local_deploy = true;

const cdn = {
  css: ['https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css'],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.2.0/dist/vue-router.min.js',
    'https://cdn.jsdelivr.net/npm/vuex@3.4.0/dist/vuex.min.js',
    'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.js',
    'https://cdn.jsdelivr.net/npm/vue-echarts@6.2.3/dist/vue-echarts.js'
  ]
};

const externals = local_deploy ? {} : {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  vuex: 'Vuex',
  'vuetify': 'Vuetify'
};

module.exports = defineConfig({
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    externals: externals
  },

  chainWebpack(config) {
    config.plugin('html').tap(args => {
      if (!local_deploy) {
        args[0].cdn = cdn;
      }
      return args;
    })
  },

  transpileDependencies: [
    'vuetify'
  ]
});