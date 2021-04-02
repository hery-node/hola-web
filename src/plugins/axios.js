import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

let _axios;

const init_axios = (config) => {
    const default_config = {
        timeout: 60 * 1000,
        withCredentials: true
    };
    _axios = axios.create({ ...default_config, ...config });
}

class HolaRequest {

}