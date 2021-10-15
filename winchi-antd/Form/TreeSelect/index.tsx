import React, { useEffect, useMemo, useState } from 'react';
import type { TreeSelectProps } from 'antd/lib/tree-select';
import { Spin, TreeSelect } from 'antd';
import { stringToIds } from '@/utils/async';
import styles from './index.less';

const { TreeNode } = TreeSelect;

export interface MyTreeSelectDataItem {
  id: string | number;
  title: string;
  children?: MyTreeSelectDataItem[];
}

export interface MyTreeSelectProps extends TreeSelectProps<any> {
  request?: () => Promise<MyTreeSelectDataItem[]>;
  data?: MyTreeSelectDataItem[];
}

type Model = React.FC<MyTreeSelectProps>;

const MyTreeSelect: Model = (props) => {
  const { data, request, value: value__, multiple, onChange, ...restProps } = props;
  const [value, setValue] = useState<string[]>([]);
  const [renderData, setRenderData] = useState<MyTreeSelectDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    data && setRenderData(data);
  }, [data]);

  useEffect(() => {
    value__ && setValue(typeof value__ === 'string' ? stringToIds(value__) : value__);
  }, [value__]);

  useEffect(() => {
    request && setLoading(true);
    request?.()
      .then(setRenderData)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  // handle
  const changeHandle: TreeSelectProps<any>['onChange'] = (selectKeys: string[], ...rest) => {
    const keys = multiple !== false ? selectKeys : selectKeys.slice(selectKeys.length - 1);
    setValue(keys);
    onChange && onChange(keys, ...rest);
  };

  const renderContent = useMemo(() => {
    return renderData.map((item) => renderTreeNode(item));
  }, [renderData]);

  return (
    <TreeSelect
      autoFocus
      treeCheckable
      allowClear
      treeDefaultExpandAll
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      {...restProps}
      style={{ height: '100%', ...(props.style || {}) }}
      multiple={multiple}
      value={value}
      onChange={changeHandle}
      className={`${styles.wrap} ${props.className || ''}`}
    >
      {loading ? <Spin /> : renderContent}
    </TreeSelect>
  );
};

export default React.memo<Model>(MyTreeSelect);

const renderTreeNode = (data: MyTreeSelectDataItem) => (
  <TreeNode key={data.id} value={data.id} title={data.title}>
    {data.children ? data.children.map((item) => renderTreeNode(item)) : null}
  </TreeNode>
);
