/// <reference types="ts-toolbelt" />
import { AO, GetKey } from './index';
export declare const prop: import("Function/Curry").Curry<(key: GetKey, o: AO) => any>;
export declare const deepProp: import("Function/Curry").Curry<(keys: GetKey[], o: AO) => AO>;
export declare const rename: import("Function/Curry").Curry<(key: any, renameKey: any, obj: any) => any>;
export declare const objToArr: (obj: Record<number, any>) => any[];
