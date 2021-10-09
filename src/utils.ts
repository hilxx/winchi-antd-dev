import { message } from 'antd'
import Wc, { R } from 'winchi'
import { Columns } from '@src/d'
import { LoadingText } from '@src/index'

const _fn_symbol = Symbol('This is insert Function')

export const actionLoading = Wc.curryLazy(
 async ({ errText, loadingText }: LoadingText = {}, f: AF, ...params) => {
  const hide = loadingText !== undefined ? message.loading(loadingText) : undefined
  try {
   await f(...params)
  } catch (err) {
   errText !== undefined && message.error({ content: errText })
   throw err
  } finally {
   hide?.()
  }
 }
)

export const propDataIndex: AF = Wc.prop('dataIndex')
export const propXIndex = Wc.prop('xIndex')

export const processEnum: AF = (handle: AF<[AO, number]>) => async (c: Columns, index: number) => {
 const map: WeakMap<any, any> = handle[_fn_symbol] = handle[_fn_symbol] || new WeakMap()

 const enumObj = await (async () => {
  if (typeof c.enum !== 'function') return c.enum
  if (map.has(c.enum)) return map.get(c.enum)
  const r = await c.enum()
  map.set(c.enum, r)
  return r
 })()
 enumObj !== c.enum && handle({ ...c, enum: enumObj }, index)
}

export const sortColumns = (arr: any[]) => Wc.sortByProp(v => propXIndex(v) || 0, arr)

export const naughtyHideForm: AF = R.curry(
 (columns: Columns[], data: AO) => {
  let count = 0
  const res = columns?.map(c => {
   const isFunc = typeof c.hideForm === 'function'
   count += isFunc ? 1 : 0
   return isFunc ? { ...c, hideForm: (c.hideForm as AF)(data) } : c
  })
  return count ? res : columns
 }
)
