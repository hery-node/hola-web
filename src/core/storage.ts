/**
 * Browser localStorage utility functions
 * @module core/storage
 */

/**
 * Check if browser supports localStorage
 */
const isLocalStorageSupported = (): boolean => {
  try {
    return typeof Storage !== 'undefined' && localStorage !== null
  } catch {
    return false
  }
}

/**
 * Save value to localStorage with JSON serialization
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 */
export const saveValue = <T>(key: string, value: T): void => {
  if (isLocalStorageSupported()) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }
}

/**
 * Retrieve value from localStorage with JSON deserialization
 * @param key - Storage key
 * @returns Parsed value or undefined if not found
 */
export const getValue = <T>(key: string): T | undefined => {
  if (!isLocalStorageSupported()) {
    return undefined
  }

  const item = localStorage.getItem(key)
  if (item === null) {
    return undefined
  }

  try {
    return JSON.parse(item) as T
  } catch {
    return undefined
  }
}

/**
 * Remove value from localStorage
 * @param key - Storage key
 */
export const removeValue = (key: string): void => {
  if (isLocalStorageSupported()) {
    localStorage.removeItem(key)
  }
}

/**
 * Clear all values from localStorage
 */
export const clearStorage = (): void => {
  if (isLocalStorageSupported()) {
    localStorage.clear()
  }
}
