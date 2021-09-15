"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objToArr = exports.rename = exports.deepProp = exports.prop = void 0;
const R = require("ramda");
exports.prop = R.curry((key, o) => typeof key === 'function' ? key(o) : o?.[key]);
exports.deepProp = R.curry((keys, o) => keys.reduce((cur, k) => exports.prop(k, cur), o));
exports.rename = R.curry((key, renameKey, obj) => {
    const val = obj[key];
    const newO = R.assoc(renameKey, val)(obj);
    Reflect.deleteProperty(newO, key);
    return newO;
});
const objToArr = (obj) => Object.keys(obj)
    .filter((key) => Number.isInteger(+key))
    .reduce((result, cur) => {
    Number.isInteger(+cur) && (result[+cur] = obj[cur]);
    return result;
}, []);
exports.objToArr = objToArr;
