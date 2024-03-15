<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { ElSelect, ElOption, ElButton, ElInputNumber } from 'element-plus'
import { useIcon } from '@/hooks/web/useIcon'

const minusIcon = useIcon({ icon: 'mdi:minus-box-outline' })
const addIcon = useIcon({ icon: 'material-symbols:add-box-outline' })
const oddsStepOptions = [
  { label: '0.001', value: 0.001 },
  { label: '0.002', value: 0.002 },
  { label: '0.003', value: 0.003 },
  { label: '0.004', value: 0.004 }
]
const currentOddsStep = ref<number | undefined>()
const oddsInput = ref<number | undefined>()
const emit = defineEmits(['calculate', 'inputOdds', 'selectAll', 'selectReverse', 'cancelSelect'])
</script>
<template>
  <footer class="wager-footer__inner flex items-center">
    <div class="odds-step-selector flex items-center mr-8">
      <span class="mr-2 odds-input-label">调赔幅度:</span>
      <ElSelect v-model="currentOddsStep" clearable allow-create filterable>
        <ElOption
          v-for="item in oddsStepOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
      <ElButton
        class="cal-btn ml-2"
        type="primary"
        text
        :icon="addIcon"
        :disabled="!currentOddsStep"
        @click="() => emit('calculate', currentOddsStep)"
      />
      <ElButton
        class="cal-btn"
        type="danger"
        text
        :icon="minusIcon"
        :disabled="!currentOddsStep"
        @click="() => emit('calculate', -1 * currentOddsStep!)"
      />
    </div>
    <div class="odds-input flex items-center mr-7">
      <span class="mr-2 odds-input-label">输入调赔:</span>
      <ElInputNumber v-model="oddsInput" class="mr-4" :min="0" :controls="false" />
      <ElButton
        type="primary"
        :disabled="!(typeof oddsInput === 'number')"
        @click="() => emit('inputOdds', oddsInput)"
      >
        确定
      </ElButton>
    </div>
    <div class="odds-list-control flex items-center">
      <ElButton type="primary" text @click="() => emit('selectAll')">全选</ElButton>
      <ElButton type="primary" text @click="() => emit('selectReverse')">反选</ElButton>
      <ElButton text @click="() => emit('cancelSelect')">取消</ElButton>
    </div>
  </footer>
</template>
<style lang="less" scoped>
.wager-footer__inner {
  box-shadow:
    0px 1px 0px 0px rgba(72, 71, 96, 0.1) inset,
    0px -4px 8px 0px rgba(108, 123, 168, 0.05);

  font-size: var(--el-font-size-base);

  padding-inline: var(--app-content-padding);
  :deep(.el-input) {
    .el-input__inner {
      width: 4em;
    }
  }
  .el-input-number {
    width: 118px;

    :deep(.el-input__inner) {
      text-align: left;
    }
  }
  .odds-input-label {
    margin-top: -2px;
  }
  .cal-btn {
    padding: 0;
    width: 32px;
    & + .cal-btn {
      margin-left: 0;
    }
  }
  .el-button {
    & + .el-button {
      margin-left: 0;
    }
  }
}
</style>
