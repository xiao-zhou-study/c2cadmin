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
            placeholder="商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 100px"
          >
            <el-option
              label="在售"
              :value="1"
            />
            <el-option
              label="已售出"
              :value="2"
            />
            <el-option
              label="已下架"
              :value="3"
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
          <span>商品列表</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="itemList"
        stripe
        border
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="title"
          label="商品名称"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="categoryName"
          label="分类"
          width="120"
        />
        <el-table-column
          prop="ownerName"
          label="发布者"
          width="120"
        />
        <el-table-column
          prop="price"
          label="价格"
          width="100"
        >
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column
          prop="conditionLevel"
          label="成色"
          width="100"
        >
          <template #default="{ row }">
            <el-tag size="small">
              {{ getConditionText(row.conditionLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="viewCount"
          label="浏览量"
          width="100"
        />
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
          label="发布时间"
          width="170"
        >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="View"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="row.status === 3" 
              type="success" 
              link 
              @click="handleOnline(row)"
            >
              上架
            </el-button>
            <el-button 
              v-if="row.status === 1" 
              type="warning" 
              link 
              @click="handleOffline(row)"
            >
              下架
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
    
    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="商品详情"
      width="600px"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item
          label="商品名称"
          :span="2"
        >
          {{ currentItem?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ currentItem?.categoryName }}
        </el-descriptions-item>
        <el-descriptions-item label="发布者">
          {{ currentItem?.ownerName }}
        </el-descriptions-item>
        <el-descriptions-item label="价格">
          ¥{{ currentItem?.price }}
        </el-descriptions-item>
        <el-descriptions-item label="担保金额">
          ¥{{ currentItem?.deposit || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="成色">
          {{ getConditionText(currentItem?.conditionLevel) }}
        </el-descriptions-item>
        <el-descriptions-item label="位置">
          {{ currentItem?.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览量">
          {{ currentItem?.viewCount }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentItem?.status)">
            {{ getStatusText(currentItem?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布者">
          {{ currentItem?.username || currentItem?.ownerName }}
        </el-descriptions-item>
        <el-descriptions-item label="计费类型">
          {{ currentItem?.billingType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="交易说明">
          {{ currentItem?.borrowConditions || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="交易地点">
          {{ currentItem?.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item
          label="描述"
          :span="2"
        >
          {{ currentItem?.description || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import { getItemList, deleteItem, updateItemStatus } from '@/api/item'
import { getCategoryList } from '@/api/category'
import { formatTime } from '@/utils/time'
import type { Item, Category } from '@/types'

const loading = ref(false)
const detailVisible = ref(false)
const currentItem = ref<Item | null>(null)

const itemList = ref<Item[]>([])
const categoryList = ref<Category[]>([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined,
  pageNo: 1,
  pageSize: 10
})

const conditionMap: Record<string, string> = {
  '0': '全新',
  '1': '九成新',
  '2': '八成新'
}

const statusMap: Record<number, { text: string; type: string }> = {
  1: { text: '在售', type: 'success' },
  2: { text: '已售出', type: 'warning' },
  3: { text: '已下架', type: 'info' }
}

const getStatusType = (status?: number) => {
  return status ? statusMap[status]?.type || 'info' : 'info'
}

const getStatusText = (status?: number) => {
  return status ? statusMap[status]?.text || '未知' : '-' 
}

const getConditionText = (level?: string | number | null) => {
  if (level === null || level === undefined) {
    return '-'
  }
  const key = String(level)
  return conditionMap[key] || key
}

const fetchItemList = async () => {
  loading.value = true
  try {
    const res = await getItemList(queryParams)
    itemList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取物品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategoryList = async () => {
  try {
    categoryList.value = await getCategoryList()
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const handleSearch = () => {
  queryParams.pageNo = 1
  fetchItemList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.categoryId = undefined
  queryParams.status = undefined
  handleSearch()
}

const handleView = (row: Item) => {
  currentItem.value = row
  detailVisible.value = true
}

const handleDelete = (row: Item) => {
  ElMessageBox.confirm(`确定要删除商品"${row.title}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteItem(row.id)
    ElMessage.success('删除成功')
    fetchItemList()
  })
}

const handleOnline = async (row: Item) => {
  ElMessageBox.confirm(`确定要上架商品"${row.title}"吗？`, '提示', {
    type: 'info'
  }).then(async () => {
    try {
      await updateItemStatus(row.id, 1, '管理员上架')
      ElMessage.success('上架成功')
      fetchItemList()
    } catch (error) {
      console.error('上架失败:', error)
    }
  })
}

const handleOffline = async (row: Item) => {
  ElMessageBox.prompt('请输入下架原因', '下架商品', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入下架原因'
  }).then(async ({ value }) => {
    try {
      await updateItemStatus(row.id, 3, value)
      ElMessage.success('下架成功')
      fetchItemList()
    } catch (error) {
      console.error('下架失败:', error)
    }
  })
}

onMounted(() => {
  fetchItemList()
  fetchCategoryList()
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






