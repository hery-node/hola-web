<script setup lang="ts">
/**
 * Confirm dialog component
 * Provides promise-based confirmation dialog
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
interface Props {
  width?: string
  zIndex?: number
  titleClass?: string
  hideCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  width: '800px',
  zIndex: 200,
  titleClass: 'bg-warning text-body-2 font-weight-bold',
  hideCancel: false,
})

// i18n
const { t } = useI18n()

// State
const dialog = ref(false)
const title = ref('')
const message = ref('')
const resolvePromise = ref<((value: boolean) => void) | null>(null)

/**
 * Open dialog and return promise
 * @param dialogTitle - Dialog title
 * @param dialogMessage - Dialog message
 * @returns User response (true = confirmed, false = cancelled)
 */
function open(dialogTitle: string, dialogMessage: string): Promise<boolean> {
  title.value = dialogTitle
  message.value = dialogMessage
  dialog.value = true
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

/** User confirmed */
function agree(): void {
  resolvePromise.value?.(true)
  dialog.value = false
}

/** User cancelled */
function cancel(): void {
  resolvePromise.value?.(false)
  dialog.value = false
}

// Expose methods for parent component ref access
defineExpose({
  open,
})
</script>

<template>
  <v-dialog
    v-model="dialog"
    :max-width="width"
    :style="{ zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar :class="titleClass" density="compact">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text
        v-show="!!message"
        class="pa-4 text-black"
        v-html="message"
      />
      <v-card-actions class="pt-3">
        <v-spacer />
        <v-btn
          v-if="!hideCancel"
          color="grey"
          variant="outlined"
          class="text-body-2 font-weight-bold"
          @click="cancel"
        >
          {{ t('confirm.no') }}
        </v-btn>
        <v-btn
          color="success"
          variant="outlined"
          class="text-body-2 font-weight-bold"
          @click="agree"
        >
          {{ t('confirm.yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
