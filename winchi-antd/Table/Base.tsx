import React, { useEffect, useMemo, useRef, useState } from 'react';
import { message, Table } from 'antd';
import { TableProps, TablePaginationConfig } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import { Columns, Render } from '../d';
import { useWcConfig } from '../hooks';
import Wc, { R } from 'winchi';
import { sortColumns } from '../utils';
import { getDefaultConfig } from './utils';

export interface BaseActionRef {
  reload(o?: AO): Promise<any>;
  /** 支持rowKey 和 row 选择  */
  resetSelectedRows(keys?: (AO | string | number)[]): any;
}

export type DefaultTableProps<T extends AO = AO> = Omit<TableProps<T>, 'columns' | 'rowSelection'>;

export interface WcBaseTableProps<T extends AO = AO, N extends AO = any>
  extends Omit<DefaultTableProps, 'rowKey'> {
  columns: Columns<T>[];
  request?(params?: any[]): Promise<AO>;
  composeRequest?(fn: AF, params: AO): Promise<any> | any;
  pageSize?: number;
  actionRef?: AO | AO[];
  /**
   * @default checkbox
   * @false 关闭选择
   */
  rowSelection?: TableRowSelection<T> | false;
  onLoading?(boolean): any;
  onSelectRowChange?(rows: T[], keys: Key[]): any;
  preventFirtstRequest?: boolean;
  /** 替代Table组件, 默认是 antd.Table */
  children?: Render<N>;
  propTotal?: GetKey;
  propData?: GetKey;
  requestPageKey?: string;
  requestPageSizeKey?: string;
  rowKey?: string;
}

type Model = React.FC<WcBaseTableProps>;

const WcBaseTable: Model = ({
  request: request_ = Wc.func,
  composeRequest: composeRequest_ = (f, p) => f(p),
  pagination: pagination_ = Wc.obj,
  rowSelection: rowSelection_ = Wc.obj,
  actionRef = {},
  onLoading,
  onSelectRowChange,
  preventFirtstRequest,
  children,
  columns: columns_,
  rowKey = 'id',
  ...props
}) => {
  const { propData, propTotal, requestPageKey, requestPageSizeKey, pageSize } = getDefaultConfig(
    props,
  );
  const { wcConfig } = useWcConfig();
  const [spinning, setSpinning] = useState(true);
  const [data, setData] = useState<AO[]>(Wc.arr);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const totalRef = useRef<number>(0);
  const isRefreshRef = useRef<boolean>(false);
  const requestDebounceRef = useRef<AF>(Wc.debouncePromise(setData));
  const spinTimeOutId = useRef<any>();

  useEffect(() => {
    const actionRefArr = Array.isArray(actionRef) ? actionRef : [actionRef];
    const action: BaseActionRef = {
      reload(params = {}) {
        isRefreshRef.current = true;
        return composeRequest({
          [requestPageKey]: currentPage,
          [requestPageSizeKey]: pageSize,
          ...params,
        });
      },
      resetSelectedRows: effectSelectedRowKeys,
    };
    actionRefArr.forEach((actRef) => (actRef.current = action));
  }, [actionRef]);

  useEffect(() => {
    if (currentPage === 0 && currentPage === totalRef.current && preventFirtstRequest) return;
    composeRequest();
  }, [currentPage]);

  const toggleSpinning = (b: boolean) => () => {
    const trigger = () => {
      clearTimeout(spinTimeOutId.current);
      onLoading?.(b);
      setSpinning(b);
    };
    b ? (spinTimeOutId.current = setTimeout(trigger, 200)) : trigger();
  };

  const effectSelectedRowKeys: AF = (ks_: (string | number | AO)[] = Wc.arr) => {
    const ks = ks_.map((k) => (Wc.isObj(k) ? k[rowKey] : k));
    const rows = data.filter((d) => ks.includes(d[rowKey]));
    setSelectedRowKeys(ks);
    onSelectRowChange?.(rows, ks);
    rowSelection_ !== false && rowSelection_?.onChange?.(ks, rows);
  };

  const requestEndResetState = () => {
    isRefreshRef.current && effectSelectedRowKeys(Wc.arr);
    isRefreshRef.current = false;
  };

  const effectData: AF = (d) => {
    const newData = Wc.prop(propData, d);
    const totalPage = Wc.prop(propTotal, d);
    totalRef.current = totalPage;
    setData(newData);
  };

  const request = R.compose(requestDebounceRef.current, R.curryN(2, composeRequest_)(request_));

  const requestCatchHandle = (e) => {
    if (e === setData) return;
    setData(Wc.arr);
    toggleSpinning(false)();
    const errMsg = e.toString().match(/\d+/) || '';
    message.error(`${wcConfig.alias.tableErr} ${errMsg ? `(${errMsg})` : ''}`);
  };

  const composeRequest = Wc.asyncCompose(
    toggleSpinning(false),
    requestEndResetState,
    R.ifElse(Wc.isObj, effectData, requestCatchHandle),
    request,
    R.merge({
      [requestPageKey]: currentPage,
      [requestPageSizeKey]: pageSize,
    }),
    R.tap(toggleSpinning(true)),
  ).catch(requestCatchHandle);

  const pagination: TablePaginationConfig | false =
    pagination_ === false
      ? false
      : {
          hideOnSinglePage: true,
          pageSize,
          ...pagination_,
          total: totalRef.current,
          onChange(page, pageSize) {
            setCurrentPage(page - 1);
            pagination_?.onChange?.(page, pageSize);
          },
        };

  const rowSelection: WcBaseTableProps['rowSelection'] =
    rowSelection_ === false
      ? undefined
      : {
          ...rowSelection_,
          selectedRowKeys,
          onChange: effectSelectedRowKeys,
        };

  const columns = useMemo(() => sortColumns(columns_), [columns_]);

  const childrenProps: TableProps<any> = {
    columns,
    scroll: {
      x: columns.length * 120,
    },
    rowKey,
    ...props,
    dataSource: data,
    pagination,
    loading: spinning,
    rowSelection: rowSelection as any,
  };

  return children ? children(Table, childrenProps) : <Table {...childrenProps} />;
};

export default React.memo<Model>(WcBaseTable);
