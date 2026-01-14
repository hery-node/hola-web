import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/components/**/*.vue'],
      exclude: ['src/App.vue', 'src/main.ts'],
      outDir: 'dist',
      rollupTypes: true,
      logLevel: 'warn',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HolaWeb',
      formats: ['es', 'umd'],
      fileName: (format) => `hola-web.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['vue', 'vuetify', 'vue-router', 'pinia', 'vue-i18n', 'axios', 'echarts', 'vue-echarts'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'vue-i18n': 'VueI18n',
          axios: 'axios',
          echarts: 'echarts',
          'vue-echarts': 'VueECharts',
        },
        assetFileNames: 'style.[ext]',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
})
