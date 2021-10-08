import React, { createContext, useEffect, useMemo, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import { Form, Button, Steps, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import { Columns, Alias } from '@src/d'
import { useWcConfig } from '@src/hooks'
import { propFormType } from './formType'
import ResolveChidren from './ResolveChidren'
import styles from './index.less'
import { sortColumns, naughtyHideForm } from '@src/utils'

export interface FormRef extends FormInstance {
  toggleSubmitLoading(b: boolean): any
  reset(): any
  setValues(values: AO): any
}

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
  onSubmit?(data: T, defaultData?: T): any
  onReset?(): any
  formRef?: React.RefObject<FormRef | undefined> | React.RefObject<FormRef | undefined>[]
  alias?: Alias
}

export interface WcFormContextValue {
  setLoading: AF
  onValueChange(dataIndex: any, f: AF): any
}

type Model = React.FC<WcFormProps>

export const WcFormContext = createContext<WcFormContextValue>({
  setLoading: Wc.func,
  onValueChange: Wc.func,
})

export const filterFormColumns: AF = R.filter((c: Columns) =>
  c.hideForm !== true && c.dataIndex != undefined && propFormType(c.formType)
)

const WcForm: Model = ({
  columns: columns_ = Wc.arr,
  steps: steps_,
  initialValues: initialValues_,
  onSubmit,
  className = '',
  formRef: formRef_ = {},
  alias: alias_ = Wc.obj,
  onReset = Wc.func,
  ...props
}) => {
  const { wcConfig } = useWcConfig()
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState(Wc.arr)
  const [currentStep, setCurrentStep] = useState(0)
  const [initialValues, setInitialValues] = useState(Wc.obj)

  const formChangeDispatchMap = useMemo(() => new Map(), [])
  const flatColumns = useMemo(() => columns.flat(), [columns])
  const formRef = useRef<FormRef>(null)
  const alias = new Proxy(alias_, {
    get(target, key) {
      return Reflect.get(Reflect.has(target, key) ? target : wcConfig.alias, key)
    }
  })

  useEffect(R.compose(
    setColumns,
    R.map(R.compose(
      sortColumns,
      naughtyHideForm(R.__, formRef.current?.getFieldsValue() || initialValues),
    )),
    R.filter(Wc.propLength) as AF,
    R.map(filterFormColumns),
    Wc.identify(columns_[0] && !Array.isArray(columns_[0]) ? [columns_] : columns_),
  ), [columns_])

  useEffect(() => {
    const action: Partial<FormRef> = {
      ...formRef.current,
      toggleSubmitLoading(bool) {
        setLoading(bool)
      },
      reset() {
        setCurrentStep(0)
        setInitialValues(Object.values(flatColumns).reduce((r, c) =>
          c.formType === 'list' ? { ...r, [c.dataIndex as any]: Wc.arr } : r, {}))
      },
      setValues: setInitialValues,
    }

    const formRefArr = (Array.isArray(formRef_) ? formRef_ : [formRef_]).concat(formRef)
    formRefArr.forEach(actRef => (actRef as any).current = action)
  })

  useEffect(() => {
    initialValues_ && setInitialValues(
      flatColumns.reduce((r, c) => c.initialValue ? {
        ...r,
        [c.dataIndex as any]: c.initialValue
      } : r, initialValues_)
    )
  }, [flatColumns, initialValues_])

  useEffect(() => {
    formRef.current?.setFieldsValue(initialValues)
    initialValues !== Wc.obj && formValueDispatch(initialValues)
  }, [initialValues])

  const steps = useMemo(() => steps_?.slice(0, columns.length), [steps_, columns])

  const stepMaxNum = columns.length - 1

  const propInitialValues: AF = R.prop(R.__, initialValues)

  const checkValidata = () =>
    formRef.current?.validateFields(columns[currentStep]?.map(R.prop('dataIndex') as AF))

  const formChangeDispatch = d => Array.from(formChangeDispatchMap.values()).forEach(f => f?.(d))

  const submitBefore = Wc.asyncCompose(
    checkValidata,
    () => setLoading(true),
  )

  const submitHandle = Wc.asyncCompose(
    async () => {
      const vs = formRef.current?.getFieldsValue()
      await onSubmit?.(vs, initialValues)
    },
    submitBefore,
  ).catch((err) => {
    console.log(`form submiting`, err)
  }).finally(() => {
    setLoading(false)
  })

  const clickNextHandle = Wc.asyncCompose(
    () => currentStep + 1 < stepMaxNum ? setCurrentStep(currentStep + 1) : submitHandle(),
    checkValidata,
  )

  const clickResetHandle = () => {
    formRef.current?.reset()
    onReset()
  }

  const formSubmitCatureHandle = e => {
    e.nativeEvent.preventDefault()
    clickNextHandle()
  }

  const formValueDispatch = R.compose(
    Wc.debounce(100, R.compose(setColumns, Wc.setArr(columns, currentStep))),
    naughtyHideForm(columns[currentStep]),
    R.tap(Wc.debounce(100, formChangeDispatch)),
  )

  const formItemJSX = columns.map((cc, index) =>
    cc.map(c =>
      <ResolveChidren
        key={`${c.dataIndex}`}
        {...c}
        hide={index !== currentStep}
        wcInitVal={propInitialValues(c.dataIndex)}
        initialValues={initialValues}
      />
    ))

  const footerJSX = columns[currentStep]?.length ? (
    <footer className={styles.footer}>
      <Button size={wcConfig.size} onClick={clickResetHandle}>
        {alias.reset}
      </Button>
      <section>
        {
          stepMaxNum && currentStep
            ? <Button
              size={wcConfig.size}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              {alias.lastStep}
            </Button>
            : null
        }
        <Button
          size={wcConfig.size}
          loading={currentStep + 1 === columns?.length && loading}
          onClick={clickNextHandle}
          type='primary'
        >
          {currentStep === stepMaxNum ? alias.submit : alias.nextStep}
        </Button>
      </section>
    </footer>
  ) : null

  return (
    <WcFormContext.Provider value={{
      setLoading,
      onValueChange(dataIndex, f) {
        formChangeDispatchMap.set(dataIndex, f)
      }
    }}>
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
        <Form
          initialValues={initialValues}
          ref={formRef}
          className={styles.form}
          onValuesChange={R.flip(formValueDispatch)}
          onSubmitCapture={formSubmitCatureHandle}
        >
          {formItemJSX}
          <button type='submit' style={{ display: 'none' }} />
        </Form>
        {footerJSX}
      </main>
    </WcFormContext.Provider >
  )
}

export default React.memo<Model>(WcForm)

export * from './formType'
export * from './List'
export * from './Item'

