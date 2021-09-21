import React, { useEffect, useRef } from 'react'
import WcTable, { WcTableProps, ActionRef } from '../'
import Wc, { R } from 'winchi'

export interface WcFormTableProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'onChange' | 'onSelectRowChange'> {
 onChange?(v): any
 value?: any
}

type Model = React.FC<WcFormTableProps>

const WcFormTable: Model = ({
 actionRef: actionRef_,
 onChange,
 value = Wc.arr,
 style = Wc.obj,
 ...props
}) => {
 const actionRef = useRef<ActionRef>()
 if (actionRef_) (actionRef_ as AO).current = actionRef.current

 useEffect(() => {
  actionRef.current?.resetSelectedRows(Array.isArray(value) ? value : [value])
 }, [value])


 return (
  <WcTable
   hideControl
   actionRef={actionRef}
   onSelectRowChange={onChange && R.flip(onChange)}
   style={{ padding: 0, ...style }}
   {...props}
  />
 )
}

export default React.memo<Model>(WcFormTable)