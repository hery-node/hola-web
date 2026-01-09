/**
 * Main Application Entry Point
 * 
 * Initializes the hola-web Vue application with:
 * - Axios HTTP client configuration
 * - Vue Router with example views
 * - i18n internationalization with dynamic locale loading
 * - Root App component mounting
 */

import Vue from "vue";
import App from "./App.vue";
import ChartView from "./examples/ChartView.vue";
import Dashboard from "./examples/DashboardView.vue";
import ApplicationView from "./examples/ApplicationView.vue";

import { init_axios } from "./components";
import { init_app } from "./plugins";

Vue.config.productionTip = false;

// Configure Axios with backend API base URL
init_axios({ baseURL: "http://localhost:8089" });

/**
 * Application routes configuration
 * Note: These are example routes for testing/demonstration.
 * Production apps should use dedicated router configuration.
 */
const routes = [
    { path: "/chart", name: "chart", component: ChartView },
    { path: "/dashboard", name: "dashboard", component: Dashboard },
    { path: "/application", name: "application", component: ApplicationView },
];

/**
 * Load all locale files from ./locales directory
 * Automatically registers all JSON locale files for i18n
 */
const locales = require.context("./locales", true, /[A-Za-z0-9-_,\s]+\.json$/i);

// Initialize and mount application
init_app(App, routes, locales);
