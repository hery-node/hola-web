import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

// Copy locale files to dist after build
function copyLocales() {
  return {
    name: 'copy-locales',
    closeBundle() {
      const srcDir = resolve(__dirname, 'src/locales')
      const destDir = resolve(__dirname, 'dist/locales')
      mkdirSync(destDir, { recursive: true })
      readdirSync(srcDir).forEach((file) => {
        if (file.endsWith('.json')) {
          copyFileSync(resolve(srcDir, file), resolve(destDir, file))
        }
      })
    },
  }
}

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
    copyLocales(),
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
      // Use function to avoid externalizing echarts subpaths (core, renderers, charts, etc.)
      external: (id) => {
        const exactExternals = ['vue', 'vuetify', 'vue-router', 'pinia', 'vue-i18n', 'axios', 'vue-echarts']
        if (exactExternals.includes(id)) return true
        // Only externalize exact 'echarts' match, not subpaths like 'echarts/core'
        if (id === 'echarts') return true
        return false
      },
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
