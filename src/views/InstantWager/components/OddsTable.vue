<script setup lang="ts">
import { defineProps, computed, inject } from 'vue'
import { ElButton, ElTableColumn, ElTable } from 'element-plus'
import {
  LotteryOddsItem,
  OddsListVOListItem,
  InstantWagerInjectData
} from '@/api/instantWager/types'
import { InstantWagerRootKey } from '@/hooks/web/useInstantWager'
import useOddsTable from '../hooks/useOddsTable'
import OddsColContent from './OddsColContent.vue'

const props = defineProps<{ trickOdds: LotteryOddsItem }>()
const Row12PlayTypeCodeList = [/^TMHX$/, /^TX$/, /^BB$/, /^\w+LX$/]
const Row12 = 12
const RowCommon = 10

const { gotoDetailOrder, selectRow, selectedRowList, showTotalAmount, isOddsOpen } =
  inject<InstantWagerInjectData>(InstantWagerRootKey)!

const tableGroups = computed(() => {
  const oddsList = props.trickOdds?.oddsListVOList
  if (!oddsList?.length) return []
  const playTypeCode = props.trickOdds.playTypeCode
  const groupLen = Row12PlayTypeCodeList.some((rex) => rex.test(playTypeCode)) ? Row12 : RowCommon // 默认十个一列
  const tableCount = Math.ceil(oddsList.length / groupLen || 0)
  return Array(tableCount)
    .fill(1)
    .map((_, index) => {
      return oddsList.slice(index * groupLen, (index + 1) * groupLen)
    })
})

const rowClassName = ({ row }: { row: OddsListVOListItem }) => {
  if (selectedRowList.find((sRow) => sRow.id === row.id)) {
    return 'selected-row'
  }
}

const { isLHC, isRed, isBlue, isGreen } = useOddsTable()

const handleSpanMethod = (
  data: OddsListVOListItem[],
  {
    rowIndex, // 当前行索引
    columnIndex // 当前列索引
  }
) => {
  // eslint-disable-next-line no-magic-numbers
  const spanIndices = [2, 3]
  if (spanIndices.includes(columnIndex)) {
    return data[rowIndex].spanConfig
  }
}

const getTotalAmount = computed(() => {
  return (row: OddsListVOListItem) => {
    return showTotalAmount.value ? row.totalAmount : row.actualAmount
  }
})
</script>
<template>
  <ElTable
    v-for="(group, index) in tableGroups"
    :key="index"
    :data="group"
    :scrollbarAlwaysOn="false"
    :highlightCurrentRow="false"
    :stripe="false"
    :showOverflowTooltip="false"
    fit
    emptyText="暂无数据"
    tableLayout="auto"
    border
    :row-class-name="rowClassName"
    :span-method="(params) => handleSpanMethod(group, params)"
    @row-click="selectRow"
  >
    <ElTableColumn prop="playName" label="项目" align="center">
      <template #default="scope">
        <span
          :class="[
            {
              'play-name-num': !Number.isNaN(Number(scope.row.playName)),
              'lhc-red': isLHC(trickOdds.lotteryCode) && isRed(Number(scope.row.playName)),
              'lhc-blue': isLHC(trickOdds.lotteryCode) && isBlue(Number(scope.row.playName)),
              'lhc-green': isLHC(trickOdds.lotteryCode) && isGreen(Number(scope.row.playName))
            }
          ]"
        >
          {{ scope.row.playName }}
        </span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="odds"
      label="赔率"
      align="center"
      :className="'odds-controls-col ' + (isOddsOpen ? 'controlling' : '')"
    >
      <template #default="scope">
        <OddsColContent :row="scope.row" />
      </template>
    </ElTableColumn>
    <ElTableColumn prop="totalAmount" label="金额" align="center">
      <template #default="scope">
        <ElButton type="primary" link @click.stop="gotoDetailOrder">
          {{ getTotalAmount(scope.row) }}
        </ElButton>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="profitAndLossAmount" label="盈亏" align="center" />
  </ElTable>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.el-table {
  :deep(.el-table__inner-wrapper) {
    --custom-table-cell-h: 35px;
    @size: 24px;
    .odds-controls-col {
      .el-button {
        padding-inline: 8px;
        padding-block: 4px;
        height: 28px;
        &:first-of-type {
          margin-right: 2px;
        }
        &:last-of-type {
          margin-left: 2px;
        }
      }
      .cell {
        height: 100%;
        padding: 0;
        div {
          padding-inline: 12px;
        }
      }
      &.controlling {
        .cell > div {
          padding: 0;
        }
      }
    }
    .play-name-num {
      display: flex;
      justify-content: center;
      align-items: center;
      width: @size;
      height: @size;
      line-height: @size;
      border: 2px solid rgba(194, 232, 255, 1);
      border-radius: 50%;
      font-size: 13px;
      box-sizing: border-box;
    }
    .lhc-common();
    .selected-row {
      background-color: rgba(72, 71, 96, 0.1);
      .lhc-special();
    }
  }
}
</style>
