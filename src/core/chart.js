/**
 * @fileoverview Chart data manipulation utilities.
 * @module core/chart
 */

/**
 * Check if value is defined and not empty.
 * @param {*} value - Value to check.
 * @returns {boolean} True if value exists.
 */
const has_value = (value) => {
    if (value === undefined || value === null) {
        return false;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return false;
    }
    return true;
};

/**
 * Sum specified fields for each object in array and add result to sum attribute.
 * Modifies array in place.
 * @param {Object[]} array - Array of objects to process.
 * @param {string[]} fields - Field names to sum.
 * @param {string} sum_attr - Attribute name for sum result.
 */
const sum_data = (array, fields, sum_attr) => {
    array.forEach((obj) => {
        const total = fields.reduce((sum, field) => sum + parseFloat(obj[field] || 0), 0);
        obj[sum_attr] = total;
    });
};

/**
 * Append object properties to all elements in array.
 * Modifies array in place.
 * @param {Object[]} array - Array of objects to modify.
 * @param {Object} obj - Object with properties to append.
 */
const append_data = (array, obj) => {
    array.forEach((element) => {
        Object.assign(element, obj);
    });
};

/**
 * Merge two chart data arrays by combining columns.
 * Arrays must have at least 2 rows (header + data).
 * Modifies arr1 in place.
 * @param {Array[]} arr1 - First chart data array.
 * @param {Array[]} arr2 - Second chart data array.
 */
const merge_chart_data = (arr1, arr2) => {
    if (!arr1 || arr1.length < 2 || !arr2 || arr2.length < 2) {
        return;
    }

    const max = Math.max(arr1.length, arr2.length);
    const arr1_cols = arr1[0].length;
    const arr2_cols = arr2[0].length;

    for (let i = 0; i < max; i++) {
        // Ensure arr1[i] exists
        if (!has_value(arr1[i])) {
            arr1[i] = new Array(arr1_cols).fill("");
            arr1[i][0] = arr2[i]?.[0] || "";
        }

        // Ensure arr2[i] exists
        if (!has_value(arr2[i])) {
            arr2[i] = new Array(arr2_cols).fill("");
        }

        // Merge columns (skip first column of arr2 as it's the label)
        arr1[i] = [...arr1[i], ...arr2[i].slice(1)];
    }
};

export { sum_data, append_data, merge_chart_data };