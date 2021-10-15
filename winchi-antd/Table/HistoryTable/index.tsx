import React, { useEffect, useMemo, useRef } from 'react';
import WcBaseTable, { WcBaseTableProps, BaseActionRef } from '../Base';
import { getDefaultConfig } from '../utils';

export interface HistoryAtionRef extends BaseActionRef {
  clearAllHistory(): any;
  /** 不传feature，默认全部清除 */
  clearHistory(feature?: string): any;
}

export interface WcHistoryTableProps<T extends AO = AO, N extends AO = WcBaseTableProps>
  extends WcBaseTableProps<T, N> {
  /**
   * @description 开启缓存
   */
  history?: boolean;
  /** 拿到缓存特征，如不同的tabs */
  getFeature?(requestParams?: AO): any;
}

type Model = React.FC<WcHistoryTableProps>;

const WcHistoryTable: Model = ({
  history = true,
  getFeature = () => '',
  actionRef: actionRef_ = {},
  composeRequest: composeRequest_,
  children,
  ...props
}) => {
  const actionRef = useRef<BaseActionRef>();
  const historyMap = useMemo(() => new Map<any, Map<any, AO>>(), []);

  const composeRequest: WcBaseTableProps['composeRequest'] = history
    ? async (f, params) => {
        const feature = getFeature(params);
        const currentHistory = historyMap.get(feature) || new Map();
        const currentPage = params[getDefaultConfig(props).requestPageKey];
        historyMap.set(feature, currentHistory);
        return (
          currentHistory.get(currentPage) ??
          currentHistory
            .set(currentPage, await (composeRequest_ ? composeRequest_(f, params) : f?.(params)))
            .get(currentPage)
        );
      }
    : composeRequest_;

  useEffect(() => {
    if (!actionRef.current) return;
    const action: HistoryAtionRef = {
      ...actionRef.current,
      clearAllHistory() {
        historyMap.clear();
      },
      clearHistory(feature) {
        feature === undefined ? historyMap.clear() : historyMap.delete(feature);
      },
    };
    const actionRefArr = Array.isArray(actionRef_) ? actionRef_ : [actionRef_];
    actionRefArr.forEach((ref) => (ref.current = action));
  });

  const childrenProps: WcBaseTableProps = {
    actionRef: actionRef,
    composeRequest: composeRequest,
    ...props,
  };

  return children ? children(WcBaseTable, childrenProps) : <WcBaseTable {...childrenProps} />;
};

export default React.memo<Model>(WcHistoryTable);
