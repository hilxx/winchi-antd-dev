import { render } from 'react-dom'
import App from './App'

export interface DefaultProps {
 dataKey?: GetKey
 totalPageKey?: GetKey
 pageSize?: number
 requestPageKey: string
 requestPageSizeKey: string
 defaultPage?: number
}

export const defaultProps: DefaultProps = {
 dataKey: 'data',
 totalPageKey: 'totalPage',
 requestPageKey: 'page',
 requestPageSizeKey: 'pageSize',
 defaultPage: 0,
 pageSize: 40,
}

export const setGlobalConfig = (o: DefaultProps): void =>
 Object.entries(o).forEach(([k, v]) => defaultProps[k] = v)

export default render(<App />, document.getElementById('app'))