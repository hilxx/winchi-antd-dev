import type { ColumnProps } from 'antd/lib/table'
import type { TableMessageKeys } from '@src/index'
import type { FormItemProps } from 'antd/lib/form'
import type { FormProps } from '@src/Form'

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  /** 
   * @key 方法名
   * @value 渲染
   * @description src/Table/index的handles读取Click方法, 如（编辑、删除在配置栏）
    */
  btnsWantClick?: Partial<Record<TableMessageKeys, React.ReactNode>>
  formType?: FormType
  formProps?: FormProps & Omit<FormItemProps, 'label' | 'name'>
  hideForm?: boolean
  hideTable?: boolean
  hideDetail?: boolean
}

export type FormType = 'text' | 'number' | 'select' | 'radio' | 'upload' | 'table'

export type Size = 'small' | 'middle' | 'large'