# Hola-Web

**Meta-Programming Framework for Vue.js Applications**

A powerful Vue.js framework that automatically generates CRUD interfaces from entity metadata, built with Vue 3 and Vuetify 3.

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/hery-node/hola-web) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- **42 Production-Ready Components** - Tables, forms, charts, calendars, kanban boards, and more
- **Meta-Programming** - Automatic UI generation from entity metadata
- **8 Powerful Composables** - Reusable logic for metadata, alerts, charts, search, and validation
- **Vuetify 3** - Material Design components with full theming support
- **TypeScript Support** - Comprehensive type definitions
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Dark Mode** - Complete light/dark theme switching
- **Internationalization** - Built-in i18n support
- **Bun & Elysia** - Optimized for modern stack

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/hery-node/hola-web.git
cd hola-web

# Install dependencies
bun install

# Start development server
bun run dev
```

The application will be available at `http://localhost:5173`

### Basic Usage

Create a simple CRUD page - the `h-crud` component handles all operations automatically:

```vue
<template>
  <h-crud :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"></h-crud>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const entity = ref("user");
const item_label_key = ref("name");
const sort_key = ref(["name"]);
const sort_desc = ref([false]);
</script>
```

That's it! The `h-crud` component automatically:
- Loads entity metadata from the server
- Fetches and displays data with pagination
- Provides create, update, and delete dialogs
- Handles all API calls internally

---

## 📦 Component Library

### Core Components

| Component     | Name      | Purpose                                  |
| ------------- | --------- | ---------------------------------------- |
| `h-crud`      | CrudTable | Full CRUD operations with inline editing |
| `h-table`     | DataTable | Data table with sorting and pagination   |
| `h-form`      | BasicForm | Simple form component                    |
| `h-edit-form` | EditForm  | Meta-aware entity form                   |
| `h-list`      | DataList  | Mobile-friendly list view                |

### Meta-Integrated Components

| Component          | Purpose                               |
| ------------------ | ------------------------------------- |
| `h-calendar`       | Calendar view for date-based entities |
| `h-timeline`       | Chronological timeline display        |
| `h-tree`           | Hierarchical tree view with drag-drop |
| `h-kanban`         | Kanban board with status columns      |
| `h-file`           | File upload with GridFS integration   |
| `h-relationship`   | Advanced entity relationship picker   |
| `h-gallery`        | Image gallery with lightbox           |
| `h-compare-view`   | Side-by-side entity comparison        |
| `h-filter-builder` | Visual MongoDB query builder          |
| `h-search`         | Unified multi-entity search           |
| `h-bulk-actions`   | Batch operations toolbar              |
| `h-import`         | CSV/Excel import with mapping         |
| `h-export`         | Multi-format export (CSV/Excel/JSON)  |
| `h-wizard`         | Multi-step form wizard                |
| `h-audit`          | Entity change history                 |
| `h-notifications`  | Notification center                   |

### Chart Components

| Component       | Type                    |
| --------------- | ----------------------- |
| `h-line-chart`  | Line charts for trends  |
| `h-bar-chart`   | Bar/column charts       |
| `h-pie-chart`   | Pie/donut charts        |
| `h-combo-chart` | Combination charts      |
| `h-chart`       | Generic ECharts wrapper |

See [Component Documentation](docs/COMPONENTS.md) for complete reference.

---

## 🎨 Theming

Customize your application with Vuetify themes:

```typescript
// src/plugins/vuetify.ts
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#424242",
          accent: "#82B1FF",
        }
      },
      dark: {
        colors: {
          primary: "#2196F3",
          secondary: "#616161",
          accent: "#FF4081",
        }
      },
    },
  },
})
```

See [Theming Guide](docs/THEMING.md) for advanced customization.

---

## 🧩 Composables

Reusable functionality through Vue Composables:

| Composable  | Purpose                       | Key Functions                                                     |
| ----------- | ----------------------------- | ----------------------------------------------------------------- |
| **Meta**    | Entity metadata integration   | `useMeta()`, `getHeaders()`, `getFormFields()`                    |
| **Alert**   | Notifications & confirmations | `useAlert()`, `showError()`, `confirm()`                          |
| **Crud**    | Basic CRUD operations         | `useCrud()`, `createItem()`, `updateItem()`, `deleteItem()`       |
| **Chart**   | ECharts integration           | `useChart()`, `createLineChart()`                                 |
| **Keymap**  | Keyboard shortcuts            | `useKeymap()`                                                     |

See [Composables Documentation](docs/COMPOSABLES.md) for detailed API reference.

---

## 📚 Documentation

- [Component Library](docs/COMPONENTS.md) - Complete component reference
- [Mixins & Composables](docs/COMPOSABLES.md) - Reusable functionality
- [Theming Guide](docs/THEMING.md) - Customization and styling
- [Usage Examples](docs/EXAMPLES.md) - Real-world code examples

---

## 🏗️ Project Structure

```
hola-web/
├── public/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # 42 Vue components
│   ├── core/                # Core utilities
│   │   ├── api.ts           # Eden/Axios client
│   │   ├── chart.ts         # Chart utilities
│   ├── composables/         # Vue Composables
│   │   ├── useMeta.ts
│   │   ├── useAlert.ts
│   ├── plugins/             # Vue plugins
│   │   ├── vuetify.ts
│   │   ├── i18n.ts
│   ├── locales/             # Translations
│   ├── App.vue              # Root component
│   ├── main.ts              # Entry point
├── docs/                    # Documentation
├── package.json
└── vite.config.ts
```

---

## 🛠️ Development

### Prerequisites

- Bun 1.0+

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Lint and fix files
bun run lint
```

---

## 🔧 Configuration

### API Integration

Configure Eden/Axios in `src/core/api.ts`.

---

## 🌐 Backend Integration

Hola-web works seamlessly with [hola-server](https://github.com/hery-node/hola-server), a Bun + Elysia + MongoDB backend. Define your entity metadata using `init_router()`:

```typescript
// router/user.ts
import { init_router } from "hola-server";

export const router = init_router({
  collection: "user",
  primary_keys: ["email"],
  ref_label: "name",

  readable: true,
  creatable: true,
  updatable: true,
  deleteable: true,

  roles: [
    "admin:*",
    "user:rs"
  ],

  fields: [
    { name: "email", type: "email", required: true },
    { name: "name", type: "string", required: true },
    { name: "age", type: "int" },
    { name: "role", type: "user_role", default: "user" },
    { name: "created_at", type: "datetime", sys: true, create: false, update: false }
  ]
});
```

---

## 📋 Requirements

- **Runtime:** Bun 1.0+
- **Vue:** 3.5.0+
- **Vuetify:** 3.7.0+
- **Browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Vue.js](https://vuejs.org/)
- UI components by [Vuetify](https://vuetifyjs.com/)
- Optimized for [Bun](https://bun.sh/) & [Elysia](https://elysiajs.com/)

---

## 📞 Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/hery-node/hola-web/issues)
- **Documentation:** See `docs/` folder
- **Examples:** See `docs/EXAMPLES.md`

---

**Version:** 3.0.0
**Last Updated:** January 18, 2026
