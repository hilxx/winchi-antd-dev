import React, { useMemo } from 'react'
import { Button, Divider, Space } from 'antd'
import Wc, { R } from 'winchi'
import type { Columns, Handles } from '@src/d'
import WcBaseTable, { WcBaseTableProps, BaseActionRef } from '../Base'
import { defaultProps } from '@src/index'
import { actionLoading, propDataIndex } from '@src/utils'
import styles from './index.less'

export type TableType = 'alias' | 'image' | 'handles'

export interface WcTypeTableProps<T extends AO = AO> extends WcBaseTableProps<T> {
 alias?: AO
 methods?: Handles
}
export type TypeActionRef = BaseActionRef

type Model = React.FC<WcTypeTableProps>

const WcTypeTable: Model = ({
 columns: columns_,
 methods: methods_ = Wc.obj,
 alias: alias_ = defaultProps.alias,
 Render = WcBaseTable,
 ...props
}) => {
 const alias = useMemo(() => alias_ === defaultProps.alias
  ? alias_ : { ...defaultProps.alias, ...alias_ }, [alias_])

 /** handle新增 消息通知  */
 const methods = useMemo<Handles>(() =>
  Wc.messageComposeMethod(actionLoading, defaultProps.handlesMessage, methods_), [methods_])

 const columns = useMemo(R.compose(
  _processColumns(methods, alias),
  R.map(_forceHideExhibit),
  Wc.uniqueLeft(propDataIndex),
  R.concat(columns_),
  Wc.identify(defaultProps.columns || Wc.arr)
 ), [columns_, alias, methods])

 return (
  <Render
   columns={columns}
   {...props}
  />
 )
}

/**
 * 
 * @description ${dataIndex}@开头，除了table隐藏显示
 */
const _forceHideExhibit = (c: Columns): Columns => `${propDataIndex(c)}`.startsWith('@')
 ? { ...c, hideForm: true, hideDetail: true }
 : c

/**  columns新增click事件  */
const _processClick = (c: Columns, methods: AO) =>
 Reflect.has(methods, propDataIndex(c))
  ? {
   ...c,
   render(d, record, index) {
    return <div onClick={() => propDataIndex(c)(record)}>{c.render?.(d, record, index)}</div>
   }
  }
  : c

const _processTypeMap: Record<TableType, AF<any, Columns>> = {
 handles(c: Columns, methods: Handles) {
  return {
   ...c,
   render(_: any, record: any) {
    return (
     <Space size={1} split={<Divider type='vertical' />}>
      {
       Object.keys(c.handles)
        .filter(R.prop(R.__, methods))
        .map((key, index) => {
         const node = c.handles[key]
         const clickHandle = (params?: any) =>
          defaultProps.handleClickBefore
           ? defaultProps.handleClickBefore(key, methods[key]!, record)
           : methods[key]?.(record, params)

         switch (typeof node) {
          case 'function': return node({ onClick: clickHandle, record })
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
  }
 },
 alias(c: Columns, _, alias: AO) {
  return {
   ...c,
   render(d, record, index) {
    const v = c.enum?.[d] ?? alias[d] ?? d
    return c.render ? c.render(v, record, index) : v
   },
  }
 },
 image(c: Columns) {
  return c
 },
}

const _propsPipeMap = R.curry(
 (map: AO, key?) => {
  const arr = (Array.isArray(key) ? key : [key]).map(k => map[k] ? map[k] : v => v)
  return (c, ...args) => arr.reduce((lastC, f) => f(lastC, ...args), c)
 }
)

const _processColumns = (handles: Handles, alias: AO) => R.compose(
 R.map((c: Columns) => _processClick(c, handles)),
 R.map((c: Columns) =>
  Wc.isEmpty(c.tableType) ? c : _propsPipeMap(_processTypeMap)(c.tableType)(c, handles, alias)
 ),
)

export default React.memo<Model>(WcTypeTable)

export * from '../Base'