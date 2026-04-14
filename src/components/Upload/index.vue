<template>
  <div class="upload-container">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="actionUrl"
      :headers="headers"
      :data="uploadData"
      :name="fileName"
      :multiple="multiple"
      :accept="accept"
      :list-type="listType"
      :auto-upload="autoUpload"
      :show-file-list="showFileList"
      :disabled="disabled"
      :limit="limit"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :http-request="customRequest"
      class="upload-component"
    >
      <!-- 上传按钮插槽 -->
      <template #trigger>
        <slot name="trigger">
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            <span>{{ buttonText }}</span>
          </el-button>
        </slot>
      </template>

      <!-- 提示信息插槽 -->
      <template #tip>
        <slot name="tip">
          <div
            v-if="tipText"
            class="el-upload__tip"
          >
            {{ tipText }}
          </div>
        </slot>
      </template>

      <!-- 其他内容插槽 -->
      <template #default>
        <slot />
      </template>
    </el-upload>

    <!-- 图片预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="预览"
      width="50%"
    >
      <img
        :src="previewUrl"
        alt="预览"
        style="width: 100%;"
      >
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadFiles, UploadProps, UploadRequestOptions } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadFile, uploadMultipleFiles } from '@/api/upload'
import { Upload } from '@element-plus/icons-vue'

interface Props {
  modelValue?: string | string[] // v-model绑定的值，可以是单个URL或URL数组
  action?: string // 上传地址
  multiple?: boolean // 是否支持多选
  accept?: string // 接受的文件类型
  listType?: 'text' | 'picture' | 'picture-card' // 文件列表的类型
  autoUpload?: boolean // 是否自动上传
  showFileList?: boolean // 是否显示文件列表
  disabled?: boolean // 是否禁用
  limit?: number // 最大允许上传个数
  maxSize?: number // 最大文件大小（MB）
  buttonText?: string // 按钮文字
  tipText?: string // 提示文字
  fileName?: string // 上传的文件字段名
  uploadData?: Record<string, any> // 上传时附带的额外参数
}

interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'change', file: UploadFile): void
  (e: 'success', response: any, file: UploadFile): void
  (e: 'error', error: Error, file: UploadFile): void
  (e: 'progress', event: any, file: UploadFile): void
  (e: 'exceed', files: File[], fileList: UploadFiles): void
  (e: 'preview', file: UploadFile): void
  (e: 'remove', file: UploadFile, fileList: UploadFiles): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  action: '',
  multiple: false,
  accept: '',
  listType: 'text',
  autoUpload: true,
  showFileList: true,
  disabled: false,
  limit: 5,
  maxSize: 10,
  buttonText: '点击上传',
  tipText: '',
  fileName: 'file',
  uploadData: () => ({})
})

const emit = defineEmits<Emits>()

const uploadRef = ref()
const fileList = ref<UploadFiles>([])
const previewVisible = ref(false)
const previewUrl = ref('')

const userStore = useUserStore()

// 获取请求头
const headers = computed(() => {
  return {
    token: userStore.token
  }
})

// 获取上传地址
const actionUrl = computed(() => {
  return props.action || '/ss/upload'
})

// 监听modelValue变化，更新文件列表
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      fileList.value = []
      return
    }

    // 如果是字符串，转换为数组
    const urls = typeof val === 'string' ? [val] : val

    // 更新文件列表
    const newFileList: UploadFiles = urls.map((url, index) => {
      return {
        name: `文件${index + 1}`,
        url: url,
        uid: Date.now() + index,
        status: 'success'
      }
    })

    fileList.value = newFileList
  },
  { immediate: true }
)

// 自定义上传方法
const customRequest = async (options: UploadRequestOptions) => {
  try {
    const response = props.multiple 
      ? await uploadMultipleFiles([options.file as File], props.uploadData)
      : await uploadFile(options.file as File, props.uploadData)

    // 返回符合Element Plus要求的响应格式
    options.onSuccess({
      code: 200,
      message: '上传成功',
      data: Array.isArray(response) ? response[0] : response
    })
  } catch (error) {
    options.onError(error as any)
  }
}

// 文件数量限制
const handleExceed = (files: File[], fileList: UploadFiles) => {
  ElMessage.warning(`当前限制选择 ${props.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
  emit('exceed', files, fileList)
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`上传文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  return true
}

// 预览文件
const handlePreview: UploadProps['onPreview'] = (file) => {
  if (file.url) {
    previewUrl.value = file.url
    previewVisible.value = true
  }
  emit('preview', file)
}

// 移除文件
const handleRemove: UploadProps['onRemove'] = (file, fileList) => {
  emit('remove', file, fileList)
  updateModelValue(fileList)
}

// 上传成功
const handleSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.code === 200) {
    ElMessage.success('上传成功')
    // 添加URL到文件对象
    if (file.url === undefined) {
      file.url = response.data.url
    }
  } else {
    ElMessage.error(response.message || '上传失败')
  }

  updateModelValue(fileList.value)
  emit('success', response, file)
}

// 上传失败
const handleError: UploadProps['onError'] = (error, file) => {
  ElMessage.error('上传失败')
  emit('error', error, file)
}

// 上传进度
const handleProgress: UploadProps['onProgress'] = (event, file) => {
  emit('progress', event, file)
}

// 更新modelValue
const updateModelValue = (files: UploadFiles) => {
  const urls = files
    .filter(file => file.status === 'success' && file.url)
    .map(file => file.url as string)

  const value = props.multiple ? urls : urls[0] || ''
  emit('update:modelValue', value)
}

// 暴露方法给父组件
defineExpose({
  uploadRef,
  clearFiles: () => uploadRef.value?.clearFiles(),
  submit: () => uploadRef.value?.submit(),
  abort: () => uploadRef.value?.abort()
})
</script>

<style scoped>
.upload-container {
  width: 100%;
}

.upload-component {
  width: 100%;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 7px;
}
</style>