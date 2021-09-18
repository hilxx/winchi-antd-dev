import React, { useMemo } from 'react'
import { Button, Divider, Space } from 'antd'
import HeadTable, { WcHeadTableProps } from './HeadTable'
import Wc, { R } from 'winchi'
import { actionLoading } from '@src/utils'
import { Columns } from '@src/Page/data'
import { defaultProps, DefaultProps, TableMessageKeys } from '@src/index'
import styles from './index.less'

export type Handles<T extends AO = AO> = Partial<Record<TableMessageKeys, (row: T | T[]) => any>>

export interface WcTableProps<T extends AO = AO> extends WcHeadTableProps<T> {
 /** map变量名, 先转换值再render */
 alias?: Record<Key, string | ((data: AO) => React.ReactNode)>
 /** 用于覆盖 defaultProps.columns */
 useHandleColumns?: DefaultProps['columns']
 /** 
* @description 事件处
* @example  新增、删除、编辑..
*   */
 handles?: Handles<T> & AO
}

type Model = React.FC<WcTableProps>

const WcTable: Model = ({
 alias,
 columns: columns_,
 /** 优先级高于defaultProps.columns */
 useHandleColumns,
 handles: handles_ = {},
 ...props
}) => {
 const prop = useMemo(() => key => alias?.[key] || defaultProps.Alias[key], [alias])

 /** handle新增 消息通知  */
 const handles = useMemo<Handles>(() =>
  Wc.messageComposeMethod(actionLoading, defaultProps.handlesMessage, handles_), [handles_])

 const { onRemove } = handles

 /** 生成额外的column，用来绑定handles  */
 const otherColumns = useMemo(() => ({
  ...defaultProps.columns || {},
  ...useHandleColumns || {},
 }), [useHandleColumns])

 const columns = useMemo(() =>
  R.compose(
   R.map(_columnRenderUseAlias(prop)) as AF,
   R.concat(columns_) as AF,
   Wc.identify(handles ? _columnRenderAddHandle(handles as any)(otherColumns) : []),
  )(), [onRemove, columns_, prop, otherColumns, handles])

 return (
  <HeadTable
   onRemoves={handles_.onRemoves}
   columns={columns}
   {...props}
  />
 )
}

export default React.memo<Model>(WcTable)

const _propBtnWantClick: AF = R.prop('btnsWantClick')

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

const _filterNotUseMethods: AF = R.curry(
 (methods: AO, columns: any[]) =>
  columns.filter(
   R.compose(
    R.lt(0),
    R.prop('length'),
    R.filter(R.prop(R.__, methods)),
    Object.keys,
    _propBtnWantClick,
   )
  )
)

/**  columns新增click事件  */
const _columnRenderAddHandle = (methods: Record<string, AF>) => R.compose(
 /* btnsWantClick 覆盖 render */
 R.map((c: Columns) => _propBtnWantClick(c) ? {
  ...c,
  render(_, row) {
   return (
    <Space size={1} split={<Divider type='vertical' />}>
     {
      Object.keys(_propBtnWantClick(c))
       .filter(R.prop(R.__, methods))
       .map((key, index) => {
        const node = _propBtnWantClick(c)[key]
        const clickHandle = () => methods[key]?.(row)
        return typeof node === 'string' ? (
         <Button key={index} style={{ padding: 0 }} className={styles['handle-btn']} size='small' onClick={clickHandle} type='link'>{node}</Button >
        ) : <span key={index} onClick={clickHandle}>{node}</span>
       })
     }
    </Space>
   )
  }
 } : c),
 _filterNotUseMethods(methods),
 R.map(([k, c]) =>
  methods[k] ? ({
   ...c,
   render(v, record, index) {
    return (
     <div onClick={() => methods[k]?.(record)}>{c.render ? c.render(v, record, index) : v}</div>
    )
   }
  }) : c) as AF,
 Object.entries,
) /* (Record<string, Columns>) */



