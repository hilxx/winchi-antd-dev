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
    Authorization: 'bearer 3c5e1c24-8dff-47ed-9ecb-9d736c8df8dc',
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
      rowKey: 'url',
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
          hideForm: true,
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
    tableType: 'txt',
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
        {
          title: '链接',
          dataIndex: 'url',
          hideForm(v) {
            return v.type !== 'Link'
          }
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
          title: '标题',
          dataIndex: 'title',
          xIndex: -1,
          hideForm: true,
        },
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
          fixed: 'right',
          width: 100,
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
            return request({
              url: 'carousel/map',
              method: 'POST',
              data: d,
            })
          },
          onEdit(d, row) {
            return request({
              url: `carousel/map/${row.id}`,
              method: 'PUT',
              data: d,
            })
          }
        }}
        eidtValueTransform={_processEditValue}
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

const _processEditValue = (v) => {
  return {
    ...v,
    carouselMapDetails: v.languages.map(d => ({
      languages: d.id + '',
      title: v.title,
    }))
  }
}