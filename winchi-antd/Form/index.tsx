import React, { createContext, useEffect, useMemo, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import { Form, Button, Steps, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import type { Columns, Alias } from '../d'
import { useWcConfig } from '../hooks'
import { propFormType } from './formType'
import ResolveChidren from './ResolveChidren'
import styles from './index.less'
import { sortColumns, naughtyHideForm } from '../utils'

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
  columns: Columns<T>[] | Columns<T>[][]
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

export const filterFormColumns: AF = R.compose(
  R.filter((c: Columns) =>
    c.hideForm !== true && c.dataIndex != undefined && propFormType(c.formType) !== undefined
  ) as AF,
  Wc.uniqueLeft(R.prop('dataIndex')),
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
  const flatColumns = useMemo<Columns[]>(() => columns.flat(), [columns])
  const formRef = useRef<FormRef>(null)
  const alias = new Proxy(alias_, {
    get(target, key) {
      return Reflect.get(Reflect.has(target, key) ? target : wcConfig.alias, key)
    }
  })

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
    // eslint-disable-next-line no-return-assign
    formRefArr.forEach(actRef => (actRef as any).current = action)
  })

  /* process columns */
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
    const newInitV = flatColumns.reduce((r, c) => c.initialValue ? {
      ...r,
      [c.dataIndex as any]: c.initialValue
    } : r, initialValues_ || {})

    JSON.stringify(newInitV) !== JSON.stringify(initialValues) && setInitialValues(newInitV)
  }, [flatColumns])

  useEffect(() => {
    formRef.current?.setFieldsValue(initialValues)
    initialValues !== Wc.obj && formValueDispatch(initialValues)
  }, [initialValues])

  const steps = useMemo(() => steps_?.slice(0, columns.length), [steps_, columns])

  const stepMaxNum = columns.length

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
      const vs = flatColumns.reduce((r, c) => {
        const key = c.dataIndex as any
        if (Reflect.has(c, key) && typeof c.formResult === 'function')
          r[key] = c.formResult(r[key])

        c.formResult === false && Reflect.deleteProperty(r, key)
        return r
      }, formRef.current?.getFieldsValue())
      await onSubmit?.(vs, initialValues)
    },
    submitBefore,
  ).catch((err) => {
    console.log(`form submiting`, err)
  }).finally(() => {
    setLoading(false)
  })

  const clickNextHandle = Wc.asyncCompose(
    () => currentStep < stepMaxNum ? setCurrentStep(currentStep + 1) : submitHandle(),
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
        <Divider className={styles.divider} dashed />
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
        <Divider className={styles.divider} dashed />
        {footerJSX}
      </main>
    </WcFormContext.Provider >
  )
}

export default React.memo<Model>(WcForm)


