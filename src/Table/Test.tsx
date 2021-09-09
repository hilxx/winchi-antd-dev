import { useEffect } from 'react'
import WcTable from './'

export default () => {

 return (
  <div style={{ margin: '0 5rem' }}>
   <WcTable
    filter
    onAdd={() => console.log('点击 新增')}
    columns={[
     {
      title: '时间2',
      dataIndex: 'time',
      render() { return 'this is time' }
     },
     {
      title: '时间2',
      dataIndex: 'time',
      render() { return 'this is time' }
     },
    ]}
    request={() => new Promise((resolve) => {
     setTimeout(() => {
      resolve({ data: [{ time: 1 }, { time: 1 }, { time: 1 }].map(d => ({ ...d, id: Math.random() })) })
     }, 1000)
    })}
   />
  </div>
 )
}