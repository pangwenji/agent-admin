<template>
  <div>
    <!-- 操作密码 -->
    <el-dialog
      v-model="isShow"
      width="592"
      :z-index="8000"
      style="height: 538px; border-radius: 16px"
      :close-on-click-modal="false"
      :show-close="false"
      center
    >
      <template #header>
        <div class="operation-box">
          <div class="back" @click="refresh">
            <el-icon><Back /></el-icon>
          </div>
          <p>
            {{ operationTitle }}
          </p>
        </div>
      </template>
      <OperationPassword ref="pwdRef" @re-confirm="reConfirms" @set-dialog-title="dialogTitle" />
    </el-dialog>
  </div>
</template>
<script lang="tsx">
import { defineComponent, ref, watch } from 'vue'
import OperationPassword from '@/views/Login/components/OperationPassword.vue'
import { useEmitt } from '@/hooks/event/useEmitt'
import { setPassword } from '@/api/login'
import { ElMessage, ElDialog } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { useStorage } from '@/hooks/web/useStorage'
import encryptTools from '@/utils/encrypt'
export default defineComponent({
  name: 'OperatePassword',
  components: { OperationPassword, Back, ElDialog },
  setup() {
    const isShow = ref(false)

    const { getStorage, setStorage } = useStorage()

    const operationTitle = ref('设置操作密码')

    const { emitter } = useEmitt()

    const reConfirms = async (password: string) => {
      try {
        let res = await setPassword({ operatePwd: encryptTools.RSAencrypt(password) })
        // eslint-disable-next-line no-magic-numbers
        if (res.code === 200) {
          ElMessage.success('设置密码成功！')
          isShow.value = false
          setStorage('isShowOperationCode', false)
          emitter.emit('isShowPwd', false)
        } else {
          if (res.message) {
            ElMessage.warning(res.message)
          }
        }
      } catch (error) {}
    }

    const dialogTitle = (value: boolean) => {
      value ? (operationTitle.value = '确认操作密码') : (operationTitle.value = '设置操作密码')
    }
    const refresh = () => emitter.emit('reSetOpeartion')

    watch(
      () => getStorage('isShowOperationCode'),
      (v) => {
        isShow.value = v
      },
      {
        immediate: true
      }
    )

    return {
      isShow,
      operationTitle,
      refresh,
      reConfirms,
      dialogTitle
    }
  }
})
</script>

<style lang="less" scoped>
.operation-box {
  display: flex;
  align-items: center;
  .back {
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  p {
    margin-left: 170px;
  }
}
</style>
