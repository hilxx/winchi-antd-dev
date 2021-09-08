declare module '*.less'

declare type AO = Record<string, any>
declare type AF<P extends [] = any[], R = any> = (...p: P) => R
declare type GetKey = string | AF<any[], string>
