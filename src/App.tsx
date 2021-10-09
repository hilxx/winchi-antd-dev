import React, { createContext, useContext, useState, useRef } from 'react'
import { Button, ConfigProvider, Modal } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import Page from './Page/Test'
import { hot } from 'react-hot-loader/root'
import 'antd/dist/antd.css'
import Wc, { R } from 'winchi'
import { WcConfig } from './d'

const isDev = process.env.NODE_ENV?.startsWith('dev')

let defaultAlias = {
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
 reset: '重置',
 search: '查询',
 tableErr: '请求失败',
}

let defaultConfig: WcConfig = {
 dataKey: 'data',
 totalKey: 'total',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 topTabKey: '__topTab',
 defaultPage: 0,
 pageSize: 40,
 tableScroll: {
  x: 1200,
 },
 alias: defaultAlias,
 columns: [
  {
   title: '更新时间',
   dataIndex: 'updateTime',
   hideForm: true,
   render(d) {
    const date = new Date(d)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
   }
  },
  {
   title: '从出生那年就飘着',
   dataIndex: '@handle',
   xIndex: 9,
   handles: {
    onClickEdit: defaultAlias.edit,
    onRemove: <Button type='link' style={{ padding: 0 }} danger>{defaultAlias.remove}</Button>,
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

const _uniqLeftColumns = (conf: WcConfig) => ({
 ...conf,
 columns: Wc.mergeArrayLeft(R.prop('dataIndex'), conf.columns),
})

const _setWcConfigHandle: AF = (oldConfig, handle: AF) => R.compose(
 handle,
 _uniqLeftColumns,
 Wc.mergeDeepRight(oldConfig),
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


export type Alias = typeof defaultAlias