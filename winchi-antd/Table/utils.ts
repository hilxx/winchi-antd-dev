import type { WcBaseTableProps } from './Base';

export const getDefaultConfig = ({
  pageSize = 40,
  propData = 'data',
  propTotal = 'total',
  requestPageKey = 'page',
  requestPageSizeKey = 'pageSize',
}: Partial<WcBaseTableProps>) => ({
  pageSize,
  propData,
  propTotal,
  requestPageKey,
  requestPageSizeKey,
});
