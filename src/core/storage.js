/**
 * @fileoverview Browser localStorage utility functions.
 * @module core/storage
 */

/**
 * Check if browser supports localStorage.
 * @returns {boolean} True if localStorage is available.
 */
const is_support_local_storage = () => typeof Storage !== "undefined";

/**
 * Save value to localStorage with JSON serialization.
 * @param {string} key - Storage key.
 * @param {*} value - Value to store (will be JSON stringified).
 */
const save_value = (key, value) => {
    if (is_support_local_storage()) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

/**
 * Retrieve value from localStorage with JSON deserialization.
 * @param {string} key - Storage key.
 * @returns {*} Parsed value or undefined if not found or not supported.
 */
const get_value = (key) => {
    if (!is_support_local_storage()) {
        return undefined;
    }

    const item = localStorage.getItem(key);
    if (item === null) {
        return undefined;
    }

    try {
        return JSON.parse(item);
    } catch (e) {
        return undefined;
    }
};

export { save_value, get_value };