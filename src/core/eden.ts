/**
 * Eden Treaty client wrapper for type-safe API calls.
 * 
 * This module provides a type-safe alternative to the axios client,
 * enabling end-to-end type safety between client and server.
 * 
 * @module core/eden
 * 
 * @example
 * // In your main server file, export the App type:
 * // const app = new Elysia().use(userRouter).listen(3000);
 * // export type App = typeof app;
 * 
 * // In your client initialization:
 * import type { App } from 'your-server/main';
 * import { initEden } from 'hola-web';
 * 
 * const api = initEden<App>({ baseUrl: 'http://localhost:3000' });
 * const result = await api.book.meta.get();
 */

import { treaty } from '@elysiajs/eden';
import type { Elysia } from 'elysia';
import { type ApiResponse, type ResponseHandler } from '@/types';

/** Eden client configuration options. */
export interface EdenConfig {
    /** Base URL of the API server (e.g., 'http://localhost:3000'). */
    baseUrl: string;
    /** Optional custom fetch implementation with credentials. */
    fetch?: typeof fetch;
}

// Use 'any' for internal storage since the actual type is provided by user's generic parameter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _edenClient: any = null;
let _baseUrl = '';

const defaultHandler: ResponseHandler = {
    handleResponse: (code, data) => {
        console.log('Response code:', code);
        console.log('Response data:', data);
    },
};

let _responseHandler: ResponseHandler = defaultHandler;

/**
 * Initialize Eden Treaty client with configuration.
 * 
 * @param config Configuration options including baseUrl
 * @param handler Optional response handler for consistent response processing
 * @returns The Eden Treaty client instance
 * 
 * @example
 * import type { App } from 'your-server/main';
 * const api = initEden<App>({ baseUrl: 'http://localhost:3000' });
 */
export const initEden = <T extends Elysia<any, any, any, any, any, any, any>>(
    config: EdenConfig,
    handler?: ResponseHandler
): ReturnType<typeof treaty<T>> => {
    _baseUrl = config.baseUrl;
    _responseHandler = { ...defaultHandler, ...handler };

    const client = treaty<T>(config.baseUrl, {
        fetch: {
            credentials: 'include',
        },
    });

    _edenClient = client;
    return client;
};

/**
 * Get the initialized Eden client instance.
 * @throws Error if Eden client has not been initialized
 */
export const getEden = <T extends Elysia<any, any, any, any, any, any, any>>(): ReturnType<typeof treaty<T>> => {
    if (!_edenClient) {
        throw new Error('Eden client not initialized - call initEden first');
    }
    return _edenClient;
};

/**
 * Get the configured base URL.
 */
export const getBaseUrl = (): string => {
    if (!_baseUrl) {
        throw new Error('Eden client not initialized - call initEden first');
    }
    return _baseUrl;
};

/**
 * Get the response handler.
 */
export const getResponseHandler = (): ResponseHandler => _responseHandler;

/**
 * Helper to handle Eden response with proper type narrowing.
 * 
 * @param response Eden response with data/error union
 * @returns The data if successful, throws if error
 */
export const handleEdenResponse = <T>(response: { data: T | null; error: unknown }): T => {
    if (response.error) {
        throw response.error;
    }
    if (response.data === null) {
        throw new Error('No data in response');
    }

    // Call response handler if data has a code property
    const data = response.data as unknown as ApiResponse;
    if (data && typeof data.code === 'number') {
        _responseHandler.handleResponse?.(data.code, data);
    }

    return response.data;
};
