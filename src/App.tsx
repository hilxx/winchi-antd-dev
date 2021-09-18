import { createContext, useState } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import Page from '@src/Page/Test'
import { hot } from 'react-hot-loader/root'
import 'antd/dist/antd.css'
import { Size } from './index'

const isDev = process.env.NODE_ENV?.startsWith('dev')

export interface AppConfig {
 size: Size
}
export const AppContext = createContext<{ appConfig: AppConfig, setAppConfig: (c?: Partial<AppConfig>) => any }>
 ({
  appConfig: { size: 'middle' },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAppConfig() { },
 })

const App = () => {
 const [appConfig, setAppConfig] = useState<AppConfig>({ size: 'middle' })
 const composeSetAppConfig: AF = (o: Partial<AppConfig>) => setAppConfig({ ...appConfig, ...o })

 return (
  <ConfigProvider locale={zhCN} >
   <AppContext.Provider value={{ appConfig, setAppConfig: composeSetAppConfig }}>
    <Page />
   </AppContext.Provider>
  </ConfigProvider>
 )
}

export default isDev ? hot(App) : App

