/**
 * Core type definitions for hola-web
 */

// ============================================================================
// Base Types
// ============================================================================

/** Field value type - matches server-side FieldValue */
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | FieldValue[]
  | { [key: string]: FieldValue };

/** Entity data record */
export type EntityData = Record<string, FieldValue>;

// ============================================================================
// API Response Types
// ============================================================================

/** Response codes - re-export from core/code */
export * from "@/core/code";

export type ResponseCodeType = number;

/** API response structure */
export interface ApiResponse<T = unknown> {
  code: ResponseCodeType;
  data?: T;
  msg?: string;
  mode?: string;
  total?: number;
  err?: string | string[];
}

// ============================================================================
// Entity & Field Types
// ============================================================================

/** Form context for callbacks (items, prefix, suffix functions) */
export interface FormContext {
  t: (key: string, params?: Record<string, string | number>) => string;
  [key: string]: FieldValue | ((key: string, params?: Record<string, string | number>) => string);
}

/** Field input types */
export type InputType = "text" | "textarea" | "editor" | "password" | "number" | "autocomplete" | "switch" | "date" | "datetime" | "time" | "file" | "color";

/** Entity field definition */
export interface EntityField {
  name: string;
  type?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  editable?: boolean;
  hidden?: boolean;
  list?: boolean;
  create?: boolean;
  update?: boolean;
  clone?: boolean;
  sys?: boolean;
  auto?: boolean;
  ref?: string;
  view?: string | string[];
  search?: boolean;
  query?: string;
  multiple?: boolean;
  items?: SelectItem[];
  prefix?: string | ((ctx: FormContext) => string);
  suffix?: string | ((ctx: FormContext) => string);
  icon?: string;
  inputType?: InputType;
  rules?: ValidationRule[];
}

/** Entity metadata from server */
export interface EntityMeta {
  mode?: string;
  fields: EntityField[];
}

// ============================================================================
// Form & UI Types
// ============================================================================

/** Select/autocomplete item */
export interface SelectItem {
  value: string | number | boolean;
  title: string;
}

/** Validation rule function */
export type ValidationRule = (value: unknown) => boolean | string;

/** Alert state */
export interface AlertState {
  shown: boolean;
  type: "success" | "info" | "warning" | "error";
  msg: string;
}

/** Table header definition */
export interface TableHeader {
  key: string;
  title: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string | number;
}

/** Toolbar item */
export interface ToolbarItem {
  icon: string;
  tooltip: string;
  color?: string;
  click: () => void;
}

/** Item action */
export interface ItemAction {
  icon: string;
  tooltip: string;
  color?: string;
  click: (item: EntityData & { _id: string }) => void;
  show?: (item: EntityData & { _id: string }) => boolean;
}

// ============================================================================
// Type System Types
// ============================================================================

/** Type definition for the type system */
export interface TypeDefinition {
  name: string;
  inputType: InputType;
  searchInputType?: InputType;
  multiple?: boolean;
  items?: (ctx: FormContext) => SelectItem[];
  prefix?: string | ((ctx: FormContext) => string);
  suffix?: string | ((ctx: FormContext) => string);
  icon?: string;
  rule?: (t: (key: string, params?: Record<string, string | number>) => string, fieldName: string) => ValidationRule;
  format?: (value: FieldValue, t?: (key: string) => string) => string;
}

// ============================================================================
// Chart Types
// ============================================================================

/** Chart data row (first row is header) */
export type ChartDataRow = (string | number)[];

/** Chart data array */
export type ChartData = ChartDataRow[];

/** ECharts style value - can be primitives or objects */
type EChartsValue = string | number | boolean | null | EChartsValue[] | { [key: string]: EChartsValue };

/** Chart style overrides */
export interface ChartStyle {
  title?: Record<string, EChartsValue>;
  legend?: Record<string, EChartsValue>;
  tooltip?: Record<string, EChartsValue>;
  xAxis?: Record<string, EChartsValue>;
  yAxis?: Record<string, EChartsValue>;
  series?: Record<string, EChartsValue>[];
}

// ============================================================================
// Plugin Types
// ============================================================================

/** Axios initialization config */
export interface AxiosConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
}

/** Response handler */
export interface ResponseHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleResponse?: (code: ResponseCodeType, response: ApiResponse<any>) => void;
}

/** Vuetify theme colors */
export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  error?: string;
  info?: string;
  success?: string;
  warning?: string;
  progress?: string;
  tag?: string;
  tertiary?: string;
  create?: string;
  edit?: string;
  clone?: string;
  delete?: string;
  refresh?: string;
  chart?: string;
  chartTitle?: string;
  appBar?: string;
  systemBar?: string;
  tableHeader?: string;
  toolbarIcon?: string;
  chip?: string;
  bgcolor?: string;
  card?: string;
  back?: string;
  titleButton?: string;
}

/** Plugin options */
export interface HolaWebOptions {
  theme?: { light?: ThemeColors; dark?: ThemeColors };
}

/** Locale messages type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LocaleMessages = Record<string, any>;
