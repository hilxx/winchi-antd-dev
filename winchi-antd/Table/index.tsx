import type { WcFilterTableProps, FilterActionRef } from './FilterTable';
import WcFilterTable from './FilterTable';

export type ActionRef = FilterActionRef;

export type WcTableProps<T extends AO = AO> = WcFilterTableProps<T>;

export default WcFilterTable;
