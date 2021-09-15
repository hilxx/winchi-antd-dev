import React, { useRef, useState } from 'react'
import { Alert, Button, Dropdown, Menu, Popconfirm, Spin, Tooltip, Tabs } from 'antd'
import type { TabPaneProps } from 'antd/lib/tabs'
import { ColumnHeightOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import { defaultProps } from '@src/index'
import Table, { WcBaseTableProps, ActionRef as BaseActionRef } from '../Base'
import styles from './index.less'

export type ActionRef = BaseActionRef

export interface WcHeadTableProps<T extends AO = AO> extends WcBaseTableProps<T> {
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
 onRemoves?(rows: T): any
 tabsConfig?: {
  tabs?: TabPaneProps[]
  onChange?(key: any): any,
  requestKey?: string
  defaultTab?: string
 }
}

export type Size = WcBaseTableProps['size']

type Model = React.FC<WcHeadTableProps>

const WcHeadTable: Model = ({
 onClickAdd,
 onLoading: onLoading_,
 actionRef: actionRef_,
 onSelectRowChange: onSelectRowChange_,
 hideControl,
 filter,
 controls,
 onRemoves,
 pagination,
 tabsConfig,
 ...props
}) => {
 const [loading, setLoading] = useState(false)
 const [heightMenuState, setHeightMenuState] = useState<Size>('middle')
 const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
 const actionRef = useRef<ActionRef>()
 const selectedRowsRef = useRef<any[]>()
 const currentTabKeyRef = useRef<string | number | undefined>(tabsConfig?.defaultTab)

 const onLoading = (b: boolean) => {
  if (actionRef_) {
   (actionRef_ as any).current = actionRef.current
  }
  onLoading_?.(b)
  setLoading(b)
 }

 const refreshTable = () => {
  actionRef?.current?.reload()
 }

 const onSelectRowChange: WcHeadTableProps['onSelectRowChange'] = (keys, rows) => {
  onSelectRowChange_?.(keys, rows)
  setSelectedRowKeys(keys)
  selectedRowsRef.current = rows
 }

 const removeHandle = async () => {
  selectedRowsRef.current && await onRemoves?.(selectedRowsRef.current)
  actionRef.current?.reload()
 }

 const tabChangeHandle = async (key) => {
  tabsConfig?.onChange?.(key)
  currentTabKeyRef.current = key
  tabsConfig?.requestKey && actionRef.current?.reload({ [tabsConfig.requestKey]: key })
 }

 const filterJSX = (
  <section>
  </section>
 )


 const columnHeightMenuJSX = (
  <Menu
   onClick={({ key }) => setHeightMenuState(key as Size)}
   selectedKeys={[heightMenuState!]}
   className={styles['menu-min-width']}
  >
   {
    (['small', 'middle', 'large'] as Required<Size>[]).map(key => (
     <Menu.Item key={key}>{defaultProps.Alias?.[key!]}</Menu.Item>
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

   {onClickAdd ? <Button onClick={onClickAdd} type='primary'>{defaultProps.Alias.add}</Button> : null}

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
  <section className={styles.wrap}>
   {
    tabsConfig?.tabs && (
     <Tabs onChange={tabChangeHandle} defaultActiveKey={tabsConfig.defaultTab}>
      {
       tabsConfig.tabs.map(t => {
        const isLoading = currentTabKeyRef.current === t.tabKey && loading

        return (
         <Tabs.TabPane
          key={t.tabKey}
          {...t}
          className={styles['tab-pane']}
          tab={
           <>
            {isLoading ? <span className={styles['tab-spin']} ><SyncOutlined spin style={{ margin: 0 }} /></span> : null}
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
    <Table
     size={heightMenuState as any}
     actionRef={actionRef}
     onLoading={onLoading}
     onSelectRowChange={onSelectRowChange}
     pagination={{ ...pagination, size: heightMenuState === 'large' ? 'default' : 'small' }}
     {...props}
    />
   </main>
  </section >
 )
}

export default React.memo<Model>(WcHeadTable)



