import React, { useContext, useEffect, useState } from 'react';
import type { InputProps, InputNumberProps, RadioProps, SelectProps } from 'antd';
import { Radio, Input, InputNumber, Select } from 'antd';
import Wc from 'winchi';
import { Columns } from '../d';
import { WcFormContext } from './';
import { defaultRender } from '../utils';
import FormTable, { WcFormTableProps } from '../Table/FormTable';
import WcUpload from './Upload';
import WcFormList from './List';
import WcTreeSelect from './TreeSelect';
import WcTree from './Tree';

const { TextArea } = Input;

export type FormType =
  | 'text'
  | 'textArea'
  | 'number'
  | 'select'
  | 'radio'
  | 'upload'
  | 'table'
  | 'list'
  | 'tree'
  | 'treeSelect';

export type FormProps =
  | InputProps
  | InputNumberProps
  | RadioProps
  | SelectProps<any>
  | WcFormTableProps;

const mapFC: Record<FormType, AF> = {
  text(props: any) {
    return <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Input} />;
  },
  textArea(props: any) {
    return (
      <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={TextArea} />
    );
  },
  number(props: any) {
    return <FormComponentWrap {...props} Component={InputNumber} />;
  },
  radio(props: any) {
    return (
      <FormComponentWrap {...props} onChangeComputeValue={propEventValue} Component={Radio.Group} />
    );
  },
  select(props: any) {
    return (
      <FormComponentWrap
        {...props}
        loading={typeof props.options === 'function'}
        Component={Select}
      />
    );
  },
  table(props: any) {
    const { setLoading } = useContext(WcFormContext);
    return (
      <FormComponentWrap
        {...props}
        onLoading={Wc.sep(setLoading, props?.onLoading || Wc.func)}
        Component={FormTable}
      />
    );
  },
  upload(props: any) {
    return <FormComponentWrap {...props} Component={WcUpload} />;
  },
  list(props: any) {
    return <FormComponentWrap {...props} Component={WcFormList} />;
  },
  tree(props) {
    return <FormComponentWrap {...props} Component={WcTree} />;
  },
  treeSelect(props) {
    return <FormComponentWrap {...props} Component={WcTreeSelect} />;
  },
};

export const propEventValue = (e?) => e?.target?.value;

export const propFormType = (key: FormType = 'text'): React.FC<FormComponentWrapProps> =>
  mapFC[key];

export interface FormComponentWrapProps {
  onChange: AF;
  Component: React.ComponentType<AO>;
  wcInitVal: any;
  /** 依赖它来更新value，如果wcInitVal一直为undefined则无法二次触发useEffect  */
  initialValues: AO;
  onChangeComputeValue?: AF;
  column: Columns;
}

const FormComponentWrap: React.FC<FormComponentWrapProps> = ({
  wcInitVal,
  onChange = Wc.func,
  Component,
  onChangeComputeValue,
  initialValues,
  column,
  ...props
}) => {
  const [value, setValue] = useState<any>();

  useEffect(() => {
    if (wcInitVal === value) return;
    setValue(wcInitVal);
    onChange(wcInitVal);
  }, [wcInitVal, initialValues]);

  const changeHandle = (...rest) => {
    const newV = onChangeComputeValue?.(...rest) ?? rest[0];
    if (newV === value) return;
    if (Array.isArray(newV) && Array.isArray(value) && newV.toString() === value.toString()) return;
    setValue(newV);
    onChange?.(...[newV, rest.slice(1)]);
  };

  const { renderForm = defaultRender } = column;

  const renderProps = {
    ...props,
    value,
    onChange: changeHandle,
  };

  return renderForm(Component, renderProps);
};

export default mapFC;
