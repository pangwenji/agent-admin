/* eslint-disable no-magic-numbers */

import { onMounted, onUnmounted, ref } from 'vue'
import {
  LotteryOddsItem,
  LotteryTrickItem,
  OddsListVOListItem,
  WagerOddsChangeData,
  WagerOddsChangeItem
} from '@/api/instantWager/types'
import websocketTools from '@/utils/websocket'

export const refreshOptions = [
  { label: '手动', value: 0 },
  { label: '10秒', value: 10 },
  { label: '20秒', value: 20 },
  { label: '30秒', value: 30 },
  { label: '40秒', value: 40 },
  { label: '50秒', value: 50 }
]

export const formatNumPadding = (num: number) => {
  const limit = 10
  if (num < limit) {
    return `0${num}`
  } else {
    return num
  }
}

export const enum CalFloatType {
  Add = 1,
  Minus
}

export const calFloatNum = (a: number, b: number) => {
  // 设置一个精度（10^9，这里使用9位小数）
  const precision = 1e9
  // 将浮点数转换为整数
  const A = Math.round(a * precision)
  const B = Math.round(b * precision)
  // 执行整数加法
  const resultInt = A + B
  // 将结果转换回浮点数并恢复精度
  const result = resultInt / precision
  return result
}

export const InstantWagerRootKey = Symbol('fromInstantWagerRoot')
export const InstantWagerCalStep = 0.001

// 合并金额/盈亏列
const mergeVOLList = (
  oddsListVOList: OddsListVOListItem[],
  totalConfig?: { profitAndLossAmount: number; totalAmount: number; actualAmount: number }
) => {
  return oddsListVOList.map((item, index, array) => {
    if (index === 0) {
      const config =
        totalConfig ||
        array.reduce(
          (res, item) => {
            return {
              profitAndLossAmount: res.profitAndLossAmount + item.profitAndLossAmount,
              totalAmount: res.totalAmount + item.totalAmount,
              actualAmount: res.actualAmount + item.actualAmount
            }
          },
          {
            profitAndLossAmount: 0,
            totalAmount: 0,
            actualAmount: 0
          }
        )
      return {
        ...item,
        ...config,
        spanConfig: { rowspan: array.length, colspan: 1 }
      }
    } else {
      return {
        ...item,
        spanConfig: { rowspan: 0, colspan: 0 }
      }
    }
  })
}

// 处理玩法合并
const mergeReduce = (originList: LotteryOddsItem[], playTypeName: string) => {
  return (
    originList?.length &&
    originList.reduce(
      (res, item) => {
        return {
          ...res,
          profitAndLossAmount: res.profitAndLossAmount + item.profitAndLossAmount,
          totalAmount: res.totalAmount + item.totalAmount,
          actualAmount: res.actualAmount + item.actualAmount,
          oddsListVOList: [...res.oddsListVOList, ...item.oddsListVOList]
        }
      },
      {
        ...originList[0],
        playTypeName: playTypeName,
        oddsListVOList: [],
        profitAndLossAmount: 0,
        totalAmount: 0,
        actualAmount: 0
      }
    )
  )
}

const QXC_POSITION = '定位'
const QXC_CHAR = '字现'
export const formatQXCLotteryOddsList = (lotteryOddsList: LotteryOddsItem[]) => {
  const POSITION_LIST: LotteryOddsItem[] = []
  const CHAR_LIST: LotteryOddsItem[] = []
  const result: LotteryOddsItem[] = []
  lotteryOddsList.forEach((oddItem) => {
    if (oddItem.playTypeCode.endsWith('DW')) {
      POSITION_LIST.push(oddItem)
    } else if (oddItem.playTypeCode.endsWith('ZX')) {
      oddItem.oddsListVOList = mergeVOLList(oddItem.oddsListVOList, {
        profitAndLossAmount: oddItem.profitAndLossAmount,
        actualAmount: oddItem.actualAmount,
        totalAmount: oddItem.totalAmount
      })
      CHAR_LIST.push(oddItem)
    } else {
      result.push(oddItem)
    }
  })

  const mergePositionGroup = mergeReduce(POSITION_LIST, QXC_POSITION)

  const mergeCharGroup = mergeReduce(CHAR_LIST, QXC_CHAR)

  return [mergePositionGroup, mergeCharGroup, ...result].filter(Boolean) as LotteryOddsItem[]
}

const LHC_NOT = '不中'
const LHC_NOT_REX = /^ZX\w+BZ$/
const LHC_LM = '连码'
const LHC_LM_REX = /^LM\w+/
const LHC_LX_REX = /^\w+LX$/ // 连肖
const LHC_LW_REX = /^\w+LW$/ // 连尾
export const formatLHCLotteryOddsList = (lotteryOddsList: LotteryOddsItem[]) => {
  const result: LotteryOddsItem[] = []
  const NOT_LIST: LotteryOddsItem[] = []
  const LM_LIST: LotteryOddsItem[] = []
  lotteryOddsList.forEach((oddItem) => {
    if (LHC_NOT_REX.test(oddItem.playTypeCode)) {
      NOT_LIST.push(oddItem)
    } else if (LHC_LM_REX.test(oddItem.playTypeCode)) {
      if (oddItem.playTypeCode === 'LMSZE') {
        oddItem.oddsListVOList = mergeVOLList(oddItem.oddsListVOList, {
          profitAndLossAmount: oddItem.profitAndLossAmount,
          actualAmount: oddItem.actualAmount,
          totalAmount: oddItem.totalAmount
        })
      }
      LM_LIST.push(oddItem)
    } else if (
      // 2-5连肖合并
      (LHC_LX_REX.test(oddItem.playTypeCode) && oddItem.playTypeCode !== 'YILX') ||
      // 连尾合并
      LHC_LW_REX.test(oddItem.playTypeCode) ||
      // 特码合肖合并
      oddItem.playTypeCode === 'TMHX'
    ) {
      // 合并金额
      oddItem.oddsListVOList = mergeVOLList(oddItem.oddsListVOList, {
        profitAndLossAmount: oddItem.profitAndLossAmount,
        actualAmount: oddItem.actualAmount,
        totalAmount: oddItem.totalAmount
      })
      result.push(oddItem)
    } else {
      result.push(oddItem)
    }
  })

  const mergeNotGroup = mergeReduce(NOT_LIST, LHC_NOT)
  const mergeLMGroup = mergeReduce(LM_LIST, LHC_LM)
  return [...result, mergeLMGroup, mergeNotGroup].filter(Boolean) as LotteryOddsItem[]
}

// 加拿大4.2-4.6 / 加拿大5.0
export const formatJND45LotteryOddsList = (lotteryOddsList: LotteryOddsItem[]) => {
  const result: LotteryOddsItem[] = []

  lotteryOddsList.forEach((oddItem) => {
    // 合并大小单双
    if (oddItem.playTypeCode === 'DXDS') {
      const commonList = oddItem.oddsListVOList.filter((item) => item.playCode === 'COMMON')
      const specialList = oddItem.oddsListVOList.filter((item) => item.playCode === 'SPECIAL')
      const result: OddsListVOListItem[] = []
      commonList.forEach((volItem) => {
        const specialVOLItem = specialList.find(
          (sItem) => sItem.playName === `${volItem.playName}2`
        )

        const commonVOLItem: OddsListVOListItem = {
          ...volItem,
          totalAmount: volItem.totalAmount + (specialVOLItem?.totalAmount || 0),
          actualAmount: volItem.actualAmount + (specialVOLItem?.actualAmount || 0),
          profitAndLossAmount:
            volItem.profitAndLossAmount + (specialVOLItem?.profitAndLossAmount || 0),
          spanConfig: {
            rowspan: 2,
            colspan: 1
          }
        }
        result.push(commonVOLItem)
        if (specialVOLItem) {
          specialVOLItem.spanConfig = {
            rowspan: 0,
            colspan: 0
          }
          result.push(specialVOLItem)
        }
      })

      oddItem.oddsListVOList = result
    }
    result.push(oddItem)
  })

  return result.filter(Boolean) as LotteryOddsItem[]
}

// pc牛牛
export const formatPCNNLotteryOddsList = (lotteryOddsList: LotteryOddsItem[]) => {
  const result: LotteryOddsItem[] = []

  lotteryOddsList.forEach((oddItem) => {
    oddItem.oddsListVOList = mergeVOLList(oddItem.oddsListVOList, {
      profitAndLossAmount: oddItem.profitAndLossAmount,
      actualAmount: oddItem.actualAmount,
      totalAmount: oddItem.totalAmount
    })
    result.push(oddItem)
  })

  return result
}

// 币安比特币
export const formatBTCLotteryOddsList = (lotteryOddsList: LotteryOddsItem[]) => {
  const result: LotteryOddsItem[] = []
  const ballTricks: LotteryOddsItem[] = [] // 1-5 球
  lotteryOddsList.forEach((oddItem) => {
    if (/^\w+W$/.test(oddItem.playTypeCode)) {
      ballTricks.push(oddItem)
    } else {
      result.push(oddItem)
    }
  })
  result.splice(1, 0, ...ballTricks)
  return result
}

// 处理按钮组下拉框
const mergeOptions = (originList: LotteryTrickItem[], playTypeName: string) => {
  return (
    originList?.length &&
    originList.reduce(
      (res, item) => {
        return {
          ...res,
          profitAndLossAmount: res.profitAndLossAmount + item.profitAndLossAmount,
          totalAmount: res.totalAmount + item.totalAmount,
          actualAmount: res.actualAmount + item.actualAmount
        }
      },
      {
        ...originList[0],
        playTypeName,
        profitAndLossAmount: 0,
        totalAmount: 0,
        actualAmount: 0,
        options: originList
      }
    )
  )
}
const CODE_SPECIAL_REX = /^Z\w+T$/
const LW_REX = /\w+LW$/
const LX_REX = /\w+LX$/
// 六合彩玩法按钮组数据处理
export const formatLHCLotteryTricksList = (trickList: LotteryTrickItem[]) => {
  const CODE_SPECIAL_LIST: LotteryTrickItem[] = [] // 正特
  const LW_LIST: LotteryTrickItem[] = [] // 连尾
  const LX_LIST: LotteryTrickItem[] = [] // 连肖
  const result: LotteryTrickItem[] = []

  trickList.forEach((oddItem) => {
    const playTypeCode = oddItem.playTypeCode
    if (CODE_SPECIAL_REX.test(playTypeCode)) {
      CODE_SPECIAL_LIST.push(oddItem)
    } else if (LW_REX.test(playTypeCode)) {
      LW_LIST.push(oddItem)
    } else if (LX_REX.test(playTypeCode)) {
      LX_LIST.push(oddItem)
    } else {
      result.push(oddItem)
    }
  })

  const getTargetIndex = (playTypeCode: string) => {
    const index = result.findIndex((trick) => trick.playTypeCode === playTypeCode)
    return index > -1 ? index : result.length - 1
  }

  const codeSpecialMergeGroup = mergeOptions(CODE_SPECIAL_LIST, '正特')
  if (codeSpecialMergeGroup) {
    const index = getTargetIndex('ZM')
    result.splice(index + 1, 0, codeSpecialMergeGroup)
  }

  const LWMergeGroup = mergeOptions(LW_LIST, '连尾')
  if (LWMergeGroup) {
    const index = getTargetIndex('WEIS')
    result.splice(index + 1, 0, LWMergeGroup)
  }

  const LXMergeGroup = mergeOptions(LX_LIST, '连肖')
  if (LXMergeGroup) {
    const index = getTargetIndex('WEIS')
    result.splice(index + 1, 0, LXMergeGroup)
  }

  return [...result].filter(Boolean) as LotteryTrickItem[]
}

// 监听即时注单变动
export const useInstantWagerChange = () => {
  const changedOddsList = ref<WagerOddsChangeItem[]>([])
  const handleWagerChange = (event: MessageEvent) => {
    try {
      const data = event.data
      const result = (typeof data === 'string' ? JSON.parse(data) : data) as WagerOddsChangeData
      result.message = JSON.parse(result.message as any)
      console.log('useInstantWagerChange => ', event.data, result)
      if (result?.messageType === 8 && Array.isArray(result.message)) {
        changedOddsList.value = result.message
      }
    } catch {}
  }
  onMounted(() => {
    websocketTools.init()
    websocketTools.addMsgListener(handleWagerChange)
  })
  onUnmounted(() => {
    websocketTools.removeMsgListener()
    websocketTools.close()
  })
  return {
    changedOddsList
  }
}
