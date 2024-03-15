<script setup lang="ts">
import { LoginForm } from './components'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('login')
</script>

<template>
  <div :class="prefixCls">
    <div class="relative flex mx-auto min-h-100vh login-container">
      <div class="flex-1 p-30px lt-sm:p-10px dark:bg-[var(--login-bg-color)] relative">
        <Transition appear enter-active-class="animate__animated animate__bounceInRight">
          <div
            class="h-full flex items-center m-auto w-[100%] at-2xl:max-w-500px at-xl:max-w-500px at-md:max-w-500px at-lg:max-w-500px"
          >
            <LoginForm
              class="p-20px h-auto m-auto lt-xl:rounded-3xl lt-xl:light:bg-white login-form"
            />
          </div>
        </Transition>
      </div>
    </div>
    <!-- <div class="animate">
      <AnimationBG />
    </div> -->
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-login';

.@{prefix-cls} {
  overflow: auto;
  .animate {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .login-container {
    position: relative;
    z-index: 1;
    background: transparent;
  }

  .login-form {
    background: #fff;
    border: 1px solid #b4d5ff;
    border-radius: 10px;
    opacity: 0.9;
  }

  &__left {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      content: '';
    }
  }
}
</style>
