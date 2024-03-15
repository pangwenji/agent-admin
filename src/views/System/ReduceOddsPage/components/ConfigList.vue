<script setup lang="tsx">
import { ref, unref, reactive, defineProps } from 'vue'
import { ElButton, ElFormItem, ElInputNumber, ElMessage } from 'element-plus'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'

import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import ConfigWrite from './ConfigWrite.vue'
import {
  getSmartAmountConfigList,
  addSmartAmountConfig,
  deleteSmartAmountConfig,
  updateSmartAmountConfig
} from '@/api/system/reduce'
import { Icon } from '@/components/Icon'
import { SmartAmountConfigItem } from '@/api/system/reduce/types'

const props = defineProps<{
  configId: number
  lotteryCode: string
}>()

const ids = ref<number[]>([])
const writeRef = ref<ComponentRef<typeof ConfigWrite>>()
const configInputs = ref<Record<number, number>>({})
const configInputError = ref<Record<number, string | undefined>>({})

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '序号',
    width: '130px',
    form: {
      hidden: true
    }
  },
  {
    field: 'amount',
    label: '降赔等级',
    table: {
      slots: {
        default({ row }: { row: SmartAmountConfigItem }) {
          return (
            <div class="flex justify-center items-center">
              <Icon icon="mdi:greater-than-or-equal" />
              {row.amount}
            </div>
          )
        }
      }
    },
    form: {
      formItemProps: {
        slots: {
          default(modelValue) {
            return (
              <>
                <Icon icon="mdi:greater-than-or-equal" />
                <ElInputNumber
                  v-model={modelValue.amount}
                  class="flex-1 ml-1"
                  min={0}
                  controls={false}
                />
              </>
            )
          }
        }
      },
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'amountChange',
    label: '降赔配置',
    minWidth: 170,
    form: {
      component: 'InputNumber',
      componentProps: {
        class: 'flex-1',
        step: 0.001,
        max: 0
      },
      colProps: {
        span: 24
      }
    },
    table: {
      slots: {
        default({ row }: { row: SmartAmountConfigItem }) {
          console.log('con => ', configInputError.value[row.id], row.id)
          return (
            <ElFormItem class="table-change-input w-full " error={configInputError.value[row.id]}>
              <ElInputNumber
                v-model={configInputs.value[row.id]}
                max={0}
                controls={false}
                onBlur={async () => {
                  const value = configInputs.value[row.id]
                  if (typeof value !== 'number') {
                    ElMessage.error('请填写降赔配置')
                    configInputError.value[row.id] = '请填写降赔配置'
                    return
                  }
                  if (value >= 0) {
                    ElMessage.error('降赔配置需小于0')
                    configInputError.value[row.id] = '降赔配置需小于0'
                    return
                  }
                  configInputError.value[row.id] = undefined
                  handleUpdate(row)
                }}
              />
            </ElFormItem>
          )
        }
      }
    }
  },
  {
    field: 'action',
    width: '120px',
    label: '操作',
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return (
            <ElButton key="delete" type="danger" text onClick={() => delData(data.row)}>
              删除
            </ElButton>
          )
        }
      }
    }
  }
])

const { tableRegister, tableState, tableMethods } = useTable({
  pageSize: 5,
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getSmartAmountConfigList({
      current: unref(currentPage),
      size: unref(pageSize),
      id: props.configId
    })
    const list = res.data.records
    configInputs.value = list.reduce((res, item) => {
      return {
        ...res,
        [item.id]: item.amountChange
      }
    }, {})

    configInputError.value = list.reduce((res, item) => {
      return {
        ...res,
        [item.id]: undefined
      }
    }, {})

    return {
      list: list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteSmartAmountConfig({
      id: unref(ids)[0],
      lotteryCode: props.lotteryCode
    })
    return !!res
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { delList, getList, getElTableExpose } = tableMethods

const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const closeDialog = () => {
  dialogVisible.value = false
  currentRow.value = null
  agentAccount.value = undefined
}
const currentRow = ref<any>(null)

// 新增
const addAction = () => {
  dialogTitle.value = '新增'
  dialogVisible.value = true
}
const agentAccount = ref<string>()
const saveLoading = ref(false)
const handleAdd = async () => {
  const write = unref(writeRef)
  try {
    const formData = (await write?.submit()) as any
    if (formData) {
      saveLoading.value = true
      const res = await addSmartAmountConfig({
        ...formData,
        id: props.configId
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
const handleUpdate = async (row: SmartAmountConfigItem) => {
  const newChange = configInputs.value[row.id]
  if (newChange >= 0) {
    ElMessage.error('降赔配置需小于0')
    return
  }
  if (newChange === row.amountChange) {
    return
  }
  try {
    await updateSmartAmountConfig({
      id: row.id,
      amountChange: newChange,
      gameCode: props.lotteryCode
    })
    row.amountChange = newChange
    ElMessage.success('修改降赔配置成功')
  } catch {
    configInputs.value[row.id] = row.amountChange
    ElMessage.error('修改降赔配置失败')
  }
}

// 删除
const delData = async (row: any | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: any) => v.id) || []
  await delList(unref(ids).length)
}
</script>

<template>
  <Table
    v-model:pageSize="pageSize"
    v-model:currentPage="currentPage"
    :columns="allSchemas.tableColumns"
    :data="dataList"
    :loading="loading"
    :pagination="{
      total: total,
      pageSizes: [5, 10, 20]
    }"
    :search="false"
    :wrapperShadow="false"
    @register="tableRegister"
  >
    <template #title>
      <ElButton class="mb-2" :loading="saveLoading" @click="addAction"> 新增 </ElButton>
    </template>
  </Table>
  <ActionDialog
    v-model="dialogVisible"
    :max-height="300"
    :title="dialogTitle"
    :close="closeDialog"
    :confirm="handleAdd"
  >
    <ConfigWrite ref="writeRef" :form-schema="allSchemas.formSchema" />
  </ActionDialog>
</template>
<style scoped lang="less">
:deep(.table-change-input) {
  margin-bottom: 0;
  .el-input-number {
    width: 100%;
  }
}
</style>
