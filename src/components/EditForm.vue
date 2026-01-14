<template>
  <div>
    <!-- Dialog mode -->
    <template v-if="dialog">
      <BasicWindow ref="winRef" :title="formTitle" :width="dialogWidth" @close="closeWindow">
        <div style="overflow-x: hidden">
          <BasicForm v-bind="$attrs" ref="formRef" v-model="form" :fields="editFields" hide-title @submit="submitForm">
            <v-alert v-model="alert.shown" :type="alert.type" closable class="mx-3">
              <span v-html="alert.msg" />
            </v-alert>
            <v-progress-linear v-if="loading" indeterminate :color="progressBarColor" class="mx-3" />
            <v-card-actions>
              <slot>
                <v-row align="center" justify="center" class="my-0 py-0">
                  <v-col v-if="!hideCancel" cols="6" class="text-center">
                    <v-btn color="error" :block="mobile" @click="cancel">{{ cancelLabel }}</v-btn>
                  </v-col>
                  <v-col :cols="hideCancel ? 12 : 6" class="text-center">
                    <v-btn color="success" :block="mobile" type="submit">{{ submitLabel }}</v-btn>
                  </v-col>
                </v-row>
              </slot>
            </v-card-actions>
          </BasicForm>
        </div>
      </BasicWindow>
    </template>

    <!-- Inline mode -->
    <template v-else>
      <BasicForm v-bind="$attrs" ref="formRef" v-model="form" :fields="editFields" :title="formTitle" @submit="submitForm">
        <v-alert v-model="alert.shown" :type="alert.type" closable class="mx-3">
          <span v-html="alert.msg" />
        </v-alert>
        <v-progress-linear v-if="loading" indeterminate :color="progressBarColor" class="mx-3" />
        <v-card-actions>
          <slot>
            <v-row align="center" justify="center" class="my-0 py-0">
              <v-col v-if="!hideCancel" cols="6" class="text-center">
                <v-btn color="error" :block="mobile" @click="cancel">{{ cancelLabel }}</v-btn>
              </v-col>
              <v-col :cols="hideCancel ? 12 : 6" class="text-center">
                <v-btn color="success" :block="mobile" type="submit">{{ submitLabel }}</v-btn>
              </v-col>
            </v-row>
          </slot>
        </v-card-actions>
      </BasicForm>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * EditForm - Entity create/update/clone form component
 * Provides form rendering with entity metadata and validation
 */
import { ref, computed, watch, useTemplateRef, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import BasicForm from "./BasicForm.vue";
import BasicWindow from "./BasicWindow.vue";
import { useAlert } from "@/composables/useAlert";
import { useMeta } from "@/composables/useMeta";
import { readProperty, saveEntity, isSuccessResponse, hasInvalidParams, isDuplicated, isUniqueDuplicated } from "@/core/axios";
import type { FormField, FormData } from "./BasicForm.vue";
import type { BasicFormInstance, BasicWindowInstance } from "./types";

// Props
const props = withDefaults(
  defineProps<{
    entity: string;
    createFormView?: string;
    updateFormView?: string;
    createTitle?: string;
    updateTitle?: string;
    cloneTitle?: string;
    cols?: number;
    entityId?: string;
    clone?: boolean;
    hiddenValues?: Record<string, unknown>;
    hideCancel?: boolean;
    createCancelLabel?: string;
    createSubmitLabel?: string;
    updateCancelLabel?: string;
    updateSubmitLabel?: string;
    resetPost?: boolean;
    initForm?: boolean;
    hideHint?: boolean;
    successHint?: string;
    failHint?: string;
    showDetailError?: boolean;
    dialog?: boolean;
    dialogWidth?: string;
    progressBarColor?: string;
  }>(),
  {
    createFormView: "*",
    updateFormView: "*",
    cols: 0,
    clone: false,
    hideCancel: false,
    resetPost: true,
    initForm: false,
    hideHint: false,
    showDetailError: false,
    dialog: false,
    dialogWidth: "800px",
    progressBarColor: "indigo",
  }
);

// Emits
const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

// Composables
const { t } = useI18n();
const { mobile } = useDisplay();
const { alert, showSuccess, showError } = useAlert();
const { entityLabel, loadMeta, getEditFields, getCloneFields } = useMeta({ entity: props.entity });

// Template refs
const formRef = useTemplateRef<BasicFormInstance>("formRef");
const winRef = useTemplateRef<BasicWindowInstance>("winRef");

// Local FormField type that extends the meta FormField
interface EditFormField extends FormField {
  update?: boolean;
}

// State
const loading = ref(false);
const form = ref<FormData>({});
const editFields = ref<EditFormField[]>([]);

// Computed
const editView = computed(() => {
  return updateMode.value ? props.updateFormView : props.createFormView;
});

const updateMode = computed(() => {
  return props.entityId != null;
});

const formTitle = computed(() => {
  if (updateMode.value) {
    if (props.clone && props.cloneTitle && props.cloneTitle.length > 0) {
      return props.cloneTitle;
    }
    if (!props.clone && props.updateTitle && props.updateTitle.length > 0) {
      return props.updateTitle;
    }
    const key = props.clone ? "form.clone_title" : "form.update_title";
    return t(key, { entity: entityLabel.value });
  }

  if (props.createTitle && props.createTitle.length > 0) {
    return props.createTitle;
  }
  return t("form.create_title", { entity: entityLabel.value });
});

const cancelLabel = computed(() => {
  if (updateMode.value && props.updateCancelLabel && props.updateCancelLabel.length > 0) {
    return props.updateCancelLabel;
  }
  if (!updateMode.value && props.createCancelLabel && props.createCancelLabel.length > 0) {
    return props.createCancelLabel;
  }
  return t("form.cancel_label");
});

const submitLabel = computed(() => {
  if (updateMode.value && props.updateSubmitLabel && props.updateSubmitLabel.length > 0) {
    return props.updateSubmitLabel;
  }
  if (!updateMode.value && props.createSubmitLabel && props.createSubmitLabel.length > 0) {
    return props.createSubmitLabel;
  }
  return t("form.submit_label");
});

// Methods
async function resetForm(): Promise<void> {
  await formRef.value?.resetForm();
}

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? false;
}

function cancel(): void {
  alert.value.shown = false;
  loading.value = false;
  if (props.dialog) {
    winRef.value?.close();
  }
  resetForm();
  emit("cancel");
}

function closeWindow(): void {
  alert.value.shown = false;
  loading.value = false;
  resetForm();
  emit("cancel");
}

async function initFormData(): Promise<void> {
  await loadMeta();
  const metaFields = props.clone ? await getCloneFields() : await getEditFields(updateMode.value, editView.value);

  // Cast to EditFormField and apply transformations
  const fields = metaFields as unknown as EditFormField[];

  // Apply cols to fields
  fields.forEach((field) => {
    if (!field.cols) {
      field.cols = props.cols || undefined;
    }
  });

  // Set disabled state for non-updatable fields
  if (!props.clone) {
    fields.forEach((field) => {
      if (field.update === false) {
        field.disabled = updateMode.value;
      }
    });
  }

  editFields.value = fields;

  if (updateMode.value && props.entityId) {
    const attrNames = fields.map((h) => h.name).join(",");
    form.value = await readProperty(props.entity, props.entityId, attrNames);
  }

  if (props.dialog) {
    winRef.value?.show();
  }
}

async function submitForm(formData: FormData): Promise<void> {
  alert.value.shown = false;

  const isValid = await validate();
  if (!isValid) {
    return;
  }

  loading.value = true;
  const submitData = props.hiddenValues ? { ...formData, ...props.hiddenValues } : formData;
  (submitData as FormData & { _view: string })._view = editView.value;

  const { code, err } = await saveEntity(props.entity, submitData, updateMode.value, props.clone);
  loading.value = false;

  if (isSuccessResponse(code)) {
    if (props.resetPost) {
      await resetForm();
    }

    const updateKey = props.clone ? "form.clone_success_hint" : "form.update_success_hint";
    const createKey = "form.create_success_hint";
    const successInfo = props.successHint ?? t(updateMode.value ? updateKey : createKey, { entity: entityLabel.value });

    if (!props.hideHint) {
      showSuccess(successInfo);
    }
    if (props.dialog) {
      winRef.value?.close();
    }
    emit("success");
  } else if (hasInvalidParams(code)) {
    const fieldNames = err as string[] | undefined;
    if (fieldNames && fieldNames.length === 1) {
      const [fieldName] = fieldNames;
      const labelField = editFields.value.find((f) => f.name === fieldName);
      const errorInfo = t("form.err_invalid_value", { field: labelField?.label });
      showError(errorInfo);
    }
  } else if (isDuplicated(code)) {
    const errorInfo = t("form.err_duplicate", { entity: entityLabel.value });
    showError(errorInfo);
  } else if (isUniqueDuplicated(code)) {
    const fieldNames = err as string[] | undefined;
    if (fieldNames && fieldNames.length > 0) {
      const labels = fieldNames.map((name) => {
        const field = editFields.value.find((f) => f.name === name);
        return field?.label || name;
      });
      const errorInfo = t("form.err_duplicate_unique", { fields: labels.join(", ") });
      showError(errorInfo);
    } else {
      const errorInfo = t("form.err_duplicate_unique_generic");
      showError(errorInfo);
    }
  } else {
    const updateKey = props.clone ? "form.clone_fail_hint" : "form.update_fail_hint";
    const createKey = "form.create_fail_hint";
    const errorInfo = props.failHint ?? t(updateMode.value ? updateKey : createKey, { entity: entityLabel.value });
    const errorDetail = props.showDetailError ? t("form.error", { err }) : t("form.check_log");
    showError(errorInfo + errorDetail);
  }
}

// Watch for entityId changes
watch(
  () => props.entityId,
  async (newId) => {
    if (newId !== "") {
      await initFormData();
    }
  },
  { deep: true }
);

// Lifecycle
onMounted(async () => {
  if (props.initForm) {
    await initFormData();
  }
});

// Expose methods
defineExpose({
  resetForm,
  validate,
  initFormData,
  cancel,
});
</script>
