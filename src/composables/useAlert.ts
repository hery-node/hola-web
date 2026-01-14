/**
 * Alert composable for displaying toast messages
 * Provides methods to show success, info, warning, and error alerts
 */

import { ref, type Ref } from 'vue'
import type { AlertState } from '@/types'

export interface UseAlertReturn {
  alert: Ref<AlertState>
  showSuccess: (msg: string, delay?: number) => void
  showInfo: (msg: string, delay?: number) => void
  showWarning: (msg: string, delay?: number) => void
  showError: (msg: string, delay?: number) => void
  showAlert: (type: AlertState['type'], msg: string, delay?: number) => void
  hideAlert: () => void
}

/**
 * Composable for alert/notification handling
 */
export function useAlert(): UseAlertReturn {
  const alert = ref<AlertState>({
    shown: false,
    type: 'info',
    msg: '',
  })

  /**
   * Show alert with specified type
   * @param type - Alert type (success|info|warning|error)
   * @param msg - Message to display
   * @param delay - Auto-hide delay in ms (default: 15000, 0 to disable)
   */
  const showAlert = (type: AlertState['type'], msg: string, delay?: number): void => {
    const time = delay ?? 15000
    alert.value.shown = true
    alert.value.type = type
    alert.value.msg = msg ? msg.replace(/\n/g, '<br />') : ''

    if (time > 0) {
      setTimeout(() => {
        alert.value.shown = false
      }, time)
    }
  }

  const showSuccess = (msg: string, delay?: number): void => {
    showAlert('success', msg, delay)
  }

  const showInfo = (msg: string, delay?: number): void => {
    showAlert('info', msg, delay)
  }

  const showWarning = (msg: string, delay?: number): void => {
    showAlert('warning', msg, delay)
  }

  const showError = (msg: string, delay?: number): void => {
    showAlert('error', msg, delay)
  }

  const hideAlert = (): void => {
    alert.value.shown = false
  }

  return {
    alert,
    showSuccess,
    showInfo,
    showWarning,
    showError,
    showAlert,
    hideAlert,
  }
}
