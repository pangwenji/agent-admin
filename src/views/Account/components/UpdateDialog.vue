/* * Description: 新增/编辑代理或会员 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script lang="ts" setup>
import { ref, unref, reactive, defineExpose, defineEmits, inject, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createAgentApi,
  editAgentApi,
  createPlayerApi,
  editPlayerApi,
  queryAllSubAgentsApi
} from '@/api/account'
import type { AccountAgentInfo, EditDirectParams } from '@/api/account/types'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { isValidIPv4, isValidIPv6 } from '@/utils/is'
import encryptTools from '@/utils/encrypt'
import { numberMultiplied100 } from '@/utils/number'

const props = defineProps({
  title: {
    type: String,
    default: '新增'
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
    default: (): EditDirectParams => {
      return {
        id: '',
        account: '',
        username: '',
        password: '',
        percentage: '',
        sportsPercentage: '',
        videoPercentage: '',
        parentAccount: '',
        parentPercentage: '',
        parentAgentId: '' // 上级id, 直属代理也可以帮下级新增直属代理
      }
    }
  }
})

const isAgentType = computed(() => props.originType === 'agent')
const agentInfoStore = useAgentInfoStore()
const infos = inject('parentInfo', {})

// 父级信息, isBelow-是否是帮下级新增代理--直属代理用
const parentInfo = computed(() => {
  const _infos = unref(infos)
  if (Object.keys(_infos).length)
    return { ..._infos, isBelow: true } as { id: number; isBelow?: boolean }
  return agentInfoStore?.info as AccountAgentInfo & { isBelow?: boolean }
})

const $bigNumber: any = inject('BigNumber')

// 是否是全部代理/全部会员
const isAll = inject('isAll')
const superiorList: any = ref([])
const superiorListTemp: any = ref([])

const updateForm = computed(() => {
  const form = props.curRowData
  if (!unref(isAll) && !unref(parentInfo)?.isBelow)
    form.parentAccount = agentInfoStore.info?.account
  // 编辑代理，默认有一条
  if (unref(isAgentType) && form.id) {
    form.ipWhite = Array.isArray(form.ipWhite)
      ? form.ipWhite
      : typeof form.ipWhite === 'string'
        ? form.ipWhite.split(';')
        : ['']
  }
  return form
})

/**是否需要选择上级
 *  编辑：不能选择上级
 *  新增： 1.全部代理和全部会员需要选择上级
 *        2.直属的用当前父级作上级
 *        3.直属代理帮下级新增代理，可以选择上级
 * */
const isSelectParent = computed(() => {
  if (updateForm.value.id) return false
  if (unref(isAll)) return true
  if (unref(parentInfo)?.isBelow) return true
  return false
})

// 是否必填
const isRequired = computed(() => !Boolean(props.curRowData?.id))

const activeParent: any = ref('')
const changeParent = (value) => {
  activeParent.value = superiorList.value.filter((item) => item.id === value)[0]
}

// 父级占成
const percentageCeil = computed(() => {
  const rowData = props.curRowData
  const _isAll = unref(isAll)
  let factAmount = rowData.parentPercentage
  if (!rowData.id) {
    if (_isAll) {
      if (activeParent.value?.percentage) {
        factAmount = activeParent.value?.percentage
      } else {
        factAmount = 0
      }
    } else {
      factAmount = agentInfoStore.info?.percentage
    }
  }
  return numberMultiplied100(factAmount)!
})
const sportsPercentageCeil = computed(() => {
  const rowData = props.curRowData
  const _isAll = unref(isAll)
  let factAmount = rowData.parentSportsPercentage
  if (!rowData.id) {
    if (_isAll) {
      if (activeParent.value?.sportsPercentage) {
        factAmount = activeParent.value?.sportsPercentage
      } else {
        factAmount = 0
      }
    } else {
      factAmount = agentInfoStore.info?.sportsPercentage
    }
  }
  return numberMultiplied100(factAmount)!
})
const videoPercentageCeil = computed(() => {
  const rowData = props.curRowData
  const _isAll = unref(isAll)
  let factAmount = rowData.parentVideoPercentage
  if (!rowData.id) {
    if (_isAll) {
      if (activeParent.value?.videoPercentage) {
        factAmount = activeParent.value?.videoPercentage
      } else {
        factAmount = 0
      }
    } else {
      factAmount = agentInfoStore.info?.videoPercentage
    }
  }
  return numberMultiplied100(factAmount)!
})

enum OriginTypeOptions {
  agent = '代理',
  player = '会员'
}
const formTitle = computed(() => {
  const value = OriginTypeOptions[props.originType]
  if (props.curRowData.id) {
    return '编辑' + value
  } else {
    return '新增' + value
  }
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

// 提交新增/编辑
const submitUpdateForm = async () => {
  const _params = { ...unref(updateForm) }
  delete _params.parentAccount
  // 处理 ip 地址
  if (_params.ipWhite?.length) {
    _params.ipWhite = _params.ipWhite.join(';')
  }

  const result = {
    success: false,
    message: '',
    type: ''
  }
  let editApi = editAgentApi
  let createApi = createAgentApi
  if (_params?.id) {
    // 编辑
    if (props.originType === 'player') editApi = editPlayerApi
    try {
      const parameters: any = {
        id: _params.id,
        account: _params.account || null,
        username: _params.username || null,
        // 处理密码加密
        password: _params.password
          ? encryptTools.RSAencrypt(window.btoa(_params.password))
          : undefined,
        percentage: $bigNumber(Number(_params.percentage)).dividedBy(100).toString() || undefined,
        sportsPercentage:
          $bigNumber(Number(_params.sportsPercentage)).dividedBy(100).toString() || undefined,
        videoPercentage:
          $bigNumber(Number(_params.videoPercentage)).dividedBy(100).toString() || undefined,
        ...(!!_params.ipWhite && { ipWhite: _params.ipWhite })
      }
      if (props.originType === 'player') {
        delete parameters.percentage
        delete parameters.sportsPercentage
        delete parameters.videoPercentage
        delete parameters.ipWhite
      }
      // 账号相同，则不修改
      if (parameters.account === props.curRowData.account) {
        delete parameters.account
      }
      const { success, message } = await editApi(parameters)
      result.success = success
      result.message = message as string
      result.type = '编辑'
    } catch {}
  } else {
    /** 新增:
     *  1. 直属代理/会员-用当前登录用户作为父级；全部代理/会员-需选择父级
     *  2. 直属代理可以帮下级新增直属代理
     *  2. 会员无占成
     *  3. 三级代理不能创建代理，但可创建会员
     * **/
    // 处理密码加密
    if (_params.password) {
      _params.password = encryptTools.RSAencrypt(_params.password)
    }
    const parameters: any = {
      account: _params.account,
      username: _params.username,
      password: _params.password,
      parentAgentId: _params.parentAgentId,
      percentage: $bigNumber(Number(_params.percentage)).dividedBy(100).toString(),
      sportsPercentage: $bigNumber(Number(_params.sportsPercentage)).dividedBy(100).toString(),
      videoPercentage: $bigNumber(Number(_params.videoPercentage)).dividedBy(100).toString(),
      ...(!!_params.ipWhite && { ipWhite: _params.ipWhite })
    }
    if (!unref(isAll) && unref(parentInfo)?.isBelow)
      parameters.parentAgentId = agentInfoStore.info?.id // 父级id
    if (props.originType === 'player') {
      createApi = createPlayerApi
      delete parameters.percentage
      delete parameters.sportsPercentage
      delete parameters.videoPercentage
      delete parameters.ipWhite
    }
    try {
      const { success, message } = await createApi(parameters)
      result.success = success
      result.message = message as string
      result.type = '新建'
    } catch {}
  }
  // eslint-disable-next-line no-magic-numbers
  if (result.success) {
    ElMessage({
      type: 'success',
      message: `${result.type}成功`
    })
    emits('submitUpdate')
    visible.value = false
  } else {
    ElMessage({
      type: 'error',
      message: result.message
    })
  }
}

// 查询下级代理列表
const queryAllSubAgents = async () => {
  try {
    const res = await queryAllSubAgentsApi({
      agentId: parentInfo.value?.id
    })
    if (res.success) {
      superiorList.value = res.data
      // agetntTye 0-总公司，1-分公司，2-代理 ，agentLevel 1-一级代理，2-二级代理，3-三级代理(不能创建下级代理，但能创建下级会员)
      if (isAgentType.value) {
        superiorList.value = res.data.filter((item) => item.agentLevel !== 3)
      }
      superiorListTemp.value = superiorList.value
    }
  } catch {}
}

const remoteMethod = (query: string) => {
  const tempList = unref(superiorListTemp.value)
  if (!query) superiorList.value = tempList
  superiorList.value = tempList.filter((item) =>
    item.account.toLowerCase().includes(query.toLowerCase())
  )
}

const handleOpen = () => {
  visible.value = true
  if (unref(isSelectParent)) queryAllSubAgents()
}

// X关闭
const closeDialog = () => {
  formRef.value?.resetFields()
  visible.value = false
  emits('close')
}

const showPwd = ref(false)
const changePrivacy = () => {
  showPwd.value = !showPwd.value
}

const cancelForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  visible.value = false
}
const checkPassword = (_, value: any, callback: any) => {
  if (!unref(isRequired)) callback()
  if (!value) callback(new Error('请输入密码'))
  callback()
}
const checkPercentage = (_, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入占成'))
  } else if (value > percentageCeil.value.toNumber()) {
    callback(new Error(`占成不能大于${percentageCeil.value}%`))
  } else {
    callback()
  }
}
const checkSportsPercentage = (_, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入占成'))
  } else if (value > sportsPercentageCeil.value.toNumber()) {
    callback(new Error(`占成不能大于${sportsPercentageCeil.value}%`))
  } else {
    callback()
  }
}
const checkVideoPercentage = (_, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入占成'))
  } else if (value > videoPercentageCeil.value.toNumber()) {
    callback(new Error(`占成不能大于${videoPercentageCeil.value}%`))
  } else {
    callback()
  }
}

const ipWhiteRules = [
  {
    required: true,
    message: '请输入IP地址或者删除该行',
    trigger: 'blur'
  },
  {
    validator: (_: any, value: any, callback: any) => {
      if (!value || isValidIPv4(value) || isValidIPv6(value)) {
        if (value) {
          const whiteIPList = updateForm.value?.ipWhite
          if (whiteIPList.length > new Set(whiteIPList).size) {
            return callback(new Error('请不要重复输入IP地址'))
          }
        }
        return callback()
      }
      return callback(new Error('请输入正确的IP地址'))
    },
    trigger: 'blur'
  }
]
const rules = reactive<FormRules<EditDirectParams>>({
  parentAgentId: [
    {
      required: true,
      message: '请选择上级',
      trigger: 'change'
    }
  ],
  account: [
    {
      required: true,
      message: '请输入账号',
      trigger: 'blur'
    }
  ],
  username: [
    {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    }
  ],
  password: [{ validator: checkPassword, required: true, trigger: 'blur' }],
  percentage: [{ validator: checkPercentage, required: true, trigger: 'blur' }],
  sportsPercentage: [{ validator: checkSportsPercentage, required: true, trigger: 'blur' }],
  videoPercentage: [{ validator: checkVideoPercentage, required: true, trigger: 'blur' }]
})

// 处理 ip 白名单
const removeIPWhite = (index: number) => {
  updateForm.value.ipWhite?.splice(index, 1)
}
const addIPWhite = () => {
  if (updateForm.value.ipWhite) {
    updateForm.value.ipWhite?.push('')
  } else {
    updateForm.value.ipWhite = ['']
  }
}

const emits = defineEmits(['submitUpdate', 'close'])
defineExpose({ handleOpen, closeDialog, visible })
</script>

<template>
  <div class="baseDialog">
    <el-dialog v-model="visible" :title="formTitle" :width="dialogWidth" @close="closeDialog">
      <el-form
        v-if="visible"
        ref="formRef"
        :model="updateForm"
        label-width="100"
        label-position="left"
        :rules="rules"
        class="acc-form"
      >
        <el-form-item
          v-if="isSelectParent"
          label="上级"
          prop="parentAgentId"
          :required="isRequired"
        >
          <el-select
            v-model.trim="updateForm.parentAgentId"
            clearable
            filterable
            remote
            :remote-method="remoteMethod"
            placeholder="选择上级"
            class="parent_select"
            value-key="account"
            @change="changeParent"
          >
            <el-option
              v-for="item in superiorList"
              :key="item.id"
              :label="item.account"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="上级" prop="parentAccount" class="id-item">
          <el-input v-model.trim="updateForm.parentAccount" placeholder="上级" disabled />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input
            v-model.trim="updateForm.account"
            clearable
            :placeholder="`${OriginTypeOptions[props.originType]}账号`"
          />
        </el-form-item>
        <el-form-item label="名称" prop="username">
          <el-input
            v-model.trim="updateForm.username"
            clearable
            :placeholder="`${OriginTypeOptions[props.originType]}名称`"
          />
        </el-form-item>
        <template v-if="isAgentType">
          <el-form-item
            v-for="(_, index) in updateForm.ipWhite"
            :key="index"
            :label="index === 0 ? 'IP白名单' : ''"
            :prop="'ipWhite.' + index"
            :rules="ipWhiteRules"
          >
            <el-input
              v-model.trim="updateForm.ipWhite[index]"
              clearable
              placeholder="0.0.0.0表示放行全部"
            >
              <template #append>
                <el-button
                  class="mt-2"
                  :disabled="
                    !!props.curRowData.id && index === 0 && updateForm.ipWhite?.length === 1
                  "
                  @click.prevent="removeIPWhite(index)"
                >
                  删除
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="updateForm.ipWhite?.length ? '' : 'IP白名单'">
            <el-button v-if="isAgentType" class="w-full" @click.prevent="addIPWhite">
              添加IP地址
            </el-button>
          </el-form-item>
        </template>
        <el-form-item label="密码" prop="password" :required="isRequired" class="pwd-item">
          <el-input
            v-model.trim="updateForm.password"
            placeholder="请输入密码"
            clearable
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
        <template v-if="originType === 'agent'">
          <el-form-item label="彩票占成" prop="percentage" :required="isRequired">
            <el-input
              v-model.trim="updateForm.percentage"
              clearable
              type="number"
              placeholder="彩票占成%"
              @input="
                updateForm.percentage =
                  updateForm.percentage.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              "
            >
              <template #append>0% ~ {{ percentageCeil }}%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="体育占成" prop="sportsPercentage" :required="isRequired">
            <el-input
              v-model.trim="updateForm.sportsPercentage"
              clearable
              type="number"
              placeholder="体育占成%"
              @input="
                updateForm.sportsPercentage =
                  updateForm.sportsPercentage.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              "
            >
              <template #append>0% ~ {{ sportsPercentageCeil }}%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="视讯占成" prop="videoPercentage" :required="isRequired">
            <el-input
              v-model.trim="updateForm.videoPercentage"
              clearable
              type="number"
              placeholder="视讯占成%"
              @input="
                updateForm.videoPercentage =
                  updateForm.videoPercentage.toString().match(/^\d+(?:\.\d{0,2})?/) || ''
              "
            >
              <template #append>0% ~ {{ videoPercentageCeil }}%</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="showConfirmButton" type="primary" @click="handleConfirm(formRef)">
            确认
          </el-button>
          <el-button v-if="showCancelButton" type="info" @click="cancelForm(formRef)"
            >取消</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
@import url('./dialog.less');

:deep(.el-form-item) {
  margin-bottom: 22px;
  box-sizing: border-box;

  &.pwd-item {
    margin-bottom: 30px;
  }

  .item-append {
    border-right: none;

    .el-input__wrapper {
      padding-right: 60px;
      box-sizing: border-box;
      border-radius: 6px;
    }

    &.privacy {
      img {
        width: 18px;
        cursor: pointer;
        display: block;
      }
    }

    .el-input-group__append {
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

    .word {
      cursor: pointer;
    }
  }
}

:deep(.el-form-item__label) {
  padding-right: 20px;
}

:deep(.parent_select) {
  width: 100%;
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
