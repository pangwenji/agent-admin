<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Collapse } from '@/components/Collapse'
import { UserInfo } from '@/components/UserInfo'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { useToolHeader } from './useToolHeader'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
// const screenfull = computed(() => appStore.getScreenfull)

// 尺寸图标
// const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
// const locale = computed(() => appStore.getLocale)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    const { beijingTime, showBeijing, playerAmount, agentAmount } = useToolHeader()
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-end',
          'dark:bg-[var(--el-bg-color)] '
        ]}
      >
        {layout.value !== 'top' ? (
          <div class="h-full flex items-center">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="<md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined}
        <div class="h-full flex items-center">
          <div class="online">
            {showBeijing.value && (
              <div class="bejing-timezone whitespace-nowrap">北京时间：{beijingTime.value}</div>
            )}
            <span class="agent">在线代理: {agentAmount.value}</span>
            <span class="player">在线会员: {playerAmount.value}</span>
          </div>
          {/* {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined} */}
          {/* {size.value ? (
            <SizeDropdown class="custom-hover" color="var(--top-header-text-color)"></SizeDropdown>
          ) : undefined} */}
          {/* {locale.value ? (
            <LocaleDropdown
              class="custom-hover"
              color="var(--top-header-text-color)"
            ></LocaleDropdown>
          ) : undefined} */}
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-tool-header';

.@{prefix-cls} {
  transition: left var(--transition-time-02);
}
.online {
  display: flex;
  color: #5a577d;
  font-family: 'Microsoft YaHei UI';
  font-size: 13px;
  padding: 0;
  box-sizing: border-box;
  span {
    position: relative;
    display: flex;
    align-items: center;
    &::before {
      display: block;
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 5px;
      margin-right: 8px;
      box-sizing: border-box;
    }
    &.agent {
      margin-right: 1em;
      box-sizing: border-box;
      &::before {
        background: var(--el-color-primary);
      }
    }
    &.player {
      &::before {
        background: var(--el-color-success);
      }
    }
  }
  .bejing-timezone {
    margin-right: 1em;
  }
}
</style>
