import React, { useEffect, useState } from 'react';
import type { TreeProps } from 'antd/lib/tree';
import { Tree } from 'antd';
import styles from './index.less';

export interface MyTreeProps extends TreeProps {
  request?: AF<any[], Promise<any>>;
  onChange?: AF;
  value?: any;
}

type Model = React.FC<MyTreeProps>;

const MyTree: Model = (props) => {
  const {
    request,
    value,
    treeData: treeData_,
    onChange,
    onCheck,
    checkable = true,
    className = '',
    ...restProps
  } = props;
  const [treeData, setTreeData] = useState(treeData_);

  useEffect(() => {
    treeData_ && setTreeData(treeData_);
  }, [treeData_]);

  useEffect(() => {
    request?.().then(setTreeData);
  }, [request]);

  const checkHandle: TreeProps['onCheck'] = (keys, ...rest) => {
    onChange?.(keys, ...rest);
    onCheck?.(keys, ...rest);
  };

  return (
    <Tree
      className={`${styles.wrap} ${className}`}
      autoExpandParent
      defaultExpandAll
      {...restProps}
      checkable={checkable}
      onCheck={checkHandle}
      treeData={treeData}
      checkedKeys={value}
    />
  );
};

export default React.memo<Model>(MyTree);
