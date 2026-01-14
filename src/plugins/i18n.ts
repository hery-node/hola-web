/**
 * Vue I18n setup for Vue 3
 */

import { createI18n } from 'vue-i18n'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LocaleMessages = Record<string, any>

/**
 * Load locale messages from import.meta.glob result
 * @param localeModules - Object from import.meta.glob
 */
export function loadLocaleMessages(
  localeModules: Record<string, () => Promise<{ default: Record<string, unknown> }>>
): LocaleMessages {
  const messages: LocaleMessages = {}

  // This is for static imports - modules are already loaded
  for (const path in localeModules) {
    const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      // For eager loading, the module is already resolved
      const module = localeModules[path] as unknown as { default: Record<string, unknown> }
      if (module && module.default) {
        messages[locale] = module.default
      }
    }
  }

  return messages
}

/**
 * Load locale messages synchronously (for eager imports)
 */
export function loadLocaleMessagesEager(
  localeModules: Record<string, { default: Record<string, unknown> }>
): LocaleMessages {
  const messages: LocaleMessages = {}

  for (const path in localeModules) {
    const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = localeModules[path].default
    }
  }

  return messages
}

export interface I18nConfig {
  locale?: string
  fallbackLocale?: string
  messages?: LocaleMessages
}

/**
 * Setup Vue I18n instance
 */
export function setupI18n(config: I18nConfig = {}) {
  const { locale = 'en', fallbackLocale = 'en', messages = {} } = config

  return createI18n({
    legacy: false, // Use Composition API mode
    globalInjection: true,
    locale,
    fallbackLocale,
    messages,
  })
}
