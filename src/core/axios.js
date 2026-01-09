/**
 * @fileoverview Axios HTTP client wrapper for hola-server API.
 * @module core/axios
 */

import axios from "axios";

// Configure axios defaults
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

// API endpoint paths
const META = "/meta";
const MODE = "/mode";
const CREATE = "/create";
const READ_ENTITY = "/read_entity";
const READ_PROPERTY = "/read_property";
const LIST = "/list";
const UPDATE = "/update";
const CLONE = "/clone";
const DELETE = "/delete";
const REF = "/ref";

/**
 * Response code constants matching hola-server HTTP codes.
 */
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
  handle_response: (code, data) => {
    console.log(code);
    console.log(data);
  },
};

// In-memory cache for GET requests
const cache_memory = {};

/**
 * Store value in cache.
 * @param {string} key - Cache key.
 * @param {*} value - Value to cache.
 */
const set_cache = (key, value) => {
  cache_memory[key] = value;
};

/**
 * Check if cache has key.
 * @param {string} key - Cache key.
 * @returns {boolean} True if key exists in cache.
 */
const has_cache = (key) => {
  return !!cache_memory[key];
};

/**
 * Get value from cache.
 * @param {string} key - Cache key.
 * @returns {*} Cached value.
 */
const get_cache = (key) => {
  return cache_memory[key];
};

/**
 * Initialize axios instance with custom configuration and response handler.
 * @param {Object} config - Axios configuration object.
 * @param {Object} [handler] - Custom response handler with handle_response method.
 * @returns {Object} Configured axios instance.
 */
const init_axios = (config, handler) => {
  const default_config = {
    timeout: 60 * 1000,
    withCredentials: true,
  };
  _axios = axios.create({ ...default_config, ...config });

  const response_handler = { ...default_handler, ...handler };

  _axios.interceptors.response.use(
    (response) => {
      const data = response.data;
      const code = response.data.code;
      response_handler.handle_response(code, data);
      return data;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return _axios;
};

/**
 * Get initialized axios instance.
 * @returns {Object} Axios instance.
 * @throws {Error} If axios not initialized.
 */
const get_axios = () => {
  if (!_axios) {
    throw new Error("axios not initialized - call init_axios first");
  }
  return _axios;
};

/**
 * Perform POST request.
 * @param {string} url - Request URL.
 * @param {Object} data - Request data.
 * @returns {Promise<Object>} Response data.
 */
const axios_post = (url, data) => {
  const instance = get_axios();
  return instance.post(url, data);
};

/**
 * Perform POST request with file form data.
 * @param {string} url - Request URL.
 * @param {Object} data - Data to send as FormData.
 * @returns {Promise<Object>} Response data.
 */
const axios_post_file_form = (url, data) => {
  const instance = get_axios();
  const form_data = new FormData();
  Object.keys(data).forEach((key) => form_data.append(key, data[key]));
  return instance.post(url, form_data, { headers: { "Content-Type": "multipart/form-data" } });
};

/**
 * Perform GET request.
 * @param {string} url - Request URL.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<Object>} Response data.
 */
const axios_get = (url, params) => {
  const instance = get_axios();
  return instance.get(url, { params });
};

/**
 * Check if response code indicates success.
 * @param {number} code - Response code.
 * @returns {boolean} True if success.
 */
const is_success_response = (code) => code === CODE.SUCCESS;

/**
 * Check if response code indicates error.
 * @param {number} code - Response code.
 * @returns {boolean} True if error.
 */
const is_error_response = (code) => code === CODE.ERROR;

/**
 * Check if response code indicates invalid parameters.
 * @param {number} code - Response code.
 * @returns {boolean} True if invalid parameters.
 */
const has_invalid_params = (code) => code === CODE.INVALID_PARAMS;

/**
 * Check if response code indicates duplicate key.
 * @param {number} code - Response code.
 * @returns {boolean} True if duplicate.
 */
const is_duplicated = (code) => code === CODE.DUPLICATE_KEY;

/**
 * Check if response code indicates entity is referenced.
 * @param {number} code - Response code.
 * @returns {boolean} True if referenced.
 */
const is_been_referred = (code) => code === CODE.HAS_REF;

/**
 * Check if response code indicates no session.
 * @param {number} code - Response code.
 * @returns {boolean} True if no session.
 */
const is_no_session = (code) => code === CODE.NO_SESSION;

/**
 * Perform cached GET request.
 * Returns cached response if available, otherwise fetches and caches on success.
 * @param {string} url - Request URL.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<Object>} Response data.
 */
const axios_cached_get = async (url, params) => {
  if (has_cache(url)) {
    return get_cache(url);
  }

  const instance = get_axios();
  const data = await instance.get(url, { params });

  if (is_success_response(data.code)) {
    set_cache(url, data);
  }

  return data;
};

/**
 * Upload file to server.
 * @param {string} url - Upload URL.
 * @param {File} file - File to upload.
 * @returns {Promise<Object>} Response data.
 */
const axios_upload = (url, file) => {
  const instance = get_axios();
  const form_data = new FormData();
  form_data.append("file", file);
  return instance.post(url, form_data, { headers: { "Content-Type": "multipart/form-data" } });
};

/**
 * Trigger browser download for file from server.
 * @param {string} url - Download URL.
 * @param {string} file_name - Name for downloaded file.
 * @param {Object} [params] - Query parameters.
 */
const axios_download = (url, file_name, params) => {
  const instance = get_axios();
  instance({ url, method: "get", params, responseType: "blob" }).then((res) => {
    const blob = new Blob([res]);

    // IE11 support
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, file_name);
      return;
    }

    // Modern browsers
    const link = document.createElement("a");
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);
    link.href = URL.createObjectURL(blob);
    link.download = file_name;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
  });
};

/**
 * Get entity metadata with caching.
 * @param {string} entity - Entity name.
 * @returns {Promise<Object|null>} Entity metadata or null if error.
 */
const get_entity_meta = (entity) => {
  const url = "/" + entity + META;
  return axios_cached_get(url).then((result) => {
    return is_success_response(result.code) ? result.data : null;
  });
};

/**
 * Get entity CRUD mode with caching.
 * @param {string} entity - Entity name.
 * @returns {Promise<string|null>} Entity mode or null if error.
 */
const get_entity_mode = (entity) => {
  const url = "/" + entity + MODE;
  return axios_cached_get(url).then((result) => {
    return is_success_response(result.code) ? result.mode : null;
  });
};

/**
 * Get reference labels for entity.
 * @param {string} entity - Entity name.
 * @param {string} ref_by_entity - Referencing entity name.
 * @param {Object} [query] - Query conditions.
 * @returns {Promise<Array>} Array of reference labels or empty array if error.
 */
const get_ref_labels = (entity, ref_by_entity, query) => {
  const url = "/" + entity + REF;
  return axios_get(url, { ref_by_entity, query }).then((result) => {
    return is_success_response(result.code) ? result.data : [];
  });
};

/**
 * Read entity with expanded references and links.
 * @param {string} entity - Entity name.
 * @param {string} id - Entity ID.
 * @param {string} attr_names - Comma-separated attribute names.
 * @returns {Promise<Object>} Entity data or empty object if error.
 */
const read_entity = (entity, id, attr_names) => {
  const url = "/" + entity + READ_ENTITY;
  const params = { _id: id, attr_names };

  return axios_post(url, params).then((result) => {
    return is_success_response(result.code) ? result.data : {};
  });
};

/**
 * Read entity properties without expanding references or links.
 * @param {string} entity - Entity name.
 * @param {string} id - Entity ID.
 * @param {string} attr_names - Comma-separated attribute names.
 * @returns {Promise<Object>} Entity data or empty object if error.
 */
const read_property = (entity, id, attr_names) => {
  const url = "/" + entity + READ_PROPERTY;
  const params = { _id: id, attr_names };

  return axios_post(url, params).then((result) => {
    return is_success_response(result.code) ? result.data : {};
  });
};

/**
 * List entities with query parameters.
 * @param {string} entity - Entity name.
 * @param {Object} form - Form data.
 * @param {Object} params - Query parameters (page, limit, sort, etc.).
 * @param {string} [list_action] - Custom list action endpoint.
 * @returns {Promise<Object>} Response data.
 */
const list_entity = (entity, form, params, list_action) => {
  const url = "/" + entity + (list_action?.trim() ? list_action : LIST);
  form["_query"] = params;
  return axios_post(url, form);
};

/**
 * Query entities with attributes and conditions.
 * @param {string} entity - Entity name.
 * @param {string[]} attrs - Attribute names to retrieve.
 * @param {Object} [query] - Query conditions.
 * @param {string} [list_action] - Custom list action endpoint.
 * @returns {Promise<Object>} Response data.
 */
const query_entity = (entity, attrs, query, list_action) => {
  const form = query ? { ...query } : {};
  const url = "/" + entity + (list_action?.trim() ? list_action : LIST);
  form["_query"] = {
    attr_names: attrs.join(","),
    sort_by: "_id",
    desc: "false",
    page: 1,
    limit: 10000
  };
  return axios_post(url, form);
};

/**
 * Save entity (create, update, or clone).
 * @param {string} entity - Entity name.
 * @param {Object} form - Form data.
 * @param {boolean} edit_mode - True for update, false for create.
 * @param {boolean} [clone] - True to clone instead of update.
 * @returns {Promise<Object>} Response data.
 */
const save_entity = (entity, form, edit_mode, clone) => {
  let url;
  if (edit_mode) {
    url = clone ? "/" + entity + CLONE : "/" + entity + UPDATE;
  } else {
    url = "/" + entity + CREATE;
  }

  if (form._has_file) {
    return axios_post_file_form(url, form);
  }
  return axios_post(url, form);
};

/**
 * Delete entities by IDs.
 * @param {string} entity - Entity name.
 * @param {string[]} ids - Array of entity IDs to delete.
 * @returns {Promise<Object>} Response data.
 */
const delete_entity = (entity, ids) => {
  const url = "/" + entity + DELETE;
  return axios_post(url, { ids: ids.join(",") });
};

/**
 * Get full URL including base URL.
 * @param {string} url - Relative URL path.
 * @returns {string} Full URL.
 */
const get_url = (url) => {
  const instance = get_axios();
  const base = instance.defaults.baseURL;
  return `${base}${url}`;
};

export {
  init_axios,
  get_url,
  axios_get,
  axios_post,
  axios_cached_get,
  axios_download,
  axios_upload,
  is_success_response,
  is_error_response,
  is_been_referred,
  is_duplicated,
  has_invalid_params,
  is_no_session,
  save_entity,
  read_entity,
  read_property,
  query_entity,
  list_entity,
  delete_entity,
  get_ref_labels,
  get_entity_meta,
  get_entity_mode
};
