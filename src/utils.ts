import { message } from 'antd'
import * as R from 'ramda'

/** content 动词（空格）行为  */
export const actionLoading = R.curry(
 (content: string, f: AF) => async (...params) => {
  const c = content.split(' ')
  const hide = message.loading(c.join(''))
  try {
   await f(...params)
  } catch (err) {
   message.error({ content: `${c[1]}失败` })
   throw err
  } finally {
   hide()
  }
 }
)

export const loadingPromise = actionLoading('正在 请求')
export const addPromise = actionLoading('正在 添加')
export const editPromise = actionLoading('正在 修改')
export const removePromise = actionLoading('正在 删除')