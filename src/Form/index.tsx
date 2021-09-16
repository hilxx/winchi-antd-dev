import { Columns } from '@src/Page/data'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { InputProps, FormInstance, InputNumberProps, RadioProps, SelectProps } from 'antd'
import { Radio, Form, Input, Button, InputNumber, Select } from 'antd'
import Wc, { R } from 'winchi'
import { AppContext } from '@src/App'
import { defaultProps } from '@src/index'
import { FormType } from '@src/Page/data'
import styles from './index.less'

export type FormProps = (
 InputProps
 | InputNumberProps
 | RadioProps
 | SelectProps<any>
)

export interface WcFormProps<T extends AO = AO> {
 initialValues?: T
 /** 
 * @description 二维数组，第一项为分布表单的第一页
  */
 columns: Columns[] | Columns[][]
 /** 
  * @description 分布表单步骤标题
   */
 steps?: string[]
 onSubmit?(data: T, defaultData?: T): Promise<any>
}

type Model = React.FC<WcFormProps>

const _keySymbol = Symbol('key')

const WcForm: Model = ({
 columns: columns_ = Wc.arr,
 steps,
 initialValues: initialValues_ = Wc.obj,
 onSubmit,
}) => {
 const { appConfig } = useContext(AppContext)
 /** 给非表单组件记录值（不提供默认值）。它的优先级高于formRef.current.getFieldsValue */
 const [values, setValues] = useState<AO>({})
 const [submitLoading, setSubmitLoading] = useState(false)
 const [currentStep, setCurrentStep] = useState(0)
 const formRef = useRef<FormInstance>(null)

 const columns = useMemo<Columns[][]>(
  R.compose(
   R.filter(Wc.propLength) as AF,
   R.map(_filterColumns),
   Wc.identify(columns_[0] && !Array.isArray(columns_[0]) ? [columns_] : columns_),
  ), [columns_])

 const initialValues = useMemo(() => columns.flat().reduce((r, c) =>
  c.formItemProps?.initialValue ? {
   ...r,
   [`${c.dataIndex}`]: c.formItemProps.initialValue
  } : r, initialValues_), [columns, initialValues_])

 const stepMaxNum = columns.length - 1

 useEffect(() => {
  formRef.current?.resetFields()
 }, [initialValues])

 const submitHandle = async () => {
  try {
   setSubmitLoading(true)
   await formRef.current?.validateFields()
   const vs = {
    ...formRef.current?.getFieldsValue(),
    ...values,
   }
   await onSubmit?.(vs, initialValues)
  } catch (err) {
   console.error(`form submiting`, err)
  }
  setSubmitLoading(false)
 }

 const clickNextHandle = index => Wc.asyncCompose(
  R.ifElse(
   R.gte(stepMaxNum),
   setCurrentStep,
   submitHandle,
  ),
  Wc.identify(index),
  formRef?.current?.validateFields,
 )()

 const formItemJSX = columns.map((cc, index) => {
  const isHide = currentStep !== index
  const propinitialValues: AF = R.prop(R.__, initialValues)

  return cc
   .map(({
    dataIndex,
    title,
    formType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formItemProps: { initialValue, width, className = '', ...formItemProps } = {},
    formProps = {},
    ...columns
   }) => (
    <Form.Item
     key={`${dataIndex}`}
     className={`${styles['form-item']} ${className}`}
     {...formItemProps}
     name={`${dataIndex}`}
     label={title}
     style={{
      width,
      ...formItemProps.style || {},
      display: isHide ? 'none' : undefined
     }}
    >
     {_propMapJSX(formType)({
      size: appConfig.size,
      options: columns.enum,
      [_keySymbol]: propinitialValues(dataIndex),
      ...formProps,
     })}
    </Form.Item>
   )
   )
 })

 const footerJSX = (
  <footer className={styles.footer}>
   {
    stepMaxNum && currentStep
     ? <Button
      size={appConfig.size}
      disabled={submitLoading}
      onClick={() => setCurrentStep(currentStep - 1)}
     >
      {defaultProps.Alias.lastStep}
     </Button>
     : null
   }
   <Button
    size={appConfig.size}
    loading={submitLoading}
    onClick={() => clickNextHandle(currentStep + 1)}
   >
    {currentStep === stepMaxNum ? defaultProps.Alias.submit : defaultProps.Alias.nextStep}
   </Button>
  </footer>
 )

 return (
  <section>
   {steps ? <h2 className={styles.title}>{steps[currentStep] || steps[0]}</h2> : null}
   <Form initialValues={initialValues} ref={formRef} className={styles.form}>
    {formItemJSX}
   </Form>
   {footerJSX}
  </section>
 )
}

const _mapJSX: Record<FormType, (props: FormProps) => React.ReactNode> = {
 text(props: any) {
  return <Input {...props} />
 },
 number(props: any) {
  return <InputNumber {...props} />
 },
 radio(props: any) {
  return <Radio {...props} />
 },
 select(props: any) {
  return <Select {...props} />
 },
 table(props) {
  console.log('table props ', props)
  return <div></div>
 }
}

const _propMapJSX: AF = (key = 'text') => _mapJSX[key]

const _filterColumns: AF = R.filter((c: Columns) =>
 !c.hideForm && c.dataIndex != undefined && _propMapJSX(c.formType)
)

export default React.memo<Model>(WcForm)

