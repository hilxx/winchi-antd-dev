import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Modal } from 'antd'
import Wc, { R } from 'winchi'
import { propDataIndex, processEnum, actionLoading } from '@src/utils'
import { Methods, Columns } from '@src/d'
import { useWcConfig } from '@src/hooks'
import WcTable, { WcTableProps } from '../Table'
import WcForm, { WcFormProps, FormRef } from '../Form'

export interface WcPageProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'columns'> {
 columns: WcFormProps<T>['columns']
 formProps?: Omit<WcFormProps<T>, 'columns'>
 modalWidth?: string | number
 eidtValueTransform?(d: T): any
 formRef?: React.RefObject<FormRef | undefined>
}

type Model = React.FC<WcPageProps>

const WcPage: Model = ({
 columns: columns_,
 formProps = Wc.obj,
 modalWidth: modalWidth_,
 methods: methods_ = Wc.obj,
 eidtValueTransform,
 formRef,
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

 return (
  <section>
   <WcTable
    onClickAdd={clickAddHandle}
    columns={flatColumns}
    methods={methods}
    {...props}
   />
   <Modal
    onCancel={() => setModalVisible(false)}
    visible={modelVisible}
    footer={null}
    confirmLoading
    width={modalWidth}
   >
    <WcForm
     formRef={formRef}
     initialValues={values}
     columns={columns}
     onSubmit={submitHandle}
     {...formProps}
    />
   </Modal>
  </section>
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