import { message } from 'antd'
import * as R from 'ramda'

export const actionLoading = R.curry(
 async (content: string, f: AF, params: any) => {
  const hide = message.loading(content)
  try {
   await f(params)
  } catch (err) {
   throw err
  } finally {
   hide()
  }
 }
)

export const loadingPromise = actionLoading('正在请求')
export const addPromise = actionLoading('正在添加')
export const editPromise = actionLoading('正在修改')
export const removePromise = actionLoading('正在删除')