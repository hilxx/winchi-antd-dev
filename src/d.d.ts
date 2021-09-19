import type { ColumnProps } from 'antd/lib/table'
import type { TableMessageKeys } from '@src/index'
import type { FormItemProps, FormListProps } from 'antd/lib/form'
import type { FormProps, FormType } from '@src/Form'

export interface LayoutSize {
  width?: string | number
}

export interface ColumnFormItemProps extends Omit<FormItemProps, 'label' | 'name'>, LayoutSize {

}

export interface ColumnFormListProps extends Omit<FormListProps, 'label' | 'name'>, LayoutSize {
  columns: Columns[]
}

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  /** 
   * @key 方法名
   * @value 渲染
   * @description src/Table/index的handles读取Click方法, 如（编辑、删除在配置栏）
    */
  btnsWantClick?: Partial<Record<TableMessageKeys, React.ReactNode>>
  /** 
   * @用作展示： 优先级高于全局Alias
   * @用作表单：优先级低于formProps.options
    */
  enum?: { label, value }[]
  formType?: FormType
  /**
   * @description <Form.FormItem {...props} /> 
   *  
   */
  formItemProps?: ColumnFormItemProps
  formListProps?: ColumnFormListProps
  /** <Form.FormItem><FormComponent {...props}  /></Form.FormItem>  */
  formProps?: FormProps & { width?: number | string }
  hideForm?: boolean
  hideTable?: boolean
  hideDetail?: boolean
}


