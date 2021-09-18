import React from 'react'
import styles from './index.less'

export interface WcUploadProps {

}

type Model = React.FC<WcUploadProps>

const WcUpload: Model = ({...props}) => {

 return (
  <section className={styles.wrap}>

  </section>
 )
}

export default React.memo<Model>(WcUpload)