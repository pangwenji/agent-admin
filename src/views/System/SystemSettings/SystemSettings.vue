<script setup lang="ts">
import { onMounted, ref, unref, reactive } from 'vue'
import { ElCard, ElButton, ElMessage } from 'element-plus'
import { ActionDialog } from '@/components/ActionDialog'
import { Switch } from '@/components/Switch'
import { DepositMoneyDialog } from './components'
import { SystemConfigEditParams, SystemConfigQuotaEditParams } from '@/api/system/config/types'
import { editSystemOtherConfig, editSystemQuota, getSystemConfig } from '@/api/system/config'

import { useStorage } from '@/hooks/web/useStorage'
import { formatMoneyWithPrecision } from '@/utils/number'

const systemConfig = ref<SystemConfigEditParams>()
const quotaConfig = reactive<Pick<SystemConfigEditParams, 'percentage' | 'quota'>>({
  percentage: undefined,
  quota: undefined
})

const { getStorage } = useStorage()
const adminID = getStorage('userId')
const initSystemConfig = async () => {
  systemConfig.value = undefined
  if (adminID) {
    try {
      const configResponse = await getSystemConfig({ id: adminID })
      const configData = configResponse.data
      systemConfig.value = configData
      quotaConfig.quota = configData.quota
      const percentScale = 100
      quotaConfig.percentage = configData.percentage * percentScale
    } catch {}
  }
}

onMounted(() => {
  initSystemConfig()
})

// 存取
const moneyDialogVisible = ref(false)
const closeMoneyDialog = () => {
  moneyDialogVisible.value = false
}
const handleQuotaEdit = async (value: SystemConfigQuotaEditParams) => {
  try {
    await editSystemQuota(value)
    await initSystemConfig()
    ElMessage.success('编辑额度成功')
    return true
  } catch {
    ElMessage.error('编辑额度失败')
  }
}

// 开关
const currentSwitchKey = ref<string>()
const actionVisible = ref(false)
const closeActionDialog = () => {
  actionVisible.value = false
  currentSwitchKey.value = undefined
}
const handleActionConfirm = async () => {
  const switchKey = currentSwitchKey.value
  const config = unref(systemConfig)
  if (switchKey === undefined || !config) return
  try {
    const switchValue = Number(!Number(config[switchKey]))
    await editSystemOtherConfig({
      ...config,
      [switchKey]: switchValue
    })
    systemConfig.value = {
      ...config,
      [switchKey]: switchValue
    }
    closeActionDialog()
    ElMessage.success('修改其他配置成功')
    return true
  } catch {
    ElMessage.error('修改其他配置失败，请重试')
  }
}

const handleSwitchChange = (key: string) => {
  currentSwitchKey.value = key
  actionVisible.value = true
}

/* const handleQuotaChange = async (val: string) => {
  const config = unref(systemConfig)
  if (!config) return
  try {
    await editSystemOtherConfig({
      ...config,
      quota: Number(val)
    })
    systemConfig.value = {
      ...config,
      quota: val?.length ? Number(val) : undefined
    }
    ElMessage.success('修改当前额度成功')
  } catch {
    ElMessage.error('修改当前额度失败，请重新尝试')
  }
}

const handlePercentChange = async (val: string) => {
  const config = unref(systemConfig)
  if (!config) return
  try {
    await editSystemOtherConfig({
      ...config,
      percentage: Number(val)
    })
    systemConfig.value = {
      ...config,
      percentage: val?.length ? Number(val) : undefined
    }
    ElMessage.success('修改总公司占成成功')
  } catch {
    ElMessage.error('修改总公司占成失败，请重新尝试')
  }
} */
</script>

<template>
  <div v-loading="!systemConfig" class="system-settings">
    <ElCard class="settings-card w-max" shadow="never">
      <template #header>
        <span>额度配置</span>
      </template>
      <div class="settings-line">
        <div class="setting-wrapper">
          <span class="setting-label">当前额度</span>
          <div class="setting-content">
            <span class="leading-none">
              {{ formatMoneyWithPrecision(quotaConfig?.quota || 0) }}
            </span>
            <ElButton class="action-btn p-0" type="primary" link @click="moneyDialogVisible = true">
              存取
            </ElButton>
          </div>
        </div>
        <div class="setting-wrapper">
          <span class="setting-label">总公司占成</span>
          <div class="setting-content">
            <span>{{ quotaConfig.percentage }}%</span>
          </div>
        </div>
      </div>
    </ElCard>
    <ElCard class="settings-card w-max other-settings" shadow="never">
      <template #header>
        <span>其他配置</span>
      </template>
      <div class="settings-line">
        <div class="setting-wrapper">
          <span class="setting-label">赔率设置</span>
          <div class="setting-content">
            <Switch
              :value="Boolean(systemConfig?.isOddOpen)"
              @change="() => handleSwitchChange('isOddOpen')"
            />
          </div>
        </div>
        <div class="setting-wrapper">
          <span class="setting-label">返水设置</span>
          <div class="setting-content">
            <Switch
              :value="Boolean(systemConfig?.isRebateOpen)"
              @change="() => handleSwitchChange('isRebateOpen')"
            />
          </div>
        </div>
        <div class="setting-wrapper">
          <span class="setting-label">走飞设置</span>
          <div class="setting-content">
            <Switch
              :value="Boolean(systemConfig?.isFlyOpen)"
              @change="() => handleSwitchChange('isFlyOpen')"
            />
          </div>
        </div>
      </div>
    </ElCard>
  </div>
  <DepositMoneyDialog
    v-model="moneyDialogVisible"
    :close="closeMoneyDialog"
    :init-config="{
      id: adminID,
      quota: systemConfig?.quota || 0
    }"
    :confirm="handleQuotaEdit"
  />
  <ActionDialog
    v-model="actionVisible"
    :closable="false"
    :close="closeActionDialog"
    :confirm="handleActionConfirm"
    :show-close="false"
  >
    {{ `确认${systemConfig?.[currentSwitchKey!] ? '关闭' : '开启'}该配置?` }}
  </ActionDialog>
</template>

<style scoped lang="less">
.system-settings {
  --setting-header-height: 42px;
  --border-style: 2px solid var(--el-border-color-lighter);
  .setting-header {
    height: var(--setting-header-height);
    line-height: var(--setting-header-height);
    color: var(--dark-text-color);
    font-size: 14px;
  }
  .settings-card {
    margin-bottom: 12px;
    border: none;
    background-color: var(--common-card-bg-color);
    padding: 0 8px 8px;
    border-radius: 0;
    &.other-settings {
      margin-bottom: 0;
      .setting-content {
        padding-block: 16px;
      }
    }
    :deep(.el-card__header) {
      border: none;
      padding: 0;
      .setting-header();
    }
    :deep(.el-card__body) {
      padding: 0;
    }
  }
  .settings-line {
    background-color: transparent;
    display: flex;
    justify-content: flex-start;
    border: var(--border-style);
    border-radius: 8px;
    overflow: hidden;
  }
  .setting-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-left: var(--border-style);
    min-width: 344px;
    &:first-child {
      border-left: none;
    }
    .setting-label {
      min-width: 6em;
      background-color: var(--common-bg-color);
      text-align: center;
      .setting-header();
    }
    .setting-content {
      min-height: var(--setting-header-height);
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--base-text-color);
      background-color: #fff;
      font-size: 14px;
    }
  }

  .action-btn {
    margin-left: 1em;
  }
}
</style>
