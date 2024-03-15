<script lang="ts" setup>
import { ElInput } from 'element-plus'
import { formatPrecision, removeBeginningZero, filterValidNumChar } from '../tools'
import { useIcon } from '@/hooks/web/useIcon'

const percentIcon = useIcon({ icon: 'material-symbols:percent' })
type IProps = {
  change(val: string): void
}
const props = defineProps<IProps>()
const max = 100
const min = 0

const limitRange = (value: string) => {
  const numValue = Number(value)
  if (Number.isNaN(numValue)) return min
  else if (numValue > max) return max
  else if (numValue < min) return min
  return value
}

const formatter = (value: string) => {
  const charList = formatPrecision(filterValidNumChar(value))
  const validStr = charList.join('')
  let moneyStr = removeBeginningZero(validStr)
  return limitRange(moneyStr)
}
const parser = (value: string) => {
  const validStr = formatPrecision([...`${value.trim() || ''}`]).join('')
  return removeBeginningZero(validStr)
}

const handleChange = (val: string) => {
  props.change(parser(val))
}
</script>
<template>
  <ElInput
    :formatter="formatter"
    :parser="parser"
    :suffix-icon="percentIcon"
    @change="handleChange"
  />
</template>
