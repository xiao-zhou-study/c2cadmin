<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form
        :model="queryParams"
        inline
      >
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="用户名/邮箱/手机号"
            clearable
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px;"
          >
            <el-option
              label="正常"
              :value="1"
            />
            <el-option
              label="禁用"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            :icon="Refresh"
            @click="resetQuery"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        border
        :max-height="500"
      >
        <template #empty>
          <div class="table-empty">
            <el-empty description="暂无数据" />
          </div>
        </template>
        <el-table-column
          label="头像"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-avatar
              :src="row.avatarUrl"
              :size="50"
              :icon="UserFilled"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="id"
          label="ID"
          min-width="200"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
        />
        <el-table-column
          prop="realName"
          label="真实姓名"
          width="100"
        />
        <el-table-column
          prop="studentId"
          label="学号"
          width="120"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="180"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          width="130"
        />
        <el-table-column
          prop="school"
          label="学校"
          width="120"
        />
        <el-table-column
          prop="department"
          label="院系"
          width="120"
        />
        <el-table-column
          prop="grade"
          label="年级"
          width="80"
        />
        <el-table-column
          prop="creditScore"
          label="信用分"
          width="80"
        />
        <el-table-column
          prop="isVerified"
          label="实名认证"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.isVerified ? 'success' : 'info'">
              {{ row.isVerified ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
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
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper" v-if="true">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="Number(total) || 0"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :hide-on-single-page="false"
          style="display: flex; justify-content: flex-end;"
        />
      </div>
    </el-card>
    
    <!-- 编辑对话框 -->
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
          label="头像"
          prop="avatarUrl"
        >
          <el-avatar
            :src="formData.avatarUrl"
            :size="80"
            :icon="UserFilled"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item
          label="学校"
          prop="school"
        >
          <el-input
            v-model="formData.school"
            placeholder="请输入学校"
          />
        </el-form-item>
        <el-form-item
          label="院系"
          prop="department"
        >
          <el-input
            v-model="formData.department"
            placeholder="请输入院系"
          />
        </el-form-item>
        <el-form-item
          label="年级"
          prop="grade"
        >
          <el-input
            v-model="formData.grade"
            placeholder="请输入年级"
          />
        </el-form-item>
        <el-form-item
          label="性别"
          prop="gender"
        >
          <el-radio-group v-model="formData.gender">
            <el-radio :label="0">
              男
            </el-radio>
            <el-radio :label="1">
              女
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="QQ"
          prop="qq"
        >
          <el-input
            v-model="formData.qq"
            placeholder="请输入QQ"
          />
        </el-form-item>
        <el-form-item
          label="微信"
          prop="wechat"
        >
          <el-input
            v-model="formData.wechat"
            placeholder="请输入微信"
          />
        </el-form-item>
        <el-form-item
          label="个人简介"
          prop="bio"
        >
          <el-input
            v-model="formData.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">
              正常
            </el-radio>
            <el-radio :label="0">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Edit, UserFilled } from '@element-plus/icons-vue'
import { getUserList, updateUser } from '@/api/user'
import { formatTime } from '@/utils/time'
import type { UserInfo } from '@/types'
import { debounce } from 'lodash-es'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const userList = ref<UserInfo[]>([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  status: undefined as number | undefined,
  pageNo: 1,
  pageSize: 10
})

const formData = reactive<Partial<UserInfo>>({
  id: undefined,
  username: '',
  email: '',
  phone: '',
  school: '',
  department: '',
  grade: '',
  gender: 0,
  qq: '',
  wechat: '',
  bio: '',
  status: 1
})

const dialogTitle = computed(() => '编辑用户')

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}



const fetchUserList = async () => {
  loading.value = true
  try {
    // 确保分页参数正确传递给后端
    const params = {
      ...queryParams,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize
    }
    const res = await getUserList(params)
    userList.value = res.list || []
    total.value = res.total || (userList.value.length > 0 ? userList.value.length : 0)
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNo = 1
  fetchUserList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNo = 1
  fetchUserList()
}

// 页码变化
const handlePageChange = (page: number) => {
  queryParams.pageNo = page
  fetchUserList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  handleSearch()
}

const handleEdit = (row: UserInfo) => {
  Object.assign(formData, {
    id: row.id,
    avatarUrl: row.avatarUrl,
    username: row.username,
    email: row.email,
    phone: row.phone,
    school: row.school,
    department: row.department,
    grade: row.grade,
    gender: row.gender,
    qq: row.qq,
    wechat: row.wechat,
    bio: row.bio,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await updateUser(formData.id!, formData)
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchUserList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  formData.id = undefined
  formData.username = ''
  formData.email = ''
  formData.phone = ''
  formData.school = ''
  formData.department = ''
  formData.grade = ''
  formData.gender = 0
  formData.qq = ''
  formData.wechat = ''
  formData.bio = ''
  formData.status = 1
  formRef.value?.resetFields()
}

// 监听关键词变化，自动搜索（防抖500ms）
watch(
  () => queryParams.keyword,
  debounce(() => {
    queryParams.pageNo = 1
    fetchUserList()
  }, 500)
)

onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.el-table {
  width: 100%;
  overflow-x: auto;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
  min-height: 60px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .el-form-item {
    margin-bottom: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>



















