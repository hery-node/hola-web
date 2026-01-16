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

/**
 * Deep merge two objects recursively
 * Used for merging locale messages so nested keys (e.g., type.*) are preserved
 * @param target - Base object (e.g., hola-web messages)
 * @param source - Object to merge on top (e.g., app-specific messages)
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
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
    warnHtmlMessage: false, // Disable HTML warning - Vue's templating auto-escapes content
  })
}
