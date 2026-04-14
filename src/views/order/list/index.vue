<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form
        :model="queryParams"
        inline
      >
        <el-form-item label="关键字">
          <el-input
            v-model="queryParams.keyword"
            placeholder="订单号 / 商品名"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option
              label="待确认"
              :value="1"
            />
            <el-option
              label="待付款"
              :value="2"
            />
            <el-option
              label="交易中/服务中"
              :value="3"
            />
            <el-option
              label="待评价"
              :value="4"
            />
            <el-option
              label="已完成"
              :value="5"
            />
            <el-option
              label="已取消"
              :value="6"
            />
            <el-option
              label="已拒绝"
              :value="7"
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
        <span>订单列表</span>
      </template>
      
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        border
      >
        <el-table-column
          prop="id"
          label="订单号"
          width="180"
        />
        <el-table-column
          prop="itemName"
          label="商品名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="buyerName"
          label="买家"
          width="120"
        />
        <el-table-column
          prop="sellerName"
          label="卖家"
          width="120"
        />
        <el-table-column
          prop="price"
          label="金额"
          width="100"
        >
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="View"
              @click="handleView(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="800px"
    >
      <!-- 状态流转组件 -->
      <OrderStatusFlow 
        :order="currentOrder" 
        :show-actions="false"
      />
      
      <el-divider>订单信息</el-divider>

      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="订单号">
          {{ currentOrder?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder?.status)">
            {{ getStatusText(currentOrder?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          label="商品名称"
          :span="2"
        >
          {{ currentOrder?.itemName }}
        </el-descriptions-item>
        <el-descriptions-item label="买家">
          {{ currentOrder?.buyerName }}
        </el-descriptions-item>
        <el-descriptions-item label="卖家">
          {{ currentOrder?.sellerName }}
        </el-descriptions-item>
        <el-descriptions-item label="金额">
          ¥{{ currentOrder?.price }}
        </el-descriptions-item>
        <el-descriptions-item label="支付流水号">
          {{ currentOrder?.payTradeNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime(currentOrder?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="确认时间">
          {{ formatTime(currentOrder?.confirmTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ formatTime(currentOrder?.payTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="交付时间">
          {{ formatTime(currentOrder?.borrowTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentOrder?.cancelReason"
          label="取消/拒绝原因"
          :span="2"
        >
          {{ currentOrder.cancelReason }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import OrderStatusFlow from '@/components/OrderStatusFlow.vue'
import { getOrderList } from '@/api/order'
import { formatTime } from '@/utils/time'
import type { Order } from '@/types'

const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref<Order | null>(null)

const orderList = ref<Order[]>([])
const total = ref(0)

const queryParams = reactive({
  keyword: '' as string,
  status: undefined as number | undefined,
  pageNo: 1,
  pageSize: 10
})

const statusMap: Record<number, { text: string; type: string }> = {
  1: { text: '待确认', type: 'warning' },
  2: { text: '待付款', type: 'primary' },
  3: { text: '交易中/服务中', type: 'success' },
  4: { text: '待评价', type: 'info' },
  5: { text: '已完成', type: 'success' },
  6: { text: '已取消', type: 'danger' },
  7: { text: '已拒绝', type: 'danger' }
}

const getStatusType = (status?: number) => {
  return status ? statusMap[status]?.type || 'info' : 'info'
}

const getStatusText = (status?: number) => {
  return status ? statusMap[status]?.text || '未知' : '-'
}



const handleSearch = () => {
  queryParams.pageNo = 1
  fetchOrderList()
}

const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await getOrderList(queryParams)
    orderList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  handleSearch()
}

const handleView = (row: Order) => {
  currentOrder.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style lang="scss" scoped>
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
</style>

