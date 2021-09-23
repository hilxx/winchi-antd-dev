"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeepRight = exports.mergeRight = exports.mergeDeepLeft = exports.mergeLeft = exports.objToArr = exports.rename = exports.deepProp = exports.prop = void 0;
const R = require("ramda");
exports.prop = R.curry((key, o) => typeof key === 'function' ? key(o) : o?.[key]);
exports.deepProp = R.curry((keys, o) => keys.reduce((cur, k) => exports.prop(k, cur), o));
exports.rename = R.curry((key, renameKey, obj) => {
    const val = obj[key];
    const newO = R.assoc(renameKey, val)(obj);
    Reflect.deleteProperty(newO, key);
    return newO;
});
/**
 * 转换数字下标的Record
  */
const objToArr = (obj) => Object.keys(obj)
    .filter((key) => Number.isInteger(+key))
    .reduce((result, cur) => {
    Number.isInteger(+cur) && (result[+cur] = obj[cur]);
    return result;
}, []);
exports.objToArr = objToArr;
/**
 * @description  {a: undefined  null}, {a: 0} => {a: 0}
 */
exports.mergeLeft = R.mergeWith(R.flip(R.defaultTo));
exports.mergeDeepLeft = R.mergeDeepWith(R.flip(R.defaultTo));
/**
 * @description {a: 0}, {a: undefined  null} => {a: 0}
 */
exports.mergeRight = R.curryN(2, R.mergeWith(R.defaultTo));
exports.mergeDeepRight = R.curryN(2, R.mergeDeepWith(R.defaultTo));
