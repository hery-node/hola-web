# Hola-Web Usage Examples

Practical code examples for building applications with the hola-web meta-programming framework.

**Version:** 2.0.0  
**Framework:** Vue 2.7 + Vuetify 2.6  
**Last Updated:** January 9, 2026

---

## Table of Contents

- [Getting Started](#getting-started)
- [Basic CRUD Examples](#basic-crud-examples)
- [Advanced Component Examples](#advanced-component-examples)
- [Meta-Programming Patterns](#meta-programming-patterns)
- [Real-World Scenarios](#real-world-scenarios)
- [Integration Examples](#integration-examples)

---

## Getting Started

### Simple List View

Create a basic list view with search and actions:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>
        Users
        <v-spacer />
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details />
      </v-card-title>

      <v-card-text>
        <h-table :headers="headers" :items="users" :search="search" :loading="loading" @click:row="viewUser" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      loading: false,
      users: [],
      headers: [
        { text: "Name", value: "name" },
        { text: "Email", value: "email" },
        { text: "Role", value: "role" },
        { text: "Created", value: "created_at" },
      ],
    };
  },

  async mounted() {
    await this.loadUsers();
  },

  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        this.users = await this.$axios.get("/user");
      } finally {
        this.loading = false;
      }
    },

    viewUser(user) {
      this.$router.push(`/users/${user._id}`);
    },
  },
};
</script>
```

---

## Basic CRUD Examples

### Complete CRUD Page

Full CRUD operations with create, edit, delete:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>
        Task Management
        <v-spacer />
        <v-btn color="primary" @click="showCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          New Task
        </v-btn>
      </v-card-title>

      <v-card-text>
        <h-crud entity="task" :items="tasks" @create="handleCreate" @update="handleUpdate" @delete="handleDelete" @refresh="loadTasks" />
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <h-window v-model="dialog" :title="editMode ? 'Edit Task' : 'New Task'" max-width="600">
      <h-edit-form entity="task" :item="currentItem" @save="saveTask" @cancel="dialog = false" />
    </h-window>
  </v-container>
</template>

<script>
import Meta from "@/mixins/meta";
import Alert from "@/mixins/alert";

export default {
  mixins: [Meta, Alert],

  data() {
    return {
      tasks: [],
      dialog: false,
      editMode: false,
      currentItem: {},
    };
  },

  async mounted() {
    await this.load_meta("task");
    await this.loadTasks();
  },

  methods: {
    async loadTasks() {
      try {
        this.tasks = await this.$axios.get("/task");
      } catch (error) {
        this.show_error(error);
      }
    },

    showCreateDialog() {
      this.editMode = false;
      this.currentItem = {};
      this.dialog = true;
    },

    handleCreate() {
      this.showCreateDialog();
    },

    handleUpdate(task) {
      this.editMode = true;
      this.currentItem = { ...task };
      this.dialog = true;
    },

    async handleDelete(task) {
      const confirmed = await this.confirm({
        title: "Delete Task",
        message: `Delete "${task.title}"?`,
      });

      if (confirmed) {
        try {
          await this.$axios.delete(`/task/${task._id}`);
          await this.loadTasks();
          this.show_success("Task deleted");
        } catch (error) {
          this.show_error(error);
        }
      }
    },

    async saveTask(taskData) {
      try {
        if (this.editMode) {
          await this.$axios.patch(`/task/${taskData._id}`, taskData);
          this.show_success("Task updated");
        } else {
          await this.$axios.post("/task", taskData);
          this.show_success("Task created");
        }

        this.dialog = false;
        await this.loadTasks();
      } catch (error) {
        this.show_error(error);
      }
    },
  },
};
</script>
```

---

### Master-Detail View

List with detail panel:

```vue
<template>
  <v-container fluid>
    <v-row>
      <!-- List -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Users</v-card-title>
          <v-card-text>
            <h-list entity="user" :items="users" title-field="name" subtitle-field="email" @click="selectUser" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Detail -->
      <v-col cols="12" md="8">
        <v-card v-if="selectedUser">
          <v-card-title>
            {{ selectedUser.name }}
            <v-spacer />
            <v-btn icon @click="editUser">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <h-property entity="user" :item="selectedUser" />
          </v-card-text>

          <!-- Related Data -->
          <v-card-text>
            <h3 class="mb-4">Tasks</h3>
            <h-table :headers="taskHeaders" :items="userTasks" dense />
          </v-card-text>
        </v-card>

        <v-card v-else>
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey lighten-2"> mdi-account-off </v-icon>
            <p class="mt-4 text--secondary">Select a user to view details</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      selectedUser: null,
      userTasks: [],
      taskHeaders: [
        { text: "Title", value: "title" },
        { text: "Status", value: "status" },
        { text: "Due Date", value: "due_date" },
      ],
    };
  },

  async mounted() {
    await this.loadUsers();
  },

  methods: {
    async loadUsers() {
      this.users = await this.$axios.get("/user");
    },

    async selectUser(user) {
      this.selectedUser = user;
      this.userTasks = await this.$axios.get("/task", {
        params: { assigned_to: user._id },
      });
    },

    editUser() {
      this.$router.push(`/users/${this.selectedUser._id}/edit`);
    },
  },
};
</script>
```

---

## Advanced Component Examples

### Kanban Board

Task management with drag-and-drop:

```vue
<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Project Board
        <v-spacer />
        <v-btn color="primary" @click="createTask">
          <v-icon left>mdi-plus</v-icon>
          Add Task
        </v-btn>
      </v-card-title>

      <v-card-text>
        <h-kanban
          entity="task"
          :items="tasks"
          status-field="status"
          title-field="title"
          :display-fields="['assigned_to', 'due_date', 'priority']"
          :priority-field="'priority'"
          :priority-colors="{
            high: 'red',
            medium: 'orange',
            low: 'green',
          }"
          :show-aggregations="true"
          @view="viewTask"
          @edit="editTask"
          @create="createTaskInColumn"
          @update-status="updateTaskStatus"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Meta from "@/mixins/meta";
import Alert from "@/mixins/alert";

export default {
  mixins: [Meta, Alert],

  data() {
    return {
      tasks: [],
    };
  },

  async mounted() {
    await this.load_meta("task");
    await this.loadTasks();
  },

  methods: {
    async loadTasks() {
      this.tasks = await this.$axios.get("/task");
    },

    viewTask(task) {
      this.$router.push(`/tasks/${task._id}`);
    },

    editTask(task) {
      this.$router.push(`/tasks/${task._id}/edit`);
    },

    createTask() {
      this.$router.push("/tasks/new");
    },

    createTaskInColumn({ column }) {
      this.$router.push({
        path: "/tasks/new",
        query: { status: column },
      });
    },

    async updateTaskStatus({ task, newStatus }) {
      try {
        await this.$axios.patch(`/task/${task._id}`, {
          status: newStatus,
        });

        task.status = newStatus;
        this.show_success("Task status updated");
      } catch (error) {
        this.show_error(error);
        await this.loadTasks(); // Revert UI
      }
    },
  },
};
</script>
```

---

### Calendar View

Event scheduling with calendar:

```vue
<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Events Calendar
        <v-spacer />
        <v-btn-toggle v-model="viewType" mandatory>
          <v-btn value="month">Month</v-btn>
          <v-btn value="week">Week</v-btn>
          <v-btn value="day">Day</v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text>
        <h-calendar entity="event" :items="events" date-field="start_date" end-date-field="end_date" title-field="title" :color-function="getEventColor" @edit="editEvent" />
      </v-card-text>
    </v-card>

    <!-- Event Dialog -->
    <h-window v-model="eventDialog" title="Event Details">
      <v-container v-if="selectedEvent">
        <h2>{{ selectedEvent.title }}</h2>
        <p>{{ selectedEvent.description }}</p>
        <p><strong>Start:</strong> {{ formatDate(selectedEvent.start_date) }}</p>
        <p><strong>End:</strong> {{ formatDate(selectedEvent.end_date) }}</p>

        <template #actions>
          <v-btn text @click="eventDialog = false">Close</v-btn>
          <v-btn color="primary" @click="editEventForm">Edit</v-btn>
        </template>
      </v-container>
    </h-window>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      events: [],
      viewType: "month",
      eventDialog: false,
      selectedEvent: null,
    };
  },

  async mounted() {
    await this.loadEvents();
  },

  methods: {
    async loadEvents() {
      this.events = await this.$axios.get("/event");
    },

    getEventColor(event) {
      const colors = {
        meeting: "blue",
        deadline: "red",
        milestone: "green",
        holiday: "purple",
      };
      return colors[event.type] || "grey";
    },

    editEvent(event) {
      this.selectedEvent = event;
      this.eventDialog = true;
    },

    editEventForm() {
      this.$router.push(`/events/${this.selectedEvent._id}/edit`);
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>
```

---

### Gallery with Lightbox

Image gallery with preview:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>
        Photo Gallery
        <v-spacer />
        <v-btn color="primary" @click="uploadPhotos">
          <v-icon left>mdi-upload</v-icon>
          Upload
        </v-btn>
      </v-card-title>

      <v-card-text>
        <h-gallery entity="photo" :items="photos" image-field="url" title-field="title" caption-field="description" :grid-cols="4" :aspect-ratio="1" :show-selection="true" @delete="deletePhotos" @tag="tagPhotos" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Alert from "@/mixins/alert";

export default {
  mixins: [Alert],

  data() {
    return {
      photos: [],
    };
  },

  async mounted() {
    await this.loadPhotos();
  },

  methods: {
    async loadPhotos() {
      this.photos = await this.$axios.get("/photo");
    },

    uploadPhotos() {
      this.$router.push("/photos/upload");
    },

    async deletePhotos(photoIds) {
      const confirmed = await this.confirm({
        title: "Delete Photos",
        message: `Delete ${photoIds.length} photo(s)?`,
      });

      if (confirmed) {
        try {
          await Promise.all(photoIds.map((id) => this.$axios.delete(`/photo/${id}`)));

          await this.loadPhotos();
          this.show_success(`Deleted ${photoIds.length} photo(s)`);
        } catch (error) {
          this.show_error(error);
        }
      }
    },

    async tagPhotos(photoIds) {
      // Show tag dialog
      const tags = await this.$refs.tagDialog.show();

      if (tags) {
        try {
          await Promise.all(photoIds.map((id) => this.$axios.patch(`/photo/${id}`, { tags })));

          await this.loadPhotos();
          this.show_success("Photos tagged");
        } catch (error) {
          this.show_error(error);
        }
      }
    },
  },
};
</script>
```

---

## Meta-Programming Patterns

### Auto-Generated Form

Completely metadata-driven form:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>Create New {{ entityName }}</v-card-title>

      <v-card-text>
        <h-edit-form :entity="entityName" :item="formData" @save="handleSave" @cancel="$router.back()" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Meta from "@/mixins/meta";
import Alert from "@/mixins/alert";

export default {
  mixins: [Meta, Alert],

  data() {
    return {
      entityName: this.$route.params.entity,
      formData: {},
    };
  },

  async mounted() {
    await this.load_meta(this.entityName);
  },

  methods: {
    async handleSave(data) {
      try {
        await this.$axios.post(`/${this.entityName}`, data);
        this.show_success(`${this.entityName} created successfully`);
        this.$router.push(`/${this.entityName}`);
      } catch (error) {
        this.show_error(error);
      }
    },
  },
};
</script>
```

---

### Dynamic Route Handler

Generic CRUD routes for any entity:

```vue
<!-- views/EntityCrud.vue -->
<template>
  <v-container>
    <v-card>
      <v-card-title>
        {{ meta?.label || entityName }}
        <v-spacer />
        <v-btn color="primary" :to="`/${entityName}/new`">
          <v-icon left>mdi-plus</v-icon>
          Create
        </v-btn>
      </v-card-title>

      <v-card-text>
        <h-crud :entity="entityName" :items="items" @create="create" @update="update" @delete="remove" @refresh="load" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Meta from "@/mixins/meta";
import Simple from "@/mixins/simple";
import Alert from "@/mixins/alert";

export default {
  mixins: [Meta, Simple, Alert],

  data() {
    return {
      entityName: this.$route.params.entity,
    };
  },

  async mounted() {
    await this.load_meta(this.entityName);
    await this.load();
  },

  watch: {
    "$route.params.entity": async function (newEntity) {
      this.entityName = newEntity;
      await this.load_meta(newEntity);
      await this.load();
    },
  },

  methods: {
    async load() {
      await this.load_items(this.entityName);
    },

    create() {
      this.$router.push(`/${this.entityName}/new`);
    },

    async update(item) {
      this.$router.push(`/${this.entityName}/${item._id}/edit`);
    },

    async remove(item) {
      const confirmed = await this.confirm({
        message: `Delete this ${this.entityName}?`,
      });

      if (confirmed) {
        await this.delete_item(this.entityName, item._id);
        await this.load();
        this.show_success("Item deleted");
      }
    },
  },
};
</script>
```

**Router configuration:**

```javascript
// router/index.js
{
  path: '/:entity',
  component: () => import('@/views/EntityCrud.vue'),
  props: true
}
```

---

## Real-World Scenarios

### Dashboard

Multi-widget dashboard:

```vue
<template>
  <v-container fluid>
    <v-row>
      <!-- Metrics -->
      <v-col cols="12" sm="6" md="3">
        <h-card title="Total Users" :value="metrics.totalUsers" :trend="metrics.userGrowth" icon="mdi-account-multiple" color="primary" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <h-card title="Active Tasks" :value="metrics.activeTasks" :trend="metrics.taskGrowth" icon="mdi-clipboard-check" color="success" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <h-card title="Revenue" :value="`$${metrics.revenue.toLocaleString()}`" :trend="metrics.revenueGrowth" icon="mdi-currency-usd" color="warning" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <h-card title="Satisfaction" :value="`${metrics.satisfaction}%`" :trend="metrics.satisfactionChange" icon="mdi-emoticon-happy" color="info" />
      </v-col>
    </v-row>

    <v-row>
      <!-- Charts -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Sales Trend</v-card-title>
          <v-card-text>
            <h-line-chart :data="salesData" x-field="month" y-field="amount" height="400px" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Categories</v-card-title>
          <v-card-text>
            <h-pie-chart :data="categoryData" name-field="name" value-field="count" :donut="true" height="400px" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Recent Activity -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Activities</v-card-title>
          <v-card-text>
            <h-timeline entity="activity" :items="recentActivities" :visible-fields="['user', 'action']" :page-size="10" dense />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tasks -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>My Tasks</v-card-title>
          <v-card-text>
            <h-table :headers="taskHeaders" :items="myTasks" :items-per-page="10" dense />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      metrics: {
        totalUsers: 0,
        userGrowth: 0,
        activeTasks: 0,
        taskGrowth: 0,
        revenue: 0,
        revenueGrowth: 0,
        satisfaction: 0,
        satisfactionChange: 0,
      },
      salesData: [],
      categoryData: [],
      recentActivities: [],
      myTasks: [],
      taskHeaders: [
        { text: "Title", value: "title" },
        { text: "Status", value: "status" },
        { text: "Due", value: "due_date" },
      ],
    };
  },

  async mounted() {
    await this.loadDashboard();
  },

  methods: {
    async loadDashboard() {
      const [metrics, sales, categories, activities, tasks] = await Promise.all([this.$axios.get("/dashboard/metrics"), this.$axios.get("/dashboard/sales"), this.$axios.get("/dashboard/categories"), this.$axios.get("/activity", { params: { limit: 10 } }), this.$axios.get("/task", { params: { assigned_to: "me", limit: 10 } })]);

      this.metrics = metrics;
      this.salesData = sales;
      this.categoryData = categories;
      this.recentActivities = activities;
      this.myTasks = tasks;
    },
  },
};
</script>
```

---

### Multi-Step Wizard

Complex form with validation:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>Create Project</v-card-title>

      <v-card-text>
        <h-wizard entity="project" :step-groups="stepGroups" :initial-data="projectData" @submitted="handleProjectCreated" @error="handleError" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Alert from "@/mixins/alert";

export default {
  mixins: [Alert],

  data() {
    return {
      projectData: {},
      stepGroups: [
        {
          title: "Basic Information",
          fields: ["name", "description", "type"],
        },
        {
          title: "Team & Resources",
          fields: ["owner", "members", "budget"],
        },
        {
          title: "Schedule",
          fields: ["start_date", "end_date", "milestones"],
        },
        {
          title: "Settings",
          fields: ["visibility", "notifications", "tags"],
        },
      ],
    };
  },

  methods: {
    async handleProjectCreated(projectData) {
      try {
        const project = await this.$axios.post("/project", projectData);
        this.show_success("Project created successfully!");
        this.$router.push(`/projects/${project._id}`);
      } catch (error) {
        this.handleError(error);
      }
    },

    handleError(error) {
      this.show_error(error);
    },
  },
};
</script>
```

---

### Advanced Search & Filter

Complex filtering with saved queries:

```vue
<template>
  <v-container fluid>
    <v-row>
      <!-- Filter Builder -->
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Filters</v-card-title>
          <v-card-text>
            <h-filter-builder entity="task" :initial-filter="currentFilter" @apply="applyFilter" @cancel="clearFilter" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="9">
        <v-card>
          <v-card-title>
            Results ({{ filteredTasks.length }})
            <v-spacer />

            <!-- Export -->
            <v-menu offset-y>
              <template #activator="{ on }">
                <v-btn text v-on="on">
                  <v-icon left>mdi-download</v-icon>
                  Export
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="exportResults('csv')">
                  <v-list-item-title>CSV</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportResults('excel')">
                  <v-list-item-title>Excel</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportResults('json')">
                  <v-list-item-title>JSON</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>

          <v-card-text>
            <h-table :headers="headers" :items="filteredTasks" :loading="loading" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Export Dialog -->
    <h-export v-model="exportDialog" entity="task" :items="filteredTasks" />
  </v-container>
</template>

<script>
import Meta from "@/mixins/meta";

export default {
  mixins: [Meta],

  data() {
    return {
      tasks: [],
      filteredTasks: [],
      currentFilter: {},
      loading: false,
      exportDialog: false,
      headers: [],
    };
  },

  async mounted() {
    await this.load_meta("task");
    this.headers = this.get_table_headers();
    await this.loadTasks();
  },

  methods: {
    async loadTasks() {
      this.loading = true;
      try {
        this.tasks = await this.$axios.get("/task");
        this.filteredTasks = this.tasks;
      } finally {
        this.loading = false;
      }
    },

    async applyFilter(filter) {
      this.currentFilter = filter;
      this.loading = true;

      try {
        this.filteredTasks = await this.$axios.get("/task", {
          params: { filter: JSON.stringify(filter) },
        });
      } finally {
        this.loading = false;
      }
    },

    clearFilter() {
      this.currentFilter = {};
      this.filteredTasks = this.tasks;
    },

    exportResults(format) {
      this.exportDialog = true;
    },
  },
};
</script>
```

---

## Integration Examples

### Authentication

Login with JWT:

```vue
<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title>Login</v-card-title>

          <v-card-text>
            <v-form ref="form" @submit.prevent="login">
              <v-text-field v-model="credentials.email" label="Email" type="email" :rules="[rules.required, rules.email]" outlined />

              <v-text-field v-model="credentials.password" label="Password" :type="showPassword ? 'text' : 'password'" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required]" outlined @click:append="showPassword = !showPassword" />

              <v-btn type="submit" color="primary" block large :loading="loading"> Login </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Alert from "@/mixins/alert";
import Regex from "@/mixins/regex";

export default {
  mixins: [Alert, Regex],

  data() {
    return {
      credentials: {
        email: "",
        password: "",
      },
      showPassword: false,
      loading: false,
      rules: {
        required: (v) => !!v || "Required",
        email: (v) => this.regex.email.test(v) || "Invalid email",
      },
    };
  },

  methods: {
    async login() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.loading = true;
      try {
        const response = await this.$axios.post("/auth/login", this.credentials);

        // Store token
        localStorage.setItem("token", response.token);
        this.$axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;

        // Store user
        this.$store.commit("setUser", response.user);

        this.show_success("Welcome back!");
        this.$router.push("/");
      } catch (error) {
        this.show_error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

---

### File Upload

Upload with progress:

```vue
<template>
  <v-container>
    <v-card>
      <v-card-title>Upload Files</v-card-title>

      <v-card-text>
        <h-file
          field-name="attachments"
          :field-config="{
            accept: 'image/*,application/pdf',
            max_size: 10485760, // 10MB
            multiple: true,
          }"
          :value="attachments"
          @input="handleFileUpload"
          @error="handleUploadError"
        />

        <!-- Upload Progress -->
        <v-list v-if="uploads.length">
          <v-list-item v-for="upload in uploads" :key="upload.name">
            <v-list-item-content>
              <v-list-item-title>{{ upload.name }}</v-list-item-title>
              <v-progress-linear :value="upload.progress" :color="upload.error ? 'error' : 'primary'" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$router.back()">Cancel</v-btn>
        <v-btn color="primary" @click="save" :disabled="!canSave"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import Alert from "@/mixins/alert";

export default {
  mixins: [Alert],

  data() {
    return {
      attachments: [],
      uploads: [],
    };
  },

  computed: {
    canSave() {
      return this.attachments.length > 0 && this.uploads.every((u) => u.progress === 100 && !u.error);
    },
  },

  methods: {
    handleFileUpload(fileIds) {
      this.attachments = fileIds;
    },

    handleUploadError(error) {
      this.show_error(error);
    },

    async save() {
      try {
        await this.$axios.post("/document", {
          title: this.title,
          attachments: this.attachments,
        });

        this.show_success("Document saved");
        this.$router.push("/documents");
      } catch (error) {
        this.show_error(error);
      }
    },
  },
};
</script>
```

---

## Best Practices

1. **Use Mixins:** Leverage Meta, Alert, Simple mixins for common tasks
2. **Error Handling:** Always wrap API calls in try-catch
3. **Loading States:** Show loading indicators for async operations
4. **Validation:** Validate forms before submission
5. **Confirmation:** Confirm destructive actions (delete)
6. **Feedback:** Provide success/error messages
7. **Navigation:** Update route after create/edit/delete
8. **Responsive:** Test on mobile and desktop

---

**Last Updated:** January 9, 2026  
**Version:** 2.0.0
