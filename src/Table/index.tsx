import React, { useMemo } from 'react'
import HeadTable, { WcHeadTableProps } from './HeadTable'
import Wc, { R } from 'winchi'
import { Columns } from '@src/Page/data'
import { defaultProps, DefaultProps } from '@src/index'

export interface WcTableProps<T extends AO = AO> extends WcHeadTableProps<T> {
 /** map变量名, 先转换值再render */
 alias?: Record<Key, string | ((data: AO) => React.ReactNode)>
 handles?: Record<string, (row: T) => any>
 useHandleColumns?: DefaultProps['columns']
}

type Model = React.FC<WcTableProps>

const WcTable: Model = ({
 alias,
 columns: columns_,
 /** 优先级高于defaultProps.columns */
 useHandleColumns,
 handles,
 ...props
}) => {
 const prop = useMemo(() => Wc.prop(R.__, alias), [alias])

 /** 生成额外的column，用来绑定handles  */
 const otherColumns = useMemo(() => ({
  ...defaultProps.columns || {},
  ...useHandleColumns || {},
 }), [useHandleColumns])

 const columns = useMemo(() => R.compose(
  R.map(_columnRenderUseAlias(prop)) as AF,
  R.concat(columns_) as AF,
  Wc.identify(handles ? _columnRenderUserHandle(handles)(otherColumns) : [])
 )(), [columns_, prop, otherColumns, handles])

 return (
  <HeadTable
   columns={columns}
   {...props}
  />
 )
}

export default React.memo<Model>(WcTable)

const _columnRenderUseAlias = R.curry(
 (getVal: (o: AO) => React.ReactNode, c: Columns) => ({
  ...c,
  render(val_, record, index) {
   let val = getVal(record)
   val = val || val_
   return c.render ? c.render(val, record, index) : val
  }
 })
)

/**  columns新增click事件  */
const _columnRenderUserHandle = (methods: Record<string, AF>) => R.compose(
 R.map((c: Columns) => c.renderUseHandles ? {
  ...c,
  render(_, row) {
   return Object.keys(c.renderUseHandles!).map(key => (
    <div key={key} onClick={() => methods[key]?.(row)}>{c.renderUseHandles![key]}</div>
   ))
  }
 } : c),
 R.map(([k, c]) =>
  methods[k] ? ({
   ...c,
   render(v, record, index) {
    return (
     <div onClick={() => methods[k]?.(record)}>{c.render ? c.render(v, record, index) : v}</div>
    )
   }
  }) : c),
 Object.entries,
) /* (Record<string, Columns>) */
