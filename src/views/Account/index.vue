/* * Description: 账号管理 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script setup lang="ts">
import { ref, shallowRef, provide, computed } from 'vue'
import DirectAgent from './pages/DirectAgent.vue'
import DirectMembers from './pages/DirectMembers.vue'
import AllAgent from './pages/AllAgent.vue'
import AllMembers from './pages/AllMembers.vue'
import NavTabs from './components/NavTabs.vue'
import { BigNumber } from 'bignumber.js'
import { useAgentInfoStore } from '@/store/modules/agentInfo'

const agentInfoStore = useAgentInfoStore()
const parentInfo = ref({})

const tempList = [
  { name: '直属代理', component: DirectAgent, key: '1', tabName: 'DirectAgent', isAll: false },
  { name: '直属会员', component: DirectMembers, key: '2', tabName: 'DirectMembers', isAll: false },
  { name: '全部代理', component: AllAgent, key: '3', tabName: 'AllAgent', isAll: true },
  { name: '全部会员', component: AllMembers, key: '4', tabName: 'AllMembers', isAll: true }
]

const navList = computed(() => {
  const { agentLevel } = agentInfoStore.info || {}
  // 三级代理仅展示直属会员
  if (agentLevel && Number(agentLevel) === 3) {
    return tempList.filter((item) => Number(item.key) === 2)
  }
  return tempList
})

const activeComp = shallowRef(navList.value[0])
const activeIndex = shallowRef(0)
const navTitle = ref(activeComp.value.name)
const isAll = ref(activeComp.value.isAll) // 是否是全部代理或全部会员

const changeComponent = (compMsg, index) => {
  activeComp.value = compMsg
  activeIndex.value = index
  navTitle.value = compMsg.name
  isAll.value = compMsg.isAll
  const initTabs = ['1', '2']
  if (initTabs.includes(compMsg.key)) {
    parentInfo.value = {}
    isInitTable.value = !isInitTable.value
  }
}

// 从列表切换tab
const updateParentMessage = ({ tabName, row }) => {
  if (Object.keys(row).length) parentInfo.value = row
  if (!tabName) return
  const tabIndex = tempList.findIndex((item) => item.tabName === tabName)
  activeComp.value = tempList[tabIndex]
  activeIndex.value = tabIndex
  navTitle.value = tempList[tabIndex].name
  isAll.value = tempList[tabIndex].isAll
}

const isInitTable = ref(false)

provide('navTitle', navTitle)
provide('isAll', isAll)
provide('BigNumber', BigNumber)
provide('parentInfo', parentInfo)
</script>
<template>
  <div>
    <NavTabs
      :list="navList"
      :activeIndex="activeIndex"
      :targetName="'name'"
      @change="changeComponent"
    />
    <router-view>
      <keep-alive>
        <component
          :is="activeComp.component"
          :key="activeComp.key"
          :curComp="activeComp"
          :isInitTable="isInitTable"
          @update-parent="updateParentMessage"
        />
      </keep-alive>
    </router-view>
  </div>
</template>

<style scoped lang="less"></style>
