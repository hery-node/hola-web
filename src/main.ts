/**
 * Example Application Entry Point
 *
 * This file demonstrates how to use hola-web in an application.
 * Note: This is for development/testing only, not part of the library build.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { initApp, initAxios, loadLocaleMessagesEager } from './index'

// Load locale files eagerly
const localeModules = import.meta.glob('./locales/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>
const messages = loadLocaleMessagesEager(localeModules)

// Configure Axios with backend API base URL
initAxios({ baseURL: 'http://localhost:8089' })

// Create Vue app
const app = createApp(App)

// Setup Pinia store
const pinia = createPinia()
app.use(pinia)

// Initialize hola-web with all plugins
initApp(app, {
  localeMessages: messages,
  locale: 'en',
})

// Mount application
app.mount('#app')
