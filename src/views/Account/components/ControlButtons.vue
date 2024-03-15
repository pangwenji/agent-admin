<script setup lang="ts">
import { Icon } from '@/components/Icon'

defineProps<{
  row: any
  clickResetPWD?: () => void
  clickLog?: () => void
  clickUnlock?: () => void
}>()

// const emit = defineEmits(['change'])
</script>
<template>
  <ElDropdown v-if="row">
    <Icon icon="iconamoon:arrow-down-2-fill" />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem v-if="clickResetPWD" @click="clickResetPWD">重置</ElDropdownItem>
        <ElDropdownItem v-if="clickLog" @click="clickLog">日志</ElDropdownItem>
        <ElDropdownItem v-if="clickUnlock" :disabled="row.status !== 2" @click="clickUnlock">
          解锁
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<style scoped lang="less">
.el-icon {
  color: var(--el-text-color-regular);
}
.lock {
  cursor: pointer;
}
.unlock {
  color: #9ba09b;
  cursor: no-drop;
}
</style>
