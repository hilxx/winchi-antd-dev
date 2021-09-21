import React, { useMemo } from 'react'
import { Button, Divider, Space } from 'antd'
import Wc, { R } from 'winchi'
import type { Columns, Handles } from '@src/d'
import WcBaseTable, { WcBaseTableProps, BaseActionRef } from '../Base'
import { defaultProps, DefaultProps } from '@src/index'
import { actionLoading } from '@src/utils'
import styles from './index.less'

export type TableType = 'alias' | 'image'

export interface WcTypeTableProps<T extends AO = AO> extends WcBaseTableProps<T> {
 /** 用于覆盖 defaultProps.columns */
 useHandleColumns?: DefaultProps['columns']
 alias?: AO
 handles?: Handles
}
export type TypeActionRef = BaseActionRef

type Model = React.FC<WcTypeTableProps>

const WcTypeTable: Model = ({
 columns: columns_,
 /** 优先级高于defaultProps.columns */
 useHandleColumns,
 handles: handles_ = Wc.obj,
 alias = defaultProps.alias,
 Render = WcBaseTable,
 ...props
}) => {
 const propAlias = useMemo(() => key => alias?.[key], [alias])

 /** handle新增 消息通知  */
 const handles = useMemo<Handles>(() =>
  Wc.messageComposeMethod(actionLoading, defaultProps.handlesMessage, handles_), [handles_])

 /** 生成额外的column，用来绑定handles  */
 const otherColumns = useMemo(() => ({
  ...defaultProps.columns || {},
  ...useHandleColumns || {},
 }), [useHandleColumns, defaultProps])

 const columns = useMemo(() =>
  R.compose(
   R.map(_columnRenderUseAlias(propAlias)) as AF,
   R.concat(columns_) as AF,
   Wc.identify(handles ? _columnRenderAddHandle(handles as any)(otherColumns) : []),
  )(), [columns_, propAlias, otherColumns, handles])

 return (
  <Render
   columns={columns}
   {...props}
  />
 )
}

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
        const clickHandle = (params?) =>
         defaultProps.handleClickBefore
          ? defaultProps.handleClickBefore(key, methods[key], row)
          : methods[key]?.(row, params)

        switch (typeof node) {
         case 'function': return node({ onClick: clickHandle })
         case 'string':
          return (
           <Button
            key={index}
            style={{ padding: 0 }}
            className={styles['handle-btn']}
            size='small'
            onClick={clickHandle}
            type='link'>{node}</Button >
          )
         default: return <span key={index} onClick={clickHandle}>{node}</span>
        }
       })
     }
    </Space >
   )
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
  }) : c) as AF,
 Object.entries,
) /* (Record<string, Columns>) */

export default React.memo<Model>(WcTypeTable)

export * from '../Base'