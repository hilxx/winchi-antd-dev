import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import Page from '@src/Page/Test'
import { hot } from 'react-hot-loader/root'
import 'antd/dist/antd.css'

const isDev = process.env.NODE_ENV?.startsWith('dev')

const App = () => {
 return (
  <ConfigProvider locale={zhCN} >
   <Page />
  </ConfigProvider>
 )
}

export default isDev ? hot(App) : App

