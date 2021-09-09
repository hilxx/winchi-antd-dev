import { ColumnProps } from 'antd/lib/table'

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  /** 
   * @key 方法名
   * @value 渲染
   * @description src/Table/index的handles读取Click方法
    */
  renderUseHandles?: Record<string, React.ReactNode>
}