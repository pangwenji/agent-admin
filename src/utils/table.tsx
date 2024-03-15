import { convert2Percent, formatMoneyWithPrecision } from './number'
import { TableColumn } from '@/components/Table'

export const createPercentCol = (col: TableColumn) => {
  return {
    ...col,
    slots: {
      ...col.slots,
      default(data) {
        if (!col.field) return
        if (data.row[col.field] === null) {
          return '-'
        }
        return convert2Percent(data.row[col.field], 2)
      }
    }
  } as TableColumn
}

export const createMoneyCol = (col: TableColumn) => {
  return {
    ...col,
    slots: {
      ...col.slots,
      default: (data: any) => {
        if (!col.field) return
        return formatMoneyWithPrecision(data.row[col.field]) || null
      }
    }
  } as TableColumn
}

export const createMoneyCols = (cols: TableColumn[]) => {
  return cols.map(createMoneyCol)
}
