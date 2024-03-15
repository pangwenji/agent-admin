/* * Description: 个人管理 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { ref, shallowRef, defineAsyncComponent } from 'vue'
import NavTabs from '../Account/components/NavTabs.vue'
import type { NavParams } from '@/api/account/types'

const Information = defineAsyncComponent(() => import('./components/Information.vue'))
const BackLimit = defineAsyncComponent(() => import('./components/BackLimit.vue'))
const Validation = defineAsyncComponent(() => import('./components/Validation.vue'))

const navList: NavParams[] = [
  { name: '个人资料', component: Information, path: '', key: '1' },
  { name: '返水限额', component: BackLimit, path: '', key: '2' },
  { name: '二次验证', component: Validation, path: '', key: '3' }
]

const activeComp = shallowRef(navList[0])
const activeIndex = shallowRef(0)
const navTitle = ref(activeComp.value.name)

const changeComponent = (compMsg, index) => {
  activeComp.value = compMsg
  activeIndex.value = index
  navTitle.value = compMsg.name
}
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
        <component :is="activeComp.component" :key="activeComp.key" :curComp="activeComp" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style scoped lang="less"></style>
