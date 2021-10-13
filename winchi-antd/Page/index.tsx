import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Modal } from 'antd'
import Wc, { R } from 'winchi'
import { propDataIndex, processEnum, actionLoading, defaultRender } from '../utils'
import { Methods, Columns } from '../d'
import { useWcConfig } from '../hooks'
import WcTable, { WcTableProps } from '../Table'
import WcForm, { WcFormProps, FormRef } from '../Form'

export interface WcPageProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'columns' | 'composeRequest'> {
 columns: WcFormProps<T>['columns']
 publicColumns?: WcFormProps<T>['columns']
 modalWidth?: string | number
 /**
  * @description 点击编辑转换为Form可以理解的值
   */
 clickEditTransformValue?(d: T): AO
 formProps?: Omit<WcFormProps<T>, 'columns'>
 formRef?: React.RefObject<FormRef | undefined>
 renderTable?(Node: React.ComponentType<any>, props: WcTableProps<T>): React.ReactNode
 renderForm?(Node: React.ComponentType<any>, props: WcFormProps<T>): React.ReactNode
 composeRequest?(params: AO, f: AF, oldParams?: AO): any
}

type Model = React.FC<WcPageProps>

const WcPage: Model = ({
 columns: columns__,
 publicColumns: publicColumns_ = Wc.arr,
 modalWidth = 600,
 formRef,
 clickEditTransformValue,
 formProps = Wc.obj,
 methods: methods_ = Wc.obj,
 renderForm = defaultRender,
 renderTable = defaultRender,
 composeRequest,
 ...props
}) => {
 const { wcConfig } = useWcConfig()
 const [modelVisible, setModalVisible] = useState(false)
 const [columns, setColumns] = useState<WcFormProps['columns']>(Wc.arr)
 const [values, setValues] = useState<AO>()

 const columns_ = _defaultDoubleArr(columns__)
 const publicColumns = _defaultDoubleArr(publicColumns_)

 const flatColumns = useMemo(() => columns.flat(), [columns])

 const updateColumns = useCallback((newC, index) => setColumns((old => [
  ...old.slice(0, index),
  newC,
  ...old.slice(index + 1),
 ] as any[])
 ), [])

 const methods = useMemo<Methods>(() => ({
  onClickEdit: methods_.onEdit && (async v => {
   setModalVisible(true)
   setValues(clickEditTransformValue?.(v) ?? v)
  }),
  ...Wc.messageComposeMethod(actionLoading, wcConfig.handlesMessage, methods_),
 }), [methods_])

 /** 处理 columns[] */
 const processColumns: AF = R.compose(
  R.tap(R.forEach(processEnum(updateColumns))),
  Wc.uniqueLeft(propDataIndex),
  _forceHideExhibit,
 )

 useEffect(R.compose(
  setColumns,
  R.map(processColumns),
  Wc.mergeArrayWith(
   Wc.func,
   columns_,
  ),
  Wc.identify(publicColumns),
 ), [flatColumns, methods, publicColumns])

 const clickAddHandle = methods_.onAdd && (() => {
  setModalVisible(true)
 })

 const submitHandle = async (vs) => {
  await (values ? methods.onEdit?.(vs, values) : methods.onAdd?.(vs))
  setModalVisible(false)
  setValues(undefined)
 }

 const renderTableProps: WcTableProps = {
  onClickAdd: clickAddHandle,
  methods: methods,
  columns: flatColumns,
  composeRequest: composeRequest
   ? (params, fn) => composeRequest(params, fn, values)
   : undefined,
  ...props,
 }

 const renderFormProps: WcFormProps = {
  formRef: formRef,
  initialValues: values,
  columns: columns,
  onSubmit: submitHandle,
  ...formProps,
 }

 return (
  <>
   {renderTable(WcTable, renderTableProps)}
   <Modal
    onCancel={() => setModalVisible(false)}
    visible={modelVisible}
    footer={null}
    confirmLoading
    width={modalWidth}
   >
    {renderForm(WcForm, renderFormProps)}
   </Modal>
  </>
 )
}

export default React.memo<Model>(WcPage)

/** 
 * @description ${dataIndex}@开头，除了table隐藏显示
 */
const _forceHideExhibit = (c: Columns): Columns => `${propDataIndex(c)}`.startsWith('@')
 ? {
  ...c,
  hideForm: true,
  hideTable: c.tableType === 'handles' && Wc.isEmptyObj(c.handles || Wc.obj) ? true : c.hideTable,
 }
 : c

/**
 * @returns 二维数组
  */
export const _defaultDoubleArr = (arr: any[]) => arr[0] && Array.isArray(arr[0]) ? arr : [arr]