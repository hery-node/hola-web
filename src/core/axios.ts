/**
 * Axios HTTP client wrapper for hola-server API
 * @module core/axios
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { type ApiResponse, type EntityMeta, type SelectItem, type AxiosConfig, type ResponseHandler } from "@/types";
import { SUCCESS, isSuccessResponse } from "./code";

// Re-export code check utilities
export { isSuccessResponse, isErrorResponse, isBeenReferred, isDuplicated, isUniqueDuplicated, hasInvalidParams, isNoSession } from "./code";

// Configure axios defaults
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

// API endpoint paths (RESTful)
const META = "/meta";
const REF = "/ref";
const PROPERTY = "/property";
const CLONE = "/clone";

let _axios: AxiosInstance | null = null;

const defaultHandler: ResponseHandler = {
  handleResponse: (code, data) => {
    console.log("Response code:", code);
    console.log("Response data:", data);
  },
};

// In-memory cache for GET requests
const cacheMemory: Record<string, unknown> = {};

const setCache = (key: string, value: unknown): void => {
  cacheMemory[key] = value;
};

const hasCache = (key: string): boolean => {
  return !!cacheMemory[key];
};

const getCache = <T>(key: string): T => {
  return cacheMemory[key] as T;
};

/**
 * Initialize axios instance with custom configuration and response handler
 */
export const initAxios = (config: AxiosConfig, handler?: ResponseHandler): AxiosInstance => {
  const defaultConfig: AxiosRequestConfig = { timeout: 60 * 1000, withCredentials: true };
  _axios = axios.create({ ...defaultConfig, ...config });

  const responseHandler = { ...defaultHandler, ...handler };

  _axios.interceptors.response.use(
    (response) => {
      const data = response.data as ApiResponse;
      const code = data.code;
      responseHandler.handleResponse?.(code, data);
      return data as unknown as typeof response;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return _axios;
};

/**
 * Get initialized axios instance
 */
const getAxios = (): AxiosInstance => {
  if (!_axios) {
    throw new Error("axios not initialized - call initAxios first");
  }
  return _axios;
};

/**
 * Perform POST request
 * @param url - API endpoint
 * @param data - Request body
 * @param timeout - Optional custom timeout in ms (default: 60000)
 */
export const axiosPost = <T = ApiResponse>(url: string, data?: Record<string, unknown>, timeout?: number): Promise<T> => {
  const instance = getAxios();
  const config = timeout ? { timeout } : {};
  return instance.post(url, data, config) as Promise<T>;
};

/**
 * Perform POST request with file form data
 */
const axiosPostFileForm = <T = ApiResponse>(url: string, data: Record<string, unknown>): Promise<T> => {
  const instance = getAxios();
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return instance.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } }) as Promise<T>;
};

/**
 * Perform PUT request with file form data
 */
const axiosPutFileForm = <T = ApiResponse>(url: string, data: Record<string, unknown>): Promise<T> => {
  const instance = getAxios();
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return instance.put(url, formData, { headers: { "Content-Type": "multipart/form-data" } }) as Promise<T>;
};

/**
 * Perform GET request
 */
export const axiosGet = <T = ApiResponse>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const instance = getAxios();
  return instance.get(url, { params }) as Promise<T>;
};

/**
 * Perform PUT request
 */
export const axiosPut = <T = ApiResponse>(url: string, data?: Record<string, unknown>): Promise<T> => {
  const instance = getAxios();
  return instance.put(url, data) as Promise<T>;
};

/**
 * Perform DELETE request
 */
export const axiosDelete = <T = ApiResponse>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const instance = getAxios();
  return instance.delete(url, { params }) as Promise<T>;
};

/**
 * Perform cached GET request
 */
export const axiosCachedGet = async <T = ApiResponse>(url: string, params?: Record<string, unknown>): Promise<T> => {
  if (hasCache(url)) {
    return getCache<T>(url);
  }

  const instance = getAxios();
  const data = (await instance.get(url, { params })) as T;
  const response = data as ApiResponse;

  if (isSuccessResponse(response.code)) {
    setCache(url, data);
  }

  return data;
};

/**
 * Upload file to server
 */
export const axiosUpload = <T = ApiResponse>(url: string, file: File): Promise<T> => {
  const instance = getAxios();
  const formData = new FormData();
  formData.append("file", file);
  return instance.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } }) as Promise<T>;
};

/**
 * Trigger browser download for file from server
 */
export const axiosDownload = async (url: string, fileName: string, params?: Record<string, unknown>): Promise<void> => {
  const instance = getAxios();
  const response = await instance({ url, method: "get", params, responseType: "blob" });

  const blob = new Blob([response.data as BlobPart]);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Get entity metadata with caching
 * GET /{entity}/meta
 */
export const getEntityMeta = async (entity: string): Promise<EntityMeta | null> => {
  const url = "/" + entity + META;
  const result = await axiosCachedGet<ApiResponse<EntityMeta>>(url);
  if (isSuccessResponse(result.code) && result.data) {
    return result.data;
  }
  return null;
};

/**
 * Get entity CRUD mode from metadata
 * Mode is returned as part of GET /{entity}/meta response
 */
export const getEntityMode = async (entity: string): Promise<string | null> => {
  const meta = await getEntityMeta(entity);
  return meta?.mode ?? null;
};

/**
 * Get reference labels for entity
 * GET /{entity}/ref
 */
export const getRefLabels = async (entity: string, refByEntity: string, query?: string): Promise<SelectItem[]> => {
  const url = "/" + entity + REF;
  const result = await axiosGet<ApiResponse<SelectItem[]>>(url, { ref_by_entity: refByEntity, query });
  return isSuccessResponse(result.code) ? (result.data ?? []) : [];
};

/**
 * Read entity with expanded references and links
 * GET /{entity}/:id
 */
export const readEntity = async <T = Record<string, unknown>>(entity: string, id: string, attrNames: string): Promise<T> => {
  const url = "/" + entity + "/" + id;
  const result = await axiosGet<ApiResponse<T>>(url, { fields: attrNames });
  return isSuccessResponse(result.code) ? (result.data ?? ({} as T)) : ({} as T);
};

/**
 * Read entity properties without expanding references or links
 * GET /{entity}/:id/property
 */
export const readProperty = async <T = Record<string, unknown>>(entity: string, id: string, attrNames: string): Promise<T> => {
  const url = "/" + entity + "/" + id + PROPERTY;
  const result = await axiosGet<ApiResponse<T>>(url, { fields: attrNames });
  return isSuccessResponse(result.code) ? (result.data ?? ({} as T)) : ({} as T);
};

/** Query parameters for list operations */
export interface ListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  desc?: boolean;
  attrNames?: string;
}

// API endpoint path for list
const LIST = "/list";

/**
 * List entities with query parameters
 * POST /{entity}/list
 */
export const listEntity = async <T = Record<string, unknown>>(entity: string, form: Record<string, unknown>, params: ListParams, listAction?: string): Promise<ApiResponse<T[]>> => {
  const url = "/" + entity + (listAction?.trim() ? listAction : LIST);
  const body = { ...form, page: params.page, limit: params.limit, sort_by: params.sortBy, desc: params.desc, attr_names: params.attrNames };
  return axiosPost<ApiResponse<T[]>>(url, body);
};

/**
 * Query entities with attributes and conditions
 * POST /{entity}/list
 */
export const queryEntity = async <T = Record<string, unknown>>(entity: string, attrs: string[], query?: Record<string, unknown>, listAction?: string): Promise<ApiResponse<T[]>> => {
  const url = "/" + entity + (listAction?.trim() ? listAction : LIST);
  const body = { ...query, attr_names: attrs.join(","), sort_by: "_id", desc: false, page: 1, limit: 10000 };
  return axiosPost<ApiResponse<T[]>>(url, body);
};

/**
 * Save entity (create, update, or clone)
 * POST /{entity} - create
 * PUT /{entity}/:id - update
 * POST /{entity}/:id/clone - clone
 */
export const saveEntity = async (entity: string, form: Record<string, unknown>, editMode: boolean, clone = false): Promise<ApiResponse> => {
  const id = form._id as string;

  if (editMode) {
    if (clone) {
      // POST /{entity}/:id/clone
      const url = "/" + entity + "/" + id + CLONE;
      if (form._has_file) {
        return axiosPostFileForm(url, form);
      }
      return axiosPost(url, form);
    } else {
      // PUT /{entity}/:id
      const url = "/" + entity + "/" + id;
      if (form._has_file) {
        return axiosPutFileForm(url, form);
      }
      return axiosPut(url, form);
    }
  } else {
    // POST /{entity}
    const url = "/" + entity;
    if (form._has_file) {
      return axiosPostFileForm(url, form);
    }
    return axiosPost(url, form);
  }
};

/**
 * Delete entity by ID
 * DELETE /{entity}/:id
 */
export const deleteEntity = async (entity: string, ids: string[]): Promise<ApiResponse> => {
  // Delete one by one for RESTful API
  const results: ApiResponse[] = [];
  for (const id of ids) {
    const url = "/" + entity + "/" + id;
    const result = await axiosDelete<ApiResponse>(url);
    results.push(result);
  }
  // Return the last result (or first error if any)
  const error = results.find((r) => !isSuccessResponse(r.code));
  return error ?? results[results.length - 1] ?? { code: SUCCESS };
};

/**
 * Get full URL including base URL
 */
export const getUrl = (url: string): string => {
  const instance = getAxios();
  const base = instance.defaults.baseURL ?? "";
  return `${base}${url}`;
};

/**
 * Clear the cache
 */
export const clearCache = (): void => {
  Object.keys(cacheMemory).forEach((key) => delete cacheMemory[key]);
};
