<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="tag"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent="openContextMenu"
      >
        <span class="tag-dot" />
        {{ tag.meta?.title }}
        <el-icon
          v-if="!tag.meta?.affix"
          class="close-icon"
          @click.prevent.stop="closeTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()

const visitedViews = ref<RouteLocationNormalized[]>([])

const isActive = (tag: RouteLocationNormalized) => {
  return tag.path === route.path
}

const addTag = () => {
  if (route.name) {
    const isExist = visitedViews.value.some(v => v.path === route.path)
    if (!isExist) {
      visitedViews.value.push({ ...route })
    }
  }
}

const closeTag = (tag: RouteLocationNormalized) => {
  const index = visitedViews.value.findIndex(v => v.path === tag.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)

    // 如果关闭的是当前页，跳转到最后一个标签
    if (isActive(tag)) {
      const lastTag = visitedViews.value[visitedViews.value.length - 1]
      if (lastTag) {
        router.push(lastTag.path)
      } else {
        router.push('/')
      }
    }
  }
}

const openContextMenu = () => {
  // 右键菜单功能可以后续扩展
}

watch(
  () => route.path,
  () => {
    addTag()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.tags-view-container {
  height: $tagsview-height;
  width: 100%;
  background: $tagsview-bg;
  border-bottom: 1px solid $border-light;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  .tags-view-wrapper {
    white-space: nowrap;
    padding: 0 12px;
    display: flex;
    align-items: center;
    height: 100%;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      height: 28px;
      margin-right: 6px;
      font-size: 12px;
      font-weight: 500;
      color: $text-regular;
      background: $bg-hover;
      border-radius: $radius-sm;
      text-decoration: none;
      cursor: pointer;
      transition: all $transition-fast;

      &:first-of-type {
        margin-left: 0;
      }

      &:hover {
        color: $primary-color;
        background: $primary-bg;

        .close-icon {
          opacity: 1;
        }
      }

      &.active {
        background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
        color: #fff;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);

        .tag-dot {
          background: #fff;
        }

        .close-icon {
          opacity: 1;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }

      .tag-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $text-secondary;
        margin-right: 8px;
        transition: background $transition-fast;
      }

      .close-icon {
        margin-left: 6px;
        font-size: 12px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all $transition-fast;

        &:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
