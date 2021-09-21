import type { ColumnProps } from 'antd/lib/table'
import type { FormItemProps, FormListProps } from 'antd/lib/form'
import type { TableHandleKeys } from '@src/index'
import type { FormProps, FormType } from '@src/Form'
import type { TableType } from '@src/Table'
import type { WcUploadProps } from './Upload'

export interface LayoutSize {
  width?: string | number
}

export interface ColumnFormItemProps extends Omit<FormItemProps, 'label' | 'name'>, LayoutSize {

}

export interface ColumnFormListProps extends Omit<FormListProps, 'label' | 'name'>, LayoutSize {
  columns: Columns[]
}

export type Handles<T extends AO = AO> = Partial<Record<TableHandleKeys | string, (row: T | T[]) => any>>

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  /** 
   * @key 方法名
   * @value 渲染
   * @description src/Table/index的handles读取Click方法, 如（编辑、删除在配置栏）
    */
  btnsWantClick?: Partial<
    Record<TableHandleKeys & string>,
    React.ReactNode | ((params?: Record<'onClick' & string, any>) => React.ReactNode)
  >
  /** 
   * @用作展示：优先级高于alias
   * @用作表单：优先级低于formProps.options
    */
  enum?: { label, value }[]
  tableType?: TableType | TableType[]
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

export interface DefaultProps {
  dataKey: GetKey
  totalPageKey: GetKey
  pageSize: number
  requestPageKey: string
  requestPageSizeKey: string
  defaultPage: number
  /** 
   * @description 默认别名
   */
  alias: Alias
  /** 
   * @key: 事件名
   * @value: {column, loadingText: 开启后会成为loading提示文字}
   * @description 新增column，出现在当前column的右边，事件调用props.handels
   **/
  columns: Record<string, Columns>
  /** 
  * @key: 事件名
  * @value: interface  LoadingText
  * @description 触发改事件，触发相应Loading
  **/
  handlesMessage: Partial<Record<TableHandleKeys, LoadingText>> & AO
  handleClickBefore(name?: string | TableHandleKeys, fn: AF, arg: any): any
  ModalWidth: {
    form?: string | number
    image?: string | number
  },
  upload: Omit<WcUploadProps, 'fileList'>
}

