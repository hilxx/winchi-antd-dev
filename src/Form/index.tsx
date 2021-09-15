import { Columns } from '@src/Page/data'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { InputProps, FormInstance } from 'antd'
import { Form, Input, Button } from 'antd'
import Wc, { R } from 'winchi'
import { defaultProps } from '@src/index'
import { FormType } from '@src/Page/data'
import styles from './index.less'

export type FormProps = (
 InputProps
) & {
 defaultValue?: any
}

export interface WcFormProps<T extends AO = AO> {
 defaultValues?: T
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

const WcForm: Model = ({
 columns: columns_,
 steps,
 defaultValues,
 onSubmit,
}) => {
 const [submitLoading, setSubmitLoading] = useState(false)
 const [currentStep, setCurrentStep] = useState(0)
 const formRef = useRef<FormInstance>(null)
 const columns = useMemo<Columns[][]>(
  R.compose(
   R.filter(R.compose(
    Wc.propLength,
    _filterColumns,
   )) as AF,
   Wc.identify(columns_[0] && !Array.isArray(columns_[0]) ? [columns_] : columns_),
  ), [columns_])
 const stepMaxNum = columns.length - 1

 useEffect(() => {
  setCurrentStep(0)
 }, [defaultValues])

 const submitHandle = async () => {
  try {
   setSubmitLoading(true)
   await formRef.current?.validateFields()
   const values = formRef.current?.getFieldsValue()
   await onSubmit?.(values, defaultValues)
  } catch (err) {
   console.error(`form submiting`, err)
  }
  setSubmitLoading(false)
 }

 const clickNextHandle = R.ifElse(
  R.gte(stepMaxNum),
  setCurrentStep,
  submitHandle,
 )

 const formItemJSX = columns.map((cc, index) => {
  const isHide = currentStep !== index
  const propDefaultValues = (key?) => defaultValues?.[key]

  return cc
   .map(c => (
    <Form.Item
     key={`${c.dataIndex}`}
     name={`${c.dataIndex}`}
     label={c.title}
     style={{ ...c.formProps?.style || {}, display: isHide ? 'none' : undefined }}
    >
     {_propMapJSX(c.formType)({
      defaultValue: propDefaultValues(c.dataIndex),
     })}
    </Form.Item>
   ))
 })

 const footerJSX = (
  <footer className={styles.footer}>
   {
    stepMaxNum && currentStep
     ? <Button disabled={submitLoading} onClick={() => setCurrentStep(currentStep - 1)}>{defaultProps.Alias.lastStep}</Button>
     : null
   }
   <Button
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
   <Form ref={formRef}>
    {formItemJSX}
   </Form>

   {footerJSX}
  </section>
 )
}

const _mapJSX: Record<FormType, (props: FormProps) => React.ReactNode> = {
 text(props) {
  return <Input {...props} />
 },
}

const _propMapJSX: AF = (key = 'text') => _mapJSX[key]

const _filterColumns: AF = R.filter((c: Columns) =>
 !c.hideForm && c.dataIndex != undefined && _propMapJSX(c.formType)
)



export default React.memo<Model>(WcForm)