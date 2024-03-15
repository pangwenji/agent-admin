/* * Description: tab切换组件 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { computed, PropType, defineEmits } from 'vue'

interface NavParams {
  name?: string
  component?: any
  path?: string
  key?: string
  [key: string]: any
}
const props = defineProps({
  list: {
    type: Array as PropType<NavParams[]>,
    default: () => []
  },
  activeIndex: {
    type: Number,
    default: 0
  },
  targetName: {
    type: String,
    default: ''
  },
  minWidth: {
    type: Number,
    default: 0
  },
  paneHeight: {
    type: Number,
    default: 36
  }
})
const navList = computed(() => props.list)

const emit = defineEmits(['change'])
</script>
<template>
  <div class="nav-frame">
    <el-button-group>
      <el-button
        v-for="(item, index) in navList"
        :key="item.key"
        :autofocus="true"
        :class="{ 'active-pane': index == activeIndex }"
        :style="{ height: paneHeight + 'px', minWidth: minWidth + 'px' }"
        @click="emit('change', item, index)"
        >{{ item[targetName] }}</el-button
      >
    </el-button-group>
  </div>
</template>

<style scoped lang="less">
@normalColor: #48476047;
@activeColor: #2fafec;

:deep(.el-button) {
  color: #5a577d;
}

:deep(.el-button:focus),
:deep(.el-button:hover),
.active-pane {
  color: @activeColor;
  background: none !important;
  border-color: @activeColor;
  outline: 0;
}

.active-pane {
  z-index: 2;
}

:deep(.el-button--default) {
  background: none !important;
}

.nav-frame {
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #4847600d;
}
</style>
