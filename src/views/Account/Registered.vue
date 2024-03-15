/* * Description: 代理注册 * Author: * Date: 2023-11-23 */
<script lang="ts" setup>
import { ref, unref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { registerAgentApi, registerPlayerApi } from '@/api/account'
import { getCaptcha } from '@/api/login'
import type { RegisterAgentParams } from '@/api/account/types'
import { v4 as uuidv4 } from 'uuid'
import encryptTools from '@/utils/encrypt'

const captchaURL = ref()
const captchaLoading = ref(false)
const generateUUID = () => {
  registerForm.browserFingerprint = uuidv4()
}

const registerFormRef = ref<FormInstance>()
const registerForm = reactive<RegisterAgentParams>({
  account: '',
  username: '',
  password: '',
  browserFingerprint: '',
  verificationCode: '',
  recommendLink: ''
})

onMounted(() => {
  generateUUID()
  getGraphicCode()
  registerForm.recommendLink = getQueryParams(location.href, 'invited')
})

enum RegisterType {
  agent = '代理',
  player = '会员'
}

const isFull = computed(() => {
  return (
    registerForm.account &&
    registerForm.username &&
    registerForm.password &&
    registerForm.verificationCode
  )
})

const regTitle = computed(() => {
  const type = getQueryParams(location.href, 'type')
  if (!type || location.href.indexOf('type') === -1) return ''
  return RegisterType[type]
})

// 表单验证
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      submitRegister()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 提交注册
const submitRegister = async () => {
  try {
    const _params = { ...unref(registerForm) }
    if (!_params.recommendLink || !unref(regTitle)) {
      return ElMessage.error('邀请链接错误')
    }
    if (_params.verificationCode) {
      _params.verificationCode = _params.verificationCode.replace(/\s/g, '')
    }
    const type = getQueryParams(location.href, 'type')
    let fetchApi = registerAgentApi
    if (type && type === 'player') fetchApi = registerPlayerApi
    const res = await fetchApi({
      ..._params,
      password: encryptTools.RSAencrypt(_params.password)
    } as RegisterAgentParams)
    if (res.success) {
      ElMessage({
        type: 'success',
        message: `注册成功`
      })
    } else {
      ElMessage({
        type: 'error',
        message: res.message as string
      })
    }
    generateUUID()
    getGraphicCode()
  } catch {
    generateUUID()
    getGraphicCode()
  }
}

// 获取图形码
const getGraphicCode = async () => {
  captchaLoading.value = true
  try {
    let data = await getCaptcha({ browserFingerprint: registerForm.browserFingerprint! })
    captchaURL.value = data
  } catch (error) {
    ElMessage.error('图像码加载失败！')
  } finally {
    captchaLoading.value = false
  }
}

const handleCaptchaLoad = () => {
  window.URL.revokeObjectURL(captchaURL.value)
}

const getQueryParams = (url: string, targetKey: string) => {
  const params: Record<string, any> = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    const keyValuePairs = queryString.split('&')
    keyValuePairs.forEach((pair) => {
      const [key, value] = pair.split('=')
      params[key] = value
    })
  }
  if (params[targetKey]) return params[targetKey]
  return null
}

const checkPassword = (rule: any, value: any, callback: any) => {
  if (!value) callback(new Error('请输入密码'))
  callback()
  // const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,12}$/
  // if (value === '') {
  //   callback(new Error('请输入密码'))
  // } else if (!reg.test(value)) {
  //   callback(new Error(`必须同时包含大写字母、小写字母、数字, 以及长度8-12位`))
  // } else {
  //   callback()
  // }
  console.log(rule)
}

const rules = reactive<FormRules<RegisterAgentParams>>({
  account: [{ required: true, message: '请输入账号', trigger: 'change' }],
  username: [{ required: true, message: '请输入名称', trigger: 'change' }],
  password: [{ validator: checkPassword, required: true, trigger: 'change' }],
  verificationCode: [{ required: true, message: '请输入验证码', trigger: 'change' }]
})

const showPwd = ref(false)
const changePrivacy = () => {
  showPwd.value = !showPwd.value
}
</script>

<template>
  <div class="register-frame">
    <el-form ref="registerFormRef" class="formBox" :model="registerForm" :rules="rules">
      <div class="title">{{ regTitle }}注册</div>
      <el-form-item label="账号" prop="account">
        <el-input v-model.trim="registerForm.account" />
      </el-form-item>
      <el-form-item label="名称" prop="username">
        <el-input v-model.trim="registerForm.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model.trim="registerForm.password"
          :type="showPwd ? 'text' : 'password'"
          class="item-append privacy"
        >
          <template #append>
            <div @click="changePrivacy">
              <img v-if="showPwd" src="@/assets/imgs/privacy_open.png" alt="" />
              <img v-else src="@/assets/imgs/privacy_close.png" alt="" />
            </div>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="verificationCode">
        <el-input v-model.trim="registerForm.verificationCode" class="item-append code">
          <template #append>
            <ElImage
              v-if="captchaURL"
              v-loading="captchaLoading"
              class="captcha"
              fit="contain"
              :src="captchaURL"
              @click="getGraphicCode"
              @load="handleCaptchaLoad"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <div :class="{ active: isFull }" class="submitBtn" @click="submitForm(registerFormRef)"
          >确认注册</div
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<style scoped lang="less">
.register-frame {
  width: 100%;
  min-height: 100vh;
  padding: 0 16px 20px;
  margin: 0 auto;
  box-sizing: border-box;
  background: #eee;
  background: url('@/assets/imgs/register_bg.png') no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .title {
    font-family: PingFang SC;
    font-size: 36px;
    font-weight: 600;
    line-height: 50px;
    text-align: left;
    color: #424251;
    margin-bottom: 25px;
    box-sizing: border-box;
  }
}
.formBox {
  width: calc(100% - 40px);
  max-width: 410px;
}
:deep(.el-form-item) {
  width: 100%;
  flex-direction: column;

  .el-form-item__label {
    justify-content: flex-start;
    font-family: 'Microsoft YaHei UI';
    font-size: 14px;
    &::before {
      display: none;
    }
    &::after {
      content: '*';
      color: #2fafec;
    }
  }
  .el-input {
    width: 100%;
    height: 50px;
    font-size: 16px;

    .el-input__wrapper {
      border-radius: 10px;
      border-color: #48476047;
      background: #fff;
    }
  }
  .item-append {
    border-right: none;
    .el-input__wrapper {
      padding-right: 140px;
    }
    &.privacy {
      img {
        width: 18px;
        cursor: pointer;
        display: block;
      }
    }
    .el-input-group__append {
      padding-left: 5px;
      padding-right: 2px;
      margin-left: -1px;
      box-sizing: border-box;
      font-size: 18px;
      font-style: italic;
      font-weight: 600;
      letter-spacing: 3px;
      color: #000;
      background: none;
      box-shadow: none;
      position: absolute;
      right: 0;
    }
    .captcha {
      width: 120px;
      cursor: pointer;
    }
  }
}

.submitBtn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  background: #ededef;
  color: #48476080;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC;
  font-size: 16px;
  cursor: pointer;
  margin-top: 25px;
  box-sizing: border-box;
  transition: all 0.2s;
  &.active {
    background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
    color: #fff;
  }
}

:deep(.el-form) {
  margin: 0 auto;
}

:deep(.el-button) {
  width: 100%;
}

@media screen and(max-width: 640px) {
  .formBox {
    width: calc(100% - 20px);
    // max-width: 410px;
  }
  .register-frame {
    .title {
      font-size: 28px;
      line-height: 39px;
    }
  }
  :deep(.el-form-item) {
    margin-bottom: 15px;
    .el-input {
      height: 40px;
    }
    .item-append {
      .el-input__wrapper {
        padding-right: 120px;
      }
      .el-input-group__append {
        letter-spacing: 1px;
      }
    }
  }
  .submitBtn {
    height: 40px;
    font-size: 14px;
    border-radius: 10px;
    margin-top: 30px;
  }
}

input,
textarea,
div {
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}
</style>
