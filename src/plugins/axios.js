import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

const META = "/meta";
const CREATE = "/create";
const READ = "/read";
const LIST = "/list";
const UPDATE = "/update";
const DELETE = "/delete";
const REF = "/ref";

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
    return new Promise(function (resolve) {
        resolve(cache_memory[key]);
    });
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

const axios_cached_get = (url, params) => {
    if (has_cache(url)) {
        return get_cache(url);
    } else {
        const _axios = get_axios();
        return _axios.get(url, { params: params }).then(data => {
            if (data.code == AXIOS_SUCCESS) {
                set_cache(url, data);
            }
            return data;
        });
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

Plugin.install = (Vue) => {
    Vue.axios_upload = axios_upload;
    Vue.axios_download = axios_download;

    Vue.get_entity_meta = (entity) => {
        const url = "/" + entity + META;
        return axios_cached_get(url).then(result => {
            if (result.code === AXIOS_SUCCESS) {
                return result.data;
            } else {
                return [];
            }
        });
    };

    Vue.get_ref_labels = (entity) => {
        const url = "/" + entity + REF;
        return axios_get(url).then(result => {
            if (result.code === AXIOS_SUCCESS) {
                return result.data;
            } else {
                return [];
            }
        });
    };

    Vue.read_entity = (entity, params) => {
        const url = "/" + entity + READ;
        return axios_post(url, params).then(result => {
            if (result.code === AXIOS_SUCCESS) {
                return result.data;
            } else {
                return {};
            }
        });
    };

    Vue.list_entity = (entity, form, params) => {
        const url = "/" + entity + LIST;
        form["_query"] = params;
        return axios_post(url, form);
    };

    Vue.save_entity = (entity, form, edit_mode) => {
        const url = edit_mode ? "/" + entity + UPDATE : "/" + entity + CREATE;
        if (form._has_file) {
            return axios_post_file_form(url, form);
        } else {
            return axios_post(url, form);
        }
    };

    Vue.delete_entity = (entity, ids) => {
        const url = "/" + entity + DELETE;
        return axios_post(url, { "ids": ids.join(",") });
    };
};

Vue.use(Plugin);

export { init_axios }
