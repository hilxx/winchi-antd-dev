import { render } from 'react-dom'
import type { SizeType } from 'antd/lib/config-provider/SizeContext'
import { Button, Modal } from 'antd'
import App from './App'
import Wc, { R } from 'winchi'
import { DefaultProps } from './d'

export interface LoadingText {
 loadingText?: string
 errText?: string
}

export type Size = Exclude<SizeType, void>

/** handles 默认情况  */
export type TableHandleKeys = 'onRemoves'
 | 'onRemove'
 | 'onEdit'
 | 'onAdd'

export type AliasKey = Size
 | 'handle' | 'edit' | 'remove' | 'nextStep' | 'lastStep' | 'submit' | 'add'

export type Alias = Record<AliasKey | string, string>

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

export let defaultProps: DefaultProps = {
 dataKey: 'data',
 totalPageKey: 'totalPage',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 defaultPage: 0,
 pageSize: 40,
 alias,
 columns: [
  {
   title: '从出生那年就飘着',
   dataIndex: '@handle',
   handles: {
    onRemove: <Button type='link' style={{ padding: 0 }} danger>{alias.remove}</Button>,
    onClickEdit: alias.edit,
   }
  }
 ],

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
 async handleClickBefore(name, f, params) {
  switch (name) {
   case 'onRemove':
   case 'onRemoves':
    return new Promise(resolve => Modal.confirm({
     title: '确定删除吗？',
     onOk() {
      resolve(f(params))
     }
    }))
   default: return f(params)
  }
 },
 ModalWidth: {
  form: 750,
 },
 upload: Wc.obj,
}


export const setGlobalConfig: AF<[o: Partial<DefaultProps>], any> = R.compose(
 (v: any) => defaultProps = v,
 Wc.mergeDeepLeft(R.__, defaultProps),
)

export default render(<App />, document.getElementById('app'))

export * from './d.d'