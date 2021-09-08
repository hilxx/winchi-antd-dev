import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table } from 'antd'
import { TableProps, TablePaginationConfig } from 'antd/lib/table'
import { TableRowSelection } from 'antd/lib/table/interface'
import { Columns } from '../Page/data.d'
import { defaultProps, DefaultProps } from '../'
import WC, { R } from 'winchi'

export interface ActionRef {
 reload(o?: AO): any
}

export interface WcTableProps<T extends AO = AO> extends Omit<TableProps<T>, 'columns' | 'rowSelection'> {
 columns: Columns<T>[]
 request?(params?: any[]): Promise<AO>
 composeRequest?(params?: AO, fn?: AF): Promise<AO>
 config?: DefaultProps
 pageSize?: number
 actionRef?: React.RefObject<ActionRef>
 /** 
  * @default checkbox
  * @false 关闭选择
   */
 rowSelection?: TableRowSelection<T> | false
}

type Model = React.FC<WcTableProps>

const WcTable: Model = ({
 request: request_ = () => null,
 composeRequest: composeRequest_,
 config: config_ = defaultProps,
 pageSize = defaultProps.pageSize || 40,
 pagination: pagination_ = {},
 rowSelection: rowSelection_ = {},
 actionRef,
 rowKey = 'id',
 ...props
}) => {
 const config = useMemo((): DefaultProps => ({
  ...defaultProps,
  ...config_,
 }), [config_])
 const [spinning, setSpinning] = useState(true)
 const [data, setData] = useState<AO[]>([])
 const [currentPage, setCurrentPage] = useState(config.defaultPage || 0)
 const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
 const totalPageRef = useRef<number>(0)

 useEffect(() => {
  request()
  if (actionRef) {
   (actionRef as { current: ActionRef }).current = {
    reload(params = {}) {
     request(mergePageParams({ page: config.defaultPage, size: pageSize })(params))
    }
   }
  }
 }, [currentPage])

 const toggleSpinning = (b: boolean) => () => setSpinning(b)

 const effectData: AF = d => {
  const newData = WC.prop(config.dataKey, d)
  const totalPage = WC.prop(config.totalPageKey, d)
  totalPageRef.current = totalPage
  setData([...data, ...newData])
 }

 const mergePageParams = R.compose(
  R.merge,
  ({ page = 0, size }: { page?: number, size: number }) => ({
   [config.requestPageKey]: page,
   [config.requestPageSizeKey]: size,
  })
 )

 const composeRequest = composeRequest_ ? R.curry(R.binary(composeRequest_))(R.__, request_) : request_

 const request = WC.asyncCompose(
  R.tap(toggleSpinning(false)),
  R.when(
   WC.isObj,
   effectData,
  ),
  composeRequest,
  mergePageParams({ size: pageSize, page: currentPage }),
  R.tap(toggleSpinning(true)),
 ).catch(toggleSpinning(false))

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

 const rowSelection: WcTableProps['rowSelection'] = rowSelection_ === false ? undefined : {
  ...rowSelection_,
  selectedRowKeys,
  onChange(keys, rows) {
   setSelectedRowKeys(keys)
   rowSelection_?.onChange?.(keys, rows)
  },
 }

 return (
  <Table
   {...props}
   rowKey={rowKey}
   dataSource={data}
   pagination={pagination}
   loading={spinning}
   rowSelection={rowSelection}
  />
 )
}

export default React.memo<Model>(WcTable)