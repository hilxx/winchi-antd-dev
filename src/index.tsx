import { render } from 'react-dom'
import { Button } from 'antd'
import App from './App'
import Wc from 'winchi'
import { Columns, Size } from './Page/data'

export interface LoadingText {
 loadingText?: string
 errText?: string
}

/** handles预留字  */
export type TableMessageKeys = 'onRemoves'
 | 'onRemove'
 | 'onEdit'
 | 'onAdd'
 | 'onClickEdit'
 | 'onClickRemove'

export type AliasKey = Size |
 'handle' | 'edit' | 'remove' | 'nextStep' | 'lastStep' | 'submit' |'add'

export type Alias = Record<AliasKey, string>

export interface DefaultProps {
 dataKey: GetKey
 totalPageKey: GetKey
 pageSize: number
 requestPageKey: string
 requestPageSizeKey: string
 defaultPage: number
 Alias: Alias
 /** 
  * @key: 事件名
  * @value: {column, loadingText: 开启后会成为loading提示文字}
  * @description 新增column，出现在当前column的右边，事件调用props.handels
  **/
 columns: Record<string, Columns>
 /** 
 * @key: 事件名
 * @value: interface  LoadingText
 * @description 触发改事件，触发相应Loading
 **/
 handlesMessage: Partial<Record<TableMessageKeys, LoadingText>> & AO
 ModalWidth: {
  form?: string | number
  image?: string | number
 }
}

const alias: Alias = {
 small: '紧凑',
 middle: '中等',
 large: '宽松',
 handle: '操作',
 edit: '编辑',
 remove: '删除',
 nextStep: '下一步',
 lastStep: '上一步',
 submit: '提交',
 add: '新增',
}

export const defaultProps: DefaultProps = {
 dataKey: 'data',
 totalPageKey: 'totalPage',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 defaultPage: 0,
 pageSize: 40,
 Alias: alias,
 columns: {
  handle: {
   title: '从出生那年就飘着',
   btnsWantClick: {
    onClickEdit: alias.edit,
    onClickRemove: <Button type='link' style={{ padding: 0 }} danger>{alias.remove}</Button>,
   }
  }
 },
 handlesMessage: {
  onRemoves: {
   loadingText: '正在删除',
   errText: '删除失败'
  },
  onRemove: {
   loadingText: '正在删除',
   errText: '删除失败',
  },
  onAdd: {
   loadingText: '正在添加',
   errText: '添加失败',
  },
  onEdit: {
   loadingText: '正在修改',
   errText: '修改完成',
  },
 },
 ModalWidth: {
  form: 750,
 }
}

export const setGlobalConfig = (o: Partial<DefaultProps>): void =>
 Object.entries(o).forEach(([k, v]) => {
  if (Wc.isObj(defaultProps[k]) && Wc.isObj(v))
   return Reflect.ownKeys(v).forEach((key) => defaultProps[k][key] = v[key])
  defaultProps[k] = v
 }
 )

export default render(<App />, document.getElementById('app'))
