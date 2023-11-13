const sum_data = (array, fields, sum_attr) => {
    for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        let total = 0;
        fields.forEach(field => {
            total += parseFloat(obj[field]);
        });
        obj[sum_attr] = total;
    }
}

const append_data = (array, obj) => {
    array.forEach(element => {
        Object.assign(element, obj);
    });
}

const has_value = function (value) {
    if (value === undefined || value === null) {
        return false
    }
    if (typeof value == 'undefined') {
        return false;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return false;
    }
    return true;
};

const merge_chart_data = (arr1, arr2) => {
    if (!arr1 || arr1.length < 2 || !arr2 || arr2.length < 2) {
        return;
    }

    const max = Math.max(arr1.length, arr2.length);
    const arr1_cols = arr1[0].length;
    const arr2_cols = arr2[0].length;
    for (let i = 0; i < max; i++) {
        if (!has_value(arr1[i])) {
            arr1[i] = [...new Array(arr1_cols)].map(() => "");
            arr1[i][0] = arr2[i][0];
        }
        if (!has_value(arr2[i])) {
            arr2[i] = [...new Array(arr2_cols)].map(() => "");
        }
        arr1[i] = [...arr1[i], ...arr2[i].splice(1)];
    }
}

export { sum_data, append_data, merge_chart_data }