let form_type_mapping = {
    "boolean": "switch",
    "int": "number",
    "uint": "number",
    "float": "number",
    "ufloat": "number",
    "number": "number",
    "string": "text",
    "password": "password",
    "file": "file",
    "array": "array"
}

const set_form_type_mapping = (mapping) => {
    form_type_mapping = mapping;
}

const get_form_type_mapping = () => {
    return form_type_mapping;
}

export { set_form_type_mapping, get_form_type_mapping }
