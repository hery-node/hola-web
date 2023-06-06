const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  configureWebpack: {
    output: {
      library: {
        name: 'HolaWeb',
        type: 'umd',
      }
    },
  },

  transpileDependencies: [
    'vuetify'
  ]
});