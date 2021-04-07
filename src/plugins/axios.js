import Vue from 'vue';
import axios from "axios";
import { SUCCESS } from "./constant";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

const FIELDS = "/fields";
const CREATE = "/create";
const READ = "/read";
const LIST = "/list";
const UPDATE = "/update";
const DELETE = "/delete";
const SEARCH = "/search_fields";
const VISIBLE = "/visible_fields";
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

Plugin.install = function (Vue) {

    Vue.prototype.$axios_post = function (url, data) {
        const _axios = get_axios();
        return _axios.post(url, data);
    };

    Vue.prototype.$axios_post_file_form = function (url, data) {
        const _axios = get_axios();
        const form_data = new FormData();
        Object.keys(data).forEach(key => form_data.append(key, data[key]));
        return _axios.post(url, form_data, { headers: { 'Content-Type': 'multipart/form-data' } });
    };

    Vue.prototype.$axios_get = function (url, params) {
        const _axios = get_axios();
        return _axios.get(url, { params: params });
    };

    Vue.prototype.$cached_axios_get = function (url, params) {
        if (has_cache(url)) {
            return get_cache(url);
        } else {
            const _axios = get_axios();
            return _axios.get(url, { params: params }).then(data => {
                if (data.code == SUCCESS) {
                    set_cache(url, data);
                }
                return data;
            });
        }
    };

    Vue.prototype.$axios_upload = function (url, file) {
        const _axios = get_axios();
        const formData = new FormData();
        formData.append("file", file);
        return _axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    };

    Vue.prototype.$axios_download = function (url, file_name, params) {
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

    Vue.prototype.$get_fields = function (entity) {
        const url = "/" + entity + FIELDS;
        return this.$cached_axios_get(url).then(result => {
            if (result.code === SUCCESS) {
                return result.data;
            } else {
                return [];
            }
        });
    };

    Vue.prototype.$get_search_fields = function (entity) {
        const url = "/" + entity + SEARCH;
        return this.$cached_axios_get(url).then(result => {
            if (result.code === SUCCESS) {
                return result.data;
            } else {
                return [];
            }
        });
    };

    Vue.prototype.$get_visible_fields = function (entity) {
        const url = "/" + entity + VISIBLE;
        return this.$cached_axios_get(url).then(result => {
            if (result.code === SUCCESS) {
                return result.data;
            } else {
                return {};
            }
        });
    };

    Vue.prototype.$get_ref_labels = function (entity) {
        const url = "/" + entity + REF;
        return this.$axios_get(url).then(result => {
            if (result.code === SUCCESS) {
                return result.data;
            } else {
                return [];
            }
        });
    };

    Vue.prototype.$read_entity = function (entity, params) {
        const url = "/" + entity + READ;
        return this.$axios_post(url, params).then(result => {
            if (result.code === SUCCESS) {
                return result.data;
            } else {
                return {};
            }
        });
    };

    Vue.prototype.$list_entity = function (entity, form, params) {
        const url = "/" + entity + LIST;
        form["_query"] = params;
        return this.$axios_post(url, form);
    };

    Vue.prototype.$save_entity = function (entity, form, edit_mode) {
        const url = edit_mode ? "/" + entity + UPDATE : "/" + entity + CREATE;
        return this.$axios_post(url, form);
    };

    Vue.prototype.$delete_entity = function (entity, ids) {
        const url = "/" + entity + DELETE;
        return this.$axios_post(url, { "ids": ids.join(",") });
    };
};

Vue.use(Plugin);

export { init_axios }