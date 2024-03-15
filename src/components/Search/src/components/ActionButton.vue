<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useIcon } from '@/hooks/web/useIcon'
import { propTypes } from '@/utils/propTypes'

const emit = defineEmits(['search', 'reset', 'expand'])

defineProps({
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  showExpand: propTypes.bool.def(false),
  visible: propTypes.bool.def(true),
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false)
})

const onSearch = () => {
  emit('search')
}

const onReset = () => {
  emit('reset')
}

const onExpand = () => {
  emit('expand')
}
</script>

<template>
  <ElButton
    v-if="showSearch"
    type="primary"
    :loading="searchLoading"
    :icon="useIcon({ icon: 'ep:search' })"
    @click="onSearch"
  >
    查询
  </ElButton>
  <ElButton
    v-if="showReset"
    :loading="resetLoading"
    :icon="useIcon({ icon: 'ep:refresh-right' })"
    @click="onReset"
  >
    重置
  </ElButton>
  <ElButton
    v-if="showExpand"
    :icon="useIcon({ icon: visible ? 'ep:arrow-up' : 'ep:arrow-down' })"
    text
    @click="onExpand"
  >
    {{ visible ? '收起' : '展开' }}
  </ElButton>
</template>
