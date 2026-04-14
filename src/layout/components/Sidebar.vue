<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <router-link
        to="/"
        class="logo-link"
      >
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <transition name="fade">
          <h1
            v-show="!isCollapse"
            class="logo-title"
          >
            二手交易管理
          </h1>
        </transition>
      </router-link>
    </div>

    <!-- 菜单 -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#ffffff"
      >
        <template
          v-for="item in flatMenuItems"
          :key="item.path"
        >
          <el-menu-item
            v-if="!item.hidden"
            :index="item.path"
            @click="handleMenuClick(item.parent, item.child)"
          >
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <template #title>
              {{ item.title }}
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>

    <!-- 底部装饰 -->
    <div
      v-show="!isCollapse"
      class="sidebar-footer"
    >
      <div class="footer-content">
        <div class="footer-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div class="footer-text">
          <div class="footer-title">校园二手交易</div>
          <div class="footer-desc">让闲置焕发新生</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapse = computed(() => !appStore.sidebar.opened)

const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 扁平化菜单：子路由全部提为一级菜单项
const flatMenuItems = computed(() => {
  const items: Array<{
    path: string
    title: string
    icon?: unknown
    hidden?: boolean
    parent: RouteRecordRaw
    child?: RouteRecordRaw
  }> = []
  const routes = router.options.routes.filter(r => !r.meta?.hidden)
  for (const route of routes) {
    const children = route.children?.filter(c => !c.meta?.hidden) ?? []
    if (children.length <= 1) {
      const child = children[0]
      items.push({
        path: resolvePath(route.path, child?.path),
        title: (child?.meta?.title ?? route.meta?.title) as string,
        icon: child?.meta?.icon ?? route.meta?.icon,
        hidden: !!(route.meta?.hidden),
        parent: route,
        child
      })
    } else {
      for (const child of children) {
        items.push({
          path: resolvePath(route.path, child.path),
          title: (child.meta?.title ?? route.meta?.title) as string,
          icon: child.meta?.icon ?? route.meta?.icon,
          hidden: false,
          parent: route,
          child
        })
      }
    }
  }
  return items
})

const resolvePath = (basePath: string, childPath?: string) => {
  if (!childPath) return basePath
  if (childPath.startsWith('/')) return childPath
  return `${basePath}/${childPath}`.replace(/\/+/g, '/')
}

const handleMenuClick = (parent: RouteRecordRaw, child?: RouteRecordRaw) => {
  const path = resolvePath(parent.path, child?.path)
  router.push(path)
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $sidebar-bg;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: $sidebar-logo-bg;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    overflow: hidden;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .logo-title {
    margin-left: 14px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
}

.el-scrollbar {
  flex: 1;
  overflow: hidden;
}

:deep(.el-menu) {
  border-right: none;
  padding: 12px 8px;

  .el-menu-item {
    height: 46px;
    line-height: 46px;
    margin: 4px 0;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
      background-color: $sidebar-hover-bg !important;
      color: #fff;
    }

    &.is-active {
      background: $sidebar-active-bg !important;
      color: #fff !important;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);

      .el-icon {
        color: #fff;
      }
    }

    .el-icon {
      font-size: 18px;
      color: $sidebar-text-color;
      transition: color $transition-fast;
    }
  }
}

:deep(.el-menu--collapse) {
  .el-menu-item {
    justify-content: center;
    padding: 0 !important;
  }

  .el-sub-menu__title {
    span,
    .el-sub-menu__icon-arrow {
      display: none;
    }
  }
}

.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .footer-content {
    display: flex;
    align-items: center;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: $radius-md;
  }

  .footer-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .footer-text {
    margin-left: 12px;
  }

  .footer-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  .footer-desc {
    font-size: 11px;
    color: $sidebar-text-color;
    margin-top: 2px;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
