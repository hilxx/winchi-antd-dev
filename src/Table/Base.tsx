import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table } from 'antd'
import { TableProps, TablePaginationConfig } from 'antd/lib/table'
import { TableRowSelection } from 'antd/lib/table/interface'
import { Columns } from '@src/d'
import { defaultProps, DefaultProps } from '..'
import Wc, { R } from 'winchi'

export interface ActionRef {
 reload(o?: AO): Promise<any>
 resetSelectedRows(keys?: (AO | string | number)[]): any
}

export interface WcBaseTableProps<T extends AO = AO> extends Omit<TableProps<T>, 'columns' | 'rowSelection'> {
 columns: Columns<T>[]
 request?(params?: any[]): Promise<AO>
 composeRequest?(params?: AO, fn?: AF): Promise<AO>
 config?: DefaultProps
 pageSize?: number
 actionRef?: React.RefObject<ActionRef | undefined>
 /** 
  * @default checkbox
  * @false 关闭选择
   */
 rowSelection?: TableRowSelection<T> | false
 onLoading?(boolean): any
 onSelectRowChange?(keys: Key[], rows: T[]): any
}

type Model = React.FC<WcBaseTableProps>

const WcBaseTable: Model = ({
 request: request_ = () => null,
 composeRequest: composeRequest_,
 config: config_ = defaultProps,
 pageSize = defaultProps.pageSize || 40,
 pagination: pagination_ = Wc.obj,
 rowSelection: rowSelection_ = Wc.obj,
 actionRef,
 rowKey: rowKey_,
 onLoading,
 onSelectRowChange,
 ...props
}) => {
 const config = useMemo((): DefaultProps => ({
  ...defaultProps,
  ...config_,
 }), [config_])
 const [spinning, setSpinning] = useState(true)
 const [data, setData] = useState<AO[]>([])
 const [currentPage, setCurrentPage] = useState(config.defaultPage || 0)
 const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
 const rowKey = useMemo<string>(() => (typeof rowKey_ === 'function' ? rowKey() : rowKey_) ?? 'id', [rowKey_])
 const totalPageRef = useRef<number>(0)
 const isRefreshRef = useRef<boolean>(false)
 const debouncePromiseRef = useRef<AF>(Wc.debouncePromise(setData))

 useEffect(() => {
  request()
 }, [currentPage])

 const toggleSpinning = (b: boolean) => () => {
  onLoading?.(b)
  setSpinning(b)
 }

 const effectSelectedRowKeys = (ks_: (string | number | AO)[] = Wc.arr) => {
  const ks = ks_.map(k => Wc.isObj(k) ? k[rowKey] : k)
  if (ks.toString() === selectedRowKeys.toString()) return
  const rows = data.filter(d => ks.includes(d[rowKey]))
  setSelectedRowKeys(ks)
  onSelectRowChange?.(ks, rows)
  rowSelection_ !== false && rowSelection_?.onChange?.(ks, rows)
 }

 const resetState = () => {
  isRefreshRef.current && effectSelectedRowKeys(Wc.arr)
  isRefreshRef.current = false
 }

 const effectData: AF = d => {
  const newData = Wc.prop(config.dataKey as any, d)
  const totalPage = Wc.prop(config.totalPageKey as any, d)
  const isRefresh = isRefreshRef.current
  totalPageRef.current = totalPage
  setData(isRefresh ? newData : [...data, ...newData])
 }

 const mergePageParams = R.compose(
  R.merge,
  ({ page = 0, size }: { page?: number, size: number }) => ({
   [config.requestPageKey]: page,
   [config.requestPageSizeKey]: size,
  })
 )

 const composeRequest = R.compose(
  debouncePromiseRef.current,
  composeRequest_ ? R.curryN(2, composeRequest_)(R.__, request_) : request_,
 )

 const requestCatch = R.unless(
  R.equals(setData),
  toggleSpinning(false),
 )

 const request = Wc.asyncCompose(
  toggleSpinning(false),
  resetState,
  R.when(
   Wc.isObj,
   effectData,
  ),
  composeRequest,
  mergePageParams({ size: pageSize, page: currentPage }),
  R.tap(toggleSpinning(true)),
 ).catch(requestCatch)

 const pagination: TablePaginationConfig | false = pagination_ === false ? false : {
  hideOnSinglePage: true,
  pageSize,
  ...pagination_,
  total: totalPageRef.current,
  onChange(page, pageSize) {
   setCurrentPage(page)
   pagination_?.onChange?.(page, pageSize)
  },
 }

 const rowSelection: WcBaseTableProps['rowSelection'] = rowSelection_ === false ? undefined : {
  ...rowSelection_,
  selectedRowKeys,
  onChange: effectSelectedRowKeys,
 }

 if (actionRef) {
  (actionRef as { current: ActionRef }).current = {
   reload(params = {}) {
    isRefreshRef.current = true
    return request(mergePageParams({ page: config.defaultPage, size: pageSize })(params))
   },
   resetSelectedRows: effectSelectedRowKeys,
  }
 }

 return (
  <Table
   {...props}
   rowKey={rowKey}
   dataSource={data}
   pagination={pagination}
   loading={spinning}
   rowSelection={rowSelection as any}
  />
 )
}

export default React.memo<Model>(WcBaseTable)