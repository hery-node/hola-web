/**
 * Core type definitions for hola-web
 */

// ============================================================================
// API Response Types
// ============================================================================

/** Response codes matching hola-server HTTP codes */
export const ResponseCode = {
  SUCCESS: 0,
  ERROR: 1,
  IMPORT_EMPTY_KEY: 100,
  IMPORT_WRONG_FIELDS: 101,
  IMPORT_DUPLICATE_KEY: 102,
  IMPORT_NO_FOUND_REF: 103,
  NO_SESSION: 200,
  NO_RIGHTS: 201,
  NO_PARAMS: 202,
  NOT_FOUND: 203,
  INVALID_PARAMS: 204,
  REF_NOT_FOUND: 205,
  REF_NOT_UNIQUE: 206,
  HAS_REF: 207,
  DUPLICATE_KEY: 300,
  DUPLICATE_UNIQUE: 301,
  NO_RESOURCE: 404,
} as const

export type ResponseCodeType = (typeof ResponseCode)[keyof typeof ResponseCode]

/** API response structure */
export interface ApiResponse<T = unknown> {
  code: ResponseCodeType
  data?: T
  msg?: string
  mode?: string
  total?: number
  err?: unknown
}

// ============================================================================
// Entity & Field Types
// ============================================================================

/** Field input types */
export type InputType =
  | 'text'
  | 'textarea'
  | 'editor'
  | 'password'
  | 'number'
  | 'autocomplete'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'color'

/** Entity field definition */
export interface EntityField {
  name: string
  type?: string
  label?: string
  required?: boolean
  searchable?: boolean
  editable?: boolean
  hidden?: boolean
  list?: boolean
  create?: boolean
  update?: boolean
  sys?: boolean
  auto?: boolean
  ref?: string
  view?: string | string[]
  search?: boolean
  query?: string
  multiple?: boolean
  items?: SelectItem[]
  prefix?: string | ((ctx: unknown) => string)
  suffix?: string | ((ctx: unknown) => string)
  icon?: string
  inputType?: InputType
  rules?: ValidationRule[]
}

/** Entity metadata from server */
export interface EntityMeta {
  collection: string
  fields: EntityField[]
  primaryKeys?: string[]
  refLabel?: string
  userField?: string
  creatable?: boolean
  readable?: boolean
  updatable?: boolean
  deleteable?: boolean
  cloneable?: boolean
}

// ============================================================================
// Form & UI Types
// ============================================================================

/** Select/autocomplete item */
export interface SelectItem {
  value: string | number | boolean
  title: string
}

/** Validation rule function */
export type ValidationRule = (value: unknown) => boolean | string

/** Alert state */
export interface AlertState {
  shown: boolean
  type: 'success' | 'info' | 'warning' | 'error'
  msg: string
}

/** Table header definition */
export interface TableHeader {
  key: string
  title: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string | number
}

/** Toolbar item */
export interface ToolbarItem {
  icon: string
  tooltip: string
  color?: string
  click: () => void
}

/** Item action */
export interface ItemAction {
  icon: string
  tooltip: string
  color?: string
  click: (item: Record<string, unknown>) => void
  show?: (item: Record<string, unknown>) => boolean
}

// ============================================================================
// Type System Types
// ============================================================================

/** Type definition for the type system */
export interface TypeDefinition {
  name: string
  inputType: InputType
  searchInputType?: InputType
  multiple?: boolean
  items?: (ctx: unknown) => SelectItem[]
  prefix?: string | ((ctx: unknown) => string)
  suffix?: string | ((ctx: unknown) => string)
  icon?: string
  rule?: (t: (key: string, params?: Record<string, unknown>) => string, fieldName: string) => ValidationRule
  format?: (value: unknown, t?: (key: string) => string) => string
}

// ============================================================================
// Chart Types
// ============================================================================

/** Chart data row (first row is header) */
export type ChartDataRow = (string | number)[]

/** Chart data array */
export type ChartData = ChartDataRow[]

/** Chart style overrides */
export interface ChartStyle {
  title?: Record<string, unknown>
  legend?: Record<string, unknown>
  tooltip?: Record<string, unknown>
  xAxis?: Record<string, unknown>
  yAxis?: Record<string, unknown>
  series?: Record<string, unknown>[]
}

// ============================================================================
// Plugin Types
// ============================================================================

/** Axios initialization config */
export interface AxiosConfig {
  baseURL: string
  timeout?: number
  withCredentials?: boolean
}

/** Response handler */
export interface ResponseHandler {
  handleResponse?: (code: ResponseCodeType, data: unknown) => void
}

/** Vuetify theme colors */
export interface ThemeColors {
  primary?: string
  secondary?: string
  accent?: string
  error?: string
  info?: string
  success?: string
  warning?: string
  progress?: string
  tag?: string
  tertiary?: string
  create?: string
  edit?: string
  clone?: string
  delete?: string
  refresh?: string
  chart?: string
  chartTitle?: string
  appBar?: string
  systemBar?: string
  tableHeader?: string
  toolbarIcon?: string
  chip?: string
  bgcolor?: string
  card?: string
  back?: string
  titleButton?: string
}

/** Plugin options */
export interface HolaWebOptions {
  theme?: {
    light?: ThemeColors
    dark?: ThemeColors
  }
}

/** Locale messages type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LocaleMessages = Record<string, any>
