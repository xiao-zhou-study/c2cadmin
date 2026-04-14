<template>
  <el-breadcrumb
    class="app-breadcrumb"
    separator="/"
  >
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
      >
        <span
          v-if="item.redirect === 'noRedirect' || index === breadcrumbs.length - 1"
          class="no-redirect"
        >
          {{ item.meta?.title }}
        </span>
        <a
          v-else
          @click.prevent="handleLink(item)"
        >
          {{ item.meta?.title }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbs = ref<RouteLocationMatched[]>([])

const getBreadcrumb = () => {
  const matched = route.matched.filter(item => item.meta?.title)
  breadcrumbs.value = matched
}

const handleLink = (item: RouteLocationMatched) => {
  const { path, redirect } = item
  if (redirect) {
    router.push(redirect as string)
    return
  }
  router.push(path)
}

watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.app-breadcrumb {
  display: inline-block;
  font-size: 13px;
  line-height: 1;

  :deep(.el-breadcrumb__inner) {
    .no-redirect {
      color: $text-secondary;
      cursor: text;
      font-weight: 400;
    }

    a {
      color: $text-regular;
      font-weight: 500;
      transition: color $transition-fast;

      &:hover {
        color: $primary-color;
      }
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: $text-placeholder;
    margin: 0 8px;
  }
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s ease;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(10px);
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
