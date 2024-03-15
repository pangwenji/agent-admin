/* eslint-disable no-magic-numbers */
/* eslint-disable no-param-reassign */
import { reactive } from 'vue'

export const tableNoteTile = reactive([
  { prop: 'orderDate', label: '投注时间' },
  { prop: 'userName', label: '会员账号' },
  { prop: 'lotteryName', label: '游戏名称' },
  { prop: 'periodsNumber', label: '游戏期数' },
  { prop: 'betAmount', label: '投注金额' },
  { prop: 'validAmount', label: '有效投注' },
  { prop: 'playName', label: '玩法' },
  { prop: 'odds', label: '赔率' },
  { prop: 'betContent', label: '投注内容' },
  { prop: 'runningAmount', label: '流水金额' },
  { prop: 'returnAmount', label: '返水' }
])

export const shortcutTimeOptions = reactive([
  { label: '快捷时间', value: 0 },
  { label: '今天', value: 1 },
  { label: '本周', value: 2 },
  { label: '本月', value: 3 }
])

export const statistics = (str) => {
  const template: Array<string> = str.split(',')
  const sum = template.reduce((pre, cur) => Number(pre) + Number(cur), 0)
  return sum
}

// 过滤非数字字符
export const commonHandleInput = (event) => event.replace(/\D/g, '')
