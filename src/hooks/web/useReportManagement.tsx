import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import { ElButton, ElMessage } from 'element-plus'
import SearchTimeRange from '@/components/SearchTimeRange/index.vue'
import { getCurrentMonthFirstAndLast } from '@/components/SearchTimeRange/tools'
import { createMoneyCol, createMoneyCols, createPercentCol } from '@/utils/table'
import { ReportGameType, ReportRecordItem } from '@/api/reportManagement/types'
import { useClipboard } from '@/hooks/web/useClipboard'
import { useIcon } from './useIcon'

const { copy } = useClipboard()
const icon = useIcon({ icon: 'mingcute:copy-line' })
export const TimeRangeColKey = 'timeRange'
const { firstDayOfMonth, endDayOfMonth } = getCurrentMonthFirstAndLast()
const timeRangeCol: CrudSchema = {
  label: '投注时间',
  field: TimeRangeColKey,
  table: {
    hidden: true
  },
  search: {
    value: [firstDayOfMonth, endDayOfMonth],
    hidden: false,
    formItemProps: {
      slots: {
        default(modelValue) {
          return <SearchTimeRange v-model={modelValue[TimeRangeColKey]} />
        }
      }
    }
  }
}

const createResultSlots = (key: string): CrudSchema['slots'] => {
  return {
    default({ row }: { row: ReportRecordItem }) {
      return row[key] || 0 // 默认 0
    }
  }
}

const playerResultSlots: CrudSchema['slots'] = {
  default({ row }: { row: ReportRecordItem }) {
    const playerResult = row.playerResult
    return !playerResult ? 0 : playerResult > 0 ? `+${playerResult}` : playerResult // 默认 0
  }
}

export const commonReportResultTitles: CrudSchema[] = [
  {
    label: '会员结果',
    field: 'playerResult',
    slots: playerResultSlots
  },
  {
    label: '总公司结果',
    field: 'parentCompanyResult',
    slots: createResultSlots('parentCompanyResult')
  },
  {
    label: '分公司結果',
    field: 'subCompanyResult',
    slots: createResultSlots('subCompanyResult')
  },
  {
    label: '一級代理結果',
    field: 'agentL1Result',
    slots: createResultSlots('agentL1Result')
  },
  {
    label: '二級代理結果',
    field: 'agentL2Result',
    slots: createResultSlots('agentL2Result')
  },
  {
    label: '三級代理結果',
    field: 'agentL3Result',
    slots: createResultSlots('agentL3Result')
  }
]

const commonTilte: CrudSchema[] = [
  { label: '注单筆數', field: 'betCount' },
  ...createMoneyCols([
    { label: '投注金額', field: 'betAmount' },
    { label: '有效投注', field: 'validAmount' },
    { label: '返水', field: 'rebate' },
    { label: '赚水', field: 'getRebate' },
    { label: '赚赔', field: 'getOdd' },
    { label: '上交货量', field: 'handOverAmount' },
    { label: '上级交收', field: 'handOverResult' }
  ]),
  timeRangeCol
]

export const primaryAgentTableTitle: CrudSchema[] = [
  {
    label: '账号',
    field: 'account',
    search: {
      hidden: false
    }
  },
  ...commonTilte
]

// 会员级别表格配置
export const memberTableTitle: CrudSchema[] = [
  {
    label: '会员账号',
    field: 'account',
    search: {
      hidden: false
    }
  },
  {
    label: '注单笔数',
    field: 'betCount'
  },
  ...createMoneyCols([
    {
      label: '投注金额',
      field: 'betAmount'
    },
    { label: '有效投注', field: 'validAmount' },
    { label: '返水', field: 'rebate' },
    { label: '赚水', field: 'getRebate' },
    { label: '赚赔', field: 'getOdd' },
    { label: '会员结果', field: 'playerResult', slots: playerResultSlots },
    { label: '三级代理结果', field: 'agentL3Result' },
    { label: '上交货量', field: 'handOverAmount' },
    { label: '上级交收', field: 'handOverResult' }
  ]),
  timeRangeCol
]

export const ReportGameTypeOptions = [
  { label: '彩票', value: ReportGameType.Lottery },
  { label: '视讯', value: ReportGameType.Video },
  { label: '体育', value: ReportGameType.Sports }
]

// 详细注单表格配置
export const detailedNoteTitle: CrudSchema[] = [
  {
    label: '注单编号',
    field: 'orderDetailNo',
    fixed: 'left',
    slots: {
      default({ row }) {
        return (
          <div class="flex justify-between items-center">
            <div class="truncate flex-1">{row.orderDetailNo}</div>
            <ElButton
              icon={icon}
              style={{
                height: 'auto',
                border: 'none',
                padding: '4px',
                paddingBottom: 0
              }}
              onClick={async () => {
                try {
                  await copy(row.orderDetailNo)
                  ElMessage.success('复制成功')
                } catch {
                  ElMessage.success('复制失败')
                }
              }}
            />
          </div>
        )
      }
    }
  },
  { label: '投注时间', field: 'betDate' },
  { label: '游戏名称', field: 'gameName' },
  { label: '游戏期数', field: 'gamePeriod' },
  createMoneyCol({ label: '投注金额', field: 'betAmount' }),
  { label: '有效投注', field: 'effectiveBet' },
  { label: '玩法', field: 'playType' },
  { label: '赔率', field: 'odd' },
  { label: '投注内容', field: 'betContent' },
  { label: '输赢结果', field: 'winOrLoss' },
  ...createMoneyCols([
    { label: '返水金额', field: 'rebateAmount' },
    { label: '派彩金额', field: 'rewardAmount' },
    { label: '输赢金额', field: 'winOrLossAmount' }
  ]),
  { label: '会员结果', field: 'playerResult', slots: playerResultSlots },
  createPercentCol({
    label: '三级代理',
    field: 'agentL3Percentage'
  }),
  createPercentCol({
    label: '二级代理',
    field: 'agentL2Percentage'
  }),
  createPercentCol({
    label: '一级代理',
    field: 'agentL1Percentage'
  }),
  createPercentCol({
    label: '分公司',
    field: 'subCompanyPercentage'
  }),
  createPercentCol({
    label: '总公司',
    field: 'parentCompanyPercentage'
  }),
  // detailOrderStatusCol,
  timeRangeCol
]

const branchCommonTableTitle = [
  {
    label: '注单笔数',
    field: 'betCount'
  },
  ...createMoneyCols([
    {
      label: '投注金额',
      field: 'betAmount'
    },
    { label: '有效投注', field: 'validAmount' },
    { label: '返水', field: 'rebate' },
    { label: '赚水', field: 'getRebate' },
    { label: '赚赔', field: 'getOdd' }
  ]),
  timeRangeCol
]
export const headerquartersTableTitle: CrudSchema[] = [
  {
    label: '类型',
    field: 'type',
    width: '120px'
  },
  ...branchCommonTableTitle
]

export const branchOfficeTableTitle: CrudSchema[] = [
  {
    label: '分公司账号',
    field: 'account',
    search: {
      hidden: false
    }
  },
  ...branchCommonTableTitle
]

export const lotterResult: CrudSchema[] = [
  { label: '游戏期数', field: 'periodsNumber' },
  { label: '开奖时间', field: 'startBillTime' },
  { label: '开奖结果', field: 'drawingResult' },
  { label: '注单数量', field: 'betNum' },
  { label: '投注人数', field: 'rebate' },
  { label: '投注总额', field: 'totalAmount' },
  { label: '派彩总额', field: 'rewardAmount' },
  { label: '系统盈亏', field: 'playerResult' }
]
