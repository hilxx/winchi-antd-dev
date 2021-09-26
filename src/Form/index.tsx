import React, { createContext, useEffect, useMemo, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import { Form, Button, Steps, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import { Columns } from '@src/d'
import { useWcConfig } from '@src/hooks'
import { propFormTypeFC } from './formType'
import ResolveChidren from './ResolveChidren'

import styles from './index.less'

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

export const WcFormContext = createContext({
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
 const { wcConfig } = useWcConfig()
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
  c.initialValue ? {
   ...r,
   [`${c.dataIndex}`]: c.initialValue
  } : r, initialValues_), [columns, initialValues_])

 const stepMaxNum = columns.length - 1

 const propInitialValues: AF = R.prop(R.__, initialValues)

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
  cc.map(c =>
   <ResolveChidren
    key={`${c.dataIndex}`}
    {...c}
    hide={index !== currentStep}
    wcInitVal={propInitialValues(c.dataIndex)}
   />
  ))

 const footerJSX = (
  <footer className={styles.footer}>
   {
    stepMaxNum && currentStep
     ? <Button
      size={wcConfig.size}
      onClick={() => setCurrentStep(currentStep - 1)}
     >
      {wcConfig.alias.lastStep}
     </Button>
     : null
   }
   <Button
    size={wcConfig.size}
    loading={currentStep + 1 === columns?.length && loading}
    onClick={() => clickNextHandle(currentStep + 1)}
   >
    {currentStep === stepMaxNum ? wcConfig.alias.submit : wcConfig.alias.nextStep}
   </Button>
  </footer>
 )

 return (
  <WcFormContext.Provider value={{ setLoading }}>
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
  </WcFormContext.Provider>
 )
}


const _filterColumns: AF = R.filter((c: Columns) =>
 !c.hideForm && c.dataIndex != undefined && propFormTypeFC(c.formType)
)

export default React.memo<Model>(WcForm)

export * from './formType'
export * from './List'
export * from './Item'

