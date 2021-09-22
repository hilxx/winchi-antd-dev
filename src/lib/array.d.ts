/// <reference types="ts-toolbelt" />
import { AF, AO } from './index';
/**
 * @description 数组分类
 * @return object
  */
export declare const classifyAos: import("Function/Curry").Curry<(prop: AF, arr: AO[]) => AO>;
/**
 * @index 只取数组中某一项（忽略空值）， 输入 undefined | null 取全部值
  */
export declare const flatArrayShallow: import("Function/Curry").Curry<(index: number | undefined | null, arr: any[]) => any>;
export declare const propLength: AF<any[], any>;
export declare const uniqueWith: import("Function/Curry").Curry<(choose: AF, prop: string | AF, arr: any[]) => any[]>;
export declare const uniqueLeft: import("Function/Curry").Curry<(prop: string | AF<any[], any>, arr: any[]) => any[]>;
export declare const uniqueRight: import("Function/Curry").Curry<(prop: string | AF<any[], any>, arr: any[]) => any[]>;
