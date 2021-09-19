import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import Page from '../Page'

export default () => {
 const [defaultValue, setDefaultValue] = useState(1)

 useEffect(() => {
  setTimeout(() => {
   setDefaultValue(Date.now())
  }, 5000)
 }, [])


 return (
  <>
   <Page
    formProps={{
     steps: ['Title'],
    }}
    columns={[
     [
      {
       title: '故事的',
       dataIndex: 'time1',
       formItemProps: {
        rules: [
         {
          required: true,
          message: '必填',
         },
         {
          min: 4,
          message: '少于最小长度'
         }
        ]
       },
       render() { return 'Re So So Si Do Si La' }
      },
      {
       title: '小黄花',
       dataIndex: 'time2',
       formType: 'select',
       formItemProps: {
        initialValue: 2,
       },
       enum: [
        {
         label: 'label1',
         value: 1,
        },
        {
         label: 'label2',
         value: 2,
        },
        {
         label: 'label3',
         value: 3,
        },
       ],
       render() { return 'Re So So Si Do Si La' }
      },
      {
       title: 'table',
       formType: 'table',
       dataIndex: 'table',
       formItemProps: {
        width: '100%',
       },
       formProps: {
        width: '100%',
        request() {
         return new Promise(resolve => setTimeout(() => resolve({
          data: Array.from({ length: 20 }).map((_, index) => ({
           tab1: 'tab1',
           tab2: 'tab2',
           id: index,
          }))
         }), 4000))
        },
        columns: [
         {
          title: 'tab1',
          dataIndex: 'tab1',
         },
         {
          title: 'tab2',
          dataIndex: 'tab2',
         }
        ]
       }
      }
     ],
     [
      {
       title: '故事的',
       dataIndex: 'time3',
       hideForm: true,
       render() { return 'Re So So Si Do Si La' }
      },
      {
       title: '小黄花',
       dataIndex: 'time4',
       formItemProps: {
        rules: [
         {
          required: true,
          message: '必填',
         },
         {
          min: 4,
          message: '少于最小长度'
         }
        ]
       },
       render() { return 'Re So So Si Do Si La' }
      }
     ],
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
  </>
 )
}