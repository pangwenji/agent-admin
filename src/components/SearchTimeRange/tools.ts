/* eslint-disable no-magic-numbers */
import { formatCommonTime } from '@/utils'

export const enum DefaultTimeType {
  None = 0,
  Today,
  Week,
  Month
}

export const getCurrentMonthFirstAndLast = () => {
  // 获取当前日期
  const currentDate = new Date()

  // 获取当前月份的第一天
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // 设置当前日期的时间为 23:59:59.999，即当天的结束时间
  const endDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59,
    999
  )

  return {
    firstDayOfMonth,
    endDayOfMonth
  }
}

export const getTodayStartAndEnd = () => {
  // 获取当前日期
  const currentDate = new Date()

  // 设置当前日期的时间为零时
  const startOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    0,
    0,
    0,
    0
  )

  // 设置当前日期的时间为 23:59:59.999，即当天的结束时间
  const endOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59,
    999
  )

  return {
    startOfDay,
    endOfDay
  }
}

export const getCurrentWeekStartAndEnd = () => {
  // 获取当前日期
  const currentDate = new Date()

  // 获取当前日期是星期几 (0 表示星期天, 1 表示星期一, 以此类推)
  const currentDayOfWeek = currentDate.getDay()

  // 计算当前日期所在周的第一天 (星期一) 的日期
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1))

  // 计算当前日期所在周的最后一天 (星期日) 的日期
  const endOfWeek = new Date(currentDate)

  // 设置时间为零时零分零秒
  startOfWeek.setHours(0, 0, 0, 0)
  endOfWeek.setHours(23, 59, 59, 999)

  return {
    startOfWeek,
    endOfWeek
  }
}

export const getDefaultTimeRange = (shortcutTime: DefaultTimeType) => {
  let result: Date[] | undefined = []
  switch (shortcutTime) {
    // 1 今日 2 本周 3 本月
    case DefaultTimeType.Today:
      const { startOfDay, endOfDay } = getTodayStartAndEnd()
      result[0] = startOfDay
      result[1] = endOfDay
      break
    case DefaultTimeType.Week:
      const { startOfWeek, endOfWeek } = getCurrentWeekStartAndEnd()
      result[0] = startOfWeek
      result[1] = endOfWeek
      break
    case DefaultTimeType.Month:
      const { firstDayOfMonth, endDayOfMonth } = getCurrentMonthFirstAndLast()
      result[0] = firstDayOfMonth
      result[1] = endDayOfMonth
      break
    default:
      result = undefined
  }
  return (result?.length ? result : undefined) as [Date, Date] | undefined
}
const isTimeRangeEqual = (timeRange: string[], timeRange2: string[]) => {
  return timeRange[0] === timeRange2[0] && timeRange[1] === timeRange2[1]
}
export const getDefaultTimeType = (timeRange?: (Date | string)[]) => {
  const rangeLen = 2
  if (timeRange?.length === rangeLen) {
    const result = timeRange!.map(formatCommonTime)
    const todayRange = getDefaultTimeRange(DefaultTimeType.Today)!.map(formatCommonTime)
    const weekRange = getDefaultTimeRange(DefaultTimeType.Week)!.map(formatCommonTime)
    const monthRange = getDefaultTimeRange(DefaultTimeType.Month)!.map(formatCommonTime)
    if (isTimeRangeEqual(result, todayRange)) {
      return DefaultTimeType.Today
    } else if (isTimeRangeEqual(result, weekRange)) {
      return DefaultTimeType.Week
    } else if (isTimeRangeEqual(result, monthRange)) {
      return DefaultTimeType.Month
    } else {
      return DefaultTimeType.None
    }
  } else {
    return DefaultTimeType.None
  }
}
