import React, { useEffect, useState } from 'react'
import Page from '../Page'
import { setGlobalConfig, Columns } from '@src/index'
import axios from 'axios'
import * as R from 'ramda'

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
  enum: [
   {
    label: '其它',
    value: 'Other',
   },
   {
    label: '链接',
    value: 'Link',
   }
  ]
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
  enum: [
   {
    label: '视频',
    value: 'VIDEO',
   },
   {
    label: '网页',
    value: 'WEBPAGE',
   },
  ],
 }
]

export default () => {
 const [columns, setColumns] = useState<AO[]>(bannerColumns)

 useEffect(() => {
  setGlobalConfig({
   totalPageKey: 'totalPages',
   dataKey: 'content',
   requestPageSizeKey: 'size',
   columns: {
    title: {
     dataIndex: 'title',
     title: '标题',
    },
    weight: {
     title: '权重',
     dataIndex: 'weight',
    },
    updateTime: {
     title: '更新时间',
     dataIndex: 'updateTime',
     hideForm: true,
    },
    handle: {
     title: '操作',
    },
   },
  })
  setColumns([])
 }, [])

 const composeRequest = ({ requestUrl, ...params }) =>
  axios({
   method: 'GET',
   url: requestUrl,
   params,
   headers: {
    Authorization: 'bearer a9506f2c-503e-4c49-aa14-0a70cc1ae95a',
   }
  }).then(d => d.data.data)

 return (
  <>
   <Page
    formProps={{

    }}
    columns={columns}
    handles={{
     onRemove() { return new Promise(resolve => setTimeout(resolve, 3000)) },
     onEdit() { return new Promise(resolve => resolve(1)) },
    }}
    composeRequest={composeRequest}
    tabsConfig={{
     onChange(v) {
      setColumns(
       v === 'https://test.vvaryun.com/amway/c_api/api/v1/admin/carousel/map/all'
        ? bannerColumns
        : learnColumns
      )
     },
     tabs: [
      {
       tabKey: 'https://test.vvaryun.com/amway/c_api/api/v1/admin/carousel/map/all',
       tab: '轮播图',
      },
      {
       tabKey: 'https://test.vvaryun.com/amway/c_api/api/v1/admin/plant/contents',
       tab: '了解植物研发中心',
      },
     ],
     requestKey: 'requestUrl',
    }}
   />
  </>
 )
}

