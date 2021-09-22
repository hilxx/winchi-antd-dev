import React, { useEffect, useState } from 'react'
import Page from '../Page'
import { setGlobalConfig, Columns } from '@src/index'
import axios from 'axios'

const bannerColumns: Columns[] = [
 {
  title: '轮播图片',
  dataIndex: 'imageUrl',
 },
 {
  title: '语言版本',
  dataIndex: 'languages',
  render() {
   return '语言版本'
  },
 },
 {
  title: '轮播图类型',
  dataIndex: 'type',
  formType: 'radio',
  tableType: 'alias',
  enum: {
   Other: '其它',
   Link: '链接'
  }
 }
]

const learnColumns: Columns[] = [
 {
  title: '图片',
  dataIndex: 'imageUrl',
 },
 {
  title: '介绍',
  dataIndex: 'introduce',
 },
 {
  title: '标签',
  dataIndex: 'labelName',
 },
 {
  title: '类型',
  dataIndex: 'type',
  enum: {
  VIDEO: '视频',
  WEBPAGE: '网页',
  },
 }
]

export default () => {
 const [columns, setColumns] = useState<AO[]>(bannerColumns)

 useEffect(() => {
  setGlobalConfig({
   totalPageKey: 'totalPages',
   dataKey: 'content',
   requestPageSizeKey: 'size',
   columns: [
    {
     title: '标题',
     dataIndex: 'title',
    },
    {
     title: '权重',
     dataIndex: 'weight',
    },
    {
     title: '更新时间',
     dataIndex: 'updateTime',
     hideForm: true,
    },
    {
     dataIndex: '@handle',
     title: '操作',
    },
   ]
  })
  setColumns([])
 }, [])

 const composeRequest = ({ requestUrl, ...params }) =>
  axios({
   method: 'GET',
   url: requestUrl,
   params,
   headers: {
    Authorization: 'bearer 8d6bcc5e-b439-4819-82b7-2d3bc3ba9751',
   }
  }).then(d => d.data.data)

 return (
  <>
   <Page
    formProps={{

    }}
    columns={columns}
    methods={{
     onRemove() { return new Promise(resolve => setTimeout(resolve, 3000)) },
     onEdit() { return new Promise(resolve => resolve(1)) },
    }}
    composeRequest={composeRequest}
    tabsConfig={{
     onChange(v) {
      setColumns(
       v === '/api/carousel/map/all'
        ? bannerColumns
        : learnColumns
      )
     },
     tabs: [
      {
       tabKey: '/api/carousel/map/all',
       tab: '轮播图',
      },
      {
       tabKey: '/api/plant/contents',
       tab: '了解植物研发中心',
      },
     ],
     requestKey: 'requestUrl',
    }}
   />
  </>
 )
}

