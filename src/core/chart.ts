/**
 * Chart data manipulation utilities
 * @module core/chart
 */

/**
 * Check if value is defined and not empty
 */
const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return false
  }
  return true
}

/**
 * Sum specified fields for each object in array and add result to sum attribute
 * Modifies array in place
 * @param array - Array of objects to process
 * @param fields - Field names to sum
 * @param sumAttr - Attribute name for sum result
 */
export const sumData = <T extends Record<string, unknown>>(
  array: T[],
  fields: string[],
  sumAttr: string
): void => {
  array.forEach((obj) => {
    const total = fields.reduce((sum, field) => {
      const value = obj[field]
      return sum + parseFloat(String(value) || '0')
    }, 0)
    ;(obj as Record<string, unknown>)[sumAttr] = total
  })
}

/**
 * Append object properties to all elements in array
 * Modifies array in place
 * @param array - Array of objects to modify
 * @param obj - Object with properties to append
 */
export const appendData = <T extends Record<string, unknown>>(
  array: T[],
  obj: Record<string, unknown>
): void => {
  array.forEach((element) => {
    Object.assign(element, obj)
  })
}

/**
 * Merge two chart data arrays by combining columns
 * Arrays must have at least 2 rows (header + data)
 * Modifies arr1 in place
 * @param arr1 - First chart data array
 * @param arr2 - Second chart data array
 */
export const mergeChartData = (
  arr1: (string | number)[][],
  arr2: (string | number)[][]
): void => {
  if (!arr1 || arr1.length < 2 || !arr2 || arr2.length < 2) {
    return
  }

  const max = Math.max(arr1.length, arr2.length)
  const arr1Cols = arr1[0].length
  const arr2Cols = arr2[0].length

  for (let i = 0; i < max; i++) {
    // Ensure arr1[i] exists
    if (!hasValue(arr1[i])) {
      arr1[i] = new Array(arr1Cols).fill('')
      arr1[i][0] = arr2[i]?.[0] || ''
    }

    // Ensure arr2[i] exists
    if (!hasValue(arr2[i])) {
      arr2[i] = new Array(arr2Cols).fill('')
    }

    // Merge columns (skip first column of arr2 as it's the label)
    arr1[i] = [...arr1[i], ...arr2[i].slice(1)]
  }
}
