/// <reference types="ts-toolbelt" />
import { AF, AO, ReturnParameters } from "./index";
export interface AsyncComposeReturn<D = any> {
    (data?: any): Promise<D>;
    catch(cb: AF): AsyncComposeReturn<D>;
}
export declare const alt: (f1: AF, f2: AF) => (val?: any) => any;
export declare const and: (f1: AF, f2: AF) => (val?: any) => any;
export declare const sep: (...fns: AF[]) => (...rest: any[]) => any;
export declare const fork: (join: AF, f1: AF, f2: AF) => (v: any) => any;
export declare const identify: AF;
export declare const curryLazy: (x0: any) => import("Function/Curry").Curry<any>;
export declare const asyncCompose: <D = any>(...fns: AF[]) => AsyncComposeReturn<D>;
export declare const lockWrap: <F extends AF<any[], Promise<any>>>(fn: F) => (...rest: ReturnParameters<F>) => Promise<ReturnType<F> extends any ? ReturnType<F> : Promise<ReturnType<F>>>;
export declare const callLock: <F extends AF<any[], any>>(fn: F) => (...rest: ReturnParameters<F>) => ReturnType<F>;
export declare const messageComposeMethod: import("Function/Curry").Curry<(compose: AF, record: Record<string, any>, target: AO | any[]) => Record<string, any>>;
export declare const debouncePromise: (rejectValue?: any) => (promise: Promise<any>) => Promise<any>;
