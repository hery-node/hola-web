<script setup lang="ts">
/**
 * Root App Component
 *
 * This is an example root component for development/testing.
 */
import { ref } from "vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import BasicWindow from "./components/BasicWindow.vue";
import BasicForm from "./components/BasicForm.vue";
import type { ConfirmDialogInstance, BasicWindowInstance, BasicFormInstance } from "./components/types";
import type { FormField, FormData } from "./components/BasicForm.vue";

const confirmDialog = ref<ConfirmDialogInstance | null>(null);
const basicWindow = ref<BasicWindowInstance | null>(null);
const basicForm = ref<BasicFormInstance | null>(null);
const confirmResult = ref<string>("");

// Form test data
const formFields: FormField[] = [
  { name: "name", label: "Name", inputType: "text", rules: [(v: unknown) => !!v || "Name is required"] },
  { name: "email", label: "Email", inputType: "email", cols: 6, hint: "Your email address" },
  { name: "age", label: "Age", inputType: "number", cols: 6 },
  { name: "password", label: "Password", inputType: "password" },
  { name: "bio", label: "Biography", inputType: "textarea" },
  { name: "active", label: "Active", inputType: "switch", default: true },
  { name: "category", label: "Category", items: ["Option A", "Option B", "Option C"] },
];

const formData = ref<FormData>({
  name: "",
  email: "",
  age: null,
  password: "",
  bio: "",
  active: true,
  category: null,
});

async function openConfirm() {
  const result = await confirmDialog.value?.open("Confirm Test", "This is a <strong>test message</strong>. Do you want to proceed?");
  confirmResult.value = result ? "User confirmed!" : "User cancelled.";
}

function openWindow() {
  basicWindow.value?.show();
}

async function validateForm() {
  const valid = await basicForm.value?.validate();
  confirmResult.value = valid ? "Form is valid!" : "Form has validation errors.";
}

function handleFormSubmit(data: FormData) {
  console.log("Form submitted:", data);
  confirmResult.value = `Form submitted: ${JSON.stringify(data)}`;
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="text-h4 mb-6">Hola Web - Component Test</h1>

        <v-card class="mb-4">
          <v-card-title>ConfirmDialog Test</v-card-title>
          <v-card-text>
            <v-btn color="primary" @click="openConfirm"> Open Confirm Dialog </v-btn>
            <p v-if="confirmResult" class="mt-4">
              Result: <strong>{{ confirmResult }}</strong>
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>BasicWindow Test</v-card-title>
          <v-card-text>
            <v-btn color="secondary" @click="openWindow"> Open Basic Window </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>BasicForm Test</v-card-title>
          <v-card-text>
            <BasicForm ref="basicForm" v-model="formData" :fields="formFields" title="User Information" @submit="handleFormSubmit" />
            <v-btn color="primary" class="mt-4" @click="validateForm">Validate Form</v-btn>
            <v-btn color="success" class="mt-4 ml-2" @click="basicForm?.submitForm()">Submit Form</v-btn>
            <v-btn color="warning" class="mt-4 ml-2" @click="basicForm?.resetForm()">Reset Form</v-btn>
          </v-card-text>
        </v-card>

        <ConfirmDialog ref="confirmDialog" />

        <BasicWindow ref="basicWindow" title="Test Window">
          <v-card flat>
            <v-card-text>
              <p>This is the content inside the BasicWindow.</p>
              <p>You can minimize, maximize, expand to fullscreen, or close this window.</p>
            </v-card-text>
          </v-card>
        </BasicWindow>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
/* Global styles */
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
}
</style>
