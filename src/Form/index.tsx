import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { InputProps, FormInstance, InputNumberProps, RadioProps, SelectProps } from 'antd'
import { Radio, Form, Input, Button, InputNumber, Select, Steps, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import { Columns } from '@src/Page/data'
import { AppContext } from '@src/App'
import { defaultProps } from '@src/index'
import { FormType } from '@src/Page/data'
import FormTable, { WcFormTableProps } from '@src/Table/FormTable'
import WcUplopd from '@src/Upload'
import styles from './index.less'

const { TextArea } = Input

export type FormProps = (
 InputProps
 | InputNumberProps
 | RadioProps
 | SelectProps<any>
 | WcFormTableProps
)

export interface WcFormProps<T extends AO = AO>
 extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, 'onSubmit'> {
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

const Context = createContext({
 setLoading: Wc.func as AF
})

const WcForm: Model = ({
 columns: columns_ = Wc.arr,
 steps: steps_,
 initialValues: initialValues_ = Wc.obj,
 onSubmit,
 className = '',
 ...props
}) => {
 const { appConfig } = useContext(AppContext)
 const [loading, setLoading] = useState(false)
 const [currentStep, setCurrentStep] = useState(0)
 const formRef = useRef<FormInstance>(null)

 useEffect(() => {
  setCurrentStep(0)
 }, [initialValues_])

 const columns = useMemo<Columns[][]>(
  R.compose(
   R.filter(Wc.propLength) as AF,
   R.map(_filterColumns),
   Wc.identify(columns_[0] && !Array.isArray(columns_[0]) ? [columns_] : columns_),
  ), [columns_])
 const steps = useMemo(() => steps_?.slice(0, columns.length), [steps_, columns])

 const initialValues = useMemo(() => columns.flat().reduce((r, c) =>
  c.formItemProps?.initialValue ? {
   ...r,
   [`${c.dataIndex}`]: c.formItemProps.initialValue
  } : r, initialValues_), [columns, initialValues_])

 const stepMaxNum = columns.length - 1

 const checkValidata = () =>
  formRef.current?.validateFields(columns[currentStep]?.map(R.prop('dataIndex') as AF))

 const submitHandle = async () => {
  try {
   setLoading(true)
   await checkValidata()
   const vs = formRef.current?.getFieldsValue()
   await onSubmit?.(vs, initialValues)
   setCurrentStep(0)
  } catch (err) {
   console.error(`form submiting`, err)
  }
  setLoading(false)
 }

 const clickNextHandle = index => Wc.asyncCompose(
  R.ifElse(
   R.gte(stepMaxNum),
   setCurrentStep,
   submitHandle,
  ),
  Wc.identify(index),
  checkValidata,
 )()

 const formItemJSX = columns.map((cc, index) =>
  cc.map(({
   dataIndex,
   title,
   formType,
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   formItemProps: { initialValue, width, className = '', ...formItemProps } = {},
   formProps = {},
   ...columns
  }) => {
   const C = _propMapJSX(formType)
   const isHide = currentStep !== index

   return (
    <Form.Item
     key={`${dataIndex}`}
     className={`${styles['form-item']} ${className}`}
     {...formItemProps}
     name={`${dataIndex}`}
     label={title}
     style={{
      width,
      ...formItemProps.style || {},
      display: isHide ? 'none' : formProps?.style?.display
     }}
    >
     <C
      size={appConfig.size}
      options={columns.enum}
      wcInitVal={initialValues[`${dataIndex}`]}
      {...formProps}
      style={{ width: formProps.width, ...formProps.style || {} }}
     />
    </Form.Item>
   )
  })
 )

 const footerJSX = (
  <footer className={styles.footer}>
   {
    stepMaxNum && currentStep
     ? <Button
      size={appConfig.size}
      onClick={() => setCurrentStep(currentStep - 1)}
     >
      {defaultProps.Alias.lastStep}
     </Button>
     : null
   }
   <Button
    size={appConfig.size}
    loading={currentStep + 1 === columns?.length && loading}
    onClick={() => clickNextHandle(currentStep + 1)}
   >
    {currentStep === stepMaxNum ? defaultProps.Alias.submit : defaultProps.Alias.nextStep}
   </Button>
  </footer>
 )

 return (
  <Context.Provider value={{ setLoading }}>
   <main {...props} className={`${styles.wrap} ${className}`} >
    {
     steps
      ? (
       <Steps>
        {steps.map((s, index) => (
         <Steps.Step key={s} title={s} icon={index === currentStep && loading ? <LoadingOutlined /> : undefined} />
        ))}
       </Steps>
      )
      : null
    }
    <Divider dashed />
    <Form initialValues={initialValues} ref={formRef} className={styles.form}>
     {formItemJSX}
    </Form>
    {footerJSX}
   </main>
  </Context.Provider>
 )
}

const _propsEventValues = (e?) => e?.target?.value

const _mapJSX: Record<FormType, (props: FormProps) => React.ReactNode> = {
 text(props: any) {
  return <FormComponentWrap {...props} getValue={_propsEventValues} Component={Input} />
 },
 textArea(props: any) {
  return <FormComponentWrap {...props} getValue={_propsEventValues} Component={TextArea} />
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
  const { setLoading } = useContext(Context)
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
   Component={WcUplopd}
  />
 }
}

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

const _propMapJSX: AF = (key = 'text') => _mapJSX[key]

const _filterColumns: AF = R.filter((c: Columns) =>
 !c.hideForm && c.dataIndex != undefined && _propMapJSX(c.formType)
)

export default React.memo<Model>(WcForm)

