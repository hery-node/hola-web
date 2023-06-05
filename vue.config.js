const { defineConfig } = require('@vue/cli-service');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const local_deploy = false;

const cdn = local_deploy ? {
  css: ['https://cdn.jsdelivr.net/npm/chartist@1.3.0/dist/index.min.css'],
  js: []
} : {
  css: [
    'https://cdn.jsdelivr.net/npm/chartist@1.3.0/dist/index.min.css',
    'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
    'https://cdn.jsdelivr.net/npm/vue-echarts@6.5.5/dist/csp/style.min.css'
  ],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.2.0/dist/vue-router.min.js',
    'https://cdn.jsdelivr.net/npm/vuex@3.4.0/dist/vuex.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/vuetify@2.6.0/dist/vuetify.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.min.js',
    'https://cdn.jsdelivr.net/npm/vue-echarts@6.5.5/dist/index.umd.min.js'
  ]
};

const externals = local_deploy ? {} : {
  'vue': 'Vue',
  'vue-router': 'VueRouter',
  'vuex': 'Vuex',
  'xlsx': 'XLSX',
  'vuetify': 'Vuetify',
  'echarts': 'echarts',
  'vue-echarts': 'VueECharts'
};

module.exports = defineConfig({
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    externals: externals
  },

  chainWebpack(config) {
    config.plugin('html').tap(args => {
      args[0].cdn = cdn;
      return args;
    })
  },

  transpileDependencies: [
    'vuetify'
  ]
});