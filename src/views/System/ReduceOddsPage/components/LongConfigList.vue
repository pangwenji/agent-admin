<script setup lang="tsx">
import { ref, unref, reactive, defineProps, computed, onMounted } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import {
  getSmartLongList,
  saveSmartLong,
  getAllSmartConfigStatus,
  updateAllSmartConfigStatus,
  updateSmartLongStatus,
  deleteSmartLong
} from '@/api/system/reduce'

import { Table } from '@/components/Table'
import { Switch } from '@/components/Switch'
import { ActionDialog } from '@/components/ActionDialog'
import MemberList from './MemberList.vue'
import AgentList from './AgentList.vue'
import LongWrite from './LongWrite.vue'
import {
  SmartLongLevelOptions,
  SwitchStatusEnums,
  SmartLongItem,
  SmartLongLevelEnums,
  SmartReduceConfigType
} from '@/api/system/reduce/types'
import { SwitchStatus } from '@/enum'

const props = defineProps<{ gameCode: string }>()

const ids = ref<number[]>([])

const oddsCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '序号',
    width: '200px',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'level',
    label: '长龙配置',
    width: '180px',
    slots: {
      default(data) {
        const level = (data.row as SmartLongItem).level
        return SmartLongLevelEnums[level]
      }
    },
    search: {
      hidden: false
    },
    form: {
      component: 'Select',
      componentProps: {
        options: SmartLongLevelOptions
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'amountChange',
    label: '降赔配置',
    width: '300px',
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      componentProps: {
        style: { width: 'auto' },
        step: 0.001,
        max: 0
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'gameCode',
    label: '点控代理',
    search: {
      hidden: true
    },
    width: 180,
    slots: {
      default: (data) => {
        return (
          <ElButton type="primary" onClick={() => showAgentAction(data.row)} link>
            查看
          </ElButton>
        )
      }
    },
    detail: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'gameCode',
    label: '点控会员',
    search: {
      hidden: true
    },
    width: 180,
    slots: {
      default: (data) => {
        return (
          <ElButton type="primary" onClick={() => showMemberAction(data.row)} link>
            查看
          </ElButton>
        )
      }
    },
    detail: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'isValidity',
    label: '状态',
    width: '168px',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    slots: {
      default(data) {
        const isValidity = (data.row as SmartLongItem).isValidity
        return SwitchStatusEnums[isValidity]
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    minWidth: 150,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const isValidity = (data.row as SmartLongItem).isValidity
          const isDisable = isValidity === SwitchStatus.Close
          const disableText = isDisable ? '启用' : '停用'
          const actionType = isDisable ? ActionType.Enable : ActionType.Disable
          return [
            <ElButton
              key="disable"
              type="primary"
              text
              onClick={() => switchAction(data.row, actionType)}
            >
              {disableText}
            </ElButton>,
            <ElButton key="delete" type="danger" text onClick={() => delData(data.row)}>
              删除
            </ElButton>
          ]
        }
      }
    }
  }
])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getSmartLongList({
      current: unref(currentPage),
      size: unref(pageSize),
      gameCode: props.gameCode
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteSmartLong({
      id: unref(ids)[0],
      lotteryCode: props.gameCode
    })
    return !!res
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { delList, getList, getElTableExpose } = tableMethods

const { allSchemas } = useCrudSchemas(oddsCrudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const closeDialog = () => {
  dialogVisible.value = false
  currentRow.value = null
  actionType.value = undefined
}
const currentRow = ref<SmartLongItem | null>(null)

const enum ActionType {
  Add = 1,
  Disable,
  Enable,
  AllDisable,
  AllEnable,
  ShowAgent,
  ShowMember
}

const actionType = ref<ActionType>()

// 新增
const addAction = () => {
  dialogTitle.value = '新增'
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ActionType.Add
}
const writeRef = ref<ComponentRef<typeof LongWrite>>()

const saveLoading = ref(false)
const handleAdd = async () => {
  const write = unref(writeRef)
  try {
    const formData = (await write?.submit()) as any
    if (formData) {
      saveLoading.value = true
      const res = await saveSmartLong({
        ...formData,
        gameCode: props.gameCode
      })
      if (res) {
        dialogVisible.value = false
        currentPage.value = 1
        getList()
        return true
      }
    }
  } catch {
  } finally {
    saveLoading.value = false
  }
}

// 删除
const delData = async (row: SmartLongItem | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: any) => v.id) || []
  await delList(unref(ids).length)
}

// 单条配置禁用/启用
const switchAction = (row: SmartLongItem, type: ActionType) => {
  dialogTitle.value = '信息'
  currentRow.value = row
  dialogVisible.value = true
  actionType.value = type
}
const handleSwitch = async () => {
  const row = currentRow.value
  if (!row) {
    ElMessage.warning('可操作数据缺失')
    return true
  }
  try {
    await updateSmartLongStatus({
      id: row.id,
      isValidity: Number(!row.isValidity),
      lotteryCode: props.gameCode
    })
    dialogVisible.value = false
    currentRow.value = null
    getList()
    return true
  } catch {}
}

// 总配置禁用/启用
const switchAllLoading = ref(true)
const switchAll = ref(false)
const switchAllAction = (type: ActionType) => {
  dialogTitle.value = '信息'
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = type
}
const handleSwitchAll = async () => {
  try {
    const isValidity = !switchAll.value
    await updateAllSmartConfigStatus({
      isValidity: Number(isValidity),
      gameCode: props.gameCode,
      smartType: SmartReduceConfigType.Long
    })
    switchAll.value = isValidity
    return true
  } catch {}
}

const initSwitchAll = async () => {
  switchAllLoading.value = true
  try {
    const status = await getAllSmartConfigStatus({
      gameCode: props.gameCode,
      smartType: SmartReduceConfigType.Long
    })
    switchAll.value = status.data || false
  } catch {
  } finally {
    switchAllLoading.value = false
  }
}

onMounted(() => {
  initSwitchAll()
})

// 查看代理
const showAgentAction = (row: SmartLongItem) => {
  dialogTitle.value = '新增'
  currentRow.value = row
  dialogVisible.value = true
  actionType.value = ActionType.ShowAgent
}
// 查看会员
const showMemberAction = (row: SmartLongItem) => {
  dialogTitle.value = '新增'
  currentRow.value = row
  dialogVisible.value = true
  actionType.value = ActionType.ShowMember
}
const switchType = computed(() => {
  return actionType.value === ActionType.Disable || actionType.value === ActionType.Enable
})
const switchAllType = computed(() => {
  return actionType.value === ActionType.AllDisable || actionType.value === ActionType.AllEnable
})
const showType = computed(() => {
  return actionType.value === ActionType.ShowAgent || actionType.value === ActionType.ShowMember
})
</script>

<template>
  <Table
    v-model:pageSize="pageSize"
    v-model:currentPage="currentPage"
    :columns="allSchemas.tableColumns"
    :data="dataList"
    :loading="loading || switchAllLoading"
    :pagination="{
      total: total
    }"
    :search="false"
    wrapper-shadow
    @register="tableRegister"
  >
    <template #title>
      <ElSpace :size="16">
        <span>降赔开关</span>
        <Switch
          :value="switchAll"
          @change="() => switchAllAction(switchAll ? ActionType.AllDisable : ActionType.AllEnable)"
        />
        <ElButton :loading="saveLoading" @click="addAction"> 新增 </ElButton>
      </ElSpace>
    </template>
  </Table>
  <ActionDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :close="closeDialog"
    :confirm="
      actionType === ActionType.Add
        ? handleAdd
        : switchType
          ? handleSwitch
          : switchAllType
            ? handleSwitchAll
            : undefined
    "
    :width="showType ? '70vw' : 500"
    :max-height="showType ? '60vh' : 300"
    :class="showType ? 'show-list-dialog' : undefined"
  >
    <LongWrite
      v-if="actionType === ActionType.Add"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
    />
    <div v-else-if="switchType">
      是否{{ actionType === ActionType.Disable ? '停用' : '启用' }}该配置?
    </div>
    <div v-else-if="switchAllType">
      是否{{ actionType === ActionType.AllDisable ? '关闭' : '开启' }}该游戏降赔配置?
    </div>
    <MemberList
      v-else-if="actionType === ActionType.ShowMember"
      :config-id="currentRow?.id!"
      :lottery-code="props.gameCode"
      :smartType="SmartReduceConfigType.Long"
    />
    <AgentList
      v-else-if="actionType === ActionType.ShowAgent"
      :config-id="currentRow?.id!"
      :lottery-code="props.gameCode"
      :smartType="SmartReduceConfigType.Long"
    />
  </ActionDialog>
</template>
<style lang="less">
.show-list-dialog {
  .el-dialog__header {
    margin-bottom: 0;
  }
}
</style>
