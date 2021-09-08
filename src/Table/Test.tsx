import WcTable from './HeaderTable'

export default () => {
 return (
  <WcTable
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
 )
}