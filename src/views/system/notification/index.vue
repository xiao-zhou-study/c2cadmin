<template>
  <div class="notification-container">
    <el-tabs v-model="activeTab">
      <!-- 系统通知 / 全员广播 -->
      <el-tab-pane
        label="系统通知"
        name="broadcast"
      >
        <!-- 搜索表单 -->
        <el-card class="search-card">
          <el-form
            :model="searchForm"
            inline
          >
            <el-form-item label="标题">
              <el-input
                v-model="searchForm.title"
                placeholder="请输入标题"
                clearable
              />
            </el-form-item>
            <el-form-item label="公告类型">
              <el-select
                v-model="searchForm.category"
                placeholder="请选择公告类型"
                clearable
                style="width: 160px"
              >
                <el-option
                  label="通知"
                  :value="1"
                />
                <el-option
                  label="活动"
                  :value="2"
                />
                <el-option
                  label="维护"
                  :value="3"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="发布状态">
              <el-select
                v-model="searchForm.isActive"
                placeholder="请选择发布状态"
                clearable
                style="width: 160px"
              >
                <el-option
                  label="发布中"
                  :value="true"
                />
                <el-option
                  label="已下线"
                  :value="false"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
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
              <span>通知公告列表</span>
              <div>
                <el-button
                  type="primary"
                  @click="handleAdd"
                >
                  <el-icon><Plus /></el-icon>
                  新增通知
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
              prop="title"
              label="标题"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="category"
              label="公告类型"
              width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category)">
                  {{ getCategoryLabel(row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="isActive"
              label="发布状态"
              width="100"
            >
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'info'">
                  {{ row.isActive ? '发布中' : '已下线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createdAt"
              label="创建时间"
              width="180"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="updatedAt"
              label="更新时间"
              width="180"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="250"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="handleView(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="primary"
                  link
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="!row.isActive" 
                  type="success" 
                  link 
                  @click="handlePublish(row)"
                >
                  发布
                </el-button>
                <el-button 
                  v-if="row.isActive" 
                  type="warning" 
                  link 
                  @click="handleUnpublish(row)"
                >
                  下线
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
      </el-tab-pane>

      <!-- 校园公告 -->
      <el-tab-pane
        label="校园公告"
        name="campus"
      >
        <!-- 搜索表单 -->
        <el-card class="search-card">
          <el-form
            :model="campusSearchForm"
            inline
          >
            <el-form-item label="关键字">
              <el-input
                v-model="campusSearchForm.keyword"
                placeholder="标题/内容关键字"
                clearable
              />
            </el-form-item>
            <el-form-item label="发布状态">
              <el-select
                v-model="campusSearchForm.isPublished"
                placeholder="请选择发布状态"
                clearable
                style="width: 160px"
              >
                <el-option
                  label="已发布"
                  :value="true"
                />
                <el-option
                  label="已下线"
                  :value="false"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleCampusSearch"
              >
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleCampusReset">
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
              <span>校园公告列表</span>
              <div>
                <el-button
                  type="primary"
                  @click="handleCampusAdd"
                >
                  <el-icon><Plus /></el-icon>
                  新增校园公告
                </el-button>
              </div>
            </div>
          </template>

          <!-- 表格 -->
          <el-table
            v-loading="campusLoading"
            :data="campusTableData"
            stripe
            border
          >
            <el-table-column
              prop="id"
              label="ID"
              width="120"
            />
            <el-table-column
              prop="title"
              label="标题"
              min-width="220"
              show-overflow-tooltip
            />
            <el-table-column
              prop="isPublished"
              label="发布状态"
              width="120"
            >
              <template #default="{ row }">
                <el-tag :type="row.isPublished ? 'success' : 'info'">
                  {{ row.isPublished ? '已发布' : '已下线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="180"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="updateTime"
              label="更新时间"
              width="180"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="260"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="handleCampusView(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="primary"
                  link
                  @click="handleCampusEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="!row.isPublished"
                  type="success"
                  link
                  @click="handleCampusPublish(row)"
                >
                  发布
                </el-button>
                <el-button
                  v-if="row.isPublished"
                  type="warning"
                  link
                  @click="handleCampusUnpublish(row)"
                >
                  下线
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleCampusDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="campusPagination.page"
              v-model:page-size="campusPagination.size"
              :total="campusPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleCampusSizeChange"
              @current-change="handleCampusCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑对话框：系统通知 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          label="通知标题"
          prop="title"
        >
          <el-input
            v-model="form.title"
            placeholder="请输入通知标题"
          />
        </el-form-item>
        <el-form-item
          label="通知类型"
          prop="type"
        >
          <el-select
            v-model="form.type"
            placeholder="请选择通知类型"
          >
            <el-option
              label="公告通知"
              value="announcement"
            />
            <el-option
              label="活动通知"
              value="activity"
            />
            <el-option
              label="维护通知"
              value="maintenance"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="通知内容"
          prop="content"
        >
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="8" 
            placeholder="请输入通知内容"
          />
        </el-form-item>
        <el-form-item
          label="发布状态"
          prop="isActive"
        >
          <el-switch 
            v-model="form.isActive" 
            active-text="发布中" 
            inactive-text="已撤回"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框：系统通知 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="公告详情"
      width="700px"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="标题">
          {{ currentNotification?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="公告类型">
          <el-tag :type="getCategoryTagType(currentNotification?.category)">
            {{ getCategoryLabel(currentNotification?.category) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="currentNotification?.isActive ? 'success' : 'info'">
            {{ currentNotification?.isActive ? '发布中' : '已下线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentNotification?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentNotification?.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="公告内容"
          :span="2"
        >
          <div class="notification-content">
            {{ currentNotification?.content }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 新增/编辑对话框：校园公告 -->
    <el-dialog
      v-model="campusDialogVisible"
      :title="campusDialogTitle"
      width="800px"
      @close="handleCampusDialogClose"
    >
      <el-form
        ref="campusFormRef"
        :model="campusForm"
        :rules="campusFormRules"
        label-width="100px"
      >
        <el-form-item
          label="公告标题"
          prop="title"
        >
          <el-input
            v-model="campusForm.title"
            placeholder="请输入公告标题"
          />
        </el-form-item>
        <el-form-item
          label="公告内容"
          prop="content"
        >
          <el-input
            v-model="campusForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item
          label="发布状态"
          prop="isPublished"
        >
          <el-switch
            v-model="campusForm.isPublished"
            active-text="已发布"
            inactive-text="已下线"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="campusDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleCampusSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框：校园公告 -->
    <el-dialog
      v-model="campusViewDialogVisible"
      title="校园公告详情"
      width="700px"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="标题">
          {{ currentCampusAnnouncement?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="currentCampusAnnouncement?.isPublished ? 'success' : 'info'">
            {{ currentCampusAnnouncement?.isPublished ? '已发布' : '已下线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentCampusAnnouncement?.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentCampusAnnouncement?.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="公告内容"
          :span="2"
        >
          <div class="notification-content">
            {{ currentCampusAnnouncement?.content }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { 
  getBroadcastList,
  addOrUpdateBroadcast,
  deleteBroadcast,
  type BroadcastForm,
  type BroadcastItem,
  type BroadcastListParams,
  type BroadcastListResponse,
  getCampusAnnouncementList,
  saveCampusAnnouncement,
  deleteCampusAnnouncement,
  getCampusAnnouncementDetail,
  type CampusAnnouncementItem,
  type CampusAnnouncementListParams,
  type CampusAnnouncementListResponse
} from '@/api/notification'
import { formatDateTime } from '@/utils/time'

// 当前 tab
const activeTab = ref<'broadcast' | 'campus'>('broadcast')

// 搜索表单（按照接口文档）
const searchForm = reactive<BroadcastListParams>({
  title: '',
  category: undefined,
  isActive: undefined,
  startTime: undefined,
  endTime: undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页数据（按照接口文档）
const pagination = reactive({
  page: 1,
  size: 20, // 默认20
  total: 0
})

// 表格数据（系统通知）
const tableData = ref<BroadcastItem[]>([])
const loading = ref(false)

// 对话框数据
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
// 表单数据类型（用于创建/编辑广播公告）
interface BroadcastFormData {
  id?: string | number
  title: string
  type: 'announcement' | 'activity' | 'maintenance'
  content: string
  isActive: boolean // 发布状态：true-发布中, false-已撤回/下线
}
const form = reactive<BroadcastFormData>({
  id: undefined,
  title: '',
  type: 'announcement',
  content: '',
  isActive: true // 默认发布中
})

// 查看详情对话框
const viewDialogVisible = ref(false)
const currentNotification = ref<BroadcastItem | null>(null)

// 选中的行
const selectedRows = ref<BroadcastItem[]>([])

// 表单校验规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' }
  ]
}

// 获取公告类型标签类型（按照接口文档：1-通知, 2-活动, 3-维护）
const getCategoryTagType = (category?: number) => {
  const categoryMap: Record<number, string> = {
    1: '',
    2: 'success',
    3: 'warning'
  }
  return categoryMap[category || 1] || 'info'
}

// 获取公告类型标签
const getCategoryLabel = (category?: number) => {
  const categoryMap: Record<number, string> = {
    1: '通知',
    2: '活动',
    3: '维护'
  }
  return categoryMap[category || 1] || '未知'
}

// 将表单类型转换为接口要求的 category 值
const typeToCategory = (type?: string): number => {
  const typeMap: Record<string, number> = {
    announcement: 1,
    activity: 2,
    maintenance: 3
  }
  return typeMap[type || ''] || 1
}

// 将接口返回的 category 值转换为表单类型
const categoryToType = (category?: number): 'announcement' | 'activity' | 'maintenance' => {
  const categoryMap: Record<number, 'announcement' | 'activity' | 'maintenance'> = {
    1: 'announcement',
    2: 'activity',
    3: 'maintenance'
  }
  return categoryMap[category || 1] || 'announcement'
}

// ======================
// 校园公告相关状态 & 方法
// ======================

// 搜索表单（校园公告）
const campusSearchForm = reactive<{
  keyword: string
  isPublished?: boolean
}>({
  keyword: '',
  isPublished: undefined
})

// 分页（校园公告）
const campusPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 表格数据（校园公告）
const campusTableData = ref<CampusAnnouncementItem[]>([])
const campusLoading = ref(false)

// 新增/编辑对话框（校园公告）
const campusDialogVisible = ref(false)
const campusDialogTitle = ref('')
const campusFormRef = ref<FormInstance>()
const campusForm = reactive<{
  id?: number | string
  title: string
  content: string
  isPublished: boolean
}>({
  id: undefined,
  title: '',
  content: '',
  isPublished: true
})

// 校验规则（校园公告）
const campusFormRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ]
}

// 查看详情（校园公告）
const campusViewDialogVisible = ref(false)
const currentCampusAnnouncement = ref<CampusAnnouncementItem | null>(null)
// 日期范围变化（转换为时间戳毫秒）
const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    searchForm.startTime = new Date(dates[0]).getTime()
    searchForm.endTime = new Date(dates[1]).getTime()
  } else {
    searchForm.startTime = undefined
    searchForm.endTime = undefined
  }
}

// 加载校园公告数据
const loadCampusData = async () => {
  campusLoading.value = true
  try {
    const params: CampusAnnouncementListParams = {
      pageNo: campusPagination.page,
      pageSize: campusPagination.size,
      keyword: campusSearchForm.keyword || undefined,
      isPublished: campusSearchForm.isPublished,
      isAsc: false,
      // 后端字段为 create_time（蛇形命名），不要用 createTime
      sortBy: 'create_time'
    }

    // 移除 undefined
    Object.keys(params).forEach((key) => {
      if (params[key as keyof CampusAnnouncementListParams] === undefined) {
        delete params[key as keyof CampusAnnouncementListParams]
      }
    })

    const res = (await getCampusAnnouncementList(params) as unknown) as CampusAnnouncementListResponse
    campusTableData.value = res.list || []
    campusPagination.total = res.total || 0
  } catch {
    campusTableData.value = []
    campusPagination.total = 0
  } finally {
    campusLoading.value = false
  }
}

// 搜索（校园公告）
const handleCampusSearch = () => {
  campusPagination.page = 1
  loadCampusData()
}

// 重置（校园公告）
const handleCampusReset = () => {
  Object.assign(campusSearchForm, {
    keyword: '',
    isPublished: undefined
  })
  campusPagination.page = 1
  loadCampusData()
}

// 新增校园公告
const handleCampusAdd = () => {
  campusDialogTitle.value = '新增校园公告'
  campusDialogVisible.value = true
  Object.assign(campusForm, {
    id: undefined,
    title: '',
    content: '',
    isPublished: true
  })
}

// 编辑校园公告
const handleCampusEdit = (row: CampusAnnouncementItem) => {
  campusDialogTitle.value = '编辑校园公告'
  campusDialogVisible.value = true
  Object.assign(campusForm, {
    id: row.id,
    title: row.title,
    content: row.content,
    isPublished: row.isPublished
  })
}

// 查看校园公告详情
const handleCampusView = async (row: CampusAnnouncementItem) => {
  try {
    const detail = (await getCampusAnnouncementDetail(row.id) as unknown) as CampusAnnouncementItem
    currentCampusAnnouncement.value = detail
  } catch {
    // 兜底：接口异常时，至少展示列表里的数据
    currentCampusAnnouncement.value = row
  }
  campusViewDialogVisible.value = true
}

// 删除校园公告
const handleCampusDelete = async (row: CampusAnnouncementItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除校园公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCampusAnnouncement(row.id)
    ElMessage.success('删除成功')
    loadCampusData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 发布校园公告
const handleCampusPublish = async (row: CampusAnnouncementItem) => {
  try {
    await ElMessageBox.confirm(`确定要发布校园公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await saveCampusAnnouncement({
      id: row.id,
      title: row.title,
      content: row.content,
      isPublished: true
    })
    ElMessage.success('发布成功')
    loadCampusData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

// 下线校园公告
const handleCampusUnpublish = async (row: CampusAnnouncementItem) => {
  try {
    await ElMessageBox.confirm(`确定要下线校园公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await saveCampusAnnouncement({
      id: row.id,
      title: row.title,
      content: row.content,
      isPublished: false
    })
    ElMessage.success('下线成功')
    loadCampusData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下线失败')
    }
  }
}

// 对话框关闭（校园公告）
const handleCampusDialogClose = () => {
  campusFormRef.value?.resetFields()
}

// 提交（校园公告）
const handleCampusSubmit = async () => {
  if (!campusFormRef.value) return

  try {
    await campusFormRef.value.validate()

    await saveCampusAnnouncement({
      id: campusForm.id,
      title: campusForm.title,
      content: campusForm.content,
      isPublished: campusForm.isPublished
    })

    ElMessage.success(campusForm.id ? '更新成功' : '创建成功')
    campusDialogVisible.value = false
    loadCampusData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 分页大小变化（校园公告）
const handleCampusSizeChange = (size: number) => {
  campusPagination.size = size
  campusPagination.page = 1
  loadCampusData()
}

// 当前页变化（校园公告）
const handleCampusCurrentChange = (page: number) => {
  campusPagination.page = page
  loadCampusData()
}

// 加载数据（使用新的接口）
const loadData = async () => {
  loading.value = true
  try {
    const params: BroadcastListParams = {
      pageNo: pagination.page,
      pageSize: pagination.size,
      title: searchForm.title || undefined,
      category: searchForm.category,
      isActive: searchForm.isActive,
      startTime: searchForm.startTime,
      endTime: searchForm.endTime
    }
    // 移除undefined值
    Object.keys(params).forEach(key => {
      if (params[key as keyof BroadcastListParams] === undefined) {
        delete params[key as keyof BroadcastListParams]
      }
    })
    
    const res = (await getBroadcastList(params) as unknown) as BroadcastListResponse
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch {
    tableData.value = []
    pagination.total = 0
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
    title: '',
    category: undefined,
    isActive: undefined,
    startTime: undefined,
    endTime: undefined
  })
  dateRange.value = null
  pagination.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增通知'
  dialogVisible.value = true
  Object.assign(form, {
    id: undefined,
    title: '',
    type: 'announcement',
    content: '',
    isActive: true // 默认发布中
  })
}

// 编辑（使用列表数据，接口已返回完整信息）
const handleEdit = (row: BroadcastItem) => {
  dialogTitle.value = '编辑通知'
  dialogVisible.value = true
  
  // 直接使用列表数据，接口已返回完整信息
  Object.assign(form, {
    id: row.id,
    title: row.title,
    content: row.content,
    type: categoryToType(row.category),
    isActive: row.isActive
  })
}

// 查看
const handleView = (row: BroadcastItem) => {
  // 直接使用列表数据展示详情
  currentNotification.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (row: BroadcastItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBroadcast(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 发布通知（设置为发布中）
const handlePublish = async (row: BroadcastItem) => {
  try {
    await ElMessageBox.confirm(`确定要发布公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用更新接口，设置 isActive 为 true
    await addOrUpdateBroadcast({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      isActive: true
    })
    ElMessage.success('发布成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

// 下线通知（设置为已下线）
const handleUnpublish = async (row: BroadcastItem) => {
  try {
    await ElMessageBox.confirm(`确定要下线公告 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用更新接口，设置 isActive 为 false
    await addOrUpdateBroadcast({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      isActive: false
    })
    ElMessage.success('下线成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下线失败')
    }
  }
}

// 批量删除（循环调用单个删除接口）
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的公告')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条公告吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 循环调用删除接口
    const deletePromises = selectedRows.value.map(row => deleteBroadcast(row.id))
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除 ${selectedRows.value.length} 条公告`)
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (rows: BroadcastItem[]) => {
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

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 构建接口请求数据（严格按照接口文档）
    const broadcastData: BroadcastForm = {
      title: form.title!,
      content: form.content!,
      category: typeToCategory(form.type),
      isActive: form.isActive
    }
    
    // 修改时传递 id，新增时不传递 id
    if (form.id) {
      broadcastData.id = form.id
    }
    
    await addOrUpdateBroadcast(broadcastData)
    ElMessage.success(form.id ? '更新成功' : '创建成功')
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 初始化
onMounted(() => {
  loadData()
  loadCampusData()
})

// 切换 tab 时，按需加载对应数据
watch(activeTab, (val) => {
  if (val === 'broadcast') {
    if (!tableData.value.length) {
      loadData()
    }
  } else if (val === 'campus') {
    if (!campusTableData.value.length) {
      loadCampusData()
    }
  }
})
</script>

<style scoped>
.notification-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.notification-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>