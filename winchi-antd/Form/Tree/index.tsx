import React, { useEffect, useState } from 'react'
import type { TreeProps } from 'antd/lib/tree'
import { Tree } from 'antd'
import Wc from 'winchi'
import styles from './index.less'

export interface WcTreeProps extends TreeProps {
 request?: AF<any[], Promise<any>>
 onChange?: AF
 value?: any[]
}

type Model = React.FC<WcTreeProps>

const WcTree: Model = props => {
 const {
  request,
  treeData: treeData_,
  onChange,
  onCheck,
  checkable = true,
  value = Wc.arr,
  className = '',
  ...restProps
 } = props
 const [treeData, setTreeData] = useState(treeData_)

 useEffect(() => {
  request ? request().then(setTreeData) : setTreeData(treeData_)
 }, [treeData_, request])

 const checkHandle: TreeProps['onCheck'] = (keys, ...rest) => {
  onChange?.(keys, ...rest)
  onCheck?.(keys, ...rest)
 }

 return (
  <Tree
   className={`${styles.wrap} ${className}`}
   checkable={checkable}
   autoExpandParent
   defaultExpandAll
   {...restProps}
   onCheck={checkHandle}
   treeData={treeData}
   checkedKeys={Array.isArray(value) ? value : [value]}
  />
 )
}

export default React.memo<Model>(WcTree)