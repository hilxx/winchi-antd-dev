/// <reference types="ts-toolbelt" />
import { AO, GetKey } from './index';
export declare const prop: import("Function/Curry").Curry<(key: GetKey, o: AO) => any>;
export declare const deepProp: import("Function/Curry").Curry<(keys: GetKey[], o: AO) => AO>;
export declare const rename: import("Function/Curry").Curry<(key: any, renameKey: any, obj: any) => any>;
/**
 * 转换数字下标的Record
  */
export declare const objToArr: (obj: Record<number, any>) => any[];
/**
 * @description  {a: undefined  null}, {a: 0} => {a: 0}
 */
export declare const mergeLeft: <U, V>(a: U, b: V) => any;
export declare const mergeDeepLeft: (a: unknown, b: unknown) => any;
/**
 * @description {a: 0}, {a: undefined  null} => {a: 0}
 */
export declare const mergeRight: import("Function/Curry").Curry<(head: unknown, head: unknown) => any>;
export declare const mergeDeepRight: import("Function/Curry").Curry<(head: unknown, head: unknown) => any>;
