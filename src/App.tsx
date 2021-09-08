import Table from '@src/Table/Test'
import { hot } from 'react-hot-loader/root'
import 'antd/dist/antd.css'

const isDev = process.env.NODE_ENV?.startsWith('dev')

const App = () => {
 return (
  <div>
   <Table />
  </div>
 )
}

export default isDev ? hot(App) : App

