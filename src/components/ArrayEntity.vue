<template>
  <ArrayTable v-bind="$attrs" :objs="items"></ArrayTable>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef } from "vue";
import { useMeta } from "@/composables/useMeta";
import { readEntity } from "@/core/axios";
import ArrayTable from "./ArrayTable.vue";

/**
 * Array entity component
 * Displays array field from entity
 */

// Props
const props = defineProps<{
  entity: string;
  id: string;
  fieldName: string;
}>();

// Composables
useMeta({ entity: toRef(props, "entity") });

// State
const items = ref<Record<string, unknown>[]>([]);

// Lifecycle
onMounted(async () => {
  const obj = await readEntity(props.entity, props.id, props.fieldName);
  if (obj?.[props.fieldName]) {
    items.value = obj[props.fieldName] as Record<string, unknown>[];
  }
});
</script>
