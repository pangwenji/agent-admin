<script setup lang="ts">
import { onMounted } from 'vue'
import {
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessageBox,
  FormRules,
  ElMessage,
  FormInstance
} from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { useLogout } from '@/hooks/web/useLogout'
import { ref, reactive } from 'vue'
import { updatePasswords } from '@/api/drawingResult'
import { Icon } from '@/components/Icon'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { AgentTypeEnums } from '@/enum'
import { checkPassword } from '@/hooks/web/useValidator'
import { commonHandleInput } from '@/hooks/web/useInstantNote'
import encryptTools from '@/utils/encrypt'
type RuleForm = {
  oldPassword: string
  newPassword: string
  oldOperationCode: string
  newOperationCode: string
}

const formRef = ref<FormInstance>()
const validateForm = ref({
  oldPassword: '',
  newPassword: '',
  oldOperationCode: '',
  newOperationCode: ''
})

const pwdRules = reactive<FormRules<RuleForm>>({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: checkPassword, trigger: 'blur' }
  ]
})
const optPWDRules = reactive<FormRules<RuleForm>>({
  oldOperationCode: [{ required: true, message: '请输入旧操作密码', trigger: 'blur' }],
  newOperationCode: [{ required: true, message: '请输入新操作密码', trigger: 'blur' }]
})

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const logoutAction = useLogout()

const loginOuts = () => {
  ElMessageBox.confirm('是否退出本系统', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return logoutAction.logout()
    })
    .catch(() => {})
}

// 锁定屏幕
const modifyOperationCode = (e: MouseEvent) => {
  e.stopPropagation()
  isShowOpenationCode.value = true
}

const isShowDialog = ref(false)

let isShowOpenationCode = ref(false)
const close = () => {
  isShowDialog.value = false
  validateForm.value.newPassword = ''
  validateForm.value.oldPassword = ''
}

const closeOenration = () => {
  validateForm.value.newOperationCode = ''
  validateForm.value.oldOperationCode = ''
  isShowOpenationCode.value = false
}

const confirm = async (type: string) => {
  try {
    const isLoginType = type === '1'
    await formRef.value?.validate()
    let params = {
      oldPwd: encryptTools.RSAencrypt(
        isLoginType ? validateForm.value.oldPassword : validateForm.value.oldOperationCode
      ),
      newPwd: encryptTools.RSAencrypt(
        isLoginType ? validateForm.value.newPassword : validateForm.value.newOperationCode
      ),
      isLogin: isLoginType ? true : false
    }

    let res = await updatePasswords(params)
    if (res.success && res.data) {
      ElMessage.success(isLoginType ? '修改登录密码成功！' : '修改操作密码成功！')
    } else {
      if (res.message) {
        ElMessage.error(res.message)
      }
    }
    isShowDialog.value = false
    isShowOpenationCode.value = false
    formRef.value?.resetFields()
  } catch (err) {}
}

const cancel = () => {
  isShowDialog.value = false
  isShowOpenationCode.value = false
  formRef.value?.resetFields()
}

const changePassword = (e: MouseEvent) => {
  e.stopPropagation()
  isShowDialog.value = true
}

// 用户信息
const infoLoading = ref(true)
const agentInfoStore = useAgentInfoStore()

const handleInput = (event, type) => {
  if (type === 'old') {
    validateForm.value.oldOperationCode = commonHandleInput(event)
  } else {
    validateForm.value.newOperationCode = commonHandleInput(event)
  }
}

onMounted(async () => {
  try {
    await agentInfoStore.getAgentInfo()
  } catch {
  } finally {
    infoLoading.value = false
  }
})
</script>

<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <div class="info-wrapper">
        <img src="@/assets/imgs/avatar.jpg" alt="" class="avatar rounded-[50%]" />
        <div v-loading="infoLoading" class="info-content">
          <span class="<md:hidden text-14px text-[var(--top-header-text-color)] user-name truncate">
            {{ agentInfoStore.info?.account || agentInfoStore.info?.username || '用户名' }}
          </span>
          <span class="<md:hidden text-12px text-[var(--top-header-text-color)]">
            {{ agentInfoStore.info ? AgentTypeEnums[agentInfoStore.info.agentType] : '类型' }}
          </span>
        </div>
      </div>
      <Icon icon="svg-icon:arrow" :size="20" />
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem class="p-0">
          <div class="flex items-center" @click="(e) => changePassword(e)">
            <Icon icon="svg-icon:lock" :size="14" class="mr-2" />修改登录密码
          </div>
        </ElDropdownItem>
        <ElDropdownItem class="p-0" divided>
          <div class="flex items-center" @click="(e) => modifyOperationCode(e)">
            <Icon icon="svg-icon:lock" :size="14" class="mr-2" />修改操作密码
          </div>
        </ElDropdownItem>
        <ElDropdownItem class="p-0" divided>
          <div class="flex items-center" @click="loginOuts">
            <Icon icon="svg-icon:logout" :size="14" class="mr-2" />退出系统
          </div>
        </ElDropdownItem>
      </ElDropdownMenu>
      <!-- 修改密码 -->
      <el-dialog
        v-model="isShowDialog"
        width="400"
        style="height: 300px; border-radius: 16px"
        align-center
        :close-on-click-modal="false"
        :before-close="() => close()"
      >
        <template #header>
          <p style="padding-left: 10px; font-size: 14px"> 修改登录密码 </p>
        </template>
        <el-form v-if="isShowDialog" ref="formRef" :rules="pwdRules" :model="validateForm">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model.trim="validateForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model.trim="validateForm.newPassword" type="password" show-password />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button class="btn" @click="confirm('1')"> 确认</el-button>
          <el-button @click="cancel()">取消</el-button>
        </div>
      </el-dialog>
      <!-- 修改操作码 -->
      <el-dialog
        v-model="isShowOpenationCode"
        width="400"
        style="height: 300px; border-radius: 16px"
        align-center
        :close-on-click-modal="false"
        :before-close="() => closeOenration()"
      >
        <template #header>
          <p style="font-size: 14px; padding-left: 10px"> 修改操作密码</p>
        </template>
        <el-form
          v-if="isShowOpenationCode"
          ref="formRef"
          :rules="optPWDRules"
          :model="validateForm"
        >
          <el-form-item label="旧操作密码" prop="oldOperationCode">
            <el-input
              v-model.trim="validateForm.oldOperationCode"
              type="password"
              show-password
              :maxlength="6"
              @input="(e) => handleInput(e, 'old')"
            />
          </el-form-item>
          <el-form-item label="新操作密码" prop="newOperationCode">
            <el-input
              v-model.trim="validateForm.newOperationCode"
              type="password"
              show-password
              :maxlength="6"
              @input="(e) => handleInput(e, 'new')"
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button class="btn" @click="confirm('2')"> 确认</el-button>
          <el-button @click="cancel()">取消</el-button>
        </div>
      </el-dialog>
    </template>
  </ElDropdown>
</template>

<style scoped lang="less">
@prefix-cls: ~'@{namespace}-user-info';
.@{prefix-cls} {
  padding-right: 40px;
  &:hover {
    background-color: transparent;
    color: var(--el-color-primary);
  }
  .el-tooltip__trigger {
    &[aria-expanded='true'] {
      .v-icon {
        transform: rotate(180deg);
      }
    }
    .avatar {
      width: 28px;
      margin-right: 8px;
    }

    .v-icon {
      margin-left: 12px;
      transition: transform 0.3s linear;
    }

    .info-wrapper {
      display: flex;
      align-items: flex-end;
    }
    .info-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .user-name {
        max-width: 10em;
        line-height: 1.25;
      }
    }
  }
}

.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition:
    opacity 0.25s,
    transform 0.3s;
}

.fade-bottom-enter-from {
  opacity: 0;
  transform: translateY(-10%);
}

.dialog-footer {
  position: absolute;
  right: 20px;
}
.btn {
  background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
  color: #ffffff;
}
.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(10%);
}
</style>
