const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  configureWebpack: {
    output: {
      uniqueName: 'HolaWeb',
    },
  },

  transpileDependencies: [
    'vuetify'
  ]
});