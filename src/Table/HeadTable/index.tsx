import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Dropdown, Menu, Popconfirm, Spin, Tooltip, Tabs } from 'antd'
import type { TabPaneProps } from 'antd/lib/tabs'
import { ColumnHeightOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import { defaultProps, Size } from '@src/index'
import { AppContext } from '@src/App'
import WcBaseTable, { WcTypeTableProps, TypeActionRef } from '../TypeTable'

import styles from './index.less'
import { actionLoading } from '@src/utils'

export type HeadActionRef = TypeActionRef

export interface WcHeadTableProps<T extends AO = AO> extends WcTypeTableProps<T> {
 onClickAdd?: AF
 /** 关闭新增删除...more 的控制按键  */
 hideControl?: boolean
 /** 开启顶部过滤 */
 filter?: boolean
 controls?: {
  /** 刷新 */
  refresh?: boolean
  /** 密度 */
  density?: boolean
  /** 新增 控制处 */
  Rights?: React.ReactNode[]
  /** 删除位置 控制处 */
  Contents?: React.ReactNode[]
 }
 tabsConfig?: {
  tabs?: TabPaneProps[]
  onChange?(key: any): any,
  requestKey?: string
  defaultTab?: string
 }
}

type Model = React.FC<WcHeadTableProps>

const WcHeadTable: Model = ({
 onClickAdd,
 onLoading,
 actionRef: actionRef_,
 onSelectRowChange: onSelectRowChange_,
 hideControl,
 filter,
 controls,
 handles: handles_ = Wc.obj,
 pagination,
 tabsConfig,
 className = '',
 style,
 preventFirtstRequest,
 Render = WcBaseTable,
 ...props
}) => {
 const [loading, setLoading] = useState(false)
 const { appConfig, setAppConfig } = useContext(AppContext)
 const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
 const [currentTabKey, setCurrentTabKey] = useState(tabsConfig?.defaultTab ?? tabsConfig?.tabs?.[0]?.tabKey)
 const actionRef = useRef<HeadActionRef>()
 const selectedRowsRef = useRef<any[]>()

 useEffect(() => {
  preventFirtstRequest || effectTabChange(currentTabKey)
 }, [])

 const { onRemoves, handles } = useMemo(() => {
  const { onRemoves, ...handles } = handles_

  return {
   onRemoves: onRemoves && actionLoading(defaultProps.handlesMessage.onRemoves, onRemoves),
   handles,
  }
 }, [handles_])

 const loadingHandle = (b: boolean) => {
  if (actionRef_) {
   (actionRef_ as any).current = actionRef.current
  }
  onLoading?.(b)
  setLoading(b)
 }

 const refreshTable = () => {
  actionRef?.current?.reload()
 }

 const selectRowChangeHandle: WcHeadTableProps['onSelectRowChange'] = (keys, rows) => {
  onSelectRowChange_?.(keys, rows)
  setSelectedRowKeys(keys)
  selectedRowsRef.current = rows
 }

 const removeHandle = async () => {
  selectedRowsRef.current && await onRemoves?.(selectedRowsRef.current)
  actionRef.current?.reload()
 }

 const effectTabChange = (key) => {
  if (key !== currentTabKey) {
   tabsConfig?.onChange?.(key)
   setCurrentTabKey(key)
  }
  tabsConfig?.requestKey && actionRef.current?.reload({ [tabsConfig.requestKey]: key })
 }

 const tabChangeHandle = R.unless(
  R.equals(currentTabKey),
  effectTabChange,
 )

 const filterJSX = (
  <section>
  </section>
 )

 const columnHeightMenuJSX = (
  <Menu
   onClick={({ key }) => setAppConfig({ size: key as Size })}
   selectedKeys={[appConfig.size]}
   className={styles['menu-min-width']}
  >
   {
    (['small', 'middle', 'large'] as Size[]).map(key => (
     <Menu.Item key={key}>{defaultProps.alias?.[key!]}</Menu.Item>
    ))
   }
  </Menu>
 )

 const tableHeaderJSX = (
  <header>
   <Spin
    spinning={loading}
    indicator={<></>}
   >
    <Alert
     style={{ visibility: selectedRowKeys.length ? 'visible' : 'hidden' }}
     message={`已选择 ${selectedRowKeys.length} 项`}
     type='info'
     action={
      <>
       {
        controls?.Contents?.map(c => c)
       }

       {
        onRemoves && (
         <Popconfirm
          title='确定删除吗？'
          onConfirm={removeHandle}
         >
          <Button
           size='small'
           danger
           type='text'
          >
           {/* 第一时间隐藏文字 */}
           {selectedRowKeys.length ? '批量删除' : ' '}
          </Button>
         </Popconfirm>
        )
       }

       <Button
        size='small'
        type='link'
        onClick={() => actionRef.current?.resetSelectedRows()}
       >
        {/* 第一时间隐藏文字 */}
        {selectedRowKeys.length ? '取消选择' : ' '}
       </Button>
      </>
     }
    />
   </Spin>

   {onClickAdd ? <Button onClick={onClickAdd} type='primary'>{defaultProps.alias.add}</Button> : null}

   {
    controls?.refresh === false ? null :
     loading ? <LoadingOutlined />
      : (
       <Tooltip title='刷新'>
        <SyncOutlined onClick={refreshTable} className={styles.pointer} />
       </Tooltip>
      )
   }

   {
    controls?.density === false ? null : (
     <Tooltip title='密度'>
      <Dropdown
       overlay={columnHeightMenuJSX}
       trigger={['click']}
      >
       <ColumnHeightOutlined className={styles.pointer} />
      </Dropdown>
     </Tooltip>
    )
   }

   {
    controls?.Rights?.map(c => c)
   }
  </header>
 )

 return (
  <section style={style} className={`${styles.wrap} ${className}`}>
   {
    tabsConfig?.tabs && (
     <Tabs onChange={tabChangeHandle} defaultActiveKey={tabsConfig.defaultTab}>
      {
       tabsConfig.tabs.map(t => {
        const isLoading = currentTabKey === t.tabKey && loading

        return (
         <Tabs.TabPane
          key={t.tabKey}
          {...t}
          className={styles['tab-pane']}
          tab={
           <>
            {
             isLoading
              ? <span className={styles['tab-spin']} ><SyncOutlined spin style={{ margin: 0 }} /></span>
              : null
            }
            <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>{t.tab}</span>
           </>
          }
         />
        )
       })
      }
     </Tabs>
    )
   }
   <main className={styles.table}>
    {filter ? filterJSX : null}
    {hideControl ? null : tableHeaderJSX}
    <Render
     handles={handles}
     size={appConfig.size}
     actionRef={actionRef}
     onLoading={loadingHandle}
     onSelectRowChange={selectRowChangeHandle}
     pagination={{ ...pagination, size: appConfig.size === 'large' ? 'default' : 'small' }}
     preventFirtstRequest
     {...props}
    />
   </main>
  </section >
 )
}

export default React.memo<Model>(WcHeadTable)



