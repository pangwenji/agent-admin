/* * Description: 操作确认 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script lang="ts" setup>
import { ref, computed, defineExpose, defineEmits } from 'vue'
import { agentEnableApi, playerEnableApi } from '@/api/account'
import { ElMessage } from 'element-plus'

const props = defineProps({
  title: {
    type: String,
    default: '操作确认'
  },
  dialogWidth: {
    type: String,
    default: '380px'
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
  statusData: {
    type: Object,
    default: () => {
      return {
        account: '',
        id: null,
        perStatus: '',
        nextStatus: '',
        index: ''
      }
    }
  }
})

const statusText = computed(() => {
  const _next = props.statusData.nextStatus
  let _text = _next === 0 ? '启用' : _next === 1 ? '停用' : _next === 2 ? '锁定' : ''
  if (props.originType === 'player') {
    _text = _next === 1 ? '启用' : _next === 2 ? '停用' : '' // 会员
  }
  return _text
})

const inquiryVisible = ref(false)

const handleOpen = () => {
  inquiryVisible.value = true
}

enum AccountType {
  agent = '代理',
  player = '会员'
}

// 提交
const handleConfirm = async () => {
  try {
    if (props.originType === 'agent') {
      // 代理
      await agentEnableApi({
        id: props.statusData.id,
        accountStatus: String(props.statusData.nextStatus)
      })
    } else {
      // 会员
      await playerEnableApi({
        id: props.statusData.id,
        accountStatus: String(props.statusData.nextStatus)
      })
    }
    ElMessage({
      type: 'success',
      message: `账号 ${props.statusData.account} ${statusText.value} 成功`
    })
    inquiryVisible.value = false
    emits('submitInquiry')
  } catch {}
}

const handleClose = () => {
  inquiryVisible.value = false
  emits('close')
}

const emits = defineEmits(['submitInquiry', 'close'])
defineExpose({ handleOpen, handleClose, inquiryVisible })
</script>

<template>
  <div class="baseDialog">
    <el-dialog
      v-model="inquiryVisible"
      :title="title"
      :width="dialogWidth"
      :before-close="handleClose"
    >
      <div class="desc"
        >确认要
        <span
          :class="[
            statusData.nextStatus == 0
              ? 'open'
              : statusData.nextStatus == 1
                ? 'close'
                : statusData.nextStatus == 2
                  ? 'lock'
                  : ''
          ]"
        >
          {{ statusText }}
        </span>
        {{ AccountType[props.originType] }} {{ props.statusData.account }} 吗？
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="showConfirmButton" type="primary" @click="handleConfirm">
            确认
          </el-button>
          <el-button v-if="showCancelButton" type="info" @click="handleClose">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
@import url('./dialog.less');

.open {
  color: #2fafec;
}

.close {
  color: #ee5b75;
}

.lock {
  color: #ee5b75;
}
</style>
