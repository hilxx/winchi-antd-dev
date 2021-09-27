import React, { useEffect, useState } from 'react'
import * as R from 'ramda'
import Page from '../Page'
import { useWcConfig } from '@src/hooks'
import { Columns } from '@src/d'
import axios, { AxiosRequestConfig } from 'axios'

const request = (config: AxiosRequestConfig) => axios({
  ...config,
  baseURL: '/api',
  headers: {
    Authorization: 'bearer 1e9d2bc4-580e-4bce-856f-5d7513dabaf1',
  },
})

const bannerColumns: Columns[] = [
  {
    title: '轮播图片',
    dataIndex: 'imageUrl',
    tableType: 'images',
    formType: 'table',
    formItemProps: {
      width: '100%',
    },
    formProps: {
      rowSelection: { type: 'radio' },
      request: (params) => request({
        url: '/material/resource/all?resourceType=PICTURE',
        params,
      }).then(d => {
        return d.data.data
      }),
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
        },
        {
          title: '资源',
          dataIndex: 'urls',
          tableType: 'images',
        },
        {
          title: '语言',
          dataIndex: 'languages',
          render(d) {
            return d.map(R.prop('name')).join('\n ')
          },
        },
      ],
    },
  },
  {
    title: '轮播图类型',
    dataIndex: 'type',
    formType: 'radio',
    tableType: {
      type: 'alias',
    },
    enum: {
      Link: '链接',
      Other: '无操作',
    }
  },
  {
    title: '语言版本',
    dataIndex: 'carouselMapDetails',
    formType: 'list',
    formListProps: {
      width: '70%',
      columns: [
        {
          dataIndex: 'languages',
          title: '选择语言',
          formType: 'select',
          enum: () => request({
            url: '/language',
            params: {
              page: 0,
              size: 99,
            },
          }).then(d => {
            return d.data.data.content.reduce((r, d) => ({ ...r, [d.id]: d.name }), {})
          }),
        },
        {
          title: '标题',
          dataIndex: 'title',
        },
      ]
    },

    render(_, { languages: d }) {
      return d.map(R.prop('name')).join('<br />')
    },
  },
]

const learnColumns: Columns[] = [
  {
    title: '图片',
    dataIndex: 'imageUrl',
    tableType: 'images',
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
  const { setWcConfig } = useWcConfig()
  const [columns, setColumns] = useState<AO[]>(bannerColumns)

  useEffect(() => {
    setWcConfig({
      totalKey: 'totalElements',
      dataKey: 'content',
      requestPageSizeKey: 'size',
      columns: [
        {
          title: '权重',
          dataIndex: 'weight',
          formType: 'number',
          formItemProps: {
            width: '28%',
          }
        },
        {
          dataIndex: '@handle',
          title: '操作',
          tableType: 'handles',
        },
      ]
    })
  }, [])

  const composeRequest = ({ requestUrl, ...params }) =>
    request({
      method: 'GET',
      url: requestUrl,
      params,
    }).then(d => d.data.data)

  return (
    <>
      <Page
        columns={columns}
        methods={{
          onRemove() { return new Promise(resolve => setTimeout(resolve, 3000)) },
          onAdd(d) {
            console.log(d)
            return new Promise(r => setTimeout(r, 4000))
          },
          onEdit(d, row) {
            console.log(d, row)
            return new Promise(r => setTimeout(r, 4000))

          }
        }}
        composeRequest={composeRequest}
        tabsConfig={{
          onChange(v) {
            setColumns(
              v === '/carousel/map/all'
                ? bannerColumns
                : learnColumns
            )
          },
          tabs: [
            {
              tabKey: '/carousel/map/all',
              tab: '轮播图',
            },
            {
              tabKey: '/plant/contents',
              tab: '了解植物研发中心',
            },
          ],
          requestKey: 'requestUrl',
        }}
      />
    </>
  )
}

