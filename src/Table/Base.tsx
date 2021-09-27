import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table } from 'antd'
import { TableProps, TablePaginationConfig } from 'antd/lib/table'
import { TableRowSelection } from 'antd/lib/table/interface'
import { Columns } from '@src/d'
import { useWcConfig } from '@src/hooks'
import Wc, { R } from 'winchi'

export interface BaseActionRef {
  reload(o?: AO): Promise<any>
  resetSelectedRows(keys?: (AO | string | number)[]): any
  resetHistroy(): any
}

export interface WcBaseTableProps<T extends AO = AO> extends Omit<TableProps<T>, 'columns' | 'rowSelection'> {
  columns: Columns<T>[]
  request?(params?: any[]): Promise<AO>
  composeRequest?(params?: AO, fn?: AF): Promise<any>
  pageSize?: number
  defaultPage?: number
  actionRef?: React.RefObject<BaseActionRef | undefined>
  /** 
   * @default checkbox
   * @false 关闭选择
    */
  rowSelection?: TableRowSelection<T> | false
  onLoading?(boolean): any
  onSelectRowChange?(keys: Key[], rows: T[]): any
  preventFirtstRequest?: boolean
  /** 替代Table组件, 默认是 antd.Table */
  Render?: React.ComponentType
}

type Model = React.FC<WcBaseTableProps>

const WcBaseTable: Model = ({
  request: request_ = Wc.func,
  composeRequest: composeRequest_,
  pageSize: pageSize_,
  defaultPage: defaultPage_,
  pagination: pagination_ = Wc.obj,
  rowSelection: rowSelection_ = Wc.obj,
  actionRef,
  rowKey: rowKey_,
  onLoading,
  onSelectRowChange,
  preventFirtstRequest,
  Render = Table,
  ...props
}) => {
  const { wcConfig, wcConfigRef } = useWcConfig()
  const [spinning, setSpinning] = useState(true)
  const [data, setData] = useState<AO[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const rowKey = useMemo<string>(() => (typeof rowKey_ === 'function' ? rowKey() : rowKey_) ?? 'id', [rowKey_])
  const dataSourceMap = useMemo(() => new Map<number, AO[]>(), [])
  const totalRef = useRef<number>(0)
  const isRefreshRef = useRef<boolean>(false)
  const requestDebounceRef = useRef<AF>(Wc.debouncePromise(setData))
  const spinTimeOutId = useRef<any>()
  const pageSize = pageSize_ ?? wcConfig.pageSize ?? 40
  const defaultPage = defaultPage_ ?? wcConfig.defaultPage

  useEffect(() => {
    if (currentPage === wcConfig.defaultPage && totalRef.current === 0 && preventFirtstRequest) return
    dataSourceMap.has(currentPage) ? setData(dataSourceMap.get(currentPage)!) : request()
  }, [currentPage])

  const toggleSpinning = (b: boolean) => () => {
    const trigger = () => {
      clearTimeout(spinTimeOutId.current)
      onLoading?.(b)
      setSpinning(b)
    }
    b ? spinTimeOutId.current = setTimeout(trigger, 200) : trigger()
  }

  const effectSelectedRowKeys = (ks_: (string | number | AO)[] = Wc.arr) => {
    const ks = ks_.map(k => Wc.isObj(k) ? k[rowKey] : k)
    if (ks.toString() === selectedRowKeys.toString()) return
    const rows = data.filter(d => ks.includes(d[rowKey]))
    setSelectedRowKeys(ks)
    onSelectRowChange?.(ks, rows)
    rowSelection_ !== false && rowSelection_?.onChange?.(ks, rows)
  }

  const requestEndResetState = () => {
    isRefreshRef.current && effectSelectedRowKeys(Wc.arr)
    isRefreshRef.current = false
  }

  const effectData: AF = d => {
    const newData = Wc.prop(wcConfigRef.current!.dataKey, d)
    const totalPage = Wc.prop(wcConfigRef.current!.totalKey, d)
    dataSourceMap.set(currentPage, newData)
    totalRef.current = totalPage
    setData(newData)
  }

  /**
   * @description 重命名page & size
   * @returns merge函数
   */
  const mergePageParams = R.compose(
    R.merge,
    ({ page = 0, size }: { page?: number, size: number }) => ({
      [wcConfig.requestPageKey]: page,
      [wcConfig.requestPageSizeKey]: size,
    })
  )

  const composeRequest = R.compose(
    requestDebounceRef.current,
    composeRequest_ ? R.curryN(2, composeRequest_)(R.__, request_) : request_,
  )

  const requestCatch = R.unless(
    R.equals(setData),
    toggleSpinning(false),
  )

  const request = Wc.asyncCompose(
    toggleSpinning(false),
    requestEndResetState,
    R.when(
      Wc.isObj,
      effectData,
    ),
    composeRequest,
    mergePageParams({ size: pageSize, page: currentPage + defaultPage }),
    R.tap(toggleSpinning(true)),
  ).catch(requestCatch)

  const pagination: TablePaginationConfig | false = pagination_ === false ? false : {
    hideOnSinglePage: true,
    pageSize,
    ...pagination_,
    total: totalRef.current,
    onChange(page, pageSize) {
      setCurrentPage(page - 1)
      pagination_?.onChange?.(page, pageSize)
    },
  }

  const rowSelection: WcBaseTableProps['rowSelection'] = rowSelection_ === false ? undefined : {
    ...rowSelection_,
    selectedRowKeys,
    onChange: effectSelectedRowKeys,
  }

  if (actionRef) {
    (actionRef as { current: BaseActionRef }).current = {
      reload(params = {}) {
        dataSourceMap.clear()
        isRefreshRef.current = true
        return request(mergePageParams({ page: wcConfig.defaultPage, size: pageSize })(params))
      },
      resetHistroy() {
        dataSourceMap.clear()
      },
      resetSelectedRows: effectSelectedRowKeys,
    }
  }

  return (
    <Render
      scroll={wcConfig.tableScroll}
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