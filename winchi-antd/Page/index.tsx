import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Modal } from 'antd';
import Wc, { R } from 'winchi';
import { propDataIndex, processEnum, defaultRender } from '../utils';
import { Columns } from '../d';
import WcTable, { WcTableProps, ActionRef } from '../Table';
import WcForm, { WcFormProps, FormRef } from '../Form';
import styles from './index.less';

export type ComposeRequest<T extends AO = AO> = (f: AF, params: any, oldValue: T) => any;

export interface WcPageRef extends FormRef, ActionRef {
  toggleFormVisible(bool): any;
  setFormValues(values?: AO): any;
  editRow(values: AO): any;
  /** 自动传递当前form值 & 让函数走composeRequest通道 */
  composeRequest(f: AF, params): any;
}

export interface WcPageProps<T extends AO = any>
  extends Omit<WcTableProps<T>, 'columns' | 'composeRequest' | 'actionRef'> {
  columns: WcFormProps<T>['columns'] | Columns<T>[];
  onSubmit?(newValues: T, oldValues: T): any;
  publicColumns?: WcFormProps<T>['columns'];
  /**
   * @description 点击编辑转换为Form可以理解的值
   */
  formProps?: Omit<WcFormProps<T>, 'columns' | 'formRef'>;
  formRef?: React.RefObject<FormRef | undefined>;
  renderTable?(Node: React.ComponentType<any>, props: WcTableProps<T>): React.ReactNode;
  renderForm?(Node: React.ComponentType<any>, props: WcFormProps<T>): React.ReactNode;
  composeRequest?: ComposeRequest<any>;
  modalWidth?: string | number;
  drawWidth?: number;
  className?: string;
  pageRef?: React.RefObject<WcPageRef | void>;
}

type Model = React.FC<WcPageProps>;

const WcPage: Model = ({
  columns: columns__,
  publicColumns: publicColumns_ = Wc.arr,
  modalWidth = 600,
  drawWidth = 400,
  className = '',
  formProps = Wc.obj,
  renderForm = defaultRender,
  renderTable = defaultRender,
  composeRequest: composeRequest_,
  onSubmit,
  pageRef,
  ...props
}) => {
  const [modelVisible, setModalVisible] = useState(false);
  const [columns, setColumns] = useState<WcFormProps['columns']>(Wc.arr);
  const actionRef = useRef<ActionRef>();
  const formRef = useRef<FormRef>()

  const columns_ = useMemo(() => _defaultDoubleArr(columns__), [columns__]);
  const publicColumns = useMemo(() => _defaultDoubleArr(publicColumns_), [publicColumns_]);

  const flatColumns = useMemo(() => columns.flat(), [columns]);

  const updateColumns = useCallback(
    (newC, index) =>
      setColumns((old) => [...old.slice(0, index), newC, ...old.slice(index + 1)] as any[]),
    [],
  );

  const composeRequest = R.curry(
    (f = Wc.func, params) =>
      composeRequest_
        ? composeRequest_(f, params, formRef.current?.getIntialValues())
        : f(params, formRef.current?.getIntialValues()),
  );

  /** 处理 columns[] */
  const processColumns: AF = R.compose(
    R.tap(R.forEach(processEnum(updateColumns))),
    Wc.uniqueLeft(propDataIndex),
    R.map(_forceHideExhibit),
  );

  useEffect(() => {
    if (pageRef) {
      (pageRef as any).current = {
        toggleFormVisible: setModalVisible,
        editRow(values) {
          setModalVisible(!!values);
          formRef.current?.resetForm(values)
        },
        ...formRef.current || Wc.obj,
        ...actionRef.current || Wc.obj,
        composeRequest,
        reload(params) {
          actionRef.current?.clearHistory(props.getFeature?.(params));
          actionRef.current?.reload(params);
        },
      } as WcPageRef;
    }
  });

  useEffect(
    R.compose(
      setColumns,
      R.map(processColumns),
      _mergeDoubleArr(columns_),
      Wc.idendify(publicColumns),
    ),
    [publicColumns, columns_],
  );

  const submitHandle = async (vs) => {
    await composeRequest(onSubmit, vs);
    setModalVisible(false);
    formRef.current?.resetForm(Wc.obj)
  };
 
  const renderTableProps: WcTableProps = {
    columns: flatColumns,
    ...props,
    composeRequest,
    actionRef,
  };

  const renderFormProps: WcFormProps = {
    columns: columns,
    ...formProps,
    onSubmit: submitHandle,
    formRef: formRef,
  };

  return (
    <div className={`${className} ${styles.wrap}`}>
      {renderTable(WcTable, renderTableProps)}
      <Modal
        onCancel={() => setModalVisible(false)}
        visible={modelVisible}
        footer={null}
        confirmLoading
        width={modalWidth}
        forceRender={true}
      >
        <div className={styles['modal-content']}>{renderForm(WcForm, renderFormProps)}</div>
      </Modal>
    </div>
  );
};

export default React.memo<Model>(WcPage);

/**
 * @description ${dataIndex}@开头，除了table隐藏显示
 */
const _forceHideExhibit = (c: Columns): Columns =>
  `${propDataIndex(c)}`.startsWith('@')
    ? {
      ...c,
      hideForm: true,
    }
    : c;

/**
 * @returns 二维数组
 */
const _defaultDoubleArr = (arr: any[]) => (arr[0] && Array.isArray(arr[0]) ? arr : [arr]);

const _mergeDoubleArr = R.curry((arr1: any[], arr2: any[]) => {
  const max = Math.max(arr1.length, arr2.length);
  const r: any[] = [];
  for (let i = 0; i < max; i++) {
    r.push([...(arr1[i] || []), ...(arr2[i] || [])]);
  }
  return r;
});
