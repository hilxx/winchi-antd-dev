import React, { useState, useMemo } from 'react'
import { Modal } from 'antd'
import Wc from 'winchi'
import { Handles } from '@src/d'
import { useWcConfig } from '@src/hooks'
import WcTable, { WcTableProps } from '../Table'
import WcForm, { WcFormProps } from '../Form'

export interface WcPageProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'columns'> {
 columns: WcFormProps<T>['columns']
 formProps?: Omit<WcFormProps<T>, 'columns'>
 modalWidth?: string | number
}

type Model = React.FC<WcPageProps>

const WcPage: Model = ({
 columns,
 formProps = Wc.obj,
 modalWidth: modalWidth_,
 methods: { onAdd, onEdit, ...methods_ } = Wc.obj,
 ...props
}) => {
 const [modelVisible, setModalVisible] = useState(false)
 const [values, setValues] = useState<AO>()
 const flatColumns = useMemo(() => columns.flat(), [columns])
 const modalWidth = modalWidth_ ?? useWcConfig().wcConfig.ModalWidth

 const clickAddHandle = onAdd && (() => {
  setModalVisible(true)
 })

 const submitHandle = async (vs) => {
  await (values ? onEdit?.(vs, values) : onAdd(values))
  setModalVisible(false)
  setValues(undefined)
 }

 const methods = useMemo<Handles>(() => ({
  onClickEdit: onEdit && ((v) => {
   setModalVisible(true)
   setValues(v)
  }),
  ...methods_,
 }), [methods_, onEdit])

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