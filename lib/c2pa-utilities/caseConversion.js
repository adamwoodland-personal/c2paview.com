/**
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
/**
 * Recursively converts an object's camelCase keys to snake_case, matching the format
 * the core native library expects for settings JSON. Arrays are preserved as arrays;
 * only their object elements (if any) get their keys snake-cased, since `typeof [] === 'object'`
 * in JS and a naive `Object.entries`-based recursion would otherwise flatten an array into a
 * `{"0": ..., "1": ...}` object instead of a JSON array.
 */
export function snakeCaseify(object) {
    const formattedObject = Object.entries(object).reduce((formattedObject, [key, val]) => {
        formattedObject[snakeCase(key)] = snakeCaseifyValue(val);
        return formattedObject;
    }, {});
    return formattedObject;
}
function snakeCaseifyValue(val) {
    if (Array.isArray(val)) {
        return val.map(snakeCaseifyValue);
    }
    if (typeof val === 'object' && val !== null) {
        return snakeCaseify(val);
    }
    return val;
}
function snakeCase(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
