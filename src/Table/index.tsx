import React from 'react'
import WcHeadTable, { WcFilterTableProps, HeadActionRef } from './FilterTable'
import { TableHandleKeys } from '@src/index'

export type Handles<T extends AO = AO> = Partial<Record<TableHandleKeys, (row: T | T[]) => any>>

export type ActionRef = HeadActionRef

export type WcTableProps<T extends AO = AO> = WcFilterTableProps<T>

type Model = React.FC<WcTableProps>

const WcTable: Model = ({
 /** 优先级高于defaultProps.columns */
 Render = WcHeadTable,
 ...props
}) => {

 return (
  <Render
   {...props}
  />
 )
}

export default React.memo<Model>(WcTable)

export * from './FilterTable'
export * from './TypeTable'


