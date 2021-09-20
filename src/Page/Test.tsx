import React, { useEffect, useState } from 'react'
import Page from '../Page'
import { setGlobalConfig } from '@src/index'

export default () => {
 const [columns, setColumns] = useState<AO[]>([])

 useEffect(() => {
  setGlobalConfig({
   columns: {
    handle: {
     title: '操作',
    }
   }
  })
  setColumns([])
 }, [])

 return (
  <>
   <Page
    formProps={{

    }}
    columns={columns}
    request={() => new Promise((resolve) => {
     setTimeout(() => {
      resolve({ data: Array.from({ length: 41 }).map(() => ({ id: Math.random() })) })
     }, 1000)
    })}
    handles={{
     onClickRemove() { },
     onClickEdit() { },
    }}
    tabsConfig={{
     tabs: [
      {
       tabKey: 'swiper',
       tab: '轮播图',
      },
      {
       tabKey: 'research',
       tab: '了解植物研发中心',
      },
     ],
     requestKey: 'tabKey',
    }}
   />
  </>
 )
}