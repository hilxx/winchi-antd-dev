import { message } from 'antd'
import Wc, { R } from 'winchi'
import { Columns } from '@src/d'
import { LoadingText } from '@src/index'

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
 const enumObj = await (typeof c.enum === 'function' ? c.enum() : c.enum)
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
