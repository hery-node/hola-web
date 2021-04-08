Plugin.install = (Vue) => {
    Vue.AXIOS_SUCCESS = 1;
    Vue.AXIOS_ERROR = 0;
    Vue.AXIOS_INVALID_PARAMS = 204;
    Vue.AXIOS_DUPLICATE_KEY = 300;
    Vue.AXIOS_HAS_REF = 207;
};

export default Plugin;