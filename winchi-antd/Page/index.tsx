import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Modal } from 'antd'
import Wc, { R } from 'winchi'
import { propDataIndex, processEnum, actionLoading, defaultRender } from '../utils'
import { Methods, Columns } from '../d'
import { useWcConfig } from '../hooks'
import WcTable, { WcTableProps } from '../Table'
import WcForm, { WcFormProps, FormRef } from '../Form'

export interface WcPageProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'columns'> {
 columns: WcFormProps<T>['columns']
 formProps?: Omit<WcFormProps<T>, 'columns'>
 modalWidth?: string | number
 eidtValueTransform?(d: T): any
 formRef?: React.RefObject<FormRef | undefined>
 renderTable?(Node: React.ComponentType<any>, props: WcTableProps<T>): React.ReactNode
 renderForm?(Node: React.ComponentType<any>, props: WcFormProps<T>): React.ReactNode
}

type Model = React.FC<WcPageProps>

const WcPage: Model = ({
 columns: columns_,
 modalWidth: modalWidth_,
 eidtValueTransform,
 formRef,
 formProps = Wc.obj,
 methods: methods_ = Wc.obj,
 renderForm = defaultRender,
 renderTable = defaultRender,
 ...props
}) => {
 const { wcConfig } = useWcConfig()
 const [modelVisible, setModalVisible] = useState(false)
 const [columns, setColumns] = useState<Columns[]>([])
 const [values, setValues] = useState<AO>()

 const flatColumns = useMemo(() => columns.flat(), [columns])
 const modalWidth = modalWidth_ ?? useWcConfig().wcConfig.ModalWidth

 const clickAddHandle = methods_.onAdd && (() => {
  setModalVisible(true)
 })

 const methods = useMemo<Methods>(() => ({
  onClickEdit: methods_.onEdit && (async v => {
   setModalVisible(true)
   const editVal = await (eidtValueTransform ? eidtValueTransform(v) : v)
   setValues(editVal)
  }),
  ...Wc.messageComposeMethod(actionLoading, wcConfig.handlesMessage, methods_),
 }), [methods_])

 const updateColumns = useCallback((newC, index) => setColumns((old => [
  ...old.slice(0, index),
  newC,
  ...old.slice(index + 1),
 ] as any[])
 ), [])

 const submitHandle = async (vs) => {
  await (values ? methods.onEdit?.(vs, values) : methods.onAdd?.(vs))
  setModalVisible(false)
  setValues(undefined)
 }

 useEffect(R.compose(
  Wc.sep(
   arr => arr.forEach(processEnum(updateColumns)),
   setColumns
  ),
  R.map(_forceHideExhibit),
  Wc.uniqueLeft(propDataIndex),
  R.concat(columns_),
  Wc.identify(wcConfig.columns),
 ), [columns_, methods, wcConfig.columns])


 const renderTableProps: WcTableProps = {
  onClickAdd: clickAddHandle,
  methods: methods,
  columns: flatColumns,
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