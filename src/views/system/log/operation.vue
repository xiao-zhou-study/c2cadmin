<template>
  <div class="operation-log-container">
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
        <el-form-item label="操作类型">
          <el-input
            v-model="searchForm.operation"
            placeholder="请输入操作类型"
            clearable
          />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select
            v-model="searchForm.method"
            placeholder="请选择请求方法"
            clearable
          >
            <el-option
              label="GET"
              value="GET"
            />
            <el-option
              label="POST"
              value="POST"
            />
            <el-option
              label="PUT"
              value="PUT"
            />
            <el-option
              label="DELETE"
              value="DELETE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择操作状态"
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
        <el-form-item label="操作时间">
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
          <span>操作日志列表</span>
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
          prop="operation"
          label="操作类型"
          width="150"
        />
        <el-table-column
          prop="method"
          label="请求方法"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.method)">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="ip"
          label="IP地址"
          width="130"
        />
        <el-table-column
          prop="userAgent"
          label="用户代理"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          label="操作状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="time"
          label="执行时间(ms)"
          width="120"
        />
        <el-table-column
          prop="createdAt"
          label="操作时间"
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
      title="操作日志详情"
      width="700px"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="ID">
          {{ currentLog?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ currentLog?.userId }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ currentLog?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ currentLog?.operation }}
        </el-descriptions-item>
        <el-descriptions-item label="请求方法">
          {{ currentLog?.method }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ currentLog?.ip }}
        </el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="currentLog?.status === 1 ? 'success' : 'danger'">
            {{ currentLog?.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">
          {{ currentLog?.time }}ms
        </el-descriptions-item>
        <el-descriptions-item
          label="操作时间"
          :span="2"
        >
          {{ formatDateTime(currentLog?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="请求参数"
          :span="2"
        >
          <pre class="json-content">{{ currentLog?.params || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentLog?.error"
          label="错误信息"
          :span="2"
        >
          <pre class="error-content">{{ currentLog.error }}</pre>
        </el-descriptions-item>
        <el-descriptions-item
          label="用户代理"
          :span="2"
        >
          {{ currentLog?.userAgent || '-' }}
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
  getOperationLogPage,
  deleteOperationLog,
  batchDeleteOperationLog,
  clearOperationLog,
  exportOperationLog
} from '@/api/log'
import { formatDateTime } from '@/utils/time'
import type { OperationLog } from '@/types'

// 搜索表单
const searchForm = reactive({
  userId: undefined,
  operation: '',
  method: '',
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
const tableData = ref<OperationLog[]>([])
const loading = ref(false)

// 选中的行
const selectedRows = ref<OperationLog[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<OperationLog | null>(null)

// 获取请求方法标签类型
const getMethodTagType = (method: string) => {
  const typeMap: Record<string, string> = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return typeMap[method] || 'info'
}

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
    const res = await getOperationLogPage(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取操作日志列表失败')
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
    operation: '',
    method: '',
    status: undefined,
    startTime: undefined,
    endTime: undefined
  })
  dateRange.value = null
  pagination.page = 1
  loadData()
}

// 查看详情
const handleViewDetail = (row: OperationLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = async (row: OperationLog) => {
  try {
    await ElMessageBox.confirm('确定要删除这条操作日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteOperationLog(row.id)
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条操作日志吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteOperationLog(ids)
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
    await ElMessageBox.confirm('确定要清空所有操作日志吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await clearOperationLog()
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
    const res = await exportOperationLog(params)
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.xlsx`
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
const handleSelectionChange = (rows: OperationLog[]) => {
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
.operation-log-container {
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

.json-content {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.error-content {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>