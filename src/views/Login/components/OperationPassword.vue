<template>
  <div class="main">
    <div style="padding: 0 10px">
      <div class="circle">
        <!-- <template v-for="(input, index) in inputValue" :key="index">
          <el-input
            :ref="(e) => (input.ref = e)"
            v-model="input.input"
            :readonly="true"
            :style="{ '--input-color': input.input ? backgroundColor : 'white' }"
            class="circle-item"
          />
        </template> -->

        <el-input
          ref="input0Ref"
          v-model="inputValue[0].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[0].input ? backgroundColor : 'while' }"
          class="circle-item"
        />
        <el-input
          ref="input1Ref"
          v-model="inputValue[1].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[1].input ? backgroundColor : 'while' }"
          class="circle-item"
        />

        <el-input
          ref="input2Ref"
          v-model="inputValue[2].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[2].input ? backgroundColor : 'while' }"
          class="circle-item"
        />

        <el-input
          ref="input3Ref"
          v-model="inputValue[3].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[3].input ? backgroundColor : 'while' }"
          class="circle-item"
        />

        <el-input
          ref="input4Ref"
          v-model="inputValue[4].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[4].input ? backgroundColor : 'while' }"
          class="circle-item"
        />

        <el-input
          ref="input5Ref"
          v-model="inputValue[5].input"
          :readonly="true"
          :style="{ '--input-color': inputValue[5].input ? backgroundColor : 'while' }"
          class="circle-item"
        />
      </div>
    </div>
    <div class="panel">
      <div class="panel-left">
        <div class="panel-left-item">
          <div
            v-for="(item, index) in topNums"
            :key="index"
            class="panel-left-item-subItem"
            :style="setStyle(item, 2)"
            @click="choose(item)"
            >{{ item }}</div
          >
        </div>
        <div class="panel-left-item">
          <div
            v-for="(item, index) in middleNums"
            :key="index"
            class="panel-left-item-subItem"
            :style="setStyle(item, 5)"
            @click="choose(item)"
            >{{ item }}</div
          >
        </div>
        <div class="panel-left-item">
          <div
            v-for="(item, index) in bottomNums"
            :key="index"
            class="panel-left-item-subItem"
            :style="setStyle(item, 8)"
            @click="choose(item)"
            >{{ item }}</div
          >
        </div>
        <div class="panel-left-item">
          <div class="panel-left-item-subItem reset" @click="handleReset">重置 </div>
          <div class="panel-left-item-subItem" @click="choose('0')"> 0</div>
          <div class="panel-left-item-subItem delete" @click="handleDelete">删除 </div>
        </div>
        <div class="panel-left-item">
          <el-button
            v-if="!reConfirm"
            class="panel-left-item-subItem"
            :disabled="!inputValue[5].input ? true : false"
            :class="{
              confirms: !inputValue[5].input ? true : false,
              'active-confirms': inputValue[5].input
            }"
            @click="handleSubmit('确认')"
            >确认</el-button
          >
          <el-button
            v-else
            class="panel-left-item-subItem"
            :disabled="!inputValue[5].input ? true : false"
            :class="{
              confirms: !inputValue[5].input ? true : false,
              'active-confirms': inputValue[5].input
            }"
            @click="handleSubmit('再次确认')"
            >再次确认</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { useEmitt } from '@/hooks/event/useEmitt'
import { ElMessage } from 'element-plus'
import { reactive, ref, defineEmits, defineExpose, onMounted } from 'vue'

const { emitter } = useEmitt()

const backgroundColor = ref('linear-gradient(180deg, #66c3f8 0%, #2892f4 100%)')

const input0Ref = ref()

const input1Ref = ref()

const input2Ref = ref()

const input3Ref = ref()

const input4Ref = ref()

const input5Ref = ref()

let inputValue = reactive([
  { input: '', ref: input0Ref },
  { input: '', ref: input1Ref },
  { input: '', ref: input2Ref },
  { input: '', ref: input3Ref },
  { input: '', ref: input4Ref },
  { input: '', ref: input5Ref }
])
let oldPassword = ref('')

const emit = defineEmits(['reConfirm', 'setDialogTitle'])

let reConfirm = ref(false)

const topNums = reactive(['1', '2', '3'])

const middleNums = reactive(['4', '5', '6'])

const bottomNums = reactive(['7', '8', '9'])

const setStyle = (item: any, value: number) => {
  return {
    borderLeft: `${item}` === `${value}` ? '1px solid #ccc' : '',
    borderRight: `${item}` === `${value}` ? '1px solid #ccc' : ''
  }
}
const checkIfThePasswordsMatchTwice = () => {
  if (reConfirm.value) {
    for (let i = 0; i < oldPassword.value.length; i++) {
      if (inputValue[i].input) {
        if (oldPassword.value[i] !== inputValue[i].input) {
          return ElMessage.error('两次密码不一致！')
        }
      }
    }
  }
}

const choose = (value: any) => {
  for (let i = 0; i < inputValue.length; i++) {
    if (inputValue[i].input === '') {
      inputValue[i].input = value
      checkIfThePasswordsMatchTwice()
      let index = i + 1
      if (!inputValue[index]) {
        return
      }
      inputValue[index].ref.focus()
      break
    }
  }
}

const reSet = () => {
  inputValue.forEach((res) => (res.input = ''))
  oldPassword.value = ''
  reConfirm.value = false
  emit('setDialogTitle', false)
  // input0Ref.value.focus()
}

const autofocus = () => input0Ref.value.focus()

const handleReset = () => reSet()

const handleDelete = () => {
  for (let i = inputValue.length - 1; i >= 0; i--) {
    if (inputValue[i].input !== '') {
      inputValue[i].input = ''
      break
    }
  }
}

const reConfirms = () => {
  let flag = true
  inputValue.forEach((element, index) => {
    if (element.input !== oldPassword.value[index]) {
      reSet()
      flag = false
      return ElMessage.error('两次密码不一致！')
    }
  })
  if (flag) {
    emit('reConfirm', oldPassword.value)
    emit('setDialogTitle', false)
  }
}

const handleSubmit = (flag: string) => {
  if (flag === '确认') {
    for (let i = 0; i < inputValue.length; i++) {
      oldPassword.value += inputValue[i].input
    }
    reConfirm.value = true
    inputValue.forEach((res) => (res.input = ''))

    emit('setDialogTitle', true)
  }
  if (flag === '再次确认') {
    reConfirms()
  }
}

defineExpose({
  reSet,
  autofocus
})

onMounted(() => {
  emitter.on('reSetOpeartion', () => {
    reSet()
  })
})
</script>

<style lang="less" scoped>
.main {
  .item {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  :deep(.el-input__inner) {
    color: #fff;
    text-align: center;
  }

  :deep(.circle-item .el-input__wrapper) {
    background: var(--input-color);
  }

  .circle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;

    .circle-item {
      display: flex;
      width: 50px;
      height: 50px;
      align-items: center;
      border-radius: 10px;
      justify-content: center;
    }
  }

  .panel {
    display: flex;
    width: 100%;
    height: 250px;

    .panel-left {
      flex: 3;
      display: flex;
      flex-direction: column;

      .panel-left-item {
        flex: 1;
        display: flex;

        .panel-left-item-subItem {
          display: flex;
          width: 120px;
          height: 50px;
          margin: 10px;
          cursor: pointer;
          border: 1px solid #ccc;
          border-radius: 10px;
          flex: 1;
          align-items: center;
          justify-content: center;
          transition: background-color 0.1s;
          &:not(.is-disabled) {
            &:active,
            &:hover {
              opacity: 0.8;
              background-color: #f7f8f9;
            }
          }
          .btn-item {
            width: 100%;
            height: 100%;
            background-color: blue;
          }
        }

        .reset {
          color: var(--el-color-primary);
          border: 1px solid var(--el-color-primary);
          &:not(.is-disabled) {
            &:active,
            &:hover {
              opacity: 0.8;
              background-color: #eef7fd;
            }
          }
        }

        .delete {
          color: var(--el-color-error);
          border: 1px solid var(--el-color-error);
          &:not(.is-disabled) {
            &:active,
            &:hover {
              opacity: 0.8;
              background-color: #fdeef1;
            }
          }
        }

        .confirms {
          background: rgb(72 71 96 / 10%);
        }

        .active-confirms {
          color: #fff;
          background: linear-gradient(180deg, #66c3f8 0%, #2892f4 100%);
        }

        .skip {
          background: #ccc;
        }
      }
    }

    .panel-right {
      display: flex;
      border-top: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      flex: 1;
      flex-direction: column;

      .panel-right-top {
        display: flex;
        cursor: pointer;
        border-bottom: 1px solid #ccc;
        flex: 1;
        align-items: center;
        justify-content: center;
      }

      .panel-right-bottom {
        flex: 1;
        display: flex;
        margin: 0 auto;
        align-items: center;
        cursor: pointer;
      }
    }
  }
}
</style>
