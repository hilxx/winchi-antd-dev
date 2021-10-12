import type { WcFilterTableProps, FilterActionRef } from './FilterTable'
import WcFilterTable from './FilterTable'
import type { TableHandleKeys } from '../'

export type Handles<T extends AO = AO> = Partial<Record<TableHandleKeys, (row: T | T[]) => any>>

export type ActionRef = FilterActionRef

export type WcTableProps<T extends AO = AO> = WcFilterTableProps<T>

export default WcFilterTable

