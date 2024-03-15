import type { App } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 需要全局引入一些组件，如ElScrollbar，不然一些下拉项样式有问题
import { ElLoading, ElScrollbar } from 'element-plus'

const plugins = [ElLoading]

const components = [ElScrollbar]

const setElementPlusLocale = (app: App) => {
  app.use(ElementPlus, {
    locale: {
      ...zhCn,
      el: {
        ...zhCn.el,
        pagination: {
          pagesize: '条/页',
          total: `共 {total} 条`,
          goto: '跳至',
          pageClassifier: '页'
        }
      }
    }
  })
}

export const setupElementPlus = (app: App<Element>) => {
  plugins.forEach((plugin) => {
    app.use(plugin)
  })

  components.forEach((component) => {
    app.component(component.name, component)
  })
  setElementPlusLocale(app)
}
