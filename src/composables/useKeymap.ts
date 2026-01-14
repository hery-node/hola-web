/**
 * Keymap composable for keyboard event handling
 * Automatically registers/unregisters keydown listener
 */

import { onMounted, onUnmounted } from 'vue'

export interface UseKeymapOptions {
  onEscape?: () => void
  onKeyPress?: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

export type KeyboardHandler = (event: KeyboardEvent) => void

/**
 * Composable for keyboard shortcut handling
 * @param options - Keyboard event handlers or a single handler function
 */
export function useKeymap(options: UseKeymapOptions | KeyboardHandler = {}): void {
  // Handle both function and options object
  const handlers: UseKeymapOptions = typeof options === 'function' 
    ? { onKeyPress: options } 
    : options
  
  const { onEscape, onKeyPress, onKeyDown } = handlers

  const handleKeydown = (event: KeyboardEvent): void => {
    // Call the general keydown handler if provided
    onKeyDown?.(event)
    
    if (event.key === 'Escape' || event.keyCode === 27) {
      onEscape?.()
    } else {
      onKeyPress?.(event)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
