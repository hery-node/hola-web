/**
 * Fuzzy matching composable for comparing object attributes
 * Provides string similarity calculation and attribute merging
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

export interface UseFuzzyOptions {
  similarityThreshold?: number
  onFuzzyMatchChange?: (enabled: boolean) => void
}

export interface MergeResult {
  mergedAttributes: string[]
  map: Record<string, string>
}

export interface UseFuzzyReturn {
  fuzzyMatch: Ref<boolean>
  showFuzzyMatch: ComputedRef<boolean>
  showFuzzyLabel: ComputedRef<string>
  stringSimilarity: (x: string, y: string) => number
  isSimilar: (x: string, y: string) => boolean
  mergeAttributes: (objs: Record<string, unknown>[]) => MergeResult
}

/**
 * Composable for fuzzy string matching
 */
export function useFuzzy(options: UseFuzzyOptions = {}): UseFuzzyReturn {
  const { similarityThreshold = 80, onFuzzyMatchChange } = options

  const { t } = useI18n()
  const fuzzyMatch = ref(false)

  // Computed
  const showFuzzyMatch = computed(() => true)
  const showFuzzyLabel = computed(() => t('compare.fuzzy_match'))

  // Watch fuzzy match changes
  watch(fuzzyMatch, (newValue) => {
    onFuzzyMatchChange?.(newValue)
  })

  /**
   * Calculate string similarity (0-200)
   * @param x - First string
   * @param y - Second string
   * @returns Similarity score (0-200)
   */
  const stringSimilarity = (x: string, y: string): number => {
    let matchCount = 0
    let strX = x.toUpperCase().replace(/_/g, '').split('')
    let strY = y.toUpperCase().replace(/_/g, '').split('')

    const totalLength = strX.length + strY.length
    strX.sort()
    strY.sort()

    let charX: string | undefined = strX.shift()
    let charY: string | undefined = strY.shift()

    while (charX !== undefined && charY !== undefined) {
      if (charX === charY) {
        matchCount++
        charX = strX.shift()
        charY = strY.shift()
      } else if (charX < charY) {
        charX = strX.shift()
      } else {
        charY = strY.shift()
      }
    }

    return totalLength > 0 ? Math.round((matchCount * 200) / totalLength) : 0
  }

  /**
   * Check if two strings are similar based on threshold
   */
  const isSimilar = (x: string, y: string): boolean => {
    return stringSimilarity(x, y) >= similarityThreshold
  }

  /**
   * Merge attributes from multiple objects, finding similar attribute names
   */
  const mergeAttributes = (objs: Record<string, unknown>[]): MergeResult => {
    const allKeys: Set<string> = new Set()
    const map: Record<string, string> = {}

    // Collect all keys from all objects
    for (const obj of objs) {
      if (obj) {
        Object.keys(obj).forEach((key) => allKeys.add(key))
      }
    }

    const mergedAttributes = Array.from(allKeys)

    // Build similarity map if fuzzy matching is enabled
    if (fuzzyMatch.value) {
      const keysArray = mergedAttributes.slice()
      for (let i = 0; i < keysArray.length; i++) {
        for (let j = i + 1; j < keysArray.length; j++) {
          if (isSimilar(keysArray[i], keysArray[j])) {
            map[keysArray[j]] = keysArray[i]
          }
        }
      }
    }

    return { mergedAttributes, map }
  }

  return {
    fuzzyMatch,
    showFuzzyMatch,
    showFuzzyLabel,
    stringSimilarity,
    isSimilar,
    mergeAttributes,
  }
}
