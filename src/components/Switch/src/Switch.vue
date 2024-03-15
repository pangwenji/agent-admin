<script lang="ts" setup>
import { ElSwitch } from 'element-plus'
</script>
<template>
  <ElSwitch class="my-switch" inline-prompt active-text="开" inactive-text="关" size="large" />
</template>
<style lang="less" scoped>
.my-switch {
  --el-switch-on-color: var(--el-color-primary);
  --el-switch-off-color: rgba(72, 71, 96, 0.1);
  :deep(.el-switch__core) {
    .is-text {
      color: #4d4c6b;
    }
  }
  &.el-switch.is-checked {
    :deep(.el-switch__core) {
      .is-text {
        color: #fff;
      }
    }
  }
}
</style>
