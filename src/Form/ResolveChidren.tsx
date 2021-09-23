import React from 'react'
import Wc from 'winchi'
import WcFormItem from './Item'
import WcFormList from './List'

export interface WcResolveChidrenProps extends AO {
  hide: boolean
  wcInitVal: any
  enum?: AO
}

type Model = React.FC<WcResolveChidrenProps>

const ResolveChidren: Model = ({ formProps: formProps_ = Wc.obj, ...props }: any) => {
  const formProps = formProps_.options ? formProps_ : {
    ...formProps_,
    options: _objToLabel(props.enum)
  }

  return props.formType === 'list'
    ? <WcFormList {...props as any} formProps={formProps} />
    : <WcFormItem {...props as any} formProps={formProps} />
}

export default React.memo<Model>(ResolveChidren)


const _objToLabel = (o: AO): { label: string, value: any }[] =>
  Object.entries(o).map(([label, value]) => ({ label, value }))