import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

const META = "/meta";
const CREATE = "/create";
const READ = "/read";
const READ_PROPERTIES = "/read_properties";
const LIST = "/list";
const UPDATE = "/update";
const CLONE = "/clone";
const DELETE = "/delete";
const REF = "/ref";

const CODE = {
    ERROR: 0,
    SUCCESS: 1,
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
    NO_RESOURCE: 404,
};

let _axios;

const default_handler = {
    handle_response: (code, data) => { console.log(code); console.log(data) },
};

const cache_memory = {};

function set_cache(key, value) {
    cache_memory[key] = value;
}

function has_cache(key) {
    return cache_memory[key];
}

function get_cache(key) {
    return cache_memory[key];
}

const init_axios = (config, handler) => {
    const default_config = {
        timeout: 60 * 1000,
        withCredentials: true
    };
    _axios = axios.create({ ...default_config, ...config });

    const response_handler = { ...default_handler, ...handler };

    _axios.interceptors.response.use(function (response) {
        const data = response.data;
        const code = response.data.code;
        response_handler.handle_response(code, data);
        return data;
    }, function (error) {
        return Promise.reject(error);
    });

    return _axios;
}

const get_axios = () => {
    if (!_axios) {
        throw new Error("use init_axios init first");
    }
    return _axios;
}

const axios_post = (url, data) => {
    const _axios = get_axios();
    return _axios.post(url, data);
};

const axios_post_file_form = (url, data) => {
    const _axios = get_axios();
    const form_data = new FormData();
    Object.keys(data).forEach(key => form_data.append(key, data[key]));
    return _axios.post(url, form_data, { headers: { 'Content-Type': 'multipart/form-data' } });
};

const axios_get = (url, params) => {
    const _axios = get_axios();
    return _axios.get(url, { params: params });
};

const is_success_response = (code) => {
    return code == CODE.SUCCESS;
}

const is_error_response = (code) => {
    return code == CODE.ERROR;
}

const has_invalid_params = (code) => {
    return code == CODE.INVALID_PARAMS;
}

const is_duplicated = (code) => {
    return code == CODE.DUPLICATE_KEY;
}

const is_been_referred = (code) => {
    return code == CODE.HAS_REF;
}

const is_no_session = (code) => {
    return code == CODE.NO_SESSION;
}

const axios_cached_get = async (url, params) => {
    if (has_cache(url)) {
        return get_cache(url);
    } else {
        const _axios = get_axios();
        const data = await _axios.get(url, { params: params });
        if (is_success_response(data.code)) {
            set_cache(url, data);
        }
        return data;
    }
};

const axios_upload = (url, file) => {
    const _axios = get_axios();
    const formData = new FormData();
    formData.append("file", file);
    return _axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

const axios_download = (url, file_name, params) => {
    const _axios = get_axios();
    _axios({ url: url, method: 'get', params: params, responseType: 'blob' })
        .then(res => {
            const blob = new Blob([res]);
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, file_name);
            } else {
                const link = document.createElement("a");
                const evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                link.href = URL.createObjectURL(blob);
                link.download = file_name;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(link.href);
            }
        });
};

const get_entity_meta = (entity) => {
    const url = "/" + entity + META;
    return axios_cached_get(url).then(result => {
        if (is_success_response(result.code)) {
            return result.data;
        } else {
            return null;
        }
    });
};

const get_ref_labels = (entity) => {
    const url = "/" + entity + REF;
    return axios_get(url).then(result => {
        if (is_success_response(result.code)) {
            return result.data;
        } else {
            return [];
        }
    });
};

const read_entity = (entity, id, attr_names) => {
    const url = "/" + entity + READ;
    const params = { "_id": id, "attr_names": attr_names };

    return axios_post(url, params).then(result => {
        if (is_success_response(result.code)) {
            return result.data;
        } else {
            return {};
        }
    });
};

const read_entity_properties = (entity, id, attr_names) => {
    const url = "/" + entity + READ_PROPERTIES;
    const params = { "_id": id, "attr_names": attr_names };

    return axios_post(url, params).then(result => {
        if (is_success_response(result.code)) {
            return result.data;
        } else {
            return {};
        }
    });
};

const list_entity = (entity, form, params, list_action) => {
    const url = "/" + entity + list_action ? list_action : LIST;
    form["_query"] = params;
    return axios_post(url, form);
};

const save_entity = (entity, form, edit_mode, clone) => {
    const url = edit_mode ? (clone ? "/" + entity + CLONE : "/" + entity + UPDATE) : "/" + entity + CREATE;
    if (form._has_file) {
        return axios_post_file_form(url, form);
    } else {
        return axios_post(url, form);
    }
};

const delete_entity = (entity, ids) => {
    const url = "/" + entity + DELETE;
    return axios_post(url, { "ids": ids.join(",") });
};

const get_url = (url) => {
    const _axios = get_axios();
    const base = _axios.defaults.baseURL;
    return `${base}${url}`;
};

export {
    init_axios, get_url,
    axios_get, axios_post, axios_cached_get, axios_download, axios_upload,
    is_success_response, is_error_response, is_been_referred, is_duplicated, has_invalid_params, is_no_session,
    save_entity, read_entity, read_entity_properties, list_entity, delete_entity, get_ref_labels, get_entity_meta
}
