import React, { useMemo } from 'react'
import type { ImageProps, ButtonProps } from 'antd'
import { Button, Divider, Space, Image } from 'antd'
import Wc, { R } from 'winchi'
import type { Columns, Methods, Alias } from '../../d'
import WcHistoryTable, { WcHistoryTableProps, HistoryAtionRef } from '../HistoryTable'
import { useWcConfig } from '../../hooks'
import { UseWcConfigRender } from '../../App'
import { propDataIndex } from '../../utils'
import styles from './index.less'

/**
 * @type {txt} 支持换行
  */
export type TableType = 'alias' | 'images' | 'handles' | 'txt'
export interface TableTypeCombineProps<T extends AO = AO> {
  type: TableType
  /** 
   * @description 拿到类型的 外部属性
    */
  getProps?(d: T): { wrapClassName?: string } & (ImageProps | ButtonProps | React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>)
}

export interface WcTypeTableProps<T extends AO = AO, D extends AO = WcHistoryTableProps>
  extends WcHistoryTableProps<T, D> {
  alias?: Alias
  methods?: Methods
  useDefaultColumns?: boolean
}
export type TypeActionRef = HistoryAtionRef

type Model = React.FC<WcTypeTableProps>

const WcTypeTable: Model = ({
  columns: columns_,
  methods = Wc.obj,
  alias: alias_ = Wc.obj,
  useDefaultColumns = true,
  children,
  ...props
}) => {
  const { wcConfig } = useWcConfig()
  const alias = useMemo(() => ({ ...wcConfig.alias, ...alias_ }), [alias_, wcConfig.alias])

  const hideInTable = R.filter((c: any) => c.hideTable !== true) as AF

  const columns = useMemo(R.compose(
    _pipeColumns(methods, alias),
    hideInTable,
    Wc.uniqueLeft(propDataIndex),
    R.concat(columns_),
    Wc.identify(useDefaultColumns && wcConfig.columns ? wcConfig.columns : Wc.arr),
  ), [columns_, useDefaultColumns, alias, methods, wcConfig.columns])

  const childrenProps: WcHistoryTableProps = {
    columns,
    ...props,
  }

  return children ? children(WcHistoryTable, childrenProps) : <WcHistoryTable {...childrenProps} />
}

interface ProcessTypeParamas {
  column: Columns
  methods: AO
  alias: AO
  getProps?: TableTypeCombineProps['getProps']
}

const _processTypeMap: Record<TableType, AF<[ProcessTypeParamas], Columns>> = {
  txt({ column: c, getProps }) {
    return {
      ...c,
      render(d, record, index) {
        const { wrapClassName = '', className = '', ...props } = getProps?.(record) || Wc.obj
        return (
          <span
            className={`${className.txt} ${wrapClassName} ${className}`}
            {...props}
            dangerouslySetInnerHTML={{ __html: c.render ? c.render(d, record, index) : d }}
          />
        )
      },
    }
  },
  handles({ column: c, methods, getProps }) {
    return {
      ...c,
      render(_: any, record: any, index) {
        const { wrapClassName = '', ...props } = getProps?.(record) || Wc.obj
        const node = (
          <Space className={wrapClassName} size={1} split={<Divider type='vertical' />}>
            {
              Object.keys(c.handles)
                .filter(R.prop(R.__, methods))
                .map((key) => (
                  <UseWcConfigRender key={key}>
                    {
                      ({ wcConfig }) => {
                        const node = c.handles[key]
                        const clickHandle = (params?: any) =>
                          wcConfig.handleClickBefore
                            ? wcConfig.handleClickBefore(key, methods[key]!, record)
                            : methods[key]?.(record, params)

                        switch (typeof node) {
                          case 'function': return node({ onClick: clickHandle, record })
                          case 'string':
                            return (
                              <Button
                                style={{ padding: 0 }}
                                className={styles['handle-btn']}
                                size='small'
                                onClick={clickHandle}
                                type='link'
                                {...props}
                              >
                                {node}
                              </Button >
                            )
                          default: return <span onClick={clickHandle}>{node}</span>
                        }
                      }
                    }
                  </UseWcConfigRender>
                )
                )
            }
          </Space >
        )
        return c.render ? c.render(node, record, index) : node
      }
    }
  },
  alias({ column: c, alias, getProps }) {
    return {
      ...c,
      render(d, record, index) {
        const { wrapClassName = '', className = '', ...props } = getProps?.(record) || Wc.obj
        const v = c.enum?.[d] ?? alias[d] ?? d
        return <main className={`${wrapClassName} ${className}`} {...props} >
          {c.render ? c.render(v, record, index) : v}
        </main>
      },
    }
  },
  images({ column: c, getProps }) {
    return {
      ...c,
      render(images, record, index) {
        const { wrapClassName = '', ...props } = getProps?.(record) || Wc.obj

        const arr = Array.isArray(images) ? images : [images]
        const node = (
          <main className={`${styles.images} ${wrapClassName}`} >
            {
              arr.map((url, index) => (
                <Image width={100} key={`${url}${index}`} src={url} {...props} />
              ))
            }
          </main >
        )
        return c.render ? c.render(node, record, index) : node
      }
    }
  }
}

/**
 * @description fetchRenderValue处理
 */
const _processFetchRenderValue: AF = (c: Columns): Columns => c.fetchRenderValue && c.render
  ? {
    ...c,
    render(_, record, index) {
      return c.render!(c.fetchRenderValue!(record), record, index)
    }
  } : c

/**  columns新增事件  */
const _processHandle = R.curry(
  (methods: AO, c: Columns) =>
    Reflect.has(methods, propDataIndex(c))
      ? {
        ...c,
        render(d, record, index) {
          return <div onClick={() => propDataIndex(c)(record)}>{c.render?.(d, record, index)}</div>
        }
      }
      : c
)

const _propsTypeMap = R.curry(
  (map: AO, types: TableTypeCombineProps[] | TableTypeCombineProps) => {
    const fns = (Array.isArray(types) ? types : [types])
      .map(k => map[k.type]
        ? (conf: AO) => map[k.type]({ ...conf, getProps: k.getProps } as ProcessTypeParamas)
        : v => v
      )

    return (conf: ProcessTypeParamas) =>
      fns.reduceRight((lastC, f) => f(lastC), conf)
  }
)

const _typeUnanimous = (c: Columns) => {
  switch (typeof c.tableType) {
    case 'string':
      return { ...c, tableType: { type: c.tableType } }
    default: return c
  }
}

/** render顺序从上到下  */
const _pipeColumns = (methods: AO, alias: AO) => R.compose(
  R.map(_processFetchRenderValue),
  R.map((c: Columns) =>
    Wc.isEmpty(c.tableType)
      ? c
      : _propsTypeMap(_processTypeMap)(c.tableType as TableTypeCombineProps)({ column: c, methods, alias })
  ),
  R.map(_typeUnanimous),
  R.map(_processHandle(methods)),
)

export default React.memo<Model>(WcTypeTable)

export * from '../Base'