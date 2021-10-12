import React from 'react'
import Wc from 'winchi'
import { Form } from 'antd'
import type { Columns } from '../../d'
import { useWcConfig } from '../../hooks'
import styles from './index.less'
import { propFormType } from '../formType'
import { WcResolveChidrenProps } from '../ResolveChidren'

export type WcFormItemProps<T extends AO = AO> = Columns<T> & WcResolveChidrenProps

type Model = React.FC<WcFormItemProps>

const WcFormItem: Model = ({
 dataIndex,
 title,
 formType,
 formItemProps: { width, className = '', style = Wc.obj, ...formItemProps } = Wc.obj,
 formProps = {},
 hide,
 wcInitVal,
 initialValues,
}) => {
 const { wcConfig } = useWcConfig()
 const C = propFormType(formType)

 return (
  <Form.Item
   key={`${dataIndex}`}
   className={`${styles['form-item']} ${styles.grid} ${className}`}
   {...formItemProps}
   name={dataIndex as any}
   label={title}
   style={{
    width,
    ...style,
    display: hide ? 'none' : style?.display
   }}

  >
   <C
    wcInitVal={wcInitVal}
    size={wcConfig.size}
    {...formProps}
    initialValues={initialValues}
    style={{ width: formProps.width, ...formProps.style || {} }}
   />
  </Form.Item>
 )
}

export default React.memo<Model>(WcFormItem)