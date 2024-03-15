<script setup lang="ts">
import PanelGroup from './components/PanelGroup.vue'
import { ElSkeleton, TabsPaneContext } from 'element-plus'
import { Echart } from '@/components/Echart'
import { barOptions } from './echarts-data'
import { ref, reactive } from 'vue'
import { EChartsOption } from 'echarts'

const activeName = ref('first')

const selectValue = ref('')
const selectOptions = [
  {
    value: '6',
    label: '6月'
  },
  {
    value: '7',
    label: '7月'
  },
  {
    value: '12',
    label: '12月'
  }
]

const loading = ref(true)

const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 周活跃量
const getWeeklyUserActivity = async () => {}

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const getAllApi = async () => {
  await Promise.all([getWeeklyUserActivity()])
  loading.value = false
}

getAllApi()
</script>

<template>
  <PanelGroup />
  <div class="chart">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="每日注册" name="first">
        <ElSkeleton :loading="loading" animated :rows="4">
          <Echart :options="barOptionsData" :height="380" />
        </ElSkeleton>
      </el-tab-pane>
      <el-tab-pane label="在线人数" name="second">
        <ElSkeleton :loading="loading" animated :rows="4">
          <Echart :options="barOptionsData" :height="380" />
        </ElSkeleton>
      </el-tab-pane>
      <el-tab-pane label="游戏人数" name="third">
        <ElSkeleton :loading="loading" animated :rows="4">
          <Echart :options="barOptionsData" :height="380" />
        </ElSkeleton>
      </el-tab-pane>
    </el-tabs>
    <el-select
      v-model="selectValue"
      :teleported="false"
      class="chart_date"
      placeholder=""
      size="large"
      popper-class="date_option"
    >
      <el-option
        v-for="item in selectOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<style lang="less" scoped>
.operation-box {
  display: flex;
  align-items: center;
  .back {
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  p {
    margin-left: 170px;
  }
}
.chart {
  position: relative;
  margin-top: 60px;
  box-sizing: border-box;
}

/deep/.el-tabs__nav-wrap::after,
/deep/.el-tabs__active-bar {
  display: none;
  width: 0;
  height: 0;
}

/deep/.el-tabs__item {
  font-family: 'Microsoft YaHei UI';
  font-size: 16px;
  font-weight: 400;
  color: rgb(142 142 142 / 100%);

  &:hover,
  &.is-active {
    font-size: 16px;
    font-weight: 600;
    color: rgb(44 44 44 / 100%);
  }
}

/deep/.chart_date {
  position: absolute;
  top: 0;
  right: 0;
}

/deep/.el-select {
  .select-trigger {
    .el-input {
      .el-input__wrapper {
        width: 80px;
        padding: 0 5px;
        background: none;
        border: none !important;
        box-shadow: none !important;
        box-sizing: border-box;

        .el-input__inner {
          font-family: 'Microsoft YaHei UI';
          font-size: 14px;
          font-weight: 700;
          line-height: 18px;
          color: #424251;
          text-align: right;
        }
      }
    }
  }
}

/deep/.el-popper.date_option {
  left: 50% !important;
  width: 55px !important;
  transform: translateX(-50%);

  .el-select-dropdown {
    width: 55px !important;
    min-width: 55px !important;
    box-shadow: -5px 5px 20px 0 rgb(126 123 160 / 10%);

    .el-select-dropdown__item {
      padding: 0 3px 0 0;
      text-align: center;

      &.selected {
        color: #2fafec;
      }
    }
  }
}
</style>
