# Hola Web

A meta-programming Vue 3 component library that automatically generates CRUD interfaces from entity metadata. Built with **Vue 3 + Vuetify 3 + ECharts**, designed to work seamlessly with [hola-server](https://github.com/hery-node/hola-server).

## ✨ Features

- **26 Production-Ready Components** — Tables, forms, charts, navigation, comparisons, and more
- **Meta-Driven UI** — Automatic CRUD interfaces generated from server entity metadata
- **8 Composables** — Reusable logic for metadata, alerts, charts, search, validation, and keyboard shortcuts
- **Dual API Clients** — Axios wrapper + Eden Treaty for end-to-end type-safe API calls
- **Extensible Type System** — Client-side type registry with validation rules, formatting, and input types
- **Vuetify 3** — Material Design with 25+ custom theme colors and movable dialogs
- **ECharts Integration** — Line, bar, pie, combo, and dashboard chart components
- **Internationalization** — Built-in i18n with English and Chinese locales
- **Library Build** — Ships as ESM + UMD with TypeScript declarations and CSS

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vue 3](https://vuejs.org) (Composition API) |
| UI Library | [Vuetify 3](https://vuetifyjs.com) 3.7+ |
| Charts | [ECharts](https://echarts.apache.org) 5.5+ / [Chartist](https://gionkunz.github.io/chartist-js/) |
| HTTP Client | [Axios](https://axios-http.com) / [Eden Treaty](https://elysiajs.com/eden/treaty) |
| State | [Pinia](https://pinia.vuejs.org) |
| i18n | [vue-i18n](https://vue-i18n.intlify.dev) 11+ |
| Build | [Vite](https://vitejs.dev) 6+ |
| Runtime | [Bun](https://bun.sh) |

## 🚀 Quick Start

### Installation

```bash
# npm
npm install hola-web

# bun
bun add hola-web
```

### Peer Dependencies

hola-web requires the following packages in your project:

```bash
# npm
npm install vue vuetify @mdi/font pinia vue-router vue-i18n axios

# bun
bun add vue vuetify @mdi/font pinia vue-router vue-i18n axios
```

| Package | Version | Purpose |
|---------|---------|---------|
| `vue` | ^3.5.0 | Core framework |
| `vuetify` | ^3.7.0 | UI component library |
| `@mdi/font` | ^7.4.0 | Material Design Icons |
| `pinia` | ^2.2.0 | State management |
| `vue-router` | ^4.4.0 | Client-side routing |
| `vue-i18n` | ^11.2.8 | Internationalization |
| `axios` | ^1.7.0 | HTTP client |

Optional packages (only if you use charts):

```bash
npm install echarts vue-echarts
```

### Style Setup

hola-web does **not** bundle Vuetify styles. You need to import them separately in your `main.ts`:

```typescript
import 'vuetify/styles'                         // Vuetify styles (required)
import '@mdi/font/css/materialdesignicons.css'   // Material Design Icons (required)
import 'hola-web/style.css'                      // hola-web component styles
```

### Application Setup

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initApp, initAxios, loadLocaleMessagesEager } from "hola-web";

// Styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'hola-web/style.css'

// Load locale files
const localeModules = import.meta.glob("./locales/*.json", { eager: true });
const messages = loadLocaleMessagesEager(localeModules);

// Configure API client
initAxios({ baseURL: "http://localhost:8089" });

// Create and initialize app
const app = createApp(App);
app.use(createPinia());

initApp(app, {
  localeMessages: messages,
  locale: "en",
});

app.mount("#app");
```

### Basic Usage

Create a full CRUD page with a single component:

```vue
<template>
  <h-crud :entity="entity" :item-label-key="itemLabelKey"
    :sort-key="sortKey" :sort-desc="sortDesc" />
</template>

<script setup lang="ts">
const entity = "user";
const itemLabelKey = "name";
const sortKey = ["name"];
const sortDesc = [false];
</script>
```

The `h-crud` component automatically:
- Loads entity metadata from the server
- Renders data table with sorting and pagination
- Provides create, edit, clone, and delete dialogs
- Handles all API calls internally

## 🧩 Components

### Core Components

| Tag | Component | Description |
|-----|-----------|-------------|
| `h-crud` | CrudTable | Full CRUD operations with inline editing |
| `h-table` | DataTable | Data table with sorting, pagination, search |
| `h-form` | BasicForm | Simple form with validation |
| `h-edit-form` | EditForm | Meta-aware entity edit form |
| `h-search` | SearchForm | Search form for entity filtering |
| `h-list` | DataList | Mobile-friendly list view |

### Table Components

| Tag | Component | Description |
|-----|-----------|-------------|
| `h-array` | ArrayTable | Inline editable array table |
| `h-property` | PropertyTable | Key-value property display |
| `h-compare` | CompareTable | Side-by-side entity comparison |
| `h-dashboard-table` | DashboardTable | Dashboard summary table |

### Chart Components

| Tag | Component | Description |
|-----|-----------|-------------|
| `h-chart` | ChartView | Generic ECharts wrapper |
| `h-line-chart` | ChartLineView | Line charts for trends |
| `h-bar-chart` | ChartBarView | Bar/column charts |
| `h-pie-chart` | ChartPieView | Pie/donut charts |
| `h-combo-chart` | ChartComboView | Multi-type combination charts |
| `h-simple-chart` | ChartSimpleView | Simple Chartist charts |
| `h-dashboard-chart` | ChartDashboardView | Dashboard chart panels |

### Layout & Navigation

| Tag | Component | Description |
|-----|-----------|-------------|
| `h-window` | BasicWindow | Modal dialog window |
| `h-confirm` | ConfirmDialog | Confirmation dialog |
| `h-navbar` | NavBar | Top navigation bar |
| `h-mobile-menu` | MobileMenu | Mobile navigation menu |
| `h-card` | CardView | Content card with actions |
| `h-stats` | StatisticsView | Statistics display card |
| `h-offset` | OffsetView | Offset content layout |

### Entity Components

| Tag | Component | Description |
|-----|-----------|-------------|
| `h-array-entity` | ArrayEntity | Entity with array sub-items |
| `h-compare-entity` | CompareEntity | Entity comparison wrapper |

## 🔧 Composables

| Composable | Purpose | Key Functions |
|------------|---------|---------------|
| `useMeta` | Entity metadata management | `loadMeta()`, `getTableHeaders()`, `getEditFields()`, `getSearchFields()` |
| `useAlert` | Notifications & confirmations | `showSuccess()`, `showError()`, `confirm()` |
| `useChart` | ECharts integration | `createChart()`, chart option builders |
| `useFuzzy` | Fuzzy text search/filtering | `search()`, configurable matching |
| `useKeymap` | Keyboard shortcuts | `bindKey()`, key combinations |
| `useRegex` | Regex validation helpers | Pattern matching utilities |
| `useSimpleValue` | Simple reactive values | Getter/setter helpers |
| `useWrap` | Value wrapping/formatting | Text truncation, formatting |

## 🌐 API Clients

### Axios Client

```typescript
import { initAxios, listEntity, saveEntity, deleteEntity } from "hola-web";

// Initialize
initAxios({ baseURL: "http://localhost:8089" });

// CRUD operations
const { data, total } = await listEntity("user", searchForm, {
  page: 1, limit: 20, sortBy: "name", desc: "false", attrNames: "*"
});
await saveEntity("user", formData, false); // create
await saveEntity("user", formData, true);  // update
await deleteEntity("user", ["id1", "id2"]);
```

### Eden Treaty Client (Type-Safe)

```typescript
import { initEden, getEden, handleEdenResponse } from "hola-web";
import type { App } from "your-server/main";

// Initialize with server type
const api = initEden<App>({ baseUrl: "http://localhost:3000" });

// Type-safe API calls
const result = handleEdenResponse(await api.user.meta.get());
```

## 🎨 Theming

Customize with 25+ semantic color tokens:

```typescript
import { initApp } from "hola-web";

initApp(app, {
  locale: "en",
  localeMessages: messages,
  theme: {
    light: {
      primary: "#1976D2",
      secondary: "#424242",
      accent: "#82B1FF",
      create: "#4CAF50",
      edit: "#2196F3",
      delete: "#F44336",
      appBar: "#1976D2",
      tableHeader: "#E3F2FD",
      // ...and more
    },
  },
});
```

## 🌍 Internationalization

Built-in locale support with deep merge for app-specific translations:

```typescript
import { setupI18n, loadLocaleMessagesEager, deepMerge } from "hola-web";

// Load hola-web built-in locales + app locales
const holaMessages = loadLocaleMessagesEager(holaLocaleModules);
const appMessages = loadLocaleMessagesEager(appLocaleModules);

// Deep merge preserves nested keys
const merged = { en: deepMerge(holaMessages.en, appMessages.en) };
const i18n = setupI18n({ locale: "en", messages: merged });
```

## 📁 Type System

Client-side type registry for form validation, input types, and formatting:

```typescript
import { registerType, getType, createEnumType } from "hola-web";

// Register custom enum type
registerType(createEnumType("status", [
  { value: 0, label: "Active" },
  { value: 1, label: "Inactive" },
]));

// Built-in types: string, text, int, uint, float, decimal, percentage,
// currency, boolean, date, datetime, email, password, url, ip, file, array, enum
```

## 📂 Project Structure

```
hola-web/
├── src/
│   ├── index.ts              # Public API & plugin entry
│   ├── main.ts               # Dev app entry point
│   ├── App.vue               # Dev app root component
│   ├── components/           # 26 Vue components
│   │   ├── CrudTable.vue     # Full CRUD operations
│   │   ├── DataTable.vue     # Data table with pagination
│   │   ├── EditForm.vue      # Meta-aware edit form
│   │   ├── BasicForm.vue     # Simple form component
│   │   ├── ChartView.vue     # ECharts wrapper
│   │   └── ...
│   ├── composables/          # 8 Vue composables
│   │   ├── useMeta.ts        # Entity metadata management
│   │   ├── useAlert.ts       # Notifications
│   │   ├── useChart.ts       # Chart utilities
│   │   └── ...
│   ├── core/                 # Core utilities
│   │   ├── axios.ts          # Axios HTTP client wrapper
│   │   ├── eden.ts           # Eden Treaty client
│   │   ├── type.ts           # Type system & validation
│   │   ├── chart.ts          # Chart data utilities
│   │   ├── code.ts           # Response code constants
│   │   └── storage.ts        # Local storage helpers
│   ├── plugins/              # Vue plugins
│   │   ├── vuetify.ts        # Vuetify 3 configuration
│   │   ├── i18n.ts           # Vue I18n setup
│   │   └── echarts.ts        # ECharts setup
│   ├── types/                # TypeScript definitions
│   ├── locales/              # i18n translations (en, zh)
│   └── views/                # Dev demo views
├── docs/                     # Documentation
│   ├── COMPONENTS.md         # Component reference
│   └── THEMING.md            # Theming guide
├── vite.config.ts            # Vite build config (ESM + UMD)
├── package.json
└── tsconfig.json
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build library (ESM + UMD + types + CSS)
bun run build

# Type check
bun run type-check

# Lint
bun run lint
```

## 📋 Requirements

- **Runtime:** Bun 1.0+
- **Vue:** 3.5.0+
- **Vuetify:** 3.7.0+
- **Browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

## 📄 License

MIT
