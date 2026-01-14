<template>
  <v-table fixed-header>
    <thead v-if="!hideHeader">
      <tr>
        <th class="text-right">
          {{ t("table.property_name") }}
        </th>
        <th class="text-left">
          {{ t("table.property_value") }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(field, index) in propertyFields" :key="index">
        <td align="right" width="10%">{{ field.label }}:</td>
        <td align="left" width="90%">{{ form[field.name] }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
/**
 * PropertyTable - Display entity properties in table format
 */
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useMeta } from "@/composables/useMeta";
import { readEntity } from "@/core/axios";
import type { FormField } from "./BasicForm.vue";

// Props
const props = defineProps<{
  entity: string;
  entityId: string;
  hideHeader?: boolean;
}>();

// Composables
const { t } = useI18n();
const { loadMeta, getPropertyFields } = useMeta({ entity: props.entity });

// State
const form = ref<Record<string, unknown>>({});
const propertyFields = ref<FormField[]>([]);

// Methods
async function load(): Promise<void> {
  const attrNames = propertyFields.value.map((h) => h.name).join(",");
  const obj = (await readEntity(props.entity, props.entityId, attrNames)) as Record<string, unknown>;

  for (const field of propertyFields.value) {
    const fieldWithFormat = field as FormField & { format?: (value: unknown, ctx: unknown) => string };
    const value = fieldWithFormat.format ? fieldWithFormat.format(obj[field.name], null) : obj[field.name];

    if (value) {
      const strValue = String(value);
      const prefix = field.prefix && !strValue.includes(String(field.prefix)) ? field.prefix : "";
      const suffix = field.suffix && !strValue.includes(String(field.suffix)) ? field.suffix : "";
      obj[field.name] = `${prefix} ${value} ${suffix}`.trim();
    }
  }
  form.value = obj;
}

// Lifecycle
onMounted(async () => {
  await loadMeta();
  propertyFields.value = (await getPropertyFields()) as unknown as FormField[];
  await load();
});

// Expose
defineExpose({
  load,
});
</script>
