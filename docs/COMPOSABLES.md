# Hola-Web Composables & Mixins

Complete reference for all mixins and composable utilities in the hola-web framework.

**Version:** 2.0.0  
**Framework:** Vue 2.7 + Vuetify 2.6  
**Last Updated:** January 9, 2026

---

## Table of Contents

- [Overview](#overview)
- [Core Mixins](#core-mixins)
  - [Meta Mixin](#meta-mixin)
  - [Alert Mixin](#alert-mixin)
  - [Simple Mixin](#simple-mixin)
  - [Wrap Mixin](#wrap-mixin)
- [Specialized Mixins](#specialized-mixins)
  - [Chart Mixin](#chart-mixin)
  - [Fuzzy Mixin](#fuzzy-mixin)
  - [Keymap Mixin](#keymap-mixin)
  - [Regex Mixin](#regex-mixin)
- [Usage Patterns](#usage-patterns)
- [Best Practices](#best-practices)

---

## Overview

Mixins provide reusable functionality that can be injected into Vue components. The hola-web framework includes 8 core mixins that enable meta-programming, chart creation, fuzzy search, keyboard shortcuts, and more.

### Including Mixins

```vue
<script>
import Meta from "@/mixins/meta";
import Alert from "@/mixins/alert";

export default {
  mixins: [Meta, Alert],

  async mounted() {
    // Meta mixin methods available
    await this.load_meta("user");

    // Alert mixin methods available
    this.show_alert({ msg: "Welcome!", type: "success" });
  },
};
</script>
```

---

## Core Mixins

### Meta Mixin

**File:** `src/mixins/meta.js`

**Purpose:** Provides meta-programming capabilities for automatic UI generation from entity metadata.

#### Methods

##### `async load_meta(entity)`

Loads entity metadata from the backend.

**Parameters:**

- `entity` (String) - Entity name

**Returns:** Promise<Object> - Entity metadata

**Sets:**

- `this.meta` - Entity metadata object
- `this.entity` - Current entity name

**Example:**

```javascript
async mounted() {
  await this.load_meta('user');
  console.log(this.meta.fields); // All entity fields
}
```

---

##### `get_table_headers(visible_fields)`

Generates Vuetify data table headers from entity metadata.

**Parameters:**

- `visible_fields` (Array, optional) - Specific fields to include

**Returns:** Array - Vuetify header objects with `{ text, value, sortable, align }`

**Example:**

```javascript
computed: {
  headers() {
    return this.get_table_headers(['name', 'email', 'role']);
  }
}
```

**Generated Headers:**

```javascript
[
  { text: "Name", value: "name", sortable: true },
  { text: "Email", value: "email", sortable: true },
  { text: "Role", value: "role", sortable: true },
];
```

---

##### `get_form_fields(editable_fields)`

Generates form field configurations from entity metadata.

**Parameters:**

- `editable_fields` (Array, optional) - Specific fields to include

**Returns:** Array - Field configuration objects

**Example:**

```javascript
computed: {
  formFields() {
    return this.get_form_fields(['name', 'email']);
  }
}
```

**Field Configuration:**

```javascript
[
  {
    name: "name",
    type: "string",
    label: "Name",
    required: true,
    component: "v-text-field",
  },
  {
    name: "email",
    type: "string",
    label: "Email",
    required: true,
    component: "v-text-field",
    rules: ["email"],
  },
];
```

---

##### `get_field_config(field_name)`

Retrieves configuration for a specific field.

**Parameters:**

- `field_name` (String) - Field name

**Returns:** Object|undefined - Field configuration

**Example:**

```javascript
const emailConfig = this.get_field_config("email");
// { name: 'email', type: 'string', required: true, ... }
```

---

##### `get_field_label(field_name)`

Gets the display label for a field.

**Parameters:**

- `field_name` (String) - Field name

**Returns:** String - Humanized label

**Example:**

```javascript
this.get_field_label("first_name"); // "First Name"
this.get_field_label("email"); // "Email"
```

---

##### `resolve_reference(field_name, value)`

Resolves a reference field to its display value.

**Parameters:**

- `field_name` (String) - Reference field name
- `value` (String|Object) - Entity ID or populated object

**Returns:** Promise<String> - Display value

**Example:**

```javascript
// If value is ID
const userName = await this.resolve_reference("assigned_to", "user_id_123");
// Fetches user and returns display field

// If value is already populated
const userName = await this.resolve_reference("assigned_to", { _id: "123", name: "John" });
// Returns "John"
```

---

##### `format_field_value(field_name, value)`

Formats a field value for display based on its type.

**Parameters:**

- `field_name` (String) - Field name
- `value` (Any) - Raw value

**Returns:** String - Formatted value

**Example:**

```javascript
this.format_field_value("created_at", new Date()); // "Jan 9, 2026 10:30 AM"
this.format_field_value("price", 1234.56); // "$1,234.56"
this.format_field_value("active", true); // "Yes"
this.format_field_value("tags", ["a", "b", "c"]); // "a, b, c"
```

---

#### Data Properties

- `meta` (Object) - Loaded entity metadata
- `entity` (String) - Current entity name
- `loading_meta` (Boolean) - Metadata loading state

#### Usage Example

```vue
<template>
  <div>
    <v-data-table :headers="table_headers" :items="items" :loading="loading_meta">
      <template #item.assigned_to="{ item }">
        {{ format_field_value("assigned_to", item.assigned_to) }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Meta from "@/mixins/meta";

export default {
  mixins: [Meta],

  data() {
    return {
      items: [],
    };
  },

  computed: {
    table_headers() {
      return this.get_table_headers();
    },
  },

  async mounted() {
    await this.load_meta("task");
    this.items = await this.$axios.get("/task");
  },
};
</script>
```

---

### Alert Mixin

**File:** `src/mixins/alert.js`

**Purpose:** Provides unified alert/notification system using Vuetify snackbars.

#### Methods

##### `show_alert(options)`

Displays an alert message.

**Parameters:**

- `options` (Object):
  - `msg` (String, required) - Alert message
  - `type` (String) - Alert type: `success`, `error`, `warning`, `info` (default: `info`)
  - `timeout` (Number) - Auto-dismiss timeout in ms (default: 3000)
  - `action` (Object) - Action button configuration:
    - `text` (String) - Button text
    - `handler` (Function) - Click handler

**Example:**

```javascript
// Simple success message
this.show_alert({
  msg: "User created successfully",
  type: "success",
});

// Error with custom timeout
this.show_alert({
  msg: "Failed to save data",
  type: "error",
  timeout: 5000,
});

// With action button
this.show_alert({
  msg: "Item deleted",
  type: "warning",
  action: {
    text: "Undo",
    handler: () => this.undoDelete(),
  },
});
```

---

##### `show_error(error)`

Displays an error alert from an Error object or API response.

**Parameters:**

- `error` (Error|Object) - Error object or axios error response

**Example:**

```javascript
try {
  await this.$axios.post("/user", user_data);
} catch (error) {
  this.show_error(error);
  // Extracts message from error.response.data.message or error.message
}
```

---

##### `show_success(msg)`

Shortcut for success alerts.

**Parameters:**

- `msg` (String) - Success message

**Example:**

```javascript
this.show_success("Changes saved!");
```

---

##### `confirm(options)`

Shows confirmation dialog.

**Parameters:**

- `options` (Object):
  - `title` (String) - Dialog title
  - `message` (String) - Confirmation message
  - `confirmText` (String, default: 'Confirm') - Confirm button text
  - `cancelText` (String, default: 'Cancel') - Cancel button text

**Returns:** Promise<Boolean> - True if confirmed, false if canceled

**Example:**

```javascript
async deleteUser(user) {
  const confirmed = await this.confirm({
    title: 'Delete User',
    message: `Are you sure you want to delete ${user.name}?`,
    confirmText: 'Delete',
  });

  if (confirmed) {
    await this.$axios.delete(`/user/${user._id}`);
    this.show_success('User deleted');
  }
}
```

---

#### Data Properties

- `alert` (Object) - Current alert state:
  - `show` (Boolean) - Visibility
  - `msg` (String) - Message
  - `type` (String) - Alert type
  - `timeout` (Number) - Timeout
  - `action` (Object) - Action button

---

### Simple Mixin

**File:** `src/mixins/simple.js`

**Purpose:** Provides simplified CRUD operations for entity management.

#### Methods

##### `async load_items(entity, query = {})`

Loads items from API.

**Parameters:**

- `entity` (String) - Entity name
- `query` (Object, optional) - Query parameters

**Returns:** Promise<Array> - Items

**Sets:**

- `this.items` - Loaded items
- `this.loading` - Loading state

**Example:**

```javascript
async mounted() {
  await this.load_items('user', { role: 'admin' });
}
```

---

##### `async create_item(entity, item_data)`

Creates a new entity.

**Parameters:**

- `entity` (String) - Entity name
- `item_data` (Object) - Entity data

**Returns:** Promise<Object> - Created item

**Example:**

```javascript
async createUser() {
  const newUser = await this.create_item('user', {
    name: 'John Doe',
    email: 'john@example.com'
  });

  this.items.push(newUser);
  this.show_success('User created');
}
```

---

##### `async update_item(entity, item_id, updates)`

Updates an existing entity.

**Parameters:**

- `entity` (String) - Entity name
- `item_id` (String) - Entity ID
- `updates` (Object) - Fields to update

**Returns:** Promise<Object> - Updated item

**Example:**

```javascript
async updateUser(user) {
  const updated = await this.update_item('user', user._id, {
    role: 'admin'
  });

  Object.assign(user, updated);
  this.show_success('User updated');
}
```

---

##### `async delete_item(entity, item_id)`

Deletes an entity.

**Parameters:**

- `entity` (String) - Entity name
- `item_id` (String) - Entity ID

**Returns:** Promise<void>

**Example:**

```javascript
async deleteUser(user) {
  const confirmed = await this.confirm({
    message: `Delete ${user.name}?`
  });

  if (confirmed) {
    await this.delete_item('user', user._id);
    this.items = this.items.filter(u => u._id !== user._id);
    this.show_success('User deleted');
  }
}
```

---

#### Data Properties

- `items` (Array) - Loaded items
- `loading` (Boolean) - Loading state
- `selected` (Array) - Selected items

---

### Wrap Mixin

**File:** `src/mixins/wrap.js`

**Purpose:** Provides wrapper functions for common async operations with loading states and error handling.

#### Methods

##### `wrap_async(fn, loading_key = 'loading')`

Wraps an async function with loading state management.

**Parameters:**

- `fn` (Function) - Async function to wrap
- `loading_key` (String, optional) - Data property name for loading state

**Returns:** Function - Wrapped function

**Example:**

```javascript
export default {
  mixins: [Wrap],

  methods: {
    loadData: wrap_async(async function () {
      this.items = await this.$axios.get("/items");
    }, "loading_items"),
  },
};

// Usage
await this.loadData(); // this.loading_items = true during execution
```

---

##### `wrap_action(fn, success_msg)`

Wraps an action with loading state, error handling, and success notification.

**Parameters:**

- `fn` (Function) - Async action function
- `success_msg` (String) - Success message

**Example:**

```javascript
methods: {
  saveUser: wrap_action(async function (user_data) {
    await this.$axios.post("/user", user_data);
  }, "User saved successfully");
}

// Usage
await this.saveUser(userData); // Shows success alert or error
```

---

## Specialized Mixins

### Chart Mixin

**File:** `src/mixins/chart.js`

**Purpose:** Provides ECharts integration utilities and common chart configurations.

#### Methods

##### `create_chart_option(type, data, config = {})`

Creates ECharts option object.

**Parameters:**

- `type` (String) - Chart type: `line`, `bar`, `pie`, `scatter`
- `data` (Array|Object) - Chart data
- `config` (Object, optional) - Custom configuration

**Returns:** Object - ECharts option

**Example:**

```javascript
computed: {
  chartOptions() {
    return this.create_chart_option('line', this.sales_data, {
      title: 'Monthly Sales',
      xField: 'month',
      yField: 'revenue'
    });
  }
}
```

---

##### `create_line_chart(data, config)`

Creates line chart configuration.

**Parameters:**

- `data` (Array) - Data points
- `config` (Object):
  - `xField` (String) - X-axis field
  - `yField` (String) - Y-axis field
  - `title` (String) - Chart title
  - `smooth` (Boolean) - Smooth curves
  - `area` (Boolean) - Area fill

**Example:**

```javascript
const options = this.create_line_chart(sales, {
  xField: "date",
  yField: "amount",
  title: "Sales Trend",
  smooth: true,
  area: true,
});
```

---

##### `create_bar_chart(data, config)`

Creates bar chart configuration.

**Parameters:**

- `data` (Array) - Data points
- `config` (Object):
  - `categoryField` (String) - Category field
  - `valueField` (String) - Value field
  - `horizontal` (Boolean) - Horizontal bars
  - `stacked` (Boolean) - Stacked bars

**Example:**

```javascript
const options = this.create_bar_chart(products, {
  categoryField: "name",
  valueField: "sales",
  horizontal: false,
});
```

---

##### `create_pie_chart(data, config)`

Creates pie/donut chart configuration.

**Parameters:**

- `data` (Array) - Data points
- `config` (Object):
  - `nameField` (String) - Label field
  - `valueField` (String) - Value field
  - `donut` (Boolean) - Donut style
  - `radius` (String|Array) - Radius size

**Example:**

```javascript
const options = this.create_pie_chart(categories, {
  nameField: "category",
  valueField: "count",
  donut: true,
  radius: ["40%", "70%"],
});
```

---

##### `format_chart_data(data, xField, yField)`

Transforms data array to ECharts format.

**Parameters:**

- `data` (Array) - Raw data
- `xField` (String) - X-axis field name
- `yField` (String) - Y-axis field name

**Returns:** Object - `{ xData, yData }`

**Example:**

```javascript
const sales = [
  { month: "Jan", revenue: 1000 },
  { month: "Feb", revenue: 1500 },
];

const { xData, yData } = this.format_chart_data(sales, "month", "revenue");
// xData: ['Jan', 'Feb']
// yData: [1000, 1500]
```

---

### Fuzzy Mixin

**File:** `src/mixins/fuzzy.js`

**Purpose:** Provides fuzzy search capabilities for client-side filtering.

#### Methods

##### `fuzzy_search(items, query, fields)`

Performs fuzzy search across multiple fields.

**Parameters:**

- `items` (Array) - Items to search
- `query` (String) - Search query
- `fields` (Array) - Fields to search in

**Returns:** Array - Matching items with scores

**Example:**

```javascript
const results = this.fuzzy_search(users, "jhn doe", ["name", "email"]);
// Finds "John Doe" even with typos
```

---

##### `fuzzy_match(str, pattern)`

Tests if string fuzzy matches pattern.

**Parameters:**

- `str` (String) - String to test
- `pattern` (String) - Search pattern

**Returns:** Boolean - True if matches

**Example:**

```javascript
this.fuzzy_match("JavaScript", "jvscrpt"); // true
this.fuzzy_match("JavaScript", "python"); // false
```

---

##### `fuzzy_score(str, pattern)`

Calculates fuzzy match score (0-1).

**Parameters:**

- `str` (String) - String to test
- `pattern` (String) - Search pattern

**Returns:** Number - Match score

**Example:**

```javascript
this.fuzzy_score("JavaScript", "javascript"); // 1.0 (exact)
this.fuzzy_score("JavaScript", "java"); // 0.75 (partial)
this.fuzzy_score("JavaScript", "xyz"); // 0.0 (no match)
```

---

### Keymap Mixin

**File:** `src/mixins/keymap.js`

**Purpose:** Provides keyboard shortcut registration and handling.

#### Methods

##### `register_keymap(keymap)`

Registers keyboard shortcuts.

**Parameters:**

- `keymap` (Object) - Key bindings map

**Example:**

```javascript
mounted() {
  this.register_keymap({
    'ctrl+s': () => this.save(),
    'ctrl+n': () => this.create(),
    'delete': () => this.delete_selected(),
    'esc': () => this.cancel()
  });
}
```

---

##### `unregister_keymap()`

Removes all registered shortcuts.

**Example:**

```javascript
beforeDestroy() {
  this.unregister_keymap();
}
```

---

##### `handle_keydown(event)`

Internal keyboard event handler (auto-registered).

---

#### Supported Key Combinations

- Single keys: `a`, `enter`, `esc`, `delete`
- With modifiers: `ctrl+s`, `alt+n`, `shift+delete`
- Function keys: `f1`, `f2`, ... `f12`
- Special keys: `tab`, `space`, `backspace`

**Example:**

```vue
<script>
import Keymap from "@/mixins/keymap";

export default {
  mixins: [Keymap],

  mounted() {
    this.register_keymap({
      "ctrl+s": this.saveForm,
      "ctrl+k": this.showCommandPalette,
      esc: this.closeDialog,
      "/": this.focusSearch,
    });
  },

  beforeDestroy() {
    this.unregister_keymap();
  },

  methods: {
    saveForm() {
      console.log("Saving...");
    },

    showCommandPalette() {
      this.commandPaletteOpen = true;
    },

    closeDialog() {
      this.dialog = false;
    },

    focusSearch() {
      this.$refs.searchInput.focus();
    },
  },
};
</script>
```

---

### Regex Mixin

**File:** `src/mixins/regex.js`

**Purpose:** Provides common regex patterns and validation utilities.

#### Properties

##### `regex` (Object)

Common regex patterns:

- `email` - Email validation
- `url` - URL validation
- `phone` - Phone number
- `zipcode` - US zip code
- `date` - ISO date format
- `time` - Time format (HH:MM)
- `hex_color` - Hex color code
- `ipv4` - IPv4 address
- `username` - Alphanumeric + underscore
- `password` - Strong password (8+ chars, mixed case, number, special)

**Example:**

```javascript
if (this.regex.email.test(input)) {
  // Valid email
}
```

---

#### Methods

##### `validate_email(email)`

Validates email address.

**Returns:** Boolean

**Example:**

```javascript
this.validate_email("user@example.com"); // true
this.validate_email("invalid"); // false
```

---

##### `validate_url(url)`

Validates URL.

**Example:**

```javascript
this.validate_url("https://example.com"); // true
this.validate_url("not-a-url"); // false
```

---

##### `validate_phone(phone)`

Validates phone number.

**Example:**

```javascript
this.validate_phone("555-1234"); // true
this.validate_phone("+1 (555) 123-4567"); // true
```

---

##### `validate_password(password)`

Validates strong password.

**Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Example:**

```javascript
this.validate_password("Weak123"); // false (no special char)
this.validate_password("Strong123!"); // true
```

---

##### `sanitize_input(input)`

Sanitizes user input by removing HTML tags and script content.

**Example:**

```javascript
const clean = this.sanitize_input('<script>alert("XSS")</script>Hello');
// Returns: "Hello"
```

---

## Usage Patterns

### Combining Multiple Mixins

```vue
<script>
import Meta from "@/mixins/meta";
import Alert from "@/mixins/alert";
import Simple from "@/mixins/simple";
import Keymap from "@/mixins/keymap";

export default {
  mixins: [Meta, Alert, Simple, Keymap],

  async mounted() {
    // Load entity metadata
    await this.load_meta("task");

    // Load items
    await this.load_items("task");

    // Register keyboard shortcuts
    this.register_keymap({
      "ctrl+n": () => this.showCreateDialog(),
      "ctrl+r": () => this.load_items("task"),
    });
  },

  methods: {
    async saveTask(task) {
      try {
        await this.create_item("task", task);
        this.show_success("Task created!");
      } catch (error) {
        this.show_error(error);
      }
    },
  },
};
</script>
```

---

### Custom Mixin Creation

Create your own mixins following the same pattern:

```javascript
// src/mixins/custom.js
export default {
  data() {
    return {
      custom_state: null,
    };
  },

  methods: {
    custom_method() {
      // Your logic here
    },
  },

  computed: {
    custom_computed() {
      return this.custom_state?.toUpperCase();
    },
  },

  mounted() {
    console.log("Custom mixin mounted");
  },
};
```

**Usage:**

```vue
<script>
import Custom from "@/mixins/custom";

export default {
  mixins: [Custom],

  mounted() {
    this.custom_method();
  },
};
</script>
```

---

## Best Practices

### 1. Mixin Composition

Use mixins for cross-cutting concerns:

```javascript
// Good: Focused mixins
mixins: [Meta, Alert, Keymap];

// Bad: God object component
mixins: [EverythingMixin];
```

---

### 2. Avoid Data Conflicts

Use unique property names in custom mixins:

```javascript
// Good
data() {
  return {
    my_mixin_state: null  // Prefixed
  };
}

// Bad
data() {
  return {
    state: null  // Generic, may conflict
  };
}
```

---

### 3. Lifecycle Hooks

Mixins and component lifecycle hooks are merged:

```javascript
// Mixin
export default {
  mounted() {
    console.log('Mixin mounted');
  }
};

// Component
export default {
  mixins: [MyMixin],

  mounted() {
    console.log('Component mounted');
  }
};

// Output:
// "Mixin mounted"
// "Component mounted"
```

---

### 4. Method Override

Component methods override mixin methods:

```javascript
// Mixin
export default {
  methods: {
    greet() {
      return 'Hello from mixin';
    }
  }
};

// Component
export default {
  mixins: [MyMixin],

  methods: {
    greet() {
      return 'Hello from component';  // This wins
    }
  }
};
```

---

### 5. Cleanup

Always cleanup in `beforeDestroy`:

```javascript
export default {
  mixins: [Keymap],

  mounted() {
    this.register_keymap({ "ctrl+s": this.save });
  },

  beforeDestroy() {
    this.unregister_keymap(); // Cleanup!
  },
};
```

---

## Migration Notes

### From v1.x to v2.0

**Breaking Changes:**

- `Meta.load_meta()` is now async (must use `await`)
- `Alert.show_alert()` signature changed (now takes object instead of positional args)
- `Simple` mixin methods now return Promises

**Migration:**

```javascript
// v1.x
this.load_meta("user"); // Synchronous
this.show_alert("Success!", "success");

// v2.0
await this.load_meta("user"); // Async
this.show_alert({ msg: "Success!", type: "success" });
```

---

## Performance Tips

### 1. Lazy Load Metadata

Only load metadata when needed:

```javascript
async mounted() {
  // Load on demand
  if (this.needsMetadata) {
    await this.load_meta(this.entity);
  }
}
```

---

### 2. Cache Chart Options

Compute chart options once:

```javascript
computed: {
  chartOptions() {
    // Cached by Vue
    return this.create_line_chart(this.data, this.config);
  }
}

// Instead of:
methods: {
  getChartOptions() {
    // Recalculated every call
    return this.create_line_chart(this.data, this.config);
  }
}
```

---

### 3. Debounce Fuzzy Search

Use debouncing for search inputs:

```javascript
import { debounce } from "lodash-es";

export default {
  mixins: [Fuzzy],

  methods: {
    performSearch: debounce(function (query) {
      this.results = this.fuzzy_search(this.items, query, ["name", "email"]);
    }, 300),
  },
};
```

---

## Troubleshooting

### Meta Mixin Issues

**Problem:** `this.meta` is undefined

**Solution:** Ensure `load_meta()` is awaited:

```javascript
async mounted() {
  await this.load_meta('user');  // Don't forget await!
  this.headers = this.get_table_headers();
}
```

---

**Problem:** Headers not updating

**Solution:** Use computed property:

```javascript
computed: {
  headers() {
    return this.meta ? this.get_table_headers() : [];
  }
}
```

---

### Alert Mixin Issues

**Problem:** Alerts not showing

**Solution:** Ensure Alert mixin is included and `<v-snackbar>` component is in template (usually in App.vue).

---

### Keymap Mixin Issues

**Problem:** Shortcuts not working

**Solution:** Ensure component is mounted and focused:

```javascript
mounted() {
  this.register_keymap({ ... });
  this.$el.focus();  // Focus element
}
```

---

## API Reference Summary

| Mixin      | Key Methods                                                       | Use Case                        |
| ---------- | ----------------------------------------------------------------- | ------------------------------- |
| **Meta**   | `load_meta()`, `get_table_headers()`, `get_form_fields()`         | Entity metadata integration     |
| **Alert**  | `show_alert()`, `show_error()`, `confirm()`                       | User notifications              |
| **Simple** | `load_items()`, `create_item()`, `update_item()`, `delete_item()` | Basic CRUD operations           |
| **Wrap**   | `wrap_async()`, `wrap_action()`                                   | Loading states & error handling |
| **Chart**  | `create_line_chart()`, `create_bar_chart()`, `create_pie_chart()` | ECharts integration             |
| **Fuzzy**  | `fuzzy_search()`, `fuzzy_match()`, `fuzzy_score()`                | Client-side search              |
| **Keymap** | `register_keymap()`, `unregister_keymap()`                        | Keyboard shortcuts              |
| **Regex**  | `validate_email()`, `validate_url()`, `validate_password()`       | Input validation                |

---

**Last Updated:** January 9, 2026  
**Version:** 2.0.0
