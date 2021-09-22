import React from 'react'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Space } from 'antd'
import Wc from 'winchi'
import type { Columns, ColumnFormListProps } from '@src/d'
import ResolveChidren, { WcResolveChidrenProps } from '../ResolveChidren'

export type WcFormListProps<T extends AO = AO> = Columns<T> & WcResolveChidrenProps

type Model = React.FC<WcFormListProps>

const FormList: Model = ({
 formListProps: formListProps_ = Wc.obj,
 dataIndex,
 hide,
 wcInitVal,
}) => {
 const { columns, ...formListProps } = formListProps_ as ColumnFormListProps

 return (
  <Form.List
   name={`${dataIndex}`}
   {...formListProps}
  >
   {(fields, { add, remove }) => (
    <>
     {fields.map(filed => (
      <Space key={filed.key}>
       {
        columns?.map(c => (
         <ResolveChidren
          hide={false}
          key={`${c.dataIndex}`}
          {...c}
          formItemProps={{ ...c.formItemProps || {}, ...filed }}
          wcInitVal={wcInitVal}
         />
        ))
       }
       <MinusCircleOutlined onClick={() => remove(filed.name)} />
      </Space>
     ))}
     <Form.Item>
      <Button hidden={hide} type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
       Add field
      </Button>
     </Form.Item>
    </>
   )}
  </Form.List>
 )
}

export default React.memo<Model>(FormList)