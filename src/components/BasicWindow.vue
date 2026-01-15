<script setup lang="ts">
/**
 * Basic window component with minimize/maximize/expand controls
 * Provides resizable modal dialog
 */
import { ref, useTemplateRef } from "vue";

// Props
export interface BasicWindowProps {
  title: string;
  width?: string;
  zIndex?: number;
}

const props = withDefaults(defineProps<BasicWindowProps>(), {
  width: "80%",
  zIndex: 200,
});

// Emits
const emit = defineEmits<{
  (e: "close"): void;
  (e: "resize", size: { width: string; height: number }): void;
}>();

// Template refs
const content = useTemplateRef<HTMLDivElement>("content");

// State
const dialog = ref(false);
const fullscreen = ref(false);
const minimized = ref(false);
const buttonDisabled = ref(false);
const windowWidth = ref(props.width);
const originalHeight = ref(0);
const winWidth = ref(props.width);

/** Minimize window to title bar */
function minimize(): void {
  minimized.value = true;
  winWidth.value = "100px";
}

/** Restore from minimized state */
function maximize(): void {
  minimized.value = false;
  winWidth.value = props.width;
}

/** Collapse from fullscreen */
function collapse(): void {
  windowWidth.value = props.width;
  fullscreen.value = false;
  if (content.value) {
    content.value.style.height = `${originalHeight.value}px`;
  }
  emit("resize", { width: props.width, height: originalHeight.value });
}

/** Expand to fullscreen */
function expand(): void {
  fullscreen.value = true;
  const height = window.innerHeight - 66;
  if (content.value) {
    content.value.style.height = `${height}px`;
  }
  emit("resize", { width: "100%", height });
}

/** Show window and capture initial height */
function show(): void {
  dialog.value = true;
  buttonDisabled.value = true;
  setTimeout(() => {
    originalHeight.value = content.value?.offsetHeight ?? 0;
    buttonDisabled.value = false;
  }, 1000);
}

/** Close window */
function close(): void {
  dialog.value = false;
  emit("close");
}

// Expose methods for parent component ref access
defineExpose({
  show,
  close,
});
</script>

<template>
  <v-dialog v-model="dialog" :width="winWidth" :max-width="windowWidth" :fullscreen="fullscreen" :style="{ zIndex }" persistent no-click-animation @keydown.esc="close">
    <v-toolbar :collapse="minimized" color="secondary">
      <v-icon class="ml-3 mr-3">mdi-microsoft-windows</v-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn v-show="!minimized" icon :disabled="buttonDisabled" @click.stop="minimize">
        <v-icon>mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn v-show="minimized" icon :disabled="buttonDisabled" @click.stop="maximize">
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
      <v-btn v-show="!fullscreen" icon :disabled="buttonDisabled" @click.stop="expand">
        <v-icon>mdi-arrow-expand</v-icon>
      </v-btn>
      <v-btn v-show="fullscreen" icon :disabled="buttonDisabled" @click.stop="collapse">
        <v-icon>mdi-arrow-collapse</v-icon>
      </v-btn>
      <v-btn icon @click.stop="close">
        <v-icon>mdi-close-box-outline</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="content" v-show="!minimized" style="width: 100%; height: 100%; display: block; background-color: rgb(var(--v-theme-surface))">
      <slot />
    </div>
  </v-dialog>
</template>
