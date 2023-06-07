
const is_support_local_storage = () => {
    return typeof (Storage) !== "undefined";
}

const save_value = (key, value) => {
    is_support_local_storage() && localStorage.setItem(key, JSON.stringify(value));
}

const get_value = (key) => {
    if (is_support_local_storage()) {
        return JSON.parse(localStorage.getItem(key));
    } else {
        return undefined;
    }
}

export { save_value, get_value }