import React, { useContext, useEffect, useMemo, useState } from 'react'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Space } from 'antd'
import Wc, { R } from 'winchi'
import { useWcConfig } from '@src/hooks'
import type { Columns, ColumnFormListProps } from '@src/d'
import ResolveChidren, { WcResolveChidrenProps } from '../ResolveChidren'
import { filterFormColumns, WcFormContext } from '../'
import { processEnum } from '@src/utils'
import styles from './index.less'

export interface WcFormListProps<T extends AO = AO> extends Columns<T>, Omit<WcResolveChidrenProps, 'enum'> {
 addFiledName?: string
}

type Model = React.FC<WcFormListProps>

const FormList: Model = ({
 className = '',
 formListProps: formListProps_ = Wc.obj,
 dataIndex,
 hide,
 wcInitVal,
 addFiledName,
 title,
}) => {
 const { wcConfig } = useWcConfig()
 const { onValueChange } = useContext(WcFormContext)
 const [formValues, setFormValues] = useState(Wc.obj)
 const { columns_, width, ...formListProps } = useMemo(() => {
  const { columns, width, ...formListProps } = formListProps_ as ColumnFormListProps
  return {
   columns_: columns,
   width,
   formListProps,
  }
 }, [formListProps_])

 const [columns, setColumns] = useState<Columns[]>(columns_)

 const queryColumnEnum = processEnum((c, index) => {
  setColumns([
   ...columns.slice(0, index),
   c,
   ...columns.slice(index + 1)
  ])
 })

 useEffect(R.compose(
  () => onValueChange(dataIndex, setFormValues),
  R.addIndex(R.forEach)(queryColumnEnum),
  filterFormColumns,
  Wc.identify(columns_),
 ), [columns_, dataIndex])

 return (
  <div className={`${styles.list} ${className}`} style={{ width }}>
   <div className='ant-form-item-label'>
    <label htmlFor={`${dataIndex}`}>{title}</label>
   </div>
   <main>
    <Form.List
     name={`${dataIndex}`}
     {...formListProps}
     initialValue={wcInitVal}
    >
     {(fields, { add, remove }) => (
      <>
       {fields.map((filed, index) => (
        <Space key={filed.key} className={styles.space} align='center'>
         {
          columns?.map(c => (
           <ResolveChidren
            hide={typeof c.hideForm === 'function' ? c.hideForm(formValues, index) : c.hideForm}
            key={`${c.dataIndex}`}
            {
            ...{ ...c, dataIndex: [filed.name, c.dataIndex] }
            }
            formItemProps={{ width: '100%', ...c.formItemProps || {}, ...filed, }}
            wcInitVal={wcInitVal?.[index]?.[c.dataIndex as any]}
           />
          ))
         }
         <MinusCircleOutlined onClick={() => remove(filed.name)} />
        </Space>
       ))}
       <Form.Item>
        <Button className={styles.add} hidden={hide} type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
         {addFiledName || wcConfig.alias.add}
        </Button>
       </Form.Item>
      </>
     )
     }
    </Form.List>
   </main>
  </div>
 )
}

export default React.memo<Model>(FormList)