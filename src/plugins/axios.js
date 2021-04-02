import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

let _axios;

const default_handler = {
    handle_response: (code, data) => { console.log(code); console.log(data) },
};

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

    Vue.prototype.$post = function (url, data) {
        const _axios = get_axios();
        return _axios.post(url, data);
    };

    Vue.prototype.$post_file_form = function (url, data) {
        const _axios = get_axios();
        const form_data = new FormData();
        Object.keys(data).forEach(key => form_data.append(key, data[key]));
        return _axios.post(url, form_data, { headers: { 'Content-Type': 'multipart/form-data' } });
    };

    Vue.prototype.$get = function (url, params) {
        const _axios = get_axios();
        return _axios.get(url, { params: params });
    };

    Vue.prototype.$upload = function (url, file) {
        const _axios = get_axios();
        const formData = new FormData();
        formData.append("file", file);
        return _axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    };

    Vue.prototype.$download = function (url, file_name, params) {
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
};

Vue.use(Plugin);

export { init_axios }