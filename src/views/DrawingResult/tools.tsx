/* eslint-disable no-magic-numbers */
import { Ref, computed, onMounted, reactive, ref, unref, watch } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import {
  cancelOrder,
  flyOpenOrder,
  getOrderPercentageDetail,
  queryGameOrderList,
  querySportsOrderList
} from '@/api/drawingResult'
import {
  GameOrderItem,
  GameOrderStatus,
  GameOrderStatusEnums,
  OrderStatusMap,
  PercentDetailData,
  SportsDrawingType,
  WinAndLoseStatusEnums
} from '@/api/drawingResult/types'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import router, { CommonRoutePaths } from '@/router'
import { useRoute } from 'vue-router'
import { TimeRangeColKey } from '@/hooks/web/useReportManagement'
import { useTable } from '@/hooks/web/useTable'
import { createMoneyCol, createMoneyCols } from '@/utils/table'
import { getTodayStartAndEnd } from '@/components/SearchTimeRange/tools'
import SearchTimeRange from '@/components/SearchTimeRange/index.vue'
import { formatCommonTime } from '@/utils'
import { useClipboard } from '@/hooks/web/useClipboard'
import { useIcon } from '@/hooks/web/useIcon'
import { LotteryItem } from '@/api/account/types'
import { getLotteryListApi } from '@/api/account'

export const gotoSportsOrderList = async (query: {
  matchId: string
  sportsType: SportsDrawingType
}) => {
  router.push({
    path: CommonRoutePaths.SportsGameOrder,
    query
  })
}

// 开奖注单类型
export const enum DrawingOrderType {
  Lottery = 1,
  Sports,
  Video
}

const settledOptions = [
  { label: '全部', value: 0 },
  { label: '未结算', value: 1 },
  { label: '已结算', value: 2 }
]

const useLotteryOrderTable = (searchParams: Ref<Record<string, any>>) => {
  const route = useRoute()

  const settlesStatus = ref(0)
  // 切换订单状态，表单重置
  watch(settlesStatus, () => {
    const params = unref(searchParams)
    searchParams.value = params?.[TimeRangeColKey]
      ? {
          [TimeRangeColKey]: params[TimeRangeColKey]
        }
      : {}
    tableMethods.refreshNReset()
  })

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState
      const { periodsNumber, lotteryCode } = route.query

      const params = unref(searchParams)
      const timeRange = params?.[TimeRangeColKey]
      const unrefStatus = unref(settlesStatus)
      const status = unrefStatus ? Boolean(unrefStatus - 1) : undefined
      const res = await queryGameOrderList(
        {
          current: unref(currentPage),
          size: unref(pageSize),
          lotteryCode: lotteryCode as string,
          ...(periodsNumber
            ? { periodsNumber: Number(periodsNumber) ? Number(periodsNumber) : null }
            : timeRange
              ? {
                  startTime: formatCommonTime(timeRange[0]),
                  endTime: formatCommonTime(timeRange[1])
                }
              : {}),
          ...params
        },
        status
      )
      return {
        list: res.data.data,
        total: res.data.total
      }
    }
  })

  return { tableRegister, tableState, tableMethods, settlesStatus }
}

const useSportsOrderTable = (searchParams: Ref<Record<string, any>>) => {
  const route = useRoute()

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState
      const { matchId, sportsType } = route.query as unknown as {
        matchId: string
        sportsType: SportsDrawingType
      }

      const params = unref(searchParams)
      const timeRange = params?.[TimeRangeColKey]
      const res = await querySportsOrderList({
        current: unref(currentPage),
        size: unref(pageSize),
        matchId,
        sportsType,
        ...(timeRange
          ? {
              startTime: formatCommonTime(timeRange[0]),
              endTime: formatCommonTime(timeRange[1])
            }
          : {}),
        ...params
      })
      return {
        list: res.data.records,
        total: res.data.total
      }
    }
  })

  return { tableRegister, tableState, tableMethods }
}

const { copy } = useClipboard()
const icon = useIcon({ icon: 'mingcute:copy-line' })

export const useDrawingOrderList = (orderType: DrawingOrderType = DrawingOrderType.Lottery) => {
  const isLottery = orderType === DrawingOrderType.Lottery
  const lotteryList = ref<LotteryItem[]>([])
  const route = useRoute()

  const commonOrderNoSchema = {
    field: 'orderDetailNo',
    label: '注单编号',
    minWidth: 170,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    slots: {
      default({ row }) {
        return (
          <div class="flex justify-between items-center">
            {/* <div class="truncate flex-1">{row.orderDetailNo}</div>
             */}
            <ElButton type="primary" class="flex-1 truncate" link onClick={() => detailAction(row)}>
              {row.orderDetailNo}
            </ElButton>
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
    },
    detail: {
      hidden: true
    }
  }

  // 获取彩票列表得到盘口数据
  onMounted(() => {
    if (isLottery) {
      const getLotteryList = async () => {
        const res = await getLotteryListApi()
        lotteryList.value = res.data
      }
      getLotteryList()
    }
  })
  const lotterySchemas = reactive<CrudSchema[]>([
    commonOrderNoSchema,
    {
      field: 'orderDate',
      label: '投注时间',
      minWidth: '168px',
      search: {
        hidden: true
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'userName',
      label: '会员账号',
      minWidth: '168px',
      detail: {
        span: 24
      }
    },
    {
      field: 'lotteryName',
      label: '游戏名称',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'periodsNumber',
      label: '游戏期数',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 12
      }
    },
    {
      field: 'handicapCode',
      label: '盘口',
      minWidth: 100,
      search: {
        hidden: true
      },
      detail: {
        span: 12
      },
      slots: {
        default({ row }: { row: GameOrderItem }) {
          const targetLottery = lotteryList.value.find(
            (lottery) => lottery.lotteryCode === route.query.lotteryCode
          )
          if (targetLottery) {
            const handicapLen = targetLottery.sysHandicapList?.length || 0
            return handicapLen < 2 ? '默认' : row.handicapCode
          }
          return row.handicapCode
        }
      }
    },
    ...createMoneyCols([
      {
        field: 'totalAmount',
        label: '投注金额',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      },
      {
        field: 'validAmount',
        label: '有效投注',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      }
    ]),
    {
      field: 'playName',
      label: '玩法',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'odds',
      label: '赔率',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'betContent',
      label: '投注內容',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    ...createMoneyCols([
      {
        field: 'runningAmount',
        label: '流水金额',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      },
      {
        field: 'returnAmount',
        label: '返水',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      }
    ]),
    {
      field: 'winAndLose',
      label: '会员输赢',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24,
        slots: {
          default(row: GameOrderItem | null) {
            if (row?.orderStatus === GameOrderStatus.Unsettled) {
              return '-'
            }
            return row && WinAndLoseStatusEnums[row?.winAndLose]
          }
        }
      },
      table: {
        slots: {
          default({ row }: { row: GameOrderItem | null }) {
            if (row?.orderStatus === GameOrderStatus.Unsettled) {
              return '-'
            }
            return row && WinAndLoseStatusEnums[row?.winAndLose]
          }
        }
      }
    },
    {
      field: 'orderStatus',
      label: '注单状态',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24,
        slots: {
          default(row: GameOrderItem | null) {
            return (row && GameOrderStatusEnums[row?.orderStatus]) || '未知状态'
          }
        }
      },
      table: {
        slots: {
          default({ row }: { row: GameOrderItem | null }) {
            return (row && GameOrderStatusEnums[row?.orderStatus]) || '未知状态'
          }
        }
      }
    },
    {
      field: 'action',
      label: '占成明细',
      minWidth: 90,
      fixed: 'right',
      className: 'action-col',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      detail: {
        hidden: true
      },
      table: {
        slots: {
          default: ({ row }: { row: GameOrderItem }) => {
            return (
              <ElButton key="delete" type="primary" text onClick={() => percentAction(row)}>
                明细
              </ElButton>
            )
          }
        }
      }
    },
    {
      field: 'action',
      label: '操作',
      minWidth: 160,
      fixed: 'right',
      className: 'action-col',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      detail: {
        hidden: true
      },
      table: {
        slots: {
          default({ row }: { row: GameOrderItem }) {
            return [
              <ElButton
                key="cancel"
                type="danger"
                text
                disabled={!row || OrderStatusMap.Settled.includes(row.orderStatus)}
                onClick={() => cancelAction(row)}
              >
                取消注单
              </ElButton>,
              row?.isFlyOpen === 1 && (
                <ElButton
                  key="delete"
                  type="primary"
                  text
                  disabled={row?.isManualFlyOpen === 1}
                  onClick={() => flyOpenAction(row)}
                >
                  走飞
                </ElButton>
              )
            ].filter(Boolean)
          }
        }
      }
    }
  ])

  const sportsSchemas = reactive<CrudSchema[]>([
    commonOrderNoSchema,
    {
      field: 'betDate',
      label: '投注时间',
      minWidth: '168px',
      search: {
        hidden: true
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'account',
      label: '会员账号',
      minWidth: '168px',
      detail: {
        span: 24
      }
    },
    {
      field: 'gameType',
      label: '游戏/盘口',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'gameTypeDetail',
      label: '联赛/主客',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    ...createMoneyCols([
      {
        field: 'betAmount',
        label: '投注金额',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      },
      {
        field: 'validAmount',
        label: '有效投注',
        minWidth: '168px',
        search: {
          hidden: true
        },
        detail: {
          span: 24
        }
      }
    ]),
    {
      field: 'playType',
      label: '玩法',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'odd',
      label: '赔率',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'betContent',
      label: '投注內容',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    createMoneyCol({
      field: 'runningAmount',
      label: '流水金额',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    }),
    {
      field: 'returnRatio',
      label: '返水',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    createMoneyCol({
      field: 'playerWinLoseAmount',
      label: '会员输赢',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    }),
    {
      field: 'orderStatus',
      label: '注单状态',
      width: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24,
        slots: {
          default(row: GameOrderItem | null) {
            return (row && GameOrderStatusEnums[row?.orderStatus]) || '未知状态'
          }
        }
      },
      table: {
        slots: {
          default({ row }: { row: GameOrderItem | null }) {
            return (row && GameOrderStatusEnums[row?.orderStatus]) || '未知状态'
          }
        }
      }
    },
    {
      field: 'currentPercentage',
      label: '本级占成',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    createMoneyCol({
      field: 'currentResult',
      label: '本级结果',
      minWidth: '168px',
      search: {
        hidden: true
      },
      detail: {
        span: 24
      }
    }),
    {
      field: 'action',
      label: '占成明细',
      minWidth: 90,
      fixed: 'right',
      className: 'action-col',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      detail: {
        hidden: true
      },
      table: {
        slots: {
          default: ({ row }: { row: GameOrderItem }) => {
            return (
              <ElButton key="delete" type="primary" text onClick={() => percentAction(row)}>
                明细
              </ElButton>
            )
          }
        }
      }
    }
  ])

  const wagerCrudSchemas = isLottery ? lotterySchemas : sportsSchemas

  if (!isLottery || !route.query.periodsNumber) {
    const { startOfDay, endOfDay } = getTodayStartAndEnd()
    wagerCrudSchemas.push({
      label: '投注时间',
      field: TimeRangeColKey,
      detail: {
        hidden: true
      },
      table: {
        hidden: true
      },
      search: {
        value: [startOfDay, endOfDay],
        hidden: false,
        formItemProps: {
          slots: {
            default(modelValue) {
              return <SearchTimeRange v-model={modelValue[TimeRangeColKey]} />
            }
          }
        }
      }
    })
  }

  const allSchemas = useCrudSchemas(wagerCrudSchemas).allSchemas

  const searchParams = ref(
    allSchemas.searchSchema.reduce((res, schema) => {
      return {
        ...res,
        ...(schema.value !== undefined && { [schema.field]: schema.value })
      }
    }, {})
  )
  const setSearchParams = (params: any) => {
    searchParams.value = params
    getList()
  }

  const { tableRegister, tableState, tableMethods, ...tableResults } = isLottery
    ? useLotteryOrderTable(searchParams)
    : useSportsOrderTable(searchParams)

  const { getList } = tableMethods

  const dialogVisible = ref(false)
  const dialogType = ref<'detail' | 'flyOpen' | 'cancel' | 'percent'>('detail')
  const dialogTitle = ref('')
  const closeDialog = () => {
    dialogVisible.value = false
    currentRow.value = null
  }
  const getDialogConfirm = computed(() => {
    switch (unref(dialogType)) {
      case 'cancel':
        return handleCancelOrder
      case 'flyOpen':
        return handleFlyOpenOrder
      default:
        return undefined
    }
  })

  const dialogWidth = computed(() => {
    switch (unref(dialogType)) {
      case 'cancel':
        return 400
      case 'flyOpen':
        return 400
      default:
        return 700
    }
  })

  const dialogState = {
    dialogVisible,
    dialogType,
    dialogTitle,
    closeDialog,
    getDialogConfirm,
    dialogWidth
  }

  const currentRow = ref<GameOrderItem | null>(null)

  const detailAction = (row: GameOrderItem) => {
    dialogTitle.value = '详情'
    dialogType.value = 'detail'
    currentRow.value = row
    dialogVisible.value = true
  }

  const flyOpenAction = (row: GameOrderItem) => {
    dialogTitle.value = '信息'
    dialogType.value = 'flyOpen'
    currentRow.value = row
    dialogVisible.value = true
  }
  const handleFlyOpenOrder = async () => {
    const row = unref(currentRow)
    if (!row) return false
    try {
      await flyOpenOrder({
        agentId: row.proxyId,
        orderDetailNo: row.orderDetailNo,
        isFlyOpen: 1
      })
      ElMessage.success('走飞成功！')
      getList()
      return true
    } catch (error) {
      ElMessage.error('走飞失败！')
    }
  }

  const cancelAction = (row: GameOrderItem) => {
    dialogTitle.value = '操作'
    dialogType.value = 'cancel'
    currentRow.value = row
    dialogVisible.value = true
  }
  const handleCancelOrder = async () => {
    const { lotteryCode } = route.query
    const row = unref(currentRow)
    if (!row) return false
    try {
      await cancelOrder({
        id: row.id,
        orderDetailNo: row.orderDetailNo,
        lotteryCode: lotteryCode as string
      })
      getList()
      ElMessage.success('取消注单成功！')
      return true
    } catch (error) {
      ElMessage.error('取消注单失败！')
    }
  }

  const percentData = ref<PercentDetailData>()
  const percentAction = async (row: GameOrderItem) => {
    const handler = ElMessage.info('查询明细中...')
    try {
      const res = await getOrderPercentageDetail(
        {
          orderDetailNo: row.orderDetailNo,
          agentId: row.proxyId
        },
        orderType
      )
      percentData.value = res.data
      dialogTitle.value = '占成明细'
      dialogType.value = 'percent'
      currentRow.value = row
      dialogVisible.value = true
    } catch (error) {
    } finally {
      handler.close()
    }
  }

  return {
    settledOptions,
    tableState,
    tableRegister,
    setSearchParams,
    dialogState,
    allSchemas,
    currentRow,
    percentData,
    ...tableResults
  }
}
