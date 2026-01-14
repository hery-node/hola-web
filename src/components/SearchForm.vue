<template>
  <v-expansion-panels flat>
    <v-expansion-panel>
      <v-expansion-panel-title :class="searchToolbarClass">
        <span>{{ formTitle }}</span>
        <template #actions>
          <v-icon color="white">mdi-chevron-down</v-icon>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <BasicForm v-bind="$attrs" ref="formRef" v-model="form" :fields="searchFields" hide-title @submit="submitForm">
          <v-card-actions>
            <slot>
              <v-row align="center" justify="center" class="my-0 py-0">
                <v-col cols="6" class="text-center">
                  <v-btn color="error" :block="mobile" @click="clear">
                    {{ clearLabelText }}
                  </v-btn>
                </v-col>
                <v-col cols="6" class="text-center">
                  <v-btn color="success" :block="mobile" type="submit">
                    {{ searchLabelText }}
                  </v-btn>
                </v-col>
              </v-row>
            </slot>
          </v-card-actions>
        </BasicForm>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
/**
 * SearchForm - Collapsible search form with entity metadata
 */
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import BasicForm from "./BasicForm.vue";
import { useMeta } from "@/composables/useMeta";
import type { FormField, FormData } from "./BasicForm.vue";
import type { BasicFormInstance } from "./types";

// Props
const props = withDefaults(
  defineProps<{
    entity: string;
    title?: string;
    cols?: number;
    clearLabel?: string;
    searchLabel?: string;
    searchToolbarClass?: string;
  }>(),
  {
    cols: 0,
    searchToolbarClass: "bg-primary text-subtitle-2 text-white",
  }
);

// Emits
const emit = defineEmits<{
  clear: [];
  search: [data: FormData];
}>();

// Composables
const { t } = useI18n();
const { mobile } = useDisplay();
const { entityLabel, loadMeta, getSearchFields } = useMeta({ entity: props.entity });

// Template refs
const formRef = ref<BasicFormInstance | null>(null);

// State
const form = ref<FormData>({});
const searchFields = ref<FormField[]>([]);

// Computed
const formTitle = computed(() => {
  if (props.title && props.title.length > 0) {
    return props.title;
  }
  return t("form.search_title", { entity: entityLabel.value });
});

const clearLabelText = computed(() => {
  return props.clearLabel ?? t("form.clear_label");
});

const searchLabelText = computed(() => {
  return props.searchLabel ?? t("form.search_label");
});

// Methods
async function clear(): Promise<void> {
  await formRef.value?.resetForm();
  emit("clear");
}

function submitForm(): void {
  emit("search", form.value);
}

// Lifecycle
onMounted(async () => {
  await loadMeta();
  const fields = (await getSearchFields()) as unknown as FormField[];
  fields.forEach((field) => {
    if (!field.cols) {
      field.cols = props.cols || undefined;
    }
  });
  searchFields.value = fields;
});

// Expose methods
defineExpose({
  clear,
});
</script>
