<script setup lang="ts">
import { MessageTableData } from '@/api/system/message/types'
import { ActionDialog } from '@/components/ActionDialog'
import { useEmitt } from '@/hooks/event/useEmitt'
import { useStorage } from '@/hooks/web/useStorage'
import { FromLoginFlag } from '@/utils/routerHelper'
import { ElButton } from 'element-plus'
import { onMounted } from 'vue'
import { unref, watch, ref } from 'vue'

const { emitter } = useEmitt()
const { getStorage, removeStorage } = useStorage('localStorage')
const { getStorage: getSessionStorage } = useStorage()
const renderMsg = ref(false)
const msgVisible = ref(false)
const currentMsgIndex = ref(0)
const fromLoginPage = getStorage(FromLoginFlag) === 1
interface IProps {
  msgList: MessageTableData[]
}
const props = withDefaults(defineProps<IProps>(), {
  msgList: () => []
})

const loginMsgList = ref<MessageTableData[]>([])
watch(
  () => props.msgList,
  (newList) => {
    if (fromLoginPage && newList?.length) {
      loginMsgList.value = newList
      renderMsg.value = true
      // 检查是否需要显示操作密码设置
      if (!getSessionStorage('isShowOperationCode')) {
        msgVisible.value = true
      }
    }
  }
)

onMounted(() => {
  // 检查是否需要显示操作密码设置
  if (getSessionStorage('isShowOperationCode')) {
    // 监听关闭事件
    emitter.on('isShowPwd', (data: boolean) => {
      if (data === false && fromLoginPage && loginMsgList.value.length) {
        msgVisible.value = true
      }
      emitter.off('isShowPwd')
    })
  }
})

const closeMsgModal = () => {
  if (getStorage(FromLoginFlag)) {
    renderMsg.value = true
    removeStorage(FromLoginFlag)
  }
  msgVisible.value = false
}

const showNextMsg = () => {
  currentMsgIndex.value = unref(currentMsgIndex) + 1
}
const showLastMsg = () => {
  currentMsgIndex.value = unref(currentMsgIndex) - 1
}
</script>

<template>
  <ActionDialog
    v-if="renderMsg"
    v-model="msgVisible"
    :title="msgList[currentMsgIndex].title"
    :close="closeMsgModal"
    :width="570"
    :max-height="300"
    @close="closeMsgModal"
  >
    <div class="login-msg-content">
      <!-- <div class="content-line">
        <span class="content-line-label">标题</span>
        <p class="content-line-text">{{ msgList[currentMsgIndex].title }}</p>
      </div> -->
      <div class="content-line">
        <span class="content-line-label">时间</span>
        <p class="content-line-text">{{ msgList[currentMsgIndex].createTime }}</p>
      </div>
      <div class="content-line">
        <span class="content-line-label">内容</span>
        <p class="content-line-text">{{ msgList[currentMsgIndex].messageContent }}</p>
      </div>
    </div>
    <template #footer>
      <footer class="flex justify-between items-center">
        <div>
          <ElButton v-if="currentMsgIndex > 0" @click="showLastMsg"> 上一条 </ElButton>
          <ElButton v-if="currentMsgIndex < msgList.length - 1" @click="showNextMsg">
            下一条
          </ElButton>
        </div>
        <ElButton type="primary" @click="closeMsgModal"> 确认 </ElButton>
      </footer>
    </template>
  </ActionDialog>
</template>

<style lang="less" scoped>
.login-msg-content {
  padding-inline: 2em;

  .content-line {
    display: flex;
    padding-top: 1em;
  }

  .content-line-label {
    padding-right: 2em;
  }

  .content-line-text {
    margin: 0;
    flex: 1;
    white-space-collapse: preserve-breaks;
    text-wrap: pretty;
  }
}
</style>
