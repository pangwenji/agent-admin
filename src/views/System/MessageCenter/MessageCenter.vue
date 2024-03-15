<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ElButton, ElSpace, ElTag } from 'element-plus'
import { Table } from '@/components/Table'
import { getMessageTableList, delMessages, saveMessage } from '@/api/system/message'
import { useTable } from '@/hooks/web/useTable'
import { DataDetail } from '@/components/DataDetail'
import Write from './components/Write.vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { ActionDialog } from '@/components/ActionDialog'
import {
  MessageType,
  MsgDisplayType,
  MessageTableData,
  MessageEditData
} from '@/api/system/message/types'

const ids = ref<number[]>([])

const MsgDisplayTxt = {
  [MsgDisplayType.Login]: '登录窗口',
  [MsgDisplayType.Marquee]: '跑马灯'
}

const MsgDisplyTypeOptions = [
  {
    label: MsgDisplayTxt[MsgDisplayType.Login],
    value: MsgDisplayType.Login
  },
  {
    label: MsgDisplayTxt[MsgDisplayType.Marquee],
    value: MsgDisplayType.Marquee
  }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMessageTableList({
      current: unref(currentPage),
      size: unref(pageSize),
      messageType: MessageType.Agent,
      displayType: []
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await delMessages(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '编号',
    width: '150px',
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
          return (
            <ElButton type="primary" text onClick={() => action(data.row)}>
              {data.row.id}
            </ElButton>
          )
        }
      }
    }
  },
  {
    field: 'title',
    label: '标题',
    width: '180px',
    form: {
      label: '公告标题',
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'displayType',
    label: '类型',
    width: '168px',
    form: {
      label: '公告类型',
      component: 'CheckboxGroup',
      colProps: {
        span: 24
      },
      value: [MsgDisplayType.Login, MsgDisplayType.Marquee],
      componentProps: {
        options: MsgDisplyTypeOptions
      }
    },
    table: {
      slots: {
        default(data: { row: MessageTableData }) {
          return (
            <ElSpace>
              {data.row.displayType.map((type) => (
                <ElTag>{MsgDisplayTxt[type]}</ElTag>
              ))}
            </ElSpace>
          )
        }
      }
    },
    detail: {
      span: 24,
      slots: {
        default(data: MessageTableData) {
          return (
            <ElSpace>
              {data.displayType.map((type) => (
                <ElTag>{MsgDisplayTxt[type]}</ElTag>
              ))}
            </ElSpace>
          )
        }
      }
    }
  },
  {
    field: 'messageContent',
    label: '内容',
    form: {
      label: '公告内容',
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        type: 'textarea',
        rows: 5
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'createUser',
    label: '发送账号',
    width: '200px',
    form: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'createTime',
    label: '发送时间',
    width: '168px',
    form: {
      hidden: true
    }
  },
  {
    field: 'action',
    width: '100px',
    label: '操作',
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
          return (
            <ElButton type="danger" text onClick={() => delData(data.row)}>
              删除
            </ElButton>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const closeDialog = () => {
  dialogVisible.value = false
}

const currentRow = ref<MessageTableData | null>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = '新增'
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delData = async (row: MessageTableData | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.id]
    : elTableExpose?.getSelectionRows().map((v: MessageTableData) => v.id) || []
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: MessageTableData) => {
  dialogTitle.value = '详情'
  actionType.value = 'detail'
  currentRow.value = row
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  try {
    const formData = (await write?.submit()) as MessageEditData
    if (formData) {
      saveLoading.value = true
      const res = await saveMessage(formData)
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
</script>

<template>
  <div>
    <ElButton class="mb-4" :loading="saveLoading" @click="AddAction">发布</ElButton>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      wrapper-shadow
      @register="tableRegister"
    />

    <ActionDialog
      v-model="dialogVisible"
      :max-height="300"
      :title="dialogTitle"
      :close="closeDialog"
      :confirm="actionType !== 'detail' ? save : undefined"
      :width="550"
    >
      <Write
        v-if="actionType !== 'detail'"
        ref="writeRef"
        :form-schema="allSchemas.formSchema"
        :current-row="currentRow"
      />

      <DataDetail
        v-if="actionType === 'detail'"
        :detail-schema="allSchemas.detailSchema"
        :current-row="currentRow"
      />
    </ActionDialog>
  </div>
</template>

<style lang="less"></style>
