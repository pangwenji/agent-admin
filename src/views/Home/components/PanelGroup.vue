<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { CountTo } from '@/components/CountTo'
import { ref } from 'vue'

const loading = ref(true)

const getCount = async () => {
  // const res = await getCountApi()
  //   .catch(() => {})
  //   .finally(() => {
  //     loading.value = false
  //   })
  // totalState = Object.assign(totalState, res?.data || {})
}

getCount()
</script>

<template>
  <ElRow :gutter="30" justify="space-between">
    <ElCol :xl="8" :lg="8" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="colData_item">
              <div class="colData_item_left">
                <div>
                  <div class="label">今日新增 (人)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="34"
                    :duration="2600"
                  />
                </div>
                <div>
                  <div class="label">会员总数 (人)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="21342"
                    :duration="2600"
                  />
                </div>
              </div>
              <div class="trend">
                <img src="@/assets/svgs/home/rise.svg" />
                <span class="rise">+39.69%</span>
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="8" :lg="8" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="colData_item">
              <div class="colData_item_left">
                <div>
                  <div class="label">今日投注 (元)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="23433"
                    :duration="2600"
                  />
                </div>
                <div>
                  <div class="label">本月投注 (元)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="21934100"
                    :duration="2600"
                  />
                </div>
              </div>
              <div class="trend">
                <img src="@/assets/svgs/home/fall.svg" />
                <span class="fall">-39.69%</span>
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="8" :lg="8" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="colData_item">
              <div class="colData_item_left">
                <div>
                  <div class="label">平台盈亏 (元)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="+34976"
                    :duration="2600"
                  />
                </div>
                <div>
                  <div class="label">本月盈亏 (元)</div>
                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="+921342283"
                    :duration="2600"
                  />
                </div>
              </div>
              <div class="trend">
                <img src="@/assets/svgs/home/rise.svg" />
                <span class="rise">+39.69%</span>
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.el-card {
  border-radius: 10px;
}

.trend {
  display: flex;
  align-items: flex-start;

  img {
    display: block;
    width: 56px;
    margin-top: -10px;
    box-sizing: border-box;
  }

  .rise {
    color: #2bb596;
  }

  .fall {
    color: #ee5b75;
  }
}

.colData_item {
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: flex-start;

  &_left {
    display: flex;
    height: 76px;
    flex-direction: column;
    justify-content: space-between;

    div {
      display: flex;
      align-items: center;
    }

    .label {
      margin-right: 14px;
      color: #48476080;
      box-sizing: border-box;
    }
  }
}
</style>
