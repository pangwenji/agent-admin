<script setup lang="tsx">
import { reactive, ref, watch, onMounted } from 'vue'
import { ElButton, ElForm, ElFormItem, FormInstance, FormRules, ElMessage } from 'element-plus'
import { getCaptcha, login, setGoogleCode } from '@/api/login'
// import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'vue-router'
import { useStorage } from '@/hooks/web/useStorage'

import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { commonHandleInput } from '@/hooks/web/useInstantNote'
import { APIResponseCodes } from '@/api/common/types'
import encryptTools from '@/utils/encrypt'

const agentInfoStore = useAgentInfoStore() // 当前用户代理相关信息
interface RuleForm {
  graphicCode: string
  username: string
  password: string
  googleVerificationCode: string
}
const validateForm = reactive<RuleForm>({
  graphicCode: '',
  password: '',
  username: '',
  googleVerificationCode: ''
})

const UUID = ref('')

const captchaURL = ref()
const captchaLoading = ref(false)

const { setStorage, clear: clearStorage } = useStorage()

const formRef = ref<FormInstance>()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const isShowGoogleKey = ref(false)

const rulesGoogleCode = reactive<FormRules<RuleForm>>({
  googleVerificationCode: [{ required: true, message: '请输入谷歌验证码', trigger: 'blur' }]
})

const rules = reactive<FormRules<RuleForm>>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})
const loading = ref(false)

const redirect = ref<string>('')
let account

const refreshVerificationCode = () => {
  validateForm.graphicCode = ''
  getGraphicCode()
}
const handleCaptchaLoad = () => {
  window.URL.revokeObjectURL(captchaURL.value)
}
const generateUUID = () => {
  UUID.value = uuidv4()
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

// 跳转首页
const jumpToHome = async () => {
  loading.value = true
  await agentInfoStore.getAgentInfo()
  await setTheEnteredParameters() // 初始化动态路由, 不能放到 setStorage 之前
  push({
    path: '/'
  })
}

const resetLoginForm = () => {
  validateForm.googleVerificationCode = ''
  validateForm.graphicCode = ''
  validateForm.username = ''
  validateForm.password = ''
  isShowGoogleKey.value = false
}

// google 验证码提交
const confirm = async () => {
  if (!validateForm.googleVerificationCode) {
    return ElMessage.error('请输入谷歌验证码')
  }
  let param = {
    account: account,
    googleCode: validateForm.googleVerificationCode
  }
  try {
    loading.value = true
    let res = await setGoogleCode(param)
    setStorage('token', res.data.token)
    setStorage('userId', res.data.id)
    await jumpToHome()
  } catch (error) {
    // 返回登录表单，并重置
    if ((error as IResponse)?.code === APIResponseCodes.GoogleTry3Relogin) {
      resetLoginForm()
    }
    clearStorage()
    refreshVerificationCode()
    loading.value = false
  }
}

onMounted(() => {
  generateUUID()
  getGraphicCode()
})

const setTheEnteredParameters = async () => {
  await permissionStore.generateRoutes('static').catch(() => {})
  permissionStore.getAddRouters.forEach((route) => {
    addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
  })
  permissionStore.setIsAddRouters(true)
}

// 获取图形码
const getGraphicCode = async () => {
  captchaLoading.value = true
  try {
    let result = await getCaptcha({ browserFingerprint: UUID.value })
    captchaURL.value = result
  } catch (error) {
    ElMessage.error('图像码加载失败！')
  } finally {
    captchaLoading.value = false
  }
}

const handleInput = (event) => {
  validateForm.googleVerificationCode = commonHandleInput(event)
}

// 登录
const signIn = async (formRef: FormInstance | undefined) => {
  if (!formRef) {
    return
  }
  await formRef.validate(async () => {
    try {
      if (!validateForm.username) {
        return ElMessage.error('请输入用户名!')
      } else if (!validateForm.password) {
        return ElMessage.error('请输入密码')
      } else if (!validateForm.graphicCode?.trim()) {
        return ElMessage.error('请输入图形码')
      }

      let param = {
        username: validateForm.username,
        password: encryptTools.RSAencrypt(`${validateForm.password}`),
        browserFingerprint: UUID.value,
        verificationCode: validateForm.graphicCode
          ? validateForm.graphicCode.replace(/\s/g, '')
          : ''
      }

      loading.value = true
      const result = await login(param)
      setStorage('token', result.data.token)
      setStorage('userId', result.data.id)
      // 弹出操作密码
      if (Reflect.has(result.data, 'needUpdateOperatePwd') && result.data.needUpdateOperatePwd) {
        // 操作密码框
        setStorage('isShowOperationCode', true)
        await jumpToHome()
        return
      }
      //弹出谷歌验证码
      if (Reflect.has(result.data, 'account')) {
        isShowGoogleKey.value = true
        validateForm.googleVerificationCode = ''
        account = result.data.account
        loading.value = false
        return
      }

      if (
        !Reflect.has(result.data, 'needUpdateOperatePwd') &&
        !Reflect.has(result.data, 'account')
      ) {
        await jumpToHome()
      }
    } catch (error) {
      //  ip 被禁跳转 google
      if ((error as IResponse)?.code === APIResponseCodes.IPForbidden) {
        resetLoginForm()
        window.location.href = 'https://www.google.com'
      }
      clearStorage()
      refreshVerificationCode()
      loading.value = false
    }
  })
}
</script>

<!-- eslint-disable no-magic-numbers -->
<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
  <div class="box">
    <div class="headline">
      <span class="headline-title"> 后台管理 </span>
      <span class="headline-subTitle">欢迎回来！</span>
    </div>
    <el-form
      v-if="!isShowGoogleKey"
      ref="formRef"
      :model="validateForm"
      :rules="rules"
      label-width="100px"
      label-position="top"
    >
      <el-form-item prop="username">
        <span class="label">用户名 <span class="star">*</span></span>
        <el-input v-model.trim="validateForm.username" type="text" :maxlength="20" />
      </el-form-item>
      <el-form-item prop="password">
        <span class="label">密码 <span class="star">*</span></span>
        <el-input v-model="validateForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item prop="graphicCode">
        <span class="label">图形验证码 <span class="star">*</span></span>
        <el-input v-model="validateForm.graphicCode" type="text" class="input">
          <template #append>
            <ElImage
              v-if="captchaURL"
              v-loading="captchaLoading"
              class="captcha"
              fit="contain"
              :src="captchaURL"
              @click="refreshVerificationCode"
              @load="handleCaptchaLoad"
            />
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <el-form
      v-else
      ref="formRef"
      :rules="rulesGoogleCode"
      :model="validateForm"
      label-width="100px"
      label-position="top"
    >
      <el-form-item prop="googleVerificationCode">
        <span class="label">谷歌验证码 <span class="star">*</span></span>
        <el-input
          v-model.number="validateForm.googleVerificationCode"
          type="text"
          :maxlength="6"
          @input="handleInput"
        />
      </el-form-item>
    </el-form>
    <div>
      <ElButton
        :loading="loading"
        class="w-[100%] btn"
        @click="isShowGoogleKey ? confirm() : signIn(formRef)"
      >
        {{ isShowGoogleKey ? '确认' : '登录' }}
      </ElButton>
    </div>
  </div>
</template>

<style scoped lang="less">
.btn {
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  color: #fff !important;
  background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
  border: 0;
  border-radius: 10px;
}

.dialog-footer {
  position: absolute;
  right: 5px;
}
.googleVerCode {
  font-size: 14px;
  color: #424251;
}

.el-form {
  min-width: 318.3px;
  min-height: 276px;
  :deep(.el-form-item__content) {
    width: 319px;
  }
}

:deep(.el-input__wrapper) {
  width: 152px;
  height: 40px;
  border-radius: 10px;
}

:deep(.input .el-input__wrapper) {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: -0.8px 0 0 0.8px var(--el-input-border-color, var(--el-border-color));
}

:deep(.input .el-input-group__append) {
  color: #424251;
  background: white;
  border-left: 0;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 0;
  box-shadow:
    0.8px 0.8px 0 0 var(--el-input-border-color, var(--el-border-color)),
    0.8px 0 0.8px 0 var(--el-input-border-color, var(--el-border-color)),
    0.8px 0 0 0.8px var(--el-input-border-color, var(--el-border-color));
}

.label {
  font-size: 14px;
  color: #5a577d;
}

.star {
  color: #2fafec;
}

.box {
  display: flex;
  flex-direction: column;
}

.headline {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;

  .headline-title {
    width: 100%;
    height: 46px;
    font-size: 36px;
    font-weight: 700;
  }

  .headline-subTitle {
    font-size: 14px;
    font-weight: 400;
    color: #5a577d;
  }
}

.captcha {
  display: flex;
  width: 90px;
  font-size: 18px;
  font-style: italic;
  font-weight: 600;
  justify-content: center;
  cursor: pointer;
}

.google {
  font-size: 20px;
}

:deep(.el-input-group__append) {
  padding: 0 2px;
}

:deep(.el-dialog__body) {
  height: 400px;
  border-top: 1px solid #ccc;
}

.btn-confirm {
  height: 36px;
  color: #fff;
  background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
}

.btn-cancel {
  height: 36px;
  background: #ccc;
}
</style>
