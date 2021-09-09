import { render } from 'react-dom'
import App from './App'
import Wc from 'winchi'
import { Columns } from './Page/data'

export interface DefaultProps {
 dataKey?: GetKey
 totalPageKey?: GetKey
 pageSize?: number
 requestPageKey: string
 requestPageSizeKey: string
 defaultPage?: number
 Alias?: Record<string | 'small' | 'middle' | 'large', string>
 /** 
  * @key: 事件名
  * @value: Columns
  * @description Table/index.tsx使用，事件回调props.handels
  **/
 columns?: Record<string, Columns>,
}

export const defaultProps: DefaultProps = {
 dataKey: 'data',
 totalPageKey: 'totalPage',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 defaultPage: 0,
 pageSize: 40,
 Alias: {
  small: '紧凑',
  middle: '中等',
  large: '宽松',
 },
 columns: {

 },
}

export const setGlobalConfig = (o: DefaultProps): void =>
 Object.entries(o).forEach(([k, v]) =>
  Wc.isObj(defaultProps[k]) && Wc.isObj(v) ? { ...defaultProps[k], ...v } : v)

export default render(<App />, document.getElementById('app'))
