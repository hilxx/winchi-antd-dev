import React, { useRef, useState } from 'react'
import { Alert, Button, Dropdown, Menu, Popconfirm, Spin, Tooltip } from 'antd'
import { ColumnHeightOutlined, LoadingOutlined, SyncOutlined, } from '@ant-design/icons'
import { defaultProps } from '@src/index'
import Table, { WcBaseTableProps, ActionRef as BaseActionRef } from '../Base'
import { removePromise } from '@src/utils'
import styles from './index.less'

export type ActionRef = BaseActionRef

export interface WcHeadTableProps<T extends AO = AO> extends WcBaseTableProps<T> {
 onAdd?: AF
 onRemove?(keys?: Key[], rows?: T[]): any
 hideControl?: boolean
 filter?: boolean
 controls?: {
  add?: boolean
  /** 刷新 */
  refresh?: boolean
  /** 密度 */
  density?: boolean
  /** 新增 控制处 */
  Rights?: React.ReactNode[]
  /** 删除位置 控制处 */
  Contents?: React.ReactNode[]
 }
}

type Model = React.FC<WcHeadTableProps>

const WcHeadTable: Model = ({
 onAdd,
 onLoading: onLoading_,
 actionRef: actionRef_,
 onSelectRowChange: onSelectRowChange_,
 onRemove = () => null,
 hideControl,
 filter,
 controls,
 ...props
}) => {
 const [loading, setLoading] = useState(false)
 const [heightMenuState, setHeightMenuState] = useState('middle')
 const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
 const actionRef = useRef<ActionRef>()
 const selectedRowsRef = useRef<any[]>()

 const onRemovePromise = removePromise(onRemove)

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
  await onRemovePromise(selectedRowKeys, selectedRowsRef.current)
  actionRef.current?.reload()
 }

 const filterJSX = (
  <section>
  </section>
 )

 const columnHeightMenuJSX = (
  <Menu
   onClick={({ key }) => setHeightMenuState(key)}
   selectedKeys={[heightMenuState]}
   className={styles['menu-min-width']}
  >
   {
    ['small', 'middle', 'large'].map(key => (
     <Menu.Item key={key}>{defaultProps.Alias?.[key]}</Menu.Item>
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
     style={{ visibility: selectedRowKeys.length > 1 ? 'visible' : 'hidden' }}
     message={`已选择 ${selectedRowKeys.length} 项`}
     type='info'
     action={
      <>
       {
        controls?.Contents?.map(c => c)
       }
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
         {selectedRowKeys.length > 1 ? '批量删除' : ' '}
        </Button>
       </Popconfirm>
       <Button
        size='small'
        type='link'
        onClick={() => actionRef.current?.resetSelectedRows()}
       >
        {/* 第一时间隐藏文字 */}
        {selectedRowKeys.length > 1 ? '取消选择' : ' '}
       </Button>
      </>
     }
    />
   </Spin>

   {controls?.add === false ? null : <Button onClick={onAdd} type='primary'>新建</Button>}

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
  <main className={styles.wrap}>
   {filter ? filterJSX : null}
   {hideControl ? null : tableHeaderJSX}
   <Table
    size={heightMenuState as any}
    actionRef={actionRef}
    onLoading={onLoading}
    onSelectRowChange={onSelectRowChange}
    {...props}
   />
  </main>
 )
}

export default React.memo<Model>(WcHeadTable)



