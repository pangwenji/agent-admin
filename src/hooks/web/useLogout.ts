import router, { resetRouter } from '@/router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useStorage } from '@/hooks/web/useStorage'
import { loginOut } from '@/api/login'

export const useLogout = () => {
  return {
    logout: async () => {
      const tagsViewStore = useTagsViewStore()
      const { clear } = useStorage()
      try {
        await loginOut()
      } catch {
      } finally {
        clear()
        tagsViewStore.delAllViews()
        resetRouter() // 重置静态路由表
        router.replace('/login')
      }
    }
  }
}
