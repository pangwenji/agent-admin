/* * Description: 层级及查询信息 * Author: * Date: 2023-11-23 */
<!-- eslint-disable vue/return-in-computed-property -->
<!-- eslint-disable no-magic-numbers -->
<script setup lang="ts">
import { unref, computed, inject, PropType } from 'vue'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import type { Option } from '@/api/account/types'

const { info: loginAgentInfo } = useAgentInfoStore()

// agetntTye 0-总公司，1-分公司，2-代理 ，agentLevel 1-一级代理，2-二级代理，3-三级代理
const agentDesc = ['总公司', '分公司', '代理']
const levelDesc = ['一级代理', '二级代理', '三级代理']

const props = defineProps({
  queryForm: {
    type: Object,
    default: () => {
      return {}
    }
  },
  filterOptions: {
    type: Array as PropType<Option[]>,
    default: () => []
  }
})

const navTitle = inject('navTitle')
const parentInfo: any = inject('parentInfo', {})

const queryData = computed(() => props.queryForm)
const selectOptions = computed(() => props.filterOptions)

const levelName = computed(() => {
  if (unref(parentInfo)?.agentType) return unref(parentInfo)?.agentType
  if (!loginAgentInfo) return ''
  let agentType = loginAgentInfo?.agentType
  let agentLevel = loginAgentInfo?.agentLevel
  if (Number(agentType) < 2) {
    return agentDesc[agentType]
  }
  if (Number(agentType) === 2) {
    return levelDesc[Number(agentLevel) - 1]
  }
  return ''
})

const accountName = computed(() => {
  if (unref(parentInfo)?.account) return unref(parentInfo)?.account
  return loginAgentInfo?.account
})

const emits = defineEmits(['query'])
const queryTable = () => {
  emits('query')
}
</script>
<template>
  <div class="filter-form">
    <div class="cell-level">
      <span>【{{ levelName }}】{{ accountName }} -> {{ navTitle }}</span>
    </div>
    <div class="cell-form">
      <el-select v-model="queryData.status" clearable placeholder="账户状态" class="slot_select">
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-model="queryData.accountOrUsername"
        clearable
        placeholder="账号或名称"
        class="account_input"
      />
    </div>
    <div class="btns">
      <ElButton type="primary" @click="queryTable">查询</ElButton>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="less">
@normalColor: #48476047;
@activeColor: #2fafec;

.filter-form {
  display: flex;
  align-items: center;
  padding: 0 0 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid #4847600d;

  .cell-level {
    color: #424251;
  }

  .cell-form {
    display: flex;
    width: 250px;
    height: 32px;
    margin: 0 15px;
    border: 1px solid @normalColor;
    border-radius: 6px;
    box-sizing: border-box;
    align-items: center;
  }

  :deep(.slot_select) {
    width: 122px;
    border-right: 1px solid @normalColor;
    box-sizing: border-box;

    .el-input__wrapper {
      padding: 0 20px;
      background: none;
      border: none !important;
      box-shadow: none !important;
      box-sizing: border-box;
    }
  }

  :deep(.account_input) {
    width: calc(100% - 112px);
  }

  :deep(.el-input__wrapper) {
    padding: 0 6px;
    background: none;
    border: none;
    box-shadow: none;
    box-sizing: border-box;

    &.is_focus {
      box-shadow: none;
    }
  }
  :deep(.el-input__inner) {
    height: var(--el-input-inner-height);
  }

  .btns {
    button {
      width: 88px;
      height: 32px;
      border: none;
      border-radius: var(--el-border-radius-base);
    }

    :deep(.el-button--primary) {
      width: 60px;
    }
  }
}
</style>
