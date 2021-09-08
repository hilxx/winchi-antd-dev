import React from 'react'
import { Button } from 'antd'
import Table, { WcTableProps } from '..'
import styles from './index.less'

export interface WcHeaderTableProps<T extends AO = AO> extends WcTableProps<T> {
 add?: React.ReactNode
 onAdd?: AF
}

type Model = React.FC<WcHeaderTableProps>

const WcHeaderTable: Model = ({
 add,
 onAdd,
 ...props
}) => {

 const addJSX = add !== undefined ? add : (
  <Button onClick={onAdd} type='primary'>新增</Button>
 )

 return (
  <main className={styles.wrap}>
   <header>
    {addJSX}
   </header>
   <Table {...props} />
  </main>
 )
}

export default React.memo<Model>(WcHeaderTable)