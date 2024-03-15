<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { reactive } from 'vue'
import { ElButton } from 'element-plus'

import { CrudSchema } from '@/hooks/web/useCrudSchemas'

import { createMoneyCols } from '@/utils/table'
import { SportsDrawItem, SportsDrawingType } from '@/api/drawingResult/types'
import { gotoSportsOrderList } from '../../tools'

import SportsTable from './SportsTable.vue'

const resultCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'matchName',
    label: '联赛',
    width: '120px',
    search: {
      componentProps: { placeholder: '请输入联赛名称' }
    }
  },
  {
    field: 'matchTime',
    label: '开奖时间',
    minWidth: '168px',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default({ row }: { row: SportsDrawItem }) {
          // 兼容
          return row.matchTime
        }
      }
    }
  },
  {
    field: 'matchTeam',
    label: '球队',
    minWidth: '300px',
    search: {
      hidden: true
    }
  },
  {
    field: 'sectionOne',
    label: '第一节',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'sectionTwo',
    label: '第二节',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'sectionThree',
    label: '第三季',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'sectionFour',
    label: '第四节',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'sectionFull',
    label: '全场',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'betNumber',
    label: '注单数量',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'bettorsNumber',
    label: '投注人数',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  ...createMoneyCols([
    {
      field: 'totalAmount',
      label: '投注总额',
      minWidth: '168px',
      search: {
        hidden: true
      }
    },
    {
      field: 'rewardAmount',
      label: '派彩总额',
      minWidth: '168px',
      search: {
        hidden: true
      }
    },
    {
      field: 'systemProfitLoss',
      label: '系统盈亏',
      minWidth: '168px',
      search: {
        hidden: true
      }
    }
  ]),
  {
    field: 'action',
    label: '操作',
    minWidth: 140,
    fixed: 'right',
    className: 'action-col',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default({ row }: { row: SportsDrawItem }) {
          return (
            <ElButton
              type="primary"
              text
              class="w-full"
              disabled={!row.betNumber}
              onClick={() =>
                gotoSportsOrderList({
                  matchId: row.matchId,
                  sportsType: SportsDrawingType.Basketball
                })
              }
            >
              查看注单
            </ElButton>
          )
        }
      }
    }
  }
])
</script>

<template>
  <SportsTable :crudSchemaList="resultCrudSchemas" :sportsId="SportsDrawingType.Basketball" />
</template>
