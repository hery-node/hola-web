const type_manager = {};

/**
 * has value or not
 * @param {value to check} value
 * @returns
 */
const no_value = (value) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value == "undefined") {
    return true;
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return true;
  }
  return false;
};

/**
 * register your use type
 * @param {type object to do validation and type conversion} type
 */
const register_type = (type) => {
  type_manager[type.name] = type;
};

/**
 * get your user type
 * @param {type name} name
 * @returns
 */
const get_type = (name) => {
  const type = type_manager[name];
  if (type) {
    return type;
  } else {
    return null;
  }
};

const obj_type = {
  name: "obj",
  input_type: "text",
};

register_type(obj_type);

const boolean_type = {
  name: "boolean",
  input_type: "switch",

  rule: (vue, field_name) => {
    const err = vue.$t("type.boolean", { field: field_name });
    return (value) => no_value(value) || value === true || value === "true" || value === false || value === "false" || err;
  },

  format: (value, vue) => {
    if (no_value(value)) {
      return "";
    }
    return value == true ? vue.$t("type.boolean_true") : vue.$t("type.boolean_false");
  },
};

register_type(boolean_type);

const is_int = (value) => {
  return parseInt(value) == parseFloat(value);
};

const int_type = {
  name: "int",
  input_type: "number",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const err = vue.$t("type.int", { field: field_name });
    return (value) => no_value(value) || is_int(value) || err;
  },
};

register_type(int_type);

const uint_type = {
  name: "uint",
  input_type: "number",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const err = vue.$t("type.uint", { field: field_name });
    return (value) => no_value(value) || (is_int(value) && parseInt(value) >= 0) || err;
  },
};

register_type(uint_type);

const age_type = {
  name: "age",
  input_type: "number",
  search_input_type: "text",
  suffix: (vue) => {
    return vue.$t("type.age_unit");
  },

  rule: (vue, field_name) => {
    const err = vue.$t("type.age", { field: field_name });
    return (value) => no_value(value) || (is_int(value) && parseInt(value) > 0 && parseInt(value) < 200) || err;
  },
};

register_type(age_type);

const is_float = (value) => {
  return !isNaN(parseFloat(value));
};

const float_type = {
  name: "float",
  input_type: "number",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const err = vue.$t("type.float", { field: field_name });
    return (value) => no_value(value) || is_float(value) || err;
  },

  format: (value) => {
    if (no_value(value)) {
      return "";
    }
    return value.toFixed ? value.toFixed(2) : value;
  },
};

register_type(float_type);

const percentage_type = {
  name: "percentage",
  input_type: "number",
  search_input_type: "text",
  suffix: "%",

  rule: (vue, field_name) => {
    const err = vue.$t("type.percentage", { field: field_name });
    return (value) => no_value(value) || is_float(value) || err;
  },

  format: (value) => {
    if (no_value(value)) {
      return "";
    }
    return value.toFixed ? value.toFixed(2) + "%" : value + "%";
  },
};

register_type(percentage_type);

const ufloat_type = {
  name: "ufloat",
  input_type: "number",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const err = vue.$t("type.ufloat", { field: field_name });
    return (value) => no_value(value) || (is_float(value) && parseFloat(value) >= 0) || err;
  },

  format: (value) => {
    if (no_value(value)) {
      return "";
    }
    return value.toFixed ? value.toFixed(2) : value;
  },
};

register_type(ufloat_type);

const number_type = {
  name: "number",
  input_type: "number",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const err = vue.$t("type.number", { field: field_name });
    return (value) => no_value(value) || !isNaN(Number(value)) || err;
  },

  format: (value) => {
    if (no_value(value)) {
      return "";
    }
    return value.toFixed ? value.toFixed(2) : value;
  },
};

register_type(number_type);

const currency_type = {
  name: "currency",
  input_type: "number",
  search_input_type: "text",
  prefix: "$",

  rule: (vue, field_name) => {
    const err = vue.$t("type.number", { field: field_name });
    return (value) => no_value(value) || !isNaN(Number(value)) || err;
  },

  format: (value) => {
    if (no_value(value)) {
      return "";
    }
    return value.toFixed ? value.toFixed(2) : value;
  },
};

register_type(currency_type);

const email_type = {
  name: "email",
  input_type: "text",
  search_input_type: "text",

  rule: (vue, field_name) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const err = vue.$t("type.email", { field: field_name });
    return (value) => no_value(value) || pattern.test(value) || err;
  },
};

register_type(email_type);

const string_type = {
  name: "string",
  input_type: "text",
};

register_type(string_type);

const password_type = {
  name: "password",
  input_type: "password",

  format: function () {
    return "***";
  },
};

register_type(password_type);

const array_type = {
  name: "array",
  input_type: "autocomplete",
  multiple: true,
};

register_type(array_type);

const lstr_type = {
  name: "lstr",
  input_type: "textarea",
  search_input_type: "text",
};

register_type(lstr_type);

const text_type = {
  name: "text",
  input_type: "editor",
  search_input_type: "text",
};

register_type(text_type);

const date_type = {
  name: "date",
  input_type: "date",
};

register_type(date_type);

const gender_type = {
  name: "gender",
  input_type: "autocomplete",

  items: (vue) => {
    const genders = [];
    genders.push({ value: 0, text: vue.$t("type.gender_male") });
    genders.push({ value: 1, text: vue.$t("type.gender_female") });
    return genders;
  },

  format: (value, vue) => {
    if (no_value(value)) {
      return "";
    }
    return value == 1 ? vue.$t("type.gender_female") : vue.$t("type.gender_male");
  },
};

register_type(gender_type);

const LOG_LEVEL_DEBUG = 0;
const LOG_LEVEL_INFO = 1;
const LOG_LEVEL_WARN = 2;
const LOG_LEVEL_ERROR = 3;

const log_level_type = {
  name: "log_level",
  input_type: "autocomplete",

  items: (vue) => {
    const log_levels = [];
    log_levels.push({ value: LOG_LEVEL_DEBUG, text: vue.$t("type.log_debug") });
    log_levels.push({ value: LOG_LEVEL_INFO, text: vue.$t("type.log_info") });
    log_levels.push({ value: LOG_LEVEL_WARN, text: vue.$t("type.log_warn") });
    log_levels.push({ value: LOG_LEVEL_ERROR, text: vue.$t("type.log_error") });
    return log_levels;
  },

  format: (value, vue) => {
    if (no_value(value)) {
      return "";
    }
    switch (value) {
      case LOG_LEVEL_DEBUG:
        return vue.$t("type.log_debug");
      case LOG_LEVEL_INFO:
        return vue.$t("type.log_info");
      case LOG_LEVEL_WARN:
        return vue.$t("type.log_warn");
      case LOG_LEVEL_ERROR:
        return vue.$t("type.log_error");
      default:
        return "";
    }
  },
};

register_type(log_level_type);

export { register_type, get_type, no_value, is_int };
