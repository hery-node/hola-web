/**
 * Hola Web - Vue 3 Component Library
 *
 * A meta-programming framework for rapid application development
 * with automatic CRUD operations and UI components.
 */

import type { App, Plugin } from 'vue'
import { setupVuetify, setupEcharts, setupI18n } from './plugins'
import type { HolaWebOptions, LocaleMessages } from './types'

// Import all components
import ConfirmDialog from './components/ConfirmDialog.vue'
import BasicWindow from './components/BasicWindow.vue'
import BasicForm from './components/BasicForm.vue'
import EditForm from './components/EditForm.vue'

// Re-export types
export * from './types'

// Re-export component types
export type {
  ConfirmDialogInstance,
  BasicWindowInstance,
  BasicFormInstance,
  EditFormInstance,
} from './components/types'
export type { FormField, FormData } from './components/BasicForm.vue'

// Export components
export { ConfirmDialog, BasicWindow, BasicForm, EditForm }

// Re-export installComponents from components
export { installComponents } from './components'

// Re-export core utilities
export {
  saveValue,
  getValue,
  removeValue,
  clearStorage,
} from './core/storage'

export {
  sumData,
  appendData,
  mergeChartData,
} from './core/chart'

export {
  registerType,
  getType,
  noValue,
  isInt,
} from './core/type'

export {
  initAxios,
  getUrl,
  axiosGet,
  axiosPost,
  axiosCachedGet,
  axiosDownload,
  axiosUpload,
  isSuccessResponse,
  isErrorResponse,
  isBeenReferred,
  isDuplicated,
  isUniqueDuplicated,
  hasInvalidParams,
  isNoSession,
  saveEntity,
  readEntity,
  readProperty,
  queryEntity,
  listEntity,
  deleteEntity,
  getRefLabels,
  getEntityMeta,
  getEntityMode,
  clearCache,
} from './core/axios'

// Eden Treaty client for type-safe API calls
export {
  initEden,
  getEden,
  getBaseUrl,
  handleEdenResponse,
  type EdenConfig,
} from './core/eden'

// Re-export composables
export {
  useAlert,
  useChart,
  useFuzzy,
  useKeymap,
  useMeta,
  useRegex,
  useSimpleValue,
  useWrap,
} from './composables'

// Re-export plugin setup functions
export {
  setupVuetify,
  setupEcharts,
  setupI18n,
  loadLocaleMessages,
  loadLocaleMessagesEager,
  deepMerge,
} from './plugins'

// Component map for global registration
const components: Record<string, unknown> = {
  HConfirm: ConfirmDialog,
  HWindow: BasicWindow,
  HForm: BasicForm,
  HEdit: EditForm,
}

/**
 * Capitalize string helper
 */
export const capitalize = (str: string): string => {
  const words = str.split(' ')
  return words
    .map((word) => {
      if (word && word.trim().length > 0) {
        return word[0].toUpperCase() + word.substring(1)
      }
      return word
    })
    .join(' ')
}

/**
 * Create Hola Web plugin
 */
export function createHolaWeb(options: HolaWebOptions = {}): Plugin {
  return {
    install(app: App) {
      // Register all components globally
      Object.entries(components).forEach(([name, component]) => {
        app.component(name, component as Parameters<typeof app.component>[1])
      })

      // Store options for later use
      app.provide('holaWebOptions', options)
    },
  }
}

/**
 * Initialize full application with all plugins
 * This is a convenience function for applications using hola-web
 */
export interface InitAppOptions {
  localeMessages?: LocaleMessages
  locale?: string
  theme?: HolaWebOptions['theme']
}

export function initApp(app: App, options: InitAppOptions = {}): App {
  const { localeMessages = {}, locale = 'en', theme } = options

  // Setup Vuetify
  const vuetify = setupVuetify(theme)
  app.use(vuetify)

  // Setup i18n
  const i18n = setupI18n({
    locale,
    messages: localeMessages,
  })
  app.use(i18n)

  // Setup ECharts
  setupEcharts(app)

  // Setup Hola Web plugin
  app.use(createHolaWeb({ theme }))

  return app
}

// Default export is the plugin
export default createHolaWeb
