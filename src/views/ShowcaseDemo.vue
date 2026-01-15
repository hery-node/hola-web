<template>
  <v-app>
    <NavBar :title="'Hola Web Component Showcase'" :menus="sideMenus">
      <template #toolbar>
        <v-btn icon variant="elevated" @click="toggleTheme">
          <v-icon>{{ isDark ? "mdi-brightness-7" : "mdi-brightness-4" }}</v-icon>
        </v-btn>
      </template>
    </NavBar>

    <v-main>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <h1 class="text-h3 font-weight-bold text-primary">Hola Web Component Showcase</h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-2">Demonstrating all migrated Vue 3 + TypeScript + Vuetify 3 components</p>
          </v-col>
        </v-row>

        <!-- Section: Statistics Cards -->
        <section id="statistics" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-chart-box</v-icon>
            Statistics Views
          </h2>
          <v-row>
            <v-col v-for="stat in statsData" :key="stat.title" cols="12" sm="6" md="3">
              <StatisticsView :icon="stat.icon" :title="stat.title" :value="stat.value" :small-value="stat.smallValue" :color="stat.color" :sub-icon="stat.subIcon" :sub-text="stat.subText" :sub-icon-color="stat.subIconColor" />
            </v-col>
          </v-row>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Card Views -->
        <section id="cards" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-card-text</v-icon>
            Card Views
          </h2>
          <v-row>
            <v-col cols="12" md="4">
              <CardView title="Basic Card" text="With offset header" color="primary">
                <p>This is a basic CardView with an offset header.</p>
                <p class="text-caption">Supports custom colors, elevation, and offset values.</p>
              </CardView>
            </v-col>
            <v-col cols="12" md="4">
              <CardView title="Secondary Card" text="Different color" color="secondary">
                <p>CardView with secondary color theme.</p>
                <template #actions>
                  <v-icon class="mr-2" color="success">mdi-check</v-icon>
                  <span>Action slot supported</span>
                </template>
              </CardView>
            </v-col>
            <v-col cols="12" md="4">
              <CardView title="Info Card" text="With actions" color="info">
                <p>CardView with action buttons in footer.</p>
                <template #actions>
                  <v-btn variant="text" color="primary" size="small">Learn More</v-btn>
                </template>
              </CardView>
            </v-col>
          </v-row>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Charts -->
        <section id="charts" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-chart-areaspline</v-icon>
            Chart Components
          </h2>

          <v-row>
            <!-- Bar Chart -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-chart-bar</v-icon>
                  Bar Chart
                </v-card-title>
                <ChartBarView :data="barChartData" height="300px" title="Monthly Sales" />
              </v-card>
            </v-col>

            <!-- Line Chart -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-chart-line</v-icon>
                  Line Chart
                </v-card-title>
                <ChartLineView :data="lineChartData" height="300px" title="User Growth" />
              </v-card>
            </v-col>

            <!-- Pie Chart -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-chart-pie</v-icon>
                  Pie Chart
                </v-card-title>
                <ChartPieView :data="pieChartData" height="300px" title="Market Share" />
              </v-card>
            </v-col>

            <!-- Rose/Polar Chart -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-chart-donut</v-icon>
                  Rose Chart (Polar Area)
                </v-card-title>
                <ChartPieView :data="pieChartData" height="300px" title="Distribution" rose />
              </v-card>
            </v-col>
          </v-row>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Forms -->
        <!-- TODO: KNOWN ISSUE - v-select dropdown in BasicForm not displaying properly. 
             Likely z-index/overflow conflict with CardView global CSS styles. Fix later. -->
        <section id="forms" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-form-textbox</v-icon>
            Form Components
          </h2>

          <v-alert type="warning" variant="tonal" class="mb-4" density="compact"> <strong>Known Issue:</strong> v-select dropdown may not display correctly due to CSS conflicts. Fix pending. </v-alert>

          <v-row>
            <!-- Basic Form -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" style="overflow: visible" elevation="2">
                <v-card-title>BasicForm</v-card-title>
                <v-card-subtitle>Versatile form with multiple field types</v-card-subtitle>
                <BasicForm ref="basicFormRef" v-model="basicFormData" :fields="basicFormFields" title="User Registration" @submit="handleBasicFormSubmit" />
              </v-card>
            </v-col>

            <!-- Search Form Info Card -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2">
                <v-card-title>SearchForm</v-card-title>
                <v-card-subtitle>Quick search with expandable fields (requires backend)</v-card-subtitle>
                <v-card-text>
                  <v-alert type="info" variant="tonal" class="mb-4"> <strong>SearchForm</strong> is designed to work with entity metadata from the backend. </v-alert>
                  <p class="mb-2"><strong>Features:</strong></p>
                  <v-list density="compact">
                    <v-list-item prepend-icon="mdi-magnify">Quick search input</v-list-item>
                    <v-list-item prepend-icon="mdi-filter-variant">Advanced filter fields</v-list-item>
                    <v-list-item prepend-icon="mdi-content-save">Saveable search presets</v-list-item>
                    <v-list-item prepend-icon="mdi-refresh">Clear and reset functionality</v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Tables -->
        <section id="tables" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-table</v-icon>
            Table Components
          </h2>

          <!-- DataTable -->
          <v-card class="mb-6 pa-4" elevation="2">
            <v-card-title>
              <v-icon class="mr-2">mdi-table-large</v-icon>
              DataTable
            </v-card-title>
            <v-card-subtitle>Feature-rich data table with sorting, filtering, and actions</v-card-subtitle>
            <v-data-table :headers="tableHeaders" :items="tableData" class="elevation-1">
              <template #item.status="{ item }">
                <v-chip :color="item.status === 'Active' ? 'success' : 'error'" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template #item.actions="{ item }">
                <v-btn icon size="small" variant="text" @click="showItemDetail(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" color="primary" @click="editItem(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>

          <!-- Property Table -->
          <v-card class="mb-6 pa-4" elevation="2">
            <v-card-title>
              <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
              PropertyTable Preview
            </v-card-title>
            <v-card-subtitle>Display entity properties in key-value format</v-card-subtitle>
            <v-table fixed-header>
              <thead>
                <tr>
                  <th class="text-right" width="30%">Property</th>
                  <th class="text-left" width="70%">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in propertyData" :key="key">
                  <td align="right" class="font-weight-medium">{{ key }}:</td>
                  <td align="left">{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Dialogs & Windows -->
        <section id="dialogs" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-window-maximize</v-icon>
            Dialogs & Windows
          </h2>

          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card class="pa-4 text-center dialog-card" elevation="2">
                <v-icon size="48" color="primary" class="mb-2">mdi-comment-question</v-icon>
                <h3 class="text-h6">ConfirmDialog</h3>
                <p class="text-body-2 mb-4">Promise-based confirmation dialog</p>
                <v-btn variant="elevated" color="primary" @click="openConfirmDialog">Open Dialog</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="pa-4 text-center dialog-card" elevation="2">
                <v-icon size="48" color="secondary" class="mb-2">mdi-window-restore</v-icon>
                <h3 class="text-h6">BasicWindow</h3>
                <p class="text-body-2 mb-4">Draggable window with controls</p>
                <v-btn variant="elevated" color="secondary" @click="openBasicWindow">Open Window</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="pa-4 text-center dialog-card" elevation="2">
                <v-icon size="48" color="success" class="mb-2">mdi-alert-circle</v-icon>
                <h3 class="text-h6">Alert System</h3>
                <p class="text-body-2 mb-4">useAlert composable demo</p>
                <v-btn variant="elevated" color="success" @click="showSuccessAlert">Show Alert</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="pa-4 text-center dialog-card" elevation="2">
                <v-icon size="48" color="warning" class="mb-2">mdi-information</v-icon>
                <h3 class="text-h6">Snackbar</h3>
                <p class="text-body-2 mb-4">Notification system</p>
                <v-btn variant="elevated" color="warning" @click="showSnackbar">Show Snackbar</v-btn>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <v-divider class="mb-8" />

        <!-- Section: Migration Verification -->
        <section id="verification" class="mb-8">
          <h2 class="text-h4 mb-4">
            <v-icon class="mr-2">mdi-check-decagram</v-icon>
            Migration Verification
          </h2>

          <v-card class="pa-4" elevation="2">
            <v-card-title>Component Migration Status</v-card-title>
            <v-card-subtitle>All components migrated to Vue 3 + TypeScript + Vuetify 3</v-card-subtitle>

            <v-row class="mt-4">
              <v-col v-for="category in migrationStatus" :key="category.name" cols="12" md="4">
                <v-card variant="outlined" class="pa-3">
                  <h4 class="text-h6 mb-2">{{ category.name }}</h4>
                  <v-list density="compact">
                    <v-list-item v-for="comp in category.components" :key="comp.name">
                      <template #prepend>
                        <v-icon :color="comp.status === 'complete' ? 'success' : 'warning'" size="small">
                          {{ comp.status === "complete" ? "mdi-check-circle" : "mdi-alert-circle" }}
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ comp.name }}</v-list-item-title>
                      <template #append>
                        <v-chip size="x-small" :color="comp.status === 'complete' ? 'success' : 'warning'">
                          {{ comp.status }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </section>

        <!-- Alert display area -->
        <v-alert v-model="alertVisible" :type="alertType" closable class="mb-4" transition="slide-y-transition">
          {{ alertMessage }}
        </v-alert>
      </v-container>
    </v-main>

    <!-- Dialogs -->
    <ConfirmDialog ref="confirmDialogRef" />

    <BasicWindow ref="basicWindowRef" title="Sample Window">
      <v-card flat>
        <v-card-text>
          <h3 class="text-h6 mb-2">Window Content</h3>
          <p>This is a draggable, resizable window component.</p>
          <p>Features:</p>
          <ul>
            <li>Minimize/Maximize</li>
            <li>Fullscreen toggle</li>
            <li>Close button</li>
            <li>Draggable header</li>
          </ul>
        </v-card-text>
      </v-card>
    </BasicWindow>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="snackbarVisible = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
/**
 * ShowcaseDemo - Component demonstration page
 *
 * This page showcases all migrated Vue 3 + TypeScript + Vuetify 3 components
 * from the hola-web library. It serves as both documentation and verification
 * of the migration process.
 */
import { ref } from "vue";
import { useTheme } from "vuetify";

// Component imports
import NavBar from "@/components/NavBar.vue";
import CardView from "@/components/CardView.vue";
import StatisticsView from "@/components/StatisticsView.vue";
import ChartBarView from "@/components/ChartBarView.vue";
import ChartLineView from "@/components/ChartLineView.vue";
import ChartPieView from "@/components/ChartPieView.vue";
import BasicForm from "@/components/BasicForm.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import BasicWindow from "@/components/BasicWindow.vue";

// Type imports
import type { ConfirmDialogInstance, BasicWindowInstance, BasicFormInstance } from "@/components/types";
import type { FormField } from "@/components/BasicForm.vue";

// Theme
const theme = useTheme();
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  theme.global.name.value = isDark.value ? "dark" : "light";
}

// Side menu configuration
const sideMenus = [
  {
    title: "Views",
    menus: [
      { title: "Statistics", icon: "mdi-chart-box", route: "#statistics" },
      { title: "Cards", icon: "mdi-card-text", route: "#cards" },
      { title: "Charts", icon: "mdi-chart-areaspline", route: "#charts" },
    ],
  },
  {
    title: "Forms & Tables",
    menus: [
      { title: "Forms", icon: "mdi-form-textbox", route: "#forms" },
      { title: "Tables", icon: "mdi-table", route: "#tables" },
    ],
  },
  {
    title: "Utilities",
    menus: [
      { title: "Dialogs", icon: "mdi-window-maximize", route: "#dialogs" },
      { title: "Verification", icon: "mdi-check-decagram", route: "#verification" },
    ],
  },
];

// Statistics data
const statsData = [
  {
    icon: "mdi-account-group",
    title: "Total Users",
    value: "12,485",
    smallValue: "users",
    color: "primary",
    subIcon: "mdi-trending-up",
    subText: "+15% from last month",
    subIconColor: "success",
  },
  {
    icon: "mdi-cart",
    title: "Orders",
    value: "3,247",
    smallValue: "orders",
    color: "success",
    subIcon: "mdi-clock",
    subText: "Last 30 days",
    subIconColor: "info",
  },
  {
    icon: "mdi-currency-usd",
    title: "Revenue",
    value: "$48,920",
    smallValue: "",
    color: "warning",
    subIcon: "mdi-trending-up",
    subText: "+23% increase",
    subIconColor: "success",
  },
  {
    icon: "mdi-star",
    title: "Rating",
    value: "4.8",
    smallValue: "/ 5",
    color: "info",
    subIcon: "mdi-thumb-up",
    subText: "98% positive reviews",
    subIconColor: "success",
  },
];

// Chart data
const barChartData = [
  ["Month", "Sales", "Expenses"],
  ["Jan", 120, 80],
  ["Feb", 200, 120],
  ["Mar", 150, 90],
  ["Apr", 180, 100],
  ["May", 220, 130],
  ["Jun", 280, 160],
];

const lineChartData = [
  ["Date", "Users", "Sessions"],
  ["Week 1", 1000, 1500],
  ["Week 2", 1200, 1800],
  ["Week 3", 1100, 1600],
  ["Week 4", 1400, 2100],
  ["Week 5", 1600, 2400],
  ["Week 6", 1900, 2800],
];

const pieChartData = [
  ["Product", "Share"],
  ["Product A", 35],
  ["Product B", 25],
  ["Product C", 20],
  ["Product D", 12],
  ["Product E", 8],
];

// Form data
const basicFormRef = ref<BasicFormInstance | null>(null);
const basicFormData = ref({
  username: "",
  email: "",
  role: null,
  active: true,
  notes: "",
});

const basicFormFields: FormField[] = [
  { name: "username", label: "Username", inputType: "text", rules: [(v: unknown) => !!v || "Username is required"] },
  { name: "email", label: "Email", inputType: "email", cols: 6, hint: "Your email address" },
  { name: "role", label: "Role", items: ["Admin", "User", "Guest"], cols: 6 },
  { name: "active", label: "Active", inputType: "switch", default: true },
  { name: "notes", label: "Notes", inputType: "textarea" },
];

// Table data
const tableHeaders = [
  { title: "ID", key: "id", sortable: true },
  { title: "Name", key: "name", sortable: true },
  { title: "Email", key: "email" },
  { title: "Role", key: "role" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const tableData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "User", status: "Inactive" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Guest", status: "Active" },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", role: "User", status: "Active" },
];

const propertyData = {
  "Entity Name": "User Profile",
  "Created At": "2026-01-14 10:30:00",
  "Updated At": "2026-01-14 15:45:00",
  Version: "1.2.0",
  Owner: "System Admin",
  Status: "Published",
};

// Dialog refs
const confirmDialogRef = ref<ConfirmDialogInstance | null>(null);
const basicWindowRef = ref<BasicWindowInstance | null>(null);

// Alert state
const alertVisible = ref(false);
const alertType = ref<"success" | "error" | "warning" | "info">("success");
const alertMessage = ref("");

// Snackbar state
const snackbarVisible = ref(false);
const snackbarColor = ref("success");
const snackbarMessage = ref("");

// Migration status
const migrationStatus = [
  {
    name: "Views & Cards",
    components: [
      { name: "CardView", status: "complete" },
      { name: "StatisticsView", status: "complete" },
      { name: "OffsetView", status: "complete" },
      { name: "NavBar", status: "complete" },
      { name: "MobileMenu", status: "complete" },
    ],
  },
  {
    name: "Charts",
    components: [
      { name: "ChartView", status: "complete" },
      { name: "ChartBarView", status: "complete" },
      { name: "ChartLineView", status: "complete" },
      { name: "ChartPieView", status: "complete" },
      { name: "ChartComboView", status: "complete" },
      { name: "ChartSimpleView", status: "complete" },
      { name: "ChartDashboardView", status: "complete" },
    ],
  },
  {
    name: "Forms & Tables",
    components: [
      { name: "BasicForm", status: "complete" },
      { name: "EditForm", status: "complete" },
      { name: "SearchForm", status: "complete" },
      { name: "DataTable", status: "complete" },
      { name: "CrudTable", status: "complete" },
      { name: "ArrayTable", status: "complete" },
      { name: "PropertyTable", status: "complete" },
      { name: "CompareTable", status: "complete" },
      { name: "DashboardTable", status: "complete" },
    ],
  },
];

// Event handlers
function handleBasicFormSubmit(data: Record<string, unknown>) {
  console.log("Form submitted:", data);
  showAlert("success", "Form submitted successfully!");
}

async function openConfirmDialog() {
  const result = await confirmDialogRef.value?.open("Confirm Action", "Are you sure you want to proceed with this action?<br><br>This demonstrates the <strong>ConfirmDialog</strong> component with HTML support.");
  showAlert(result ? "success" : "info", result ? "Action confirmed!" : "Action cancelled");
}

function openBasicWindow() {
  basicWindowRef.value?.show();
}

function showSuccessAlert() {
  showAlert("success", "This is a success alert from the useAlert composable!");
}

function showSnackbar() {
  snackbarColor.value = "info";
  snackbarMessage.value = "This is a notification snackbar!";
  snackbarVisible.value = true;
}

function showAlert(type: "success" | "error" | "warning" | "info", message: string) {
  alertType.value = type;
  alertMessage.value = message;
  alertVisible.value = true;
}

function showItemDetail(item: Record<string, unknown>) {
  showAlert("info", `Viewing details for: ${item.name}`);
}

function editItem(item: Record<string, unknown>) {
  showAlert("info", `Editing item: ${item.name}`);
}

async function confirmDelete(item: Record<string, unknown>) {
  const result = await confirmDialogRef.value?.open("Confirm Delete", `Are you sure you want to delete <strong>${item.name}</strong>?`);
  if (result) {
    showAlert("warning", `Deleted: ${item.name}`);
  }
}
</script>

<style scoped>
section {
  scroll-margin-top: 80px;
}

/* Only apply hover effect to clickable cards in the dialogs section */
:deep(.dialog-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.dialog-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
</style>
