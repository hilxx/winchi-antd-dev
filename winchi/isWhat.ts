import { AO } from '.'

export const isObj = (o): o is AO => Reflect.apply(Object.prototype.toString, o, []) === '[object Object]'

export const isEmptyObj = (o: AO): o is AO => Reflect.ownKeys(o).length === 0

export const isRichObj = (o: AO): o is AO => Reflect.ownKeys(o).length > 0

export const isEmpty = v => v === undefined || v === null || v === NaN