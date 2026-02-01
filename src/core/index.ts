/**
 * Core utilities barrel export
 */

/** Configuration interface for core module */
export interface CoreConfig {
  defaultListLimit: number;
}

/** Default core configuration */
let coreConfig: CoreConfig = { defaultListLimit: 1000 };

/** Initialize core configuration with user-provided values */
export const initCoreConfig = (config: Partial<CoreConfig>): void => {
  coreConfig = { ...coreConfig, ...config };
};

/** Get default list limit from core configuration */
export const getDefaultListLimit = (): number => coreConfig.defaultListLimit;

export {
  ERROR,
  SUCCESS,
  IMPORT_EMPTY_KEY,
  IMPORT_WRONG_FIELDS,
  IMPORT_DUPLICATE_KEY,
  IMPORT_NO_FOUND_REF,
  NO_SESSION,
  NO_RIGHTS,
  NO_PARAMS,
  NOT_FOUND,
  INVALID_PARAMS,
  REF_NOT_FOUND,
  REF_NOT_UNIQUE,
  HAS_REF,
  DUPLICATE_UNIQUE,
  NO_RESOURCE,
  isSuccessResponse,
  isErrorResponse,
  hasInvalidParams,
  isDuplicated,
  isUniqueDuplicated,
  isBeenReferred,
  isNoSession,
  isNoRights,
  isNotFound,
  isNoParams,
  ERROR_CODE_KEYS,
  getErrorKey,
  formatErrorMessage,
} from './code'

export {
  saveValue,
  getValue,
  removeValue,
  clearStorage,
} from './storage'

export {
  sumData,
  appendData,
  mergeChartData,
} from './chart'

export {
  registerType,
  getType,
  noValue,
  isInt,
} from './type'

export {
  initAxios,
  getUrl,
  axiosGet,
  axiosPost,
  axiosDelete,
  axiosPut,
  axiosCachedGet,
  axiosDownload,
  axiosUpload,
  saveEntity,
  readEntity,
  readProperty,
  queryEntity,
  listEntity,
  deleteEntity,
  getRefLabels,
  getEntityMeta,
  getEntityMode,
  clearCache,
  type ListParams,
} from './axios'

export {
  initEden,
  getEden,
  getBaseUrl,
  handleEdenResponse,
  type EdenConfig,
} from './eden'
