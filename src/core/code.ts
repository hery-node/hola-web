/**
 * HTTP status and error codes.
 * Must stay in sync with hola-server/src/http/code.ts
 * @module core/code
 */

export const ERROR = 500;                  // Internal Server Error
export const SUCCESS = 200;                // OK

// Import errors
export const IMPORT_EMPTY_KEY = 400;       // Bad Request - missing key
export const IMPORT_WRONG_FIELDS = 406;    // Not Acceptable - wrong fields
export const IMPORT_DUPLICATE_KEY = 409;   // Conflict - duplicate in import
export const IMPORT_NO_FOUND_REF = 424;    // Failed Dependency - ref not found

// Auth errors
export const NO_SESSION = 401;             // Unauthorized
export const NO_RIGHTS = 403;              // Forbidden

// Validation errors
export const NO_PARAMS = 400;              // Bad Request - missing params
export const NOT_FOUND = 404;              // Not Found
export const INVALID_PARAMS = 422;         // Unprocessable Entity

// Reference errors
export const REF_NOT_FOUND = 424;          // Failed Dependency - ref lookup failed
export const REF_NOT_UNIQUE = 300;         // Multiple Choices - ambiguous reference

// Integrity errors
export const HAS_REF = 423;                // Locked - has dependent references
export const DUPLICATE_UNIQUE = 409;       // Conflict - unique field exists

// Resource errors
export const NO_RESOURCE = 410;            // Gone - resource unavailable

/** Response code checker utilities */
export const isSuccessResponse = (code: number): boolean => code === SUCCESS;
export const isErrorResponse = (code: number): boolean => code === ERROR;
export const hasInvalidParams = (code: number): boolean => code === INVALID_PARAMS;
export const isDuplicated = (code: number): boolean => code === DUPLICATE_UNIQUE;
export const isUniqueDuplicated = (code: number): boolean => code === DUPLICATE_UNIQUE;
export const isBeenReferred = (code: number): boolean => code === HAS_REF;
export const isNoSession = (code: number): boolean => code === NO_SESSION;
export const isNoRights = (code: number): boolean => code === NO_RIGHTS;
export const isNotFound = (code: number): boolean => code === NOT_FOUND;
export const isNoParams = (code: number): boolean => code === NO_PARAMS;

/** Error code to i18n key mapping (using unique codes only) */
export const ERROR_CODE_KEYS: Record<number, string> = {
  500: 'error.internal',           // ERROR
  401: 'error.no_session',         // NO_SESSION
  403: 'error.no_rights',          // NO_RIGHTS
  400: 'error.missing_params',     // NO_PARAMS / IMPORT_EMPTY_KEY
  404: 'error.not_found',          // NOT_FOUND
  422: 'error.invalid_params',     // INVALID_PARAMS
  424: 'error.ref_not_found',      // REF_NOT_FOUND / IMPORT_NO_FOUND_REF
  300: 'error.ref_not_unique',     // REF_NOT_UNIQUE
  423: 'error.has_ref',            // HAS_REF
  409: 'error.duplicate',          // DUPLICATE_UNIQUE / IMPORT_DUPLICATE_KEY
  410: 'error.no_resource',        // NO_RESOURCE
  406: 'error.import_wrong_fields',// IMPORT_WRONG_FIELDS
};

/** Get i18n key for error code */
export const getErrorKey = (code: number): string => {
  return ERROR_CODE_KEYS[code] || 'error.unknown';
};

/** Format error message from API response */
export const formatErrorMessage = (
  code: number,
  err: unknown,
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
  const errorKey = getErrorKey(code);
  
  // Format the error details
  let details = '';
  if (err) {
    if (Array.isArray(err)) {
      details = err.join(', ');
    } else if (typeof err === 'string') {
      details = err;
    } else if (typeof err === 'object') {
      details = JSON.stringify(err);
    }
  }
  
  // Get translated message with field details
  const baseMessage = t(errorKey, { fields: details });
  
  return details && !baseMessage.includes(details) 
    ? `${baseMessage}: ${details}` 
    : baseMessage;
};
