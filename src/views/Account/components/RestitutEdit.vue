/* * Description: 代理返水编辑 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script lang="ts" setup>
import { ref, unref, reactive, defineExpose, defineEmits, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { BigNumber } from 'bignumber.js'
import type { FormInstance, FormRules } from 'element-plus'
import { updateLimitApi } from '@/api/account'
import type { UpdateLimitParams } from '@/api/account/types'

const props = defineProps({
  dialogWidth: {
    type: String,
    default: '460px'
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  curRowData: {
    type: Object,
    default: (): UpdateLimitParams => {
      return {
        agentId: '',
        lotteryCode: '',
        handicapCode: '',
        playCode: '',
        selfRebate: '',
        selfSingleMaxLimit: '',
        selfSingleIssueLimit: ''
      }
    }
  }
})

const updateForm = computed(() => {
  const temp = props.curRowData
  if (temp.selfRebate.indexOf('%') !== -1) {
    temp.selfRebate = temp.selfRebate.replace('%', '')
  }
  return temp
})

const visible = ref(false)

const formRef = ref<FormInstance>()

// 表单校验
const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  try {
    await formEl.validate((valid, fields) => {
      if (valid) {
        submitUpdateForm()
      } else {
        console.log('error submit!', fields)
      }
    })
  } catch {}
}

// 保存编辑
const submitUpdateForm = async () => {
  const _params = { ...unref(updateForm) }
  try {
    const { success, message } = await updateLimitApi({
      agentId: _params.agentId,
      lotteryCode: _params.lotteryCode,
      handicapCode: _params.handicapCode,
      playCode: _params.playCode,
      selfRebate: BigNumber(Number(_params.selfRebate)).dividedBy(100) as never as string,
      selfSingleMaxLimit: _params.selfSingleMaxLimit,
      selfSingleIssueLimit: _params.selfSingleIssueLimit
    })
    if (success) {
      ElMessage({
        type: 'success',
        message: `编辑成功`
      })
      emits('submitEdit')
      visible.value = false
    } else {
      ElMessage({
        type: 'error',
        message: message as string
      })
    }
  } catch (err) {
    console.log('submitUpdateForm => ', err)
  }
}

const handleOpen = () => {
  visible.value = true
}

// X关闭
const closeDialog = () => {
  formRef.value?.resetFields()
  visible.value = false
  emits('close')
}

const cancelForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  visible.value = false
}

const rules = reactive<FormRules<UpdateLimitParams>>({
  selfRebate: [
    {
      required: true,
      message: '请输入个人返水',
      trigger: 'blur'
    }
  ],
  selfSingleMaxLimit: [
    {
      required: true,
      message: '请输入个人单注最高',
      trigger: 'blur'
    },
    {
      // 个人单注最高不能高于单期最高

      trigger: 'blur',
      validator(_, value, cb) {
        if (
          value &&
          updateForm.value.selfSingleIssueLimit &&
          value > updateForm.value.selfSingleIssueLimit
        ) {
          cb(new Error('个人单注最高不能高于单期最高'))
        } else {
          cb()
        }
      }
    }
  ],
  selfSingleIssueLimit: [
    {
      required: true,
      message: '请输入个人单期最高',
      trigger: 'blur'
    }
  ]
})

const emits = defineEmits(['submitEdit', 'close'])
defineExpose({ handleOpen, closeDialog, visible })
</script>

<template>
  <div class="baseDialog">
    <el-dialog v-model="visible" title="编辑" :width="dialogWidth" @close="closeDialog">
      <el-form
        ref="formRef"
        :model="updateForm"
        label-width="122"
        label-position="left"
        :rules="rules"
        class="acc-form"
      >
        <el-form-item v-if="updateForm.id" label="游戏玩法" prop="parentAccount">
          <el-input v-model.trim="updateForm.parentAccount" placeholder="游戏玩法" disabled />
        </el-form-item>
        <el-form-item label="个人返水" prop="selfRebate">
          <el-input
            v-model.trim="updateForm.selfRebate"
            clearable
            type="number"
            placeholder="个人返水"
            @input="
              updateForm.selfRebate = String(
                updateForm.selfRebate.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              )
            "
          >
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="个人单注最高" prop="selfSingleMaxLimit">
          <el-input
            v-model.trim="updateForm.selfSingleMaxLimit"
            clearable
            type="number"
            placeholder="个人单注最高"
            @input="
              updateForm.selfSingleMaxLimit = String(
                updateForm.selfSingleMaxLimit.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              )
            "
          />
        </el-form-item>
        <el-form-item label="个人单期最高" prop="selfSingleIssueLimit">
          <el-input
            v-model.trim="updateForm.selfSingleIssueLimit"
            clearable
            type="number"
            placeholder="个人单期最高"
            @input="
              updateForm.selfSingleIssueLimit = String(
                updateForm.selfSingleIssueLimit.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              )
            "
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="showConfirmButton" type="primary" @click="handleConfirm(formRef)">
            保存
          </el-button>
          <el-button v-if="showCancelButton" type="info" @click="cancelForm(formRef)">
            取消
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
@import url('./dialog.less');

:deep(.el-form-item) {
  margin-bottom: 25px;
  box-sizing: border-box;
}

:deep(.el-form-item__label) {
  padding-right: 20px;
}
</style>
