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
  return <FormComponentWrap {...props} getValue={propEventValue} Component={Input} />
 },
 textArea(props: any) {
  return <FormComponentWrap {...props} getValue={propEventValue} Component={TextArea} />
 },
 number(props: any) {
  return <FormComponentWrap {...props} Componeynt={InputNumber} />
 },
 radio(props: any) {
  return <FormComponentWrap {...props} Component={Radio} />
 },
 select(props: any) {
  return <FormComponentWrap {...props} Component={Select} />
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

const FormComponentWrap: React.FC<{ onChange: AF, wcInitVal: any, getValue?: AF, Component: React.ComponentType<AO> }> = ({
 wcInitVal,
 onChange = Wc.func,
 Component,
 getValue,
 ...props
}) => {
 const [value, setValue] = useState<any>()

 useEffect(() => {
  wcInitVal != undefined && value !== wcInitVal && setValue(wcInitVal)
 }, [wcInitVal])

 const changeHandle = (...rest) => {
  const newV = getValue?.(...rest) ?? rest[0]
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