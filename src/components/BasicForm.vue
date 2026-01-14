<template>
  <v-card v-bind="$attrs" flat style="overflow: visible">
    <v-form ref="formRef" @submit.prevent="submitForm">
      <v-card-title v-if="!hideTitle">
        <span class="text-h6">{{ formTitle }}</span>
      </v-card-title>
      <v-card-text style="overflow: visible">
        <v-row dense>
          <v-col v-for="(field, index) in fields" :key="index" cols="12" sm="12" :md="field.cols ?? 12" :lg="field.cols ?? 12">
            <!-- Combobox -->
            <template v-if="field.inputType === 'combobox'">
              <v-combobox v-model="formData[field.name]" :autofocus="index === 0" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :multiple="field.multiple" chips closable-chips :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" />
            </template>

            <!-- Password -->
            <template v-else-if="field.inputType === 'password'">
              <v-text-field v-model="formData[field.name]" :autofocus="index === 0" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ?? []" :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPassword = !showPassword" />
            </template>

            <!-- Date Picker -->
            <template v-else-if="field.inputType === 'date'">
              <v-menu v-model="datePickerMenus[field.name]" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <v-text-field v-bind="menuProps" :label="field.label" :hint="field.hint" :model-value="formData[field.name]" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" readonly :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" @click:clear="formData[field.name] = ''" />
                </template>
                <v-date-picker v-model="formData[field.name]" @update:model-value="datePickerMenus[field.name] = false" />
              </v-menu>
            </template>

            <!-- Autocomplete (when items provided with multiple or autocomplete type) -->
            <template v-else-if="field.items && (field.multiple || field.inputType === 'autocomplete')">
              <v-autocomplete :items="field.items" :autofocus="index === 0" v-model="formData[field.name]" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ?? []" :multiple="field.multiple" chips closable-chips :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" :menu-props="{ zIndex: 9999 }" />
            </template>

            <!-- Select (when items provided for single selection) -->
            <template v-else-if="field.items">
              <v-select :items="field.items" :autofocus="index === 0" v-model="formData[field.name]" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ?? []" :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" eager />
            </template>

            <!-- Switch -->
            <template v-else-if="field.inputType === 'switch'">
              <v-switch v-model="formData[field.name]" :label="field.label" :hint="field.hint" :prepend-icon="field.icon" :rules="field.rules ?? []" :disabled="!!field.disabled" density="compact" color="primary" hide-details="auto" />
            </template>

            <!-- Textarea -->
            <template v-else-if="field.inputType === 'textarea'">
              <v-textarea v-model="formData[field.name]" :autofocus="index === 0" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ?? []" :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" auto-grow />
            </template>

            <!-- Default Text Field -->
            <template v-else>
              <v-text-field v-model="formData[field.name]" :autofocus="index === 0" :type="field.inputType ?? 'text'" :label="field.label" :hint="field.hint" :suffix="field.suffix" :prefix="field.prefix" :prepend-icon="field.icon" :rules="field.rules ?? []" :disabled="!!field.disabled" density="compact" variant="outlined" :clearable="!field.disabled" />
            </template>
          </v-col>
        </v-row>
      </v-card-text>
      <slot />
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
/**
 * BasicForm - Dynamic form component
 * Renders form fields based on field definitions with validation support
 */
import { ref, computed, watch, useTemplateRef, reactive } from "vue";
import type { VForm } from "vuetify/components";

/** Form field definition */
export interface FormField {
  name: string;
  label: string;
  inputType?: "text" | "password" | "email" | "number" | "date" | "textarea" | "switch" | "combobox" | "autocomplete" | "select";
  hint?: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  cols?: number;
  multiple?: boolean;
  disabled?: boolean;
  default?: unknown;
  rules?: ((value: unknown) => boolean | string)[];
  items?: Array<{ title: string; value: unknown }> | string[];
}

/** Form data type */
export type FormData = Record<string, unknown>;

// Props
const props = defineProps<{
  fields: FormField[];
  modelValue: FormData;
  title?: string;
  hideTitle?: boolean;
}>();

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: FormData];
  submit: [data: FormData];
}>();

// Template refs
const formRef = useTemplateRef<VForm>("formRef");

// State
const showPassword = ref(false);
const datePickerMenus = reactive<Record<string, boolean>>({});
const isInternalUpdate = ref(false);

// Apply default values from field definitions
function applyDefaults(form: FormData): FormData {
  const result = { ...form };
  for (const field of props.fields) {
    if (field.default !== undefined && (result[field.name] === undefined || result[field.name] === null || result[field.name] === "")) {
      result[field.name] = field.default;
    }
  }
  return result;
}

// Reactive form data with defaults applied
const formData = ref<FormData>(applyDefaults(props.modelValue));

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isInternalUpdate.value) {
      formData.value = applyDefaults(newValue);
    }
  },
  { deep: true }
);

// Sync internal changes back to parent
watch(
  formData,
  (newValue) => {
    isInternalUpdate.value = true;
    emit("update:modelValue", newValue);
    // Reset the flag after the current tick
    setTimeout(() => {
      isInternalUpdate.value = false;
    }, 0);
  },
  { deep: true }
);

// Computed
const formTitle = computed(() => {
  return props.hideTitle ? "" : props.title ?? "";
});

// Methods
async function resetForm(): Promise<void> {
  // Reset form data to defaults manually to avoid recursive updates
  const defaultData: FormData = {};
  for (const field of props.fields) {
    defaultData[field.name] = field.default ?? (field.inputType === "switch" ? false : "");
  }
  isInternalUpdate.value = true;
  formData.value = defaultData;
  emit("update:modelValue", defaultData);
  // Reset validation state
  await formRef.value?.resetValidation();
  setTimeout(() => {
    isInternalUpdate.value = false;
  }, 0);
}

async function resetValidation(): Promise<void> {
  formRef.value?.resetValidation();
}

async function validate(): Promise<boolean> {
  const result = await formRef.value?.validate();
  return result?.valid ?? false;
}

function submitForm(): void {
  emit("submit", formData.value);
}

// Expose methods
defineExpose({
  resetForm,
  resetValidation,
  validate,
  submitForm,
});
</script>
