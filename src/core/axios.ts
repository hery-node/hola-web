/**
 * Axios HTTP client wrapper for hola-server API
 * @module core/axios
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ResponseCode, type ApiResponse, type EntityMeta, type SelectItem, type AxiosConfig, type ResponseHandler } from '@/types'

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

// API endpoint paths
const META = '/meta'
const MODE = '/mode'
const CREATE = '/create'
const READ_ENTITY = '/read_entity'
const READ_PROPERTY = '/read_property'
const LIST = '/list'
const UPDATE = '/update'
const CLONE = '/clone'
const DELETE = '/delete'
const REF = '/ref'

let _axios: AxiosInstance | null = null

const defaultHandler: ResponseHandler = {
  handleResponse: (code, data) => {
    console.log('Response code:', code)
    console.log('Response data:', data)
  },
}

// In-memory cache for GET requests
const cacheMemory: Record<string, unknown> = {}

const setCache = (key: string, value: unknown): void => {
  cacheMemory[key] = value
}

const hasCache = (key: string): boolean => {
  return !!cacheMemory[key]
}

const getCache = <T>(key: string): T => {
  return cacheMemory[key] as T
}

/**
 * Initialize axios instance with custom configuration and response handler
 */
export const initAxios = (config: AxiosConfig, handler?: ResponseHandler): AxiosInstance => {
  const defaultConfig: AxiosRequestConfig = {
    timeout: 60 * 1000,
    withCredentials: true,
  }
  _axios = axios.create({ ...defaultConfig, ...config })

  const responseHandler = { ...defaultHandler, ...handler }

  _axios.interceptors.response.use(
    (response) => {
      const data = response.data as ApiResponse
      const code = data.code
      responseHandler.handleResponse?.(code, data)
      return data as unknown as typeof response
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return _axios
}

/**
 * Get initialized axios instance
 */
const getAxios = (): AxiosInstance => {
  if (!_axios) {
    throw new Error('axios not initialized - call initAxios first')
  }
  return _axios
}

/**
 * Perform POST request
 */
export const axiosPost = <T = ApiResponse>(
  url: string,
  data?: Record<string, unknown>
): Promise<T> => {
  const instance = getAxios()
  return instance.post(url, data) as Promise<T>
}

/**
 * Perform POST request with file form data
 */
const axiosPostFileForm = <T = ApiResponse>(
  url: string,
  data: Record<string, unknown>
): Promise<T> => {
  const instance = getAxios()
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value instanceof File) {
      formData.append(key, value)
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  return instance.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<T>
}

/**
 * Perform GET request
 */
export const axiosGet = <T = ApiResponse>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const instance = getAxios()
  return instance.get(url, { params }) as Promise<T>
}

/**
 * Check if response code indicates success
 */
export const isSuccessResponse = (code: number): boolean => code === ResponseCode.SUCCESS

/**
 * Check if response code indicates error
 */
export const isErrorResponse = (code: number): boolean => code === ResponseCode.ERROR

/**
 * Check if response code indicates invalid parameters
 */
export const hasInvalidParams = (code: number): boolean => code === ResponseCode.INVALID_PARAMS

/**
 * Check if response code indicates duplicate key
 */
export const isDuplicated = (code: number): boolean => code === ResponseCode.DUPLICATE_KEY

/**
 * Check if response code indicates duplicate unique field value
 */
export const isUniqueDuplicated = (code: number): boolean => code === ResponseCode.DUPLICATE_UNIQUE

/**
 * Check if response code indicates entity is referenced
 */
export const isBeenReferred = (code: number): boolean => code === ResponseCode.HAS_REF

/**
 * Check if response code indicates no session
 */
export const isNoSession = (code: number): boolean => code === ResponseCode.NO_SESSION

/**
 * Perform cached GET request
 */
export const axiosCachedGet = async <T = ApiResponse>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  if (hasCache(url)) {
    return getCache<T>(url)
  }

  const instance = getAxios()
  const data = (await instance.get(url, { params })) as T
  const response = data as ApiResponse

  if (isSuccessResponse(response.code)) {
    setCache(url, data)
  }

  return data
}

/**
 * Upload file to server
 */
export const axiosUpload = <T = ApiResponse>(url: string, file: File): Promise<T> => {
  const instance = getAxios()
  const formData = new FormData()
  formData.append('file', file)
  return instance.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<T>
}

/**
 * Trigger browser download for file from server
 */
export const axiosDownload = async (
  url: string,
  fileName: string,
  params?: Record<string, unknown>
): Promise<void> => {
  const instance = getAxios()
  const response = await instance({
    url,
    method: 'get',
    params,
    responseType: 'blob',
  })

  const blob = new Blob([response.data as BlobPart])

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Get entity metadata with caching
 */
export const getEntityMeta = async (entity: string): Promise<EntityMeta | null> => {
  const url = '/' + entity + META
  const result = await axiosCachedGet<ApiResponse<EntityMeta>>(url)
  return isSuccessResponse(result.code) ? (result.data ?? null) : null
}

/**
 * Get entity CRUD mode with caching
 */
export const getEntityMode = async (entity: string): Promise<string | null> => {
  const url = '/' + entity + MODE
  const result = await axiosCachedGet<ApiResponse>(url)
  return isSuccessResponse(result.code) ? (result.mode ?? null) : null
}

/**
 * Get reference labels for entity
 */
export const getRefLabels = async (
  entity: string,
  refByEntity: string,
  query?: string
): Promise<SelectItem[]> => {
  const url = '/' + entity + REF
  const result = await axiosGet<ApiResponse<SelectItem[]>>(url, {
    ref_by_entity: refByEntity,
    query,
  })
  return isSuccessResponse(result.code) ? (result.data ?? []) : []
}

/**
 * Read entity with expanded references and links
 */
export const readEntity = async <T = Record<string, unknown>>(
  entity: string,
  id: string,
  attrNames: string
): Promise<T> => {
  const url = '/' + entity + READ_ENTITY
  const params = { _id: id, attr_names: attrNames }
  const result = await axiosPost<ApiResponse<T>>(url, params)
  return isSuccessResponse(result.code) ? (result.data ?? ({} as T)) : ({} as T)
}

/**
 * Read entity properties without expanding references or links
 */
export const readProperty = async <T = Record<string, unknown>>(
  entity: string,
  id: string,
  attrNames: string
): Promise<T> => {
  const url = '/' + entity + READ_PROPERTY
  const params = { _id: id, attr_names: attrNames }
  const result = await axiosPost<ApiResponse<T>>(url, params)
  return isSuccessResponse(result.code) ? (result.data ?? ({} as T)) : ({} as T)
}

/** Query parameters for list operations */
export interface ListParams {
  page?: number
  limit?: number
  sortBy?: string
  desc?: boolean
  attrNames?: string
}

/**
 * List entities with query parameters
 */
export const listEntity = async <T = Record<string, unknown>>(
  entity: string,
  form: Record<string, unknown>,
  params: ListParams,
  listAction?: string
): Promise<ApiResponse<T[]>> => {
  const url = '/' + entity + (listAction?.trim() ? listAction : LIST)
  const queryParams = {
    page: params.page,
    limit: params.limit,
    sort_by: params.sortBy,
    desc: params.desc,
    attr_names: params.attrNames,
  }
  return axiosPost<ApiResponse<T[]>>(url, { ...form, _query: queryParams })
}

/**
 * Query entities with attributes and conditions
 */
export const queryEntity = async <T = Record<string, unknown>>(
  entity: string,
  attrs: string[],
  query?: Record<string, unknown>,
  listAction?: string
): Promise<ApiResponse<T[]>> => {
  const form = query ? { ...query } : {}
  const url = '/' + entity + (listAction?.trim() ? listAction : LIST)
  const queryParams = {
    attr_names: attrs.join(','),
    sort_by: '_id',
    desc: 'false',
    page: 1,
    limit: 10000,
  }
  return axiosPost<ApiResponse<T[]>>(url, { ...form, _query: queryParams })
}

/**
 * Save entity (create, update, or clone)
 */
export const saveEntity = async (
  entity: string,
  form: Record<string, unknown>,
  editMode: boolean,
  clone = false
): Promise<ApiResponse> => {
  let url: string
  if (editMode) {
    url = clone ? '/' + entity + CLONE : '/' + entity + UPDATE
  } else {
    url = '/' + entity + CREATE
  }

  if (form._has_file) {
    return axiosPostFileForm(url, form)
  }
  return axiosPost(url, form)
}

/**
 * Delete entities by IDs
 */
export const deleteEntity = async (entity: string, ids: string[]): Promise<ApiResponse> => {
  const url = '/' + entity + DELETE
  return axiosPost(url, { ids: ids.join(',') })
}

/**
 * Get full URL including base URL
 */
export const getUrl = (url: string): string => {
  const instance = getAxios()
  const base = instance.defaults.baseURL ?? ''
  return `${base}${url}`
}

/**
 * Clear the cache
 */
export const clearCache = (): void => {
  Object.keys(cacheMemory).forEach((key) => delete cacheMemory[key])
}
