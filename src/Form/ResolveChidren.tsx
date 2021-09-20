import React from 'react'
import WcFormItem from './Item'
import WcFormList from './List'

export interface WcResolveChidrenProps extends AO {
 hide: boolean
 wcInitVal: any
}

type Model = React.FC<WcResolveChidrenProps>

const ResolveChidren: Model = (props: any) =>
 props.formType === 'list'
  ? <WcFormList {...props} />
  : <WcFormItem {...props} />


export default React.memo<Model>(ResolveChidren)
