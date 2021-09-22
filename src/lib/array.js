"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueRight = exports.uniqueLeft = exports.uniqueWith = exports.propLength = exports.flatArrayShallow = exports.classifyAos = void 0;
const R = require("ramda");
/**
 * @description 数组分类
 * @return object
  */
exports.classifyAos = R.curry((prop, arr) => arr.reduce((r, o) => {
    const v = prop(o);
    r[v] = r[v] ? [...r[v], o] : [o];
    return r;
}, {}));
/**
 * @index 只取数组中某一项（忽略空值）， 输入 undefined | null 取全部值
  */
exports.flatArrayShallow = R.curry((index, arr) => arr.reduce((r, c) => {
    const isAll = c == undefined;
    const v = isAll ? c : c?.[index];
    return v !== undefined ? [...r, ...isAll && Array.isArray(v) ? v : [v]] : r;
}, []));
exports.propLength = R.prop('length');
exports.uniqueWith = R.curry((choose, prop, arr) => {
    const getV = typeof prop === 'function' ? prop : v => v;
    return [
        ...arr.reduce((map, cur) => {
            const v = getV(cur);
            map.set(v, map.has(v) ? choose(map.get(v), cur) : cur);
            return map;
        }, new Map()).values()
    ];
});
exports.uniqueLeft = exports.uniqueWith(a => a);
exports.uniqueRight = exports.uniqueWith((_, b) => b);
