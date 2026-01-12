# Hola-Web

**Meta-Programming Framework for Vue.js Applications**

A powerful Vue.js framework that automatically generates CRUD interfaces from entity metadata, built with Vue 2.7 and Vuetify 2.6.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/hery-node/hola-web) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- **42 Production-Ready Components** - Tables, forms, charts, calendars, kanban boards, and more
- **Meta-Programming** - Automatic UI generation from entity metadata
- **8 Powerful Mixins** - Reusable logic for metadata, alerts, charts, search, and validation
- **Vuetify 2.6** - Material Design components with full theming support
- **TypeScript Support** - Comprehensive JSDoc documentation
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Dark Mode** - Complete light/dark theme switching
- **Internationalization** - Built-in i18n support

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/hery-node/hola-web.git
cd hola-web

# Install dependencies
npm install

# Start development server
npm run serve
```

The application will be available at `http://localhost:8080`

### Basic Usage

Create a simple CRUD page - the `h-crud` component handles all operations automatically:

```vue
<template>
  <h-crud :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"></h-crud>
</template>

<script>
export default {
  data() {
    return {
      entity: "user",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
    };
  },
};
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

### Meta-Integrated Components (New in v2.0)

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

```javascript
// src/plugins/vuetify.js
export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#1976D2",
        secondary: "#424242",
        accent: "#82B1FF",
      },
      dark: {
        primary: "#2196F3",
        secondary: "#616161",
        accent: "#FF4081",
      },
    },
  },
});
```

See [Theming Guide](docs/THEMING.md) for advanced customization.

---

## 🧩 Mixins

Reusable functionality through Vue mixins:

| Mixin      | Purpose                       | Key Methods                                                       |
| ---------- | ----------------------------- | ----------------------------------------------------------------- |
| **Meta**   | Entity metadata integration   | `load_meta()`, `get_table_headers()`, `get_form_fields()`         |
| **Alert**  | Notifications & confirmations | `show_alert()`, `show_error()`, `confirm()`                       |
| **Simple** | Basic CRUD operations         | `load_items()`, `create_item()`, `update_item()`, `delete_item()` |
| **Chart**  | ECharts integration           | `create_line_chart()`, `create_bar_chart()`, `create_pie_chart()` |
| **Fuzzy**  | Client-side search            | `fuzzy_search()`, `fuzzy_match()`                                 |
| **Keymap** | Keyboard shortcuts            | `register_keymap()`                                               |
| **Regex**  | Input validation              | `validate_email()`, `validate_url()`, `validate_password()`       |
| **Wrap**   | Async wrappers                | `wrap_async()`, `wrap_action()`                                   |

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
│   └── index.html
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # 42 Vue components
│   │   ├── ArrayEntity.vue
│   │   ├── CrudTable.vue
│   │   ├── EntityCalendarView.vue
│   │   ├── EntityKanbanView.vue
│   │   └── ...
│   ├── core/                # Core utilities
│   │   ├── axios.js         # HTTP client
│   │   ├── chart.js         # Chart utilities
│   │   ├── storage.js       # Local storage
│   │   └── type.js          # Type utilities
│   ├── mixins/              # 8 Vue mixins
│   │   ├── meta.js
│   │   ├── alert.js
│   │   ├── simple.js
│   │   └── ...
│   ├── plugins/             # Vue plugins
│   │   ├── vuetify.js
│   │   ├── echarts.js
│   │   └── i18n.js
│   ├── locales/             # Translations
│   │   └── en.json
│   ├── App.vue              # Root component
│   ├── main.js              # Entry point
│   └── i18n.js              # i18n configuration
├── docs/                    # Documentation
├── babel.config.js
├── jsconfig.json
├── vue.config.js
└── package.json
```

---

## 🛠️ Development

### Prerequisites

- Node.js 14+ and npm
- Vue CLI 4+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run serve

# Build for production
npm run build

# Lint and fix files
npm run lint
```

### Environment Variables

Create a `.env.local` file:

```env
VUE_APP_API_URL=http://localhost:3000
VUE_APP_GRIDFS_URL=http://localhost:3000/gridfs
```

---

## 🔧 Configuration

### API Integration

Configure axios in `src/core/axios.js`:

```javascript
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:3000",
  timeout: 30000,
});

// Request interceptor
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

### Vuetify Configuration

Customize Vuetify in `src/plugins/vuetify.js`:

```javascript
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: { primary: "#1976D2" },
      dark: { primary: "#2196F3" },
    },
  },
});
```

---

## 🌐 Backend Integration

Hola-web works seamlessly with [hola-server](https://github.com/hery-node/hola-server), a Node.js + MongoDB backend. Define your entity metadata using `init_router()`:

```javascript
// routes/user.js
const { init_router } = require("hola-server");

module.exports = init_router({
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

- **Node.js:** 14.x or higher
- **Vue:** 2.7.8
- **Vuetify:** 2.6.6
- **Browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Vue.js](https://vuejs.org/)
- UI components by [Vuetify](https://vuetifyjs.com/)
- Charts powered by [Apache ECharts](https://echarts.apache.org/)
- Icons from [Material Design Icons](https://materialdesignicons.com/)

---

## 📞 Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/hery-node/hola-web/issues)
- **Documentation:** See `docs/` folder
- **Examples:** See `docs/EXAMPLES.md`

---

**Version:** 2.0.0  
**Last Updated:** January 9, 2026
