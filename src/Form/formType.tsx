import React, { useContext, useEffect, useState } from 'react'
import type { InputProps, InputNumberProps, RadioProps, SelectProps } from 'antd'
import { Radio, Input, InputNumber, Select } from 'antd'
import Wc from 'winchi'
import { WcFormContext } from './'
import FormTable, { WcFormTableProps } from '@src/Table/FormTable'
import WcUpload from '@src/Upload'
import WcFormList from './List'

const { TextArea } = Input

export type FormType = 'text' | 'textArea' | 'number' | 'select' | 'radio'
  | 'upload' | 'table' | 'list'

export type FormProps = (
  InputProps
  | InputNumberProps
  | RadioProps
  | SelectProps<any>
  | WcFormTableProps
)

const mapFC = {
  text(props: any) {
    return <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Input} />
  },
  textArea(props: any) {
    return <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={TextArea} />
  },
  number(props: any) {
    return <FormComponentWrap {...props} Component={InputNumber} />
  },
  radio(props: any) {
    return <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Radio.Group} />
  },
  select(props: any) {
    return <FormComponentWrap {...props} loading={typeof props.options === 'function'} Component={Select} />
  },
  table(props: any) {
    const { setLoading } = useContext(WcFormContext)
    return (
      <FormComponentWrap
        {...props}
        onLoading={Wc.sep(setLoading, props?.onLoading || Wc.func)}
        Component={FormTable} />
    )
  },
  upload(props: any) {
    return <FormComponentWrap
      {...props}
      Component={WcUpload}
    />
  },
  list(props: any) {
    return <FormComponentWrap
      {...props}
      Component={WcFormList}
    />
  }
}

export const propEventValue = (e?) => e?.target?.value

export const propFormTypeFC: AF = (key: FormType = 'text') => mapFC[key]

export interface FormComponentWrapProps {
  onChange: AF
  wcInitVal: any
  Component: React.ComponentType<AO>
  onChangeComputeValue?: AF
}

const FormComponentWrap: React.FC<FormComponentWrapProps> = ({
  wcInitVal,
  onChange = Wc.func,
  Component,
  onChangeComputeValue,
  ...props
}) => {
  const [value, setValue] = useState<any>()

  useEffect(() => {
    value !== wcInitVal && setValue(wcInitVal)
  }, [wcInitVal])


  const changeHandle = (...rest) => {
    const newV = onChangeComputeValue?.(...rest) ?? rest[0]
    if (newV === value) return
    if (Array.isArray(newV) && Array.isArray(value) && newV.toString() === value.toString()) return

    setValue(newV)
    onChange?.(...[newV, rest.slice(1)])
  }

  return (
    <Component {...props} value={value} onChange={changeHandle} />
  )
}

export default mapFC