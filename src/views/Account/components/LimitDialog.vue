/* * Description: 存取额度 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script lang="ts" setup>
import { ref, reactive, defineExpose, defineEmits } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { quotaUpdateExt } from '@/api/account'
import { ElMessage } from 'element-plus'

const props = defineProps({
  title: {
    type: String,
    default: '存取额度'
  },
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
  originType: {
    type: String,
    default: () => 'agent' // agent代理 / player会员
  },
  curRowData: {
    type: Object,
    default: () => {
      return {
        id: null,
        quota: ''
      }
    }
  }
})

const visible = ref(false)
const handleOpen = () => {
  formData.amount = ''
  visible.value = true
}

const emits = defineEmits(['submit', 'close'])
const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      submitUpdate()
    } else {
      console.log('error submit!', fields)
    }
  })
}
enum InsertType {
  agent = 1,
  player = 2
}
// 提交
const submitUpdate = async () => {
  try {
    const {} = await quotaUpdateExt({
      id: props.curRowData.id,
      type: InsertType[props.originType],
      quota: formData.amount,
      operateType: formData.operateType
    })
    ElMessage({
      type: 'success',
      message: `${formData.operateType ? '取出' : '存入'} 成功`
    })
    visible.value = false
    emits('submit')
  } catch {}
}

const cancelForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  visible.value = false
  emits('close')
}

const closeDialog = () => {
  limitFormRef.value?.resetFields()
  visible.value = false
  emits('close')
}

const acceOptions = [
  {
    value: 0,
    label: '存入'
  },
  {
    value: 1,
    label: '取出'
  }
]

interface RuleForm {
  operateType: number
  amount: string
}

const limitFormRef = ref<FormInstance>()
const formData = reactive<RuleForm>({
  operateType: 0,
  amount: ''
})

const checkAmount = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入存取额度'))
  } else if (value < 0) {
    callback(new Error('存取额度不能小于0'))
  } else {
    callback()
  }
  console.log(rule)
}

const rules = reactive<FormRules<RuleForm>>({
  amount: [{ validator: checkAmount, trigger: 'change', required: true }]
})

defineExpose({ handleOpen, visible })
</script>

<template>
  <div class="baseDialog">
    <el-dialog v-model="visible" :title="title" :width="dialogWidth" @close="closeDialog">
      <template #header>
        <div class="title-cur">当前额度：{{ curRowData.quota }}</div>
      </template>
      <el-form ref="limitFormRef" :model="formData" :rules="rules" class="acc-form">
        <el-form-item label="存取额度" prop="amount" required class="acc-form-amount">
          <div>
            <el-input
              v-model.trim="formData.amount"
              clearable
              type="number"
              placeholder="0.00"
              class="input-with-select"
              @input="
                formData.amount = String(
                  formData.amount.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
                )
              "
            >
              <template #prepend>
                <el-select
                  v-model="formData.operateType"
                  placeholder="存入/取出"
                  class="slot_select acc_select"
                  style="width: 74px"
                >
                  <el-option
                    v-for="item in acceOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-input>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="showConfirmButton" type="primary" @click="handleConfirm(limitFormRef)">
            确认
          </el-button>
          <el-button v-if="showCancelButton" type="info" @click="cancelForm(limitFormRef)"
            >取消</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
@import url('./dialog.less');

.title-cur {
  padding-left: 32px;
  font-family: 'Microsoft YaHei UI';
  font-size: 14px;
  color: #424251;
  box-sizing: border-box;
}

:deep(.el-form-item__content) {
  > div {
    width: 100%;
  }

  .el-input__inner {
    text-align: right;
  }
}
</style>
