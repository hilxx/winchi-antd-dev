import React, { useEffect, useRef } from 'react'
import HeadTable, { WcHeadTableProps, ActionRef } from '../HeadTable'

export interface WcFormTableProps<T extends AO = AO> extends Omit<WcHeadTableProps<T>, 'onChange' | 'onSelectRowChange'> {
 defaultValue?: Key[] | Key
 onChange?: WcHeadTableProps['onSelectRowChange']
}

type Model = React.FC<WcFormTableProps>

const WcFormTable: Model = ({
 defaultValue = [],
 onChange,
 actionRef: actionRef_,
 ...props
}) => {
 const actionRef = useRef<ActionRef>()

 if (actionRef_) (actionRef_ as AO).current = actionRef.current

 useEffect(() => {
  actionRef.current?.resetSelectedRows(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
 }, [defaultValue])

 return (
  <section>
   <HeadTable
    actionRef={actionRef}
    onSelectRowChange={onChange}
    {...props}
   />
  </section>
 )
}

export default React.memo<Model>(WcFormTable)