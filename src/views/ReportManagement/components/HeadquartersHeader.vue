<script lang="ts" setup>
import { defineProps } from 'vue'
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { HeaderquartersTitleItem } from '../types'

defineProps<{
  data: HeaderquartersTitleItem[]
}>()
</script>

<template>
  <ElBreadcrumb v-if="data?.length" :separator-icon="ArrowRight">
    <ElBreadcrumbItem
      v-for="config in data"
      :key="config.title"
      :class="config.onClick ? 'clickable' : ''"
      @click="config.onClick"
    >
      {{ config.title }}
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 1em;
}
.clickable {
  :deep(.el-breadcrumb__inner) {
    font-weight: bold;
    transition: color 0.2s linear;
    cursor: pointer;
    color: inherit;
    &:hover {
      color: var(--el-color-primary);
      font-weight: bold;
    }
  }
}
</style>
