<template>
  <div class="app-container">
    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>分类列表</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增分类
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="categoryList"
        stripe
        border
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="分类名称"
          width="150"
        />
        <el-table-column
          prop="description"
          label="分类描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="icon"
          label="图标"
          width="120"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              :preview-src-list="[row.icon]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px;"
            />
            <span
              v-else
              class="text-muted"
            >-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="100"
        />
        <el-table-column
          prop="isActive"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.isActive ? 'success' : 'info'"
              size="small"
            >
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          min-width="170"
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item
          label="分类名称"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称"
          />
        </el-form-item>
        <el-form-item
          label="分类描述"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item
          label="分类图标"
          prop="icon"
        >
          <el-upload
            class="icon-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <el-image
              v-if="formData.icon"
              :src="formData.icon"
              fit="cover"
              class="icon-preview"
            />
            <div v-else class="upload-wrapper">
              <el-icon
                v-if="!uploadLoading"
                class="icon-uploader-icon"
              >
                <Plus />
              </el-icon>
              <el-icon
                v-else
                class="icon-uploader-icon loading"
              >
                <Loading />
              </el-icon>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item
          label="排序"
          prop="sortOrder"
        >
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="isActive"
        >
          <el-radio-group v-model="formData.isActive">
            <el-radio :label="true">
              启用
            </el-radio>
            <el-radio :label="false">
              禁用
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadProps, UploadRequestOptions } from 'element-plus'
import { Plus, Edit, Delete, Loading } from '@element-plus/icons-vue'
import { getCategoryList, addCategory, updateCategory, deleteCategory, uploadCategoryImage } from '@/api/category'
import { formatTime } from '@/utils/time'
import type { Category } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const uploadLoading = ref(false) // 新增上传加载状态
const formRef = ref<FormInstance>()

const categoryList = ref<Category[]>([])

const formData = reactive<Partial<Category>>({
  id: undefined,
  name: '',
  description: '',
  icon: '',
  sortOrder: 100,
  isActive: true
})

const dialogTitle = computed(() => formData.id ? '编辑分类' : '新增分类')

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理上传
const handleUpload = async (options: UploadRequestOptions) => {
  uploadLoading.value = true // 开始上传，显示加载
  try {
    const result = await uploadCategoryImage(options.file)
    console.log('上传结果:', result) // 调试用
    
    // 处理返回的URL字符串
    if (result) {
      formData.icon = result
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：未返回有效数据')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    // 处理错误响应
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.message || '上传失败')
    } else {
      ElMessage.error('上传失败')
    }
  } finally {
    uploadLoading.value = false // 上传完成，隐藏加载
  }
}


const fetchCategoryList = async () => {
  loading.value = true
  try {
    categoryList.value = await getCategoryList()
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  // 完全重置表单数据
  formData.id = undefined
  formData.name = ''
  formData.description = ''
  formData.icon = ''
  formData.sortOrder = 100
  formData.isActive = true
  
  // 重置表单验证状态
  formRef.value?.resetFields()
  
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sortOrder,
    isActive: row.isActive
  })
  dialogVisible.value = true
}

const handleDelete = (row: Category) => {
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteCategory(row.id!)
    ElMessage.success('删除成功')
    fetchCategoryList()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateCategory(formData.id, formData)
        } else {
          await addCategory(formData)
        }
        ElMessage.success(formData.id ? '更新成功' : '新增成功')
        dialogVisible.value = false
        fetchCategoryList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.description = ''
  formData.icon = ''
  formData.sortOrder = 100
  formData.isActive = true
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchCategoryList()
})
</script>

<style lang="scss" scoped>
.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.text-muted {
  color: #999;
}

.icon-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.icon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.icon-preview {
  width: 100px;
  height: 100px;
  display: block;
}
</style>

<style scoped>
.icon-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-uploader:hover {
  border-color: #409eff;
}

.icon-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.icon-uploader-icon {
  font-size: 24px;
  color: #8c8c8c;
}

.icon-uploader-icon.loading {
  animation: rotate 2s linear infinite;
  color: #409eff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>