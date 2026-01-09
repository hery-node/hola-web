/**
 * Internationalization (i18n) Configuration
 * 
 * Sets up Vue I18n plugin for multi-language support.
 * Automatically loads all locale JSON files from ./locales directory.
 * 
 * Features:
 * - Dynamic locale loading from ./locales
 * - Environment-based default locale
 * - Fallback locale: English (en)
 * - Supports nested locale file structures
 */

import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

/**
 * Load and register locale messages from ./locales directory
 * @returns {Object} Locale messages object { locale: messages }
 */
function loadLocaleMessages() {
  const locales = require.context("./locales", true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};

  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched?.[1]) {
      messages[matched[1]] = locales(key);
    }
  });

  return messages;
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: loadLocaleMessages(),
});
