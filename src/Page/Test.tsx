import Page from '../Page'

export default () => (
 <Page
  formProps={{
   steps: ['Title'],
  }}
  columns={[
   [{
    title: '故事的',
    dataIndex: 'time1',
    hideForm: true,
    render() { return 'Re So So Si Do Si La' }
   }],
   [{
    title: '小黄花',
    dataIndex: 'time2',
    render() { return 'Re So So Si Do Si La' }
   }],
  ]}
  request={() => new Promise((resolve) => {
   setTimeout(() => {
    resolve({ data: Array.from({ length: 41 }).map(() => ({ id: Math.random() })) })
   }, 1000)
  })}
  handles={{
   onAdd(v) {
    console.log(v)
    return new Promise(resolve => setTimeout(resolve, 2000))
   },
   onEdit(v) {
    console.log('edit', v)
   },
   onClickRemove(v) {
    console.log(`click remove()`, v)
   },
  }}
  tabsConfig={{
   tabs: [
    {
     tabKey: '1',
     tab: 'tab1',
    },
    {
     tabKey: '2',
     tab: 'tab2',
    },
    {
     tabKey: '3',
     tab: 'tab3',
    },
   ],
   defaultTab: '2',
   requestKey: 'tab key',
  }}
 />
)