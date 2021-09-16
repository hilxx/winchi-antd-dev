/// <reference types="ts-toolbelt" />
import { AF, AO } from './index';
export declare const classifyAos: import("Function/Curry").Curry<(prop: AF, arr: AO[]) => AO>;
export declare const flatArrayShallow: import("Function/Curry").Curry<(index: number | undefined | null, arr: any[]) => any>;
export declare const propLength: AF<any[], any>;
