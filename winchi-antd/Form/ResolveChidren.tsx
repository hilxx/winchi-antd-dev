import React from 'react'
import Wc from 'winchi'
import WcFormItem from './Item'
import WcFormList from './List'
import type { FormComponentWrapProps } from './formType'

export interface WcResolveChidrenProps extends Partial<FormComponentWrapProps>, AO {
  wcInitVal: any
  hide?: boolean
  enum?: AO
}

type Model = React.FC<WcResolveChidrenProps>

const ResolveChidren: Model = ({
  formProps: formProps_ = Wc.obj,
  ...props
}) => {
  const formProps = formProps_.options ? formProps_ : {
    ...formProps_,
    options: props.enum && (Array.isArray(props.enum) ? props.enum : _objToLabel(props.enum)),
  }

  return props.formType === 'list'
    ? <WcFormList {...props as any} formProps={formProps} />
    : <WcFormItem {...props as any} formProps={formProps} />
}

export default React.memo<Model>(ResolveChidren)

const _objToLabel = (o: AO): { label: string, value: any }[] =>
  Object.entries(o).map(([value, label]) => ({ label, value }))