/**
 * Simple value composable for converting large numbers to K/M/B/T format
 * Provides human-readable number formatting
 */

const THOUSAND = 1000
const MILLION = THOUSAND * 1000
const BILLION = MILLION * 1000
const TRILLION = BILLION * 1000

export interface UseSimpleValueReturn {
  convertToSimpleValue: <T extends Record<string, unknown>>(items: T[], columns: number) => void
  formatNumber: (value: number) => string
}

/**
 * Composable for number formatting
 */
export function useSimpleValue(): UseSimpleValueReturn {
  /**
   * Format a number to simplified format (K/M/B/T)
   */
  const formatNumber = (value: number): string => {
    if (isNaN(value)) return String(value)

    if (value > TRILLION) {
      return (value / TRILLION).toFixed(2) + ' T'
    } else if (value > BILLION) {
      return (value / BILLION).toFixed(2) + ' B'
    } else if (value > MILLION) {
      return (value / MILLION).toFixed(2) + ' M'
    } else if (value > THOUSAND) {
      return (value / THOUSAND).toFixed(2) + ' K'
    }
    return String(value)
  }

  /**
   * Convert large numbers to simplified format (K/M/B/T)
   * @param items - Items with value properties
   * @param columns - Number of value columns
   */
  const convertToSimpleValue = <T extends Record<string, unknown>>(
    items: T[],
    columns: number
  ): void => {
    for (const item of items) {
      for (let j = 0; j < columns; j++) {
        const key = columns === 1 ? 'value' : `value${j}`
        const value = parseFloat(String(item[key]))

        if (!isNaN(value)) {
          ;(item as Record<string, unknown>)[key] = formatNumber(value)
        }
      }
    }
  }

  return {
    convertToSimpleValue,
    formatNumber,
  }
}
