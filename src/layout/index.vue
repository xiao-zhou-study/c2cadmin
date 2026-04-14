<template>
  <div
    class="app-wrapper"
    :class="classObj"
  >
    <!-- 侧边栏 -->
    <Sidebar class="sidebar-container" />

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="fixed-header">
        <Navbar />
        <TagsView />
      </div>

      <!-- 页面内容 -->
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'

const appStore = useAppStore()

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  withoutAnimation: appStore.sidebar.withoutAnimation,
  mobile: appStore.device === 'mobile'
}))
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: $bg-page;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  width: $sidebar-width;
  height: 100%;
  overflow: hidden;
  transition: width $transition-normal;
}

.main-container {
  min-height: 100%;
  transition: margin-left $transition-normal;
  margin-left: $sidebar-width;
  position: relative;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sidebar-width});
  transition: width $transition-normal;
}

.hideSidebar {
  .sidebar-container {
    width: $sidebar-collapsed-width !important;
  }

  .main-container {
    margin-left: $sidebar-collapsed-width;
  }

  .fixed-header {
    width: calc(100% - #{$sidebar-collapsed-width});
  }
}

.mobile {
  .sidebar-container {
    transition: transform $transition-normal;
    width: $sidebar-width !important;
  }

  .main-container {
    margin-left: 0;
  }

  .fixed-header {
    width: 100%;
  }

  &.hideSidebar {
    .sidebar-container {
      pointer-events: none;
      transition-duration: 0.3s;
      transform: translate3d(-$sidebar-width, 0, 0);
    }
  }
}
</style>
