# Hola-Web Theming & Customization Guide

Complete guide to customizing the visual appearance and behavior of hola-web applications.

**Version:** 2.0.0  
**Framework:** Vue 2.7 + Vuetify 2.6  
**Last Updated:** January 9, 2026

---

## Table of Contents

- [Overview](#overview)
- [Vuetify Theming](#vuetify-theming)
  - [Color Palette](#color-palette)
  - [Theme Configuration](#theme-configuration)
  - [Dynamic Theme Switching](#dynamic-theme-switching)
- [Custom Styling](#custom-styling)
  - [Global Styles](#global-styles)
  - [Component-Specific Styles](#component-specific-styles)
  - [CSS Variables](#css-variables)
- [Component Customization](#component-customization)
  - [Props & Slots](#props--slots)
  - [Overriding Defaults](#overriding-defaults)
  - [Custom Components](#custom-components)
- [Layout Customization](#layout-customization)
- [Internationalization](#internationalization)
- [Advanced Theming](#advanced-theming)
- [Best Practices](#best-practices)

---

## Overview

Hola-web is built on Vuetify 2.6, providing extensive theming capabilities. You can customize:

- **Colors:** Primary, secondary, accent colors
- **Typography:** Fonts, sizes, weights
- **Components:** Individual component styles
- **Layout:** Application structure and spacing
- **Dark/Light Mode:** Full theme switching

---

## Vuetify Theming

### Color Palette

Vuetify uses a Material Design color system with customizable theme colors.

**Default Theme (`src/plugins/vuetify.js`):**

```javascript
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#1976D2", // Blue
        secondary: "#424242", // Grey
        accent: "#82B1FF", // Light Blue
        error: "#FF5252", // Red
        info: "#2196F3", // Blue
        success: "#4CAF50", // Green
        warning: "#FB8C00", // Orange
      },
      dark: {
        primary: "#2196F3", // Lighter Blue
        secondary: "#616161", // Lighter Grey
        accent: "#FF4081", // Pink
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FB8C00",
      },
    },
  },
});
```

---

### Theme Configuration

#### Custom Brand Colors

Modify `src/plugins/vuetify.js` to use your brand colors:

```javascript
export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#6200EA", // Deep Purple
        secondary: "#03DAC6", // Teal
        accent: "#018786", // Dark Teal
        error: "#B00020", // Dark Red
        info: "#0091EA", // Light Blue
        success: "#00C853", // Green
        warning: "#FFD600", // Amber

        // Custom colors
        background: "#FAFAFA",
        surface: "#FFFFFF",
        card: "#FFFFFF",
      },
      dark: {
        primary: "#BB86FC", // Light Purple
        secondary: "#03DAC6",
        accent: "#03DAC6",
        error: "#CF6679",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FB8C00",

        background: "#121212",
        surface: "#1E1E1E",
        card: "#2C2C2C",
      },
    },
    options: {
      customProperties: true, // Enable CSS custom properties
    },
  },
});
```

---

#### Typography

Customize fonts and typography:

```javascript
export default new Vuetify({
  theme: {
    themes: {
      /* ... */
    },
    options: {
      customProperties: true,
    },
  },

  // Custom fonts
  breakpoint: {
    thresholds: {
      xs: 600,
      sm: 960,
      md: 1280,
      lg: 1920,
    },
  },
});
```

**Add custom fonts (`public/index.html`):**

```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
```

**Apply in CSS:**

```css
/* src/App.vue or global CSS */
.v-application {
  font-family: "Inter", sans-serif !important;
}

.v-application .headline,
.v-application .title,
.v-application .subtitle-1,
.v-application .subtitle-2 {
  font-family: "Roboto", sans-serif !important;
}
```

---

### Dynamic Theme Switching

Implement dark/light mode toggle:

**App.vue:**

```vue
<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>My App</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Theme Toggle -->
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ $vuetify.theme.dark ? "mdi-weather-night" : "mdi-weather-sunny" }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  mounted() {
    // Restore theme preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    this.$vuetify.theme.dark = darkMode;
  },

  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("darkMode", this.$vuetify.theme.dark);
    },
  },
};
</script>
```

---

## Custom Styling

### Global Styles

**Create global styles (`src/assets/styles/global.css`):**

```css
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Custom transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Custom card styling */
.custom-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
}

/* Custom button styles */
.v-btn--custom {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 500 !important;
}
```

**Import in main.js:**

```javascript
import Vue from "vue";
import "./assets/styles/global.css";
```

---

### Component-Specific Styles

Use scoped styles for component customization:

```vue
<template>
  <v-card class="custom-card">
    <v-card-title class="custom-title">
      {{ title }}
    </v-card-title>
  </v-card>
</template>

<style scoped>
.custom-card {
  border-left: 4px solid var(--v-primary-base);
}

.custom-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}
</style>
```

---

### CSS Variables

Vuetify exposes CSS custom properties when `customProperties: true`:

```css
/* Use Vuetify theme colors */
.my-element {
  background-color: var(--v-primary-base);
  color: var(--v-primary-lighten5);
  border-color: var(--v-secondary-darken1);
}

/* Available variables */
--v-primary-base
--v-primary-lighten1
--v-primary-lighten2
--v-primary-lighten3
--v-primary-lighten4
--v-primary-lighten5
--v-primary-darken1
--v-primary-darken2
--v-primary-darken3
--v-primary-darken4

/* Same pattern for: secondary, accent, error, info, success, warning */
```

---

## Component Customization

### Props & Slots

Most hola-web components support extensive customization through props and slots.

**Example: Custom Table Headers**

```vue
<template>
  <h-table :headers="headers" :items="items">
    <!-- Custom header -->
    <template #top>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>Custom Header</v-toolbar-title>
      </v-toolbar>
    </template>

    <!-- Custom cell rendering -->
    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" small dark>
        {{ item.status }}
      </v-chip>
    </template>

    <!-- Custom actions -->
    <template #item.actions="{ item }">
      <v-btn icon small @click="editItem(item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon small @click="deleteItem(item)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </h-table>
</template>

<script>
export default {
  methods: {
    getStatusColor(status) {
      const colors = {
        active: "success",
        pending: "warning",
        inactive: "error",
      };
      return colors[status] || "grey";
    },
  },
};
</script>
```

---

### Overriding Defaults

Override default component props globally:

**src/plugins/vuetify.js:**

```javascript
export default new Vuetify({
  theme: {
    /* ... */
  },

  // Component defaults
  defaults: {
    VBtn: {
      text: true,
      color: "primary",
    },
    VCard: {
      elevation: 2,
      outlined: false,
    },
    VTextField: {
      outlined: true,
      dense: true,
    },
    VDataTable: {
      itemsPerPage: 15,
      dense: true,
    },
  },
});
```

---

### Custom Components

Wrap hola-web components for project-specific defaults:

**components/MyCustomTable.vue:**

```vue
<template>
  <h-table v-bind="$attrs" v-on="$listeners" :items-per-page="25" :dense="true" :loading="loading" class="custom-table">
    <!-- Forward all slots -->
    <template v-for="(_, slot) in $scopedSlots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </h-table>
</template>

<script>
export default {
  name: "MyCustomTable",

  inheritAttrs: false,

  data() {
    return {
      loading: false,
    };
  },
};
</script>

<style scoped>
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}
</style>
```

**Usage:**

```vue
<my-custom-table :headers="headers" :items="items" />
```

---

## Layout Customization

### Application Layout

Customize the main application layout in `App.vue`:

```vue
<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark elevate-on-scroll clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>{{ appTitle }}</v-toolbar-title>
      <v-spacer />

      <!-- Search -->
      <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details filled dense rounded class="mx-4" style="max-width: 400px" />

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn icon v-on="on">
            <v-avatar size="36">
              <v-img :src="user.avatar" />
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="viewProfile">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>

          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app clipped :mini-variant="miniDrawer">
      <v-list nav dense>
        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template #append>
        <v-btn icon @click="miniDrawer = !miniDrawer">
          <v-icon>
            {{ miniDrawer ? "mdi-chevron-right" : "mdi-chevron-left" }}
          </v-icon>
        </v-btn>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app inset>
      <span>&copy; 2026 My Application</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      miniDrawer: false,
      searchQuery: "",
      appTitle: "My Application",
      user: {
        avatar: "/default-avatar.png",
      },
      menuItems: [
        { icon: "mdi-view-dashboard", title: "Dashboard", route: "/" },
        { icon: "mdi-account-multiple", title: "Users", route: "/users" },
        { icon: "mdi-cog", title: "Settings", route: "/settings" },
      ],
    };
  },
};
</script>
```

---

### Responsive Layout

Use Vuetify breakpoints for responsive design:

```vue
<template>
  <v-container>
    <v-row>
      <!-- Full width on mobile, half on desktop -->
      <v-col cols="12" md="6">
        <v-card>Card 1</v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>Card 2</v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    isDesktop() {
      return this.$vuetify.breakpoint.mdAndUp;
    },
  },
};
</script>
```

**Breakpoints:**

- `xs`: < 600px
- `sm`: 600px - 960px
- `md`: 960px - 1280px
- `lg`: 1280px - 1920px
- `xl`: > 1920px

---

## Internationalization

### Setup

**src/i18n.js:**

```javascript
import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

Vue.use(VueI18n);

export default new VueI18n({
  locale: localStorage.getItem("locale") || "en",
  fallbackLocale: "en",
  messages: {
    en,
    es,
    fr,
  },
});
```

---

### Translation Files

**src/locales/en.json:**

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search"
  },
  "user": {
    "title": "Users",
    "name": "Name",
    "email": "Email",
    "role": "Role"
  },
  "messages": {
    "saveSuccess": "Saved successfully",
    "deleteConfirm": "Are you sure you want to delete this item?"
  }
}
```

**src/locales/es.json:**

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "search": "Buscar"
  },
  "user": {
    "title": "Usuarios",
    "name": "Nombre",
    "email": "Correo Electrónico",
    "role": "Rol"
  },
  "messages": {
    "saveSuccess": "Guardado exitosamente",
    "deleteConfirm": "¿Está seguro de que desea eliminar este elemento?"
  }
}
```

---

### Usage in Components

```vue
<template>
  <div>
    <h1>{{ $t("user.title") }}</h1>

    <v-btn @click="save">
      {{ $t("common.save") }}
    </v-btn>

    <!-- Pluralization -->
    <p>{{ $tc("messages.itemCount", itemCount) }}</p>

    <!-- With parameters -->
    <p>{{ $t("messages.welcome", { name: userName }) }}</p>
  </div>
</template>

<script>
export default {
  methods: {
    async save() {
      try {
        await this.saveData();
        this.$alert.show({
          msg: this.$t("messages.saveSuccess"),
          type: "success",
        });
      } catch (error) {
        this.$alert.show({
          msg: this.$t("messages.saveError"),
          type: "error",
        });
      }
    },
  },
};
</script>
```

---

### Language Switcher

```vue
<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn text v-on="on">
        <v-icon left>mdi-translate</v-icon>
        {{ currentLocale.toUpperCase() }}
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-for="locale in availableLocales" :key="locale.code" @click="changeLocale(locale.code)">
        <v-list-item-title>{{ locale.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      availableLocales: [
        { code: "en", name: "English" },
        { code: "es", name: "Español" },
        { code: "fr", name: "Français" },
      ],
    };
  },

  computed: {
    currentLocale() {
      return this.$i18n.locale;
    },
  },

  methods: {
    changeLocale(locale) {
      this.$i18n.locale = locale;
      localStorage.setItem("locale", locale);

      // Update Vuetify locale
      this.$vuetify.lang.current = locale;
    },
  },
};
</script>
```

---

## Advanced Theming

### Custom Theme Preset

Create reusable theme presets:

**src/themes/presets.js:**

```javascript
export const corporateTheme = {
  light: {
    primary: "#004D40", // Dark Teal
    secondary: "#00897B", // Teal
    accent: "#26A69A", // Light Teal
    error: "#D32F2F",
    info: "#1976D2",
    success: "#388E3C",
    warning: "#F57C00",
  },
  dark: {
    primary: "#4DB6AC",
    secondary: "#00897B",
    accent: "#26A69A",
    error: "#EF5350",
    info: "#42A5F5",
    success: "#66BB6A",
    warning: "#FFA726",
  },
};

export const modernTheme = {
  light: {
    primary: "#6200EA", // Deep Purple
    secondary: "#03DAC6", // Teal
    accent: "#FF4081", // Pink
    error: "#B00020",
    info: "#0091EA",
    success: "#00C853",
    warning: "#FFD600",
  },
  dark: {
    primary: "#BB86FC",
    secondary: "#03DAC6",
    accent: "#FF4081",
    error: "#CF6679",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
  },
};
```

**Apply preset:**

```javascript
import { corporateTheme } from "./themes/presets";

export default new Vuetify({
  theme: {
    themes: corporateTheme,
  },
});
```

---

### Runtime Theme Updates

Change theme colors at runtime:

```javascript
methods: {
  updateTheme(newColors) {
    Object.keys(newColors).forEach(key => {
      this.$vuetify.theme.themes.light[key] = newColors[key];
      this.$vuetify.theme.themes.dark[key] = newColors[key];
    });
  }
}

// Usage
this.updateTheme({
  primary: '#FF5722',
  secondary: '#607D8B'
});
```

---

### Component Variants

Create themed component variants:

```vue
<!-- CardVariant.vue -->
<template>
  <v-card :class="variantClass" v-bind="$attrs" v-on="$listeners">
    <slot />
  </v-card>
</template>

<script>
export default {
  props: {
    variant: {
      type: String,
      default: "default",
      validator: (v) => ["default", "elevated", "outlined", "flat"].includes(v),
    },
  },

  computed: {
    variantClass() {
      return `card-variant-${this.variant}`;
    },
  },
};
</script>

<style scoped>
.card-variant-elevated {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.card-variant-outlined {
  border: 2px solid var(--v-primary-base) !important;
}

.card-variant-flat {
  box-shadow: none !important;
  background: transparent !important;
}
</style>
```

---

## Best Practices

### 1. Use Theme Colors

Always use theme colors instead of hardcoded values:

```vue
<!-- Good -->
<v-card color="primary">...</v-card>
<div class="primary--text">Text</div>

<!-- Bad -->
<v-card style="background: #1976D2">...</v-card>
<div style="color: #1976D2">Text</div>
```

---

### 2. Responsive Design

Design mobile-first, then enhance for larger screens:

```vue
<v-row>
  <!-- Stack on mobile, side-by-side on tablet+ -->
  <v-col cols="12" sm="6" md="4">
    <v-card>Content</v-card>
  </v-col>
</v-row>
```

---

### 3. Consistent Spacing

Use Vuetify spacing classes:

```vue
<!-- Margin -->
<div class="ma-4">Margin all sides: 16px</div>
<div class="mt-2">Margin top: 8px</div>
<div class="mx-auto">Margin horizontal: auto (center)</div>

<!-- Padding -->
<div class="pa-4">Padding all sides: 16px</div>
<div class="pt-2">Padding top: 8px</div>

<!-- Spacing scale: 0-16 (0, 4px, 8px, 12px, 16px, ..., 64px) -->
```

---

### 4. Accessibility

Ensure adequate color contrast and keyboard navigation:

```vue
<!-- Good: sufficient contrast -->
<v-btn color="primary" dark>Button</v-btn>

<!-- Good: keyboard accessible -->
<v-btn @click="action" @keydown.enter="action">
  Click or press Enter
</v-btn>

<!-- Good: ARIA labels -->
<v-btn icon aria-label="Delete item">
  <v-icon>mdi-delete</v-icon>
</v-btn>
```

---

### 5. Performance

Optimize theme switching and styling:

```javascript
// Cache theme preference
mounted() {
  const theme = localStorage.getItem('theme');
  if (theme) {
    this.$vuetify.theme.dark = theme === 'dark';
  }
},

// Debounce theme updates
import { debounce } from 'lodash-es';

methods: {
  updateTheme: debounce(function(colors) {
    Object.assign(this.$vuetify.theme.themes.light, colors);
  }, 300)
}
```

---

## Examples

### Complete Custom Theme

```javascript
// src/plugins/vuetify.js
import Vue from "vue";
import Vuetify from "vuetify/lib";

export default new Vuetify({
  theme: {
    dark: false,

    themes: {
      light: {
        primary: "#1976D2",
        secondary: "#424242",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FB8C00",
        background: "#F5F5F5",
        surface: "#FFFFFF",
      },
      dark: {
        primary: "#2196F3",
        secondary: "#616161",
        accent: "#FF4081",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FB8C00",
        background: "#121212",
        surface: "#1E1E1E",
      },
    },

    options: {
      customProperties: true,
      variations: true,
    },
  },

  defaults: {
    VBtn: {
      rounded: true,
      elevation: 0,
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      outlined: true,
    },
    VDataTable: {
      dense: true,
      itemsPerPage: 15,
    },
  },
});
```

---

## Troubleshooting

**Problem:** Theme colors not updating

**Solution:** Ensure `customProperties: true` in Vuetify config

---

**Problem:** Styles not applying in production

**Solution:** Check CSS purging configuration in `vue.config.js`:

```javascript
module.exports = {
  css: {
    extract: {
      ignoreOrder: true,
    },
  },
};
```

---

**Problem:** Dark mode flicker on page load

**Solution:** Apply theme before Vue mounts:

```javascript
// main.js
const darkMode = localStorage.getItem("darkMode") === "true";
vuetify.framework.theme.dark = darkMode;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
```

---

**Last Updated:** January 9, 2026  
**Version:** 2.0.0
