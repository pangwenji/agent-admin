<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'

const appStore = useAppStore()

const layout = computed(() => appStore.getLayout)

const fixedHeader = computed(() => appStore.getFixedHeader)

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})

const tagsView = computed(() => appStore.getTagsView)
</script>

<template>
  <section
    :class="[
      'p-[var(--app-content-padding)] w-[calc(100%-var(--app-content-padding)-var(--app-content-padding))] bg-[var(--app-content-bg-color)] dark:bg-[var(--el-bg-color)]',
      {
        '!min-h-[calc(100%-var(--app-content-padding)-var(--app-content-padding))]':
          (fixedHeader &&
            (layout === 'classic' || layout === 'topLeft' || layout === 'top') &&
            footer) ||
          (!tagsView && layout === 'top'),

        '!min-h-[calc(100%-var(--app-content-padding)-var(--app-content-padding)-var(--tags-view-height))]':
          tagsView && layout === 'top',

        '!min-h-[calc(100%-var(--tags-view-height)-var(--app-content-padding)-var(--app-content-padding)-var(--top-tool-height))]':
          !fixedHeader && layout === 'classic',

        '!min-h-[calc(100%-var(--tags-view-height)-var(--app-content-padding)-var(--app-content-padding))]':
          !fixedHeader && layout === 'topLeft',

        // '!min-h-[calc(100%-var(--app-content-padding)-var(--app-content-padding)-var(--app-footer-height)-var(--tags-view-height)-var(--top-tool-height))]':
        //   !fixedHeader && layout === 'top' && footer,

        '!min-h-[calc(100%-var(--top-tool-height)-var(--app-content-padding)-var(--app-content-padding))]':
          fixedHeader && layout === 'cutMenu',

        '!min-h-[calc(100%-var(--top-tool-height)-var(--app-content-padding)-var(--app-content-padding)-var(--tags-view-height))]':
          !fixedHeader && layout === 'cutMenu'
      }
    ]"
    style="background: #fff"
  >
    <router-view>
      <template #default="{ Component, route }">
        <keep-alive :include="getCaches">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </template>
    </router-view>
  </section>
</template>
