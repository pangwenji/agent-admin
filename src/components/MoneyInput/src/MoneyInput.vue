<script lang="ts" setup>
import { deformatMoney, formatMoney } from '@/utils/number'
import { ElInput } from 'element-plus'
import { formatPrecision, removeBeginningZero, filterValidNumChar } from '../tools'
type IProps = {
  change?(val?: string): void
}
const props = defineProps<IProps>()

const formatter = (value: string) => {
  const charList = formatPrecision(filterValidNumChar(value))
  const validStr = charList.join('')
  let moneyStr = formatMoney(removeBeginningZero(validStr))
  return moneyStr
}
const parser = (value: string) => {
  const validStr = formatPrecision([...`${value.trim() || ''}`]).join('')
  return deformatMoney(removeBeginningZero(validStr))
}

const handleChange = (val: string) => {
  props.change?.(parser(val))
}
</script>
<template>
  <ElInput
    placeholder="请输入金额"
    :formatter="formatter"
    :parser="parser"
    @change="handleChange"
  />
</template>
