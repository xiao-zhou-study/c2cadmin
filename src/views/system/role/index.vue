<template>
  <div class="app-container">
    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增角色
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="roleList"
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
          label="角色名称"
          width="150"
        />
        <el-table-column
          prop="description"
          label="角色描述"
          min-width="200"
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="170"
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
          label="角色名称"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
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
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/role'
import { formatTime } from '@/utils/time'
import type { Role } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const roleList = ref<Role[]>([])

const formData = reactive<Partial<Role>>({
  id: undefined,
  name: '',
  description: ''
})

const dialogTitle = computed(() => formData.id ? '编辑角色' : '新增角色')

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}



const fetchRoleList = async () => {
  loading.value = true
  try {
    roleList.value = await getRoleList()
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description
  })
  dialogVisible.value = true
}

const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateRole(formData.id, formData)
        } else {
          await addRole(formData)
        }
        ElMessage.success(formData.id ? '更新成功' : '新增成功')
        dialogVisible.value = false
        fetchRoleList()
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
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchRoleList()
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













