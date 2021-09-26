import React, { useEffect, useRef } from 'react'
import WcTable, { WcHeadTableProps, HeadActionRef } from '../HeadTable'
import Wc, { R } from 'winchi'
import styles from './index.less'

export interface WcFormTableProps<T extends AO = AO> extends Omit<WcHeadTableProps<T>, 'onChange' | 'onSelectRowChange'> {
 onChange?(v): any
 value?: any,
}

type Model = React.FC<WcFormTableProps>

const WcFormTable: Model = ({
 actionRef: actionRef_,
 onChange,
 value = Wc.arr,
 style = Wc.obj,
 columns,
 useDefaultColumns = false,
 className = '',
 ...props
}) => {
 const actionRef = useRef<HeadActionRef>()
 if (actionRef_) (actionRef_ as AO).current = actionRef.current

 useEffect(() => {
  actionRef.current?.resetSelectedRows(Array.isArray(value) ? value : [value])
 }, [value])

 return (
  <WcTable
   className={`${styles.wrap} ${className}`}
   scroll={{ x: undefined, y: undefined }}
   columns={columns}
   hideControl
   useDefaultColumns={useDefaultColumns}
   actionRef={actionRef}
   onSelectRowChange={onChange && R.flip(onChange)}
   style={{ padding: 0, ...style }}
   pageSize={10}
   {...props}
  />
 )
}

export default React.memo<Model>(WcFormTable)