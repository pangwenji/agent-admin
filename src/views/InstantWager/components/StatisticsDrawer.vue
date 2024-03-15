<script lang="ts" setup>
import { defineProps, defineEmits, computed, inject } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { PropType } from 'vue'
import { formatMoneyWithPrecision } from '@/utils/number'
import { InstantWagerRootKey } from '@/hooks/web/useInstantWager'
import type { LotteryTrickItem, InstantWagerInjectData } from '@/api/instantWager/types'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  list: {
    type: Array as PropType<LotteryTrickItem[]>,
    default: () => []
  },
  modelValue: propTypes.bool.def(false)
})

const { showTotalAmount } = inject<InstantWagerInjectData>(InstantWagerRootKey)!

const drawer = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

function cancelClick() {
  drawer.value = false
}
</script>

<template>
  <el-drawer v-model="drawer" modalClass="statistics-modal" direction="rtl" :showClose="false">
    <template #header>
      <div class="flex items-center">
        <Icon icon="svg-icon:arrow-left" :size="12" @click="cancelClick" />
        <span class="pl-3">统计数据</span>
      </div>
    </template>
    <template #default>
      <ElTable
        className="statistics-table"
        :data="list"
        :scrollbarAlwaysOn="false"
        :highlightCurrentRow="false"
        :stripe="false"
        :showOverflowTooltip="false"
        fit
        emptyText="暂无数据"
        tableLayout="auto"
        border
      >
        <ElTableColumn fixed prop="playTypeName" label="游戏玩法" align="center" />
        <ElTableColumn prop="profitAndLossAmount" label="货量统计/盈亏统计" align="center">
          <template #default="scope">
            {{
              formatMoneyWithPrecision(
                showTotalAmount ? scope.row.totalAmount : scope.row.actualAmount
              )
            }}
            /
            {{ formatMoneyWithPrecision(scope.row.profitAndLossAmount) }}
          </template>
        </ElTableColumn>
      </ElTable>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.el-table {
  .custom-table-autofit();
  :deep(.el-table__inner-wrapper) {
    .custom-table-autofit-inner();
    .el-scrollbar__wrap {
      max-height: calc(100vh - 147px);
    }
  }
}
</style>
<style lang="less">
.statistics-modal {
  --el-drawer-padding-primary: 24px;
  @borderC: rgba(72, 71, 96, 0.1);

  .el-drawer {
    width: fit-content !important;
    max-width: 70%;
  }
  .el-drawer__header {
    margin-bottom: 0;
    font-size: 14px;
    color: var(--dark-text-color);
    border-bottom: 1px solid @borderC;
    padding-block: 20px;
  }
  @paddingBlock: 12px;
  .el-drawer__body {
    padding-block: @paddingBlock;
  }
  .el-drawer__footer {
    padding-block: @paddingBlock;
    border-top: 1px solid @borderC;
    .el-button--default {
      height: 36px;
      width: 88px;
    }
  }
}
</style>
