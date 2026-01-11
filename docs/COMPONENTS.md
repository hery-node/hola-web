# Hola-Web Component Library Reference

Complete documentation for all 42 components in the hola-web meta-programming framework.

**Version:** 2.0.0  
**Framework:** Vue 2.7 + Vuetify 2.6  
**Last Updated:** January 9, 2026

---

## Table of Contents

- [Component Categories](#component-categories)
- [Form Components](#form-components)
- [Table Components](#table-components)
- [Dialog Components](#dialog-components)
- [Chart Components](#chart-components)
- [View Components](#view-components)
- [Meta-Integrated Components](#meta-integrated-components)
  - [Entity Display](#entity-display)
  - [Entity Input](#entity-input)
  - [Advanced Views](#advanced-views)
  - [Query & Filter](#query--filter)
  - [Bulk Operations](#bulk-operations)
  - [Workflow & Utility](#workflow--utility)
- [Navigation Components](#navigation-components)
- [Usage Patterns](#usage-patterns)

---

## Component Categories

### Component Naming Convention

All components use the `h-` prefix for global registration:

- **Form Components:** `h-form`, `h-edit-form`, `h-search-form`, `h-wizard`
- **Table Components:** `h-table`, `h-list`, `h-crud`, `h-array`, `h-property`
- **Chart Components:** `h-chart`, `h-line-chart`, `h-bar-chart`, `h-pie-chart`
- **Meta-Integrated:** `h-calendar`, `h-timeline`, `h-tree`, `h-kanban`, etc.

---

## Form Components

### h-form (BasicForm)

**Purpose:** Simple form component for basic data entry.

**Props:**

- `fields` (Array) - Field definitions
- `data` (Object) - Form data model
- `readonly` (Boolean) - Disable editing

**Events:**

- `submit` - Emitted when form submitted
- `cancel` - Emitted when canceled

**Example:**

```vue
<h-form :fields="user_fields" :data="user_data" @submit="handleSubmit" />
```

---

### h-edit-form (EditForm)

**Purpose:** Meta-aware form for entity CRUD operations with automatic field generation.

**Props:**

- `entity` (String, required) - Entity name
- `item` (Object) - Entity data to edit
- `fields` (Array) - Override field list
- `readonly` (Boolean) - View-only mode

**Events:**

- `save` - Emitted with entity data
- `cancel` - Emitted when canceled

**Features:**

- Automatic field discovery from entity metadata
- Field type detection (string, number, date, ref, array)
- Validation based on metadata constraints
- Reference field autocomplete
- Array field editing

**Example:**

```vue
<h-edit-form entity="user" :item="user" @save="saveUser" @cancel="closeDialog" />
```

**Metadata Integration:** The component loads entity metadata and generates appropriate input controls:

- String fields → v-text-field
- Number fields → v-text-field (type="number")
- Date fields → v-date-picker
- Boolean fields → v-checkbox
- Enum fields → v-select
- Reference fields → v-autocomplete with remote search
- Array fields → ArrayTable component

---

### h-search-form (SearchForm)

**Purpose:** Search form with field-specific filters.

**Props:**

- `entity` (String) - Entity name for metadata
- `fields` (Array) - Search fields
- `initial` (Object) - Initial search values

**Events:**

- `search` - Emitted with search criteria

**Example:**

```vue
<h-search-form entity="task" @search="performSearch" />
```

---

### h-wizard (EntityWizard)

**Purpose:** Multi-step form wizard for complex entity creation.

**Props:**

- `entity` (String, required) - Entity name
- `wizardTitle` (String) - Custom wizard title
- `stepGroups` (Array) - Custom step definitions
- `initialData` (Object) - Pre-filled data
- `showSummary` (Boolean, default: true) - Show summary step

**Events:**

- `submitted` - Emitted with complete entity data
- `error` - Emitted on submission error

**Example:**

```vue
<h-wizard
  entity="project"
  :step-groups="[
    { title: 'Basic Info', fields: ['name', 'description'] },
    { title: 'Settings', fields: ['status', 'priority', 'due_date'] },
  ]"
  @submitted="handleProjectCreated"
/>
```

**Features:**

- Auto-generates steps from entity metadata (5 fields per step)
- Step validation before proceeding
- Progress indicator
- Summary review before submission
- Field validation per step

---

## Table Components

### h-table (DataTable)

**Purpose:** Data table with sorting, filtering, and pagination.

**Props:**

- `headers` (Array, required) - Column definitions
- `items` (Array, required) - Table data
- `loading` (Boolean) - Show loading state
- `search` (String) - Search query
- `itemsPerPage` (Number, default: 10)

**Events:**

- `click:row` - Emitted when row clicked
- `update:options` - Emitted when table options change

**Example:**

```vue
<h-table
  :headers="[
    { text: 'Name', value: 'name' },
    { text: 'Email', value: 'email' },
    { text: 'Role', value: 'role' },
  ]"
  :items="users"
  @click:row="viewUser"
/>
```

---

### h-list (DataList)

**Purpose:** Card-based list view for mobile-friendly display.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - List items
- `titleField` (String) - Field for card title
- `subtitleField` (String) - Field for card subtitle

**Events:**

- `click` - Emitted when item clicked
- `action` - Emitted for item actions

**Example:**

```vue
<h-list entity="task" :items="tasks" title-field="title" subtitle-field="description" @click="viewTask" />
```

---

### h-crud (CrudTable)

**Purpose:** Complete CRUD table with inline create, edit, delete operations.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Data items
- `headers` (Array) - Override headers
- `readonly` (Boolean) - Disable editing

**Events:**

- `create` - Emitted when creating entity
- `update` - Emitted when updating entity
- `delete` - Emitted when deleting entity
- `refresh` - Emitted to request data reload

**Example:**

```vue
<h-crud entity="user" :items="users" @create="createUser" @update="updateUser" @delete="deleteUser" @refresh="loadUsers" />
```

**Features:**

- Inline row editing
- Add new row functionality
- Delete with confirmation
- Metadata-driven columns
- Automatic field types
- Reference field resolution

---

### h-array (ArrayTable)

**Purpose:** Edit array-type entity fields.

**Props:**

- `entity` (String) - Parent entity name
- `field` (String, required) - Array field name
- `items` (Array, required) - Array items
- `readonly` (Boolean)

**Events:**

- `input` - Emitted with updated array

**Example:**

```vue
<h-array entity="project" field="tags" :items="project.tags" @input="updateTags" />
```

---

### h-property (PropertyTable)

**Purpose:** Display entity properties in key-value format.

**Props:**

- `entity` (String) - Entity name
- `item` (Object, required) - Entity object
- `fields` (Array) - Fields to display

**Example:**

```vue
<h-property entity="user" :item="user" />
```

---

### h-array-entity (ArrayEntity)

**Purpose:** Nested entity array editing.

**Props:**

- `entity` (String, required) - Entity type
- `items` (Array, required) - Nested entities
- `fields` (Array) - Field definitions

**Events:**

- `input` - Emitted with updated array

---

### h-dash-table (DashboardTable)

**Purpose:** Dashboard table with aggregations and summaries.

**Props:**

- `entity` (String) - Entity name
- `items` (Array, required) - Data items
- `aggregations` (Array) - Aggregation definitions

**Example:**

```vue
<h-dash-table entity="sales" :items="sales_data" :aggregations="['sum:amount', 'count:*']" />
```

---

## Dialog Components

### h-confirm (ConfirmDialog)

**Purpose:** Confirmation dialog for destructive actions.

**Props:**

- `title` (String) - Dialog title
- `message` (String) - Confirmation message
- `confirmText` (String, default: "Confirm")
- `cancelText` (String, default: "Cancel")

**Events:**

- `confirm` - Emitted when confirmed
- `cancel` - Emitted when canceled

**Example:**

```vue
<h-confirm title="Delete User" message="Are you sure you want to delete this user?" @confirm="deleteUser" />
```

---

### h-window (BasicWindow)

**Purpose:** Modal window for forms and content.

**Props:**

- `title` (String) - Window title
- `width` (Number, default: 600) - Window width
- `persistent` (Boolean) - Prevent outside click to close

**Slots:**

- `default` - Window content
- `actions` - Action buttons

**Example:**

```vue
<h-window title="Edit User" :width="800">
  <h-edit-form entity="user" :item="user" />
  <template #actions>
    <v-btn @click="save">Save</v-btn>
  </template>
</h-window>
```

---

## Chart Components

### h-chart (ChartView)

**Purpose:** Generic chart wrapper using ECharts.

**Props:**

- `options` (Object, required) - ECharts configuration
- `height` (String, default: "400px")
- `autoresize` (Boolean, default: true)

**Example:**

```vue
<h-chart :options="chartOptions" height="500px" />
```

---

### h-line-chart (ChartLineView)

**Purpose:** Line chart for time-series data.

**Props:**

- `data` (Array, required) - Chart data
- `xField` (String) - X-axis field
- `yField` (String) - Y-axis field
- `title` (String) - Chart title

**Example:**

```vue
<h-line-chart :data="sales_over_time" x-field="date" y-field="revenue" title="Monthly Revenue" />
```

---

### h-bar-chart (ChartBarView)

**Purpose:** Bar chart for categorical comparisons.

**Props:**

- `data` (Array, required) - Chart data
- `categoryField` (String) - Category field
- `valueField` (String) - Value field
- `horizontal` (Boolean) - Horizontal bars

**Example:**

```vue
<h-bar-chart :data="products" category-field="name" value-field="sales" title="Product Sales" />
```

---

### h-pie-chart (ChartPieView)

**Purpose:** Pie/donut chart for proportional data.

**Props:**

- `data` (Array, required) - Chart data
- `nameField` (String) - Label field
- `valueField` (String) - Value field
- `donut` (Boolean) - Donut style

**Example:**

```vue
<h-pie-chart :data="category_distribution" name-field="category" value-field="count" :donut="true" />
```

---

### h-combo-chart (ChartComboView)

**Purpose:** Combination chart (bars + line).

**Props:**

- `data` (Array, required) - Chart data
- `barFields` (Array) - Bar series fields
- `lineFields` (Array) - Line series fields

**Example:**

```vue
<h-combo-chart :data="monthly_data" :bar-fields="['sales', 'costs']" :line-fields="['profit']" />
```

---

### h-simple-chart (ChartSimpleView)

**Purpose:** Simplified chart with minimal configuration.

**Props:**

- `type` (String, required) - Chart type: line, bar, pie
- `data` (Array, required) - Chart data
- `title` (String) - Chart title

**Example:**

```vue
<h-simple-chart type="bar" :data="[10, 20, 30, 40]" title="Simple Bar Chart" />
```

---

### h-dash-chart (ChartDashboardView)

**Purpose:** Multi-chart dashboard grid.

**Props:**

- `charts` (Array, required) - Chart configurations
- `cols` (Number, default: 2) - Grid columns

**Example:**

```vue
<h-dash-chart
  :charts="[
    { type: 'line', data: salesData, title: 'Sales' },
    { type: 'pie', data: categoryData, title: 'Categories' },
  ]"
  :cols="2"
/>
```

---

## View Components

### h-card (CardView)

**Purpose:** Metric card with value and trend.

**Props:**

- `title` (String) - Card title
- `value` (Number|String) - Main value
- `trend` (Number) - Trend percentage
- `icon` (String) - Material Design icon
- `color` (String) - Card color

**Example:**

```vue
<h-card title="Total Sales" :value="45678" :trend="12.5" icon="mdi-currency-usd" color="success" />
```

---

### h-offset (OffsetView)

**Purpose:** Offset pagination view.

**Props:**

- `total` (Number, required) - Total items
- `offset` (Number) - Current offset
- `limit` (Number) - Items per page

**Events:**

- `change` - Emitted with new offset

---

### h-compare (CompareTable)

**Purpose:** Side-by-side table comparison.

**Props:**

- `leftItems` (Array) - Left table data
- `rightItems` (Array) - Right table data
- `headers` (Array) - Column headers

---

### h-compare-entity (CompareEntity)

**Purpose:** Entity-level comparison.

**Props:**

- `entity` (String) - Entity name
- `leftItem` (Object) - First entity
- `rightItem` (Object) - Second entity

---

## Meta-Integrated Components

### Entity Display

#### h-calendar (EntityCalendarView)

**Purpose:** Calendar view for entities with date fields.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Entity data
- `dateField` (String) - Date field (auto-detected)
- `endDateField` (String) - End date for ranges
- `titleField` (String) - Event title field
- `colorFunction` (Function) - Custom color per entity

**Events:**

- `edit` - Emitted when entity clicked

**Example:**

```vue
<h-calendar entity="event" :items="events" date-field="start_date" end-date-field="end_date" @edit="editEvent" />
```

**Features:**

- Auto-discovers date/datetime fields
- Multiple view types (month, week, day)
- Event color coding
- Click to view/edit
- Supports date ranges

---

#### h-timeline (EntityTimelineView)

**Purpose:** Chronological timeline for dated entities.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Entity data
- `dateField` (String) - Date field (auto-detected)
- `titleField` (String) - Title field
- `visibleFields` (Array) - Fields to display
- `dense` (Boolean) - Compact layout
- `reverse` (Boolean) - Reverse chronological order
- `pageSize` (Number, default: 20) - Items per page

**Events:**

- `view` - Emitted when view clicked
- `edit` - Emitted when edit clicked

**Example:**

```vue
<h-timeline entity="activity" :items="activities" :visible-fields="['user', 'action', 'description']" @edit="editActivity" />
```

**Features:**

- Infinite scroll pagination
- Custom icons and colors
- Field-level display control
- Chronological or reverse order

---

#### h-tree (EntityTreeView)

**Purpose:** Hierarchical tree for parent-child relationships.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Entity data
- `parentField` (String) - Parent reference field (auto-detected)
- `titleField` (String) - Node title field
- `iconFunction` (Function) - Custom icon per entity
- `enableDragDrop` (Boolean) - Enable reordering

**Events:**

- `view` - Emitted when view clicked
- `edit` - Emitted when edit clicked
- `create-child` - Emitted when add child clicked
- `delete` - Emitted when delete clicked
- `move` - Emitted when node moved

**Example:**

```vue
<h-tree entity="category" :items="categories" parent-field="parent_id" @create-child="createSubcategory" />
```

**Features:**

- Auto-builds hierarchy from flat data
- Lazy-loading for large trees
- Context menu with CRUD actions
- Search and filter
- Drag-and-drop reordering (optional)

---

#### h-kanban (EntityKanbanView)

**Purpose:** Kanban board with drag-drop status updates.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Entity data
- `statusField` (String) - Status/stage field (auto-detected)
- `titleField` (String) - Card title field
- `displayFields` (Array) - Fields on cards
- `priorityField` (String) - Priority color coding
- `showAggregations` (Boolean) - Show column totals

**Events:**

- `view` - Emitted when card clicked
- `edit` - Emitted when edit clicked
- `create` - Emitted when add clicked (with column value)
- `update-status` - Emitted when card moved

**Example:**

```vue
<h-kanban entity="task" :items="tasks" status-field="status" priority-field="priority" :priority-colors="{ high: 'red', medium: 'orange', low: 'green' }" :show-aggregations="true" @update-status="updateTaskStatus" />
```

**Features:**

- Auto-detects enum/status fields
- Drag-and-drop between columns
- Column aggregations (count, sum)
- Priority color coding
- Quick-create in specific columns

---

### Entity Input

#### h-file (FileUploadField)

**Purpose:** File upload with GridFS integration.

**Props:**

- `fieldName` (String, required) - Field name
- `fieldConfig` (Object) - Field metadata
- `value` (Array|String) - Current file IDs
- `disabled` (Boolean)
- `uploadFunction` (Function) - Custom upload handler

**Events:**

- `input` - Emitted with uploaded file IDs
- `error` - Emitted on upload error

**Example:**

```vue
<h-file field-name="avatar" :field-config="{ accept: 'image/*', max_size: 5242880 }" :value="user.avatar" @input="updateAvatar" />
```

**Features:**

- Image and document preview
- Upload progress indicators
- File type and size validation (from metadata)
- Multiple file support
- GridFS backend integration

---

#### h-relationship (RelationshipPicker)

**Purpose:** Advanced picker for entity references.

**Props:**

- `fieldName` (String, required) - Field name
- `fieldConfig` (Object) - Field metadata
- `value` (String|Array) - Current entity IDs
- `referencedEntity` (String, required) - Referenced entity type
- `items` (Array) - Available entities
- `allowCreate` (Boolean) - Show quick-create button

**Events:**

- `input` - Emitted with selected IDs
- `create` - Emitted when quick-create requested

**Example:**

```vue
<h-relationship field-name="assigned_to" referenced-entity="user" :value="task.assigned_to" :allow-create="true" @input="updateAssignee" />
```

**Features:**

- Autocomplete with search
- Advanced dialog with data table
- Multi-select for array references
- Quick-create modal
- Pagination and filtering

---

### Advanced Views

#### h-gallery (EntityGalleryView)

**Purpose:** Image gallery with lightbox.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Entity data
- `imageField` (String) - Image field (auto-detected)
- `titleField` (String) - Image title
- `captionField` (String) - Image caption
- `gridCols` (Number, default: 6) - Grid columns (xs)
- `aspectRatio` (Number, default: 1) - Image aspect ratio
- `showSelection` (Boolean) - Enable batch selection

**Events:**

- `delete` - Emitted for batch delete
- `tag` - Emitted for batch tagging

**Example:**

```vue
<h-gallery entity="photo" :items="photos" :grid-cols="4" :aspect-ratio="1.5" :show-selection="true" @delete="deletePhotos" />
```

**Features:**

- Responsive grid layout
- Lightbox with keyboard navigation
- Batch operations (delete, tag)
- Auto-discovers image fields
- Caption support

---

#### h-compare-view (EntityCompareView)

**Purpose:** Multi-entity comparison with diff highlighting.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - All entities
- `selectedEntities` (Array) - Pre-selected IDs
- `fieldsToCompare` (Array) - Specific fields (optional)
- `showDifferencesOnly` (Boolean) - Filter to diffs only

**Events:**

- `export` - Emitted with comparison data

**Example:**

```vue
<h-compare-view entity="product" :items="products" :selected-entities="[id1, id2, id3]" :show-differences-only="true" @export="exportComparison" />
```

**Features:**

- Compare 2+ entities side-by-side
- Highlight differences by field type
- Visual diff for arrays/objects
- Export comparison results
- Show differences only mode

---

### Query & Filter

#### h-filter-builder (AdvancedFilterBuilder)

**Purpose:** Visual MongoDB query builder.

**Props:**

- `entity` (String, required) - Entity name
- `initialFilter` (Object) - Initial query

**Events:**

- `apply` - Emitted with MongoDB query
- `cancel` - Emitted when canceled

**Example:**

```vue
<h-filter-builder entity="order" @apply="applyFilter" />
```

**Features:**

- All entity fields as filter criteria
- Type-specific operators (=, >, contains, in, etc.)
- Nested AND/OR conditions
- Save/load filter presets (localStorage)
- Query preview

---

#### h-search (EntitySearchView)

**Purpose:** Unified search across multiple entities.

**Props:**

- `entityTypes` (Array) - Entity types to search
- `searchFunction` (Function) - Custom search handler

**Events:**

- `select` - Emitted when result selected
- `edit` - Emitted when edit clicked

**Example:**

```vue
<h-search :entity-types="['user', 'task', 'project']" @select="viewEntity" />
```

**Features:**

- Full-text search
- Field-specific search
- Faceted results by entity type
- Recent searches
- Suggestions

---

### Bulk Operations

#### h-bulk-actions (BulkActionsToolbar)

**Purpose:** Batch operations toolbar.

**Props:**

- `entity` (String, required) - Entity name
- `selectedItems` (Array, required) - Selected entities

**Events:**

- `updated` - Emitted after bulk update
- `delete` - Emitted for bulk delete

**Example:**

```vue
<h-bulk-actions entity="user" :selected-items="selectedUsers" @updated="refreshUsers" @delete="deleteUsers" />
```

**Features:**

- Bulk field update with validation
- Progress tracking for large batches
- Undo support
- Metadata-driven field options

---

#### h-import (BulkImportDialog)

**Purpose:** CSV/Excel import with field mapping.

**Props:**

- `entity` (String, required) - Entity name

**Events:**

- `imported` - Emitted with import count

**Example:**

```vue
<h-import entity="contact" @imported="handleImportComplete" />
```

**Features:**

- CSV and Excel file support
- Auto-map columns to entity fields
- Validation preview before import
- Error handling and partial imports
- Template download based on entity schema

---

#### h-export (BulkExportDialog)

**Purpose:** Multi-format export.

**Props:**

- `entity` (String, required) - Entity name
- `items` (Array, required) - Data to export

**Example:**

```vue
<h-export entity="user" :items="users" />
```

**Features:**

- Select fields to export
- Multiple formats (CSV, Excel, JSON)
- Filtering and sorting before export
- Large dataset streaming

---

### Workflow & Utility

#### h-audit (EntityAuditLog)

**Purpose:** Entity change history.

**Props:**

- `entity` (String, required) - Entity name
- `entityId` (String, required) - Entity ID

**Example:**

```vue
<h-audit entity="user" :entity-id="user._id" />
```

**Features:**

- Create/update/delete history
- Field-level change tracking
- User attribution
- Rollback capability (future)

---

#### h-notifications (EntityNotifications)

**Purpose:** Entity-based notification center.

**Events:**

- `notification-click` - Emitted when notification clicked

**Example:**

```vue
<h-notifications @notification-click="handleNotification" />
```

**Features:**

- Real-time entity change notifications
- Filter by entity type
- Mark as read/unread
- Unread count badge

---

## Navigation Components

### h-nav-bar (NavBar)

**Purpose:** Application navigation bar with hierarchical menus.

**Props:**

- `title` (String) - Application title
- `menus` (Array, required) - Menu structure
- `user` (Object) - Current user info

**Example:**

```vue
<h-nav-bar
  title="My Application"
  :menus="[
    {
      title: 'Management',
      menus: [
        { icon: 'mdi-account', title: 'Users', route: '/users' },
        { icon: 'mdi-cog', title: 'Settings', route: '/settings' },
      ],
    },
  ]"
/>
```

---

### h-mobile-menu (MobileMenu)

**Purpose:** Mobile-optimized navigation drawer.

**Props:**

- `menus` (Array) - Menu items
- `drawer` (Boolean) - Drawer open state

**Events:**

- `update:drawer` - Emitted when drawer toggled

---

## Usage Patterns

### Meta-Programming Pattern

Most components integrate with the meta-programming framework:

```vue
<template>
  <div>
    <!-- Component loads metadata automatically -->
    <h-crud entity="user" :items="users" @create="createUser" @update="updateUser" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
    };
  },

  async mounted() {
    // Load users from API
    this.users = await this.$axios.get("/user");
  },

  methods: {
    async createUser(user_data) {
      await this.$axios.post("/user", user_data);
      // Reload users
    },

    async updateUser(user) {
      await this.$axios.patch(`/user/${user._id}`, user);
    },
  },
};
</script>
```

### Composing Components

Components work together seamlessly:

```vue
<template>
  <v-container>
    <!-- Search -->
    <h-search :entity-types="['user', 'task']" @select="viewEntity" />

    <!-- CRUD Table -->
    <h-crud entity="task" :items="tasks" @create="showWizard = true" />

    <!-- Creation Wizard -->
    <h-wizard v-if="showWizard" entity="task" @submitted="handleTaskCreated" />

    <!-- Bulk Operations -->
    <h-bulk-actions entity="task" :selected-items="selectedTasks" />
  </v-container>
</template>
```

### Custom Metadata

Override auto-detected metadata:

```vue
<h-edit-form
  entity="user"
  :fields="[
    { name: 'name', type: 'string', label: 'Full Name', required: true },
    { name: 'email', type: 'string', label: 'Email Address', required: true },
    { name: 'role', type: 'string', enum: ['admin', 'user'], label: 'User Role' },
  ]"
  :item="user"
/>
```

---

## Best Practices

### 1. Entity Naming

Use consistent, lowercase entity names:

```javascript
entity = "user"; // Good
entity = "User"; // Bad
entity = "users"; // Bad (use singular)
```

### 2. Metadata First

Define comprehensive entity metadata for automatic UI generation:

```javascript
// Backend: entity metadata
{
  entity: "task",
  fields: [
    { name: "title", type: "string", required: true, label: "Task Title" },
    { name: "status", type: "string", enum: ["todo", "in_progress", "done"] },
    { name: "assigned_to", ref: "user", label: "Assignee" },
    { name: "tags", type: "array", items: { type: "string" } }
  ]
}
```

### 3. Event Handling

Handle all component events for complete UX:

```vue
<h-crud entity="user" :items="users" @create="handleCreate" @update="handleUpdate" @delete="handleDelete" @refresh="loadUsers" />
```

### 4. Loading States

Show loading indicators during async operations:

```vue
<h-table :items="users" :loading="loading" />
```

### 5. Error Handling

Implement global error handling:

```javascript
// In axios interceptor or component
this.$axios.interceptors.response.use(
  (response) => response,
  (error) => {
    this.$emit("show-alert", {
      type: "error",
      msg: error.response?.data?.message || "An error occurred",
    });
    return Promise.reject(error);
  }
);
```

---

## Migration Guide

### From v1.x to v2.0

**Component Renames:**

- None - all component names preserved

**Breaking Changes:**

- Vuetify upgraded to 2.6 (check Vuetify migration guide)
- Meta mixin now uses async `load_meta()` method
- Some props renamed for consistency (check individual components)

**New Features:**

- 16 new meta-integrated components
- Enhanced metadata support
- Improved TypeScript definitions (via JSDoc)
- Better mobile responsiveness

**Upgrade Steps:**

1. Update `hola-web` to v2.0.0
2. Update Vuetify to 2.6.x
3. Test all CRUD operations
4. Review component prop changes
5. Update custom metadata schemas

---

## Support & Resources

- **GitHub:** https://github.com/hery-node/hola-web
- **Issues:** https://github.com/hery-node/hola-web/issues
- **Documentation:** See `docs/` folder
- **Examples:** See `docs/EXAMPLES.md`

---

**Last Updated:** January 9, 2026  
**Version:** 2.0.0
