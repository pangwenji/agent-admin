<script setup lang="tsx">
import { ref, unref, reactive, defineProps } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'

import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import {
  getSmartReduceAgentList,
  addSmartReduceAgent,
  deleteSmartReduceUser
} from '@/api/system/reduce'
import { SmartReduceConfigType } from '@/api/system/reduce/types'

const props = defineProps<{
  configId: number
  lotteryCode: string
  smartType: SmartReduceConfigType
}>()

const ids = ref<number[]>([])

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '序号',
    width: '130px',
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
    field: 'account',
    label: '代理账号',
    width: '180px',
    detail: {
      span: 24
    }
  },
  {
    field: 'username',
    label: '名称',
    detail: {
      span: 24
    }
  },
  {
    field: 'parentAccount',
    label: '上级代理',
    width: '168px'
  },
  {
    field: 'action',
    width: '120px',
    label: '操作',
    detail: {
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
    const res = await getSmartReduceAgentList({
      current: unref(currentPage),
      size: unref(pageSize),
      id: props.configId,
      smartType: props.smartType
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteSmartReduceUser({
      id: unref(ids)[0],
      lotteryCode: props.lotteryCode,
      smartType: props.smartType
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
  dialogTitle.value = '新增代理'
  dialogVisible.value = true
}
const agentAccount = ref<string>()
const saveLoading = ref(false)
const handleAdd = async () => {
  const account = agentAccount.value?.trim()
  if (account) {
    try {
      saveLoading.value = true
      const res = await addSmartReduceAgent({
        id: props.configId,
        lotteryCode: props.lotteryCode,
        account,
        smartType: props.smartType
      })
      if (res) {
        dialogVisible.value = false
        currentPage.value = 1
        agentAccount.value = undefined
        getList()
        return true
      }
    } catch {
    } finally {
      saveLoading.value = false
    }
  } else {
    ElMessage.warning('请输入代理账号')
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
      <ElSpace :size="16" class="mb-4">
        <ElInput v-model="agentAccount" placeholder="请输入代理账号" />
        <ElButton :loading="saveLoading" @click="addAction"> 添加 </ElButton>
      </ElSpace>
    </template>
  </Table>
  <ActionDialog
    v-model="dialogVisible"
    :max-height="300"
    :title="dialogTitle"
    :close="closeDialog"
    :confirm="handleAdd"
  >
    <div> 是否新增该代理? </div>
  </ActionDialog>
</template>
