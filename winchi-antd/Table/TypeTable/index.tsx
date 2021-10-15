import React, { useMemo } from 'react';
import type { ImageProps, ButtonProps } from 'antd';
import { Image } from 'antd';
import Wc, { R } from 'winchi';
import type { Columns } from '../../d';
import WcHistoryTable, { WcHistoryTableProps, HistoryAtionRef } from '../HistoryTable';
import { useWcConfig } from '../../hooks';
import { propDataIndex } from '../../utils';
import styles from './index.less';

/** @type {txt} 支持换行 */
export interface TableTypeObj<T extends AO = AO> {
  type: Exclude<TableType, TableTypeObj>;
  /**
   * @description 拿到类型的 外部属性
   */
  getProps?(
    d: T,
  ): { wrapClassName?: string } & (
    | ImageProps
    | ButtonProps
    | React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  );
}

export type TableType = 'alias' | 'images' | 'txt' | TableTypeObj;

export interface WcTypeTableProps<T extends AO = AO, D extends AO = WcHistoryTableProps>
  extends WcHistoryTableProps<T, D> {
  useDefaultColumns?: boolean;
}
export type TypeActionRef = HistoryAtionRef;

type Model = React.FC<WcTypeTableProps>;

const WcTypeTable: Model = ({
  columns: columns_ = Wc.arr,
  useDefaultColumns = true,
  children,
  ...props
}) => {
  const { wcConfig } = useWcConfig();
  const alias = wcConfig.alias;

  const hideInTable = R.filter((c: any) => c.hideTable !== true) as AF;

  const columns = useMemo(
    R.compose(
      _pipeColumns(alias),
      hideInTable,
      Wc.uniqueLeft(propDataIndex),
      Wc.idendify(columns_),
    ),
    [columns_, alias],
  );

  const childrenProps: WcHistoryTableProps = {
    columns,
    ...props,
  };

  return children ? children(WcHistoryTable, childrenProps) : <WcHistoryTable {...childrenProps} />;
};

interface ProcessTypeParamas {
  column: Columns;
  alias: AO;
  getProps?: TableTypeObj['getProps'];
}

const _processTypeMap: Record<Exclude<TableType, TableTypeObj>, AF<[ProcessTypeParamas], Columns>> = {
  txt({ column: c, getProps }) {
    return {
      ...c,
      render(d, record, index) {
        const { wrapClassName = '', className = '', ...props } = getProps?.(record) || Wc.obj;
        return (
          <span
            className={`${className.txt} ${wrapClassName} ${className}`}
            {...props}
            dangerouslySetInnerHTML={{ __html: c.render ? c.render(d, record, index) : d }}
          />
        );
      },
    };
  },
  alias({ column: c, alias, getProps }) {
    return {
      ...c,
      render(d, record, index) {
        const { wrapClassName = '', className = '', ...props } = getProps?.(record) || Wc.obj;
        const v = c.enum?.[d] ?? alias[d] ?? d;
        return (
          <main className={`${wrapClassName} ${className}`} {...props}>
            {c.render ? c.render(v, record, index) : v}
          </main>
        );
      },
    };
  },
  images({ column: c, getProps }) {
    return {
      ...c,
      render(images, record, index) {
        const { wrapClassName = '', ...props } = getProps?.(record) || Wc.obj;

        const arr = Array.isArray(images) ? images : [images];
        const node = (
          <main className={`${styles.images} ${wrapClassName}`}>
            {arr.map((url, index) => (
              <Image width={100} key={`${url}${index}`} src={url} {...props} />
            ))}
          </main>
        );
        return c.render ? c.render(node, record, index) : node;
      },
    };
  },
};

/**
 * @description fetchRenderValue处理
 */
const _processFetchRenderValue: AF = (c: Columns): Columns =>
  c.fetchRenderValue && c.render
    ? {
      ...c,
      render(_, record, index) {
        return c.render!(c.fetchRenderValue!(record), record, index);
      },
    }
    : c;

const _propsTypeMap = R.curry((map: AO, types: TableTypeObj[] | TableTypeObj) => {
  const fns = (Array.isArray(types) ? types : [types]).map((k) =>
    map[k.type]
      ? (conf: AO) => map[k.type]({ ...conf, getProps: k.getProps } as ProcessTypeParamas)
      : (v) => v,
  );

  return (conf: ProcessTypeParamas) => fns.reduceRight((lastC, f) => f(lastC), conf);
});

const _typeUnanimous = (c: Columns) => {
  switch (typeof c.tableType) {
    case 'string':
      return { ...c, tableType: { type: c.tableType } };
    default:
      return c;
  }
};

/** render顺序从上到下  */
const _pipeColumns = (alias: AO) =>
  R.compose(
    R.map(_processFetchRenderValue),
    R.map(
      (c: Columns) => Wc.isEmpty(c.tableType)
        ? c
        : _propsTypeMap(_processTypeMap)(c.tableType as TableTypeObj)({
          column: c,
          alias,
        }),
    ),
    R.map(_typeUnanimous),
  );

export default React.memo<Model>(WcTypeTable);

export * from '../Base';
