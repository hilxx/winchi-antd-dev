import React, { useEffect, useRef, useState } from 'react'
import WcTable, { WcFilterTableProps, HeadActionRef } from '../FilterTable'
import Wc from 'winchi'
import styles from './index.less'

export interface WcFormTableProps<T extends AO = AO> extends Omit<WcFilterTableProps<T>, 'onChange' | 'onSelectRowChange'> {
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
 const [selectRows, setSelectRows] = useState<any[]>()
 const actionRef = useRef<HeadActionRef>()
 if (actionRef_) (actionRef_ as AO).current = actionRef.current

 useEffect(() => {
  value !== selectRows && actionRef.current?.resetSelectedRows(Array.isArray(value) ? value : [value])
 }, [value])

 useEffect(() => {
  onChange?.(selectRows)
 }, [selectRows])

 return (
  <WcTable
   className={`${styles.wrap} ${className}`}
   scroll={{ x: undefined, y: undefined }}
   columns={columns}
   hideControl
   useDefaultColumns={useDefaultColumns}
   actionRef={actionRef}
   onSelectRowChange={setSelectRows}
   style={{ padding: 0, ...style }}
   pageSize={10}
   {...props}
  />
 )
}

export default React.memo<Model>(WcFormTable)