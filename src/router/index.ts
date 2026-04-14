import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled', affix: true }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      },

      {
        path: 'notification',
        name: 'Notification',
        component: () => import('@/views/system/notification/index.vue'),
        meta: { title: '消息通知', icon: 'Bell' }
      }
    ]
  },
  {
    path: '/blog',
    component: () => import('@/layout/index.vue'),
    redirect: '/blog/category',
    meta: { title: '校园博客', icon: 'Document' },
    children: [
      {
        path: 'category',
        name: 'BlogCategory',
        component: () => import('@/views/blog/category/index.vue'),
        meta: { title: '话题分类管理', icon: 'Menu' }
      }
    ]
  },
  {
    path: '/item',
    component: () => import('@/layout/index.vue'),
    redirect: '/item/list',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      {
        path: 'list',
        name: 'ItemList',
        component: () => import('@/views/item/list/index.vue'),
        meta: { title: '商品列表', icon: 'List' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/item/category/index.vue'),
        meta: { title: '分类管理', icon: 'Menu' }
      }
    ]
  },
  {
    path: '/order',
    component: () => import('@/layout/index.vue'),
    redirect: '/order/list',
    meta: { title: '订单管理', icon: 'Document' },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list/index.vue'),
        meta: { title: '订单列表', icon: 'List' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 白名单路由
const whiteList = ['/login']

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  
  // 设置页面标题
  document.title = `${to.meta.title || ''} - 校园二手交易平台管理后台`
  
  const userStore = useUserStore()
  const hasToken = userStore.token
  
  if (hasToken) {
    // 检查token是否过期
    if (!userStore.isLoggedIn) {
      try {
        console.log('管理端Token已过期，尝试刷新...')
        await userStore.refreshTokenAction(false) // 不自动跳转，由路由守卫处理
        console.log('管理端Token刷新成功，继续访问')
      } catch (error) {
        console.error('管理端Token刷新失败:', error)
        if (whiteList.includes(to.path)) {
          next()
        } else {
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
        return
      }
    }
    
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
