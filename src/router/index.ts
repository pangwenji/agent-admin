import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'

const GameOrderPath = 'orderlist'
const SportsOrderPath = 's-orderlist'
const VideoOrderPath = 'v-orderlist'
export const CommonRoutePaths = {
  GameOrder: `/drawingResult/${GameOrderPath}`,
  SportsGameOrder: `/drawingResult/${SportsOrderPath}`,
  VideoGameOrder: `/drawingResult/${VideoOrderPath}`
}

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    // redirect: '/home',
    redirect: '/instantWager',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: '登录',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  // 代理注册
  {
    path: '/register',
    component: () => import('@/views/Account/Registered.vue'),
    name: 'Register',
    meta: {
      hidden: true,
      title: '代理注册',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  /* {
    path: '/home',
    component: Layout,
    redirect: '/home/index',
    name: 'Home',
    meta: {
      title: '首页',
      icon: 'svg-icon:nav-home'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Home/index.vue'),
        name: 'HomeIndex',
        meta: {
          activeMenu: '/home',
          hidden: true
        }
      }
    ]
  }, */
  {
    path: '/instantWager',
    component: Layout,
    redirect: '/instantWager/index',
    name: 'InstantWager',
    meta: { title: '即时注单', icon: 'svg-icon:nav-order', alwaysShow: false },
    children: [
      {
        path: 'index',
        component: () => import('@/views/InstantWager/InstantWager.vue'),
        name: 'WagerIndex',
        meta: {
          hidden: true,
          activeMenu: '/instantWager'
        }
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    redirect: '/account/index',
    name: 'Account',
    meta: {},
    children: [
      {
        path: 'index',
        name: 'AccountIndex',
        component: () => import('@/views/Account/index.vue'),
        meta: {
          alwaysShow: true,
          title: '账号管理',
          icon: 'svg-icon:nav-account'
        }
      }
    ]
  },
  {
    path: '/reportManagement',
    component: Layout,
    name: 'ReportManagement',
    redirect: '/reportManagement/index',
    meta: {
      title: '报表管理',
      icon: 'svg-icon:nav-report',
      alwaysShow: false
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/ReportManagement/index.vue'),
        name: 'ReportManagementIndex',
        meta: {
          hidden: true,
          activeMenu: '/reportManagement'
        }
      }
    ]
  },
  {
    path: '/drawingResult',
    component: Layout,
    redirect: '/drawingResult/index',
    name: 'DrawingResult',
    meta: { title: '开奖结果', icon: 'svg-icon:nav-draw', alwaysShow: false },
    children: [
      {
        path: 'index',
        component: () => import('@/views/DrawingResult/index.vue'),
        name: 'DrawingResultIndex',
        meta: {
          activeMenu: '/drawingResult',
          hidden: true
        }
      },
      {
        path: GameOrderPath,
        component: () => import('@/views/DrawingResult/GameOrderList.vue'),
        name: 'GameOrdrList',
        meta: {
          title: '详细注单',
          hidden: true,
          icon: 'svg-icon:nav-system'
        }
      },
      {
        path: SportsOrderPath,
        component: () => import('@/views/DrawingResult/SportsOrderList.vue'),
        name: 'SportsGameOrdrList',
        meta: {
          title: '详细注单',
          hidden: true
        }
      },
      {
        path: VideoOrderPath,
        component: () => import('@/views/DrawingResult/SportsOrderList.vue'),
        name: 'VideoGameOrdrList',
        meta: {
          title: '详细注单',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/index',
    name: 'Personal',
    meta: {
      // title: '个人管理',
      // icon: 'svg-icon:nav-profile'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Personal/index.vue'),
        name: 'personalIndex',
        meta: {
          title: '个人管理',
          icon: 'svg-icon:nav-profile',
          alwaysShow: true
        }
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/settings',
    name: 'System',
    meta: {},
    children: [
      {
        path: 'settings',
        component: () => import('@/views/System/System.vue'),
        name: 'SystemIndex',
        meta: {
          title: '系统管理',
          icon: 'svg-icon:nav-system',
          alwaysShow: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
