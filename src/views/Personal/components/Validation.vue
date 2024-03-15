/* * Description: 二次验证 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Switch } from '@/components/Switch'
import type { Action } from 'element-plus'
import clipboard3 from 'vue-clipboard3'
import { googleInfoApi, googleEnableApi } from '@/api/personal'

const googleInfo = async () => {
  try {
    const res = await googleInfoApi()
    if (res.success) {
      const { googleKey, googleUrl, isGoogleOpen } = res.data
      validInfo.googleKey = googleKey
      validInfo.googleUrl = googleUrl
      validInfo.isGoogleOpen = Boolean(isGoogleOpen)
    }
  } catch {}
}

onMounted(() => {
  googleInfo()
})

const { toClipboard } = clipboard3()
const onCopy = async () => {
  try {
    await toClipboard(validInfo.googleKey)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
const validInfo = reactive({
  googleKey: '',
  googleUrl: '',
  isGoogleOpen: false
})

const verifyCode = reactive({
  isOpen: false,
  loading: false
})

const changeCode = (): Promise<boolean> => {
  verifyCode.loading = true
  return new Promise((resolve) => {
    const _text = validInfo.isGoogleOpen ? '关闭' : '开启'
    const _switchStatus = validInfo.isGoogleOpen ? 0 : 1
    let desc = `确定要 <span style="color:#2fafec">${_text}</span> 谷歌验证码?`
    if (!_switchStatus) {
      desc = `确定要 <span style="color:#ee5b75">${_text}</span> 谷歌验证码?`
    }
    ElMessageBox.alert(desc, '操作确认', {
      confirmButtonText: '确定',
      distinguishCancelAndClose: true,
      dangerouslyUseHTMLString: true,
      customClass: 'switch_messageBox',
      callback: async (action: Action) => {
        if (action === 'confirm') {
          const { success } = await googleEnableApi({
            open: _switchStatus
          })
          verifyCode.loading = false
          if (success) {
            ElMessage({
              type: 'success',
              message: `${_text} 成功`
            })
            return resolve(true)
          } else {
            ElMessage({
              type: 'error',
              message: `${_text} 失败`
            })
            return resolve(false)
          }
        } else {
          verifyCode.loading = false
        }
      }
    })
  })
}

// 下载二维码
const onDownload = () => {
  if (!validInfo.googleUrl) return
  downloadImage(validInfo.googleUrl, '谷歌二维码')
}
const downloadImage = async (imgUrl: any, name: any) => {
  try {
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      // @ts-ignore
      context.drawImage(image, 0, 0, image.width, image.height)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      const event = new MouseEvent('click')
      a.download = name || 'photo'
      a.href = url
      a.dispatchEvent(event)
      ElMessage({
        type: 'success',
        message: `已下载`
      })
    }
    image.src = imgUrl
  } catch {
    ElMessage({
      type: 'error',
      message: `下载失败`
    })
  }
}
</script>
<template>
  <div class="valid-box">
    <div class="row">
      <div class="title">谷歌验证码</div>
      <div class="content">
        <Switch
          v-model="validInfo.isGoogleOpen"
          :loading="verifyCode.loading"
          inline-prompt
          :before-change="changeCode"
        />
      </div>
    </div>
    <div class="row">
      <div class="title">谷歌授权码</div>
      <div class="content">
        <div class="auth-code" @click="onCopy">
          <span>{{ validInfo.googleKey }}</span>
          <span class="btn">复制</span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="title">谷歌二维码</div>
      <div class="content">
        <div class="fill">
          <img :src="validInfo.googleUrl" alt="" />
        </div>
        <div class="btn" @click="onDownload">下载二维码</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.valid-box {
  width: 373px;
  border: 1px solid #4847601a;
  border-radius: 8px;

  .title {
    display: flex;
    height: 42px;
    font-family: 'Microsoft YaHei UI';
    font-size: 14px;
    line-height: 18px;
    background: #c2e8ff33;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
  }

  .content {
    display: flex;
    width: 100%;
    min-height: 42px;
    padding: 15px 0;
    color: #5a577d;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
  }

  .auth-code {
    display: flex;
    width: 100%;
    font-family: 'Microsoft YaHei UI';
    font-size: 14px;
    justify-content: center;
    align-items: center;

    span {
      cursor: pointer;
    }
  }

  .fill {
    width: 95px;
    height: 95px;

    img {
      max-width: 100%;
    }
  }

  .btn {
    margin-left: 20px;
    font-family: 'Microsoft YaHei UI';
    font-size: 14px;
    color: #2fafec;
    cursor: pointer;
    box-sizing: border-box;
  }
}

:deep(.el-switch.is-checked) {
  .el-switch__inner .is-text {
    color: #fff;
  }
}
</style>
<style lang="less">
.switch_messageBox {
  max-width: 390px;
  padding-bottom: 25px;
  border-radius: 16px;
  box-shadow: 0 2px 10px 0 #4c67641a;

  .el-message-box__header {
    padding-bottom: 18px;
    border-bottom: 1px solid #4847601a;
  }

  .el-message-box__content {
    padding-top: 20px;
  }

  .el-message-box__title {
    // font-family: "Microsoft YaHei UI";
    font-size: 14px;
    font-weight: 400;
    color: #424251;
  }

  .el-button--primary {
    width: 80px;
    height: 36px;
    background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
    border: none;
    border-radius: 6px;
  }
}
</style>
