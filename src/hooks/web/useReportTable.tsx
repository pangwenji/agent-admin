import { computed, ref, reactive, onMounted } from 'vue'
import ReportActionButton from '@/views/ReportManagement/components/ReportActionButton.vue'

import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import {
  headerquartersTableTitle,
  memberTableTitle,
  branchOfficeTableTitle,
  primaryAgentTableTitle,
  TimeRangeColKey,
  commonReportResultTitles
} from '@/hooks/web/useReportManagement'
import { ReportRecordType, ReportRecordItem, ReportGameType } from '@/api/reportManagement/types'
import { AgentLevel, AgentType } from '@/enum'
import { formatCommonTime } from '@/utils'
import { formatMoneyWithPrecision } from '@/utils/number'

import type { ComputedRef } from 'vue'
import type { HeaderquartersTitleItem, ReportTableParams } from '@/views/ReportManagement/types'
import { AccountAgentInfo } from '@/api/account/types'

const ActionCols = ['betCount', 'betAmount']
const formatActionCols = (row: any, key: string) => {
  if (key === 'betAmount') {
    return formatMoneyWithPrecision(row[key])
  } else {
    return row[key]
  }
}

export const enum RootTableType {
  Root = 1,
  RootClassified,
  BranchList,
  BranchClassified,
  PrimaryAgentList,
  PrimaryAgentClassified,
  SecondaryAgentList,
  SecondaryAgentClassified,
  TertiaryAgentList,
  TertiaryAgentClassified,
  MemberList,
  MemberDetail
}

const ListClassifiedTypeMap = new Map([
  [RootTableType.Root, RootTableType.RootClassified],
  [RootTableType.BranchList, RootTableType.BranchClassified],
  [RootTableType.PrimaryAgentList, RootTableType.PrimaryAgentClassified],
  [RootTableType.SecondaryAgentList, RootTableType.SecondaryAgentClassified],
  [RootTableType.TertiaryAgentList, RootTableType.TertiaryAgentClassified]
])

// 根据当前登录代理用户的角色等级显示不同的结果
const processTitleByRole = (cols: CrudSchema[], agentInfo?: AccountAgentInfo) => {
  if (!agentInfo) return cols
  const { agentLevel, agentType } = agentInfo

  let positionIndex = cols.findIndex((col) => col.field === 'getOdd')
  if (positionIndex < 0) {
    positionIndex = cols.length
  } else {
    positionIndex += 1
  }
  const resultTitles = [...commonReportResultTitles]
  const titleCols = [...cols]

  switch (agentType) {
    case AgentType.Headquarters:
      titleCols.splice(positionIndex, 0, ...resultTitles)
      break
    case AgentType.Branch:
      resultTitles.splice(1, 1)
      titleCols.splice(positionIndex, 0, ...resultTitles)
      break
    case AgentType.Agent:
      if (agentLevel === AgentLevel.Primary) {
        resultTitles.splice(1, 2)
        titleCols.splice(positionIndex, 0, ...resultTitles)
      } else if (agentLevel === AgentLevel.Secondary) {
        resultTitles.splice(1, 3)
        titleCols.splice(positionIndex, 0, ...resultTitles)
      } else {
        resultTitles.splice(1, 4)
        titleCols.splice(positionIndex, 0, ...resultTitles)
      }
    default:
      titleCols
  }
  return titleCols
}

export const useReportTable = () => {
  const agentInfoStore = useAgentInfoStore()

  const headerquartersTitleAdvanced = computed(() => {
    return processTitleByRole(headerquartersTableTitle, agentInfoStore.info)
  })

  const branchOfficeTitleAdvanced = computed(() => {
    return processTitleByRole(branchOfficeTableTitle, agentInfoStore.info)
  })

  const primaryAgentTitleAdvanced = computed(() => {
    return processTitleByRole(primaryAgentTableTitle, agentInfoStore.info)
  })

  const rootCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      const lastIndex = breadcrumbList.length - 1
                      breadcrumbList[lastIndex].onClick =
                        RootTableMap[tableRoot.value].breadcrumbClick
                      const classifiedType = ListClassifiedTypeMap.get(tableRoot.value)
                      currentTableType.value = classifiedType!
                      currentGameType.value = (data.row as ReportRecordItem).gameType
                      setTimeParams(tableRoot.value, classifiedType!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const rootClassifiedCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (column.field === 'type') {
        return {
          ...column,
          slots: {
            default(data) {
              switch ((data.row as ReportRecordItem).recordType) {
                case ReportRecordType.AgentAll:
                  return '分公司'
                case ReportRecordType.MemberAll:
                  return '会员'
                default:
                  return null
              }
            }
          }
        }
      }
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      const recordType = (data.row as ReportRecordItem).recordType
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = { title: '' }
                      if (recordType === ReportRecordType.AgentAll) {
                        breadcrumb.title = RootTableMap[RootTableType.BranchList].title
                        currentTableType.value = RootTableType.BranchList
                      } else if (recordType === ReportRecordType.MemberAll) {
                        breadcrumb.title = RootTableMap[RootTableType.MemberList].title
                        currentTableType.value = RootTableType.MemberList
                      }
                      // 当前面包屑按钮
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.RootClassified].breadcrumbClick
                      breadcrumbList.push(breadcrumb)
                      setTimeParams(RootTableType.RootClassified, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const memberListCols = computed(() => {
    return memberTableTitle.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = {
                        title: RootTableMap[RootTableType.MemberDetail].title
                      }

                      currentTableType.value = RootTableType.MemberDetail
                      RootTableMap[RootTableType.MemberDetail].listParams = {
                        ...RootTableMap[RootTableType.MemberDetail].listParams,
                        playerId: data.row.playerId
                      }
                      // 当前面包屑按钮修改
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.MemberList].breadcrumbClick
                      breadcrumbList[breadcrumbList.length - 1].title =
                        breadcrumbList[breadcrumbList.length - 1].title +
                        `${(data.row as ReportRecordItem).account}`
                      breadcrumbList.push(breadcrumb)

                      showReportList.value = false
                      setTimeParams(RootTableType.MemberList, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const branchListCols = computed(() => {
    return branchOfficeTitleAdvanced.value.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      currentTableType.value = RootTableType.BranchClassified
                      // 当前面包屑按钮修改
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.BranchList].breadcrumbClick
                      breadcrumbList[breadcrumbList.length - 1].title =
                        breadcrumbList[breadcrumbList.length - 1].title +
                        ` ${(data.row as ReportRecordItem).account}`
                      if ((data.row as ReportRecordItem).agentId) {
                        agentConfigList.push({
                          id: data.row.agentId,
                          type: RootTableType.BranchClassified
                        })
                      }
                      setTimeParams(RootTableType.BranchList, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const branchClassifiedCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (column.field === 'type') {
        return {
          ...column,
          slots: {
            default(data) {
              switch ((data.row as ReportRecordItem).recordType) {
                case ReportRecordType.AgentAll:
                  return '一级代理'
                case ReportRecordType.MemberAll:
                  return '会员'
                default:
                  return null
              }
            }
          }
        }
      }
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      const recordType = (data.row as ReportRecordItem).recordType
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = { title: '' }
                      if (recordType === ReportRecordType.AgentAll) {
                        breadcrumb.title = RootTableMap[RootTableType.PrimaryAgentList].title
                        currentTableType.value = RootTableType.PrimaryAgentList
                      } else if (recordType === ReportRecordType.MemberAll) {
                        breadcrumb.title = RootTableMap[RootTableType.MemberList].title
                        currentTableType.value = RootTableType.MemberList
                        agentConfigList.push()
                      }
                      // 当前面包屑按钮
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.BranchClassified].breadcrumbClick
                      breadcrumbList.push(breadcrumb)
                      setTimeParams(RootTableType.BranchClassified, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const primaryAgentListCols = computed(() => {
    return primaryAgentTitleAdvanced.value.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      currentTableType.value = RootTableType.PrimaryAgentClassified
                      // 当前面包屑按钮修改
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.PrimaryAgentList].breadcrumbClick
                      breadcrumbList[breadcrumbList.length - 1].title =
                        breadcrumbList[breadcrumbList.length - 1].title +
                        ` ${(data.row as ReportRecordItem).account}`
                      if ((data.row as ReportRecordItem).agentId) {
                        agentConfigList.push({
                          id: data.row.agentId,
                          type: RootTableType.PrimaryAgentClassified
                        })
                      }
                      setTimeParams(RootTableType.PrimaryAgentList, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const primaryAgentClassifiedCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (column.field === 'type') {
        return {
          ...column,
          slots: {
            default(data) {
              switch ((data.row as ReportRecordItem).recordType) {
                case ReportRecordType.AgentAll:
                  return '二级代理'
                case ReportRecordType.MemberAll:
                  return '会员'
                default:
                  return null
              }
            }
          }
        }
      }
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      const recordType = (data.row as ReportRecordItem).recordType
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = { title: '' }
                      if (recordType === ReportRecordType.AgentAll) {
                        breadcrumb.title = RootTableMap[RootTableType.SecondaryAgentList].title
                        currentTableType.value = RootTableType.SecondaryAgentList
                      } else if (recordType === ReportRecordType.MemberAll) {
                        breadcrumb.title = RootTableMap[RootTableType.MemberList].title
                        currentTableType.value = RootTableType.MemberList
                      }
                      // 当前面包屑按钮
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.PrimaryAgentClassified].breadcrumbClick
                      breadcrumbList.push(breadcrumb)
                      setTimeParams(RootTableType.PrimaryAgentClassified, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const secondaryAgentListCols = computed(() => {
    return primaryAgentTitleAdvanced.value.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      currentTableType.value = RootTableType.SecondaryAgentClassified
                      // 当前面包屑按钮修改
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.SecondaryAgentList].breadcrumbClick
                      breadcrumbList[breadcrumbList.length - 1].title =
                        breadcrumbList[breadcrumbList.length - 1].title +
                        ` ${(data.row as ReportRecordItem).account}`
                      if ((data.row as ReportRecordItem).agentId) {
                        agentConfigList.push({
                          id: data.row.agentId,
                          type: RootTableType.SecondaryAgentClassified
                        })
                      }
                      setTimeParams(RootTableType.SecondaryAgentList, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const secondaryAgentClassifiedCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (column.field === 'type') {
        return {
          ...column,
          slots: {
            default(data) {
              switch ((data.row as ReportRecordItem).recordType) {
                case ReportRecordType.AgentAll:
                  return '三级代理'
                case ReportRecordType.MemberAll:
                  return '会员'
                default:
                  return null
              }
            }
          }
        }
      }
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      const recordType = (data.row as ReportRecordItem).recordType
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = { title: '' }
                      if (recordType === ReportRecordType.AgentAll) {
                        breadcrumb.title = RootTableMap[RootTableType.TertiaryAgentList].title
                        currentTableType.value = RootTableType.TertiaryAgentList
                      } else if (recordType === ReportRecordType.MemberAll) {
                        breadcrumb.title = RootTableMap[RootTableType.MemberList].title
                        currentTableType.value = RootTableType.MemberList
                      }
                      // 当前面包屑按钮
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.SecondaryAgentClassified].breadcrumbClick
                      breadcrumbList.push(breadcrumb)
                      setTimeParams(RootTableType.SecondaryAgentClassified, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const tertiaryAgentListCols = computed(() => {
    return primaryAgentTitleAdvanced.value.map((column) => {
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      currentTableType.value = RootTableType.TertiaryAgentClassified
                      // 当前面包屑按钮修改
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.TertiaryAgentList].breadcrumbClick
                      breadcrumbList[breadcrumbList.length - 1].title =
                        breadcrumbList[breadcrumbList.length - 1].title +
                        ` ${(data.row as ReportRecordItem).account}`
                      if ((data.row as ReportRecordItem).agentId) {
                        agentConfigList.push({
                          id: data.row.agentId,
                          type: RootTableType.TertiaryAgentClassified
                        })
                      }
                      setTimeParams(RootTableType.TertiaryAgentList, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })
  const tertiaryAgentClassifiedCols = computed(() => {
    return headerquartersTitleAdvanced.value.map((column) => {
      if (column.field === 'type') {
        return {
          ...column,
          slots: {
            default(data) {
              switch ((data.row as ReportRecordItem).recordType) {
                case ReportRecordType.AgentAll:
                  return '-'
                case ReportRecordType.MemberAll:
                  return '会员'
                default:
                  return null
              }
            }
          }
        }
      }
      if (ActionCols.includes(column.field)) {
        return {
          ...column,
          table: {
            slots: {
              default(data) {
                const recordType = (data.row as ReportRecordItem).recordType
                if (recordType === ReportRecordType.AgentAll) {
                  return data.row[column.field]
                }
                return (
                  <ReportActionButton
                    row={data.row}
                    onClick={() => {
                      // 本次跳转后面包屑
                      const breadcrumb: HeaderquartersTitleItem = { title: '' }
                      if (recordType === ReportRecordType.MemberAll) {
                        breadcrumb.title = RootTableMap[RootTableType.MemberList].title
                        currentTableType.value = RootTableType.MemberList
                      }
                      // 当前面包屑按钮
                      breadcrumbList[breadcrumbList.length - 1].onClick =
                        RootTableMap[RootTableType.TertiaryAgentClassified].breadcrumbClick
                      breadcrumbList.push(breadcrumb)
                      setTimeParams(RootTableType.TertiaryAgentClassified, currentTableType.value!)
                    }}
                  >
                    {formatActionCols(data.row, column.field)}
                  </ReportActionButton>
                )
              }
            }
          }
        }
      }
      return column
    })
  })

  const RootTableMap: Record<
    RootTableType,
    {
      title: string
      columns: ComputedRef<CrudSchema[]> | CrudSchema[]
      listParams?: ReportTableParams & {
        playerId?: string
      }
      breadcrumbClick?(): void // 作为导航按钮时的点击回调
    }
  > = reactive({
    [RootTableType.Root]: {
      title: '【总公司】',
      columns: rootCols,
      breadcrumbClick: () => {
        listBreadcrumbClick(RootTableType.Root, RootTableType.RootClassified)
      }
    },
    [RootTableType.RootClassified]: {
      title: '【总公司】',
      columns: rootClassifiedCols,
      listParams: {
        recordType: ReportRecordType.All
      },
      breadcrumbClick: () => {
        classifedBreadcrumbClick(
          RootTableType.RootClassified,
          RootTableType.Root,
          RootTableType.BranchClassified
        )
      }
    },
    [RootTableType.BranchList]: {
      title: '【分公司】',
      columns: branchListCols,
      listParams: {
        recordType: ReportRecordType.AgentAll
      },
      breadcrumbClick: () => {
        listBreadcrumbClick(RootTableType.BranchList, RootTableType.BranchClassified)
      }
    },
    [RootTableType.BranchClassified]: {
      title: '【分公司】',
      columns: branchClassifiedCols,
      listParams: {
        recordType: ReportRecordType.All
      },
      breadcrumbClick: () => {
        classifedBreadcrumbClick(
          RootTableType.BranchClassified,
          RootTableType.BranchList,
          RootTableType.PrimaryAgentClassified
        )
      }
    },
    [RootTableType.PrimaryAgentList]: {
      title: '【一级代理】',
      columns: primaryAgentListCols,
      listParams: {
        recordType: ReportRecordType.AgentAll
      },
      breadcrumbClick() {
        listBreadcrumbClick(RootTableType.PrimaryAgentList, RootTableType.PrimaryAgentClassified)
      }
    },
    [RootTableType.PrimaryAgentClassified]: {
      title: '【一级代理】',
      columns: primaryAgentClassifiedCols,
      listParams: {
        recordType: ReportRecordType.All
      },
      breadcrumbClick: () => {
        classifedBreadcrumbClick(
          RootTableType.PrimaryAgentClassified,
          RootTableType.PrimaryAgentList,
          RootTableType.SecondaryAgentClassified
        )
      }
    },
    [RootTableType.SecondaryAgentList]: {
      title: '【二级代理】',
      columns: secondaryAgentListCols,
      listParams: {
        recordType: ReportRecordType.AgentAll
      },
      breadcrumbClick() {
        listBreadcrumbClick(
          RootTableType.SecondaryAgentList,
          RootTableType.SecondaryAgentClassified
        )
      }
    },
    [RootTableType.SecondaryAgentClassified]: {
      title: '【二级代理】',
      columns: secondaryAgentClassifiedCols,
      listParams: {
        recordType: ReportRecordType.All
      },
      breadcrumbClick: () => {
        classifedBreadcrumbClick(
          RootTableType.SecondaryAgentClassified,
          RootTableType.SecondaryAgentList,
          RootTableType.TertiaryAgentClassified
        )
      }
    },
    [RootTableType.TertiaryAgentList]: {
      title: '【三级代理】',
      columns: tertiaryAgentListCols,
      listParams: {
        recordType: ReportRecordType.AgentAll
      },
      breadcrumbClick() {
        listBreadcrumbClick(RootTableType.TertiaryAgentList, RootTableType.TertiaryAgentClassified)
      }
    },
    [RootTableType.TertiaryAgentClassified]: {
      title: '【三级代理】',
      columns: tertiaryAgentClassifiedCols,
      listParams: {
        recordType: ReportRecordType.All,
        isTertiary: true
      },
      breadcrumbClick: () => {
        classifedBreadcrumbClick(
          RootTableType.TertiaryAgentClassified,
          RootTableType.TertiaryAgentList
        )
      }
    },
    [RootTableType.MemberList]: {
      title: '【会员】',
      columns: memberListCols,
      listParams: {
        recordType: ReportRecordType.MemberAll
      },
      breadcrumbClick: () => {
        showReportList.value = true
        breadcrumbList.splice(breadcrumbList.length - 1)
        currentTableType.value = RootTableType.MemberList
        breadcrumbList[breadcrumbList.length - 1].onClick = undefined
        breadcrumbList[breadcrumbList.length - 1].title =
          RootTableMap[RootTableType.MemberList].title
      }
    },
    [RootTableType.MemberDetail]: {
      title: '详细注单',
      columns: [],
      listParams: {}
    }
  })

  // 本账号根报表类型
  const tableRoot = ref(RootTableType.Root)
  // 当前报表类型
  const currentTableType = ref<RootTableType>()
  // 当前报表游戏类型
  const currentGameType = ref<ReportGameType | null>(null)
  const showReportList = ref(true)
  // 记录指定代理请求数据
  const agentConfigList = reactive<{ id: number; type: RootTableType }[]>([])
  // 面包屑数组
  const breadcrumbList = reactive<HeaderquartersTitleItem[]>([])

  const getTargetAgentIndex = (classifiedType: RootTableType) => {
    return agentConfigList.findIndex((config) => config.type === classifiedType)
  }
  const handleTableSearchChange = (searchParams: Recordable) => {
    // 记录本页面时间范围，以供下一级使用
    const newTimeRange = searchParams?.[TimeRangeColKey] as Date[] | undefined
    if (newTimeRange?.length === 2 && currentTableType.value) {
      RootTableMap[currentTableType.value].listParams = {
        ...RootTableMap[currentTableType.value].listParams,
        startTime: formatCommonTime(newTimeRange[0]),
        endTime: formatCommonTime(newTimeRange[1])
      }
    }
  }

  // 某角色面包屑点击
  const listBreadcrumbClick = (listType: RootTableType, classifiedType: RootTableType) => {
    const targetAgentIndex = getTargetAgentIndex(classifiedType)
    agentConfigList.splice(targetAgentIndex > 0 ? targetAgentIndex : 0)
    currentTableType.value = listType
    breadcrumbList[breadcrumbList.length - 1].onClick = undefined
    breadcrumbList[breadcrumbList.length - 1].title = RootTableMap[listType].title
    if (breadcrumbList.length === 1) {
      breadcrumbList[0].title += agentInfoStore.info?.account
    }
  }
  // 某角色子分类面包屑点击
  const classifedBreadcrumbClick = (
    classifiedType: RootTableType,
    listType: RootTableType,
    nextClassifiedType?: RootTableType
  ) => {
    currentTableType.value = classifiedType
    // 处理面包屑
    const targetAgentIndex = getTargetAgentIndex(classifiedType)
    const offset = 2
    breadcrumbList.splice(targetAgentIndex + offset)
    breadcrumbList[breadcrumbList.length - 1].onClick = RootTableMap[listType].breadcrumbClick

    // 处理 agentConfigList
    // 来自类型分类无需移除
    const lastConfig = agentConfigList[agentConfigList?.length - 1]
    const noNeedReductAgentConfig = lastConfig && lastConfig.type === classifiedType
    if (nextClassifiedType && !noNeedReductAgentConfig) {
      const nextTargetIndex = getTargetAgentIndex(nextClassifiedType)
      agentConfigList.splice(nextTargetIndex > 0 ? nextTargetIndex : 0)
    }
    showReportList.value = true
  }

  const setTimeParams = (parentTable: RootTableType, childTable: RootTableType) => {
    currentTableType.value = childTable
    const parentParams = RootTableMap[parentTable].listParams
    RootTableMap[childTable].listParams = {
      ...RootTableMap[childTable].listParams,
      ...(parentParams?.startTime &&
        parentParams?.endTime && {
          startTime: parentParams?.startTime,
          endTime: parentParams?.endTime
        })
    }
  }

  onMounted(async () => {
    try {
      let agentInfo = agentInfoStore.info
      if (!agentInfo) {
        agentInfo = await agentInfoStore.getAgentInfo()
      }
      const { agentLevel, agentType } = agentInfo as {
        agentLevel: AgentLevel | undefined | null
        agentType: AgentType | undefined
        account: string
      }
      // 初始化根报表
      let rootType = tableRoot.value
      if (agentType === AgentType.Branch) {
        rootType = RootTableType.BranchList
      } else if (agentType === AgentType.Agent) {
        if (agentLevel === AgentLevel.Primary) {
          rootType = RootTableType.PrimaryAgentList
        } else if (agentLevel === AgentLevel.Secondary) {
          rootType = RootTableType.SecondaryAgentList
        } else if (agentLevel === AgentLevel.Tertiary) {
          rootType = RootTableType.TertiaryAgentList
        }
      }
      const targetTableConfig = RootTableMap[rootType]
      if (agentType !== AgentType.Headquarters) {
        tableRoot.value = rootType
        currentTableType.value = rootType
        RootTableMap[rootType].listParams = {}
        RootTableMap[rootType].columns = rootCols
      }
      // 根面包屑，重置游戏类型
      const originClick = RootTableMap[rootType].breadcrumbClick
      RootTableMap[rootType].breadcrumbClick = () => {
        currentGameType.value = null
        originClick?.()
      }
      currentTableType.value = rootType
      breadcrumbList.push({
        title: `${targetTableConfig.title}${agentInfoStore.info?.account}`
      })
    } catch {}
  })

  return {
    showReportList,
    breadcrumbList,
    currentTableType,
    currentGameType,
    RootTableMap,
    agentConfigList,
    handleTableSearchChange
  }
}
