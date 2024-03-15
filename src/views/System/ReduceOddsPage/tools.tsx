import { getPlayTypeMenu, getSubPlayTypeMenu } from '@/api/system/reduce'
import { SelectOption } from '@/components/Form'
import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import { ElOption, ElSelect } from 'element-plus'
import { onMounted, ref } from 'vue'

export const usePlayTypeCodeOptions = (lotteryCode: string) => {
  const playTypeCodeOptions = ref<SelectOption[]>([])
  const playCodeOptions = ref<SelectOption[]>([])
  const playCodeLoading = ref(false)
  const currentForm = ref<any>()
  const initPlayCodeOptions = async (playTypeCode: string) => {
    playCodeLoading.value = true
    try {
      const subResult = await getSubPlayTypeMenu({ lotteryCode, playTypeCode })
      playCodeOptions.value = subResult.data?.map((item) => ({
        label: item.playName,
        value: item.playCode
      }))
    } catch {
    } finally {
      playCodeLoading.value = false
    }
  }
  onMounted(async () => {
    const result = await getPlayTypeMenu({ lotteryCode })
    if (!result.data?.length) return []
    const options = result.data.map((item) => ({
      label: item.playTypeName,
      value: item.playTypeCode
    }))
    playTypeCodeOptions.value = options
  })

  return [
    {
      label: '分类',
      field: 'playTypeCode',
      table: {
        hidden: true
      },
      form: {
        component: 'Select',
        componentProps: {
          class: 'flex-1',
          on: {
            async change(value: undefined | string) {
              if (currentForm.value) {
                currentForm.value.playCode = undefined
              }
              if (!value) {
                playCodeOptions.value = []
              } else {
                initPlayCodeOptions(value)
              }
            }
          }
        },
        optionApi: async () => {
          return playTypeCodeOptions
        },
        colProps: {
          span: 24
        }
      },
      detail: {
        hidden: true
      }
    },
    {
      label: '玩法',
      field: 'playCode',
      table: {
        hidden: true
      },
      form: {
        formItemProps: {
          slots: {
            default(modelValue) {
              currentForm.value = modelValue
              return (
                <ElSelect
                  loading={playCodeLoading.value}
                  v-model={modelValue.playCode}
                  class="flex-1"
                >
                  {playCodeOptions.value.map((option) => {
                    return <ElOption label={option.label} value={option.value} key={option.value} />
                  })}
                </ElSelect>
              )
            }
          }
        },
        colProps: {
          span: 24
        }
      },
      detail: {
        hidden: true
      }
    }
  ] as CrudSchema[]
}
