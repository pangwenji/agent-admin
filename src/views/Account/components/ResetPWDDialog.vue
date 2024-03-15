<script setup lang="ts">
import { ActionDialog } from '@/components/ActionDialog'
import { ElMessage, FormRules } from 'element-plus'
import { ref } from 'vue'
import { reactive } from 'vue'
import { defineEmits, defineProps, computed } from 'vue'
import { resetOperatePwd, checkOperatePwd } from '@/api/account'
import { unref } from 'vue'
import encryptTools from '@/utils/encrypt'

const props = defineProps<{ modelValue: boolean; id: string | number; isCheck?: boolean }>()
const emit = defineEmits(['update:modelValue', 'checkPwdSuccess'])
const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const handleClose = () => {
  dialogVisible.value = false
  pwdForm.value.operatePwd = ''
}
const handleConfirm = async () => {
  if (!props.id) return
  try {
    await resetOperatePwd({ id: props.id })
    ElMessage.success('重置操作密码成功')
    return true
  } catch {
    // ElMessage.error('重置')
    return false
  }
}

const pwdForm = ref({
  operatePwd: ''
})
const passwordRules = reactive<FormRules<{ operatePwd: string }>>({
  operatePwd: [
    { required: true, message: '请输入操作密码', trigger: 'blur' },
    {
      validator(_, value, cb) {
        const limit = 6
        if (value?.trim()?.length !== limit) {
          cb(new Error('请输入六位操作密码'))
          return
        }
        cb()
      }
    }
  ]
})

const handleCheckConfirm = async () => {
  const params = unref(pwdForm)
  if (!params.operatePwd) return
  try {
    await checkOperatePwd({ operatePwd: encryptTools.RSAencrypt(params.operatePwd) as string })
    emit('checkPwdSuccess')
    return true
  } catch {
    return false
  }
}
</script>
<template>
  <ActionDialog
    v-model="dialogVisible"
    :max-height="300"
    :title="isCheck ? '操作密码' : '信息'"
    :close="handleClose"
    :confirm="isCheck ? handleCheckConfirm : handleConfirm"
  >
    <ElForm v-if="isCheck" ref="formRef" :rules="passwordRules" :model="pwdForm">
      <ElFormItem prop="operatePwd">
        <ElInput
          v-model.trim="pwdForm.operatePwd"
          type="password"
          show-password
          placeholder="请输入六位操作密码"
        />
      </ElFormItem>
    </ElForm>
    <div v-else> 确认重置操作密码吗? </div>
  </ActionDialog>
</template>
