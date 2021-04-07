const type_manager = {};

/**
 * has value or not
 * @param {value to check} value 
 * @returns 
 */
const has_value = function (value) {
    if (value === undefined || value === null) {
        return false
    }
    if (typeof value == 'undefined') {
        return false;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return false;
    }
    return true;
};


/**
 * register your use type
 * @param {type object to do validation and type conversion} type 
 */
const register_type = type => {
    type_manager[type.name] = type;
}

/**
 * get your user type
 * @param {type name} name 
 * @returns 
 */
const get_type = name => {
    const type = type_manager[name];
    if (type) {
        return type;
    } else {
        throw new Error('no type registered for name [' + name + ']');
    }
}

const boolean_type = {
    name: "boolean",
    input_type: "switch",
    rule: function (vue, field_name) {
        const err = vue.$t("type.boolean", { field: field_name });
        return (value) => value === true || value === "true" || value === false || value === "false" || err;
    },
    format: function (value, vue) {
        return value == true ? vue.$t("type.boolean_true") : vue.$t("type.boolean_false");
    }
}

register_type(boolean_type);

const is_int = (value) => {
    return parseInt(value) == parseFloat(value);
}

const int_type = {
    name: "int",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.int", { field: field_name });
        return (value) => is_int(value) || err;
    }
}

register_type(int_type);

const uint_type = {
    name: "uint",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.uint", { field: field_name });
        return (value) => (is_int(value) && parseInt(value) >= 0) || err;
    }
}

register_type(uint_type);

const age_type = {
    name: "age",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.age", { field: field_name });
        return (value) => !value || (is_int(value) && parseInt(value) > 0 && parseInt(value) < 200) || err;
    }
}

register_type(age_type);

const is_float = (value) => {
    return !isNaN(parseFloat(value));
}

const float_type = {
    name: "float",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.float", { field: field_name });
        return (value) => is_float(value) || err;
    }
}

register_type(float_type);

const percentage_type = {
    name: "percentage",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.percentage", { field: field_name });
        return (value) => is_float(value) || err;
    },
    format: function (value) {
        return value ? value + "%" : "0%";
    }
}

register_type(percentage_type);

const ufloat_type = {
    name: "ufloat",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.ufloat", { field: field_name });
        return (value) => (is_float(value) && parseFloat(value) >= 0) || err;
    }
}

register_type(ufloat_type);

const number_type = {
    name: "number",
    input_type: "number",
    rule: function (vue, field_name) {
        const err = vue.$t("type.number", { field: field_name });
        return (value) => !isNaN(Number(value)) || err;
    }
}

register_type(number_type);

const string_type = {
    name: "string",
    input_type: "text"
}

register_type(string_type);

const password_type = {
    name: "password",
    input_type: "password",
    format: function () {
        return "***";
    }
}

register_type(password_type);

const array_type = {
    name: "array",
    input_type: "autocomplete",
    multiple: true
}

register_type(array_type);

const lstr_type = {
    name: "lstr",
    input_type: "textarea"
}

register_type(lstr_type);

const text_type = {
    name: "text",
    input_type: "editor"
}

register_type(text_type);

const date_type = {
    name: "date",
    input_type: "date"
}

register_type(date_type);

const gender_type = {
    name: "gender",
    input_type: "autocomplete",
    items: function (vue) {
        const genders = [];
        genders.push({ value: 0, text: vue.$t("type.gender_male") });
        genders.push({ value: 1, text: vue.$t("type.gender_female") });
        return genders;
    },
    format: function (value, vue) {
        return value == 1 ? vue.$t("type.gender_female") : vue.$t("type.gender_male");
    }
}

register_type(gender_type);

export { register_type, get_type, has_value }

