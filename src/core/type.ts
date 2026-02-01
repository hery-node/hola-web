/**
 * Type system for form validation and formatting
 * @module core/type
 */

import type { TypeDefinition, InputType } from '@/types'

const typeManager: Record<string, TypeDefinition> = {}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if value is empty or undefined
 */
export const noValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim().length === 0) return true
  return false
}

/** Check if value is an integer */
export const isInt = (value: unknown): boolean =>
  parseInt(String(value)) === parseFloat(String(value))

/** Check if value is a float */
export const isFloat = (value: unknown): boolean =>
  !isNaN(parseFloat(String(value)))

/**
 * Format float value with fixed decimals
 */
const formatFloat = (value: unknown, decimals = 2, suffix = ''): string => {
  if (noValue(value)) return ''
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  const formatted = num.toFixed(decimals)
  return suffix ? formatted + suffix : formatted
}

// ============================================================================
// Rule Factory Functions
// ============================================================================

/** Create a pattern-based validation rule */
const patternRule = (
  pattern: RegExp,
  errKey: string
): TypeDefinition['rule'] => {
  return (t, fieldName) => {
    const err = t(errKey, { field: fieldName })
    return (value) => noValue(value) || pattern.test(String(value)) || err
  }
}

/** Create a numeric validation rule with optional constraints */
const numericRule = (
  errKey: string,
  validator: (value: unknown) => boolean
): TypeDefinition['rule'] => {
  return (t, fieldName) => {
    const err = t(errKey, { field: fieldName })
    return (value) => noValue(value) || validator(value) || err
  }
}

/** Create an enum type with items and format function */
const createEnumType = (
  name: string,
  itemsConfig: Array<{ value: number; label: string }>
): TypeDefinition => ({
  name,
  inputType: 'autocomplete',
  items: (ctx) => {
    const t = (ctx as { $t?: (key: string) => string }).$t ?? ((k: string) => k)
    return itemsConfig.map(({ value, label }) => ({
      value,
      title: t(label),
    }))
  },
  format: (value, t) => {
    if (noValue(value)) return ''
    const item = itemsConfig.find((i) => i.value === value)
    return item && t ? t(item.label) : ''
  },
})

// ============================================================================
// Type Registration
// ============================================================================

export const registerType = (type: TypeDefinition): void => {
  typeManager[type.name] = type
}

export const getType = (name: string): TypeDefinition | null => {
  return typeManager[name] || null
}

// ============================================================================
// Built-in Types: Basic
// ============================================================================

const SIMPLE_TYPES: Array<{
  name: string
  inputType: InputType
  searchInputType?: InputType
  multiple?: boolean
  format?: (value: unknown) => string
}> = [
    { name: 'obj', inputType: 'text' },
    { name: 'string', inputType: 'text' },
    { name: 'lstr', inputType: 'textarea', searchInputType: 'text' },
    { name: 'text', inputType: 'editor', searchInputType: 'text' },
    { name: 'enum', inputType: 'autocomplete' },
    { name: 'password', inputType: 'password', format: () => '***' },
    { name: 'secret', inputType: 'password', format: () => '***' },
    { name: 'secure', inputType: 'password', format: () => '***' },
    { name: 'file', inputType: 'file' },
    { name: 'array', inputType: 'autocomplete', multiple: true },
    { name: 'log_category', inputType: 'text' },
  ]

SIMPLE_TYPES.forEach(({ name, inputType, searchInputType, multiple, format }) => {
  registerType({
    name,
    inputType,
    ...(searchInputType && { searchInputType }),
    ...(multiple && { multiple }),
    ...(format && { format }),
  })
})

// ============================================================================
// Built-in Types: Boolean
// ============================================================================

registerType({
  name: 'boolean',
  inputType: 'switch',
  rule: (t, fieldName) => {
    const err = t('type.boolean', { field: fieldName })
    const validValues = [true, 'true', false, 'false']
    return (value) => noValue(value) || validValues.includes(value as boolean | string) || err
  },
  format: (value, t) => (t ? t(value === true ? 'type.boolean_true' : 'type.boolean_false') : ''),
})

// ============================================================================
// Built-in Types: Numeric
// ============================================================================

const NUMERIC_BASE = { inputType: 'number' as InputType, searchInputType: 'text' as InputType }

const NUMERIC_TYPES: Array<{
  name: string
  validator: (v: unknown) => boolean
  format?: boolean | ((v: unknown) => string)
  suffix?: string
  prefix?: string
}> = [
    { name: 'number', validator: (v) => !isNaN(Number(v)), format: true },
    { name: 'int', validator: isInt },
    { name: 'uint', validator: (v) => isInt(v) && parseInt(String(v)) >= 0 },
    { name: 'float', validator: isFloat, format: true },
    { name: 'ufloat', validator: (v) => isFloat(v) && parseFloat(String(v)) >= 0, format: true },
    { name: 'decimal', validator: isFloat, format: true },
    { name: 'percentage', validator: isFloat, suffix: '%', format: (v) => formatFloat(v, 2, '%') },
    { name: 'currency', validator: (v) => !isNaN(Number(v)), prefix: '$', format: true },
  ]

NUMERIC_TYPES.forEach(({ name, validator, format, suffix, prefix }) => {
  registerType({
    ...NUMERIC_BASE,
    name,
    ...(suffix && { suffix }),
    ...(prefix && { prefix }),
    rule: numericRule(`type.${name}`, validator),
    ...(format && {
      format: typeof format === 'function' ? format : (v: unknown) => formatFloat(v),
    }),
  })
})

// ============================================================================
// Built-in Types: Date/Time
// ============================================================================

registerType({
  name: 'date',
  inputType: 'date',
  format: (value) => {
    if (noValue(value)) return ''
    const d = new Date(String(value))
    if (isNaN(d.getTime())) return String(value)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  },
})

registerType({
  name: 'datetime',
  inputType: 'datetime',
  rule: numericRule('type.datetime', (v) => !isNaN(new Date(String(v)).getTime())),
  format: (value) => {
    if (noValue(value)) return ''
    const d = new Date(String(value))
    if (isNaN(d.getTime())) return String(value)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  },
})

registerType({
  name: 'time',
  inputType: 'time',
  rule: patternRule(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'type.time'),
})

// ============================================================================
// Built-in Types: Validation (pattern-based)
// ============================================================================

const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const COLOR_PATTERN = /^#([0-9A-F]{3}){1,2}$/i
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/

registerType({
  name: 'email',
  inputType: 'text',
  searchInputType: 'text',
  rule: patternRule(EMAIL_PATTERN, 'type.email'),
})

registerType({
  name: 'uuid',
  inputType: 'text',
  rule: patternRule(UUID_PATTERN, 'type.uuid'),
})

registerType({
  name: 'color',
  inputType: 'color',
  rule: patternRule(COLOR_PATTERN, 'type.color'),
})

registerType({
  name: 'slug',
  inputType: 'text',
  rule: patternRule(SLUG_PATTERN, 'type.slug'),
})

registerType({
  name: 'url',
  inputType: 'text',
  searchInputType: 'text',
  rule: (t, fieldName) => {
    const err = t('type.url', { field: fieldName })
    return (value) => {
      if (noValue(value)) return true
      try {
        new URL(String(value))
        return true
      } catch {
        return err
      }
    }
  },
})

registerType({
  name: 'phone',
  inputType: 'text',
  searchInputType: 'text',
  rule: (t, fieldName) => {
    const err = t('type.phone', { field: fieldName })
    return (value) => {
      if (noValue(value)) return true
      return PHONE_PATTERN.test(String(value).replace(/[\s\-()]/g, '')) || err
    }
  },
})

registerType({
  name: 'ip_address',
  inputType: 'text',
  rule: (t, fieldName) => {
    const err = t('type.ip_address', { field: fieldName })
    return (value) => {
      if (noValue(value)) return true
      const str = String(value)
      if (!IP_PATTERN.test(str)) return err
      return str.split('.').every((p) => parseInt(p) <= 255) || err
    }
  },
})

// ============================================================================
// Built-in Types: Data Structures
// ============================================================================

registerType({
  name: 'json',
  inputType: 'textarea',
  searchInputType: 'text',
  rule: (t, fieldName) => {
    const err = t('type.json', { field: fieldName })
    return (value) => {
      if (noValue(value) || typeof value === 'object') return true
      try {
        JSON.parse(String(value))
        return true
      } catch {
        return err
      }
    }
  },
  format: (value) => {
    if (noValue(value)) return ''
    return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
  },
})

// ============================================================================
// Built-in Types: Domain-Specific
// ============================================================================

registerType({
  name: 'age',
  inputType: 'number',
  searchInputType: 'text',
  suffix: (ctx) => {
    const t = (ctx as { $t?: (key: string) => string }).$t
    return t ? t('type.age_unit') : ''
  },
  rule: numericRule('type.age', (v) => isInt(v) && parseInt(String(v)) >= 0 && parseInt(String(v)) <= 200),
})

registerType(
  createEnumType('gender', [
    { value: 0, label: 'type.gender_male' },
    { value: 1, label: 'type.gender_female' },
  ])
)

registerType(
  createEnumType('log_level', [
    { value: 0, label: 'type.log_debug' },
    { value: 1, label: 'type.log_info' },
    { value: 2, label: 'type.log_warn' },
    { value: 3, label: 'type.log_error' },
  ])
)
