/**
 * Regex composable for pattern-based search
 * Provides regex search functionality for filtering
 */

export interface UseRegexReturn {
  regexSearch: (value: unknown, search: string) => boolean
  createRegex: (pattern: string, flags?: string) => RegExp | null
}

/**
 * Composable for regex search utilities
 */
export function useRegex(): UseRegexReturn {
  /**
   * Test if value matches regex pattern
   * @param value - Value to test
   * @param search - Regex pattern
   * @returns True if matches
   */
  const regexSearch = (value: unknown, search: string): boolean => {
    if (value !== null && value !== undefined && search !== null && search !== undefined) {
      try {
        const regex = new RegExp(search, 'gi')
        return regex.test(String(value))
      } catch {
        // Invalid regex pattern
        return false
      }
    }
    return false
  }

  /**
   * Safely create a RegExp from a pattern string
   * @param pattern - Regex pattern
   * @param flags - Regex flags
   * @returns RegExp or null if invalid
   */
  const createRegex = (pattern: string, flags = 'gi'): RegExp | null => {
    try {
      return new RegExp(pattern, flags)
    } catch {
      return null
    }
  }

  return {
    regexSearch,
    createRegex,
  }
}
