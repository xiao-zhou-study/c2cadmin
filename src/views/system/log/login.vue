<template>
  <div class="login-log-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form
        :model="searchForm"
        inline
      >
        <el-form-item label="用户ID">
          <el-input-number
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            :min="1"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input
            v-model="searchForm.ip"
            placeholder="请输入IP地址"
            clearable
          />
        </el-form-item>
        <el-form-item label="登录状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择登录状态"
            clearable
          >
            <el-option
              label="成功"
              :value="1"
            />
            <el-option
              label="失败"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSearch"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>登录日志列表</span>
          <div>
            <el-button
              type="danger"
              plain
              @click="handleClear"
            >
              <el-icon><Delete /></el-icon>
              清空日志
            </el-button>
            <el-button
              type="danger"
              :disabled="!selectedRows.length"
              plain
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button
              type="success"
              @click="handleExport"
            >
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="userId"
          label="用户ID"
          width="100"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
        />
        <el-table-column
          prop="ip"
          label="IP地址"
          width="130"
        />
        <el-table-column
          prop="location"
          label="登录地点"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="browser"
          label="浏览器"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="os"
          label="操作系统"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          label="登录状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="登录信息"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="loginTime"
          label="登录时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="记录时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
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
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="登录日志详情"
      width="600px"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="ID">
          {{ currentLog?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ currentLog?.userId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ currentLog?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ currentLog?.ip || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="登录地点">
          {{ currentLog?.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器">
          {{ currentLog?.browser || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作系统">
          {{ currentLog?.os || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="登录状态">
          <el-tag :type="currentLog?.status === 1 ? 'success' : 'danger'">
            {{ currentLog?.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="登录时间">
          {{ formatDateTime(currentLog?.loginTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="记录时间">
          {{ formatDateTime(currentLog?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentLog?.message"
          label="登录信息"
          :span="2"
        >
          {{ currentLog.message }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { 
  getLoginLogPage,
  deleteLoginLog,
  batchDeleteLoginLog,
  clearLoginLog,
  exportLoginLog
} from '@/api/log'
import { formatDateTime } from '@/utils/time'
import type { LoginLog } from '@/types'

// 搜索表单
const searchForm = reactive({
  userId: undefined,
  username: '',
  ip: '',
  status: undefined,
  startTime: undefined,
  endTime: undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 表格数据
const tableData = ref<LoginLog[]>([])
const loading = ref(false)

// 选中的行
const selectedRows = ref<LoginLog[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<LoginLog | null>(null)

// 格式化日期时间


// 日期范围变化
const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    searchForm.startTime = new Date(dates[0]).getTime() as any
    searchForm.endTime = new Date(dates[1]).getTime() as any
  } else {
    searchForm.startTime = undefined
    searchForm.endTime = undefined
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNo: pagination.page,
      pageSize: pagination.size
    }
    const res = await getLoginLogPage(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取登录日志列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    userId: undefined,
    username: '',
    ip: '',
    status: undefined,
    startTime: undefined,
    endTime: undefined
  })
  dateRange.value = null
  pagination.page = 1
  loadData()
}

// 查看详情
const handleViewDetail = (row: LoginLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = async (row: LoginLog) => {
  try {
    await ElMessageBox.confirm('确定要删除这条登录日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteLoginLog(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条登录日志吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteLoginLog(ids)
    ElMessage.success('批量删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 清空日志
const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有登录日志吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await clearLoginLog()
    ElMessage.success('清空成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    const params = {
      ...searchForm
    }
    const res = await exportLoginLog(params)
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `登录日志_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 表格选择变化
const handleSelectionChange = (rows: LoginLog[]) => {
  selectedRows.value = rows
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.login-log-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>