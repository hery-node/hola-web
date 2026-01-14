/**
 * Wrap composable for text wrapping and newline conversion
 * Provides utilities to split long text into multiple lines
 */

export interface UseWrapOptions {
  maxLineWords?: number
}

export interface UseWrapReturn {
  splitToMultiline: (str: string) => string
  hasValue: (value: unknown) => boolean
  convertLongToNewline: (value: unknown) => string
  convertToSimpleValue: (items: Record<string, unknown>[], columns: number) => void
}

/**
 * Composable for text wrapping utilities
 */
export function useWrap(options: UseWrapOptions = {}): UseWrapReturn {
  const { maxLineWords = 50 } = options

  /**
   * Check if value has meaningful content
   */
  const hasValue = (value: unknown): boolean => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
  }

  /**
   * Split string into multiple lines by max length
   */
  const splitToMultiline = (str: string): string => {
    const arr: string[] = []
    let index = 0
    while (index < str.length) {
      arr.push(str.slice(index, index + maxLineWords))
      index += maxLineWords
    }
    return arr.join('\n')
  }

  /**
   * Convert long values to newline-separated format
   */
  const convertLongToNewline = (value: unknown): string => {
    if (!hasValue(value)) return ''

    if (typeof value === 'string') {
      return value.length <= maxLineWords || maxLineWords === -1
        ? value
        : splitToMultiline(value)
    }

    if (typeof value === 'object' && value !== null) {
      const str = JSON.stringify(value, null, 2)
      return str.length <= maxLineWords || maxLineWords === -1
        ? str
        : splitToMultiline(str)
    }

    return String(value)
  }

  /**
   * Convert items to simple display values (truncate long strings)
   */
  const convertToSimpleValue = (items: Record<string, unknown>[], columns: number): void => {
    for (const item of items) {
      for (let j = 0; j < columns; j++) {
        const key = columns > 1 ? `value${j}` : 'value'
        const value = item[key]
        if (typeof value === 'string' && value.length > maxLineWords) {
          item[key] = value.slice(0, maxLineWords) + '...'
        }
      }
    }
  }

  return {
    splitToMultiline,
    hasValue,
    convertLongToNewline,
    convertToSimpleValue,
  }
}
