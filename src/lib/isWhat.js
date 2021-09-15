"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyObj = exports.isObj = void 0;
const isObj = (o) => typeof o === 'function' || (o !== null && typeof o === 'object');
exports.isObj = isObj;
const isEmptyObj = (obj) => Reflect.ownKeys(obj).length === 0;
exports.isEmptyObj = isEmptyObj;
