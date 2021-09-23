import React, { createContext, useContext, useState, useRef } from 'react'
import { Button, ConfigProvider, Modal } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import Page from '@src/Page/Test'
import { hot } from 'react-hot-loader/root'
import 'antd/dist/antd.css'
import Wc, { R } from 'winchi'
import { WcConfig, Alias } from './d'

const isDev = process.env.NODE_ENV?.startsWith('dev')

let defaultAlias: Alias = {
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

let defaultConfig: WcConfig = {
 dataKey: 'data',
 totalPageKey: 'totalPage',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 defaultPage: 0,
 pageSize: 40,
 tableScroll: {
  x: 1200,
 },
 alias: defaultAlias,
 columns: [
  {
   title: '从出生那年就飘着',
   dataIndex: '@handle',
   handles: {
    onRemove: <Button type='link' style={{ padding: 0 }} danger>{defaultAlias.remove}</Button>,
    onClickEdit: defaultAlias.edit,
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
 ModalWidth: 750,
 upload: Wc.obj,
}


const _effectDefaultAlias = R.curry(
 (old: WcConfig, cur) => {
  defaultAlias = { ...old.alias, ...cur.alias || Wc.obj }
  return cur
 }
)

const _effectDefaultConfig = newConfig => defaultConfig = newConfig

const _setWcConfigHandle: AF = (oldConfig, handle: AF) => R.compose(
 handle,
 Wc.mergeDeepLeft(R.__, oldConfig),
 _effectDefaultAlias(oldConfig),
)

export interface WcContextValue {
 wcConfig: WcConfig
 wcConfigRef: React.RefObject<WcConfig>
 setWcConfig: (c?: Partial<WcConfig>) => any
}

export const WcContext = createContext<WcContextValue>
 ({
  wcConfig: defaultConfig,
  wcConfigRef: { current: defaultConfig },
  setWcConfig: _setWcConfigHandle(defaultConfig, _effectDefaultConfig),
 })

const App = () => {
 const [wcConfig, setWcConfig] = useState<WcConfig>(defaultConfig)
 const wcConfigRef = useRef<WcConfig>(wcConfig)

 const wcConfigChangeHandle = v => {
  setWcConfig(v)
  wcConfigRef.current = v
 }

 return (
  <ConfigProvider locale={zhCN} >
   <WcContext.Provider value={{
    wcConfig,
    setWcConfig(newConfig) {
     _setWcConfigHandle(wcConfigRef.current, wcConfigChangeHandle)(newConfig)
    },
    wcConfigRef,
   }}>
    <Page />
   </WcContext.Provider>
  </ConfigProvider>
 )
}

export default isDev ? hot(App) : App

export const UseWcConfigRender: React.FC<{ children: (value: WcContextValue) => React.ReactNode }> = ({ children }) => {
 const wcConfig = useContext(WcContext)
 return (
  <>{children?.(wcConfig)}</>
 )
}

