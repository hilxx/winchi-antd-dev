import type { OptionProps } from 'antd/lib/select';
import type { ColumnProps } from 'antd/lib/table';
import type { FormItemProps, FormListProps } from 'antd/lib/form';
import type { FormProps, FormType } from './Form';
import type { TableType } from './Table/TypeTable';
import type { WcUploadProps } from './Upload';
import { defaultAlias } from './App';

export type Size = Exclude<SizeType, void>;

export interface LayoutSize {
  width?: string | number;
}

export type Render<N extends AO = any> = (
  node: React.ComponentType<N>,
  nodeProps?: N,
) => React.ReactElement;

export interface ColumnFormItemProps
  extends Omit<FormItemProps, 'label' | 'name' | 'initialValue'>,
  LayoutSize {
  width?: string | number;
}

export interface ColumnFormListProps
  extends Omit<FormListProps, 'label' | 'name' | 'initialValue' | 'children'>,
  LayoutSize {
  columns: Columns[];
}

export type ColumnsEnum = Record<string | number, React.ReactNode> | OptionProps[];

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  initialValue?: any | ((record: T) => any);
  /** @description 开启顶栏搜索 */
  search?: boolean;
  /** @description column.render的返回值*/
  fetchRenderValue?(record: T): React.ReactNode;
  /**
   * @用作展示：优先级高于alias
   * @用作表单：优先级低于formProps.options
   */
  enum?: ColumnsEnum | AF<any[], Promise<ColumnsEnum>> | AxiosPromise<ColumnsEnum>;
  tableType?: TableType | TableType[];
  /** @type [compose的顺序，从后到前] */
  formType?: FormType | FormType[];
  /** @description <Form.FormItem {...props} /> */
  formItemProps?: ColumnFormItemProps;
  formListProps?: ColumnFormListProps;
  /** <Form.FormItem><FormComponent {...props}  /></Form.FormItem>  */
  formProps?: FormProps & LayoutSize;
  hideTable?: boolean;
  hideDetail?: boolean;
  /** @description x轴顺序 */
  xIndex?: number;
  /** @type function 针对formList (d: AO, index: Form.List第几项) */
  hideForm?: boolean | ((d: T, index?: number) => boolean);
  renderForm?: Render;
  formResult?: false | ((formItemValue: any, formValues: any) => any);
}

export interface WcConfig {
  /** @description 当前table 设置紧凑程度 */
  size?: Size;
  /** @description {[default TopTabKey]: value} */
  /** @description 默认别名 */
  alias: Alias & AO;
  uploadConfig: Omit<WcUploadProps, 'fileList'>;
}

export type Alias = typeof defaultAlias;
