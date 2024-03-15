<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'

const { required } = useValidator()

defineProps({
  formSchema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  }
})

const rules = reactive({
  level: [required('请输入长龙配置')],
  amountChange: [required('请输入降赔配置')]
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" :schema="formSchema" @register="formRegister" />
</template>
