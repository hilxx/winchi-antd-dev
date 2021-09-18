import React, { useState, useMemo } from 'react'
import { Modal } from 'antd'
import Wc from 'winchi'
import WcTable, { WcTableProps } from '../Table'
import WcForm, { WcFormProps } from '../Form'
import { defaultProps, TableMessageKeys } from '@src/index'

export interface WcPageProps<T extends AO = AO> extends Omit<WcTableProps<T>, 'columns'> {
 columns: WcFormProps<T>['columns']
 formProps?: Omit<WcFormProps<T>, 'columns'>
 modalWidth?: string | number
}

type Model = React.FC<WcPageProps>

const WcPage: Model = ({
 columns,
 formProps = Wc.obj,
 modalWidth = defaultProps.ModalWidth.form,
 handles: { onAdd, onEdit, ...handles_ } = Wc.obj,
 ...props
}) => {
 const [modelVisible, setModalVisible] = useState(false)
 const [values, setValues] = useState<AO>()
 const flatColumns = useMemo(() => columns.flat(), [columns])

 const clickAddHandle = onAdd && (() => {
  setModalVisible(true)
 })

 const submitHandle = async (vs) => {
  await (values ? onEdit?.(vs, values) : onAdd(values))
  setModalVisible(false)
  setValues(undefined)
 }

 const handles = useMemo<Partial<Record<TableMessageKeys, AF>>>(() => ({
  onClickEdit: onEdit && ((v) => {
   setModalVisible(true)
   setValues(v)
  }),
  ...handles_,
 }), [handles_, onEdit])

 return (
  <section>
   <WcTable
    onClickAdd={clickAddHandle}
    columns={flatColumns}
    handles={handles}
    {...props}
   />
   <Modal
    onCancel={() => setModalVisible(false)}
    visible={modelVisible}
    footer={null}
    confirmLoading
    width={modalWidth}
   // destroyOnClose
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