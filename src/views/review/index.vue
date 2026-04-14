<template>
  <div class="review-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>评价管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item>评价管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :loading="exporting"
          @click="exportReviews"
        >
          <el-icon><Download /></el-icon>
          导出评价
        </el-button>
      </div>
    </div>

    <!-- 评价统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ stats.totalReviews }}
                </div>
                <div class="stat-label">
                  总评价数
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon positive">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ stats.positiveReviews }}
                </div>
                <div class="stat-label">
                  好评数
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon neutral">
                <el-icon><MinusFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ stats.neutralReviews }}
                </div>
                <div class="stat-label">
                  中评数
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon negative">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ stats.negativeReviews }}
                </div>
                <div class="stat-label">
                  差评数
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 评分分布图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>评分分布</span>
          <el-radio-group
            v-model="chartPeriod"
            size="small"
            @change="updateChart"
          >
            <el-radio-button label="7d">
              近7天
            </el-radio-button>
            <el-radio-button label="30d">
              近30天
            </el-radio-button>
            <el-radio-button label="90d">
              近90天
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div
        ref="ratingChart"
        class="rating-chart"
      />
    </el-card>

    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="评价内容">
          <el-input
            v-model="searchForm.content"
            placeholder="搜索评价内容"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="评分">
          <el-select
            v-model="searchForm.rating"
            placeholder="选择评分"
            clearable
            style="width: 120px"
          >
            <el-option
              label="5星"
              value="5"
            />
            <el-option
              label="4星"
              value="4"
            />
            <el-option
              label="3星"
              value="3"
            />
            <el-option
              label="2星"
              value="2"
            />
            <el-option
              label="1星"
              value="1"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              label="正常"
              value="normal"
            />
            <el-option
              label="已删除"
              value="deleted"
            />
            <el-option
              label="待审核"
              value="pending"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="loadReviews"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>评价列表</span>
          <div class="table-actions">
            <el-button
              :disabled="selectedReviews.length === 0"
              @click="batchDelete"
            >
              批量删除
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="reviews"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        
        <el-table-column
          label="评价信息"
          min-width="300"
        >
          <template #default="{ row }">
            <div class="review-info">
              <div class="review-header">
                <el-rate
                  v-model="row.rating"
                  disabled
                  size="small"
                />
                <span class="review-time">{{ formatTime(row.createdAt) }}</span>
              </div>
              <p class="review-content">
                {{ row.content }}
              </p>
              <div
                v-if="row.images && row.images.length > 0"
                class="review-images"
              >
                <img 
                  v-for="(image, index) in row.images.slice(0, 3)" 
                  :key="index"
                  :src="image"
                  :alt="`评价图片${index + 1}`"
                  @click="previewImage(row.images, index)"
                >
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          label="商品信息"
          width="200"
        >
          <template #default="{ row }">
            <div
              v-if="row.item"
              class="item-info"
            >
              <div class="item-name">
                {{ row.item.name }}
              </div>
              <div class="item-price">
                ¥{{ row.item.price }}
              </div>
            </div>
            <span
              v-else
              class="no-data"
            >商品已删除</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="评价用户"
          width="150"
        >
          <template #default="{ row }">
            <div
              v-if="row.reviewer"
              class="user-info"
            >
              <div class="user-name">
                {{ row.reviewer.nickname }}
              </div>
              <div class="user-phone">
                {{ formatPhone(row.reviewer.phone) }}
              </div>
            </div>
            <span
              v-else
              class="no-data"
            >用户已删除</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="被评价用户"
          width="150"
        >
          <template #default="{ row }">
            <div
              v-if="row.targetUser"
              class="user-info"
            >
              <div class="user-name">
                {{ row.targetUser.nickname }}
              </div>
              <div class="user-phone">
                {{ formatPhone(row.targetUser.phone) }}
              </div>
            </div>
            <span
              v-else
              class="no-data"
            >用户已删除</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click="viewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="text"
              size="small"
              @click="approveReview(row)"
            >
              通过
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="deleteReview(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="评价详情"
      width="600px"
    >
      <div
        v-if="selectedReview"
        class="review-detail"
      >
        <div class="detail-section">
          <h4>评价信息</h4>
          <div class="detail-item">
            <span class="label">评分：</span>
            <el-rate
              v-model="selectedReview.rating"
              disabled
            />
          </div>
          <div class="detail-item">
            <span class="label">内容：</span>
            <p>{{ selectedReview.content }}</p>
          </div>
          <div class="detail-item">
            <span class="label">图片：</span>
            <div class="detail-images">
              <img 
                v-for="(image, index) in selectedReview.images" 
                :key="index"
                :src="image"
                :alt="`评价图片${index + 1}`"
                @click="previewImage(selectedReview.images, index)"
              >
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>关联信息</h4>
          <div class="detail-item">
            <span class="label">商品：</span>
            <span v-if="selectedReview.item">{{ selectedReview.item.name }}</span>
            <span
              v-else
              class="no-data"
            >商品已删除</span>
          </div>
          <div class="detail-item">
            <span class="label">评价用户：</span>
            <span v-if="selectedReview.reviewer">{{ selectedReview.reviewer.nickname }}</span>
            <span
              v-else
              class="no-data"
            >用户已删除</span>
          </div>
          <div class="detail-item">
            <span class="label">被评价用户：</span>
            <span v-if="selectedReview.targetUser">{{ selectedReview.targetUser.nickname }}</span>
            <span
              v-else
              class="no-data"
            >用户已删除</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer 
      v-if="previewImages.show"
      :url-list="previewImages.urls"
      :initial-index="previewImages.index"
      @close="previewImages.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download,
  ChatDotRound,
  SuccessFilled,
  // Minus,
  CircleCloseFilled,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { 
  getReviewList,
  deleteReview as deleteReviewApi,
  exportReviews as exportReviewsApi
} from '@/api/review'
import { formatTime } from '@/utils/time'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const reviews = ref<any[]>([])
const selectedReviews = ref<any[]>([])
const selectedReview = ref<any>(null)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const searchForm = reactive({
  content: '',
  rating: '',
  status: '',
  startDate: '',
  endDate: ''
})

const dateRange = ref([])
const chartPeriod = ref('30d')

const stats = reactive({
  totalReviews: 0,
  positiveReviews: 0,
  neutralReviews: 0,
  negativeReviews: 0
})

const detailDialogVisible = ref(false)
// const selectedReview = ref(null)

const previewImages = reactive({
  show: false,
  urls: [] as string[],
  index: 0
})

const ratingChart = ref<HTMLElement | null>(null)

let chartInstance: echarts.ECharts | null = null

// 计算属性
const chartData = computed(() => {
  // 模拟图表数据，实际应该从API获取
  return {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ratings: [4.5, 4.3, 4.6, 4.2, 4.7, 4.4, 4.5],
    counts: [12, 8, 15, 6, 18, 10, 14]
  }
})

// 方法
const loadReviews = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const response = await getReviewList(params)
    reviews.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('加载评价列表失败:', error)
    ElMessage.error('加载评价列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    // const response = await getReviewStats()
    // Object.assign(stats, response)
    // 模拟统计数据
    stats.totalReviews = 100
    stats.positiveReviews = 75
    stats.neutralReviews = 15
    stats.negativeReviews = 10
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const initChart = () => {
  if (!ratingChart.value) return
  
  chartInstance = echarts.init(ratingChart.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['平均评分', '评价数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates
    },
    yAxis: [
      {
        type: 'value',
        name: '评分',
        min: 0,
        max: 5,
        interval: 1
      },
      {
        type: 'value',
        name: '数量',
        min: 0
      }
    ],
    series: [
      {
        name: '平均评分',
        type: 'line',
        smooth: true,
        data: chartData.value.ratings,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '评价数量',
        type: 'bar',
        yAxisIndex: 1,
        data: chartData.value.counts,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const handleSelectionChange = (selection: any[]) => {
  selectedReviews.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadReviews()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadReviews()
}

const resetSearch = () => {
  (Object.keys(searchForm) as Array<keyof typeof searchForm>).forEach(key => {
    searchForm[key] = ''
  })
  dateRange.value = []
  currentPage.value = 1
  loadReviews()
}

const viewDetail = (review: any) => {
  selectedReview.value = review
  detailDialogVisible.value = true
}

const approveReview = async (review: any) => {
  try {
    await ElMessageBox.confirm('确定要通过这条评价吗？', '确认通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // await approveReviewApi(review.id) - 等待API实现
    console.log('通过评价:', review.id)
    ElMessage.success('评价已通过')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('通过评价失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const deleteReview = async (review: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteReviewApi(review.id)
    ElMessage.success('评价已删除')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedReviews.value.length} 条评价吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // const ids = selectedReviews.value.map(review => review.id)
    // 调用批量删除API
    ElMessage.success('批量删除成功')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const previewImage = (images: string[], index: number) => {
  previewImages.urls = images
  previewImages.index = index
  previewImages.show = true
}

const exportReviews = async () => {
  try {
    exporting.value = true
    const response = await exportReviewsApi(searchForm)
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `评价数据_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const refreshData = () => {
  loadReviews()
  loadStats()
}

const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    normal: 'success',
    deleted: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    normal: '正常',
    deleted: '已删除',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadReviews(),
    loadStats()
  ])
  
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.review-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-icon.total { background-color: #409eff; }
.stat-icon.positive { background-color: #67c23a; }
.stat-icon.neutral { background-color: #e6a23c; }
.stat-icon.negative { background-color: #f56c6c; }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-chart {
  height: 300px;
}

.filter-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.table-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.review-info {
  padding: 8px 0;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.review-time {
  font-size: 12px;
  color: #909399;
}

.review-content {
  margin: 0 0 8px;
  line-height: 1.4;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-images {
  display: flex;
  gap: 8px;
}

.review-images img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}

.item-info {
  line-height: 1.4;
}

.item-name {
  color: #303133;
  margin-bottom: 4px;
}

.item-price {
  color: #f56c6c;
  font-weight: 500;
}

.user-info {
  line-height: 1.4;
}

.user-name {
  color: #303133;
  margin-bottom: 4px;
}

.user-phone {
  color: #909399;
  font-size: 12px;
}

.no-data {
  color: #c0c4cc;
  font-style: italic;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.review-detail {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item .label {
  display: inline-block;
  width: 80px;
  color: #606266;
  font-weight: 500;
}

.detail-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.detail-images img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}
</style>