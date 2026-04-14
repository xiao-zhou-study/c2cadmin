<template>
  <div class="navbar">
    <!-- 左侧 -->
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <div
        class="hamburger-container"
        @click="toggleSidebar"
      >
        <el-icon :size="20">
          <Fold v-if="appStore.sidebar.opened" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 面包屑 -->
      <Breadcrumb class="breadcrumb-container" />
    </div>

    <!-- 右侧 -->
    <div class="navbar-right">
      <!-- 用户信息，下拉只保留退出登录 -->
      <el-dropdown
        class="avatar-container"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <div class="user-avatar">
            <el-icon :size="16">
              <User />
            </el-icon>
          </div>
          <span class="user-name">{{ userStore.userName }}</span>
          <el-icon class="caret">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import Breadcrumb from './Breadcrumb.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logoutAction()
    router.push('/login')
  })
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.navbar {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: $header-bg;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid $border-light;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.hamburger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: $radius-md;
  transition: all $transition-fast;
  color: $text-regular;

  &:hover {
    background: $primary-bg;
    color: $primary-color;
  }
}

.breadcrumb-container {
  margin-left: 12px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: $radius-md;
  transition: all $transition-fast;
  color: $text-regular;

  &:hover {
    background: $primary-bg;
    color: $primary-color;
  }
}

.avatar-container {
  margin-left: 8px;
  cursor: pointer;

  .avatar-wrapper {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: $radius-lg;
    transition: all $transition-fast;

    &:hover {
      background: $bg-hover;
    }
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .user-name {
    margin: 0 10px;
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
  }

  .caret {
    font-size: 12px;
    color: $text-secondary;
    transition: transform $transition-fast;
  }
}

// 下拉菜单样式
:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  border: 1px solid $border-light;

  .el-dropdown-menu__item {
    border-radius: $radius-sm;
    padding: 10px 16px;
    transition: all $transition-fast;

    &:hover {
      background: $primary-bg;
      color: $primary-color;
    }

    .el-icon {
      margin-right: 8px;
    }
  }
}
</style>
