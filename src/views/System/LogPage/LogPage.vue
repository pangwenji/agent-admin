<script setup lang="ts">
import { ElSelect, ElOption } from 'element-plus'
import { ref } from 'vue'

import LoginLogList from './components/LoginLogList.vue'
import OperateLogList from './components/OperateLogList.vue'
import TradeLogList from './components/TradeLogList.vue'

const LogType = {
  Login: 'login',
  Operate: 'operate',
  Trade: 'trade'
}

const logTypeOptions = [
  {
    value: LogType.Login,
    label: '登录日志'
  },
  {
    value: LogType.Operate,
    label: '操作日志'
  },
  {
    value: LogType.Trade,
    label: '账变日志'
  }
]

const logType = ref(logTypeOptions[0].value)
</script>

<template>
  <div class="my-log-page">
    <ElSelect v-model="logType" class="log-type-select">
      <ElOption
        v-for="item in logTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </ElSelect>
    <LoginLogList v-if="logType === LogType.Login" />
    <OperateLogList v-else-if="logType === LogType.Operate" />
    <TradeLogList v-else />
  </div>
</template>

<style lang="less" scoped>
.my-log-page {
  .el-card__body {
    & > div {
      position: relative;
    }
  }

  .log-type-select {
    position: absolute;
    top: 0;
    left: 0;
    width: 7em;
    :deep(.el-input__suffix) {
      --el-select-input-color: var(--dark-text-color);
    }
  }

  :deep(.el-form) {
    & > .el-form-item:first-child {
      margin-left: calc(7em + 16px);
    }
  }
}
</style>
