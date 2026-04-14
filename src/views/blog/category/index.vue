<template>
  <div class="app-container">
    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>话题分类列表</span>
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
          width="200"
        />
        <el-table-column
          prop="description"
          label="分类描述"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="100"
          align="center"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          min-width="170"
        >
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
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
          label="排序"
          prop="sortOrder"
        >
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
            placeholder="数值越大越靠前"
          />
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
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getBlogCategoryList, saveBlogCategory, deleteBlogCategory } from '@/api/blog'
import { formatTime } from '@/utils/time'
import type { BlogCategory } from '@/api/blog'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const categoryList = ref<BlogCategory[]>([])

const formData = reactive<BlogCategory>({
  id: undefined,
  name: '',
  description: '',
  sortOrder: 100
})

const dialogTitle = computed(() => formData.id ? '编辑话题分类' : '新增话题分类')

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

const fetchCategoryList = async () => {
  loading.value = true
  try {
    categoryList.value = await getBlogCategoryList()
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  formData.id = undefined
  formData.name = ''
  formData.description = ''
  formData.sortOrder = 100
  formRef.value?.resetFields()
  dialogVisible.value = true
}

const handleEdit = (row: BlogCategory) => {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder
  })
  dialogVisible.value = true
}

const handleDelete = (row: BlogCategory) => {
  if (!row.id) return
  
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBlogCategory(row.id!)
      ElMessage.success('删除成功')
      fetchCategoryList()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await saveBlogCategory(formData)
        ElMessage.success(formData.id ? '更新成功' : '新增成功')
        dialogVisible.value = false
        fetchCategoryList()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
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
  formData.sortOrder = 100
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
</style>
