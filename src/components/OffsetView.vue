<template>
  <div :style="styles" :class="classes" class="v-offset">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Offset view component
 * Provides container with negative top margin offset
 */

// Props
const props = withDefaults(
  defineProps<{
    fullWidth?: boolean;
    offset?: number | string;
  }>(),
  {
    fullWidth: false,
    offset: 0,
  }
);

// Computed
const classes = computed(() => ({
  "v-offset--full-width": props.fullWidth,
}));

const styles = computed(() => {
  const offsetNum = typeof props.offset === "string" ? parseInt(props.offset) : props.offset;
  return {
    top: `-${offsetNum}px`,
    marginBottom: `-${offsetNum}px`,
  };
});
</script>

<style>
.v-offset {
  margin: 0 auto;
  max-width: calc(100% - 32px);
  position: relative;
}
.v-offset--full-width {
  max-width: 100%;
}
</style>
