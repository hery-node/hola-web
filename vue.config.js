/**
 * Vue CLI Configuration
 * 
 * Configures webpack and development server for hola-web.
 * 
 * Features:
 * - UMD library build output (HolaWeb global variable)
 * - Vuetify dependency transpilation for IE11+ support
 * - Component library packaging for npm distribution
 * 
 * @see {@link https://cli.vuejs.org/config/}
 */

const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  configureWebpack: {
    output: {
      library: {
        name: "HolaWeb",
        type: "umd",
      },
    },
  },

  transpileDependencies: ["vuetify"],
});