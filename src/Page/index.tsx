import React, { useState, useMemo, useEffect } from 'react'
import { Modal } from 'antd'
import Wc, { R } from 'winchi'
import { propDataIndex, processEnum } from '@src/utils'
import { Methods, Columns } from '@src/d'
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
 columns: columns_,
 formProps = Wc.obj,
 modalWidth: modalWidth_,
 methods: methods_ = Wc.obj,
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

 const submitHandle = async (vs) => {
  await (values ? methods_.onEdit?.(vs, values) : methods_.onAdd(values))
  setModalVisible(false)
  setValues(undefined)
 }

 const queryColumnEnum: AF = processEnum(
  (newC, index) => setColumns((old => [
   ...old.slice(0, index),
   newC,
   ...old.slice(index + 1),
  ] as any[])
  )
 )

 const methods = useMemo<Methods>(() => ({
  onClickEdit: methods_.onEdit && ((v) => {
   setModalVisible(true)
   setValues(v)
  }),
  ...methods_,
 }), [methods_])


 useEffect(R.compose(
  Wc.sep(
   arr => arr.forEach(queryColumnEnum),
   setColumns
  ),
  R.map(_forceHideExhibit),
  Wc.uniqueLeft(propDataIndex),
  R.concat(columns_),
  Wc.identify(wcConfig.columns || Wc.arr),
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
  hideDetail: true,
  hideTable: c.tableType === 'handles' && Wc.isEmptyObj(c.handles || Wc.obj) ? true : c.hideTable,
 }
 : c