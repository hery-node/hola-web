<template>
  <CompareTable v-bind="$attrs" :objs="items" :label-key="labelKey"></CompareTable>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef } from "vue";
import { useMeta } from "@/composables/useMeta";
import { readEntity } from "@/core/axios";
import CompareTable from "./CompareTable.vue";
import type { EntityData, FieldValue } from "@/types";

/**
 * Compare entity component
 * Compares multiple entities side by side
 */

// Props
const props = defineProps<{
  entity: string;
  ids: string[];
  labelKey: string;
}>();

// Composables
const { loadMeta, getPropertyFields, formatFieldValue } = useMeta({ entity: toRef(props, "entity") });

// State
const items = ref<EntityData[]>([]);

// Lifecycle
onMounted(async () => {
  await loadMeta();
  const propertyFields = await getPropertyFields();
  const attrNames = propertyFields.map((h) => h.name).join(",");

  const objs: EntityData[] = [];
  for (let i = 0; i < props.ids.length; i++) {
    const obj = await readEntity<EntityData>(props.entity, props.ids[i], `${attrNames},${props.labelKey}`);
    if (obj) objs.push(obj);
  }

  const resultItems: EntityData[] = [];
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i];
    const item: EntityData = {};
    item[props.labelKey] = obj[props.labelKey];

    for (let j = 0; j < propertyFields.length; j++) {
      const field = propertyFields[j];
      if (field.type === "obj") {
        Object.assign(item, obj[field.name as string] as object);
      } else {
        item[field.name as string] = formatFieldValue(field, obj[field.name as string] as FieldValue);
      }
    }
    resultItems.push(item);
  }
  items.value = resultItems;
});
</script>
