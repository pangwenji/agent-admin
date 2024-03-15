<script setup lang="ts">
import { ElFormItem, ElSelect, ElOption, ElForm } from 'element-plus'
import { ActionDialog } from '@/components/ActionDialog'
import { MoneyInput } from '@/components/MoneyInput'
import { useDesign } from '@/hooks/web/useDesign'
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { QuotaOperataOptions, SystemConfigQuotaEditParams } from '@/api/system/config/types'
import { SwitchStatus } from '@/enum'
import { formatMoneyWithPrecision } from '@/utils/number'
const props = defineProps<{
  close: () => void
  initConfig: {
    quota: number
    id: number
  }
  confirm(value: SystemConfigQuotaEditParams): Promise<boolean | undefined>
}>()

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('money-dialog')

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<SystemConfigQuotaEditParams>>({
  quota: [{ required: true, message: '请输入存取额度', trigger: 'blur' }]
})
const ruleForm = reactive<Omit<SystemConfigQuotaEditParams, 'quota'> & { quota?: number }>({
  operate: SwitchStatus.Close,
  quota: undefined,
  id: props.initConfig.id
})

const formSubmit = async () => {
  try {
    const valid = await ruleFormRef.value?.validate()
    if (valid) {
      return props.confirm(ruleForm as SystemConfigQuotaEditParams)
    }
  } catch {
    return false
  }
}

const initForm = () => {
  ruleForm.operate = SwitchStatus.Close
  ruleForm.quota = undefined
}
</script>

<template>
  <ActionDialog
    :class="prefixCls"
    width="420px"
    :max-height="100"
    :close="props.close"
    :confirm="formSubmit"
    @closed="initForm"
  >
    <ElForm ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="6em">
      <ElFormItem label="当前额度" prop="currentQuota">
        <MoneyInput :value="formatMoneyWithPrecision(props.initConfig?.quota || 0)" disabled />
      </ElFormItem>
      <ElFormItem label="存取额度" prop="quota">
        <ElSelect v-model="ruleForm.operate" default-first-option name="operate">
          <ElOption
            v-for="item in QuotaOperataOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></ElSelect>
        <MoneyInput v-model="ruleForm.quota" name="quota" />
      </ElFormItem>
    </ElForm>
  </ActionDialog>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-money-dialog';
.@{prefix-cls} {
  background: yellow;

  .el-select {
    width: 6em;
    margin-right: 0.2em;
  }

  .el-input--default {
    flex: 1;
  }
}
</style>
