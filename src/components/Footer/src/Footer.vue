<script setup lang="ts">
import { useDesign } from '@/hooks/web/useDesign'
import { ref } from 'vue'
import { computed } from 'vue'
import LoginMsgDialog from './LoginMsgDialog.vue'
import { MessageTableData, MsgDisplayType } from '@/api/system/message/types'
import { onMounted } from 'vue'
import { getMessageList } from '@/api/system/message'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('footer')

const loginMsgList = ref<MessageTableData[]>([])
const marqueeMsgList = ref<MessageTableData[]>([])
onMounted(async () => {
  try {
    const listRes = await getMessageList()
    loginMsgList.value = listRes.filter((msg) => msg.displayType.includes(MsgDisplayType.Login))
    marqueeMsgList.value = listRes.filter((msg) => msg.displayType.includes(MsgDisplayType.Marquee))
  } catch {}
})

const windowWidth = document.documentElement.clientWidth
const msgFontSize = 14
const pixelSpeed = 0.01
const getMsgWidth = (text: string) => {
  return text.length * msgFontSize
}
const getLineWidth = (msgWidth: number) => {
  return (msgWidth > windowWidth ? msgWidth : windowWidth) + msgWidth
}
const getLineStyle = (text: string) => {
  const msgWidth = getMsgWidth(text)
  const lineWidth = getLineWidth(msgWidth)
  return {
    width: `${lineWidth}px`
  }
}
const totalScroll = computed(() => {
  let linePadding = 0

  const root = document.querySelector(':root')
  const rootStyle = getComputedStyle(root!)
  const contentPadding = Number(
    (rootStyle.getPropertyValue('--app-content-padding') || '').replaceAll(/\D/g, '')
  )
  const paddingNum = 2
  linePadding = contentPadding * paddingNum

  const totalWidth = marqueeMsgList.value.reduce((result, msg) => {
    const msgWidth = getMsgWidth(msg.messageContent)
    const lineWidth = getLineWidth(msgWidth)
    const msgLineWidth = lineWidth + linePadding
    return result + msgLineWidth
  }, 0)

  return {
    totalScrollDuration: totalWidth * pixelSpeed,
    totalWidth
  }
})
</script>

<template>
  <div
    :class="prefixCls"
    :v-if="marqueeMsgList.length"
    class="text-[var(--el-text-color-placeholder)] bg-[var(--app-content-bg-color)] h-[var(--app-footer-height)] leading-[var(--app-footer-height)] dark:bg-[var(--el-bg-color)]"
  >
    <div
      class="msg-container"
      :style="{
        animationDuration: `${totalScroll.totalScrollDuration}s`,
        width: `${totalScroll.totalWidth}px`
      }"
    >
      <div
        v-for="(msg, index) in marqueeMsgList"
        :key="index"
        class="msg-line"
        :style="getLineStyle(msg.messageContent)"
      >
        {{ msg.messageContent }}
      </div>
    </div>
  </div>
  <LoginMsgDialog :msg-list="loginMsgList" :show-close="false" />
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-footer';
.@{prefix-cls} {
  @keyframes scroll {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(-100%);
    }
  }

  position: relative;

  .msg-container {
    position: absolute;
    top: 0;
    left: 100%;
    display: flex;
    animation-delay: 2s;
    animation-iteration-count: infinite;
    animation-name: scroll;
    animation-timing-function: linear;
    align-items: center;
  }

  .msg-line {
    display: flex;
    height: 100%;
    align-items: center;
  }
}
</style>
