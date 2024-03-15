export type ProTableColumn = {
  title: string
  key?: string
  dataKey: string
  width?: number
  minWidth?: number
  flexGrow?: number
  hidden?: boolean
  cellRenderer?: (cellData: any) => JSX.Element
}
