import { useWcConfig } from '@src/hooks'
import React, { useEffect, useMemo, useRef } from 'react'
import WcBaseTable, { WcBaseTableProps, BaseActionRef } from '../Base'

export interface HistoryAtionRef extends BaseActionRef {
 clearAllHistory(): any
 clearHistory(key: string): any
}

export interface WcHistoryTableProps<T extends AO = AO> extends WcBaseTableProps<T> {
 /**
  * @description 开启缓存
  */
 history?: boolean
 getFeature?(requestParams?: AO): any
}

type Model = React.FC<WcHistoryTableProps>

const WcHistoryTable: Model = ({
 history = true,
 getFeature = () => '',
 actionRef: actionRef_ = {},
 composeRequest: composeRequest_,
 Render = WcBaseTable,
 ...props
}) => {
 const actionRef = useRef<BaseActionRef>()
 const { wcConfig } = useWcConfig()
 const historyMap = useMemo(() => new Map<any, Map<any, AO>>(), [])

 const composeRequest: WcBaseTableProps['composeRequest'] = history ? async (params, f) => {
  const feature = getFeature(params)
  const currentHistory = historyMap.get(feature) || new Map()
  const currentPage = params[wcConfig.requestPageKey]
  historyMap.set(feature, currentHistory)

  return currentHistory.get(currentPage)
   ?? currentHistory
    .set(currentPage, await (composeRequest_ ? composeRequest_(params, f) : f?.(params)))
    .get(currentPage)
 } : composeRequest_

 useEffect(() => {
  if (!actionRef.current) return
  const action: HistoryAtionRef = {
   ...actionRef.current,
   clearAllHistory() {
    historyMap.clear()
   },
   clearHistory(feature) {
    historyMap.delete(feature)
   },
  }
  const actionRefArr = Array.isArray(actionRef_) ? actionRef_ : [actionRef_]
  actionRefArr.forEach(ref => ref.current = action)
 })


 return (
  <Render
   actionRef={actionRef}
   composeRequest={composeRequest}
   {...props}
  />
 )
}

export default React.memo<Model>(WcHistoryTable)
