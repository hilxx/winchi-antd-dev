import { message } from 'antd'
import Wc from 'winchi'
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
