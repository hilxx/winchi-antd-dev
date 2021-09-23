import React from 'react'
import Wc from 'winchi'
import { Form } from 'antd'
import type { Columns } from '@src/d'
import { useWcConfig } from '@src/hooks'
import styles from './index.less'
import { propFormTypeFC } from '..'
import { WcResolveChidrenProps } from '../ResolveChidren'

export type WcFormItemProps<T extends AO = AO> = Columns<T> & WcResolveChidrenProps

type Model = React.FC<WcFormItemProps>

const WcFormItem: Model = ({
 dataIndex,
 title,
 formType,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 formItemProps: { width, className = '', style = Wc.obj, ...formItemProps } = Wc.obj,
 formProps = {},
 hide,
 wcInitVal,
}) => {
 const { wcConfig } = useWcConfig()
 const C = propFormTypeFC(formType)

 return (
  <Form.Item
   key={`${dataIndex}`}
   className={`${styles['form-item']} ${className}`}
   {...formItemProps}
   name={`${dataIndex}`}
   label={title}
   style={{
    width,
    ...style,
    display: hide ? 'none' : style?.display
   }}
  >
   <C
    size={wcConfig.size}
    wcInitVal={wcInitVal ?? formItemProps.initialValue}
    dataIndex={dataIndex}
    {...formProps}
    style={{ width: formProps.width, ...formProps.style || {} }}
   />
  </Form.Item>
 )
}

export default React.memo<Model>(WcFormItem)