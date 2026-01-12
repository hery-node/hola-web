/**
 * @fileoverview Type system for form validation and formatting.
 * @module core/type
 */

const type_manager = {};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if value is empty or undefined.
 * @param {*} value - Value to check.
 * @returns {boolean} True if value is empty.
 */
const no_value = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  return false;
};

/** Check if value is an integer. */
const is_int = (value) => parseInt(value) === parseFloat(value);

/** Check if value is a float. */
const is_float = (value) => !isNaN(parseFloat(value));

/**
 * Format float value with fixed decimals.
 * @param {*} value - Value to format.
 * @param {number} decimals - Decimal places.
 * @param {string} suffix - Optional suffix.
 * @returns {string} Formatted value.
 */
const format_float = (value, decimals = 2, suffix = "") => {
  if (no_value(value)) return "";
  const formatted = value.toFixed ? value.toFixed(decimals) : value;
  return suffix ? formatted + suffix : formatted;
};

// ============================================================================
// Rule Factory Functions
// ============================================================================

/** Create a pattern-based validation rule. */
const pattern_rule = (pattern, err_key) => (vue, field_name) => {
  const err = vue.$t(err_key, { field: field_name });
  return (value) => no_value(value) || pattern.test(value) || err;
};

/** Create a numeric validation rule with optional constraints. */
const numeric_rule = (err_key, validator) => (vue, field_name) => {
  const err = vue.$t(err_key, { field: field_name });
  return (value) => no_value(value) || validator(value) || err;
};

/** Create an enum type with items and format function. */
const create_enum_type = (name, items_config) => ({
  name,
  input_type: "autocomplete",
  items: (vue) => items_config.map(({ value, label }) => ({ value, text: vue.$t(label) })),
  format: (value, vue) => {
    if (no_value(value)) return "";
    const item = items_config.find((i) => i.value === value);
    return item ? vue.$t(item.label) : "";
  },
});

// ============================================================================
// Type Registration
// ============================================================================

const register_type = (type) => { type_manager[type.name] = type; };
const get_type = (name) => type_manager[name] || null;

// ============================================================================
// Built-in Types: Basic (simple types without custom rules)
// ============================================================================

const SIMPLE_TYPES = [
  { name: "obj", input_type: "text" },
  { name: "string", input_type: "text" },
  { name: "lstr", input_type: "textarea", search_input_type: "text" },
  { name: "text", input_type: "editor", search_input_type: "text" },
  { name: "enum", input_type: "autocomplete" },
  { name: "password", input_type: "password", format: () => "***" },
  { name: "file", input_type: "file" },
  { name: "array", input_type: "autocomplete", multiple: true },
  { name: "date", input_type: "date" },
  { name: "log_category", input_type: "text" },
];

SIMPLE_TYPES.forEach(register_type);

// ============================================================================
// Built-in Types: Boolean
// ============================================================================

register_type({
  name: "boolean",
  input_type: "switch",
  rule: (vue, field_name) => {
    const err = vue.$t("type.boolean", { field: field_name });
    const valid_values = [true, "true", false, "false"];
    return (value) => no_value(value) || valid_values.includes(value) || err;
  },
  format: (value, vue) => vue.$t(value === true ? "type.boolean_true" : "type.boolean_false"),
});

// ============================================================================
// Built-in Types: Numeric
// ============================================================================

const NUMERIC_BASE = { input_type: "number", search_input_type: "text" };

const NUMERIC_TYPES = [
  { name: "number", validator: (v) => !isNaN(Number(v)), format: true },
  { name: "int", validator: is_int },
  { name: "uint", validator: (v) => is_int(v) && parseInt(v) >= 0 },
  { name: "float", validator: is_float, format: true },
  { name: "ufloat", validator: (v) => is_float(v) && parseFloat(v) >= 0, format: true },
  { name: "decimal", validator: is_float, format: true },
  { name: "percentage", validator: is_float, suffix: "%", format: (v) => format_float(v, 2, "%") },
  { name: "currency", validator: (v) => !isNaN(Number(v)), prefix: "$", format: true },
];

NUMERIC_TYPES.forEach(({ name, validator, format, suffix, prefix }) => {
  register_type({
    ...NUMERIC_BASE,
    name,
    ...(suffix && { suffix }),
    ...(prefix && { prefix }),
    rule: numeric_rule(`type.${name}`, validator),
    ...(format && { format: typeof format === "function" ? format : (v) => format_float(v) }),
  });
});

// ============================================================================
// Built-in Types: Date/Time
// ============================================================================

register_type({
  name: "datetime",
  input_type: "datetime",
  rule: numeric_rule("type.datetime", (v) => !isNaN(new Date(v).getTime())),
  format: (value) => {
    if (no_value(value)) return "";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
  },
});

register_type({
  name: "time",
  input_type: "time",
  rule: pattern_rule(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "type.time"),
});

// ============================================================================
// Built-in Types: Validation (pattern-based)
// ============================================================================

const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COLOR_PATTERN = /^#([0-9A-F]{3}){1,2}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

register_type({ name: "email", input_type: "text", search_input_type: "text", rule: pattern_rule(EMAIL_PATTERN, "type.email") });
register_type({ name: "uuid", input_type: "text", rule: pattern_rule(UUID_PATTERN, "type.uuid") });
register_type({ name: "color", input_type: "color", rule: pattern_rule(COLOR_PATTERN, "type.color") });
register_type({ name: "slug", input_type: "text", rule: pattern_rule(SLUG_PATTERN, "type.slug") });

register_type({
  name: "url",
  input_type: "text",
  search_input_type: "text",
  rule: (vue, field_name) => {
    const err = vue.$t("type.url", { field: field_name });
    return (value) => {
      if (no_value(value)) return true;
      try { new URL(value); return true; }
      catch { return err; }
    };
  },
});

register_type({
  name: "phone",
  input_type: "text",
  search_input_type: "text",
  rule: (vue, field_name) => {
    const err = vue.$t("type.phone", { field: field_name });
    return (value) => {
      if (no_value(value)) return true;
      return PHONE_PATTERN.test(value.replace(/[\s\-()]/g, "")) || err;
    };
  },
});

register_type({
  name: "ip_address",
  input_type: "text",
  rule: (vue, field_name) => {
    const err = vue.$t("type.ip_address", { field: field_name });
    return (value) => {
      if (no_value(value)) return true;
      if (!IP_PATTERN.test(value)) return err;
      return value.split(".").every((p) => parseInt(p) <= 255) || err;
    };
  },
});

// ============================================================================
// Built-in Types: Data Structures
// ============================================================================

register_type({
  name: "json",
  input_type: "textarea",
  search_input_type: "text",
  rule: (vue, field_name) => {
    const err = vue.$t("type.json", { field: field_name });
    return (value) => {
      if (no_value(value) || typeof value === "object") return true;
      try { JSON.parse(value); return true; }
      catch { return err; }
    };
  },
  format: (value) => {
    if (no_value(value)) return "";
    return typeof value === "object" ? JSON.stringify(value, null, 2) : value;
  },
});

// ============================================================================
// Built-in Types: Domain-Specific
// ============================================================================

register_type({
  name: "age",
  input_type: "number",
  search_input_type: "text",
  suffix: (vue) => vue.$t("type.age_unit"),
  rule: numeric_rule("type.age", (v) => is_int(v) && parseInt(v) >= 0 && parseInt(v) <= 200),
});

register_type(create_enum_type("gender", [
  { value: 0, label: "type.gender_male" },
  { value: 1, label: "type.gender_female" },
]));

register_type(create_enum_type("log_level", [
  { value: 0, label: "type.log_debug" },
  { value: 1, label: "type.log_info" },
  { value: 2, label: "type.log_warn" },
  { value: 3, label: "type.log_error" },
]));

export { register_type, get_type, no_value, is_int };
