<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { reactive } from 'vue'
import { ElButton } from 'element-plus'

import { CrudSchema } from '@/hooks/web/useCrudSchemas'

import { createMoneyCols } from '@/utils/table'
import { SportsDrawItem, SportsDrawingType } from '@/api/drawingResult/types'

import SportsTable from './SportsTable.vue'
import { gotoSportsOrderList } from '../../tools'

const resultCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'matchName',
    label: '联赛',
    width: '120px',
    search: {
      componentProps: { placeholder: '请输入联赛名称' },
      value: ''
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
    field: 'firstHalf',
    label: '上半场',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'secondHalf',
    label: '下半场',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'fullCourt',
    label: '全场',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'cornerKick',
    label: '角球',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'penaltyCard',
    label: '罚牌',
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
                  sportsType: SportsDrawingType.Soccer
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
  <SportsTable :crudSchemaList="resultCrudSchemas" :sportsId="SportsDrawingType.Soccer" />
</template>
